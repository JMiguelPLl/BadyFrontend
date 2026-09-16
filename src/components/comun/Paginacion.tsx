import React from "react";
import { View, Text, Pressable, StyleSheet, Platform } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAppTheme } from "../../hooks/useAppTheme";

interface PaginacionProps {
  paginaActual: number;
  totalPaginas: number;
  totalRegistros: number;
  registrosPorPagina: number;
  onCambiarPagina: (pagina: number) => void;
  onCambiarRegistrosPorPagina?: (limite: number) => void;
  opcionesRegistros?: number[];
}

export default function Paginacion({
  paginaActual,
  totalPaginas,
  totalRegistros,
  registrosPorPagina,
  onCambiarPagina,
  onCambiarRegistrosPorPagina,
  opcionesRegistros = [5, 10, 20, 50],
}: PaginacionProps) {
  const { colors, isDark } = useAppTheme();

  // Solo renderizar en Web como fue solicitado
  if (Platform.OS !== "web") {
    return null;
  }

  if (totalRegistros === 0) {
    return null;
  }

  const inicio = (paginaActual - 1) * registrosPorPagina + 1;
  const fin = Math.min(paginaActual * registrosPorPagina, totalRegistros);

  // Generar lista de números de páginas con puntos suspensivos (...)
  const obtenerNumerosPagina = (): (number | string)[] => {
    if (totalPaginas <= 7) {
      return Array.from({ length: totalPaginas }, (_, i) => i + 1);
    }

    if (paginaActual <= 4) {
      return [1, 2, 3, 4, 5, "...", totalPaginas];
    }

    if (paginaActual >= totalPaginas - 3) {
      return [
        1,
        "...",
        totalPaginas - 4,
        totalPaginas - 3,
        totalPaginas - 2,
        totalPaginas - 1,
        totalPaginas,
      ];
    }

    return [
      1,
      "...",
      paginaActual - 1,
      paginaActual,
      paginaActual + 1,
      "...",
      totalPaginas,
    ];
  };

  const paginas = obtenerNumerosPagina();

  return (
    <View
      style={[
        styles.contenedor,
        isDark && {
          backgroundColor: colors.surfaceElevated,
          borderTopColor: colors.borderLight,
        },
      ]}
    >
      {/* Información de Registros */}
      <View style={styles.infoContenedor}>
        <Text
          style={[
            styles.infoTexto,
            isDark && { color: colors.textSecondary },
          ]}
        >
          Mostrando{" "}
          <Text style={[styles.infoResaltado, isDark && { color: colors.text }]}>
            {inicio} - {fin}
          </Text>{" "}
          de{" "}
          <Text style={[styles.infoResaltado, isDark && { color: colors.text }]}>
            {totalRegistros}
          </Text>{" "}
          registros
        </Text>
      </View>

      {/* Selector de Filas por Página */}
      {onCambiarRegistrosPorPagina && (
        <View style={styles.selectorContenedor}>
          <Text
            style={[
              styles.selectorEtiqueta,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Filas:
          </Text>
          <View style={styles.opcionesFila}>
            {opcionesRegistros.map((opcion) => {
              const activo = registrosPorPagina === opcion;
              return (
                <Pressable
                  key={opcion}
                  onPress={() => onCambiarRegistrosPorPagina(opcion)}
                  style={[
                    styles.botonOpcion,
                    isDark && {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                    activo && [
                      styles.botonOpcionActiva,
                      {
                        backgroundColor: colors.primary,
                        borderColor: colors.primary,
                      },
                    ],
                  ]}
                >
                  <Text
                    style={[
                      styles.botonOpcionTexto,
                      isDark && { color: colors.textSecondary },
                      activo && styles.botonOpcionTextoActivo,
                    ]}
                  >
                    {opcion}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </View>
      )}

      {/* Controles de Navegación de Páginas */}
      <View style={styles.botonesContenedor}>
        {/* Ir a la primera página */}
        <Pressable
          onPress={() => onCambiarPagina(1)}
          disabled={paginaActual <= 1}
          style={[
            styles.botonNav,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            paginaActual <= 1 && styles.botonDeshabilitado,
          ]}
          accessibilityLabel="Primera página"
        >
          <Ionicons
            name="play-back-outline"
            size={14}
            color={
              paginaActual <= 1
                ? colors.textMuted
                : isDark
                ? colors.text
                : "#1f2329"
            }
          />
        </Pressable>

        {/* Página anterior */}
        <Pressable
          onPress={() => onCambiarPagina(paginaActual - 1)}
          disabled={paginaActual <= 1}
          style={[
            styles.botonNav,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            paginaActual <= 1 && styles.botonDeshabilitado,
          ]}
          accessibilityLabel="Página anterior"
        >
          <Ionicons
            name="chevron-back-outline"
            size={16}
            color={
              paginaActual <= 1
                ? colors.textMuted
                : isDark
                ? colors.text
                : "#1f2329"
            }
          />
        </Pressable>

        {/* Botones numéricos */}
        {paginas.map((item, index) => {
          if (item === "...") {
            return (
              <View key={`dots-${index}`} style={styles.puntos}>
                <Text
                  style={[
                    styles.puntosTexto,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  ...
                </Text>
              </View>
            );
          }

          const numPagina = Number(item);
          const activa = numPagina === paginaActual;

          return (
            <Pressable
              key={`page-${numPagina}`}
              onPress={() => onCambiarPagina(numPagina)}
              style={[
                styles.botonNumero,
                isDark && {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
                activa && [
                  styles.botonNumeroActivo,
                  {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ],
              ]}
            >
              <Text
                style={[
                  styles.botonNumeroTexto,
                  isDark && { color: colors.text },
                  activa && styles.botonNumeroTextoActivo,
                ]}
              >
                {numPagina}
              </Text>
            </Pressable>
          );
        })}

        {/* Página siguiente */}
        <Pressable
          onPress={() => onCambiarPagina(paginaActual + 1)}
          disabled={paginaActual >= totalPaginas}
          style={[
            styles.botonNav,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            paginaActual >= totalPaginas && styles.botonDeshabilitado,
          ]}
          accessibilityLabel="Página siguiente"
        >
          <Ionicons
            name="chevron-forward-outline"
            size={16}
            color={
              paginaActual >= totalPaginas
                ? colors.textMuted
                : isDark
                ? colors.text
                : "#1f2329"
            }
          />
        </Pressable>

        {/* Ir a la última página */}
        <Pressable
          onPress={() => onCambiarPagina(totalPaginas)}
          disabled={paginaActual >= totalPaginas}
          style={[
            styles.botonNav,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            paginaActual >= totalPaginas && styles.botonDeshabilitado,
          ]}
          accessibilityLabel="Última página"
        >
          <Ionicons
            name="play-forward-outline"
            size={14}
            color={
              paginaActual >= totalPaginas
                ? colors.textMuted
                : isDark
                ? colors.text
                : "#1f2329"
            }
          />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  contenedor: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    backgroundColor: "#ffffff",
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  infoContenedor: {
    minWidth: 180,
  },
  infoTexto: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  infoResaltado: {
    fontWeight: "700",
    color: "#111827",
  },
  selectorContenedor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  selectorEtiqueta: {
    fontSize: 13,
    color: "#6b7280",
    fontWeight: "500",
  },
  opcionesFila: {
    flexDirection: "row",
    gap: 4,
  },
  botonOpcion: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
  },
  botonOpcionActiva: {
    borderColor: "#c8231b",
  },
  botonOpcionTexto: {
    fontSize: 12,
    fontWeight: "600",
    color: "#4b5563",
  },
  botonOpcionTextoActivo: {
    color: "#ffffff",
  },
  botonesContenedor: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  botonNav: {
    width: 32,
    height: 32,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  botonNumero: {
    minWidth: 32,
    height: 32,
    paddingHorizontal: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  botonNumeroActivo: {
    backgroundColor: "#c8231b",
    borderColor: "#c8231b",
  },
  botonNumeroTexto: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
  },
  botonNumeroTextoActivo: {
    color: "#ffffff",
    fontWeight: "800",
  },
  botonDeshabilitado: {
    opacity: 0.4,
  },
  puntos: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  puntosTexto: {
    fontSize: 14,
    color: "#9ca3af",
    fontWeight: "bold",
  },
});
