import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";
import {
  listarTiposPagoActivos,
  registrarPago,
} from "../../services/distribuidorService";
import {
  listarMisCobrosPorPedido,
  listarPedidosCobrablesDistribuidor,
} from "../../services/cobrosDistribuidorService";
import {
  CobrosPedidoDistribuidor,
  PedidoCobrableDistribuidor,
} from "../../types/cobrosDistribuidor";
import { TipoPago } from "../../types/distribuidor";
import { BLANCO, ROJO, styles } from "../../styles/distribuidorStyles";

export default function PagosDistribuidorScreen() {
  const { colors, isDark } = useAppTheme();

  const [cobrosPorPedido, setCobrosPorPedido] = useState<CobrosPedidoDistribuidor[]>([]);
  const [pedidosCobrables, setPedidosCobrables] = useState<PedidoCobrableDistribuidor[]>([]);
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([]);

  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [busqueda, setBusqueda] = useState("");

  const [modalVisible, setModalVisible] = useState(false);
  const [pedidoIdSeleccionado, setPedidoIdSeleccionado] = useState<number | null>(null);
  const [tipoPagoIdSeleccionado, setTipoPagoIdSeleccionado] = useState<number | null>(null);
  const [monto, setMonto] = useState("");

  const [modalDetalleVisible, setModalDetalleVisible] = useState(false);
  const [pedidoDetalle, setPedidoDetalle] = useState<CobrosPedidoDistribuidor | null>(null);

  const cargarDatos = useCallback(async (silencioso = false) => {
    try {
      if (silencioso) {
        setRefrescando(true);
      } else {
        setCargando(true);
      }

      const [resCobros, resCobrables, resTipos] = await Promise.all([
        listarMisCobrosPorPedido(),
        listarPedidosCobrablesDistribuidor(),
        listarTiposPagoActivos(),
      ]);

      setCobrosPorPedido(resCobros);
      setPedidosCobrables(resCobrables);
      setTiposPago(resTipos);
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error
          ? e.message
          : "No se pudieron cargar los datos de cobros."
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

  const totalRecaudado = useMemo(() => {
    return cobrosPorPedido.reduce(
      (sum, p) => sum + p.totalCobradoPorMi,
      0
    );
  }, [cobrosPorPedido]);

  const totalTransacciones = useMemo(() => {
    return cobrosPorPedido.reduce(
      (sum, p) => sum + p.cantidadCobros,
      0
    );
  }, [cobrosPorPedido]);

  const cobrosFiltrados = useMemo(() => {
    if (!busqueda.trim()) {
      return cobrosPorPedido;
    }

    const texto = busqueda.toLowerCase().trim();

    return cobrosPorPedido.filter(
      (p) =>
        String(p.idPedido).includes(texto) ||
        (p.cliente || "").toLowerCase().includes(texto) ||
        (p.sucursal || "").toLowerCase().includes(texto) ||
        p.historialCobros.some((h) =>
          (h.tipoPago || "").toLowerCase().includes(texto)
        )
    );
  }, [cobrosPorPedido, busqueda]);

  const abrirModalNuevoPago = () => {
    if (pedidosCobrables.length === 0) {
      Alert.alert(
        "Sin entregas pendientes",
        "No tienes pedidos entregados con saldo pendiente para cobrar en este momento."
      );
      return;
    }

    setPedidoIdSeleccionado(pedidosCobrables[0].idPedido);
    setTipoPagoIdSeleccionado(tiposPago.length > 0 ? tiposPago[0].id : null);
    setMonto("");
    setModalVisible(true);
  };

  const pedidoSeleccionado = useMemo(() => {
    if (!pedidoIdSeleccionado) return null;
    return (
      pedidosCobrables.find((p) => p.idPedido === pedidoIdSeleccionado) || null
    );
  }, [pedidosCobrables, pedidoIdSeleccionado]);

  const guardarPago = async () => {
    if (!pedidoIdSeleccionado) {
      Alert.alert("Selección requerida", "Debes seleccionar un pedido para registrar el cobro.");
      return;
    }

    if (!tipoPagoIdSeleccionado) {
      Alert.alert("Selección requerida", "Debes seleccionar un método de pago.");
      return;
    }

    const montoNumerico = Number(monto.replace(",", "."));

    if (Number.isNaN(montoNumerico) || montoNumerico <= 0) {
      Alert.alert("Monto inválido", "Ingresa un monto válido mayor a 0.");
      return;
    }

    if (pedidoSeleccionado && montoNumerico > pedidoSeleccionado.saldoPendiente) {
      Alert.alert(
        "Monto inválido",
        `El cobro no puede superar el saldo pendiente de Bs ${pedidoSeleccionado.saldoPendiente.toFixed(2)}.`
      );
      return;
    }

    try {
      setGuardando(true);
      await registrarPago({
        idPedido: pedidoIdSeleccionado,
        idTipoPago: tipoPagoIdSeleccionado,
        montoPagado: montoNumerico,
      });

      setModalVisible(false);
      setMonto("");
      await cargarDatos(true);
      Alert.alert("Pago registrado", "El cobro fue guardado exitosamente.");
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error ? e.message : "No se pudo registrar el pago."
      );
    } finally {
      setGuardando(false);
    }
  };

  const abrirDetalle = (pedido: CobrosPedidoDistribuidor) => {
    setPedidoDetalle(pedido);
    setModalDetalleVisible(true);
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
          Cargando cobros registrados...
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
      <FlatList
        data={cobrosFiltrados}
        keyExtractor={(item) => String(item.idPedido)}
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
        ListHeaderComponent={
          <>
            {/* Encabezado */}
            <View style={styles.header}>
              <View>
                <Text
                  style={[
                    styles.greeting,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cobros y recaudaciones
                </Text>
                <Text
                  style={[
                    styles.userName,
                    isDark && { color: colors.text },
                  ]}
                >
                  Pagos registrados
                </Text>
              </View>
            </View>

            {/* Resumen Hero */}
            <View style={styles.heroBanner}>
              <View style={styles.heroDecorCircle1} />
              <View style={styles.heroDecorCircle2} />

              <View style={styles.heroHeaderRow}>
                <View style={styles.heroIconCircle}>
                  <Ionicons name="wallet-outline" size={24} color={BLANCO} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>Total Recaudado</Text>
                  <Text style={styles.heroSubtitle}>Cobros realizados a clientes</Text>
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
                    Bs {totalRecaudado.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      isDark && { color: "rgba(255, 255, 255, 0.85)" },
                    ]}
                  >
                    Total cobrado
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
                    {totalTransacciones}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      isDark && { color: "rgba(255, 255, 255, 0.85)" },
                    ]}
                  >
                    Transacciones
                  </Text>
                </View>
              </View>
            </View>

            {/* Botón Registrar Cobro */}
            <Pressable
              style={[
                styles.btnRegistrarPago,
                { backgroundColor: colors.primary },
              ]}
              onPress={abrirModalNuevoPago}
            >
              <Ionicons name="add-circle-outline" size={22} color={BLANCO} />
              <Text style={styles.btnRegistrarPagoTexto}>
                REGISTRAR NUEVO COBRO
              </Text>
            </Pressable>

            {/* Buscador */}
            <View
              style={[
                styles.searchContainer,
                isDark && {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={20}
                color={colors.inputPlaceholder}
              />
              <TextInput
                style={[
                  styles.searchInput,
                  isDark && { color: colors.text },
                ]}
                placeholder="Buscar pedido, cliente, sucursal o método..."
                placeholderTextColor={colors.inputPlaceholder}
                value={busqueda}
                onChangeText={setBusqueda}
              />
              {!!busqueda && (
                <Pressable onPress={() => setBusqueda("")}>
                  <Ionicons
                    name="close-circle"
                    size={18}
                    color={colors.inputPlaceholder}
                  />
                </Pressable>
              )}
            </View>

            {/* Título de Sección */}
            <View style={styles.sectionRow}>
              <Text
                style={[
                  styles.sectionTitle,
                  isDark && { color: colors.text },
                ]}
              >
                Cobros por pedido
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
                  {cobrosFiltrados.length}
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
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
              <Ionicons
                name="receipt-outline"
                size={38}
                color={colors.primary}
              />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                isDark && { color: colors.text },
              ]}
            >
              No hay cobros registrados
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                isDark && { color: colors.textSecondary },
              ]}
            >
              {busqueda
                ? "No se encontraron resultados para tu búsqueda."
                : "Aún no has registrado ningún cobro para tus entregas."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const saldoPagado = item.saldoPendiente <= 0;

          return (
            <Pressable
              style={[
                styles.paymentCard,
                isDark && {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
              onPress={() => abrirDetalle(item)}
            >
              <View style={styles.paymentCardTop}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.orderNumber,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Pedido #{item.idPedido}
                  </Text>
                  <Text
                    style={[
                      styles.paymentMetaText,
                      { marginTop: 4 },
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {item.cliente || "Cliente"} · {item.sucursal || "Sin sucursal"}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.paymentAmount,
                    isDark && { color: colors.successText },
                  ]}
                >
                  Bs {item.totalCobradoPorMi.toFixed(2)}
                </Text>
              </View>

              <View
                style={[
                  styles.paymentMetaRow,
                  { flexWrap: "wrap" },
                ]}
              >
                <View
                  style={[
                    styles.paymentMethodBadge,
                    isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentMethodText,
                      { color: colors.primary },
                    ]}
                  >
                    {item.cantidadCobros} {item.cantidadCobros === 1 ? "cobro" : "cobros"}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.paymentMetaText,
                    isDark && { color: colors.textMuted },
                  ]}
                >
                  • Último: {formatearFecha(item.ultimoCobro || "")}
                </Text>
              </View>

              <View
                style={[
                  styles.paymentMetaRow,
                  { marginTop: 8 },
                ]}
              >
                <Ionicons
                  name="calendar-outline"
                  size={15}
                  color={colors.textSecondary}
                />
                <Text
                  style={[
                    styles.paymentMetaText,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Entregado: {formatearFecha(item.fechaEntrega || item.fechaPedido)}
                </Text>
              </View>

              {!!item.ubicacion && (
                <View
                  style={[
                    styles.paymentMetaRow,
                    { marginTop: 5 },
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={15}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.paymentMetaText,
                      { flex: 1 },
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {item.ubicacion}
                  </Text>
                </View>
              )}

              <View
                style={[
                  styles.paymentBalanceRow,
                  isDark && { borderTopColor: colors.borderLight },
                ]}
              >
                {saldoPagado ? (
                  <View style={styles.balancePaidBadge}>
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={16}
                      color={isDark ? "#4ade80" : "#1e874b"}
                    />
                    <Text
                      style={[
                        styles.balancePaidText,
                        isDark && { color: "#4ade80" },
                      ]}
                    >
                      Saldo liquidado
                    </Text>
                  </View>
                ) : (
                  <Text
                    style={[
                      styles.balancePendingText,
                      { color: colors.primary },
                    ]}
                  >
                    Saldo pendiente: Bs {item.saldoPendiente.toFixed(2)}
                  </Text>
                )}

                <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
                  <Text
                    style={[
                      { fontSize: 11, color: "#9aa0a6" },
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    Ver cobros
                  </Text>
                  <Ionicons
                    name="chevron-forward"
                    size={14}
                    color={isDark ? colors.textMuted : "#9aa0a6"}
                  />
                </View>
              </View>
            </Pressable>
          );
        }}
      />

      {/* Modal Registrar Cobro */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
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
                Registrar Cobro
              </Text>
              <Pressable
                style={[
                  styles.modalCloseBtn,
                  isDark && { backgroundColor: colors.surfaceElevated },
                ]}
                onPress={() => setModalVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? colors.textSecondary : "#555"}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              <Text
                style={[
                  styles.etiqueta,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Selecciona el Pedido
              </Text>

              <View style={styles.selectorWrap}>
                {pedidosCobrables.map((p) => {
                  const activo = pedidoIdSeleccionado === p.idPedido;

                  return (
                    <Pressable
                      key={p.idPedido}
                      style={[
                        styles.chipItem,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                        activo && [
                          styles.chipItemActive,
                          isDark && {
                            backgroundColor: "rgba(200, 35, 27, 0.22)",
                            borderColor: colors.primary,
                          },
                        ],
                        {
                          width: "100%",
                          alignItems: "flex-start",
                          paddingVertical: 11,
                        },
                      ]}
                      onPress={() => setPedidoIdSeleccionado(p.idPedido)}
                    >
                      <Text
                        style={[
                          styles.chipItemText,
                          isDark && { color: colors.text },
                          activo && [
                            styles.chipItemTextActive,
                            { color: colors.primary },
                          ],
                          { fontWeight: "800" },
                        ]}
                      >
                        Pedido #{p.idPedido} · {p.cliente}
                      </Text>

                      <Text
                        style={[
                          styles.chipItemText,
                          isDark && { color: colors.textSecondary },
                          activo && [
                            styles.chipItemTextActive,
                            { color: colors.primary },
                          ],
                          { marginTop: 4, fontSize: 11, opacity: 0.85 },
                        ]}
                      >
                        Sucursal: {p.sucursal || "Sin sucursal"}
                      </Text>

                      <Text
                        style={[
                          styles.chipItemText,
                          isDark && { color: colors.textMuted },
                          activo && [
                            styles.chipItemTextActive,
                            { color: colors.primary },
                          ],
                          { marginTop: 3, fontSize: 11, opacity: 0.85 },
                        ]}
                      >
                        Entregado: {formatearFecha(p.fechaEntrega || p.fechaPedido)}
                      </Text>

                      <Text
                        style={[
                          styles.chipItemText,
                          { color: colors.primary },
                          activo && styles.chipItemTextActive,
                          { marginTop: 3, fontSize: 11, fontWeight: "900" },
                        ]}
                      >
                        Saldo pendiente: Bs {p.saldoPendiente.toFixed(2)}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>

              {pedidoSeleccionado && (
                <View
                  style={[
                    styles.paymentCard,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                    { marginTop: 12, marginBottom: 4 },
                  ]}
                >
                  <Text
                    style={[
                      styles.orderNumber,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Pedido seleccionado
                  </Text>
                  <Text
                    style={[
                      { marginTop: 5, color: "#5d646c", fontSize: 12 },
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {pedidoSeleccionado.cliente} · {pedidoSeleccionado.sucursal}
                  </Text>

                  {!!pedidoSeleccionado.ubicacion && (
                    <Text
                      style={[
                        { marginTop: 4, color: "#8a9098", fontSize: 11 },
                        isDark && { color: colors.textMuted },
                      ]}
                    >
                      {pedidoSeleccionado.ubicacion}
                    </Text>
                  )}

                  <Text
                    style={[
                      { marginTop: 7, color: colors.primary, fontSize: 13, fontWeight: "900" },
                    ]}
                  >
                    Debe Bs {pedidoSeleccionado.saldoPendiente.toFixed(2)}
                  </Text>
                </View>
              )}

              {/* Selector de Método de Pago */}
              <Text
                style={[
                  styles.etiqueta,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Método de Pago
              </Text>

              <View style={styles.selectorWrap}>
                {tiposPago.length === 0 ? (
                  <Text
                    style={[
                      { color: "#8a9098", fontSize: 13, padding: 4 },
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    Cargando métodos de pago...
                  </Text>
                ) : (
                  tiposPago.map((t) => {
                    const activo = tipoPagoIdSeleccionado === t.id;

                    return (
                      <Pressable
                        key={t.id}
                        style={[
                          styles.chipItem,
                          isDark && {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.border,
                          },
                          activo && [
                            styles.chipItemActive,
                            isDark && {
                              backgroundColor: "rgba(200, 35, 27, 0.22)",
                              borderColor: colors.primary,
                            },
                          ],
                        ]}
                        onPress={() => setTipoPagoIdSeleccionado(t.id)}
                      >
                        <Text
                          style={[
                            styles.chipItemText,
                            isDark && { color: colors.text },
                            activo && [
                              styles.chipItemTextActive,
                              { color: colors.primary },
                            ],
                          ]}
                        >
                          {t.descripcion}
                        </Text>
                      </Pressable>
                    );
                  })
                )}
              </View>

              {/* Input Monto */}
              <Text
                style={[
                  styles.etiqueta,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Monto Cobrado (Bs)
              </Text>

              <View
                style={[
                  styles.inputContainer,
                  isDark && {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={colors.primary}
                />
                <TextInput
                  style={[
                    styles.input,
                    isDark && { color: colors.text },
                  ]}
                  value={monto}
                  onChangeText={setMonto}
                  keyboardType="decimal-pad"
                  placeholder={
                    pedidoSeleccionado
                      ? `Máx. ${pedidoSeleccionado.saldoPendiente.toFixed(2)}`
                      : "0.00"
                  }
                  placeholderTextColor={colors.inputPlaceholder}
                />
              </View>

              {/* Botón Guardar */}
              <Pressable
                disabled={guardando}
                style={[
                  styles.btnRegistrarPago,
                  { marginTop: 24, minHeight: 52, backgroundColor: colors.primary },
                  guardando && styles.botonDeshabilitado,
                ]}
                onPress={guardarPago}
              >
                {guardando ? (
                  <ActivityIndicator color={BLANCO} />
                ) : (
                  <>
                    <Ionicons
                      name="checkmark-outline"
                      size={20}
                      color={BLANCO}
                    />
                    <Text style={styles.btnRegistrarPagoTexto}>
                      GUARDAR COBRO
                    </Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Historial de un Pedido */}
      <Modal
        visible={modalDetalleVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalDetalleVisible(false)}
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
                {pedidoDetalle
                  ? `Pedido #${pedidoDetalle.idPedido}`
                  : "Detalle de cobros"}
              </Text>
              <Pressable
                style={[
                  styles.modalCloseBtn,
                  isDark && { backgroundColor: colors.surfaceElevated },
                ]}
                onPress={() => setModalDetalleVisible(false)}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? colors.textSecondary : "#555"}
                />
              </Pressable>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 20 }}
            >
              {pedidoDetalle && (
                <>
                  <View
                    style={[
                      styles.paymentCard,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.orderNumber,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {pedidoDetalle.cliente}
                    </Text>
                    <Text
                      style={[
                        { marginTop: 5, color: "#5d646c", fontSize: 12 },
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Sucursal: {pedidoDetalle.sucursal || "Sin sucursal"}
                    </Text>

                    {!!pedidoDetalle.ubicacion && (
                      <Text
                        style={[
                          { marginTop: 4, color: "#8a9098", fontSize: 11 },
                          isDark && { color: colors.textMuted },
                        ]}
                      >
                        {pedidoDetalle.ubicacion}
                      </Text>
                    )}

                    <Text
                      style={[
                        { marginTop: 5, color: "#8a9098", fontSize: 11 },
                        isDark && { color: colors.textMuted },
                      ]}
                    >
                      Entregado: {formatearFecha(pedidoDetalle.fechaEntrega || pedidoDetalle.fechaPedido)}
                    </Text>

                    <View
                      style={[
                        styles.paymentBalanceRow,
                        isDark && { borderTopColor: colors.borderLight },
                        { marginTop: 13 },
                      ]}
                    >
                      <View>
                        <Text
                          style={[
                            { fontSize: 11, color: "#8a9098" },
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Total pedido
                        </Text>
                        <Text
                          style={[
                            { marginTop: 2, fontSize: 15, fontWeight: "900", color: "#2e343b" },
                            isDark && { color: colors.text },
                          ]}
                        >
                          Bs {pedidoDetalle.totalPedido.toFixed(2)}
                        </Text>
                      </View>

                      <View style={{ alignItems: "flex-end" }}>
                        <Text
                          style={[
                            { fontSize: 11, color: "#8a9098" },
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Saldo
                        </Text>
                        <Text
                          style={[
                            {
                              marginTop: 2,
                              fontSize: 15,
                              fontWeight: "900",
                              color:
                                pedidoDetalle.saldoPendiente <= 0
                                  ? isDark
                                    ? "#4ade80"
                                    : "#1e874b"
                                  : colors.primary,
                            },
                          ]}
                        >
                          Bs {pedidoDetalle.saldoPendiente.toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Historial de Cobros */}
                  <View style={styles.sectionRow}>
                    <Text
                      style={[
                        styles.sectionTitle,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Historial de cobros
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
                        {pedidoDetalle.historialCobros.length}
                      </Text>
                    </View>
                  </View>

                  {pedidoDetalle.historialCobros.map((cobro) => (
                    <View
                      key={cobro.idPago}
                      style={[
                        styles.paymentCard,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.paymentCardTop}>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.orderNumber,
                              isDark && { color: colors.text },
                            ]}
                          >
                            Cobro #{cobro.idPago}
                          </Text>
                          <Text
                            style={[
                              styles.paymentMetaText,
                              { marginTop: 4 },
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            {formatearFecha(cobro.fechaPago)}
                          </Text>
                        </View>

                        <Text
                          style={[
                            styles.paymentAmount,
                            isDark && { color: colors.successText },
                          ]}
                        >
                          + Bs {cobro.montoPagado.toFixed(2)}
                        </Text>
                      </View>

                      <View style={styles.paymentMetaRow}>
                        <View
                          style={[
                            styles.paymentMethodBadge,
                            isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                          ]}
                        >
                          <Text
                            style={[
                              styles.paymentMethodText,
                              { color: colors.primary },
                            ]}
                          >
                            {cobro.tipoPago || "Pago"}
                          </Text>
                        </View>
                      </View>

                      <View
                        style={[
                          styles.paymentBalanceRow,
                          isDark && { borderTopColor: colors.borderLight },
                        ]}
                      >
                        {cobro.saldoPendienteDespuesPago <= 0 ? (
                          <View style={styles.balancePaidBadge}>
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={16}
                              color={isDark ? "#4ade80" : "#1e874b"}
                            />
                            <Text
                              style={[
                                styles.balancePaidText,
                                isDark && { color: "#4ade80" },
                              ]}
                            >
                              Saldo liquidado
                            </Text>
                          </View>
                        ) : (
                          <Text
                            style={[
                              styles.balancePendingText,
                              { color: colors.primary },
                            ]}
                          >
                            Saldo después del cobro: Bs {cobro.saldoPendienteDespuesPago.toFixed(2)}
                          </Text>
                        )}
                      </View>
                    </View>
                  ))}
                </>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatearFecha(fechaStr: string) {
  if (!fechaStr) {
    return "Fecha no disponible";
  }

  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) {
    return fechaStr;
  }

  return d.toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
