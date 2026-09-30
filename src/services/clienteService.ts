import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

import {
    Cliente,
    ClienteFormulario,
} from "../types/cliente";

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

function normalizarCliente(item: any): Cliente {
  const tieneAccesoApp =
    typeof item?.tieneAccesoApp === "boolean"
      ? item.tieneAccesoApp
      : typeof item?.TieneAccesoApp === "boolean"
      ? item.TieneAccesoApp
      : Boolean(item?.email && String(item.email).trim().length > 0);

  return {
    id: Number(item?.id ?? item?.Id ?? 0),
    nombre: item?.nombre ?? item?.Nombre ?? "",
    numero: item?.numero ?? item?.Numero ?? "",
    email: item?.email ?? item?.Email ?? null,
    estado: (item?.estado ?? item?.Estado ?? "Activo") as "Activo" | "Inactivo",
    tieneAccesoApp,
  };
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

  const data = await procesarRespuesta<any[]>(response);
  return Array.isArray(data) ? data.map(normalizarCliente) : [];
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

  const data = await procesarRespuesta<any[]>(response);
  return Array.isArray(data) ? data.map(normalizarCliente) : [];
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

  const data = await procesarRespuesta<any[]>(response);
  return Array.isArray(data) ? data.map(normalizarCliente) : [];
}

export async function crearCliente(
  datos: ClienteFormulario
): Promise<RespuestaCliente> {
  const headers = await obtenerHeaders();

  const body: Record<string, any> = {
    nombre: datos.nombre.trim(),
    numero: datos.numero.trim(),
  };

  if (datos.tieneAccesoApp) {
    if (datos.email && datos.email.trim()) {
      body.email = datos.email.trim();
    }
    if (datos.contrasena && datos.contrasena.trim()) {
      body.contrasena = datos.contrasena.trim();
    }
  }

  const response = await fetch(
    `${API_URL}/Cliente/Registrar`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
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

  const body: Record<string, any> = {
    nombre: datos.nombre.trim(),
    numero: datos.numero.trim(),
  };

  if (datos.email && datos.email.trim()) {
    body.email = datos.email.trim();
  }

  if (datos.contrasena && datos.contrasena.trim()) {
    body.contrasena = datos.contrasena.trim();
  }

  const response = await fetch(
    `${API_URL}/Cliente/${id}`,
    {
      method: "PUT",
      headers,
      body: JSON.stringify(body),
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