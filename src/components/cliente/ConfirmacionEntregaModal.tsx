import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";
import { styles } from "../../styles/cliente/confirmacionEntrega.styles";
import { Pedido } from "../../types/pedido";

type Props = {
  visible: boolean;
  pedido: Pedido | null;
  procesando: boolean;
  onConfirmar: () => Promise<void>;
  onNoRecibido: (motivo: string) => Promise<void>;
  onAhoraNo: () => void;
};

export default function ConfirmacionEntregaModal({
  visible,
  pedido,
  procesando,
  onConfirmar,
  onNoRecibido,
  onAhoraNo,
}: Props) {
  const { isDark, colors } = useAppTheme();
  const [modo, setModo] = useState<"confirmacion" | "rechazo">("confirmacion");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [errorMotivo, setErrorMotivo] = useState("");

  if (!pedido) {
    return null;
  }

  const cantidadTotal = (pedido.detalles || []).reduce(
    (total, detalle) => total + Number(detalle.cantidad || 0),
    0
  );

  const confirmar = () => {
    Alert.alert(
      "Confirmar recepción",
      `¿Confirmas que recibiste correctamente el pedido #${pedido.id}?`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Sí, lo recibí",
          onPress: async () => {
            try {
              await onConfirmar();

              Alert.alert(
                "Entrega confirmada",
                "Gracias. El pedido fue confirmado como entregado."
              );
            } catch (error) {
              Alert.alert(
                "No se pudo confirmar",
                error instanceof Error
                  ? error.message
                  : "Inténtalo nuevamente."
              );
            }
          },
        },
      ]
    );
  };

  const abrirFormularioRechazo = () => {
    setErrorMotivo("");
    setModo("rechazo");
  };

  const enviarRechazoDevolucion = async () => {
    if (!motivoRechazo.trim()) {
      setErrorMotivo(
        "Debes ingresar la justificación obligatoria del por qué no recibiste el pedido."
      );
      return;
    }

    try {
      await onNoRecibido(motivoRechazo.trim());

      Alert.alert(
        "Reporte registrado",
        "El pedido fue reportado como no recibido y marcado como Devuelto."
      );
      setModo("confirmacion");
      setMotivoRechazo("");
      setErrorMotivo("");
    } catch (error) {
      Alert.alert(
        "No se pudo registrar",
        error instanceof Error
          ? error.message
          : "Inténtalo nuevamente."
      );
    }
  };

  const cancelarRechazo = () => {
    setModo("confirmacion");
    setErrorMotivo("");
  };

  const cerrarModal = () => {
    setModo("confirmacion");
    setErrorMotivo("");
    setMotivoRechazo("");
    onAhoraNo();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={cerrarModal}
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
            {modo === "rechazo" ? (
              /* ================== VISTA DE RECHAZO / JUSTIFICACIÓN OBLIGATORIA ================== */
              <View>
                <View
                  style={[
                    styles.iconContainer,
                    {
                      backgroundColor: isDark
                        ? "rgba(220, 38, 38, 0.2)"
                        : "#fee2e2",
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={45}
                    color={isDark ? "#f87171" : "#dc2626"}
                  />
                </View>

                <Text
                  style={[
                    styles.title,
                    isDark && { color: colors.text },
                  ]}
                >
                  Justificación de No Recibido
                </Text>

                <Text
                  style={[
                    styles.description,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  El pedido #{pedido.id} será marcado como Devuelto. Es
                  obligatorio que justifiques el motivo para la administración y
                  el chofer.
                </Text>

                <View style={styles.rejectContainer}>
                  <View
                    style={[
                      styles.rejectAlertBox,
                      isDark && {
                        backgroundColor: "rgba(220, 38, 38, 0.15)",
                        borderColor: "rgba(220, 38, 38, 0.3)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="warning-outline"
                      size={20}
                      color={isDark ? "#f87171" : "#dc2626"}
                    />
                    <Text
                      style={[
                        styles.rejectAlertText,
                        isDark && { color: "#fca5a5" },
                      ]}
                    >
                      Indica qué ocurrió (por ejemplo: envases rotos, producto
                      incorrecto, chofer no se presentó o solicitud rechazada).
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.rejectInputLabel,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Motivo o Justificación * (Obligatorio)
                  </Text>

                  <TextInput
                    style={[
                      styles.rejectInput,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                      !!errorMotivo && styles.rejectInputError,
                    ]}
                    multiline
                    numberOfLines={4}
                    placeholder="Ej: Los envases llegaron rotos y el chofer no trajo el producto correcto"
                    placeholderTextColor={isDark ? colors.textMuted : "#9ca3af"}
                    value={motivoRechazo}
                    onChangeText={(t) => {
                      setMotivoRechazo(t);
                      if (errorMotivo) setErrorMotivo("");
                    }}
                  />

                  {!!errorMotivo && (
                    <Text style={styles.rejectErrorText}>{errorMotivo}</Text>
                  )}

                  <Pressable
                    disabled={procesando}
                    style={[
                      styles.submitRejectButton,
                      isDark && { backgroundColor: "#dc2626" },
                    ]}
                    onPress={enviarRechazoDevolucion}
                  >
                    {procesando ? (
                      <ActivityIndicator color="#ffffff" />
                    ) : (
                      <>
                        <Ionicons
                          name="arrow-undo-outline"
                          size={18}
                          color="#ffffff"
                        />
                        <Text style={styles.submitRejectButtonText}>
                          CONFIRMAR RECHAZO Y DEVOLUCIÓN
                        </Text>
                      </>
                    )}
                  </Pressable>

                  <Pressable
                    disabled={procesando}
                    style={[
                      styles.backButton,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                    onPress={cancelarRechazo}
                  >
                    <Ionicons
                      name="arrow-back"
                      size={16}
                      color={isDark ? colors.textSecondary : "#4b5563"}
                    />
                    <Text
                      style={[
                        styles.backButtonText,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Volver a la confirmación
                    </Text>
                  </Pressable>
                </View>
              </View>
            ) : (
              /* ================== VISTA DE CONFIRMACIÓN HABITUAL ================== */
              <View>
                <View
                  style={[
                    styles.iconContainer,
                    isDark && { backgroundColor: "rgba(21, 128, 61, 0.22)" },
                  ]}
                >
                  <Ionicons
                    name="checkmark-circle"
                    size={47}
                    color={isDark ? "#4ade80" : "#15803d"}
                  />
                </View>

                <Text
                  style={[
                    styles.title,
                    isDark && { color: colors.text },
                  ]}
                >
                  Tu pedido fue entregado
                </Text>

                <Text
                  style={[
                    styles.description,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  El distribuidor marcó que el pedido #{pedido.id} ya fue
                  entregado en tu sucursal.
                </Text>

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
                        {cantidadTotal}{" "}
                        {cantidadTotal === 1 ? "unidad" : "unidades"}
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
                      Total
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

                {pedido.detalles && pedido.detalles.length > 0 && (
                  <View style={styles.productsSection}>
                    <Text
                      style={[
                        styles.productsTitle,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Productos entregados ({pedido.detalles.length})
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
                            Bs {Number(detalle.precioUnitario ?? 0).toFixed(2)}{" "}
                            c/u
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

                <View
                  style={[
                    styles.questionBox,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Ionicons
                    name="help-circle-outline"
                    size={21}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.questionText,
                      isDark && { color: colors.text },
                    ]}
                  >
                    ¿Confirmas que recibiste correctamente tu pedido?
                  </Text>
                </View>

                <Pressable
                  disabled={procesando}
                  style={[
                    styles.confirmButton,
                    isDark && { backgroundColor: colors.primary },
                  ]}
                  onPress={confirmar}
                >
                  {procesando ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#ffffff"
                      />
                      <Text style={styles.confirmButtonText}>
                        SÍ, RECIBÍ MI PEDIDO
                      </Text>
                    </>
                  )}
                </Pressable>

                <Pressable
                  disabled={procesando}
                  style={[
                    styles.notReceivedButton,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={abrirFormularioRechazo}
                >
                  <Text
                    style={[
                      styles.notReceivedText,
                      isDark && { color: "#f87171" },
                    ]}
                  >
                    No recibí este pedido
                  </Text>
                </Pressable>

                <Pressable
                  disabled={procesando}
                  style={styles.laterButton}
                  onPress={cerrarModal}
                >
                  <Text
                    style={[
                      styles.laterText,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    Confirmar más tarde
                  </Text>
                </Pressable>
              </View>
            )}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
