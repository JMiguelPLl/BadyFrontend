import { Platform } from "react-native";

/**
 * URL base del backend desplegado en Render.
 */
export const API_BASE =
  process.env.EXPO_PUBLIC_API_BASE || "https://badyback.onrender.com";

/**
 * Endpoint raíz para todas las llamadas API del sistema.
 */
export const API_URL = `${API_BASE.replace(/\/+$/, "")}/api`;
