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
  NotificacionPedidoAsignado,
  notificacionesDistribuidorService,
} from "../../services/notificacionesDistribuidorService";
import { BLANCO, ROJO, ROJO_CLARO } from "../../styles/distribuidorStyles";

export default function NotificacionesDistribuidorModal() {
  const router = useRouter();
  const { isDark, colors } = useAppTheme();
  const [cola, setCola] = useState<NotificacionPedidoAsignado[]>([]);
  const [actual, setActual] = useState<NotificacionPedidoAsignado | null>(null);

  useEffect(() => {
    notificacionesDistribuidorService.iniciarMonitoreo();

    const cancelar = notificacionesDistribuidorService.suscribir((notif) => {
      reproducirSonidoAlerta();
      setCola((prev) => [...prev, notif]);
    });

    return () => {
      cancelar();
      notificacionesDistribuidorService.detenerMonitoreo();
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
          osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
          osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12); // A5

          gain.gain.setValueAtTime(0.25, ctx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start();
          osc.stop(ctx.currentTime + 0.4);
        }
      } catch {}
    }
  };

  const cerrarModal = () => {
    setActual(null);
  };

  const irAPedido = () => {
    if (!actual) return;
    const ruta = actual.ruta;
    cerrarModal();
    router.push(ruta as any);
  };

  if (!actual) return null;

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
          {/* Cabecera */}
          <View style={styles.cardHeader}>
            <View
              style={[
                styles.badgeTipo,
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Text
                style={[
                  styles.badgeTipoTexto,
                  isDark && { color: colors.primary },
                ]}
              >
                NUEVO PEDIDO ASIGNADO
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
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Ionicons name="cube" size={38} color={colors.primary} />
            </View>

            <Text
              style={[
                styles.titulo,
                isDark && { color: colors.text },
              ]}
            >
              ¡Tienes un nuevo pedido asignado!
            </Text>

            <Text
              style={[
                styles.descripcion,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Se te ha asignado el{" "}
              <Text
                style={{
                  fontWeight: "900",
                  color: isDark ? colors.text : "#1f2329",
                }}
              >
                Pedido #{actual.idPedido}
              </Text>{" "}
              para entrega a{" "}
              <Text
                style={{
                  fontWeight: "800",
                  color: isDark ? colors.text : "#1f2329",
                }}
              >
                {actual.cliente}
              </Text>
              .
            </Text>

            <View
              style={[
                styles.detalleCard,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.detalleFila}>
                <Ionicons
                  name="storefront-outline"
                  size={15}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.detalleTexto,
                    isDark && { color: colors.text },
                  ]}
                >
                  Sucursal: {actual.sucursal}
                </Text>
              </View>
              <View style={styles.detalleFila}>
                <Ionicons
                  name="cash-outline"
                  size={15}
                  color={colors.primary}
                />
                <Text
                  style={[
                    styles.detalleTexto,
                    isDark && { color: colors.text },
                  ]}
                >
                  Total: Bs {Number(actual.total ?? 0).toFixed(2)}
                </Text>
              </View>
            </View>
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
                Entendido
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.botonAccion,
                { backgroundColor: colors.primary },
              ]}
              onPress={irAPedido}
            >
              <Text style={styles.botonAccionTexto}>Ver pedido asignado</Text>
              <Ionicons name="arrow-forward" size={16} color={BLANCO} />
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
    backgroundColor: "rgba(0, 0, 0, 0.58)",
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
    maxWidth: 460,
    backgroundColor: BLANCO,
    borderRadius: 24,
    padding: 22,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.22,
    shadowRadius: 20,
    elevation: 12,
    zIndex: 10000,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  badgeTipo: {
    backgroundColor: ROJO_CLARO,
    paddingHorizontal: 11,
    paddingVertical: 5,
    borderRadius: 10,
  },
  badgeTipoTexto: {
    color: ROJO,
    fontSize: 11,
    fontWeight: "900",
    letterSpacing: 0.4,
  },
  botonCerrarX: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f4f5f7",
    alignItems: "center",
    justifyContent: "center",
  },
  cuerpo: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  iconoContenedor: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: ROJO_CLARO,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  titulo: {
    fontSize: 20,
    fontWeight: "900",
    color: "#1f2329",
    textAlign: "center",
    letterSpacing: -0.3,
  },
  descripcion: {
    fontSize: 14,
    color: "#555d66",
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
    paddingHorizontal: 6,
  },
  detalleCard: {
    backgroundColor: "#f8f9fb",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginTop: 14,
    borderWidth: 1,
    borderColor: "#eef0f3",
    width: "100%",
    gap: 6,
  },
  detalleFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  detalleTexto: {
    fontSize: 13,
    color: "#343940",
    fontWeight: "700",
  },
  acciones: {
    flexDirection: "row",
    gap: 10,
    marginTop: 4,
  },
  botonCancelar: {
    flex: 1,
    minHeight: 46,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#dfe3e8",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: BLANCO,
  },
  botonCancelarTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#606770",
  },
  botonAccion: {
    flex: 2,
    minHeight: 46,
    borderRadius: 14,
    backgroundColor: ROJO,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  botonAccionTexto: {
    fontSize: 13,
    fontWeight: "800",
    color: BLANCO,
  },
});
