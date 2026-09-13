import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

import {
  EstadoRol,
  RespuestaRol,
  Rol,
  RolFormulario,
} from "../types/rol";

async function obtenerHeaders() {
  const token = await AsyncStorage.getItem("token");

  return {
    "Content-Type": "application/json",
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
    const mensaje =
      resultado?.message ||
      resultado?.title ||
      (typeof resultado === "string"
        ? resultado
        : "Ocurrió un error al procesar la solicitud.");

    throw new Error(mensaje);
  }

  return resultado as T;
}

export async function listarRoles(): Promise<Rol[]> {
  const headers = await obtenerHeaders();

  const response = await fetch(`${API_URL}/Rol`, {
    method: "GET",
    headers,
  });

  return procesarRespuesta<Rol[]>(response);
}

export async function listarRolesActivos(): Promise<Rol[]> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Rol/RolesActivos`,
    {
      method: "GET",
      headers,
    }
  );

  return procesarRespuesta<Rol[]>(response);
}

export async function crearRol(
  datos: RolFormulario
): Promise<RespuestaRol> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Rol/Agregar`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta<RespuestaRol>(response);
}

export async function actualizarRol(
  id: number,
  datos: RolFormulario
): Promise<RespuestaRol> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Rol/${id}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta<RespuestaRol>(response);
}

export async function cambiarEstadoRol(
  id: number
): Promise<{
  message?: string;
  estado: EstadoRol;
}> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Rol/${id}/estado`,
    {
      method: "PATCH",
      headers,
    }
  );

  return procesarRespuesta<{
    message?: string;
    estado: EstadoRol;
  }>(response);
}