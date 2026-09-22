import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import {
  listarHistorialCajas,
  obtenerCajaActual,
  obtenerCierreCajaPorId,
} from "../../services/cierreCajaService";
import { CierreCaja, CierreCajaDetalle } from "../../types/cierreCaja";
import { BLANCO, ROJO, styles } from "../../styles/distribuidorStyles";
import { useAppTheme } from "../../hooks/useAppTheme";

type ModalActivo = "ninguno" | "detalle";

export default function CajaDistribuidorScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [cajaActual, setCajaActual] = useState<CierreCajaDetalle | null>(null);
  const [historial, setHistorial] = useState<CierreCaja[]>([]);
  const [detalleHistorial, setDetalleHistorial] =
    useState<CierreCajaDetalle | null>(null);

  const [modal, setModal] = useState<ModalActivo>("ninguno");
  const [observacion, setObservacion] = useState("");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [refrescando, setRefrescando] = useState(false);
  const [error, setError] = useState("");

  const cargarDatos = useCallback(async (esRefresh = false) => {
    if (esRefresh) {
      setRefrescando(true);
    } else {
      setCargando(true);
    }

    try {
      setError("");
      const [cajaActualRes, historialRes] = await Promise.all([
        obtenerCajaActual().catch(() => null),
        listarHistorialCajas().catch(() => []),
      ]);

      setCajaActual(cajaActualRes);
      setHistorial(historialRes);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : "Error al cargar la información de caja."
      );
    } finally {
      setCargando(false);
      setRefrescando(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      cargarDatos();
    }, [cargarDatos])
  );

  const resumenActual = useMemo(() => {
    if (!cajaActual) {
      return { total: 0, efectivo: 0, qr: 0, cantidad: 0 };
    }

    const pagos = cajaActual.pagos || [];
    let ef = 0;
    let q = 0;

    pagos.forEach((p) => {
      const monto = Number(p.montoPagado || 0);
      const tipo = (p.tipoPago || "").toLowerCase();
      if (tipo.includes("qr") || tipo.includes("transferencia")) {
        q += monto;
      } else {
        ef += monto;
      }
    });

    const totalCalculado =
      Number(cajaActual.totalRecaudado ?? 0) > 0
        ? Number(cajaActual.totalRecaudado)
        : ef + q;

    return {
      total: totalCalculado,
      efectivo:
        Number(cajaActual.totalEfectivo ?? 0) > 0
          ? Number(cajaActual.totalEfectivo)
          : ef,
      qr: Number(cajaActual.totalQR ?? 0) > 0 ? Number(cajaActual.totalQR) : q,
      cantidad: cajaActual.cantidadPagos || pagos.length,
    };
  }, [cajaActual]);

  const abrirDetalleHistorico = async (item: CierreCaja) => {
    try {
      setModal("detalle");
      setProcesando(true);
      const detalle = await obtenerCierreCajaPorId(item.id);
      setDetalleHistorial(detalle);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error
          ? e.message
          : "No se pudo cargar el detalle del cierre seleccionado."
      );
      setModal("ninguno");
    } finally {
      setProcesando(false);
    }
  };

  if (cargando) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            styles.loadingText,
            isDark && { color: colors.textSecondary },
          ]}
        >
          Cargando información de caja...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={() => cargarDatos(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Encabezado Superior */}
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.greeting,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Arqueo y recaudación
            </Text>
            <Text
              style={[
                styles.userName,
                isDark && { color: colors.text },
              ]}
            >
              Mi caja
            </Text>
          </View>

          <Pressable
            style={[
              styles.avatarButton,
              isDark && {
                backgroundColor: "rgba(200, 35, 27, 0.22)",
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/distribuidor/perfil")}
          >
            <Ionicons
              name="person-outline"
              size={23}
              color={colors.primary}
            />
          </Pressable>
        </View>

        {/* Tarjeta Hero de Resumen */}
        <View style={styles.heroBanner}>
          <View style={styles.heroDecorCircle1} />
          <View style={styles.heroDecorCircle2} />

          <View style={styles.heroHeaderRow}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="cash-outline" size={24} color={BLANCO} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Control de Turno</Text>
              <Text style={styles.heroSubtitle}>
                {cajaActual
                  ? "Caja en curso · Pagos y cobros recibidos"
                  : "Sin caja activa en este momento"}
              </Text>
            </View>
          </View>

          <View style={styles.statsContainer}>
            <View
              style={[
                styles.statBox,
                isDark && {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
              ]}
            >
              <Text
                style={[
                  styles.statValue,
                  isDark && { color: "#ffffff" },
                ]}
              >
                Bs {Number(resumenActual.total ?? 0).toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  isDark && { color: "rgba(255, 255, 255, 0.85)" },
                ]}
              >
                Total en caja
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                isDark && {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
              ]}
            >
              <Text
                style={[
                  styles.statValue,
                  isDark && { color: "#ffffff" },
                ]}
              >
                Bs {Number(resumenActual.efectivo ?? 0).toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  isDark && { color: "rgba(255, 255, 255, 0.85)" },
                ]}
              >
                Efectivo
              </Text>
            </View>

            <View
              style={[
                styles.statBox,
                isDark && {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.2)",
                },
              ]}
            >
              <Text
                style={[
                  styles.statValue,
                  isDark && { color: "#ffffff" },
                ]}
              >
                Bs {Number(resumenActual.qr ?? 0).toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  isDark && { color: "rgba(255, 255, 255, 0.85)" },
                ]}
              >
                QR
              </Text>
            </View>
          </View>
        </View>

        {!!error && (
          <View
            style={[
              styles.errorBanner,
              isDark && {
                backgroundColor: colors.dangerBg,
                borderColor: colors.dangerBorder,
              },
            ]}
          >
            <Ionicons
              name="alert-circle-outline"
              size={20}
              color={colors.dangerText}
            />
            <Text
              style={[
                styles.errorText,
                { color: colors.dangerText },
              ]}
            >
              {error}
            </Text>
          </View>
        )}

        {/* Tarjeta de Caja Actual */}
        <View
          style={[
            styles.card,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.cardTop,
              isDark && { borderBottomColor: colors.borderLight },
            ]}
          >
            <View>
              <Text
                style={[
                  styles.orderNumber,
                  isDark && { color: colors.text },
                ]}
              >
                Estado de Caja Actual
              </Text>
              <Text
                style={[
                  styles.orderDate,
                  isDark && { color: colors.textMuted },
                ]}
              >
                {cajaActual
                  ? `Abierta el ${formatearFecha(cajaActual.fechaApertura)}`
                  : "Caja no aperturada por administración"}
              </Text>
            </View>

            <View
              style={[
                styles.statusBadge,
                {
                  backgroundColor: cajaActual
                    ? isDark
                      ? "rgba(21, 128, 61, 0.22)"
                      : "#e9f8ef"
                    : isDark
                      ? colors.surfaceElevated
                      : "#f3f4f6",
                },
              ]}
            >
              <Text
                style={[
                  styles.statusBadgeText,
                  {
                    color: cajaActual
                      ? isDark
                        ? "#4ade80"
                        : "#1e874b"
                      : isDark
                        ? colors.textSecondary
                        : "#707780",
                  },
                ]}
              >
                {cajaActual ? "ABIERTA" : "CERRADA"}
              </Text>
            </View>
          </View>

          {cajaActual ? (
            <View style={{ marginTop: 14 }}>
              <View
                style={[
                  styles.totalContainer,
                  isDark && {
                    backgroundColor: "rgba(200, 35, 27, 0.18)",
                    borderColor: "rgba(200, 35, 27, 0.35)",
                  },
                ]}
              >
                <View>
                  <Text
                    style={[
                      styles.totalLabel,
                      { color: colors.primary },
                    ]}
                  >
                    TOTAL RECAUDADO
                  </Text>
                  <Text
                    style={[
                      { fontSize: 11, color: "#8a9098", marginTop: 2 },
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    {resumenActual.cantidad} pagos asociados
                  </Text>
                </View>
                <Text
                  style={[
                    styles.totalValue,
                    { color: colors.primary },
                  ]}
                >
                  Bs {Number(resumenActual.total ?? 0).toFixed(2)}
                </Text>
              </View>

              {!!cajaActual.observacion && (
                <View
                  style={[
                    {
                      backgroundColor: "#f9fafb",
                      padding: 12,
                      borderRadius: 12,
                      marginBottom: 14,
                      borderWidth: 1,
                      borderColor: "#eef0f2",
                    },
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      { fontSize: 11, color: "#707780", fontWeight: "700" },
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    OBSERVACIÓN DE APERTURA:
                  </Text>
                  <Text
                    style={[
                      { fontSize: 13, color: "#343940", marginTop: 2 },
                      isDark && { color: colors.text },
                    ]}
                  >
                    {cajaActual.observacion}
                  </Text>
                </View>
              )}

              <View style={{ gap: 10, marginTop: 4 }}>
                <Pressable
                  style={[
                    styles.btn,
                    styles.btnSoft,
                    { minHeight: 44 },
                    isDark && {
                      backgroundColor: "rgba(200, 35, 27, 0.18)",
                      borderColor: "rgba(200, 35, 27, 0.35)",
                    },
                  ]}
                  onPress={() => cargarDatos(true)}
                >
                  <Ionicons name="refresh-outline" size={17} color={colors.primary} />
                  <Text style={[styles.btnSoftText, { color: colors.primary }]}>
                    Actualizar caja
                  </Text>
                </Pressable>
              </View>

              {/* Pagos vinculados a esta caja */}
              {cajaActual.pagos && cajaActual.pagos.length > 0 && (
                <View style={{ marginTop: 18 }}>
                  <Text
                    style={[
                      {
                        fontSize: 14,
                        fontWeight: "800",
                        color: "#252a30",
                        marginBottom: 10,
                      },
                      isDark && { color: colors.text },
                    ]}
                  >
                    Pagos registrados en este turno
                  </Text>

                  {cajaActual.pagos.map((pago) => {
                    const monto = Number(pago?.montoPagado ?? 0);
                    const idPagoKey = pago?.id || pago?.idPago || Math.random();

                    return (
                      <View
                        key={idPagoKey}
                        style={[
                          styles.paymentCard,
                          isDark && {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.paymentCardTop}>
                          <Text
                            style={[
                              styles.orderNumber,
                              isDark && { color: colors.text },
                            ]}
                          >
                            Pedido #{pago.idPedido}
                          </Text>
                          <Text
                            style={[
                              styles.paymentAmount,
                              isDark && { color: colors.successText },
                            ]}
                          >
                            + Bs {monto.toFixed(2)}
                          </Text>
                        </View>

                        <View style={styles.paymentMetaRow}>
                          <View
                            style={[
                              styles.paymentMethodBadge,
                              isDark && {
                                backgroundColor: "rgba(200, 35, 27, 0.22)",
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.paymentMethodText,
                                { color: colors.primary },
                              ]}
                            >
                              {pago.tipoPago || "Pago"}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.paymentMetaText,
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            • {pago.cliente || "Cliente"}
                          </Text>
                        </View>

                        <Text
                          style={[
                            {
                              fontSize: 11,
                              color: "#9aa0a6",
                              marginTop: 6,
                            },
                            isDark && { color: colors.textMuted },
                          ]}
                        >
                          {formatearFecha(pago.fechaPago)}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              )}
            </View>
          ) : (
            <View style={{ alignItems: "center", paddingVertical: 24 }}>
              <View
                style={[
                  styles.emptyIconBox,
                  isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                ]}
              >
                <Ionicons name="lock-closed-outline" size={38} color={colors.primary} />
              </View>
              <Text
                style={[
                  styles.emptyTitle,
                  isDark && { color: colors.text },
                ]}
              >
                Caja cerrada por administración
              </Text>
              <Text
                style={[
                  styles.emptyDescription,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Tu caja no se encuentra aperturada. El administrador del sistema es quien realiza la apertura de tu caja para que puedas registrar cobros.
              </Text>

              <Pressable
                style={[
                  styles.btn,
                  styles.btnSoft,
                  { width: "100%", marginTop: 16, minHeight: 48 },
                  isDark && {
                    backgroundColor: "rgba(200, 35, 27, 0.18)",
                    borderColor: "rgba(200, 35, 27, 0.35)",
                  },
                ]}
                onPress={() => cargarDatos(true)}
              >
                <Ionicons name="refresh-outline" size={20} color={colors.primary} />
                <Text style={[styles.btnSoftText, { color: colors.primary }]}>
                  Actualizar estado de caja
                </Text>
              </Pressable>
            </View>
          )}
        </View>

        {/* Historial de Cierres */}
        <View style={styles.sectionRow}>
          <Text
            style={[
              styles.sectionTitle,
              isDark && { color: colors.text },
            ]}
          >
            Historial de Cierres
          </Text>
          <View
            style={[
              styles.badgeCount,
              isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
            ]}
          >
            <Text
              style={[
                styles.badgeCountText,
                { color: colors.primary },
              ]}
            >
              {historial.length}
            </Text>
          </View>
        </View>

        {historial.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIconBox,
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Ionicons name="time-outline" size={36} color={colors.primary} />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                isDark && { color: colors.text },
              ]}
            >
              Sin cierres anteriores
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Los arqueos y cierres finalizados aparecerán registrados en esta sección.
            </Text>
          </View>
        ) : (
          historial.map((item) => {
            const totalRecaudado = Number(item?.totalRecaudado ?? 0);
            const totalEfectivo = Number(item?.totalEfectivo ?? 0);
            const totalQR = Number(item?.totalQR ?? 0);

            return (
              <View
                key={item.id}
                style={[
                  styles.card,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.cardTop,
                    isDark && { borderBottomColor: colors.borderLight },
                  ]}
                >
                  <View>
                    <Text
                      style={[
                        styles.orderNumber,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Cierre #{item.id}
                    </Text>
                    <Text
                      style={[
                        styles.orderDate,
                        isDark && { color: colors.textMuted },
                      ]}
                    >
                      {formatearFecha(item.fechaCierre || item.fechaApertura)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.statusBadge,
                      {
                        backgroundColor: isDark
                          ? colors.surfaceElevated
                          : "#f3f4f6",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.statusBadgeText,
                        {
                          color: isDark
                            ? colors.textSecondary
                            : "#50565d",
                        },
                      ]}
                    >
                      {item.estado || "CERRADA"}
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 10, gap: 6 }}>
                  <View style={styles.infoRow}>
                    <View
                      style={[
                        styles.infoIconBox,
                        isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                      ]}
                    >
                      <Ionicons name="cash-outline" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text
                        style={[
                          styles.infoLabel,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Total Recaudado
                      </Text>
                      <Text
                        style={[
                          styles.infoText,
                          isDark && { color: colors.text },
                        ]}
                      >
                        Bs {totalRecaudado.toFixed(2)}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.infoRow}>
                    <View
                      style={[
                        styles.infoIconBox,
                        isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                      ]}
                    >
                      <Ionicons name="receipt-outline" size={16} color={colors.primary} />
                    </View>
                    <View style={styles.infoContent}>
                      <Text
                        style={[
                          styles.infoLabel,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Desglose
                      </Text>
                      <Text
                        style={[
                          styles.infoText,
                          isDark && { color: colors.text },
                        ]}
                      >
                        Efectivo: Bs {totalEfectivo.toFixed(2)} · QR: Bs {totalQR.toFixed(2)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View
                  style={[
                    styles.cardActions,
                    isDark && { borderTopColor: colors.borderLight },
                  ]}
                >
                  <Pressable
                    style={[
                      styles.btn,
                      styles.btnSoft,
                      isDark && {
                        backgroundColor: "rgba(200, 35, 27, 0.18)",
                        borderColor: "rgba(200, 35, 27, 0.35)",
                      },
                    ]}
                    onPress={() => abrirDetalleHistorico(item)}
                  >
                    <Ionicons name="eye-outline" size={17} color={colors.primary} />
                    <Text style={[styles.btnSoftText, { color: colors.primary }]}>
                      Ver detalle del cierre
                    </Text>
                  </Pressable>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal Detalle Histórico */}
      <Modal
        visible={modal === "detalle"}
        transparent
        animationType="slide"
        onRequestClose={() => setModal("ninguno")}
      >
        <View
          style={[
            styles.modalBg,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modalContainer,
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderTopWidth: 1,
              },
            ]}
          >
            <View style={styles.modalHandle} />

            <View
              style={[
                styles.modalHeader,
                isDark && { borderBottomColor: colors.borderLight },
              ]}
            >
              <Text
                style={[
                  styles.modalTitle,
                  isDark && { color: colors.text },
                ]}
              >
                Cierre #{detalleHistorial?.id}
              </Text>
              <Pressable
                style={[
                  styles.modalCloseBtn,
                  isDark && { backgroundColor: colors.surfaceElevated },
                ]}
                onPress={() => setModal("ninguno")}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? colors.textSecondary : "#555"}
                />
              </Pressable>
            </View>

            {procesando && !detalleHistorial ? (
              <View style={{ minHeight: 200, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cargando arqueo histórico...
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {detalleHistorial && (
                  <>
                    <View
                      style={[
                        styles.modalSection,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.modalSectionTitle,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Datos del Cierre
                      </Text>
                      <View style={styles.modalItemRow}>
                        <Text
                          style={[
                            styles.modalItemLabel,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Apertura:
                        </Text>
                        <Text
                          style={[
                            styles.modalItemValue,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {formatearFecha(detalleHistorial.fechaApertura)}
                        </Text>
                      </View>
                      <View style={styles.modalItemRow}>
                        <Text
                          style={[
                            styles.modalItemLabel,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Cierre:
                        </Text>
                        <Text
                          style={[
                            styles.modalItemValue,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {formatearFecha(detalleHistorial.fechaCierre || "")}
                        </Text>
                      </View>
                      <View style={styles.modalItemRow}>
                        <Text
                          style={[
                            styles.modalItemLabel,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Efectivo:
                        </Text>
                        <Text
                          style={[
                            styles.modalItemValue,
                            isDark && { color: colors.text },
                          ]}
                        >
                          Bs {Number(detalleHistorial.totalEfectivo ?? 0).toFixed(2)}
                        </Text>
                      </View>
                      <View style={styles.modalItemRow}>
                        <Text
                          style={[
                            styles.modalItemLabel,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          QR:
                        </Text>
                        <Text
                          style={[
                            styles.modalItemValue,
                            isDark && { color: colors.text },
                          ]}
                        >
                          Bs {Number(detalleHistorial.totalQR ?? 0).toFixed(2)}
                        </Text>
                      </View>
                    </View>

                    <View
                      style={[
                        styles.totalContainer,
                        isDark && {
                          backgroundColor: "rgba(200, 35, 27, 0.18)",
                          borderColor: "rgba(200, 35, 27, 0.35)",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.totalLabel,
                          { color: colors.primary },
                        ]}
                      >
                        TOTAL ARQUEADO
                      </Text>
                      <Text
                        style={[
                          styles.totalValue,
                          { color: colors.primary },
                        ]}
                      >
                        Bs {Number(detalleHistorial.totalRecaudado ?? 0).toFixed(2)}
                      </Text>
                    </View>

                    {detalleHistorial.pagos && detalleHistorial.pagos.length > 0 ? (
                      <View style={{ marginTop: 10 }}>
                        <Text
                          style={[
                            { fontSize: 13, fontWeight: "800", color: "#252a30", marginBottom: 8 },
                            isDark && { color: colors.text },
                          ]}
                        >
                          Cobros asociados ({detalleHistorial.pagos.length})
                        </Text>
                        {detalleHistorial.pagos.map((p) => {
                          const montoPago = Number(p?.montoPagado ?? 0);
                          const idPagoKey = p?.id || p?.idPago || Math.random();

                          return (
                            <View
                              key={idPagoKey}
                              style={[
                                styles.paymentCard,
                                isDark && {
                                  backgroundColor: colors.surfaceElevated,
                                  borderColor: colors.border,
                                },
                              ]}
                            >
                              <View style={styles.paymentCardTop}>
                                <Text
                                  style={[
                                    styles.orderNumber,
                                    isDark && { color: colors.text },
                                  ]}
                                >
                                  Pedido #{p.idPedido}
                                </Text>
                                <Text
                                  style={[
                                    styles.paymentAmount,
                                    isDark && { color: colors.successText },
                                  ]}
                                >
                                  + Bs {montoPago.toFixed(2)}
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.paymentMetaText,
                                  isDark && { color: colors.textSecondary },
                                ]}
                              >
                                {p.cliente} · {p.tipoPago}
                              </Text>
                            </View>
                          );
                        })}
                      </View>
                    ) : null}
                  </>
                )}
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatearFecha(fechaStr: string) {
  if (!fechaStr) return "Fecha no disponible";
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return fechaStr;

  return d.toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
