import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import { Estado, Vehiculo } from "../types/vehiculo";

const API_URL =
  Platform.OS === "web"
    ? "https://localhost:7228/api"
    : "http://10.0.2.2:5127/api";

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

function normalizar(item: any): Vehiculo {
  return {
    id: Number(item?.id ?? item?.Id ?? 0),
    marca: item?.marca ?? item?.Marca ?? "",
    placa: item?.placa ?? item?.Placa ?? null,
    cantidadCarga:
      item?.cantidadCarga ??
      item?.CantidadCarga ??
      item?.cantidad_Carga ??
      item?.Cantidad_Carga ??
      "",
    estado: item?.estado ?? item?.Estado ?? "Activo",
  };
}

export async function listarVehiculos(): Promise<Vehiculo[]> {
  const response = await fetch(
    `${API_URL}/Vehiculo/Listar`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado = await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizar)
    : [];
}

export async function listarVehiculosActivos(): Promise<Vehiculo[]> {
  const response = await fetch(
    `${API_URL}/Vehiculo/Activos`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado = await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizar)
    : [];
}

export async function crearVehiculo(datos: {
  marca: string;
  placa?: string | null;
  cantidadCarga: string;
}) {
  const response = await fetch(
    `${API_URL}/Vehiculo/Agregar`,
    {
      method: "POST",
      headers: await obtenerHeaders(),
      body: JSON.stringify(datos),
    }
  );

  return leer<{ message?: string }>(response);
}

export async function editarVehiculo(
  id: number,
  datos: {
    marca: string;
    placa?: string | null;
    cantidadCarga: string;
  }
) {
  const response = await fetch(
    `${API_URL}/Vehiculo/${id}`,
    {
      method: "PUT",
      headers: await obtenerHeaders(),
      body: JSON.stringify(datos),
    }
  );

  return leer<{ message?: string }>(response);
}

export async function cambiarEstadoVehiculo(
  id: number,
  estado: Estado
) {
  const response = await fetch(
    `${API_URL}/Vehiculo/${id}/estado`,
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