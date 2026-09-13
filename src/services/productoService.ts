import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import {
  Producto,
  ProductoGuardar,
  RespuestaProducto,
} from "../types/producto";

const API_BASE =
  Platform.OS === "web"
    ? "https://localhost:7228"
    : "http://10.0.2.2:5127";

const API_URL = `${API_BASE}/api`;

export function resolverUrlImagen(
  imagenUrl?: string | null,
  imagen?: string | null
): string | null {
  if (imagenUrl && imagenUrl.trim()) {
    let url = imagenUrl.trim();

    if (Platform.OS !== "web") {
      url = url.replace(
        /https?:\/\/(localhost|0\.0\.0\.0|127\.0\.0\.1)(:\d+)?/i,
        "http://10.0.2.2:5127"
      );
    } else {
      url = url.replace(
        /https?:\/\/(0\.0\.0\.0|10\.0\.2\.2)(:\d+)?/i,
        "https://localhost:7228"
      );
    }

    return url;
  }

  if (imagen && imagen.trim()) {
    return `${API_BASE}/imagenes/${imagen.trim()}`;
  }

  return null;
}

async function obtenerHeaders(esMultipart = false) {
  const token = await AsyncStorage.getItem("token");

  return {
    Accept: "application/json",
    ...(esMultipart ? {} : { "Content-Type": "application/json" }),
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
  };
}

async function procesarRespuesta<T>(
  response: Response
): Promise<T> {
  let resultado: any = null;

  try {
    resultado = await response.json();
  } catch {
    resultado = null;
  }

  if (!response.ok) {
    let mensaje =
      resultado?.message ||
      (typeof resultado === "string" ? resultado : null);

    if (!mensaje && resultado?.errors && typeof resultado.errors === "object") {
      const errorList: string[] = [];
      for (const key of Object.keys(resultado.errors)) {
        const errs = resultado.errors[key];
        if (Array.isArray(errs)) {
          errorList.push(...errs);
        } else if (typeof errs === "string") {
          errorList.push(errs);
        }
      }
      if (errorList.length > 0) {
        mensaje = errorList.join(". ");
      }
    }

    if (!mensaje) {
      mensaje =
        resultado?.title ||
        "Ocurrió un error al procesar la solicitud.";
    }

    throw new Error(mensaje);
  }

  return resultado as T;
}

function normalizarProducto(item: any): Producto {
  const imagen = item?.imagen ?? item?.Imagen ?? null;
  const rawUrl = item?.imagenUrl ?? item?.ImagenUrl ?? null;
  const imagenUrl = resolverUrlImagen(rawUrl, imagen);

  return {
    id: Number(item?.id ?? item?.Id ?? 0),
    nombre: item?.nombre ?? item?.Nombre ?? "",
    descripcion: item?.descripcion ?? item?.Descripcion ?? "",
    stock: Number(item?.stock ?? item?.Stock ?? 0),
    precio: Number(item?.precio ?? item?.Precio ?? 0),
    estado: item?.estado ?? item?.Estado ?? "Activo",
    imagen: imagen,
    imagenUrl: imagenUrl,
  };
}

export async function listarProductos(): Promise<Producto[]> {
  const headers = await obtenerHeaders();

  const response = await fetch(`${API_URL}/Producto/Listar`, {
    method: "GET",
    headers,
  });

  const datos = await procesarRespuesta<any[]>(response);
  return Array.isArray(datos) ? datos.map(normalizarProducto) : [];
}

export async function obtenerProductoPorId(id: number): Promise<Producto> {
  const headers = await obtenerHeaders();

  const response = await fetch(`${API_URL}/Producto/${id}`, {
    method: "GET",
    headers,
  });

  const datos = await procesarRespuesta<any>(response);
  return normalizarProducto(datos);
}

export async function crearProducto(
  datos: ProductoGuardar,
  archivoImagen?: any
): Promise<RespuestaProducto> {
  const token = await AsyncStorage.getItem("token");

  const formData = new FormData();
  formData.append("nombre", datos.nombre);
  formData.append("descripcion", datos.descripcion);
  formData.append("stock", String(datos.stock));
  formData.append("precio", String(datos.precio));

  if (archivoImagen) {
    formData.append("imagen", archivoImagen);
    formData.append("archivo", archivoImagen);
  }

  const response = await fetch(`${API_URL}/Producto`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  return procesarRespuesta<RespuestaProducto>(response);
}

export async function actualizarProducto(
  id: number,
  datos: ProductoGuardar,
  archivoImagen?: any,
  eliminarImagen = false
): Promise<RespuestaProducto> {
  const token = await AsyncStorage.getItem("token");
  const debeEliminar = Boolean(eliminarImagen || datos.eliminarImagen);

  if (debeEliminar && !archivoImagen) {
    try {
      await fetch(`${API_URL}/Producto/${id}/imagen`, {
        method: "DELETE",
        headers: await obtenerHeaders(),
      });
    } catch {}
  }

  const formData = new FormData();
  formData.append("nombre", datos.nombre);
  formData.append("descripcion", datos.descripcion);
  formData.append("stock", String(datos.stock));
  formData.append("precio", String(datos.precio));
  formData.append("eliminarImagen", String(debeEliminar));

  if (archivoImagen) {
    formData.append("imagen", archivoImagen);
    formData.append("archivo", archivoImagen);
  }

  const response = await fetch(`${API_URL}/Producto/${id}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: formData,
  });

  return procesarRespuesta<RespuestaProducto>(response);
}

export async function cambiarEstadoProducto(
  id: number
): Promise<RespuestaProducto> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Producto/${id}/estado`,
    {
      method: "PATCH",
      headers,
    }
  );

  return procesarRespuesta<RespuestaProducto>(response);
}

export async function subirImagenProducto(
  id: number,
  archivo: any
): Promise<RespuestaProducto> {
  const headers = await obtenerHeaders(true);
  const formData = new FormData();
  formData.append("archivo", archivo);
  formData.append("imagen", archivo);

  const response = await fetch(`${API_URL}/Producto/${id}/imagen`, {
    method: "POST",
    headers,
    body: formData,
  });

  return procesarRespuesta<RespuestaProducto>(response);
}

export async function eliminarImagenProducto(
  id: number
): Promise<RespuestaProducto> {
  const headers = await obtenerHeaders();

  const response = await fetch(`${API_URL}/Producto/${id}/imagen`, {
    method: "DELETE",
    headers,
  });

  return procesarRespuesta<RespuestaProducto>(response);
}