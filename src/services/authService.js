import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

const API_URL =
  Platform.OS === "web"
    ? "https://localhost:7228/api"
    : "http://10.0.2.2:5127/api";

export async function login(email, contrasena) {
  const response = await fetch(`${API_URL}/Account/Login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      contrasena,
    }),
  });

  const resultado = await response.json();

  if (!response.ok) {
    throw new Error(
      resultado.message || "No se pudo iniciar sesión."
    );
  }

  const datos = resultado.data;

  if (!datos?.token) {
    throw new Error("El servidor no devolvió un token válido.");
  }

  await AsyncStorage.setItem("token", datos.token);
  await AsyncStorage.setItem("usuario", JSON.stringify(datos));

  return datos;
}

export async function obtenerUsuario() {
  const usuario = await AsyncStorage.getItem("usuario");

  return usuario ? JSON.parse(usuario) : null;
}

export async function obtenerToken() {
  return await AsyncStorage.getItem("token");
}

export async function estaAutenticado() {
  return Boolean(await obtenerToken());
}

export async function cerrarSesion() {
  await AsyncStorage.multiRemove(["token", "usuario"]);
}