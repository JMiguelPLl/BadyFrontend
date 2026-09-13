import AsyncStorage from "@react-native-async-storage/async-storage";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
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

import {
  abrirUbicacion,
  listarMisPedidos,
  marcarEntregado,
  obtenerDetallePedidoDistribuidor,
  ponerEnCamino,
} from "../../services/distribuidorService";
import { PedidoDistribuidor } from "../../types/distribuidor";
import { BLANCO, ROJO, styles } from "../../styles/distribuidorStyles";
import { useAppTheme } from "../../hooks/useAppTheme";
import MapaSucursal from "../../components/MapaSucursal";

export default function DistribuidorHomeScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [usuario, setUsuario] = useState<any>(null);
  const [pedidos, setPedidos] = useState<PedidoDistribuidor[]>([]);
  const [cargando, setCargando] = useState(true);
  const [refrescando, setRefrescando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string>("TODOS");
  const [busqueda, setBusqueda] = useState<string>("");

  const [pedidoSeleccionado, setPedidoSeleccionado] =
    useState<PedidoDistribuidor | null>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);
  const [procesandoEstado, setProcesandoEstado] = useState(false);
  const [error, setError] = useState("");

  const cargarDatos = useCallback(async (esRefresco = false) => {
    if (esRefresco) {
      setRefrescando(true);
    } else {
      setCargando(true);
    }

    try {
      setError("");
      const usuarioGuardado = await AsyncStorage.getItem("usuario");
      if (usuarioGuardado) {
        setUsuario(JSON.parse(usuarioGuardado));
      }

      const respuesta = await listarMisPedidos();
      setPedidos(respuesta);
    } catch (e) {
      setError(
        e instanceof Error
          ? e.message
          : "Error al cargar los pedidos asignados."
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

  const conteos = useMemo(() => {
    const asignados = pedidos.filter(
      (p) => p.estadoPedido === "Asignado"
    ).length;
    const enCamino = pedidos.filter(
      (p) => p.estadoPedido === "EnCamino"
    ).length;
    const porConfirmar = pedidos.filter(
      (p) => p.estadoPedido === "PorConfirmarEntrega"
    ).length;
    const entregados = pedidos.filter(
      (p) => p.estadoPedido === "Entregado"
    ).length;
    const devueltos = pedidos.filter(
      (p) => p.estadoPedido === "Devuelto" || Boolean(p.motivoDevolucion)
    ).length;

    return {
      total: pedidos.length,
      asignados,
      enCamino,
      porConfirmar,
      entregados,
      devueltos,
      activos: asignados + enCamino,
    };
  }, [pedidos]);

  const pedidosFiltrados = useMemo(() => {
    return pedidos.filter((pedido) => {
      // Filtro por chip de estado
      if (filtroEstado === "ASIGNADOS" && pedido.estadoPedido !== "Asignado") {
        return false;
      }
      if (filtroEstado === "EN_CAMINO" && pedido.estadoPedido !== "EnCamino") {
        return false;
      }
      if (
        filtroEstado === "POR_CONFIRMAR" &&
        pedido.estadoPedido !== "PorConfirmarEntrega"
      ) {
        return false;
      }
      if (
        filtroEstado === "ENTREGADOS" &&
        pedido.estadoPedido !== "Entregado"
      ) {
        return false;
      }
      if (
        filtroEstado === "DEVUELTOS" &&
        pedido.estadoPedido !== "Devuelto" &&
        !pedido.motivoDevolucion
      ) {
        return false;
      }

      // Filtro por texto de búsqueda
      if (busqueda.trim()) {
        const query = busqueda.trim().toLowerCase();
        const coincideId = pedido.idPedido.toString().includes(query);
        const coincideCliente = (pedido.cliente || "")
          .toLowerCase()
          .includes(query);
        const coincideSucursal = (pedido.sucursal || "")
          .toLowerCase()
          .includes(query);
        const coincideVehiculo = (pedido.vehiculo || "")
          .toLowerCase()
          .includes(query);
        const coincideMotivo = (pedido.motivoDevolucion || "")
          .toLowerCase()
          .includes(query);

        return (
          coincideId ||
          coincideCliente ||
          coincideSucursal ||
          coincideVehiculo ||
          coincideMotivo
        );
      }

      return true;
    });
  }, [pedidos, filtroEstado, busqueda]);

  const abrirDetalle = async (pedido: PedidoDistribuidor) => {
    try {
      setCargandoDetalle(true);
      setPedidoSeleccionado(pedido);

      const detalle = await obtenerDetallePedidoDistribuidor(
        pedido.idAsignacionPedido
      );
      setPedidoSeleccionado(detalle);
    } catch (e) {
      setPedidoSeleccionado(pedido);
      Alert.alert(
        "Detalle de pedido",
        e instanceof Error
          ? e.message
          : "No se pudo cargar el detalle completo del pedido."
      );
    } finally {
      setCargandoDetalle(false);
    }
  };

  const refrescarDetalle = async (idAsignacionPedido: number) => {
    try {
      const detalle = await obtenerDetallePedidoDistribuidor(
        idAsignacionPedido
      );
      setPedidoSeleccionado(detalle);

      setPedidos((actuales) =>
        actuales.map((p) =>
          p.idAsignacionPedido === idAsignacionPedido
            ? { ...p, ...detalle }
            : p
        )
      );
    } catch {
      await cargarDatos(true);
    }
  };

  const cambiarEstado = async (
    pedido: PedidoDistribuidor,
    accion: "camino" | "entregado"
  ) => {
    try {
      setProcesandoEstado(true);

      if (accion === "camino") {
        await ponerEnCamino(pedido.idAsignacionPedido);
        await refrescarDetalle(pedido.idAsignacionPedido);

        Alert.alert(
          "Pedido en camino",
          "El pedido ha sido marcado como En Camino."
        );
        return;
      }

      await marcarEntregado(pedido.idAsignacionPedido);
      await refrescarDetalle(pedido.idAsignacionPedido);

      Alert.alert(
        "Entrega registrada",
        "El pedido fue marcado como entregado. El cliente ahora confirmará la recepción."
      );
    } catch (e) {
      Alert.alert(
        "Error",
        e instanceof Error
          ? e.message
          : "No se pudo actualizar el estado del pedido."
      );
    } finally {
      setProcesandoEstado(false);
    }
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();
    if (hora >= 5 && hora < 12) return "Buenos días";
    if (hora >= 12 && hora < 19) return "Buenas tardes";
    return "Buenas noches";
  };

  if (cargando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={ROJO} />
        <Text style={styles.loadingText}>Cargando pedidos asignados...</Text>
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
        data={pedidosFiltrados}
        keyExtractor={(p) =>
          String(p.idAsignacionPedido || p.idPedido)
        }
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
            {/* Encabezado Superior */}
            <View style={styles.header}>
              <View>
                <Text
                  style={[
                    styles.greeting,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  {obtenerSaludo()}
                </Text>
                <Text
                  style={[
                    styles.userName,
                    isDark && { color: colors.text },
                  ]}
                >
                  {usuario?.nombre || "Distribuidor"} 👋
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
                  <Ionicons name="car-outline" size={24} color={BLANCO} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.heroTitle}>Panel de Entregas</Text>
                  <Text style={styles.heroSubtitle}>
                    Gestión de pedidos en ruta y sucursales
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
                    {conteos.total}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      isDark && { color: "rgba(255, 255, 255, 0.85)" },
                    ]}
                  >
                    Asignados
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
                    {conteos.enCamino}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      isDark && { color: "rgba(255, 255, 255, 0.85)" },
                    ]}
                  >
                    En camino
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
                    {conteos.entregados}
                  </Text>
                  <Text
                    style={[
                      styles.statLabel,
                      isDark && { color: "rgba(255, 255, 255, 0.85)" },
                    ]}
                  >
                    Entregados
                  </Text>
                </View>
              </View>
            </View>

            {/* Barra de Búsqueda */}
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
                placeholder="Buscar por # pedido, cliente o sucursal..."
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

            {/* Filtros Horizontales por Estado */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.filterScroll}
              contentContainerStyle={styles.filterContainer}
            >
              <Pressable
                style={[
                  styles.filterChip,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  filtroEstado === "TODOS" && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setFiltroEstado("TODOS")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isDark && { color: colors.textSecondary },
                    filtroEstado === "TODOS" && styles.filterChipTextActive,
                  ]}
                >
                  Todos ({conteos.total})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  filtroEstado === "ASIGNADOS" && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setFiltroEstado("ASIGNADOS")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isDark && { color: colors.textSecondary },
                    filtroEstado === "ASIGNADOS" &&
                      styles.filterChipTextActive,
                  ]}
                >
                  Asignados ({conteos.asignados})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  filtroEstado === "EN_CAMINO" && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setFiltroEstado("EN_CAMINO")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isDark && { color: colors.textSecondary },
                    filtroEstado === "EN_CAMINO" &&
                      styles.filterChipTextActive,
                  ]}
                >
                  En camino ({conteos.enCamino})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  filtroEstado === "POR_CONFIRMAR" && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setFiltroEstado("POR_CONFIRMAR")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isDark && { color: colors.textSecondary },
                    filtroEstado === "POR_CONFIRMAR" &&
                      styles.filterChipTextActive,
                  ]}
                >
                  Por confirmar ({conteos.porConfirmar})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  filtroEstado === "ENTREGADOS" && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setFiltroEstado("ENTREGADOS")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isDark && { color: colors.textSecondary },
                    filtroEstado === "ENTREGADOS" &&
                      styles.filterChipTextActive,
                  ]}
                >
                  Entregados ({conteos.entregados})
                </Text>
              </Pressable>

              <Pressable
                style={[
                  styles.filterChip,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  filtroEstado === "DEVUELTOS" && {
                    backgroundColor: "#dc2626",
                    borderColor: "#dc2626",
                  },
                ]}
                onPress={() => setFiltroEstado("DEVUELTOS")}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isDark && { color: colors.textSecondary },
                    filtroEstado === "DEVUELTOS" && styles.filterChipTextActive,
                  ]}
                >
                  Devueltos ({conteos.devueltos})
                </Text>
              </Pressable>
            </ScrollView>

            {/* Error si ocurre */}
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

            {/* Título de Sección */}
            <View style={styles.sectionRow}>
              <Text
                style={[
                  styles.sectionTitle,
                  isDark && { color: colors.text },
                ]}
              >
                Entregas asignadas
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
                  {pedidosFiltrados.length}
                </Text>
              </View>
            </View>
          </>
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="cube-outline" size={38} color={ROJO} />
            </View>
            <Text style={styles.emptyTitle}>
              No hay pedidos que mostrar
            </Text>
            <Text style={styles.emptyDescription}>
              {busqueda
                ? "No se encontraron coincidencias para tu búsqueda."
                : "No tienes pedidos asignados en este estado actualmente."}
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const colorEstado = obtenerColorEstado(item.estadoPedido);

          return (
            <View
              style={[
                styles.card,
                isDark && {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Parte Superior */}
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
                    Pedido #{item.idPedido}
                  </Text>
                  <Text
                    style={[
                      styles.orderDate,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    {formatearFecha(item.fechaAsignacion || item.fechaPedido)}
                  </Text>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: colorEstado.fondo },
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      { color: colorEstado.texto },
                    ]}
                  >
                    {formatearTextoEstado(item.estadoPedido)}
                  </Text>
                </View>
              </View>

              {/* Contenido / Datos de la entrega */}
              <View style={styles.cardBody}>
                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconBox,
                      isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                    ]}
                  >
                    <Ionicons
                      name="person-outline"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Cliente
                    </Text>
                    <Text
                      style={[
                        styles.infoText,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {item.cliente}
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
                    <Ionicons
                      name="storefront-outline"
                      size={16}
                      color={colors.primary}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Sucursal
                    </Text>
                    <Text
                      style={[
                        styles.infoText,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {item.sucursal}
                    </Text>
                  </View>
                </View>

                {!!item.vehiculo && (
                  <View style={styles.infoRow}>
                    <View
                      style={[
                        styles.infoIconBox,
                        isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                      ]}
                    >
                      <Ionicons
                        name="car-outline"
                        size={16}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text
                        style={[
                          styles.infoLabel,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Vehículo asignado
                      </Text>
                      <Text
                        style={[
                          styles.infoText,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {item.vehiculo}
                        {item.placa ? ` · ${item.placa}` : ""}
                      </Text>
                    </View>
                  </View>
                )}

                {!!item.cantidadTotalProductos && (
                  <View style={styles.infoRow}>
                    <View
                      style={[
                        styles.infoIconBox,
                        isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                      ]}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={16}
                        color={colors.primary}
                      />
                    </View>
                    <View style={styles.infoContent}>
                      <Text
                        style={[
                          styles.infoLabel,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Carga total
                      </Text>
                      <Text
                        style={[
                          styles.infoText,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {item.cantidadTotalProductos} unidades
                      </Text>
                    </View>
                  </View>
                )}

                {/* Justificación de Pedido Devuelto si aplica */}
                {(item.estadoPedido === "Devuelto" ||
                  !!item.motivoDevolucion) && (
                  <View
                    style={{
                      marginTop: 10,
                      padding: 11,
                      borderRadius: 12,
                      backgroundColor: isDark
                        ? "rgba(220, 38, 38, 0.16)"
                        : "#fef2f2",
                      borderWidth: 1,
                      borderColor: isDark
                        ? "rgba(220, 38, 38, 0.35)"
                        : "#fca5a5",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        marginBottom: 4,
                      }}
                    >
                      <Ionicons
                        name="alert-circle"
                        size={17}
                        color={isDark ? "#f87171" : "#dc2626"}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "800",
                          color: isDark ? "#f87171" : "#dc2626",
                        }}
                      >
                        Devuelto por el cliente
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 12,
                        color: isDark ? "#fca5a5" : "#991b1b",
                        fontWeight: "600",
                        lineHeight: 17,
                      }}
                    >
                      Motivo: {item.motivoDevolucion || "No especificado"}
                    </Text>
                    {!!item.fechaDevolucion && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: isDark
                            ? "rgba(252, 165, 165, 0.8)"
                            : "#b91c1c",
                          marginTop: 3,
                        }}
                      >
                        Fecha: {formatearFecha(item.fechaDevolucion)}
                      </Text>
                    )}
                  </View>
                )}
              </View>

              {/* Botones de acción */}
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
                  onPress={() => abrirDetalle(item)}
                >
                  <Ionicons
                    name="eye-outline"
                    size={17}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.btnSoftText,
                      { color: colors.primary },
                    ]}
                  >
                    Ver detalle
                  </Text>
                </Pressable>

                {!!item.ubicacion && (
                  <Pressable
                    style={[styles.btn, styles.btnMap]}
                    onPress={() =>
                      abrirUbicacion(item.ubicacion).catch((e) =>
                        Alert.alert(
                          "Ubicación",
                          e instanceof Error
                            ? e.message
                            : "No se pudo abrir el mapa."
                        )
                      )
                    }
                  >
                    <Ionicons
                      name="navigate-outline"
                      size={17}
                      color="#1565c0"
                    />
                    <Text style={styles.btnMapText}>Navegar</Text>
                  </Pressable>
                )}

                {item.estadoPedido === "Asignado" && (
                  <Pressable
                    style={[
                      styles.btn,
                      styles.btnPrimary,
                      { backgroundColor: colors.primary },
                    ]}
                    onPress={() => cambiarEstado(item, "camino")}
                  >
                    <Ionicons
                      name="play-forward-outline"
                      size={17}
                      color={BLANCO}
                    />
                    <Text style={styles.btnPrimaryText}>En camino</Text>
                  </Pressable>
                )}

                {item.estadoPedido === "EnCamino" && (
                  <Pressable
                    style={[
                      styles.btn,
                      { backgroundColor: "#1e874b" },
                    ]}
                    onPress={() => cambiarEstado(item, "entregado")}
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={17}
                      color={BLANCO}
                    />
                    <Text style={styles.btnPrimaryText}>Entregar</Text>
                  </Pressable>
                )}
              </View>
            </View>
          );
        }}
      />

      {/* Modal de Detalle de Pedido */}
      <Modal
        visible={!!pedidoSeleccionado}
        transparent
        animationType="slide"
        onRequestClose={() => setPedidoSeleccionado(null)}
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
              <View>
                <Text
                  style={[
                    styles.modalTitle,
                    isDark && { color: colors.text },
                  ]}
                >
                  Pedido #{pedidoSeleccionado?.idPedido}
                </Text>
                <Text
                  style={[
                    { color: "#8a9098", fontSize: 12, marginTop: 2 },
                    isDark && { color: colors.textMuted },
                  ]}
                >
                  {formatearFecha(
                    pedidoSeleccionado?.fechaAsignacion ||
                      pedidoSeleccionado?.fechaPedido ||
                      ""
                  )}
                </Text>
              </View>

              <Pressable
                style={[
                  styles.modalCloseBtn,
                  isDark && { backgroundColor: colors.surfaceElevated },
                ]}
                onPress={() => setPedidoSeleccionado(null)}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? colors.textSecondary : "#555"}
                />
              </Pressable>
            </View>

            {cargandoDetalle ? (
              <View
                style={{
                  minHeight: 260,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={[
                    styles.loadingText,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cargando productos y detalles...
                </Text>
              </View>
            ) : (
              <ScrollView
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              >
                {pedidoSeleccionado && (
                  <>
                    {/* Alerta Destacada si el Pedido fue Devuelto */}
                    {(pedidoSeleccionado.estadoPedido === "Devuelto" ||
                      !!pedidoSeleccionado.motivoDevolucion) && (
                      <View
                        style={[
                          styles.modalSection,
                          {
                            backgroundColor: isDark
                              ? "rgba(220, 38, 38, 0.18)"
                              : "#fef2f2",
                            borderColor: isDark
                              ? "rgba(220, 38, 38, 0.45)"
                              : "#f87171",
                            borderWidth: 1.5,
                          },
                        ]}
                      >
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 8,
                            marginBottom: 8,
                          }}
                        >
                          <Ionicons
                            name="alert-circle"
                            size={22}
                            color={isDark ? "#f87171" : "#dc2626"}
                          />
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "900",
                              color: isDark ? "#f87171" : "#dc2626",
                            }}
                          >
                            Pedido Reportado como Devuelto
                          </Text>
                        </View>

                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "800",
                            color: isDark ? "#fca5a5" : "#7f1d1d",
                            marginBottom: 4,
                          }}
                        >
                          Justificación del Cliente:
                        </Text>
                        <Text
                          style={{
                            fontSize: 13,
                            color: isDark ? "#ffffff" : "#991b1b",
                            lineHeight: 18,
                            fontWeight: "600",
                          }}
                        >
                          {pedidoSeleccionado.motivoDevolucion ||
                            "El cliente reportó no haber recibido el pedido."}
                        </Text>

                        {!!pedidoSeleccionado.fechaDevolucion && (
                          <Text
                            style={{
                              fontSize: 11,
                              color: isDark ? "#fca5a5" : "#b91c1c",
                              marginTop: 8,
                              fontWeight: "500",
                            }}
                          >
                            Fecha de devolución:{" "}
                            {formatearFecha(
                              pedidoSeleccionado.fechaDevolucion
                            )}
                          </Text>
                        )}
                      </View>
                    )}

                    {/* Información General */}
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
                        Información de Entrega
                      </Text>

                      <View style={styles.modalItemRow}>
                        <Text
                          style={[
                            styles.modalItemLabel,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Cliente:
                        </Text>
                        <Text
                          style={[
                            styles.modalItemValue,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {pedidoSeleccionado.cliente}
                        </Text>
                      </View>

                      <View style={styles.modalItemRow}>
                        <Text
                          style={[
                            styles.modalItemLabel,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Sucursal:
                        </Text>
                        <Text
                          style={[
                            styles.modalItemValue,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {pedidoSeleccionado.sucursal}
                        </Text>
                      </View>

                      <View style={styles.modalItemRow}>
                        <Text
                          style={[
                            styles.modalItemLabel,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Ubicación:
                        </Text>
                        <Text
                          style={[
                            styles.modalItemValue,
                            { maxWidth: "60%", textAlign: "right" },
                            isDark && { color: colors.text },
                          ]}
                          numberOfLines={2}
                        >
                          {pedidoSeleccionado.ubicacion || "Sin ubicación"}
                        </Text>
                      </View>

                      <View style={styles.modalItemRow}>
                        <Text
                          style={[
                            styles.modalItemLabel,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Vehículo:
                        </Text>
                        <Text
                          style={[
                            styles.modalItemValue,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {pedidoSeleccionado.vehiculo || "No asignado"}
                          {pedidoSeleccionado.placa
                            ? ` · ${pedidoSeleccionado.placa}`
                            : ""}
                        </Text>
                      </View>

                      <View style={styles.modalItemRow}>
                        <Text
                          style={[
                            styles.modalItemLabel,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Estado:
                        </Text>
                        <Text
                          style={[
                            styles.modalItemValue,
                            {
                              color: obtenerColorEstado(
                                pedidoSeleccionado.estadoPedido
                              ).texto,
                            },
                          ]}
                        >
                          {formatearTextoEstado(
                            pedidoSeleccionado.estadoPedido
                          )}
                        </Text>
                      </View>

                      {!!pedidoSeleccionado.observacion && (
                        <View style={[styles.modalItemRow, { marginTop: 4 }]}>
                          <Text
                            style={[
                              styles.modalItemLabel,
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            Observación:
                          </Text>
                          <Text
                            style={[
                              styles.modalItemValue,
                              { maxWidth: "60%", textAlign: "right" },
                              isDark && { color: colors.text },
                            ]}
                          >
                            {pedidoSeleccionado.observacion}
                          </Text>
                        </View>
                      )}
                    </View>

                    {/* Sección de Ubicación en Mapa */}
                    {!!pedidoSeleccionado.ubicacion &&
                      pedidoSeleccionado.ubicacion.trim() !== "" &&
                      pedidoSeleccionado.ubicacion.toLowerCase() !==
                        "sin ubicación" && (
                        <View
                          style={[
                            styles.modalSection,
                            isDark && {
                              backgroundColor: colors.surfaceElevated,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              justifyContent: "space-between",
                              marginBottom: 10,
                            }}
                          >
                            <View
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 6,
                              }}
                            >
                              <Ionicons
                                name="map-outline"
                                size={16}
                                color={colors.primary}
                              />
                              <Text
                                style={[
                                  styles.modalSectionTitle,
                                  { marginBottom: 0 },
                                  isDark && { color: colors.textSecondary },
                                ]}
                              >
                                Ubicación en el Mapa
                              </Text>
                            </View>

                            <Pressable
                              style={{
                                flexDirection: "row",
                                alignItems: "center",
                                gap: 4,
                                backgroundColor: isDark
                                  ? "rgba(21, 101, 192, 0.22)"
                                  : "#eef7ff",
                                paddingHorizontal: 10,
                                paddingVertical: 5,
                                borderRadius: 8,
                                borderWidth: 1,
                                borderColor: isDark
                                  ? "rgba(21, 101, 192, 0.45)"
                                  : "#cce5ff",
                              }}
                              onPress={() =>
                                abrirUbicacion(
                                  pedidoSeleccionado.ubicacion
                                ).catch((e) =>
                                  Alert.alert(
                                    "Ubicación",
                                    e instanceof Error
                                      ? e.message
                                      : "No se pudo abrir."
                                  )
                                )
                              }
                            >
                              <Ionicons
                                name="open-outline"
                                size={13}
                                color="#1565c0"
                              />
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: "700",
                                  color: "#1565c0",
                                }}
                              >
                                Abrir Google Maps
                              </Text>
                            </Pressable>
                          </View>

                          {(() => {
                            const coords = extraerCoordenadas(
                              pedidoSeleccionado.ubicacion
                            );

                            return (
                              <>
                                <View
                                  style={{
                                    borderRadius: 12,
                                    overflow: "hidden",
                                    borderWidth: 1,
                                    borderColor: isDark
                                      ? colors.border
                                      : "#e5e7eb",
                                    marginBottom: 8,
                                  }}
                                >
                                  <MapaSucursal
                                    coordenada={
                                      coords || {
                                        latitude: -17.7833,
                                        longitude: -63.1821,
                                      }
                                    }
                                    soloLectura={true}
                                    altura={220}
                                  />
                                </View>

                                <Text
                                  style={{
                                    fontSize: 12,
                                    color: isDark
                                      ? colors.textSecondary
                                      : "#4b5563",
                                    lineHeight: 16,
                                    fontWeight: "500",
                                  }}
                                  numberOfLines={2}
                                >
                                  📍 {pedidoSeleccionado.ubicacion}
                                </Text>
                              </>
                            );
                          })()}
                        </View>
                      )}

                    {/* Lista de Productos */}
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
                        Productos del Pedido
                      </Text>

                      {pedidoSeleccionado.detalles.length === 0 ? (
                        <Text
                          style={[
                            {
                              color: "#8a9097",
                              fontSize: 13,
                              paddingVertical: 8,
                              textAlign: "center",
                            },
                            isDark && { color: colors.textMuted },
                          ]}
                        >
                          No se encontraron detalles de productos.
                        </Text>
                      ) : (
                        pedidoSeleccionado.detalles.map((prod) => (
                          <View
                            key={prod.id || prod.idProducto}
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
                                {prod.producto}
                              </Text>
                              <Text
                                style={[
                                  styles.productUnitPrice,
                                  isDark && { color: colors.textMuted },
                                ]}
                              >
                                Bs {prod.precioUnitario.toFixed(2)} c/u
                              </Text>
                            </View>

                            <View style={{ alignItems: "flex-end" }}>
                              <View
                                style={[
                                  styles.productQtyBadge,
                                  isDark && {
                                    backgroundColor: "rgba(200, 35, 27, 0.22)",
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.productQtyText,
                                    { color: colors.primary },
                                  ]}
                                >
                                  Cant: {prod.cantidad}
                                </Text>
                              </View>
                              <Text
                                style={[
                                  styles.productSubtotal,
                                  isDark && { color: colors.text },
                                ]}
                              >
                                Bs {prod.subtotal.toFixed(2)}
                              </Text>
                            </View>
                          </View>
                        ))
                      )}
                    </View>

                    {/* Resumen Total */}
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
                        TOTAL DEL PEDIDO
                      </Text>
                      <Text
                        style={[
                          styles.totalValue,
                          { color: colors.primary },
                        ]}
                      >
                        Bs {pedidoSeleccionado.total.toFixed(2)}
                      </Text>
                    </View>

                    {/* Acciones del Modal */}
                    {!!pedidoSeleccionado.ubicacion && (
                      <Pressable
                        style={[
                          styles.btn,
                          styles.btnMap,
                          { minHeight: 48, marginBottom: 10 },
                        ]}
                        onPress={() =>
                          abrirUbicacion(pedidoSeleccionado.ubicacion).catch(
                            (e) =>
                              Alert.alert(
                                "Ubicación",
                                e instanceof Error
                                  ? e.message
                                  : "No se pudo abrir."
                              )
                          )
                        }
                      >
                        <Ionicons
                          name="navigate-outline"
                          size={18}
                          color="#1565c0"
                        />
                        <Text style={styles.btnMapText}>
                          ABRIR UBICACIÓN EN GOOGLE MAPS
                        </Text>
                      </Pressable>
                    )}

                    {pedidoSeleccionado.estadoPedido === "Asignado" && (
                      <Pressable
                        disabled={procesandoEstado}
                        style={[
                          styles.btn,
                          styles.btnPrimary,
                          { minHeight: 50 },
                        ]}
                        onPress={() =>
                          cambiarEstado(pedidoSeleccionado, "camino")
                        }
                      >
                        {procesandoEstado ? (
                          <ActivityIndicator color={BLANCO} />
                        ) : (
                          <>
                            <Ionicons
                              name="play-forward-outline"
                              size={19}
                              color={BLANCO}
                            />
                            <Text style={styles.btnPrimaryText}>
                              INICIAR ENTREGA (EN CAMINO)
                            </Text>
                          </>
                        )}
                      </Pressable>
                    )}

                    {pedidoSeleccionado.estadoPedido === "EnCamino" && (
                      <Pressable
                        disabled={procesandoEstado}
                        style={[
                          styles.btn,
                          {
                            backgroundColor: "#1e874b",
                            minHeight: 50,
                          },
                        ]}
                        onPress={() =>
                          cambiarEstado(pedidoSeleccionado, "entregado")
                        }
                      >
                        {procesandoEstado ? (
                          <ActivityIndicator color={BLANCO} />
                        ) : (
                          <>
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={19}
                              color={BLANCO}
                            />
                            <Text style={styles.btnPrimaryText}>
                              CONFIRMAR ENTREGA
                            </Text>
                          </>
                        )}
                      </Pressable>
                    )}

                    {pedidoSeleccionado.estadoPedido ===
                      "PorConfirmarEntrega" && (
                      <View
                        style={{
                          backgroundColor: "#fff5dd",
                          padding: 14,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: "#fae1a7",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#a86c00",
                            fontWeight: "800",
                            fontSize: 13,
                            textAlign: "center",
                          }}
                        >
                          ENTREGA REGISTRADA · ESPERANDO CONFIRMACIÓN DEL CLIENTE
                        </Text>
                      </View>
                    )}

                    {pedidoSeleccionado.estadoPedido === "Entregado" && (
                      <View
                        style={{
                          backgroundColor: "#e9f8ef",
                          padding: 14,
                          borderRadius: 14,
                          borderWidth: 1,
                          borderColor: "#c3edd4",
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            color: "#1e874b",
                            fontWeight: "800",
                            fontSize: 13,
                            textAlign: "center",
                          }}
                        >
                          ✓ PEDIDO ENTREGADO CON ÉXITO
                        </Text>
                      </View>
                    )}
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

function formatearTextoEstado(estado: string) {
  switch (estado) {
    case "EnCamino":
      return "En camino";
    case "PorConfirmarEntrega":
      return "Por confirmar";
    case "Entregado":
      return "Entregado";
    case "Devuelto":
      return "Devuelto";
    case "Cancelado":
      return "Cancelado";
    case "Asignado":
      return "Asignado";
    default:
      return estado || "Asignado";
  }
}

function obtenerColorEstado(estado: string) {
  switch (estado) {
    case "EnCamino":
      return {
        fondo: "#e8f2ff",
        texto: "#1565c0",
      };
    case "PorConfirmarEntrega":
      return {
        fondo: "#fff5dd",
        texto: "#a86c00",
      };
    case "Entregado":
      return {
        fondo: "#e9f8ef",
        texto: "#1e874b",
      };
    case "Devuelto":
      return {
        fondo: "#fee2e2",
        texto: "#b91c1c",
      };
    case "Cancelado":
      return {
        fondo: "#ffeded",
        texto: "#b42318",
      };
    default:
      return {
        fondo: "#fff0ef",
        texto: ROJO,
      };
  }
}

function extraerCoordenadas(ubicacion?: string | null): {
  latitude: number;
  longitude: number;
} | null {
  if (!ubicacion || !ubicacion.trim()) return null;

  const texto = ubicacion.trim();

  // 1. Extraer de parámetros query (ej. ?q=-17.78,-63.18 o ?query=-17.78,-63.18)
  const matchQuery = texto.match(
    /[?&](?:query|q)=(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/i
  );
  if (matchQuery) {
    const lat = parseFloat(matchQuery[1]);
    const lng = parseFloat(matchQuery[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 2. Extraer de rutas URL tipo /@lat,lng
  const matchAt = texto.match(/@(-?\d{1,2}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/);
  if (matchAt) {
    const lat = parseFloat(matchAt[1]);
    const lng = parseFloat(matchAt[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { latitude: lat, longitude: lng };
    }
  }

  // 3. Extraer formato numérico estándar (ej. "-17.7833, -63.1821" o "-17.7833 -63.1821")
  const regex = /(-?\d{1,2}\.\d+)[,\s;]+(-?\d{1,3}\.\d+)/;
  const match = texto.match(regex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180) {
      return { latitude: lat, longitude: lng };
    }
  }

  return null;
}
