import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
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
  actualizarPedido,
  cancelarPedido,
  listarMisPedidos,
  listarPedidosCliente,
  listarProductosDisponibles,
  listarSucursalesCliente,
  obtenerPedidoPorId,
} from "../../services/PedidosService";
import {
  Pedido,
  ProductoPedido,
  SucursalPedido,
} from "../../types/pedido";
import Paginacion from "../../components/comun/Paginacion";
import { usePaginacion } from "../../hooks/usePaginacion";
import {
  BLANCO,
  ROJO,
  ROJO_OSCURO,
  styles,
} from "../../styles/cliente/pedidos.styles";

function MiniaturaProductoPedido({
  imagenUrl,
}: {
  imagenUrl?: string | null;
}) {
  const { colors, isDark } = useAppTheme();
  const [errorCarga, setErrorCarga] = useState(false);

  if (imagenUrl && !errorCarga) {
    return (
      <View
        style={[
          styles.productImageContainer,
          isDark && {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        <Image
          source={{ uri: imagenUrl }}
          style={styles.productImage}
          resizeMode="cover"
          onError={() => setErrorCarga(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.productIconSmall,
        isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
      ]}
    >
      <Ionicons name="cube-outline" size={20} color={colors.primary} />
    </View>
  );
}

type ModalActivo = "ninguno" | "detalle" | "editar" | "notificacionEdicion";
type Cantidades = Record<number, number>;
type EstadoFiltro =
  | "Todos"
  | "Pendiente"
  | "Asignado"
  | "EnCamino"
  | "Entregado"
  | "Devuelto"
  | "Cancelado"
  | "Editados";

const FILTROS_ESTADO: { label: string; value: EstadoFiltro }[] = [
  { label: "Todos", value: "Todos" },
  { label: "Entregados", value: "Entregado" },
  { label: "Pendientes", value: "Pendiente" },
  { label: "Devueltos", value: "Devuelto" },
  { label: "Editados", value: "Editados" },
  { label: "Cancelados", value: "Cancelado" },
  { label: "Asignados", value: "Asignado" },
  { label: "En camino", value: "EnCamino" },
];

export default function PedidosClienteScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<Pedido | null>(null);

  const [productos, setProductos] = useState<ProductoPedido[]>([]);
  const [sucursales, setSucursales] = useState<SucursalPedido[]>([]);

  const [idSucursalEditar, setIdSucursalEditar] = useState<number>(0);
  const [observacionEditar, setObservacionEditar] = useState("");
  const [cantidadesEditar, setCantidadesEditar] = useState<Cantidades>({});

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<EstadoFiltro>("Todos");

  const [modalActivo, setModalActivo] = useState<ModalActivo>("ninguno");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [procesando, setProcesando] = useState(false);
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
        throw new Error("No se encontró la información del cliente. Inicia sesión nuevamente.");
      }

      const usuario = JSON.parse(usuarioTexto);
      const clienteId = Number(usuario?.idCliente ?? usuario?.id);

      if (!clienteId) {
        throw new Error("No se pudo identificar al cliente.");
      }

      setIdCliente(clienteId);
      await cargarPedidos(clienteId);
    } catch (err) {
      setError(err instanceof Error ? err.message : "No se pudieron cargar los pedidos.");
    } finally {
      setCargando(false);
    }
  };

  const cargarPedidos = async (clienteId = idCliente, esActualizacion = false) => {
    if (!clienteId) return;

    try {
      setError("");
      if (esActualizacion) setActualizando(true);

      let respuesta = await listarPedidosCliente(clienteId);
      if (!respuesta || respuesta.length === 0) {
        try {
          respuesta = await listarMisPedidos();
        } catch {
          // ignore
        }
      }

      // Enriquecer pedidos pendientes en caso de que el listado no devuelva motivoEdicion
      const pedidosEnriquecidos = await Promise.all(
        (respuesta || []).map(async (p) => {
          if (p.estado === "Pendiente" && !p.motivoEdicion) {
            try {
              const det = await obtenerPedidoPorId(p.id);
              if (det?.motivoEdicion) {
                return {
                  ...p,
                  motivoEdicion: det.motivoEdicion,
                  total: det.total,
                  detalles:
                    det.detalles && det.detalles.length > 0
                      ? det.detalles
                      : p.detalles,
                };
              }
            } catch {
              // fallback
            }
          }
          return p;
        })
      );

      setPedidos(pedidosEnriquecidos);

      // Si hay un pedido modificado no visto aún, abrir el modal de notificación automáticamente
      try {
        const vistosRaw = await AsyncStorage.getItem(
          "@pedidos_modificados_vistos"
        );
        const vistos: Record<number, string> = vistosRaw
          ? JSON.parse(vistosRaw)
          : {};
        const noVisto = pedidosEnriquecidos.find(
          (p) =>
            p.motivoEdicion &&
            p.motivoEdicion.trim() !== "" &&
            vistos[p.id] !== p.motivoEdicion
        );
        if (noVisto) {
          const detalleCompleto = await obtenerPedidoPorId(noVisto.id).catch(
            () => noVisto
          );
          setPedidoSeleccionado(detalleCompleto);
          setModalActivo("notificacionEdicion");
        }
      } catch (e) {
        console.warn("Error al comprobar aviso de edición:", e);
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "No se pudieron cargar los pedidos."
      );
    } finally {
      setActualizando(false);
    }
  };

  // Métricas Hero
  const totalPedidos = pedidos.length;

  const cantidadEntregados = useMemo(() => {
    return pedidos.filter((p) => p.estado === "Entregado").length;
  }, [pedidos]);

  const cantidadPendientes = useMemo(() => {
    return pedidos.filter(
      (p) =>
        p.estado === "Pendiente" ||
        p.estado === "Asignado" ||
        p.estado === "EnCamino"
    ).length;
  }, [pedidos]);

  const cantidadEditados = useMemo(() => {
    return pedidos.filter(
      (p) => Boolean(p.motivoEdicion && p.motivoEdicion.trim() !== "")
    ).length;
  }, [pedidos]);

  const cantidadCancelados = useMemo(() => {
    return pedidos.filter((p) => p.estado === "Cancelado").length;
  }, [pedidos]);

  const cantidadDevueltos = useMemo(() => {
    return pedidos.filter(
      (p) => p.estado === "Devuelto" || Boolean(p.motivoDevolucion)
    ).length;
  }, [pedidos]);

  // Filtrado de pedidos
  const pedidosFiltrados = useMemo(() => {
    let lista = pedidos;

    if (filtroEstado === "Editados") {
      lista = lista.filter((p) =>
        Boolean(p.motivoEdicion && p.motivoEdicion.trim() !== "")
      );
    } else if (filtroEstado === "Devuelto") {
      lista = lista.filter(
        (p) => p.estado === "Devuelto" || Boolean(p.motivoDevolucion)
      );
    } else if (filtroEstado !== "Todos") {
      lista = lista.filter((p) => {
        const est = (p.estado || "").toLowerCase().replace(/\s+/g, "");
        const filtro = filtroEstado.toLowerCase().replace(/\s+/g, "");
        return est === filtro;
      });
    }

    if (busqueda.trim()) {
      const q = busqueda.trim().toLowerCase();
      lista = lista.filter((p) => {
        const idMatch = String(p.id).includes(q);
        const sucMatch = (p.sucursal || "").toLowerCase().includes(q);
        const motivoMatch = (p.motivoEdicion || "").toLowerCase().includes(q);
        const motivoDevMatch = (p.motivoDevolucion || "").toLowerCase().includes(q);
        const prodMatch = p.detalles?.some((d) =>
          (d.producto || "").toLowerCase().includes(q)
        );
        return (
          idMatch ||
          sucMatch ||
          motivoMatch ||
          motivoDevMatch ||
          prodMatch
        );
      });
    }

    return lista;
  }, [pedidos, filtroEstado, busqueda]);

  const {
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    setRegistrosPorPagina,
    totalPaginas,
    totalRegistros,
    datosPaginados: pedidosPaginados,
  } = usePaginacion(pedidosFiltrados);

  const verDetalle = async (pedido: Pedido) => {
    try {
      setProcesando(true);
      const pedidoCompleto = await obtenerPedidoPorId(pedido.id);
      setPedidoSeleccionado(pedidoCompleto);
      if (pedidoCompleto.motivoEdicion && pedidoCompleto.motivoEdicion.trim()) {
        setModalActivo("notificacionEdicion");
      } else {
        setModalActivo("detalle");
      }
    } catch (err) {
      Alert.alert("Error al cargar detalle", err instanceof Error ? err.message : "No se pudo consultar el pedido.");
    } finally {
      setProcesando(false);
    }
  };

  const abrirEditar = async (pedido: Pedido) => {
    if (pedido.estado !== "Pendiente") {
      Alert.alert(
        "No editable",
        `Solo los pedidos en estado Pendiente pueden ser modificados. El estado actual es ${pedido.estado}.`
      );
      return;
    }

    try {
      setProcesando(true);
      const [pedidoCompleto, productosDisp, sucursalesCliente] = await Promise.all([
        obtenerPedidoPorId(pedido.id),
        listarProductosDisponibles(),
        idCliente ? listarSucursalesCliente(idCliente) : Promise.resolve([]),
      ]);

      setPedidoSeleccionado(pedidoCompleto);
      setProductos(productosDisp);
      setSucursales(sucursalesCliente);
      setIdSucursalEditar(pedidoCompleto.idSucursal);
      setObservacionEditar(pedidoCompleto.observacion || "");

      const cantidadesMap: Cantidades = {};
      pedidoCompleto.detalles?.forEach((d) => {
        cantidadesMap[d.idProducto] = Number(d.cantidad);
      });
      setCantidadesEditar(cantidadesMap);

      setModalActivo("editar");
    } catch (err) {
      Alert.alert("No se pudo editar", err instanceof Error ? err.message : "Ocurrió un error al cargar datos.");
    } finally {
      setProcesando(false);
    }
  };

  const cambiarCantidad = (idProducto: number, delta: number) => {
    setCantidadesEditar((prev) => {
      const actual = prev[idProducto] ?? 0;
      const nuevo = Math.max(0, actual + delta);
      return { ...prev, [idProducto]: nuevo };
    });
  };

  const totalCalculadoEdicion = useMemo(() => {
    return productos.reduce((sum, prod) => {
      const cant = cantidadesEditar[prod.id] ?? 0;
      return sum + cant * Number(prod.precio ?? 0);
    }, 0);
  }, [productos, cantidadesEditar]);

  const guardarCambios = async () => {
    if (!pedidoSeleccionado || !idCliente) return;

    const detallesAEnviar = Object.entries(cantidadesEditar)
      .map(([idProd, cant]) => ({
        idProducto: Number(idProd),
        cantidad: cant,
      }))
      .filter((d) => d.cantidad > 0);

    if (detallesAEnviar.length === 0) {
      Alert.alert("Detalle vacío", "Debes seleccionar al menos un producto con cantidad mayor a cero.");
      return;
    }

    try {
      setProcesando(true);
      const res = await actualizarPedido(pedidoSeleccionado.id, {
        idCliente: pedidoSeleccionado.idCliente,
        idSucursal: idSucursalEditar,
        observacion: observacionEditar.trim() || undefined,
        detalles: detallesAEnviar,
      });

      setModalActivo("ninguno");
      await cargarPedidos(idCliente, true);
      Alert.alert("Pedido actualizado", res.message || "Tu pedido fue modificado correctamente.");
    } catch (err) {
      Alert.alert("Error al actualizar", err instanceof Error ? err.message : "No se pudo actualizar el pedido.");
    } finally {
      setProcesando(false);
    }
  };

  const confirmarCancelacion = (pedido: Pedido) => {
    if (pedido.estado !== "Pendiente") {
      Alert.alert(
        "No cancelable",
        `Solo los pedidos pendientes pueden cancelarse. El estado actual es ${pedido.estado}.`
      );
      return;
    }

    Alert.alert(
      "Cancelar pedido",
      `¿Estás seguro de cancelar el Pedido #${pedido.id}? Esta acción no se puede deshacer.`,
      [
        { text: "No, mantener", style: "cancel" },
        {
          text: "Sí, cancelar",
          style: "destructive",
          onPress: async () => {
            try {
              setProcesando(true);
              const res = await cancelarPedido(pedido.id);
              await cargarPedidos(idCliente, true);
              Alert.alert("Pedido cancelado", res.message || "Tu pedido ha sido cancelado.");
            } catch (err) {
              Alert.alert("Error", err instanceof Error ? err.message : "No se pudo cancelar el pedido.");
            } finally {
              setProcesando(false);
            }
          },
        },
      ]
    );
  };

  const obtenerConfiguracionEstado = (estado: string) => {
    const est = (estado || "").toLowerCase().replace(/\s+/g, "");
    switch (est) {
      case "entregado":
        return {
          colorTexto: isDark ? "#4ade80" : "#15803d",
          fondo: isDark ? "rgba(21, 128, 61, 0.22)" : "#ecfdf3",
          texto: "ENTREGADO",
        };
      case "encamino":
        return {
          colorTexto: isDark ? "#60a5fa" : "#1d4ed8",
          fondo: isDark ? "rgba(29, 78, 216, 0.22)" : "#eff6ff",
          texto: "EN CAMINO",
        };
      case "asignado":
        return {
          colorTexto: isDark ? "#818cf8" : "#4338ca",
          fondo: isDark ? "rgba(67, 56, 202, 0.22)" : "#eef2ff",
          texto: "ASIGNADO",
        };
      case "pendiente":
        return {
          colorTexto: isDark ? "#fb923c" : "#c2410c",
          fondo: isDark ? "rgba(194, 65, 12, 0.22)" : "#fff7ed",
          texto: "PENDIENTE",
        };
      case "cancelado":
        return {
          colorTexto: colors.dangerText,
          fondo: isDark ? colors.dangerBg : "#fff1f2",
          texto: "CANCELADO",
        };
      case "devuelto":
        return {
          colorTexto: isDark ? "#f87171" : "#b91c1c",
          fondo: isDark ? "rgba(220, 38, 38, 0.22)" : "#fee2e2",
          texto: "DEVUELTO",
        };
      default:
        return {
          colorTexto: isDark ? colors.textSecondary : "#4b5563",
          fondo: isDark ? colors.surfaceElevated : "#f3f4f6",
          texto: estado.toUpperCase(),
        };
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
          Cargando tus pedidos...
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
            onRefresh={() => cargarPedidos(idCliente, true)}
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
              Mis Pedidos
            </Text>
            <Text
              style={[
                styles.subtitulo,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Historial y seguimiento de compras
            </Text>
          </View>

          <Pressable
            style={[
              styles.btnNuevoPedido,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => router.push("/cliente/crear-pedido")}
          >
            <Ionicons name="add-circle-outline" size={18} color={BLANCO} />
            <Text style={styles.btnNuevoPedidoTexto}>Nuevo</Text>
          </Pressable>
        </View>

        {/* Hero Banner */}
        <View style={styles.heroBanner}>
          <View style={styles.heroDecorCircle1} />
          <View style={styles.heroDecorCircle2} />

          <View style={styles.heroHeaderRow}>
            <View style={styles.heroIconCircle}>
              <Ionicons name="cart-outline" size={24} color={BLANCO} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.heroTitle}>Resumen de Compras</Text>
              <Text style={styles.heroSubtitle}>
                {pedidos.length} {pedidos.length === 1 ? "pedido registrado" : "pedidos registrados"}
              </Text>
            </View>
          </View>

          {/* Métricas Solicitadas: Total Pedidos, Entregados, Pendientes, Editados y Cancelados */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.statsScrollContainer}
            style={styles.statsScroll}
          >
            {/* Total Pedidos */}
            <Pressable
              onPress={() => setFiltroEstado("Todos")}
              style={[
                styles.statCardHero,
                filtroEstado === "Todos" && styles.statCardHeroActive,
                isDark && {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.25)",
                },
              ]}
            >
              <View style={styles.statCardHeader}>
                <Ionicons name="receipt-outline" size={15} color={BLANCO} />
                <Text style={styles.statCardValue}>{totalPedidos}</Text>
              </View>
              <Text style={styles.statCardLabel}>Total pedidos</Text>
            </Pressable>

            {/* Entregados */}
            <Pressable
              onPress={() => setFiltroEstado("Entregado")}
              style={[
                styles.statCardHero,
                filtroEstado === "Entregado" && styles.statCardHeroActive,
                isDark && {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.25)",
                },
              ]}
            >
              <View style={styles.statCardHeader}>
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={16}
                  color="#86efac"
                />
                <Text style={styles.statCardValue}>{cantidadEntregados}</Text>
              </View>
              <Text style={styles.statCardLabel}>Entregados</Text>
            </Pressable>

            {/* Pendientes */}
            <Pressable
              onPress={() => setFiltroEstado("Pendiente")}
              style={[
                styles.statCardHero,
                filtroEstado === "Pendiente" && styles.statCardHeroActive,
                isDark && {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.25)",
                },
              ]}
            >
              <View style={styles.statCardHeader}>
                <Ionicons name="time-outline" size={15} color="#fde047" />
                <Text style={styles.statCardValue}>{cantidadPendientes}</Text>
              </View>
              <Text style={styles.statCardLabel}>Pendientes</Text>
            </Pressable>

            {/* Notificados de Edición */}
            <Pressable
              onPress={() => setFiltroEstado("Editados")}
              style={[
                styles.statCardHero,
                filtroEstado === "Editados" && styles.statCardHeroActive,
                isDark && {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.25)",
                },
              ]}
            >
              <View style={styles.statCardHeader}>
                <Ionicons
                  name="notifications-outline"
                  size={15}
                  color="#fed7aa"
                />
                <Text style={styles.statCardValue}>{cantidadEditados}</Text>
              </View>
              <Text style={styles.statCardLabel}>Editados</Text>
            </Pressable>

            {/* Devueltos */}
            <Pressable
              onPress={() => setFiltroEstado("Devuelto")}
              style={[
                styles.statCardHero,
                filtroEstado === "Devuelto" && styles.statCardHeroActive,
                isDark && {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.25)",
                },
              ]}
            >
              <View style={styles.statCardHeader}>
                <Ionicons
                  name="arrow-undo-circle-outline"
                  size={16}
                  color="#fca5a5"
                />
                <Text style={styles.statCardValue}>{cantidadDevueltos}</Text>
              </View>
              <Text style={styles.statCardLabel}>Devueltos</Text>
            </Pressable>

            {/* Cancelados */}
            <Pressable
              onPress={() => setFiltroEstado("Cancelado")}
              style={[
                styles.statCardHero,
                filtroEstado === "Cancelado" && styles.statCardHeroActive,
                isDark && {
                  backgroundColor: "rgba(255, 255, 255, 0.12)",
                  borderColor: "rgba(255, 255, 255, 0.25)",
                },
              ]}
            >
              <View style={styles.statCardHeader}>
                <Ionicons
                  name="close-circle-outline"
                  size={15}
                  color="#fca5a5"
                />
                <Text style={styles.statCardValue}>{cantidadCancelados}</Text>
              </View>
              <Text style={styles.statCardLabel}>Cancelados</Text>
            </Pressable>
          </ScrollView>
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
            placeholder="Buscar por # pedido, sucursal o producto..."
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

        {/* Chips de Filtrado Horizontal */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterScroll}
          contentContainerStyle={styles.filterContainer}
        >
          {FILTROS_ESTADO.map((f) => {
            const activo = filtroEstado === f.value;
            return (
              <Pressable
                key={f.value}
                style={[
                  styles.filterChip,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                  activo && {
                    backgroundColor: colors.primary,
                    borderColor: colors.primary,
                  },
                ]}
                onPress={() => setFiltroEstado(f.value)}
              >
                <Text
                  style={[
                    styles.filterChipText,
                    isDark && { color: colors.textSecondary },
                    activo && styles.filterChipTextActive,
                  ]}
                >
                  {f.label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Lista de Pedidos */}
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
              <Ionicons name="receipt-outline" size={38} color={colors.primary} />
            </View>
            <Text
              style={[
                styles.emptyTitle,
                isDark && { color: colors.text },
              ]}
            >
              No hay pedidos para mostrar
            </Text>
            <Text
              style={[
                styles.emptyDescription,
                isDark && { color: colors.textSecondary },
              ]}
            >
              {busqueda
                ? "No se encontraron pedidos que coincidan con la búsqueda."
                : "Aún no tienes pedidos con el filtro seleccionado."}
            </Text>
          </View>
        ) : (
          pedidosPaginados.map((pedido) => {
            const conf = obtenerConfiguracionEstado(pedido.estado);
            const totalProductos = (pedido.detalles || []).reduce((acc, d) => acc + Number(d.cantidad ?? 0), 0);
            const saldoPend = Number(pedido.saldoPendiente ?? 0);
            const esPendiente = pedido.estado === "Pendiente";

            return (
              <View
                key={pedido.id}
                style={[
                  styles.tarjetaPedido,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                {/* Cabecera */}
                <View
                  style={[
                    styles.pedidoEncabezado,
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
                      Pedido #{pedido.id}
                    </Text>
                    <Text
                      style={[
                        styles.pedidoFecha,
                        isDark && { color: colors.textMuted },
                      ]}
                    >
                      {formatearFecha(pedido.fechaPedido || (pedido as any).fecha)}
                    </Text>
                  </View>

                  <View style={[styles.estadoBadge, { backgroundColor: conf.fondo }]}>
                    <Text style={[styles.estadoBadgeTexto, { color: conf.colorTexto }]}>
                      {conf.texto}
                    </Text>
                  </View>
                </View>

                {/* Datos de Sucursal y Carga */}
                <View style={styles.infoRow}>
                  <View
                    style={[
                      styles.infoIconBox,
                      isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                    ]}
                  >
                    <Ionicons name="storefront-outline" size={17} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Sucursal de entrega
                    </Text>
                    <Text
                      style={[
                        styles.infoText,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {pedido.sucursal || "Central"}
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
                    <Ionicons name="cube-outline" size={17} color={colors.primary} />
                  </View>
                  <View style={styles.infoContent}>
                    <Text
                      style={[
                        styles.infoLabel,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Contenido
                    </Text>
                    <Text
                      style={[
                        styles.infoText,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {totalProductos} {totalProductos === 1 ? "unidad" : "unidades"} ({pedido.detalles?.length || 0} productos)
                    </Text>
                  </View>
                </View>

                {/* Resumen de Montos */}
                <View
                  style={[
                    styles.resumenMontos,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View>
                    <Text
                      style={[
                        styles.montoEtiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      TOTAL DEL PEDIDO
                    </Text>
                    <Text
                      style={[
                        styles.montoTotal,
                        { color: colors.primary },
                      ]}
                    >
                      Bs {Number(pedido.total ?? 0).toFixed(2)}
                    </Text>
                  </View>

                  {pedido.estado === "Entregado" && (
                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[
                          styles.montoEtiqueta,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        ESTADO DE PAGO
                      </Text>
                      {saldoPend <= 0 ? (
                        <Text
                          style={[
                            styles.montoPagado,
                            isDark && { color: colors.successText },
                          ]}
                        >
                          Saldado ✓
                        </Text>
                      ) : (
                        <Text
                          style={[
                            styles.montoPendiente,
                            isDark && { color: colors.dangerText },
                          ]}
                        >
                          Saldo: Bs {saldoPend.toFixed(2)}
                        </Text>
                      )}
                    </View>
                  )}
                </View>

                {/* Aviso si fue editado por la administración */}
                {!!pedido.motivoEdicion && (
                  <Pressable
                    onPress={() => verDetalle(pedido)}
                    style={[
                      styles.cardAvisoEdicion,
                      isDark && {
                        backgroundColor: "rgba(245, 158, 11, 0.15)",
                        borderColor: "rgba(245, 158, 11, 0.3)",
                      },
                    ]}
                  >
                    <Ionicons name="notifications-outline" size={16} color="#d97706" />
                    <Text
                      style={[
                        styles.cardAvisoEdicionTexto,
                        isDark && { color: "#fbbf24" },
                      ]}
                      numberOfLines={2}
                    >
                      Modificado por administración: {pedido.motivoEdicion}
                    </Text>
                    <Ionicons name="chevron-forward" size={14} color="#d97706" />
                  </Pressable>
                )}

                {/* Aviso si fue devuelto con motivo */}
                {(pedido.estado === "Devuelto" ||
                  !!pedido.motivoDevolucion) && (
                  <Pressable
                    onPress={() => verDetalle(pedido)}
                    style={[
                      styles.cardAvisoEdicion,
                      {
                        backgroundColor: isDark
                          ? "rgba(220, 38, 38, 0.16)"
                          : "#fef2f2",
                        borderColor: isDark
                          ? "rgba(220, 38, 38, 0.35)"
                          : "#fca5a5",
                      },
                    ]}
                  >
                    <Ionicons
                      name="alert-circle"
                      size={16}
                      color={isDark ? "#f87171" : "#dc2626"}
                    />
                    <Text
                      style={[
                        styles.cardAvisoEdicionTexto,
                        { color: isDark ? "#fca5a5" : "#991b1b" },
                      ]}
                      numberOfLines={2}
                    >
                      Pedido devuelto:{" "}
                      {pedido.motivoDevolucion || "Reportado como no recibido"}
                    </Text>
                    <Ionicons
                      name="chevron-forward"
                      size={14}
                      color={isDark ? "#f87171" : "#dc2626"}
                    />
                  </Pressable>
                )}

                {/* Acciones */}
                <View
                  style={[
                    styles.acciones,
                    isDark && { borderTopColor: colors.borderLight },
                  ]}
                >
                  <Pressable
                    style={[
                      styles.botonAccion,
                      styles.botonDetalle,
                      isDark && {
                        backgroundColor: "rgba(200, 35, 27, 0.18)",
                        borderColor: "rgba(200, 35, 27, 0.35)",
                      },
                    ]}
                    onPress={() => verDetalle(pedido)}
                  >
                    <Ionicons name="eye-outline" size={17} color={colors.primary} />
                    <Text style={[styles.botonAccionTexto, { color: colors.primary }]}>Ver detalle</Text>
                  </Pressable>

                  {esPendiente && (
                    <>
                      <Pressable
                        style={[
                          styles.botonAccion,
                          styles.botonEditar,
                          isDark && {
                            backgroundColor: "rgba(29, 78, 216, 0.18)",
                            borderColor: "rgba(29, 78, 216, 0.35)",
                          },
                        ]}
                        onPress={() => abrirEditar(pedido)}
                      >
                        <Ionicons name="create-outline" size={17} color={isDark ? "#60a5fa" : "#1d4ed8"} />
                        <Text style={[styles.botonAccionTexto, { color: isDark ? "#60a5fa" : "#1d4ed8" }]}>Editar</Text>
                      </Pressable>

                      <Pressable
                        style={[
                          styles.botonAccion,
                          styles.botonCancelar,
                          isDark && {
                            backgroundColor: colors.dangerBg,
                            borderColor: colors.dangerBorder,
                          },
                        ]}
                        onPress={() => confirmarCancelacion(pedido)}
                      >
                        <Ionicons name="close-circle-outline" size={17} color={colors.dangerText} />
                        <Text style={[styles.botonAccionTexto, { color: colors.dangerText }]}>Cancelar</Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </View>
            );
          })
        )}

        <Paginacion
          paginaActual={paginaActual}
          totalPaginas={totalPaginas}
          totalRegistros={totalRegistros}
          registrosPorPagina={registrosPorPagina}
          onCambiarPagina={setPaginaActual}
          onCambiarRegistrosPorPagina={setRegistrosPorPagina}
        />
      </ScrollView>

      {/* Modal de Detalle */}
      <Modal
        visible={modalActivo === "detalle"}
        transparent
        animationType="slide"
        onRequestClose={() => setModalActivo("ninguno")}
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
                Detalle del Pedido #{pedidoSeleccionado?.id}
              </Text>
              <Pressable
                style={[
                  styles.modalCloseBtn,
                  isDark && { backgroundColor: colors.surfaceElevated },
                ]}
                onPress={() => setModalActivo("ninguno")}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? colors.textSecondary : "#555"}
                />
              </Pressable>
            </View>

            {pedidoSeleccionado && (
              <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 15 }}>
                {!!pedidoSeleccionado.motivoEdicion && (
                  <View
                    style={[
                      styles.bannerMotivoEdicionCliente,
                      isDark && {
                        backgroundColor: "rgba(245, 158, 11, 0.15)",
                        borderColor: "rgba(245, 158, 11, 0.35)",
                      },
                    ]}
                  >
                    <View style={styles.bannerMotivoEdicionHeaderCliente}>
                      <Ionicons name="notifications" size={18} color="#f59e0b" />
                      <Text style={styles.bannerMotivoEdicionTituloCliente}>
                        Modificado por la Administración
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.bannerMotivoEdicionTextoCliente,
                        isDark && { color: "#fde68a" },
                      ]}
                    >
                      {pedidoSeleccionado.motivoEdicion}
                    </Text>
                  </View>
                )}

                {/* Banner si el pedido fue devuelto */}
                {(pedidoSeleccionado.estado === "Devuelto" ||
                  !!pedidoSeleccionado.motivoDevolucion) && (
                  <View
                    style={{
                      marginBottom: 14,
                      padding: 14,
                      borderRadius: 14,
                      backgroundColor: isDark
                        ? "rgba(220, 38, 38, 0.16)"
                        : "#fef2f2",
                      borderWidth: 1.5,
                      borderColor: isDark
                        ? "rgba(220, 38, 38, 0.4)"
                        : "#fca5a5",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                        marginBottom: 6,
                      }}
                    >
                      <Ionicons
                        name="alert-circle"
                        size={20}
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
                        marginBottom: 3,
                      }}
                    >
                      Justificación / Motivo:
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
                        "El pedido fue reportado como no recibido."}
                    </Text>
                    {!!pedidoSeleccionado.fechaDevolucion && (
                      <Text
                        style={{
                          fontSize: 11,
                          color: isDark ? "#fca5a5" : "#b91c1c",
                          marginTop: 6,
                          fontWeight: "500",
                        }}
                      >
                        Fecha de reporte:{" "}
                        {formatearFecha(pedidoSeleccionado.fechaDevolucion)}
                      </Text>
                    )}
                  </View>
                )}

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
                    Información General
                  </Text>
                  <View style={styles.modalItemRow}>
                    <Text
                      style={[
                        styles.modalItemLabel,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Fecha de creación:
                    </Text>
                    <Text
                      style={[
                        styles.modalItemValue,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {formatearFecha(pedidoSeleccionado.fechaPedido || (pedidoSeleccionado as any).fecha)}
                    </Text>
                  </View>
                  <View style={styles.modalItemRow}>
                    <Text
                      style={[
                        styles.modalItemLabel,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Sucursal destino:
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
                      Estado:
                    </Text>
                    <Text
                      style={[
                        styles.modalItemValue,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {pedidoSeleccionado.estado}
                    </Text>
                  </View>
                  {!!pedidoSeleccionado.observacion && (
                    <View style={{ marginTop: 8 }}>
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
                          { marginTop: 2 },
                          isDark && { color: colors.text },
                        ]}
                      >
                        {pedidoSeleccionado.observacion}
                      </Text>
                    </View>
                  )}
                </View>

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
                    Productos Solicitados ({pedidoSeleccionado.detalles?.length || 0})
                  </Text>
                  {pedidoSeleccionado.detalles?.map((det) => (
                    <View
                      key={det.idProducto}
                      style={[
                        styles.productRow,
                        isDark && { borderBottomColor: colors.borderLight },
                      ]}
                    >
                      <MiniaturaProductoPedido imagenUrl={det.imagenUrl} />
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text
                          style={[
                            styles.productName,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {det.producto}
                        </Text>
                        <Text
                          style={[
                            styles.productUnitPrice,
                            isDark && { color: colors.textMuted },
                          ]}
                        >
                          Precio unitario: Bs {Number(det.precioUnitario ?? 0).toFixed(2)}
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
                            x{det.cantidad}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.productSubtotal,
                            isDark && { color: colors.text },
                          ]}
                        >
                          Bs {Number(det.subtotal ?? 0).toFixed(2)}
                        </Text>
                      </View>
                    </View>
                  ))}
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
                    TOTAL A PAGAR
                  </Text>
                  <Text
                    style={[
                      styles.totalValue,
                      { color: colors.primary },
                    ]}
                  >
                    Bs {Number(pedidoSeleccionado.total ?? 0).toFixed(2)}
                  </Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal de Edición */}
      <Modal
        visible={modalActivo === "editar"}
        transparent
        animationType="slide"
        onRequestClose={() => setModalActivo("ninguno")}
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
                Editar Pedido #{pedidoSeleccionado?.id}
              </Text>
              <Pressable
                style={[
                  styles.modalCloseBtn,
                  isDark && { backgroundColor: colors.surfaceElevated },
                ]}
                onPress={() => setModalActivo("ninguno")}
              >
                <Ionicons
                  name="close"
                  size={20}
                  color={isDark ? colors.textSecondary : "#555"}
                />
              </Pressable>
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 25 }}>
              <Text
                style={[
                  styles.modalSectionTitle,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Sucursal de Entrega
              </Text>
              <View
                style={[
                  { borderWidth: 1, borderColor: "#dce0e4", borderRadius: 14, overflow: "hidden", marginBottom: 14, backgroundColor: BLANCO },
                  isDark && {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Picker
                  selectedValue={idSucursalEditar}
                  onValueChange={(val) => setIdSucursalEditar(Number(val))}
                  style={{ height: 48, color: colors.text }}
                  dropdownIconColor={colors.textSecondary}
                >
                  {sucursales.map((s) => (
                    <Picker.Item key={s.id} label={`${s.nombre} · ${s.ubicacion || (s as any).direccion || ""}`} value={s.id} />
                  ))}
                </Picker>
              </View>

              <Text
                style={[
                  styles.modalSectionTitle,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Modificar Cantidades
              </Text>
              <View
                style={[
                  styles.modalSection,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                {productos.map((prod) => {
                  const cant = cantidadesEditar[prod.id] ?? 0;
                  return (
                    <View
                      key={prod.id}
                      style={[
                        styles.productRow,
                        isDark && { borderBottomColor: colors.borderLight },
                      ]}
                    >
                      <MiniaturaProductoPedido imagenUrl={prod.imagenUrl} />
                      <View style={{ flex: 1, paddingRight: 10 }}>
                        <Text
                          style={[
                            styles.productName,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {prod.nombre}
                        </Text>
                        <Text
                          style={[
                            styles.productUnitPrice,
                            isDark && { color: colors.textMuted },
                          ]}
                        >
                          Bs {Number(prod.precio ?? 0).toFixed(2)} c/u
                        </Text>
                      </View>

                      <View style={styles.counterContainer}>
                        <Pressable
                          style={[
                            styles.counterButton,
                            isDark && {
                              backgroundColor: "rgba(200, 35, 27, 0.22)",
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => cambiarCantidad(prod.id, -1)}
                        >
                          <Ionicons name="remove" size={16} color={colors.primary} />
                        </Pressable>

                        <Text
                          style={[
                            styles.counterValue,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {cant}
                        </Text>

                        <Pressable
                          style={[
                            styles.counterButton,
                            isDark && {
                              backgroundColor: "rgba(200, 35, 27, 0.22)",
                              borderColor: colors.border,
                            },
                          ]}
                          onPress={() => cambiarCantidad(prod.id, 1)}
                        >
                          <Ionicons name="add" size={16} color={colors.primary} />
                        </Pressable>
                      </View>
                    </View>
                  );
                })}
              </View>

              <Text
                style={[
                  styles.modalSectionTitle,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Observación (Opcional)
              </Text>
              <View
                style={[
                  { borderWidth: 1, borderColor: "#dce0e4", borderRadius: 14, padding: 10, backgroundColor: BLANCO, marginBottom: 14 },
                  isDark && {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <TextInput
                  style={{ height: 60, textAlignVertical: "top", color: colors.text, fontSize: 13 }}
                  value={observacionEditar}
                  onChangeText={setObservacionEditar}
                  placeholder="Notas para el repartidor o entrega..."
                  placeholderTextColor={colors.inputPlaceholder}
                  multiline
                />
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
                  NUEVO TOTAL ESTIMADO
                </Text>
                <Text
                  style={[
                    styles.totalValue,
                    { color: colors.primary },
                  ]}
                >
                  Bs {totalCalculadoEdicion.toFixed(2)}
                </Text>
              </View>

              <Pressable
                disabled={procesando}
                style={[
                  styles.btnNuevoPedido,
                  { minHeight: 48, justifyContent: "center", width: "100%", borderRadius: 16, backgroundColor: colors.primary },
                  procesando && { opacity: 0.6 },
                ]}
                onPress={guardarCambios}
              >
                {procesando ? (
                  <ActivityIndicator color={BLANCO} />
                ) : (
                  <>
                    <Ionicons name="save-outline" size={19} color={BLANCO} />
                    <Text style={[styles.btnNuevoPedidoTexto, { fontSize: 14 }]}>GUARDAR CAMBIOS</Text>
                  </>
                )}
              </Pressable>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* Modal Pop-up de Notificación de Pedido Modificado */}
      <Modal
        visible={modalActivo === "notificacionEdicion"}
        transparent
        animationType="fade"
        onRequestClose={() => setModalActivo("ninguno")}
      >
        <View
          style={[
            styles.modalNotificacionBg,
            isDark && { backgroundColor: "rgba(0, 0, 0, 0.75)" },
          ]}
        >
          <View
            style={[
              styles.modalNotificacionContainer,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.modalNotificacionIconoBox,
                isDark && { backgroundColor: "rgba(245, 158, 11, 0.2)" },
              ]}
            >
              <Ionicons name="notifications" size={32} color="#f59e0b" />
            </View>

            <Text
              style={[
                styles.modalNotificacionTitulo,
                isDark && { color: colors.text },
              ]}
            >
              Aviso de Modificación
            </Text>

            <Text
              style={[
                styles.modalNotificacionSubtitulo,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Tu Pedido #{pedidoSeleccionado?.id} ha sido actualizado por la administración.
            </Text>

            <View
              style={[
                styles.modalNotificacionCajaMotivo,
                isDark && {
                  backgroundColor: "rgba(245, 158, 11, 0.12)",
                  borderColor: "rgba(245, 158, 11, 0.35)",
                },
              ]}
            >
              <Text
                style={[
                  styles.modalNotificacionMotivoLabel,
                  isDark && { color: "#fbbf24" },
                ]}
              >
                Motivo del cambio:
              </Text>
              <Text
                style={[
                  styles.modalNotificacionMotivoTexto,
                  isDark && { color: "#fef3c7" },
                ]}
              >
                {pedidoSeleccionado?.motivoEdicion}
              </Text>
            </View>

            <View
              style={[
                styles.modalNotificacionTotalRow,
                isDark && { borderTopColor: colors.borderLight },
              ]}
            >
              <Text
                style={[
                  styles.modalNotificacionTotalLabel,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Nuevo Total:
              </Text>
              <Text
                style={[
                  styles.modalNotificacionTotalValor,
                  { color: colors.primary },
                ]}
              >
                Bs {Number(pedidoSeleccionado?.total ?? 0).toFixed(2)}
              </Text>
            </View>

            <Pressable
              style={[
                styles.modalNotificacionBtnPrincipal,
                { backgroundColor: colors.primary },
              ]}
              onPress={async () => {
                if (pedidoSeleccionado) {
                  try {
                    const vistosRaw = await AsyncStorage.getItem(
                      "@pedidos_modificados_vistos"
                    );
                    const vistos: Record<number, string> = vistosRaw
                      ? JSON.parse(vistosRaw)
                      : {};
                    vistos[pedidoSeleccionado.id] =
                      pedidoSeleccionado.motivoEdicion || "";
                    await AsyncStorage.setItem(
                      "@pedidos_modificados_vistos",
                      JSON.stringify(vistos)
                    );
                  } catch (e) {
                    console.warn(e);
                  }
                }
                setModalActivo("detalle");
              }}
            >
              <Ionicons name="receipt-outline" size={18} color={BLANCO} />
              <Text style={styles.modalNotificacionBtnPrincipalTexto}>
                Ver Detalle Completo
              </Text>
            </Pressable>

            <Pressable
              style={styles.modalNotificacionBtnSecundario}
              onPress={async () => {
                if (pedidoSeleccionado) {
                  try {
                    const vistosRaw = await AsyncStorage.getItem(
                      "@pedidos_modificados_vistos"
                    );
                    const vistos: Record<number, string> = vistosRaw
                      ? JSON.parse(vistosRaw)
                      : {};
                    vistos[pedidoSeleccionado.id] =
                      pedidoSeleccionado.motivoEdicion || "";
                    await AsyncStorage.setItem(
                      "@pedidos_modificados_vistos",
                      JSON.stringify(vistos)
                    );
                  } catch (e) {
                    console.warn(e);
                  }
                }
                setModalActivo("ninguno");
              }}
            >
              <Text
                style={[
                  styles.modalNotificacionBtnSecundarioTexto,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Entendido
              </Text>
            </Pressable>
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