import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

export type Sucursal = {
  id: number;
  idCliente: number;
  cliente: string;
  nombre: string;
  descripcion: string;
  ubicacion: string;
  estado: string;
};

export type SucursalFormulario = {
  idCliente?: number;
  nombre: string;
  descripcion: string;
  ubicacion: string;
};

async function obtenerCabeceras() {
  const token = await AsyncStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    Accept: "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function leerRespuesta<T = any>(response: Response): Promise<T> {
  const texto = await response.text();

  let resultado: any = {};

  if (texto) {
    try {
      resultado = JSON.parse(texto);
    } catch {
      resultado = { message: texto };
    }
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
    }
    if (response.status === 403) {
      throw new Error("No tienes permisos para realizar esta acción.");
    }
    throw new Error(
      resultado?.message ||
        resultado?.title ||
        (typeof resultado === "string" ? resultado : "Ocurrió un error al procesar la solicitud.")
    );
  }

  return resultado as T;
}

function normalizarSucursal(item: any): Sucursal {
  return {
    id: Number(item?.id ?? item?.Id ?? item?.id_sucursal ?? 0),
    idCliente: Number(
      item?.idCliente ?? item?.IdCliente ?? item?.id_cliente ?? item?.Id_cliente ?? 0
    ),
    cliente:
      item?.cliente ??
      item?.Cliente ??
      item?.nombreCliente ??
      item?.NombreCliente ??
      "",
    nombre: item?.nombre ?? item?.Nombre ?? item?.nombreTienda ?? "",
    descripcion: item?.descripcion ?? item?.Descripcion ?? "",
    ubicacion: item?.ubicacion ?? item?.Ubicacion ?? "",
    estado: item?.estado ?? item?.Estado ?? "Activo",
  };
}

export async function listarTodasSucursales(): Promise<Sucursal[]> {
  const response = await fetch(`${API_URL}/Sucursal/Listar`, {
    method: "GET",
    headers: await obtenerCabeceras(),
  });

  const data = await leerRespuesta<any[]>(response);

  return Array.isArray(data) ? data.map(normalizarSucursal) : [];
}

export async function obtenerSucursalPorId(
  id: number
): Promise<Sucursal> {
  const response = await fetch(`${API_URL}/Sucursal/${id}`, {
    method: "GET",
    headers: await obtenerCabeceras(),
  });

  const data = await leerRespuesta<any>(response);

  return normalizarSucursal(data);
}

export async function listarSucursalesCliente(
  idCliente: number
): Promise<Sucursal[]> {
  const response = await fetch(
    `${API_URL}/Sucursal/Cliente/${idCliente}`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const data = await leerRespuesta<any[]>(response);

  return Array.isArray(data) ? data.map(normalizarSucursal) : [];
}

export async function agregarSucursal(
  idCliente: number,
  datos: SucursalFormulario
) {
  const response = await fetch(`${API_URL}/Sucursal/Agregar`, {
    method: "POST",
    headers: await obtenerCabeceras(),
    body: JSON.stringify({
      idCliente,
      nombre: datos.nombre.trim(),
      descripcion: datos.descripcion.trim(),
      ubicacion: datos.ubicacion.trim(),
    }),
  });

  return await leerRespuesta(response);
}

export async function modificarSucursal(
  idSucursal: number,
  idCliente: number,
  datos: SucursalFormulario
) {
  const response = await fetch(
    `${API_URL}/Sucursal/Modificar/${idSucursal}`,
    {
      method: "PUT",
      headers: await obtenerCabeceras(),
      body: JSON.stringify({
        idCliente,
        nombre: datos.nombre.trim(),
        descripcion: datos.descripcion.trim(),
        ubicacion: datos.ubicacion.trim(),
      }),
    }
  );

  return await leerRespuesta(response);
}

export async function cambiarEstadoSucursal(
  idSucursal: number,
  estado?: string
) {
  const cabeceras = await obtenerCabeceras();
  try {
    const response = await fetch(
      `${API_URL}/Sucursal/${idSucursal}/estado`,
      {
        method: "PATCH",
        headers: cabeceras,
        ...(estado ? { body: JSON.stringify({ estado }) } : {}),
      }
    );

    if (response.ok || (response.status !== 404 && response.status !== 405)) {
      return await leerRespuesta(response);
    }
  } catch {
    // Fallback a PUT si PATCH falla
  }

  const responsePut = await fetch(
    `${API_URL}/Sucursal/${idSucursal}/estado`,
    {
      method: "PUT",
      headers: cabeceras,
      ...(estado ? { body: JSON.stringify({ estado }) } : {}),
    }
  );

  return await leerRespuesta(responsePut);
}