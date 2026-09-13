import { Ionicons } from "@expo/vector-icons";
import React from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";

interface ThemeToggleProps {
  mostrarTexto?: boolean;
  tamanoIcono?: number;
  estilo?: any;
}

export default function ThemeToggle({
  mostrarTexto = false,
  tamanoIcono = 19,
  estilo,
}: ThemeToggleProps) {
  const { isDark, toggleTheme, colors } = useAppTheme();

  return (
    <Pressable
      onPress={toggleTheme}
      accessibilityRole="button"
      accessibilityLabel={
        isDark ? "Cambiar a modo diurno" : "Cambiar a modo oscuro"
      }
      style={({ pressed }) => [
        styles.boton,
        {
          backgroundColor: isDark ? "#222733" : "#f0f2f5",
          borderColor: isDark ? "#353d4f" : "#d8dce2",
        },
        pressed && styles.presionado,
        estilo,
      ]}
    >
      <Ionicons
        name={isDark ? "sunny" : "moon"}
        size={tamanoIcono}
        color={isDark ? "#f59e0b" : "#4b5563"}
      />
      {mostrarTexto && (
        <Text
          style={[
            styles.texto,
            { color: isDark ? colors.text : colors.textSecondary },
          ]}
        >
          {isDark ? "Modo oscuro" : "Modo claro"}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  boton: {
    minHeight: 38,
    minWidth: 38,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  presionado: {
    opacity: 0.72,
  },
  texto: {
    fontSize: 13,
    fontWeight: "700",
  },
});
