import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";
import {
  NotificacionAdmin,
  notificacionesAdminService,
} from "../../services/notificacionesAdminService";

export default function NotificacionesAdminModal() {
  const router = useRouter();
  const { isDark, colors } = useAppTheme();
  const [cola, setCola] = useState<NotificacionAdmin[]>([]);
  const [actual, setActual] = useState<NotificacionAdmin | null>(null);

  useEffect(() => {
    // Iniciar monitoreo en segundo plano
    notificacionesAdminService.iniciarMonitoreo();

    const cancelar = notificacionesAdminService.suscribir((notif) => {
      reproducirSonidoAlerta();
      setCola((prev) => [...prev, notif]);
    });

    return () => {
      cancelar();
      notificacionesAdminService.detenerMonitoreo();
    };
  }, []);

  useEffect(() => {
    if (!actual && cola.length > 0) {
      setActual(cola[0]);
      setCola((prev) => prev.slice(1));
    }
  }, [cola, actual]);

  const reproducirSonidoAlerta = () => {
    if (Platform.OS === "web" && typeof window !== "undefined") {
      try {
        const AudioContext =
          window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = "sine";
          osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

          gain.gain.setValueAtTime(0.15, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(
            0.001,
            ctx.currentTime + 0.35
          );

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.36);
        }
      } catch (e) {
        // Sonido no permitido por el navegador antes de interacción
      }
    }
  };

  const cerrarModal = () => {
    setActual(null);
  };

  const irADetalle = () => {
    if (actual?.ruta) {
      router.push(actual.ruta as any);
    }
    cerrarModal();
  };

  if (!actual) return null;

  const obtenerConfiguracionTipo = () => {
    switch (actual.tipo) {
      case "pedido":
        return {
          icono: "cart" as const,
          colorIcono: isDark ? "#60a5fa" : "#1d4ed8",
          fondoIcono: isDark ? "rgba(29, 78, 216, 0.22)" : "#eff6ff",
          textoBoton: "Ver asignación de pedidos",
          colorBoton: isDark ? "#2563eb" : "#1d4ed8",
          etiqueta: "NUEVO PEDIDO",
        };
      case "pago":
        return {
          icono: "cash" as const,
          colorIcono: isDark ? "#4ade80" : "#15803d",
          fondoIcono: isDark ? "rgba(21, 128, 61, 0.22)" : "#ecfdf3",
          textoBoton: "Ver registro de pagos",
          colorBoton: isDark ? "#16a34a" : "#15803d",
          etiqueta: "NUEVO COBRO REGISTRADO",
        };
      case "caja":
        return {
          icono: "file-tray-full" as const,
          colorIcono: isDark ? "#fb923c" : "#c2410c",
          fondoIcono: isDark ? "rgba(194, 65, 12, 0.22)" : "#fff7ed",
          textoBoton: "Ver cierres de caja",
          colorBoton: isDark ? "#ea580c" : "#c2410c",
          etiqueta: "MOVIMIENTO DE CAJA",
        };
      default:
        return {
          icono: "notifications" as const,
          colorIcono: isDark ? "#f87171" : "#b82018",
          fondoIcono: isDark ? "rgba(184, 32, 24, 0.22)" : "#fff0ef",
          textoBoton: "Ver detalles",
          colorBoton: isDark ? "#dc2626" : "#b82018",
          etiqueta: "NOTIFICACIÓN",
        };
    }
  };

  const config = obtenerConfiguracionTipo();

  return (
    <Modal
      visible={Boolean(actual)}
      transparent
      animationType="fade"
      onRequestClose={cerrarModal}
    >
      <View
        style={[
          styles.fondo,
          isDark && { backgroundColor: colors.modalBackdrop },
        ]}
      >
        <Pressable style={styles.fondoPresionable} onPress={cerrarModal} />

        <View
          style={[
            styles.modalCard,
            isDark && {
              backgroundColor: colors.modalBg,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          {/* Cabecera y Badge */}
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.badgeTipo,
                { backgroundColor: config.fondoIcono },
              ]}
            >
              <Text
                style={[
                  styles.badgeTipoTexto,
                  { color: config.colorIcono },
                ]}
              >
                {config.etiqueta}
              </Text>
            </View>

            <Pressable
              style={[
                styles.botonCerrarX,
                isDark && { backgroundColor: colors.surfaceElevated },
              ]}
              onPress={cerrarModal}
            >
              <Ionicons
                name="close"
                size={18}
                color={isDark ? colors.textSecondary : "#727a84"}
              />
            </Pressable>
          </View>

          {/* Icono central y Contenido */}
          <View style={styles.cuerpo}>
            <View
              style={[
                styles.iconoContenedor,
                { backgroundColor: config.fondoIcono },
              ]}
            >
              <Ionicons
                name={config.icono}
                size={36}
                color={config.colorIcono}
              />
            </View>

            <Text
              style={[
                styles.titulo,
                isDark && { color: colors.text },
              ]}
            >
              {actual.titulo}
            </Text>

            <Text
              style={[
                styles.descripcion,
                isDark && { color: colors.textSecondary },
              ]}
            >
              {actual.descripcion}
            </Text>

            {!!actual.detalle && (
              <View
                style={[
                  styles.detalleCard,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.detalleTexto,
                    isDark && { color: colors.text },
                  ]}
                >
                  {actual.detalle}
                </Text>
              </View>
            )}
          </View>

          {/* Botones de acción */}
          <View style={styles.acciones}>
            <Pressable
              style={[
                styles.botonCancelar,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
              onPress={cerrarModal}
            >
              <Text
                style={[
                  styles.botonCancelarTexto,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Cerrar
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.botonAccion,
                { backgroundColor: config.colorBoton },
              ]}
              onPress={irADetalle}
            >
              <Text style={styles.botonAccionTexto}>{config.textoBoton}</Text>
              <Ionicons name="arrow-forward" size={16} color="#ffffff" />
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    zIndex: 9999,
  },
  fondoPresionable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  modalCard: {
    width: "100%",
    maxWidth: 480,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 20,
    elevation: 15,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  badgeTipo: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
  },
  badgeTipoTexto: {
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.5,
  },
  botonCerrarX: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f2f4f7",
    alignItems: "center",
    justifyContent: "center",
  },
  cuerpo: {
    alignItems: "center",
    paddingVertical: 8,
  },
  iconoContenedor: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1a1e24",
    textAlign: "center",
    marginBottom: 8,
  },
  descripcion: {
    fontSize: 14,
    color: "#5f6773",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 14,
  },
  detalleCard: {
    width: "100%",
    backgroundColor: "#f7f9fa",
    borderWidth: 1,
    borderColor: "#e9ebed",
    borderRadius: 14,
    padding: 12,
    marginTop: 4,
    alignItems: "center",
  },
  detalleTexto: {
    fontSize: 13,
    fontWeight: "800",
    color: "#28303a",
  },
  acciones: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 10,
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#f0f2f4",
  },
  botonCancelar: {
    paddingHorizontal: 16,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d8dce2",
    backgroundColor: "#ffffff",
  },
  botonCancelarTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#535b67",
  },
  botonAccion: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 12,
  },
  botonAccionTexto: {
    fontSize: 13,
    fontWeight: "800",
    color: "#ffffff",
  },
});
