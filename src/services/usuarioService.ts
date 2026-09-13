import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import {
  EstadoUsuario,
  RespuestaUsuario,
  RolSelector,
  Usuario,
  UsuarioActualizar,
  UsuarioCrear,
} from "../types/usuario";

const API_URL =
  Platform.OS === "web"
    ? "https://localhost:7228/api"
    : "http://10.0.2.2:5127/api";

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

export async function listarUsuarios(
  estado?: EstadoUsuario
): Promise<Usuario[]> {
  const headers = await obtenerHeaders();

  const parametro = estado
    ? `?estado=${encodeURIComponent(estado)}`
    : "";

  const response = await fetch(
    `${API_URL}/Usuarios/Listar${parametro}`,
    {
      method: "GET",
      headers,
    }
  );

  return procesarRespuesta<Usuario[]>(response);
}

export async function listarRolesActivos(): Promise<
  RolSelector[]
> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Rol/RolesActivos`,
    {
      method: "GET",
      headers,
    }
  );

  return procesarRespuesta<RolSelector[]>(response);
}

export async function crearUsuario(
  datos: UsuarioCrear
): Promise<RespuestaUsuario> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Usuarios/Agregar`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta<RespuestaUsuario>(response);
}

export async function actualizarUsuario(
  id: number,
  datos: UsuarioActualizar
): Promise<RespuestaUsuario> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Usuarios/Modificar/${id}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(datos),
    }
  );

  return procesarRespuesta<RespuestaUsuario>(response);
}

export async function cambiarEstadoUsuario(
  id: number,
  estado: EstadoUsuario
): Promise<{
  message?: string;
  estado: EstadoUsuario;
}> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Usuarios/${id}/estado`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        estado,
      }),
    }
  );

  return procesarRespuesta<{
    message?: string;
    estado: EstadoUsuario;
  }>(response);
}