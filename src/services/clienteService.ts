import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import {
    Cliente,
    ClienteFormulario,
} from "../types/cliente";

const API_URL =
  Platform.OS === "web"
    ? "https://localhost:7228/api"
    : "http://10.0.2.2:5127/api";

type RespuestaCliente = {
  message?: string;
  cliente?: Cliente;
};

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
    throw new Error(
      resultado?.message ||
        "Ocurrió un error al procesar la solicitud."
    );
  }

  return resultado as T;
}

export async function listarClientes(): Promise<Cliente[]> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Cliente/Listar`,
    {
      method: "GET",
      headers,
    }
  );

  return await procesarRespuesta<Cliente[]>(response);
}
export async function listarClientesActivos(): Promise<Cliente[]> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Cliente/Activos`,
    {
      method: "GET",
      headers,
    }
  );

  return await procesarRespuesta<Cliente[]>(response);
}

export async function listarClientesInactivos(): Promise<Cliente[]> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Cliente/Inactivos`,
    {
      method: "GET",
      headers,
    }
  );

  return await procesarRespuesta<Cliente[]>(response);
}
export async function crearCliente(
  datos: ClienteFormulario
): Promise<RespuestaCliente> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Cliente/Registrar`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(datos),
    }
  );

  return await procesarRespuesta<RespuestaCliente>(
    response
  );
}

export async function actualizarCliente(
  id: number,
  datos: ClienteFormulario
): Promise<RespuestaCliente> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Cliente/${id}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(datos),
    }
  );

  return await procesarRespuesta<RespuestaCliente>(
    response
  );
}

export async function cambiarEstadoCliente(
  id: number,
  estado: "Activo" | "Inactivo"
): Promise<{ message?: string; estado: string }> {
  const headers = await obtenerHeaders();

  const response = await fetch(
    `${API_URL}/Cliente/${id}/estado`,
    {
      method: "PATCH",
      headers,
      body: JSON.stringify({
        estado,
      }),
    }
  );

  return await procesarRespuesta<{
    message?: string;
    estado: string;
  }>(response);
}