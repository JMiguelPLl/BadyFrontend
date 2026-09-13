import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Tabs, usePathname, useRouter } from "expo-router";
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AppState,
  AppStateStatus,
  View,
} from "react-native";

import ConfirmacionEntregaModal from "../../components/cliente/ConfirmacionEntregaModal";
import NotificacionEdicionModal from "../../components/cliente/NotificacionEdicionModal";
import { useAppTheme } from "../../hooks/useAppTheme";
import { obtenerUsuario } from "../../services/authService";
import {
  confirmarEntregaPedido,
  listarMisPedidos,
  listarMisPendientesConfirmacion,
  listarPedidosCliente,
  noConfirmarEntregaPedido,
  obtenerPedidoPorId,
} from "../../services/PedidosService";
import { Pedido } from "../../types/pedido";

export default function ClienteLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [
    pedidosPendientes,
    setPedidosPendientes,
  ] = useState<Pedido[]>([]);

  const [
    cargandoConfirmacion,
    setCargandoConfirmacion,
  ] = useState(false);

  const [
    procesandoConfirmacion,
    setProcesandoConfirmacion,
  ] = useState(false);

  const [
    modalOcultoTemporalmente,
    setModalOcultoTemporalmente,
  ] = useState(false);

  // Estados para notificación automática de pedidos modificados
  const [
    pedidoModificado,
    setPedidoModificado,
  ] = useState<Pedido | null>(null);

  const [
    cargandoEdicion,
    setCargandoEdicion,
  ] = useState(false);

  const [
    modalEdicionOculto,
    setModalEdicionOculto,
  ] = useState(false);

  const appState =
    useRef<AppStateStatus>(
      AppState.currentState
    );

  const verificarPendientes =
    useCallback(async () => {
      if (cargandoConfirmacion) {
        return;
      }

      try {
        setCargandoConfirmacion(true);

        const pendientes =
          await listarMisPendientesConfirmacion();

        setPedidosPendientes(
          pendientes
        );

        if (pendientes.length > 0) {
          setModalOcultoTemporalmente(
            false
          );
        }
      } catch (error) {
        console.warn(
          "No se pudo comprobar la confirmación de entrega:",
          error
        );
      } finally {
        setCargandoConfirmacion(false);
      }
    }, [cargandoConfirmacion]);

  const verificarPedidosModificados =
    useCallback(async () => {
      if (cargandoEdicion) {
        return;
      }

      try {
        setCargandoEdicion(true);

        // 1. Obtener pedidos del cliente
        let pedidos: Pedido[] = [];
        try {
          pedidos = await listarMisPedidos();
        } catch {
          // Fallback a listarPedidosCliente
        }

        if (!pedidos || pedidos.length === 0) {
          const usuarioStorage = await obtenerUsuario();
          const clienteId = Number(
            usuarioStorage?.idCliente ?? usuarioStorage?.id
          );
          if (clienteId) {
            pedidos = await listarPedidosCliente(clienteId);
          }
        }

        if (!Array.isArray(pedidos) || pedidos.length === 0) {
          return;
        }

        // 2. Filtrar pedidos que tengan motivoEdicion o que estén pendientes
        const pedidosCandidatos = pedidos.filter(
          (p) =>
            Boolean(p.motivoEdicion && p.motivoEdicion.trim() !== "") ||
            p.estado === "Pendiente" ||
            p.estado === "Asignado"
        );

        let pedidosConMotivo: Pedido[] = [];
        for (const p of pedidosCandidatos) {
          if (p.motivoEdicion && p.motivoEdicion.trim() !== "") {
            pedidosConMotivo.push(p);
          } else if (p.estado === "Pendiente") {
            try {
              const detalle = await obtenerPedidoPorId(p.id);
              if (
                detalle?.motivoEdicion &&
                detalle.motivoEdicion.trim() !== ""
              ) {
                pedidosConMotivo.push(detalle);
              }
            } catch {
              // Ignorar error si no se pudo cargar el detalle individual
            }
          }
        }

        if (pedidosConMotivo.length === 0) {
          return;
        }

        // 3. Revisar en AsyncStorage qué modificaciones ya fueron vistas
        const vistosRaw = await AsyncStorage.getItem(
          "@pedidos_modificados_vistos"
        );
        const vistos: Record<number, string> = vistosRaw
          ? JSON.parse(vistosRaw)
          : {};

        // Encontrar el primer pedido cuyo motivoEdicion aún no fue visto
        const noVisto = pedidosConMotivo.find(
          (p) => vistos[p.id] !== p.motivoEdicion
        );

        if (noVisto) {
          if (!noVisto.detalles || noVisto.detalles.length === 0) {
            try {
              const detalleCompleto = await obtenerPedidoPorId(noVisto.id);
              setPedidoModificado(detalleCompleto);
            } catch {
              setPedidoModificado(noVisto);
            }
          } else {
            setPedidoModificado(noVisto);
          }
          setModalEdicionOculto(false);
        }
      } catch (error) {
        console.warn(
          "No se pudo verificar pedidos modificados:",
          error
        );
      } finally {
        setCargandoEdicion(false);
      }
    }, [cargandoEdicion]);

  const marcarModificacionComoVista = async () => {
    if (!pedidoModificado) return;

    try {
      const vistosRaw = await AsyncStorage.getItem(
        "@pedidos_modificados_vistos"
      );
      const vistos: Record<number, string> = vistosRaw
        ? JSON.parse(vistosRaw)
        : {};
      vistos[pedidoModificado.id] = pedidoModificado.motivoEdicion || "";
      await AsyncStorage.setItem(
        "@pedidos_modificados_vistos",
        JSON.stringify(vistos)
      );
    } catch (e) {
      console.warn("Error al guardar pedido visto:", e);
    }
    setPedidoModificado(null);
  };

  const irADetallePedidoModificado = async () => {
    await marcarModificacionComoVista();
    router.push("/cliente/pedidos");
  };

  useEffect(() => {
    verificarPendientes();
    verificarPedidosModificados();
  }, []);

  useEffect(() => {
    verificarPendientes();
    verificarPedidosModificados();
  }, [pathname]);

  useEffect(() => {
    const suscripcion =
      AppState.addEventListener(
        "change",
        (
          siguienteEstado
        ) => {
          const estabaInactiva =
            appState.current.match(
              /inactive|background/
            );

          if (
            estabaInactiva &&
            siguienteEstado ===
              "active"
          ) {
            verificarPendientes();
            verificarPedidosModificados();
          }

          appState.current =
            siguienteEstado;
        }
      );

    return () => {
      suscripcion.remove();
    };
  }, [verificarPendientes, verificarPedidosModificados]);

  const pedidoActual =
    pedidosPendientes.length > 0
      ? pedidosPendientes[0]
      : null;

  const confirmarEntrega =
    async () => {
      if (!pedidoActual) {
        return;
      }

      try {
        setProcesandoConfirmacion(
          true
        );

        await confirmarEntregaPedido(
          pedidoActual.id
        );

        setPedidosPendientes(
          (actuales) =>
            actuales.filter(
              (pedido) =>
                pedido.id !==
                pedidoActual.id
            )
        );
      } finally {
        setProcesandoConfirmacion(
          false
        );
      }
    };

  const noRecibido =
    async (motivo: string) => {
      if (!pedidoActual) {
        return;
      }

      try {
        setProcesandoConfirmacion(
          true
        );

        await noConfirmarEntregaPedido(
          pedidoActual.id,
          motivo
        );

        setPedidosPendientes(
          (actuales) =>
            actuales.filter(
              (pedido) =>
                pedido.id !==
                pedidoActual.id
            )
        );
      } finally {
        setProcesandoConfirmacion(
          false
        );
      }
    };

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            height: 68,
            paddingTop: 7,
            paddingBottom: 8,
            backgroundColor: colors.tabBarBg,
            borderTopColor: colors.tabBarBorder,
            elevation: 10,
            shadowColor: "#000000",
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="home"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="sucursales"
          options={{
            title:
              "Sucursales",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="storefront-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="pedidos"
          options={{
            title: "Pedidos",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="receipt-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="pagos"
          options={{
            title: "Deudas",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="wallet-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="perfil"
          options={{
            title: "Perfil",
            tabBarIcon: ({
              color,
              size,
            }) => (
              <Ionicons
                name="person-outline"
                size={size}
                color={color}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="crear-pedido"
          options={{
            href: null,
            headerShown: false,
          }}
        />
      </Tabs>

      <ConfirmacionEntregaModal
        visible={
          Boolean(pedidoActual) &&
          !modalOcultoTemporalmente
        }
        pedido={pedidoActual}
        procesando={
          procesandoConfirmacion
        }
        onConfirmar={
          confirmarEntrega
        }
        onNoRecibido={
          noRecibido
        }
        onAhoraNo={() =>
          setModalOcultoTemporalmente(
            true
          )
        }
      />

      <NotificacionEdicionModal
        visible={
          Boolean(pedidoModificado) &&
          !modalEdicionOculto &&
          !pedidoActual
        }
        pedido={pedidoModificado}
        onEntendido={marcarModificacionComoVista}
        onVerDetalle={irADetallePedidoModificado}
        onCerrar={() => setModalEdicionOculto(true)}
      />
    </View>
  );
}
