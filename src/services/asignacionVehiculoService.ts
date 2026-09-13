import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";
import {
  AsignacionVehiculo,
  DetalleVehiculoAsignado,
  Estado,
} from "../types/vehiculo";

async function obtenerHeaders() {
  const token = await AsyncStorage.getItem("token");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function leer<T>(response: Response): Promise<T> {
  let data: any = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    throw new Error(
      data?.message ||
        data?.title ||
        "No se pudo procesar la solicitud."
    );
  }

  return data as T;
}

function normalizarAsignacion(
  item: any
): AsignacionVehiculo {
  return {
    id: Number(item?.id ?? item?.Id ?? 0),
    idUsuario: Number(
      item?.idUsuario ??
        item?.IdUsuario ??
        item?.id_usuario ??
        0
    ),
    usuario:
      item?.usuario ??
      item?.Usuario ??
      "",
    correoUsuario:
      item?.correoUsuario ??
      item?.CorreoUsuario ??
      null,
    idVehiculo: Number(
      item?.idVehiculo ??
        item?.IdVehiculo ??
        item?.id_vehiculo ??
        0
    ),
    vehiculo:
      item?.vehiculo ??
      item?.Vehiculo ??
      "",
    placa:
      item?.placa ??
      item?.Placa ??
      null,
    cantidadCarga:
      item?.cantidadCarga ??
      item?.CantidadCarga ??
      "",
    fecha:
      item?.fecha ??
      item?.Fecha ??
      "",
    estado:
      item?.estado ??
      item?.Estado ??
      "Activo",
  };
}

function normalizarDetalleVehiculo(
  item: any
): DetalleVehiculoAsignado {
  const usuarios =
    item?.usuariosAsignados ??
    item?.UsuariosAsignados ??
    [];

  return {
    idVehiculo: Number(
      item?.idVehiculo ??
        item?.IdVehiculo ??
        0
    ),
    marca:
      item?.marca ??
      item?.Marca ??
      "",
    placa:
      item?.placa ??
      item?.Placa ??
      null,
    cantidadCarga:
      item?.cantidadCarga ??
      item?.CantidadCarga ??
      "",
    estadoVehiculo:
      item?.estadoVehiculo ??
      item?.EstadoVehiculo ??
      "Activo",
    cantidadUsuariosAsignados: Number(
      item?.cantidadUsuariosAsignados ??
        item?.CantidadUsuariosAsignados ??
        0
    ),
    usuariosAsignados: Array.isArray(usuarios)
      ? usuarios.map((usuario: any) => ({
          idAsignacion: Number(
            usuario?.idAsignacion ??
              usuario?.IdAsignacion ??
              0
          ),
          idUsuario: Number(
            usuario?.idUsuario ??
              usuario?.IdUsuario ??
              0
          ),
          usuario:
            usuario?.usuario ??
            usuario?.Usuario ??
            "",
          correo:
            usuario?.correo ??
            usuario?.Correo ??
            null,
          fechaAsignacion:
            usuario?.fechaAsignacion ??
            usuario?.FechaAsignacion ??
            "",
          estado:
            usuario?.estado ??
            usuario?.Estado ??
            "Activo",
        }))
      : [],
  };
}

export async function listarAsignaciones(): Promise<
  AsignacionVehiculo[]
> {
  const response = await fetch(
    `${API_URL}/Asignacion_vehiculo/Listar`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado = await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarAsignacion)
    : [];
}

export async function crearAsignacion(datos: {
  idUsuario: number;
  idVehiculo: number;
}) {
  const response = await fetch(
    `${API_URL}/Asignacion_vehiculo/Agregar`,
    {
      method: "POST",
      headers: await obtenerHeaders(),
      body: JSON.stringify(datos),
    }
  );

  return leer<{ message?: string }>(response);
}

export async function editarAsignacion(
  id: number,
  datos: {
    idUsuario: number;
    idVehiculo: number;
  }
) {
  const response = await fetch(
    `${API_URL}/Asignacion_vehiculo/${id}`,
    {
      method: "PUT",
      headers: await obtenerHeaders(),
      body: JSON.stringify(datos),
    }
  );

  return leer<{ message?: string }>(response);
}

export async function cambiarEstadoAsignacion(
  id: number,
  estado: Estado
) {
  const response = await fetch(
    `${API_URL}/Asignacion_vehiculo/${id}/estado`,
    {
      method: "PATCH",
      headers: await obtenerHeaders(),
      body: JSON.stringify({ estado }),
    }
  );

  return leer<{
    message?: string;
    estado?: Estado;
  }>(response);
}

export async function obtenerDetalleVehiculo(
  idVehiculo: number
): Promise<DetalleVehiculoAsignado> {
  const response = await fetch(
    `${API_URL}/Asignacion_vehiculo/Vehiculo/${idVehiculo}`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado = await leer<any>(response);

  return normalizarDetalleVehiculo(resultado);
}

export async function quitarUsuarioVehiculo(
  idAsignacion: number
) {
  const response = await fetch(
    `${API_URL}/Asignacion_vehiculo/${idAsignacion}/QuitarUsuario`,
    {
      method: "PATCH",
      headers: await obtenerHeaders(),
    }
  );

  return leer<{
    message?: string;
    idAsignacion?: number;
    estado?: Estado;
  }>(response);
}