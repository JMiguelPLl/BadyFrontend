import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useColorScheme as useSystemColorScheme } from "react-native";

export type ThemeMode = "light" | "dark" | "system";

export interface ThemeColors {
  isDark: boolean;

  // Marca corporativa
  primary: string;
  primaryLight: string;
  primaryDark: string;
  primaryGlow: string;

  // Fondos y Superficies
  background: string;
  surface: string;
  surfaceElevated: string;
  card: string;
  cardHeader: string;
  sidebarBg: string;
  headerBg: string;
  modalBg: string;
  modalBackdrop: string;

  // Tipografía
  text: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;

  // Bordes y Divisores
  border: string;
  borderLight: string;
  borderFocus: string;

  // Entradas de texto
  inputBg: string;
  inputBorder: string;
  inputPlaceholder: string;

  // Estados semánticos y Badges
  successBg: string;
  successText: string;
  successBorder: string;

  dangerBg: string;
  dangerText: string;
  dangerBorder: string;

  warningBg: string;
  warningText: string;
  warningBorder: string;

  infoBg: string;
  infoText: string;
  infoBorder: string;

  // Navegación
  tabBarBg: string;
  tabBarBorder: string;
  tabBarActive: string;
  tabBarInactive: string;

  // Tablas
  tableHeaderBg: string;
  tableRowBg: string;
  tableRowHover: string;
  tableBorder: string;
}

export const lightColors: ThemeColors = {
  isDark: false,

  primary: "#c8231b",
  primaryLight: "#fff0ef",
  primaryDark: "#9b1913",
  primaryGlow: "rgba(200, 35, 27, 0.15)",

  background: "#f4f5f7",
  surface: "#ffffff",
  surfaceElevated: "#ffffff",
  card: "#ffffff",
  cardHeader: "#fafbfc",
  sidebarBg: "#1a1d21",
  headerBg: "#ffffff",
  modalBg: "#ffffff",
  modalBackdrop: "rgba(0, 0, 0, 0.55)",

  text: "#1f2329",
  textSecondary: "#5e6670",
  textMuted: "#88909b",
  textInverse: "#ffffff",

  border: "#e2e5e9",
  borderLight: "#eceef1",
  borderFocus: "#c8231b",

  inputBg: "#ffffff",
  inputBorder: "#d8dce1",
  inputPlaceholder: "#9aa1aa",

  successBg: "#ecfdf3",
  successText: "#15803d",
  successBorder: "#bbf7d0",

  dangerBg: "#fff0ef",
  dangerText: "#b82018",
  dangerBorder: "#fecaca",

  warningBg: "#fff7ed",
  warningText: "#c2410c",
  warningBorder: "#fed7aa",

  infoBg: "#eff6ff",
  infoText: "#1d4ed8",
  infoBorder: "#bfdbfe",

  tabBarBg: "#ffffff",
  tabBarBorder: "#eeeeee",
  tabBarActive: "#c8231b",
  tabBarInactive: "#98a0aa",

  tableHeaderBg: "#f5f6f8",
  tableRowBg: "#ffffff",
  tableRowHover: "#f8f9fa",
  tableBorder: "#eceef0",
};

export const darkColors: ThemeColors = {
  isDark: true,

  primary: "#e53835",
  primaryLight: "rgba(229, 56, 53, 0.18)",
  primaryDark: "#b71c1c",
  primaryGlow: "rgba(229, 56, 53, 0.28)",

  background: "#0f1115",
  surface: "#171a21",
  surfaceElevated: "#1f232c",
  card: "#171a21",
  cardHeader: "#1f232c",
  sidebarBg: "#0d0f13",
  headerBg: "#171a21",
  modalBg: "#1b1f27",
  modalBackdrop: "rgba(0, 0, 0, 0.75)",

  text: "#f3f4f6",
  textSecondary: "#a1a7b3",
  textMuted: "#6b7280",
  textInverse: "#ffffff",

  border: "#282d38",
  borderLight: "#202530",
  borderFocus: "#e53835",

  inputBg: "#1f232c",
  inputBorder: "#343a46",
  inputPlaceholder: "#6b7280",

  successBg: "rgba(21, 128, 61, 0.22)",
  successText: "#4ade80",
  successBorder: "rgba(74, 222, 128, 0.35)",

  dangerBg: "rgba(184, 32, 24, 0.24)",
  dangerText: "#f87171",
  dangerBorder: "rgba(248, 113, 113, 0.35)",

  warningBg: "rgba(194, 65, 12, 0.24)",
  warningText: "#fb923c",
  warningBorder: "rgba(251, 146, 60, 0.35)",

  infoBg: "rgba(29, 78, 216, 0.24)",
  infoText: "#60a5fa",
  infoBorder: "rgba(96, 165, 250, 0.35)",

  tabBarBg: "#14171e",
  tabBarBorder: "#232833",
  tabBarActive: "#e53835",
  tabBarInactive: "#6b7280",

  tableHeaderBg: "#1e222b",
  tableRowBg: "#171a21",
  tableRowHover: "#202530",
  tableBorder: "#252a35",
};

const STORAGE_KEY = "@app_theme_mode";

interface ThemeContextType {
  themeMode: ThemeMode;
  isDark: boolean;
  colors: ThemeColors;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
  toggleTheme: () => Promise<void>;
}

const ThemeContext = createContext<ThemeContextType>({
  themeMode: "light",
  isDark: false,
  colors: lightColors,
  setThemeMode: async () => {},
  toggleTheme: async () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useSystemColorScheme();
  const [themeMode, setThemeModeState] = useState<ThemeMode>("light");
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    async function cargarPreferencia() {
      try {
        const guardado = await AsyncStorage.getItem(STORAGE_KEY);
        if (
          guardado === "light" ||
          guardado === "dark" ||
          guardado === "system"
        ) {
          setThemeModeState(guardado);
        }
      } catch (e) {
        console.warn("Error cargando preferencia de tema:", e);
      } finally {
        setCargado(true);
      }
    }

    cargarPreferencia();
  }, []);

  const isDark =
    themeMode === "dark" ||
    (themeMode === "system" && systemScheme === "dark");

  const colors = isDark ? darkColors : lightColors;

  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    setThemeModeState(mode);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, mode);
    } catch (e) {
      console.warn("Error guardando preferencia de tema:", e);
    }
  }, []);

  const toggleTheme = useCallback(async () => {
    const nuevoModo: ThemeMode = isDark ? "light" : "dark";
    await setThemeMode(nuevoModo);
  }, [isDark, setThemeMode]);

  return (
    <ThemeContext.Provider
      value={{
        themeMode,
        isDark,
        colors,
        setThemeMode,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeContext() {
  return useContext(ThemeContext);
}
