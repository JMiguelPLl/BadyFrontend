import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  listarPagosCliente,
  listarPagosPorPedido,
} from "../../services/PagosService";
import {
  Pago,
  PagosPorPedido,
  PedidoPagosAgrupado,
} from "../../types/pago";
import {
  BLANCO,
  ROJO,
  VERDE,
  styles,
} from "../../styles/cliente/pagos.styles";

type FiltroDeuda = "Todos" | "Pendientes" | "Pagados";

export default function PagosClienteScreen() {
  const { colors, isDark } = useAppTheme();

  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [pagos, setPagos] = useState<Pago[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroDeuda>("Todos");

  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<PagosPorPedido | null>(null);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    iniciarPantalla();
  }, []);

  const iniciarPantalla = async () => {
    try {
      setCargando(true);
      setError("");

      const usuarioTexto = await AsyncStorage.getItem("usuario");
      if (!usuarioTexto) {
        throw new Error("No se encontró la sesión del cliente.");
      }

      const usuario = JSON.parse(usuarioTexto);
      const clienteId = Number(usuario?.idCliente ?? usuario?.id);

      if (!clienteId) {
        throw new Error("No se pudo identificar al cliente.");
      }

      setIdCliente(clienteId);
      await cargarPagos(clienteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los pagos.");
    } finally {
      setCargando(false);
    }
  };

  const cargarPagos = async (clienteId = idCliente, esActualizacion = false) => {
    if (!clienteId) return;

    try {
      setError("");
      if (esActualizacion) setActualizando(true);

      const respuesta = await listarPagosCliente(clienteId);
      setPagos(respuesta || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los pagos.");
    } finally {
      setActualizando(false);
    }
  };

  // Agrupación de pagos por pedido
  const pedidosAgrupados = useMemo(() => {
    const mapa = new Map<number, PedidoPagosAgrupado>();

    pagos.forEach((pago) => {
      const idPagoId = Number(pago.idPedido);
      if (!mapa.has(idPagoId)) {
        mapa.set(idPagoId, {
          idPedido: idPagoId,
          cliente: pago.cliente || "Cliente",
          sucursal: pago.sucursal || "Central",
          totalPedido: Number(pago.totalPedido ?? 0),
          estadoPedido: pago.estadoPedido || "Pendiente",
          totalPagado: 0,
          saldoPendiente: Number(pago.saldoPendiente ?? 0),
          ultimaFechaPago: pago.fechaPago,
          cantidadPagos: 0,
          pagos: [],
        });
      }

      const grupo = mapa.get(idPagoId)!;
      grupo.totalPagado += Number(pago.montoPagado ?? 0);
      grupo.cantidadPagos += 1;
      grupo.pagos.push(pago);

      if (new Date(pago.fechaPago) > new Date(grupo.ultimaFechaPago)) {
        grupo.ultimaFechaPago = pago.fechaPago;
      }
    });

    return Array.from(mapa.values());
  }, [pagos]);

  // Resumen Financiero
  const totalPagado = useMemo(() => {
    return pagos.reduce((sum, p) => sum + Number(p.montoPagado ?? 0), 0);
  }, [pagos]);

  const deudaPendiente = useMemo(() => {
    return pedidosAgrupados.reduce(
      (sum, p) => sum + Number(p.saldoPendiente ?? 0),
      0
    );
  }, [pedidosAgrupados]);

  const pedidosConDeuda = useMemo(() => {
    return pedidosAgrupados.filter((p) => Number(p.saldoPendiente ?? 0) > 0).length;
  }, [pedidosAgrupados]);

  // Filtrado
  const pedidosFiltrados = useMemo(() => {
    let lista = pedidosAgrupados;

    if (filtro === "Pendientes") {
      lista = lista.filter((p) => Number(p.saldoPendiente ?? 0) > 0);
    } else if (filtro === "Pagados") {
      lista = lista.filter((p) => Number(p.saldoPendiente ?? 0) <= 0);
    }

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter(
        (p) =>
          String(p.idPedido).includes(q) ||
          (p.sucursal || "").toLowerCase().includes(q)
      );
    }

    return lista;
  }, [pedidosAgrupados, filtro, busqueda]);

  const abrirDetalle = async (idPedido: number) => {
    try {
      setModalVisible(true);
      setCargandoDetalle(true);
      const res = await listarPagosPorPedido(idPedido);
      setPedidoSeleccionado(res);
    } catch (err) {
      setError("No se pudo cargar el historial de abonos.");
    } finally {
      setCargandoDetalle(false);
    }
  };

  const cerrarModal = () => {
    setModalVisible(false);
    setPedidoSeleccionado(null);
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
          Cargando estado de cuentas...
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
        contentContainerStyle={styles.contenido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => cargarPagos(idCliente, true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Encabezado */}
        <View style={styles.encabezado}>
          <View>
            <Text
              style={[
                styles.titulo,
                isDark && { color: colors.text },
              ]}
            >
              Mis Deudas y Pagos
            </Text>
            <Text
              style={[
                styles.subtitulo,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Estado de cuenta y control de abonos
            </Text>
          </View>
        </View>

        {/* Hero Financiero */}
        <View style={styles.heroBanner}>
          <View style={styles.heroDecorCircle1} />
          <View style={styles.heroDecorCircle2} />

          <View style={styles.heroHeaderRow}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="wallet-outline" size={24} color={BLANCO} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Balance Financiero</Text>
              <Text style={styles.heroSubtitle}>
                {pedidosConDeuda === 0
                  ? "¡Estás al día con todos tus pagos!"
                  : `${pedidosConDeuda} ${pedidosConDeuda === 1 ? "pedido con saldo pendiente" : "pedidos con saldo pendiente"}`}
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
                  { color: isDark ? "#4ade80" : VERDE },
                ]}
              >
                Bs {Number(totalPagado ?? 0).toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  isDark && { color: "rgba(255, 255, 255, 0.85)" },
                ]}
              >
                Total abonado
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
                Bs {Number(deudaPendiente ?? 0).toFixed(2)}
              </Text>
              <Text
                style={[
                  styles.statLabel,
                  isDark && { color: "rgba(255, 255, 255, 0.85)" },
                ]}
              >
                Deuda pendiente
              </Text>
            </View>
          </View>
        </View>

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
            placeholder="Buscar por # pedido o sucursal..."
            placeholderTextColor={colors.inputPlaceholder}
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {busqueda.length > 0 && (
            <Pressable onPress={() => setBusqueda("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={colors.inputPlaceholder}
              />
            </Pressable>
          )}
        </View>

        {/* Filtros de Deuda */}
        <View style={styles.filterContainer}>
          <Pressable
            style={[
              styles.filterChip,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              filtro === "Todos" && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setFiltro("Todos")}
          >
            <Text
              style={[
                styles.filterChipText,
                isDark && { color: colors.textSecondary },
                filtro === "Todos" && styles.filterChipTextActive,
              ]}
            >
              Todos ({pedidosAgrupados.length})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterChip,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              filtro === "Pendientes" && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setFiltro("Pendientes")}
          >
            <Text
              style={[
                styles.filterChipText,
                isDark && { color: colors.textSecondary },
                filtro === "Pendientes" && styles.filterChipTextActive,
              ]}
            >
              Con saldo ({pedidosConDeuda})
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.filterChip,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
              filtro === "Pagados" && {
                backgroundColor: colors.primary,
                borderColor: colors.primary,
              },
            ]}
            onPress={() => setFiltro("Pagados")}
          >
            <Text
              style={[
                styles.filterChipText,
                isDark && { color: colors.textSecondary },
                filtro === "Pagados" && styles.filterChipTextActive,
              ]}
            >
              Saldados ({pedidosAgrupados.length - pedidosConDeuda})
            </Text>
          </Pressable>
        </View>

        {/* Listado de Pedidos y Deudas */}
        {pedidosFiltrados.length === 0 ? (
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
              <Ionicons name="checkmark-done-circle-outline" size={38} color={colors.primary} />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                isDark && { color: colors.text },
              ]}
            >
              No hay registros para mostrar
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                isDark && { color: colors.textSecondary },
              ]}
            >
              {busqueda
                ? "No se encontraron coincidencias con tu búsqueda."
                : "No tienes pedidos en esta categoría."}
            </Text>
          </View>
        ) : (
          pedidosFiltrados.map((item) => {
            const saldo = Number(item.saldoPendiente ?? 0);
            const total = Number(item.totalPedido ?? 0);
            const pagado = Number(item.totalPagado ?? 0);
            const estaSaldado = saldo <= 0;

            return (
              <View
                key={item.idPedido}
                style={[
                  styles.pedidoCard,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Cabecera */}
                <View
                  style={[
                    styles.pedidoCabecera,
                    isDark && { borderBottomColor: colors.borderLight },
                  ]}
                >
                  <View>
                    <Text
                      style={[
                        styles.pedidoNumero,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Pedido #{item.idPedido}
                    </Text>
                    <Text
                      style={[
                        styles.pedidoSucursal,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      {item.sucursal}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.estadoBadge,
                      {
                        backgroundColor: estaSaldado
                          ? isDark
                            ? "rgba(21, 128, 61, 0.22)"
                            : "#ecfdf3"
                          : isDark
                            ? colors.dangerBg
                            : "#fff1f2",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.estadoBadgeTexto,
                        {
                          color: estaSaldado
                            ? isDark
                              ? "#4ade80"
                              : VERDE
                            : colors.dangerText,
                        },
                      ]}
                    >
                      {estaSaldado ? "SALDADO ✓" : "CON SALDO"}
                    </Text>
                  </View>
                </View>

                {/* Grilla de 3 Columnas Financieras */}
                <View style={styles.montosGrid}>
                  <View
                    style={[
                      styles.montoCard,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.montoEtiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      TOTAL
                    </Text>
                    <Text
                      style={[
                        styles.montoValor,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Bs {total.toFixed(2)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.montoCard,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.montoEtiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      PAGADO
                    </Text>
                    <Text
                      style={[
                        styles.montoValor,
                        { color: isDark ? "#4ade80" : VERDE },
                      ]}
                    >
                      Bs {pagado.toFixed(2)}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.montoCard,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.montoEtiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      SALDO
                    </Text>
                    <Text
                      style={[
                        styles.montoValor,
                        { color: estaSaldado ? (isDark ? colors.textSecondary : "#6b7280") : colors.dangerText },
                      ]}
                    >
                      Bs {saldo.toFixed(2)}
                    </Text>
                  </View>
                </View>

                {/* Último Pago */}
                <View style={styles.pagoInfoFila}>
                  <Ionicons
                    name="time-outline"
                    size={16}
                    color={colors.textSecondary}
                  />
                  <Text
                    style={[
                      styles.pagoInfoTexto,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Último abono: {formatearFecha(item.ultimaFechaPago)} ({item.cantidadPagos} {item.cantidadPagos === 1 ? "abono" : "abonos"})
                  </Text>
                </View>

                {/* Botón Ver Desglose */}
                <Pressable
                  style={[
                    styles.pedidoAccion,
                    isDark && {
                      backgroundColor: "rgba(200, 35, 27, 0.18)",
                      borderColor: "rgba(200, 35, 27, 0.35)",
                    },
                  ]}
                  onPress={() => abrirDetalle(item.idPedido)}
                >
                  <Ionicons name="receipt-outline" size={17} color={colors.primary} />
                  <Text
                    style={[
                      styles.pedidoAccionTexto,
                      { color: colors.primary },
                    ]}
                  >
                    Ver historial de abonos
                  </Text>
                </Pressable>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Modal Desglose de Abonos */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={cerrarModal}
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
                Historial de Pagos · Pedido #{pedidoSeleccionado?.idPedido}
              </Text>
              <Pressable style={styles.modalCloseBtn} onPress={cerrarModal}>
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? colors.textSecondary : "#555"}
                />
              </Pressable>
            </View>

            {cargandoDetalle ? (
              <View style={{ minHeight: 180, alignItems: "center", justifyContent: "center" }}>
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cargando abonos del pedido...
                </Text>
              </View>
            ) : pedidoSeleccionado ? (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 20 }}>
                {/* Barra de Progreso */}
                {(() => {
                  const total = Number(pedidoSeleccionado.totalPedido ?? 0);
                  const pagado = Number(pedidoSeleccionado.totalPagado ?? 0);
                  const saldo = Number(pedidoSeleccionado.saldoPendienteActual ?? 0);
                  const porcentaje = total > 0 ? Math.min(100, Math.round((pagado / total) * 100)) : 0;

                  return (
                    <View
                      style={[
                        styles.progresoContainer,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.progresoRow}>
                        <Text
                          style={[
                            styles.progresoTitulo,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Progreso de liquidación
                        </Text>
                        <Text
                          style={[
                            styles.progresoValor,
                            { color: colors.primary },
                          ]}
                        >
                          {porcentaje}% completado
                        </Text>
                      </View>

                      <View
                        style={[
                          styles.progresoFondo,
                          isDark && { backgroundColor: colors.border },
                        ]}
                      >
                        <View
                          style={[
                            styles.progresoRelleno,
                            { width: `${porcentaje}%`, backgroundColor: colors.primary },
                          ]}
                        />
                      </View>

                      <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 10 }}>
                        <Text
                          style={[
                            { fontSize: 12, color: "#6b7280" },
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Abonado: <Text style={{ fontWeight: "800", color: isDark ? "#4ade80" : VERDE }}>Bs {pagado.toFixed(2)}</Text>
                        </Text>
                        <Text
                          style={[
                            { fontSize: 12, color: "#6b7280" },
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Saldo: <Text style={{ fontWeight: "800", color: saldo > 0 ? colors.dangerText : (isDark ? "#4ade80" : VERDE) }}>Bs {saldo.toFixed(2)}</Text>
                        </Text>
                      </View>
                    </View>
                  );
                })()}

                {/* Lista de Abonos */}
                <Text
                  style={[
                    {
                      fontSize: 13,
                      fontWeight: "800",
                      color: "#20242a",
                      marginBottom: 10,
                      textTransform: "uppercase",
                      letterSpacing: 0.4,
                    },
                    isDark && { color: colors.text },
                  ]}
                >
                  Abonos registrados ({pedidoSeleccionado.pagos?.length || 0})
                </Text>

                {pedidoSeleccionado.pagos && pedidoSeleccionado.pagos.length > 0 ? (
                  pedidoSeleccionado.pagos.map((pago, index) => {
                    const monto = Number(pago.montoPagado ?? 0);

                    return (
                      <View
                        key={pago.id || index}
                        style={[
                          styles.abonoCard,
                          isDark && {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.abonoTop}>
                          <Text
                            style={[
                              styles.abonoMonto,
                              isDark && { color: colors.successText },
                            ]}
                          >
                            + Bs {monto.toFixed(2)}
                          </Text>
                          <View
                            style={[
                              styles.abonoMetodoBadge,
                              isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                            ]}
                          >
                            <Text
                              style={[
                                styles.abonoMetodoTexto,
                                { color: colors.primary },
                              ]}
                            >
                              {pago.tipoPago || "Pago"}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.abonoFecha,
                            isDark && { color: colors.textMuted },
                          ]}
                        >
                          {formatearFecha(pago.fechaPago)}
                        </Text>
                        {!!pago.usuario && (
                          <Text
                            style={[
                              { fontSize: 11, color: "#9aa0a6", marginTop: 2 },
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            Cobrado por: {pago.usuario}
                          </Text>
                        )}
                      </View>
                    );
                  })
                ) : (
                  <Text
                    style={[
                      { textAlign: "center", color: "#8a9098", marginVertical: 14 },
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    No hay abonos registrados para este pedido.
                  </Text>
                )}
              </ScrollView>
            ) : null}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

function formatearFecha(fechaStr: string) {
  if (!fechaStr) return "Sin fecha";
  const d = new Date(fechaStr);
  if (Number.isNaN(d.getTime())) return fechaStr;

  return d.toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}