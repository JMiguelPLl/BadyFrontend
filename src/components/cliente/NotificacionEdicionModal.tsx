import { Ionicons } from "@expo/vector-icons";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";
import { styles } from "../../styles/cliente/notificacionEdicion.styles";
import { Pedido } from "../../types/pedido";

type Props = {
  visible: boolean;
  pedido: Pedido | null;
  onEntendido: () => void | Promise<void>;
  onVerDetalle: () => void | Promise<void>;
  onCerrar: () => void;
};

export default function NotificacionEdicionModal({
  visible,
  pedido,
  onEntendido,
  onVerDetalle,
  onCerrar,
}: Props) {
  const { isDark, colors } = useAppTheme();

  if (!pedido) {
    return null;
  }

  const cantidadTotal = (pedido.detalles || []).reduce(
    (total, detalle) => total + Number(detalle.cantidad || 0),
    0
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onCerrar}
    >
      <View
        style={[
          styles.overlay,
          isDark && { backgroundColor: colors.modalBackdrop },
        ]}
      >
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
          <ScrollView showsVerticalScrollIndicator={false}>
            <View
              style={[
                styles.iconContainer,
                isDark && { backgroundColor: "rgba(245, 158, 11, 0.2)" },
              ]}
            >
              <Ionicons
                name="notifications-outline"
                size={38}
                color={isDark ? "#fbbf24" : "#d97706"}
              />
            </View>

            <View
              style={[
                styles.badgeAviso,
                isDark && {
                  backgroundColor: "rgba(245, 158, 11, 0.15)",
                  borderColor: "rgba(245, 158, 11, 0.3)",
                },
              ]}
            >
              <Text
                style={[
                  styles.badgeAvisoTexto,
                  isDark && { color: "#fbbf24" },
                ]}
              >
                Aviso de Administración
              </Text>
            </View>

            <Text
              style={[
                styles.title,
                isDark && { color: colors.text },
              ]}
            >
              Pedido #{pedido.id} Modificado
            </Text>

            <Text
              style={[
                styles.description,
                isDark && { color: colors.textSecondary },
              ]}
            >
              La administración ha actualizado los datos o cantidades de tu pedido.
            </Text>

            {/* Motivo de la modificación */}
            {!!pedido.motivoEdicion && (
              <View
                style={[
                  styles.motivoCard,
                  isDark && {
                    backgroundColor: "rgba(245, 158, 11, 0.12)",
                    borderColor: "rgba(245, 158, 11, 0.35)",
                  },
                ]}
              >
                <View style={styles.motivoHeader}>
                  <Ionicons
                    name="information-circle"
                    size={18}
                    color={isDark ? "#fbbf24" : "#b45309"}
                  />
                  <Text
                    style={[
                      styles.motivoLabel,
                      isDark && { color: "#fbbf24" },
                    ]}
                  >
                    Motivo del cambio
                  </Text>
                </View>
                <Text
                  style={[
                    styles.motivoTexto,
                    isDark && { color: "#fef3c7" },
                  ]}
                >
                  {pedido.motivoEdicion}
                </Text>
              </View>
            )}

            {/* Resumen del pedido */}
            <View
              style={[
                styles.summaryCard,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <View
                style={[
                  styles.summaryRow,
                  isDark && { borderBottomColor: colors.borderLight },
                ]}
              >
                <Text
                  style={[
                    styles.summaryLabel,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Pedido
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    isDark && { color: colors.text },
                  ]}
                >
                  #{pedido.id}
                </Text>
              </View>

              <View
                style={[
                  styles.summaryRow,
                  isDark && { borderBottomColor: colors.borderLight },
                ]}
              >
                <Text
                  style={[
                    styles.summaryLabel,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Sucursal
                </Text>
                <Text
                  style={[
                    styles.summaryValue,
                    isDark && { color: colors.text },
                  ]}
                >
                  {pedido.sucursal || "Central"}
                </Text>
              </View>

              {cantidadTotal > 0 && (
                <View
                  style={[
                    styles.summaryRow,
                    isDark && { borderBottomColor: colors.borderLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.summaryLabel,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Productos
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {cantidadTotal} {cantidadTotal === 1 ? "unidad" : "unidades"}
                  </Text>
                </View>
              )}

              {!!pedido.observacion && (
                <View
                  style={[
                    styles.summaryRow,
                    isDark && { borderBottomColor: colors.borderLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.summaryLabel,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Observación
                  </Text>
                  <Text
                    style={[
                      styles.summaryValue,
                      isDark && { color: colors.text },
                    ]}
                    numberOfLines={2}
                  >
                    {pedido.observacion}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.summaryRow,
                  styles.lastSummaryRow,
                ]}
              >
                <Text
                  style={[
                    styles.summaryLabel,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Total Actualizado
                </Text>
                <Text
                  style={[
                    styles.total,
                    { color: colors.primary },
                  ]}
                >
                  Bs {Number(pedido.total ?? 0).toFixed(2)}
                </Text>
              </View>
            </View>

            {/* Desglose de Productos si existen */}
            {pedido.detalles && pedido.detalles.length > 0 && (
              <View style={styles.productsSection}>
                <Text
                  style={[
                    styles.productsTitle,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Detalle de productos ({pedido.detalles.length})
                </Text>

                {pedido.detalles.map((detalle, idx) => (
                  <View
                    key={`${detalle.idProducto}-${idx}`}
                    style={[
                      styles.productRow,
                      isDark && { borderBottomColor: colors.borderLight },
                    ]}
                  >
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text
                        style={[
                          styles.productName,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {detalle.producto}
                      </Text>
                      <Text
                        style={[
                          styles.productPrice,
                          isDark && { color: colors.textMuted },
                        ]}
                      >
                        Bs {Number(detalle.precioUnitario ?? 0).toFixed(2)} c/u
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.productQuantity,
                        { color: colors.primary },
                      ]}
                    >
                      x{detalle.cantidad}
                    </Text>
                  </View>
                ))}
              </View>
            )}

            {/* Acciones */}
            <View style={styles.actions}>
              <Pressable
                style={[
                  styles.primaryButton,
                  { backgroundColor: colors.primary },
                ]}
                onPress={onVerDetalle}
              >
                <Ionicons name="receipt-outline" size={19} color="#ffffff" />
                <Text style={styles.primaryButtonText}>
                  Ver Detalle Completo
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.secondaryButton,
                  isDark && { backgroundColor: colors.surfaceElevated },
                ]}
                onPress={onEntendido}
              >
                <Text
                  style={[
                    styles.secondaryButtonText,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Entendido
                </Text>
              </Pressable>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
