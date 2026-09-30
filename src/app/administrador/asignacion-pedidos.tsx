import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import Paginacion from "../../components/comun/Paginacion";
import { useAppTheme } from "../../hooks/useAppTheme";
import { usePaginacion } from "../../hooks/usePaginacion";
import {
  crearAsignacionPedido,
  editarAsignacionPedido,
  editarPedidoAdmin,
  listarAsignacionesPedido,
  listarAsignacionesVehiculoActivas,
  listarPedidos,
  obtenerPedidoPorId,
} from "../../services/asignacionPedidoService";
import {
  crearPedido,
  listarProductosDisponibles,
  listarSucursalesCliente,
} from "../../services/PedidosService";
import { listarClientesActivos } from "../../services/clienteService";
import { Cliente } from "../../types/cliente";
import {
  CrearPedidoDto,
  ProductoPedido,
  SucursalPedido,
} from "../../types/pedido";

import {
  AsignacionPedido,
  AsignacionVehiculoDisponible,
  PedidoAdmin,
} from "../../types/asignacionPedido";

import { styles } from "../../styles/administrador/asignacion-pedidos.styles";

type VehiculoAsignable = {
  idVehiculo: number;
  vehiculo: string;
  placa?: string | null;
  cantidadCarga: string;
  asignaciones: AsignacionVehiculoDisponible[];
};

type ModoAsignacion = "crear" | "editar";

type ModalActivo =
  | "ninguno"
  | "detallePedido"
  | "asignar"
  | "detalleAsignacion"
  | "editarPedido"
  | "crearPedido"
  | "calendarioDesde"
  | "calendarioHasta"
  | "mensaje";

const ESTADOS_PEDIDO = [
  "Todos",
  "Pendiente",
  "Asignado",
  "EnCamino",
  "PorConfirmarEntrega",
  "Entregado",
  "Cancelado",
  "Devuelto",
] as const;

export default function AsignacionPedidosScreen() {
  const { colors, isDark } = useAppTheme();

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionPedido[]>([]);
  const [vehiculosAsignables, setVehiculosAsignables] = useState<VehiculoAsignable[]>([]);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<string>("Todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [modal, setModal] = useState<ModalActivo>("ninguno");
  const [modoAsignacion, setModoAsignacion] = useState<ModoAsignacion>("crear");

  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoAdmin | null>(null);
  const [asignacionSeleccionada, setAsignacionSeleccionada] = useState<AsignacionPedido | null>(null);
  const [idVehiculoSeleccionado, setIdVehiculoSeleccionado] = useState<number | null>(null);

  // Estados para Edición de Pedido por Administrador
  const [pedidoAEditar, setPedidoAEditar] = useState<PedidoAdmin | null>(null);
  const [productosDisponibles, setProductosDisponibles] = useState<ProductoPedido[]>([]);
  const [cantidadesEdicion, setCantidadesEdicion] = useState<Record<number, number>>({});
  const [observacionEdicion, setObservacionEdicion] = useState("");
  const [motivoEdicionForm, setMotivoEdicionForm] = useState("");

  // Estados para Creación de Pedido por Administrador (Venta Mostrador)
  const [clientesParaPedido, setClientesParaPedido] = useState<Cliente[]>([]);
  const [cargandoClientesPedido, setCargandoClientesPedido] = useState(false);
  const [clienteSeleccionadoPedido, setClienteSeleccionadoPedido] = useState<Cliente | null>(null);
  const [busquedaClientePedido, setBusquedaClientePedido] = useState("");
  const [mostrarDropdownClientes, setMostrarDropdownClientes] = useState(false);

  const [sucursalesClientePedido, setSucursalesClientePedido] = useState<SucursalPedido[]>([]);
  const [idSucursalSeleccionadaPedido, setIdSucursalSeleccionadaPedido] = useState<number | null>(null);

  const [productosCreacion, setProductosCreacion] = useState<ProductoPedido[]>([]);
  const [busquedaProductoCreacion, setBusquedaProductoCreacion] = useState("");
  const [cantidadesCreacion, setCantidadesCreacion] = useState<Record<number, number>>({});
  const [observacionCreacion, setObservacionCreacion] = useState("");
  const [esVentaDirectaCreacion, setEsVentaDirectaCreacion] = useState(true);
  const [idTipoPagoCreacion, setIdTipoPagoCreacion] = useState<number>(1);

  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  useEffect(() => {
    cargarTodo();
  }, []);

  const cargarTodo = async () => {
    try {
      setCargando(true);

      const [dataPedidos, dataAsignaciones, dataVehiculos] =
        await Promise.all([
          listarPedidos(),
          listarAsignacionesPedido(),
          listarAsignacionesVehiculoActivas(),
        ]);

      setPedidos(dataPedidos);
      setAsignaciones(dataAsignaciones);
      setVehiculosAsignables(agruparVehiculosAsignables(dataVehiculos));
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los datos.",
        true
      );
    } finally {
      setCargando(false);
    }
  };

  const agruparVehiculosAsignables = (
    data: AsignacionVehiculoDisponible[]
  ): VehiculoAsignable[] => {
    const mapa = new Map<number, VehiculoAsignable>();

    data.forEach((item) => {
      const existente = mapa.get(item.idVehiculo);

      if (existente) {
        existente.asignaciones.push(item);
      } else {
        mapa.set(item.idVehiculo, {
          idVehiculo: item.idVehiculo,
          vehiculo: item.vehiculo,
          placa: item.placa,
          cantidadCarga: item.cantidadCarga,
          asignaciones: [item],
        });
      }
    });

    return Array.from(mapa.values());
  };

  const pedidosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return pedidos.filter((pedido) => {
      const cumpleEstado =
        estadoFiltro === "Todos"
          ? true
          : pedido.estado.toLowerCase() === estadoFiltro.toLowerCase();

      if (!cumpleEstado) return false;

      const fechaPedido = new Date(pedido.fechaPedido);

      if (fechaDesde) {
        const d = new Date(`${fechaDesde}T00:00:00`);
        if (fechaPedido < d) return false;
      }

      if (fechaHasta) {
        const h = new Date(`${fechaHasta}T23:59:59`);
        if (fechaPedido > h) return false;
      }

      if (!texto) return true;

      const cliente = (pedido.cliente || "").toLowerCase();
      const sucursal = (pedido.sucursal || "").toLowerCase();
      const idStr = String(pedido.id);
      const motivoDev = (pedido.motivoDevolucion || "").toLowerCase();
      const motivoEd = (pedido.motivoEdicion || "").toLowerCase();

      return (
        cliente.includes(texto) ||
        sucursal.includes(texto) ||
        idStr.includes(texto) ||
        motivoDev.includes(texto) ||
        motivoEd.includes(texto)
      );
    });
  }, [pedidos, busqueda, estadoFiltro, fechaDesde, fechaHasta]);

  const {
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    setRegistrosPorPagina,
    totalPaginas,
    totalRegistros,
    datosPaginados: pedidosPaginados,
  } = usePaginacion(pedidosFiltrados);

  const obtenerAsignacionPedido = (
    idPedido: number
  ): AsignacionPedido | undefined => {
    return asignaciones.find((a) => a.idPedido === idPedido);
  };

  const cantidadProductos = (pedido: PedidoAdmin) => {
    if (!pedido.detalles || !pedido.detalles.length) {
      return 0;
    }

    return pedido.detalles.reduce(
      (total, detalle) => total + detalle.cantidad,
      0
    );
  };

  const abrirMensaje = (texto: string, error = false) => {
    setMensaje(texto);
    setEsError(error);
    setModal("mensaje");
  };

  const abrirDetallePedido = async (pedido: PedidoAdmin) => {
    try {
      setProcesando(true);
      setPedidoSeleccionado(pedido);
      setModal("detallePedido");

      const detalleCompleto = await obtenerPedidoPorId(pedido.id);
      setPedidoSeleccionado(detalleCompleto);
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el detalle del pedido.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const abrirAsignar = (pedido: PedidoAdmin) => {
    if (pedido.estado !== "Pendiente") {
      abrirMensaje(
        "Solo los pedidos en estado Pendiente pueden ser asignados.",
        true
      );
      return;
    }

    setModoAsignacion("crear");
    setPedidoSeleccionado(pedido);
    setAsignacionSeleccionada(null);
    setIdVehiculoSeleccionado(null);
    setModal("asignar");
  };

  const abrirEditarAsignacion = (pedido: PedidoAdmin) => {
    const asignacion = obtenerAsignacionPedido(pedido.id);

    if (!asignacion) {
      abrirMensaje(
        "Este pedido todavía no tiene una asignación.",
        true
      );
      return;
    }

    if (
      pedido.estado !== "Asignado" ||
      asignacion.estadoAsignacion !== "Asignado"
    ) {
      abrirMensaje(
        "Solo puedes cambiar el vehículo mientras el pedido y la asignación estén en estado Asignado.",
        true
      );
      return;
    }

    setModoAsignacion("editar");
    setPedidoSeleccionado(pedido);
    setAsignacionSeleccionada(asignacion);
    setIdVehiculoSeleccionado(asignacion.idVehiculo);
    setModal("asignar");
  };

  const confirmarAsignacion = async () => {
    if (!pedidoSeleccionado || !idVehiculoSeleccionado) {
      abrirMensaje("Selecciona un vehículo.", true);
      return;
    }

    const vehiculoElegido = vehiculosAsignables.find(
      (vehiculo) => vehiculo.idVehiculo === idVehiculoSeleccionado
    );

    if (
      !vehiculoElegido ||
      vehiculoElegido.asignaciones.length === 0
    ) {
      abrirMensaje(
        "El vehículo seleccionado no tiene personal activo asignado.",
        true
      );
      return;
    }

    const idAsignacionVehiculo = vehiculoElegido.asignaciones[0].id;

    try {
      setProcesando(true);

      const respuesta =
        modoAsignacion === "editar" && asignacionSeleccionada
          ? await editarAsignacionPedido(asignacionSeleccionada.id, {
              idPedido: pedidoSeleccionado.id,
              idAsignacionVehiculo,
            })
          : await crearAsignacionPedido({
              idPedido: pedidoSeleccionado.id,
              idAsignacionVehiculo,
            });

      setModal("ninguno");
      await cargarTodo();

      abrirMensaje(
        respuesta.message ||
          (modoAsignacion === "editar"
            ? "Vehículo de reparto actualizado correctamente."
            : "Pedido asignado correctamente.")
      );
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la asignación.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const abrirDetalleAsignacion = (pedido: PedidoAdmin) => {
    const asignacion = obtenerAsignacionPedido(pedido.id);

    if (!asignacion) {
      abrirMensaje(
        "Este pedido todavía no tiene una asignación.",
        true
      );
      return;
    }

    setPedidoSeleccionado(pedido);
    setAsignacionSeleccionada(asignacion);
    setModal("detalleAsignacion");
  };

  const abrirEditarPedido = async (pedido: PedidoAdmin) => {
    try {
      setProcesando(true);
      const [detalleCompleto, prods] = await Promise.all([
        obtenerPedidoPorId(pedido.id),
        listarProductosDisponibles().catch(() => []),
      ]);

      setPedidoAEditar(detalleCompleto);
      setProductosDisponibles(prods);
      setObservacionEdicion(detalleCompleto.observacion || "");
      setMotivoEdicionForm(detalleCompleto.motivoEdicion || "");

      const mapa: Record<number, number> = {};
      detalleCompleto.detalles?.forEach((d) => {
        mapa[d.idProducto] = Number(d.cantidad);
      });
      setCantidadesEdicion(mapa);
      setModal("editarPedido");
    } catch (error) {
      abrirMensaje(
        error instanceof Error ? error.message : "No se pudo cargar el pedido.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const cambiarCantidadEdicion = (idProducto: number, delta: number) => {
    setCantidadesEdicion((prev) => {
      const actual = prev[idProducto] ?? 0;
      const nueva = Math.max(0, actual + delta);
      return { ...prev, [idProducto]: nueva };
    });
  };

  const totalCalculadoEdicionAdmin = useMemo(() => {
    if (!pedidoAEditar) return 0;
    return Object.entries(cantidadesEdicion).reduce((acc, [idProdStr, cant]) => {
      const idProd = Number(idProdStr);
      const prodCatalogo = productosDisponibles.find((p) => p.id === idProd);
      const detalleExistente = pedidoAEditar.detalles.find((d) => d.idProducto === idProd);
      const precio = prodCatalogo?.precio ?? detalleExistente?.precioUnitario ?? 0;
      return acc + cant * precio;
    }, 0);
  }, [pedidoAEditar, cantidadesEdicion, productosDisponibles]);

  const guardarEdicionPedido = async () => {
    if (!pedidoAEditar) return;

    if (!motivoEdicionForm.trim()) {
      abrirMensaje(
        "Debes ingresar el motivo de la edición para notificar al cliente.",
        true
      );
      return;
    }

    const detallesAEnviar = Object.entries(cantidadesEdicion)
      .map(([idProd, cant]) => ({
        idProducto: Number(idProd),
        cantidad: cant,
      }))
      .filter((d) => d.cantidad > 0);

    if (detallesAEnviar.length === 0) {
      abrirMensaje(
        "El pedido debe contener al menos un producto con cantidad mayor a cero.",
        true
      );
      return;
    }

    try {
      setProcesando(true);
      const respuesta = await editarPedidoAdmin(pedidoAEditar.id, {
        idCliente: pedidoAEditar.idCliente,
        idSucursal: pedidoAEditar.idSucursal,
        observacion: observacionEdicion.trim() || undefined,
        motivoEdicion: motivoEdicionForm.trim(),
        detalles: detallesAEnviar,
      });

      setModal("ninguno");
      setPedidoAEditar(null);
      await cargarTodo();

      abrirMensaje(
        respuesta?.message || "Pedido actualizado correctamente."
      );
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el pedido.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const abrirCrearPedido = async () => {
    setClienteSeleccionadoPedido(null);
    setBusquedaClientePedido("");
    setMostrarDropdownClientes(false);
    setSucursalesClientePedido([]);
    setIdSucursalSeleccionadaPedido(null);
    setCantidadesCreacion({});
    setObservacionCreacion("");
    setBusquedaProductoCreacion("");
    setEsVentaDirectaCreacion(true);
    setIdTipoPagoCreacion(1);
    setModal("crearPedido");

    try {
      setCargandoClientesPedido(true);
      const [dataClientes, dataProductos] = await Promise.all([
        listarClientesActivos(),
        listarProductosDisponibles(),
      ]);
      setClientesParaPedido(dataClientes);
      setProductosCreacion(dataProductos);
    } catch (err) {
      abrirMensaje(
        err instanceof Error
          ? err.message
          : "No se pudieron cargar clientes y productos.",
        true
      );
    } finally {
      setCargandoClientesPedido(false);
    }
  };

  const seleccionarClienteParaPedido = async (c: Cliente) => {
    setClienteSeleccionadoPedido(c);
    setBusquedaClientePedido(c.nombre);
    setMostrarDropdownClientes(false);
    setIdSucursalSeleccionadaPedido(null);

    try {
      const sucs = await listarSucursalesCliente(c.id);
      setSucursalesClientePedido(
        sucs.filter((s) => s.estado.toLowerCase() !== "inactivo")
      );
    } catch {
      setSucursalesClientePedido([]);
    }
  };

  const cambiarCantidadCreacion = (idProducto: number, delta: number) => {
    setCantidadesCreacion((prev) => {
      const actual = prev[idProducto] || 0;
      const nuevo = Math.max(0, actual + delta);
      if (nuevo === 0) {
        const copia = { ...prev };
        delete copia[idProducto];
        return copia;
      }
      return { ...prev, [idProducto]: nuevo };
    });
  };

  const resumenCreacion = useMemo(() => {
    let totalItems = 0;
    let totalMonto = 0;

    productosCreacion.forEach((p) => {
      const cant = cantidadesCreacion[p.id] || 0;
      if (cant > 0) {
        totalItems += cant;
        totalMonto += cant * p.precio;
      }
    });

    return { totalItems, totalMonto };
  }, [productosCreacion, cantidadesCreacion]);

  const clientesFiltradosPedido = useMemo(() => {
    const q = busquedaClientePedido.trim().toLowerCase();
    if (!q) return clientesParaPedido.slice(0, 10);
    return clientesParaPedido
      .filter((c) => {
        const n = (c.nombre || "").toLowerCase();
        const num = (c.numero || "").toLowerCase();
        const e = (c.email || "").toLowerCase();
        return n.includes(q) || num.includes(q) || e.includes(q);
      })
      .slice(0, 15);
  }, [clientesParaPedido, busquedaClientePedido]);

  const productosFiltradosCreacion = useMemo(() => {
    const q = busquedaProductoCreacion.trim().toLowerCase();
    if (!q) return productosCreacion;
    return productosCreacion.filter((p) =>
      p.nombre.toLowerCase().includes(q) ||
      p.descripcion.toLowerCase().includes(q)
    );
  }, [productosCreacion, busquedaProductoCreacion]);

  const guardarNuevoPedido = async () => {
    if (!clienteSeleccionadoPedido) {
      abrirMensaje("Debes seleccionar un cliente para el pedido.", true);
      return;
    }

    if (resumenCreacion.totalItems <= 0) {
      abrirMensaje(
        "Debes seleccionar al menos un producto con cantidad mayor a 0.",
        true
      );
      return;
    }

    if (esVentaDirectaCreacion && !idTipoPagoCreacion) {
      abrirMensaje(
        "Debes seleccionar el método de pago (Efectivo o QR) para la venta directa.",
        true
      );
      return;
    }

    try {
      setProcesando(true);

      const detalles = Object.entries(cantidadesCreacion)
        .map(([idStr, cantidad]) => ({
          idProducto: Number(idStr),
          cantidad: Number(cantidad),
        }))
        .filter((d) => d.cantidad > 0);

      const dto: CrearPedidoDto = {
        idCliente: clienteSeleccionadoPedido.id,
        idSucursal: idSucursalSeleccionadaPedido || null,
        esVentaDirecta: esVentaDirectaCreacion,
        idTipoPago: esVentaDirectaCreacion ? idTipoPagoCreacion : null,
        observacion: observacionCreacion.trim() || undefined,
        detalles,
      };

      const res = await crearPedido(dto);
      await cargarTodo();
      setModal("ninguno");
      abrirMensaje(
        res.message ||
          (esVentaDirectaCreacion
            ? `¡Venta directa #${res.idPedido ?? ""} registrada y entregada con éxito!`
            : `¡Pedido #${res.idPedido ?? ""} registrado exitosamente en estado Pendiente!`),
        false
      );
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo registrar la venta/pedido.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const cerrarModal = () => {
    if (procesando) return;

    setModal("ninguno");
    setPedidoSeleccionado(null);
    setAsignacionSeleccionada(null);
    setIdVehiculoSeleccionado(null);
    setPedidoAEditar(null);
    setCantidadesEdicion({});
    setMotivoEdicionForm("");
    setObservacionEdicion("");
    setModoAsignacion("crear");
    setClienteSeleccionadoPedido(null);
    setBusquedaClientePedido("");
    setMostrarDropdownClientes(false);
    setSucursalesClientePedido([]);
    setIdSucursalSeleccionadaPedido(null);
    setCantidadesCreacion({});
    setObservacionCreacion("");
    setBusquedaProductoCreacion("");
    setEsVentaDirectaCreacion(true);
    setIdTipoPagoCreacion(1);
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("Todos");
    setFechaDesde("");
    setFechaHasta("");
  };

  const pendientes = pedidos.filter(
    (pedido) => pedido.estado === "Pendiente"
  ).length;

  const asignados = pedidos.filter(
    (pedido) => pedido.estado === "Asignado"
  ).length;

  const entregados = pedidos.filter(
    (pedido) => pedido.estado === "Entregado"
  ).length;

  const devueltos = pedidos.filter(
    (pedido) => pedido.estado === "Devuelto" || Boolean(pedido.motivoDevolucion)
  ).length;

  return (
    <ScrollView
      style={[
        styles.pagina,
        { backgroundColor: colors.background },
      ]}
      contentContainerStyle={styles.contenido}
    >
      <View style={styles.encabezado}>
        <View>
          <Text
            style={[
              styles.titulo,
              isDark && { color: colors.text },
            ]}
          >
            Asignación de pedidos
          </Text>
          <Text
            style={[
              styles.subtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Gestiona pedidos y distribuciones de BADY&apos;S.
          </Text>
        </View>

        <Pressable
          onPress={abrirCrearPedido}
          style={({ pressed }) => [
            styles.botonNuevoPedido,
            { backgroundColor: colors.primary },
            pressed && { opacity: 0.8 },
          ]}
        >
          <Ionicons name="cart-outline" size={20} color="#ffffff" />
          <Text style={styles.botonNuevoPedidoTexto}>
            Nuevo Pedido / Venta Mostrador
          </Text>
        </Pressable>
      </View>

      <View style={styles.resumen}>
        <Resumen valor={pedidos.length} texto="Total pedidos" />
        <Resumen valor={pendientes} texto="Pendientes" />
        <Resumen valor={asignados} texto="Asignados" />
        <Resumen valor={entregados} texto="Entregados" />
        <Resumen valor={devueltos} texto="Devueltos" />
      </View>

      <View
        style={[
          styles.tarjeta,
          isDark && {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.herramientas,
            isDark && { borderBottomColor: colors.borderLight },
          ]}
        >
          <View
            style={[
              styles.buscador,
              isDark && {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.inputPlaceholder}
            />
            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar por cliente, sucursal o pedido..."
              placeholderTextColor={colors.inputPlaceholder}
              style={[
                styles.inputBusqueda,
                isDark && { color: colors.text },
              ]}
            />
          </View>

          <View style={styles.filtros}>
            <View style={styles.grupoFiltro}>
              <Text
                style={[
                  styles.filtroEtiqueta,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Estado
              </Text>
              <View
                style={[
                  styles.selectorCaja,
                  isDark && {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                  },
                ]}
              >
                <Picker
                  selectedValue={estadoFiltro}
                  onValueChange={(valor) => setEstadoFiltro(String(valor))}
                  style={[
                    styles.selector,
                    {
                      backgroundColor: isDark ? colors.inputBg : "#ffffff",
                      color: isDark ? colors.text : "#1f2329",
                    },
                  ]}
                  dropdownIconColor={colors.textSecondary}
                >
                  {ESTADOS_PEDIDO.map((estado) => (
                    <Picker.Item
                      key={estado}
                      label={formatearEstado(estado)}
                      value={estado}
                      color={isDark ? "#f3f4f6" : "#1f2329"}
                      style={{
                        backgroundColor: isDark ? "#1a1d21" : "#ffffff",
                        color: isDark ? "#f3f4f6" : "#1f2329",
                      }}
                    />
                  ))}
                </Picker>
              </View>
            </View>

            <View style={styles.grupoFiltro}>
              <Text
                style={[
                  styles.filtroEtiqueta,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Desde
              </Text>
              <BotonFecha
                valor={fechaDesde}
                placeholder="Elegir fecha"
                onPress={() => setModal("calendarioDesde")}
              />
            </View>

            <View style={styles.grupoFiltro}>
              <Text
                style={[
                  styles.filtroEtiqueta,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Hasta
              </Text>
              <BotonFecha
                valor={fechaHasta}
                placeholder="Elegir fecha"
                onPress={() => setModal("calendarioHasta")}
              />
            </View>

            {(busqueda ||
              estadoFiltro !== "Todos" ||
              fechaDesde ||
              fechaHasta) && (
              <Pressable
                onPress={limpiarFiltros}
                style={[
                  styles.botonLimpiar,
                  isDark && {
                    backgroundColor: colors.dangerBg,
                    borderColor: colors.dangerBorder,
                  },
                ]}
              >
                <Ionicons
                  name="close-circle-outline"
                  size={18}
                  color={colors.dangerText}
                />
                <Text
                  style={[
                    styles.botonLimpiarTexto,
                    { color: colors.dangerText },
                  ]}
                >
                  Limpiar
                </Text>
              </Pressable>
            )}

            <Pressable
              onPress={cargarTodo}
              style={[
                styles.botonSecundario,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={isDark ? colors.text : "#1f2329"}
              />
              <Text
                style={[
                  styles.botonSecundarioTexto,
                  isDark && { color: colors.text },
                ]}
              >
                Actualizar
              </Text>
            </Pressable>
          </View>
        </View>

        {cargando ? (
          <View style={styles.vacio}>
            <ActivityIndicator size="large" color={colors.primary} />
          </View>
        ) : pedidosFiltrados.length === 0 ? (
          <View style={styles.vacio}>
            <Ionicons
              name="receipt-outline"
              size={46}
              color={colors.textMuted}
            />
            <Text
              style={[
                styles.vacioTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              No se encontraron pedidos.
            </Text>
          </View>
        ) : (
          <View style={styles.tabla}>
            <View
              style={[
                styles.filaHead,
                isDark && { backgroundColor: colors.surfaceElevated },
              ]}
            >
              <Head texto="ID" estilo={styles.colId} />
              <Head texto="Cliente" estilo={styles.colCliente} />
              <Head texto="Sucursal" estilo={styles.colSucursal} />
              <Head texto="Fecha" estilo={styles.colFecha} />
              <Head texto="Cantidad" estilo={styles.colCantidad} />
              <Head texto="Total" estilo={styles.colTotal} />
              <Head texto="Estado" estilo={styles.colEstado} />
              <Head texto="Acciones" estilo={styles.colAcciones} />
            </View>

            {pedidosPaginados.map((pedido) => {
              const asignacion = obtenerAsignacionPedido(pedido.id);

              return (
                <View
                  key={pedido.id}
                  style={[
                    styles.fila,
                    isDark && {
                      backgroundColor: colors.card,
                      borderTopColor: colors.borderLight,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.celda,
                      styles.colId,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    #{pedido.id}
                  </Text>

                  <View
                    style={[
                      styles.clienteCelda,
                      styles.colCliente,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatar,
                        isDark && { backgroundColor: colors.surfaceElevated },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarTexto,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {(pedido.cliente || "C").charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={styles.clienteInfo}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.clienteNombre,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {pedido.cliente || "Cliente"}
                      </Text>
                      <Text
                        style={[
                          styles.clienteSecundario,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Cliente #{pedido.idCliente}
                      </Text>
                    </View>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.celda,
                      styles.colSucursal,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {pedido.sucursal || "Sin sucursal"}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colFecha,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {formatearFecha(pedido.fechaPedido)}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colCantidad,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {cantidadProductos(pedido)} uds.
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colTotal,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Bs {formatearDinero(pedido.total)}
                  </Text>

                  <View style={styles.colEstado}>
                    <EstadoBadge estado={pedido.estado} />
                    {(pedido.estado === "Devuelto" ||
                      !!pedido.motivoDevolucion) && (
                      <View
                        style={{
                          marginTop: 4,
                          paddingHorizontal: 6,
                          paddingVertical: 2,
                          backgroundColor: isDark
                            ? "rgba(220, 38, 38, 0.2)"
                            : "#fee2e2",
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: isDark
                            ? "rgba(220, 38, 38, 0.4)"
                            : "#fca5a5",
                          maxWidth: 160,
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 10,
                            color: isDark ? "#f87171" : "#b91c1c",
                            fontWeight: "700",
                          }}
                          numberOfLines={2}
                        >
                          Motivo: {pedido.motivoDevolucion || "Sin motivo"}
                        </Text>
                      </View>
                    )}
                  </View>

                  <View
                    style={[
                      styles.accionesCelda,
                      styles.colAcciones,
                    ]}
                  >
                    <Accion
                      icono="eye-outline"
                      tipo="detalle"
                      onPress={() => abrirDetallePedido(pedido)}
                    />

                    {pedido.estado === "Pendiente" && (
                      <>
                        <Accion
                          icono="create-outline"
                          tipo="editarPedido"
                          onPress={() => abrirEditarPedido(pedido)}
                        />
                        <Accion
                          icono="person-add-outline"
                          tipo="asignar"
                          onPress={() => abrirAsignar(pedido)}
                        />
                      </>
                    )}

                    {asignacion && (
                      <Accion
                        icono="car-outline"
                        tipo="asignacion"
                        onPress={() => abrirDetalleAsignacion(pedido)}
                      />
                    )}

                    {pedido.estado === "Asignado" &&
                      asignacion?.estadoAsignacion === "Asignado" && (
                        <Accion
                          icono="swap-horizontal-outline"
                          tipo="editar"
                          onPress={() => abrirEditarAsignacion(pedido)}
                        />
                      )}
                  </View>
                </View>
              );
            })}

            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              totalRegistros={totalRegistros}
              registrosPorPagina={registrosPorPagina}
              onCambiarPagina={setPaginaActual}
              onCambiarRegistrosPorPagina={setRegistrosPorPagina}
            />
          </View>
        )}
      </View>

      {/* Modal Detalle Pedido */}
      <Modal
        visible={modal === "detallePedido"}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modal,
              styles.modalAmplio,
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <ModalHeader
              titulo="Detalle del pedido"
              onCerrar={cerrarModal}
            />

            {procesando || !pedidoSeleccionado ? (
              <View style={styles.vacio}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView style={styles.modalBody}>
                {!!pedidoSeleccionado.motivoEdicion && (
                  <View style={styles.bannerMotivoEdicion}>
                    <View style={styles.bannerMotivoEdicionHeader}>
                      <Ionicons name="alert-circle" size={18} color="#b45309" />
                      <Text style={styles.bannerMotivoEdicionTitulo}>
                        Pedido editado por administración
                      </Text>
                    </View>
                    <Text style={styles.bannerMotivoEdicionTexto}>
                      Motivo: {pedidoSeleccionado.motivoEdicion}
                    </Text>
                  </View>
                )}

                {(pedidoSeleccionado.estado === "Devuelto" ||
                  !!pedidoSeleccionado.motivoDevolucion) && (
                  <View
                    style={{
                      marginBottom: 16,
                      padding: 14,
                      borderRadius: 12,
                      backgroundColor: isDark
                        ? "rgba(220, 38, 38, 0.18)"
                        : "#fef2f2",
                      borderWidth: 1.5,
                      borderColor: isDark
                        ? "rgba(220, 38, 38, 0.45)"
                        : "#f87171",
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
                        Pedido Devuelto por el Cliente
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
                      Justificación / Motivo de Devolución:
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
                        "El cliente reportó que no recibió el pedido."}
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
                        Fecha de Devolución:{" "}
                        {formatearFecha(pedidoSeleccionado.fechaDevolucion)}
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.detalleGrid}>
                  <Dato
                    etiqueta="ID del Pedido"
                    valor={`#${pedidoSeleccionado.id}`}
                  />
                  <Dato
                    etiqueta="Cliente"
                    valor={pedidoSeleccionado.cliente || "Sin cliente"}
                  />
                  <Dato
                    etiqueta="Sucursal"
                    valor={pedidoSeleccionado.sucursal || "Sin sucursal"}
                  />
                  <Dato
                    etiqueta="Fecha"
                    valor={formatearFecha(pedidoSeleccionado.fechaPedido)}
                  />
                  <Dato
                    etiqueta="Estado"
                    valor={formatearEstado(pedidoSeleccionado.estado)}
                  />
                  <Dato
                    etiqueta="Total"
                    valor={`Bs ${formatearDinero(pedidoSeleccionado.total)}`}
                  />
                </View>

                <Text
                  style={[
                    styles.seccionTitulo,
                    isDark && { color: colors.text },
                  ]}
                >
                  Productos del pedido ({pedidoSeleccionado.detalles.length})
                </Text>

                {pedidoSeleccionado.detalles.length === 0 ? (
                  <Text
                    style={[
                      styles.vacioTexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    Este pedido no contiene productos registrados.
                  </Text>
                ) : (
                  pedidoSeleccionado.detalles.map((detalle, indice) => (
                    <View
                      key={`${detalle.idProducto}-${indice}`}
                      style={[
                        styles.productoCard,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.productoInfo}>
                        <Text
                          style={[
                            styles.productoNombre,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {detalle.producto}
                        </Text>
                        <Text
                          style={[
                            styles.productoSecundario,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          {detalle.cantidad} x Bs {formatearDinero(detalle.precioUnitario)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.productoSubtotal,
                          isDark && { color: colors.text },
                        ]}
                      >
                        Bs {formatearDinero(detalle.subtotal)}
                      </Text>
                    </View>
                  ))
                )}
              </ScrollView>
            )}

            <View style={styles.modalAcciones}>
              <Pressable
                onPress={cerrarModal}
                style={[
                  styles.botonModal,
                  styles.botonCancelar,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelarTexto,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cerrar
                </Text>
              </Pressable>

              {pedidoSeleccionado?.estado === "Pendiente" && (
                <Pressable
                  onPress={() => {
                    const p = pedidoSeleccionado;
                    cerrarModal();
                    abrirEditarPedido(p);
                  }}
                  style={[
                    styles.botonModal,
                    styles.botonConfirmar,
                    { backgroundColor: "#0284c7" },
                  ]}
                >
                  <Text style={styles.confirmarTexto}>Editar Pedido</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Asignar Repartidor */}
      <Modal
        visible={modal === "asignar"}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modal,
              styles.modalAmplio,
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <ModalHeader
              titulo={
                modoAsignacion === "editar"
                  ? "Cambiar vehículo de reparto"
                  : "Asignar vehículo de reparto"
              }
              onCerrar={cerrarModal}
            />

            <ScrollView style={styles.modalBody}>
              {pedidoSeleccionado && (
                <View
                  style={[
                    styles.datoCard,
                    { marginBottom: 15 },
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.asignacionNombre,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Pedido #{pedidoSeleccionado.id} ·{" "}
                    {pedidoSeleccionado.cliente || "Cliente"}
                  </Text>
                  <Text
                    style={[
                      styles.asignacionSecundario,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Sucursal: {pedidoSeleccionado.sucursal || "Sin sucursal"} ·
                    Total: Bs {formatearDinero(pedidoSeleccionado.total)}
                  </Text>
                </View>
              )}

              <Text
                style={[
                  styles.seccionTitulo,
                  { marginTop: 0 },
                  isDark && { color: colors.text },
                ]}
              >
                Selecciona un vehículo disponible
              </Text>

              {vehiculosAsignables.length === 0 ? (
                <Text
                  style={[
                    styles.vacioTexto,
                    isDark && { color: colors.textMuted },
                  ]}
                >
                  No hay vehículos con personal activo asignado para repartir.
                </Text>
              ) : (
                <View style={{ gap: 10 }}>
                  {vehiculosAsignables.map((v) => {
                    const seleccionado = idVehiculoSeleccionado === v.idVehiculo;

                    return (
                      <Pressable
                        key={v.idVehiculo}
                        onPress={() => setIdVehiculoSeleccionado(v.idVehiculo)}
                        style={[
                          styles.selectorAsignacionCard,
                          isDark && {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.border,
                          },
                          seleccionado && [
                            styles.selectorAsignacionSeleccionada,
                            { borderColor: colors.primary },
                            isDark && { backgroundColor: "rgba(200, 35, 27, 0.15)" },
                          ],
                        ]}
                      >
                        <View
                          style={[
                            styles.iconoVehiculoModal,
                            isDark && { backgroundColor: colors.primary },
                          ]}
                        >
                          <Ionicons
                            name="car-sport-outline"
                            size={20}
                            color="#ffffff"
                          />
                        </View>

                        <View style={styles.asignacionInfo}>
                          <Text
                            style={[
                              styles.asignacionNombre,
                              isDark && { color: colors.text },
                            ]}
                          >
                            {v.vehiculo}
                          </Text>
                          <Text
                            style={[
                              styles.asignacionSecundario,
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            Placa: {v.placa || "Sin placa"} · Carga:{" "}
                            {v.cantidadCarga}
                          </Text>

                          {v.asignaciones.length > 0 && (
                            <View style={styles.personalVehiculo}>
                              <Ionicons
                                name="person-outline"
                                size={14}
                                color={colors.textSecondary}
                              />
                              <Text
                                numberOfLines={1}
                                style={[
                                  styles.personalVehiculoTexto,
                                  isDark && { color: colors.textSecondary },
                                ]}
                              >
                                {v.asignaciones.map((a) => a.usuario).join(", ")}
                              </Text>
                            </View>
                          )}
                        </View>

                        <View
                          style={[
                            styles.radio,
                            seleccionado && [
                              styles.radioSeleccionado,
                              { borderColor: colors.primary },
                            ],
                          ]}
                        >
                          {seleccionado && (
                            <View
                              style={[
                                styles.radioPunto,
                                { backgroundColor: colors.primary },
                              ]}
                            />
                          )}
                        </View>
                      </Pressable>
                    );
                  })}
                </View>
              )}
            </ScrollView>

            <View style={styles.modalAcciones}>
              <Pressable
                onPress={cerrarModal}
                disabled={procesando}
                style={[
                  styles.botonModal,
                  styles.botonCancelar,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelarTexto,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                onPress={confirmarAsignacion}
                disabled={procesando}
                style={[
                  styles.botonModal,
                  styles.botonConfirmar,
                  { backgroundColor: colors.primary },
                ]}
              >
                {procesando ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.confirmarTexto}>
                    {modoAsignacion === "editar"
                      ? "Guardar cambio"
                      : "Confirmar asignación"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Detalle Asignación */}
      <Modal
        visible={modal === "detalleAsignacion"}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modal,
              styles.modalAmplio,
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <ModalHeader
              titulo="Detalle de la asignación"
              onCerrar={cerrarModal}
            />

            {asignacionSeleccionada ? (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detalleGrid}>
                  <Dato
                    etiqueta="ID Asignación"
                    valor={`#${asignacionSeleccionada.id}`}
                  />
                  <Dato
                    etiqueta="Pedido"
                    valor={`#${asignacionSeleccionada.idPedido}`}
                  />
                  <Dato
                    etiqueta="Vehículo"
                    valor={asignacionSeleccionada.vehiculo}
                  />
                  <Dato
                    etiqueta="Placa"
                    valor={asignacionSeleccionada.placa || "Sin placa"}
                  />
                  <Dato
                    etiqueta="Repartidor"
                    valor={asignacionSeleccionada.usuario}
                  />
                  <Dato
                    etiqueta="Correo"
                    valor={asignacionSeleccionada.correoUsuario || "Sin correo"}
                  />
                  <Dato
                    etiqueta="Fecha asignación"
                    valor={formatearFecha(asignacionSeleccionada.fechaAsignacion)}
                  />
                  <Dato
                    etiqueta="Estado"
                    valor={asignacionSeleccionada.estadoAsignacion}
                  />
                </View>
              </ScrollView>
            ) : null}

            <View style={styles.modalAcciones}>
              <Pressable
                onPress={cerrarModal}
                style={[
                  styles.botonModal,
                  styles.botonCancelar,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelarTexto,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cerrar
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Editar Pedido (Administrador) */}
      <Modal
        visible={modal === "editarPedido"}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modal,
              styles.modalAmplio,
              { maxHeight: "90%" },
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <ModalHeader
              titulo={`Editar Pedido #${pedidoAEditar?.id}`}
              onCerrar={cerrarModal}
            />

            {procesando || !pedidoAEditar ? (
              <View style={styles.vacio}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
              >
                {/* Banner Explicativo */}
                <View
                  style={[
                    styles.bannerMotivoEdicion,
                    {
                      backgroundColor: isDark
                        ? "rgba(59, 130, 246, 0.15)"
                        : "#eff6ff",
                      borderColor: isDark
                        ? "rgba(59, 130, 246, 0.35)"
                        : "#bfdbfe",
                    },
                  ]}
                >
                  <View style={styles.bannerMotivoEdicionHeader}>
                    <Ionicons
                      name="information-circle"
                      size={18}
                      color={isDark ? "#60a5fa" : "#2563eb"}
                    />
                    <Text
                      style={[
                        styles.bannerMotivoEdicionTitulo,
                        { color: isDark ? "#60a5fa" : "#1e40af" },
                      ]}
                    >
                      Modificación de Pedido Pendiente
                    </Text>
                  </View>
                  <Text
                    style={[
                      styles.bannerMotivoEdicionTexto,
                      { color: isDark ? "#93c5fd" : "#1e3a8a" },
                    ]}
                  >
                    Cliente: {pedidoAEditar.cliente} (
                    {pedidoAEditar.sucursal || "Sin sucursal"}).
                    Al guardar los cambios, el cliente recibirá una notificación
                    con el motivo indicado.
                  </Text>
                </View>

                {/* Lista de Productos para Modificar */}
                <Text
                  style={[
                    styles.seccionTitulo,
                    isDark && { color: colors.text },
                  ]}
                >
                  Productos y Cantidades
                </Text>

                {(() => {
                  const productosAMostrar = [...(pedidoAEditar.detalles || [])];

                  productosDisponibles.forEach((p) => {
                    if (
                      !productosAMostrar.some(
                        (det) => det.idProducto === p.id
                      )
                    ) {
                      productosAMostrar.push({
                        id: 0,
                        idProducto: p.id,
                        producto: p.nombre,
                        cantidad: 0,
                        precioUnitario: p.precio,
                        subtotal: 0,
                        estado: "Pendiente",
                      });
                    }
                  });

                  return productosAMostrar.map((item) => {
                    const cant =
                      cantidadesEdicion[item.idProducto] ??
                      item.cantidad ??
                      0;
                    const precio = item.precioUnitario;
                    const subtotal = cant * precio;

                    return (
                      <View
                        key={`edicion-prod-${item.idProducto}`}
                        style={[
                          styles.itemEdicionProducto,
                          isDark && {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={{ flex: 1, paddingRight: 10 }}>
                          <Text
                            style={[
                              styles.productoNombre,
                              isDark && { color: colors.text },
                            ]}
                          >
                            {item.producto}
                          </Text>
                          <Text
                            style={[
                              styles.productoSecundario,
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            Precio: Bs {formatearDinero(precio)}{" "}
                            {cant > 0
                              ? `· Subtotal: Bs ${formatearDinero(subtotal)}`
                              : ""}
                          </Text>
                        </View>

                        <View style={styles.controlCantidad}>
                          <Pressable
                            onPress={() =>
                              cambiarCantidadEdicion(item.idProducto, -1)
                            }
                            disabled={cant <= 0}
                            style={[
                              styles.botonCantidad,
                              cant <= 0 && { opacity: 0.4 },
                              isDark && {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.border,
                              },
                            ]}
                          >
                            <Ionicons
                              name="remove"
                              size={16}
                              color={isDark ? colors.text : "#333"}
                            />
                          </Pressable>

                          <Text
                            style={[
                              styles.cantidadTexto,
                              isDark && { color: colors.text },
                            ]}
                          >
                            {cant}
                          </Text>

                          <Pressable
                            onPress={() =>
                              cambiarCantidadEdicion(item.idProducto, 1)
                            }
                            style={[
                              styles.botonCantidad,
                              isDark && {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.border,
                              },
                            ]}
                          >
                            <Ionicons
                              name="add"
                              size={16}
                              color={isDark ? colors.text : "#333"}
                            />
                          </Pressable>
                        </View>
                      </View>
                    );
                  });
                })()}

                {/* Resumen de Total */}
                <View
                  style={[
                    styles.resumenTotalEdicion,
                    isDark && { borderTopColor: colors.borderLight },
                  ]}
                >
                  <Text
                    style={[
                      styles.totalEdicionTexto,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Nuevo Total Recalculado:
                  </Text>
                  <Text style={styles.totalEdicionValor}>
                    Bs {formatearDinero(totalCalculadoEdicionAdmin)}
                  </Text>
                </View>

                {/* Campo Observación */}
                <View style={{ marginTop: 14 }}>
                  <Text
                    style={[
                      styles.campoLabel,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Observación de Entrega (Opcional)
                  </Text>
                  <TextInput
                    value={observacionEdicion}
                    onChangeText={setObservacionEdicion}
                    placeholder="Ej: Entregar por la puerta trasera..."
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[
                      styles.inputObservacion,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                  />
                </View>

                {/* Campo Motivo de Edición (OBLIGATORIO) */}
                <View style={{ marginTop: 14, marginBottom: 16 }}>
                  <Text
                    style={[
                      styles.campoLabel,
                      { color: isDark ? "#fbbf24" : "#b45309" },
                    ]}
                  >
                    Motivo de la Edición * (Notificación al Cliente)
                  </Text>
                  <TextInput
                    value={motivoEdicionForm}
                    onChangeText={setMotivoEdicionForm}
                    placeholder="Ej: Se redujo de 10 a 5 bidones por solicitud telefónica del cliente..."
                    placeholderTextColor={colors.inputPlaceholder}
                    multiline
                    numberOfLines={3}
                    style={[
                      styles.inputMotivoEdicion,
                      isDark && {
                        backgroundColor: "rgba(245, 158, 11, 0.12)",
                        borderColor: "rgba(245, 158, 11, 0.45)",
                        color: colors.text,
                      },
                    ]}
                  />
                </View>
              </ScrollView>
            )}

            <View style={styles.modalAcciones}>
              <Pressable
                onPress={cerrarModal}
                style={[
                  styles.botonModal,
                  styles.botonCancelar,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelarTexto,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                disabled={procesando}
                onPress={guardarEdicionPedido}
                style={[
                  styles.botonModal,
                  styles.botonConfirmar,
                  { backgroundColor: colors.primary },
                  procesando && { opacity: 0.6 },
                ]}
              >
                {procesando ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.confirmarTexto}>Guardar Cambios</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Crear Pedido / Venta Mostrador por Administrador */}
      <Modal
        visible={modal === "crearPedido"}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modal,
              styles.modalAmplio,
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <ModalHeader
              titulo={
                esVentaDirectaCreacion
                  ? "🏢 Venta Directa en Mostrador"
                  : "➕ Nuevo Pedido para Distribución"
              }
              onCerrar={cerrarModal}
            />

            {cargandoClientesPedido ? (
              <View
                style={[
                  styles.modalBody,
                  {
                    minHeight: 280,
                    justifyContent: "center",
                    alignItems: "center",
                  },
                ]}
              >
                <ActivityIndicator size="large" color={colors.primary} />
                <Text
                  style={{
                    marginTop: 12,
                    color: colors.textSecondary,
                    fontSize: 13,
                  }}
                >
                  Cargando clientes y productos...
                </Text>
              </View>
            ) : (
              <ScrollView
                style={styles.modalBody}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                {/* SELECTOR DE MODALIDAD */}
                <View style={styles.tipoVentaContenedor}>
                  <Pressable
                    onPress={() => setEsVentaDirectaCreacion(true)}
                    style={[
                      styles.tipoVentaBoton,
                      esVentaDirectaCreacion && styles.tipoVentaBotonActivo,
                      isDark && {
                        backgroundColor: esVentaDirectaCreacion
                          ? "rgba(184, 32, 24, 0.15)"
                          : colors.surfaceElevated,
                        borderColor: esVentaDirectaCreacion
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="storefront-outline"
                      size={20}
                      color={
                        esVentaDirectaCreacion
                          ? colors.primary
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.tipoVentaBotonTexto,
                        esVentaDirectaCreacion && styles.tipoVentaBotonTextoActivo,
                        isDark && {
                          color: esVentaDirectaCreacion
                            ? colors.primary
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      🏢 Venta Mostrador
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => setEsVentaDirectaCreacion(false)}
                    style={[
                      styles.tipoVentaBoton,
                      !esVentaDirectaCreacion && styles.tipoVentaBotonActivo,
                      isDark && {
                        backgroundColor: !esVentaDirectaCreacion
                          ? "rgba(184, 32, 24, 0.15)"
                          : colors.surfaceElevated,
                        borderColor: !esVentaDirectaCreacion
                          ? colors.primary
                          : colors.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name="bicycle-outline"
                      size={20}
                      color={
                        !esVentaDirectaCreacion
                          ? colors.primary
                          : colors.textSecondary
                      }
                    />
                    <Text
                      style={[
                        styles.tipoVentaBotonTexto,
                        !esVentaDirectaCreacion && styles.tipoVentaBotonTextoActivo,
                        isDark && {
                          color: !esVentaDirectaCreacion
                            ? colors.primary
                            : colors.textSecondary,
                        },
                      ]}
                    >
                      🚚 Para Distribución
                    </Text>
                  </Pressable>
                </View>

                {esVentaDirectaCreacion ? (
                  <View
                    style={[
                      styles.bannerVentaDirecta,
                      isDark && {
                        backgroundColor: "rgba(22, 101, 52, 0.15)",
                        borderColor: "rgba(34, 197, 94, 0.3)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color={isDark ? "#4ade80" : "#166534"}
                    />
                    <Text
                      style={[
                        styles.bannerVentaDirectaTexto,
                        isDark && { color: "#86efac" },
                      ]}
                    >
                      Venta directa en local: Se marca automáticamente como Entregada, descuenta stock de inmediato y registra el cobro en caja.
                    </Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.bannerVentaDirecta,
                      {
                        backgroundColor: "#eff6ff",
                        borderColor: "#bfdbfe",
                      },
                      isDark && {
                        backgroundColor: "rgba(30, 58, 138, 0.15)",
                        borderColor: "rgba(59, 130, 246, 0.3)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="information-circle"
                      size={20}
                      color={isDark ? "#60a5fa" : "#1d4ed8"}
                    />
                    <Text
                      style={[
                        styles.bannerVentaDirectaTexto,
                        { color: "#1e40af" },
                        isDark && { color: "#93c5fd" },
                      ]}
                    >
                      Pedido para reparto: Se creará como Pendiente para ser asignado a un repartidor o camión de distribución.
                    </Text>
                  </View>
                )}

                {/* 1. SELECCIÓN DE CLIENTE */}
                <Text
                  style={[
                    styles.seccionTitulo,
                    { marginTop: 4 },
                    isDark && { color: colors.text },
                  ]}
                >
                  1. Seleccionar Cliente *
                </Text>

                {clienteSeleccionadoPedido ? (
                  <View
                    style={[
                      styles.tarjetaClienteSeleccionado,
                      isDark && {
                        backgroundColor: "rgba(37, 99, 235, 0.15)",
                        borderColor: "#3b82f6",
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        flex: 1,
                      }}
                    >
                      <View
                        style={[
                          styles.avatar,
                          {
                            backgroundColor: clienteSeleccionadoPedido.tieneAccesoApp
                              ? "#2563eb"
                              : "#475569",
                            width: 40,
                            height: 40,
                            borderRadius: 20,
                          },
                        ]}
                      >
                        <Text
                          style={{
                            color: "#ffffff",
                            fontWeight: "900",
                            fontSize: 15,
                          }}
                        >
                          {clienteSeleccionadoPedido.nombre
                            .charAt(0)
                            .toUpperCase()}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={[
                            styles.productoNombre,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {clienteSeleccionadoPedido.nombre}
                        </Text>
                        <Text
                          style={[
                            styles.productoSecundario,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          📞 {clienteSeleccionadoPedido.numero}{" "}
                          {clienteSeleccionadoPedido.email
                            ? `• ✉️ ${clienteSeleccionadoPedido.email}`
                            : ""}
                        </Text>
                        <View
                          style={{
                            marginTop: 4,
                            flexDirection: "row",
                            gap: 6,
                          }}
                        >
                          {clienteSeleccionadoPedido.tieneAccesoApp ? (
                            <View style={styles.badgeClienteApp}>
                              <Ionicons
                                name="phone-portrait-outline"
                                size={12}
                                color="#1d4ed8"
                              />
                              <Text
                                style={[
                                  styles.badgeClienteTexto,
                                  { color: "#1d4ed8" },
                                ]}
                              >
                                App Móvil
                              </Text>
                            </View>
                          ) : (
                            <View style={styles.badgeClientePresencial}>
                              <Ionicons
                                name="storefront-outline"
                                size={12}
                                color="#475569"
                              />
                              <Text
                                style={[
                                  styles.badgeClienteTexto,
                                  { color: "#475569" },
                                ]}
                              >
                                Presencial / Mostrador
                              </Text>
                            </View>
                          )}
                        </View>
                      </View>
                    </View>

                    <Pressable
                      onPress={() => {
                        setClienteSeleccionadoPedido(null);
                        setBusquedaClientePedido("");
                        setMostrarDropdownClientes(true);
                      }}
                      style={[
                        styles.botonCambiarCliente,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.botonCambiarClienteTexto,
                          isDark && { color: "#93c5fd" },
                        ]}
                      >
                        Cambiar
                      </Text>
                    </Pressable>
                  </View>
                ) : (
                  <View style={styles.cajaBuscadorCliente}>
                    <View
                      style={[
                        styles.buscador,
                        { maxWidth: "100%", width: "100%" },
                        isDark && {
                          backgroundColor: colors.inputBg,
                          borderColor: colors.inputBorder,
                        },
                      ]}
                    >
                      <Ionicons
                        name="search-outline"
                        size={18}
                        color={colors.inputPlaceholder}
                      />
                      <TextInput
                        value={busquedaClientePedido}
                        onChangeText={(t) => {
                          setBusquedaClientePedido(t);
                          setMostrarDropdownClientes(true);
                        }}
                        onFocus={() => setMostrarDropdownClientes(true)}
                        placeholder="Escribe el nombre o teléfono del cliente..."
                        placeholderTextColor={colors.inputPlaceholder}
                        style={[
                          styles.inputBusqueda,
                          isDark && { color: colors.text },
                        ]}
                      />
                      {busquedaClientePedido ? (
                        <Pressable
                          onPress={() => setBusquedaClientePedido("")}
                        >
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color={colors.inputPlaceholder}
                          />
                        </Pressable>
                      ) : null}
                    </View>

                    {mostrarDropdownClientes && (
                      <View
                        style={[
                          styles.dropdownClientes,
                          isDark && {
                            backgroundColor: colors.modalBg,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <ScrollView
                          style={{ maxHeight: 200 }}
                          nestedScrollEnabled
                          keyboardShouldPersistTaps="handled"
                        >
                          {clientesFiltradosPedido.length === 0 ? (
                            <View
                              style={{
                                padding: 14,
                                alignItems: "center",
                              }}
                            >
                              <Text
                                style={{
                                  color: colors.textSecondary,
                                  fontSize: 13,
                                }}
                              >
                                No se encontraron clientes activos con ese término.
                              </Text>
                            </View>
                          ) : (
                            clientesFiltradosPedido.map((c) => (
                              <Pressable
                                key={c.id}
                                onPress={() =>
                                  seleccionarClienteParaPedido(c)
                                }
                                style={({ pressed }) => [
                                  styles.itemClienteDropdown,
                                  isDark && {
                                    borderBottomColor: colors.borderLight,
                                  },
                                  pressed && {
                                    backgroundColor: isDark
                                      ? colors.surfaceElevated
                                      : "#f8fafc",
                                  },
                                ]}
                              >
                                <View style={{ flex: 1 }}>
                                  <Text
                                    style={[
                                      styles.itemClienteDropdownNombre,
                                      isDark && { color: colors.text },
                                    ]}
                                  >
                                    {c.nombre}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.itemClienteDropdownSub,
                                      isDark && {
                                        color: colors.textSecondary,
                                      },
                                    ]}
                                  >
                                    Tel: {c.numero}{" "}
                                    {c.email ? `• ${c.email}` : ""}
                                  </Text>
                                </View>
                                {c.tieneAccesoApp ? (
                                  <View style={styles.badgeClienteApp}>
                                    <Text
                                      style={[
                                        styles.badgeClienteTexto,
                                        { color: "#1d4ed8" },
                                      ]}
                                    >
                                      App
                                    </Text>
                                  </View>
                                ) : (
                                  <View
                                    style={styles.badgeClientePresencial}
                                  >
                                    <Text
                                      style={[
                                        styles.badgeClienteTexto,
                                        { color: "#475569" },
                                      ]}
                                    >
                                      Presencial
                                    </Text>
                                  </View>
                                )}
                              </Pressable>
                            ))
                          )}
                        </ScrollView>
                      </View>
                    )}
                  </View>
                )}

                {/* SUCURSAL (Opcional - backend asigna mostrador por defecto si null) */}
                {clienteSeleccionadoPedido &&
                  sucursalesClientePedido.length > 0 && (
                    <View style={{ marginTop: 14 }}>
                      <Text
                        style={[
                          styles.campoLabel,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Sucursal de Entrega (Opcional)
                      </Text>
                      <View
                        style={[
                          styles.selectorCaja,
                          { width: "100%" },
                          isDark && {
                            backgroundColor: colors.inputBg,
                            borderColor: colors.inputBorder,
                          },
                        ]}
                      >
                        <Picker
                          selectedValue={idSucursalSeleccionadaPedido || 0}
                          onValueChange={(val) =>
                            setIdSucursalSeleccionadaPedido(
                              val === 0 ? null : val
                            )
                          }
                          style={[
                            styles.selector,
                            isDark && { color: colors.text },
                          ]}
                          dropdownIconColor={isDark ? colors.text : "#333"}
                        >
                          <Picker.Item
                            label="Sucursal Principal / Mostrador (Por defecto)"
                            value={0}
                          />
                          {sucursalesClientePedido.map((s) => (
                            <Picker.Item
                              key={s.id}
                              label={`${s.nombre}${s.ubicacion ? ` (${s.ubicacion})` : ""}`}
                              value={s.id}
                            />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  )}

                {/* 2. CATÁLOGO DE PRODUCTOS */}
                <View
                  style={{
                    marginTop: 20,
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={[
                      styles.seccionTitulo,
                      { marginTop: 0, marginBottom: 0 },
                      isDark && { color: colors.text },
                    ]}
                  >
                    2. Productos del Pedido *
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      fontWeight: "700",
                      color: colors.textSecondary,
                    }}
                  >
                    {resumenCreacion.totalItems} unidades seleccionadas
                  </Text>
                </View>

                {/* Buscador de productos */}
                <View
                  style={[
                    styles.buscador,
                    {
                      maxWidth: "100%",
                      width: "100%",
                      marginVertical: 10,
                    },
                    isDark && {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <Ionicons
                    name="search-outline"
                    size={17}
                    color={colors.inputPlaceholder}
                  />
                  <TextInput
                    value={busquedaProductoCreacion}
                    onChangeText={setBusquedaProductoCreacion}
                    placeholder="Filtrar productos por nombre o descripción..."
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[
                      styles.inputBusqueda,
                      isDark && { color: colors.text },
                    ]}
                  />
                  {busquedaProductoCreacion ? (
                    <Pressable
                      onPress={() => setBusquedaProductoCreacion("")}
                    >
                      <Ionicons
                        name="close-circle"
                        size={16}
                        color={colors.inputPlaceholder}
                      />
                    </Pressable>
                  ) : null}
                </View>

                {/* Lista de productos con selector de cantidad */}
                {productosFiltradosCreacion.length === 0 ? (
                  <View style={{ padding: 20, alignItems: "center" }}>
                    <Text
                      style={{
                        color: colors.textSecondary,
                        fontSize: 13,
                      }}
                    >
                      No se encontraron productos disponibles.
                    </Text>
                  </View>
                ) : (
                  productosFiltradosCreacion.map((prod) => {
                    const cant = cantidadesCreacion[prod.id] || 0;
                    const subtotalProd = cant * prod.precio;

                    return (
                      <View
                        key={prod.id}
                        style={[
                          styles.itemEdicionProducto,
                          cant > 0 && {
                            borderColor: colors.primary,
                            backgroundColor: isDark
                              ? "rgba(184, 32, 24, 0.12)"
                              : "#fff8f8",
                          },
                          isDark &&
                            cant === 0 && {
                              backgroundColor: colors.card,
                              borderColor: colors.borderLight,
                            },
                        ]}
                      >
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.productoNombre,
                              isDark && { color: colors.text },
                            ]}
                          >
                            {prod.nombre}
                          </Text>
                          <Text
                            style={[
                              styles.productoSecundario,
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            Bs {formatearDinero(prod.precio)} c/u • Stock:{" "}
                            {prod.stock} disp.
                          </Text>
                          {cant > 0 && (
                            <Text
                              style={{
                                marginTop: 4,
                                color: colors.primary,
                                fontSize: 12,
                                fontWeight: "800",
                              }}
                            >
                              Subtotal: Bs {formatearDinero(subtotalProd)}
                            </Text>
                          )}
                        </View>

                        <View style={styles.controlCantidad}>
                          <Pressable
                            onPress={() =>
                              cambiarCantidadCreacion(prod.id, -1)
                            }
                            disabled={cant <= 0}
                            style={[
                              styles.botonCantidad,
                              cant <= 0 && { opacity: 0.35 },
                              isDark && {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.border,
                              },
                            ]}
                          >
                            <Ionicons
                              name="remove"
                              size={16}
                              color={isDark ? colors.text : "#333"}
                            />
                          </Pressable>

                          <Text
                            style={[
                              styles.cantidadTexto,
                              cant > 0 && {
                                color: colors.primary,
                                fontWeight: "900",
                              },
                              isDark && cant === 0 && { color: colors.text },
                            ]}
                          >
                            {cant}
                          </Text>

                          <Pressable
                            onPress={() =>
                              cambiarCantidadCreacion(prod.id, 1)
                            }
                            disabled={
                              prod.stock > 0 && cant >= prod.stock
                            }
                            style={[
                              styles.botonCantidad,
                              prod.stock > 0 &&
                                cant >= prod.stock && { opacity: 0.35 },
                              isDark && {
                                backgroundColor: colors.surfaceElevated,
                                borderColor: colors.border,
                              },
                            ]}
                          >
                            <Ionicons
                              name="add"
                              size={16}
                              color={isDark ? colors.text : "#333"}
                            />
                          </Pressable>
                        </View>
                      </View>
                    );
                  })
                )}

                {/* 3. RESUMEN Y TOTAL */}
                <View
                  style={[
                    styles.resumenCreacionCaja,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.resumenCreacionFila}>
                    <Text
                      style={{
                        fontSize: 13,
                        color: colors.textSecondary,
                      }}
                    >
                      Artículos seleccionados:
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "800",
                        color: isDark ? colors.text : "#1f2329",
                      }}
                    >
                      {resumenCreacion.totalItems} unidades
                    </Text>
                  </View>

                  <View style={styles.resumenCreacionFila}>
                    <Text
                      style={[
                        styles.resumenCreacionTotalTexto,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {esVentaDirectaCreacion ? "Total a Cobrar:" : "Total del Pedido:"}
                    </Text>
                    <Text style={styles.resumenCreacionTotalMonto}>
                      Bs {formatearDinero(resumenCreacion.totalMonto)}
                    </Text>
                  </View>
                </View>

                {/* MÉTODO DE PAGO (SOLO PARA VENTA DIRECTA) */}
                {esVentaDirectaCreacion && (
                  <View style={{ marginTop: 14 }}>
                    <Text
                      style={[
                        styles.campoLabel,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Método de Pago (Cobro Inmediato) *
                    </Text>
                    <View style={styles.contenedorMetodoPago}>
                      <Pressable
                        onPress={() => setIdTipoPagoCreacion(1)}
                        style={[
                          styles.opcionMetodoPago,
                          idTipoPagoCreacion === 1 &&
                            styles.opcionMetodoPagoActiva,
                          isDark && {
                            backgroundColor:
                              idTipoPagoCreacion === 1
                                ? "rgba(22, 163, 74, 0.15)"
                                : colors.surfaceElevated,
                            borderColor:
                              idTipoPagoCreacion === 1
                                ? "#16a34a"
                                : colors.border,
                          },
                        ]}
                      >
                        <Ionicons
                          name="cash-outline"
                          size={20}
                          color={
                            idTipoPagoCreacion === 1
                              ? "#16a34a"
                              : colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.opcionMetodoPagoTexto,
                            idTipoPagoCreacion === 1 &&
                              styles.opcionMetodoPagoTextoActivo,
                            isDark && {
                              color:
                                idTipoPagoCreacion === 1
                                  ? "#4ade80"
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          💵 Efectivo (Caja)
                        </Text>
                      </Pressable>

                      <Pressable
                        onPress={() => setIdTipoPagoCreacion(2)}
                        style={[
                          styles.opcionMetodoPago,
                          idTipoPagoCreacion === 2 &&
                            styles.opcionMetodoPagoActiva,
                          isDark && {
                            backgroundColor:
                              idTipoPagoCreacion === 2
                                ? "rgba(22, 163, 74, 0.15)"
                                : colors.surfaceElevated,
                            borderColor:
                              idTipoPagoCreacion === 2
                                ? "#16a34a"
                                : colors.border,
                          },
                        ]}
                      >
                        <Ionicons
                          name="qr-code-outline"
                          size={20}
                          color={
                            idTipoPagoCreacion === 2
                              ? "#16a34a"
                              : colors.textSecondary
                          }
                        />
                        <Text
                          style={[
                            styles.opcionMetodoPagoTexto,
                            idTipoPagoCreacion === 2 &&
                              styles.opcionMetodoPagoTextoActivo,
                            isDark && {
                              color:
                                idTipoPagoCreacion === 2
                                  ? "#4ade80"
                                  : colors.textSecondary,
                            },
                          ]}
                        >
                          📱 Pago por QR
                        </Text>
                      </Pressable>
                    </View>
                  </View>
                )}

                {/* 4. OBSERVACIÓN (OPCIONAL) */}
                <View style={{ marginTop: 14, marginBottom: 16 }}>
                  <Text
                    style={[
                      styles.campoLabel,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Observación de la Venta (Opcional)
                  </Text>
                  <TextInput
                    value={observacionCreacion}
                    onChangeText={setObservacionCreacion}
                    placeholder="Ej: Venta directa en mostrador 20 Badies, cliente retira inmediatamente..."
                    placeholderTextColor={colors.inputPlaceholder}
                    style={[
                      styles.inputObservacion,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                        color: colors.text,
                      },
                    ]}
                  />
                </View>
              </ScrollView>
            )}

            <View style={styles.modalAcciones}>
              <Pressable
                onPress={cerrarModal}
                style={[
                  styles.botonModal,
                  styles.botonCancelar,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelarTexto,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                disabled={
                  procesando ||
                  cargandoClientesPedido ||
                  !clienteSeleccionadoPedido ||
                  resumenCreacion.totalItems <= 0
                }
                onPress={guardarNuevoPedido}
                style={[
                  styles.botonModal,
                  styles.botonConfirmar,
                  {
                    backgroundColor: esVentaDirectaCreacion
                      ? "#16a34a"
                      : colors.primary,
                  },
                  (procesando ||
                    cargandoClientesPedido ||
                    !clienteSeleccionadoPedido ||
                    resumenCreacion.totalItems <= 0) && {
                    opacity: 0.5,
                  },
                ]}
              >
                {procesando ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.confirmarTexto}>
                    {esVentaDirectaCreacion
                      ? "💵 Registrar Cobro y Entrega Inmediata"
                      : "Confirmar y Crear Pedido"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Calendario Desde */}
      <Calendario
        visible={modal === "calendarioDesde"}
        valor={fechaDesde}
        maximo={fechaHasta || undefined}
        onSeleccionar={(f) => {
          setFechaDesde(f);
          setModal("ninguno");
        }}
        onCerrar={() => setModal("ninguno")}
      />

      {/* Calendario Hasta */}
      <Calendario
        visible={modal === "calendarioHasta"}
        valor={fechaHasta}
        minimo={fechaDesde || undefined}
        onSeleccionar={(f) => {
          setFechaHasta(f);
          setModal("ninguno");
        }}
        onCerrar={() => setModal("ninguno")}
      />

      {/* Modal Mensaje */}
      <Modal
        visible={modal === "mensaje"}
        transparent
        animationType="fade"
        onRequestClose={() => setModal("ninguno")}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.mensajeModal,
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons
              name={
                esError
                  ? "alert-circle-outline"
                  : "checkmark-circle-outline"
              }
              size={48}
              color={esError ? colors.dangerText : (isDark ? "#4ade80" : "#15803d")}
            />
            <Text
              style={[
                styles.mensajeTitulo,
                isDark && { color: colors.text },
              ]}
            >
              {esError ? "Ocurrió un problema" : "Operación exitosa"}
            </Text>
            <Text
              style={[
                styles.mensajeTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              {mensaje}
            </Text>

            <Pressable
              onPress={() => setModal("ninguno")}
              style={[
                styles.botonConfirmar,
                { backgroundColor: colors.primary, marginTop: 15, minWidth: 140 },
              ]}
            >
              <Text style={styles.confirmarTexto}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Resumen({
  valor,
  texto,
}: {
  valor: number;
  texto: string;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.resumenCard,
        isDark && {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.resumenValor,
          isDark && { color: colors.text },
        ]}
      >
        {valor}
      </Text>
      <Text
        style={[
          styles.resumenTexto,
          isDark && { color: colors.textSecondary },
        ]}
      >
        {texto}
      </Text>
    </View>
  );
}

function Head({
  texto,
  estilo,
}: {
  texto: string;
  estilo?: any;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <Text
      style={[
        styles.head,
        estilo,
        texto === "Acciones" && { textAlign: "right" },
        isDark && { color: colors.textSecondary },
      ]}
    >
      {texto}
    </Text>
  );
}

function EstadoBadge({ estado }: { estado: string }) {
  const { colors, isDark } = useAppTheme();

  const estiloBadge =
    estado === "Pendiente"
      ? isDark
        ? { backgroundColor: "rgba(234, 88, 12, 0.22)" }
        : styles.badgePendiente
      : estado === "Asignado"
        ? isDark
          ? { backgroundColor: "rgba(37, 99, 235, 0.22)" }
          : styles.badgeAsignado
        : estado === "EnCamino"
          ? isDark
            ? { backgroundColor: "rgba(147, 51, 234, 0.22)" }
            : styles.badgeConfirmacion
          : estado === "PorConfirmarEntrega"
            ? isDark
              ? { backgroundColor: "rgba(217, 119, 6, 0.22)" }
              : styles.badgeConfirmacion
            : estado === "Entregado"
              ? isDark
                ? { backgroundColor: "rgba(21, 128, 61, 0.22)" }
                : styles.badgeEntregado
              : estado === "Devuelto"
                ? isDark
                  ? { backgroundColor: "rgba(220, 38, 38, 0.22)" }
                  : { backgroundColor: "#fee2e2" }
              : isDark
                ? { backgroundColor: "rgba(200, 35, 27, 0.22)" }
                : styles.badgeOtro;

  const colorTexto =
    estado === "Pendiente"
      ? isDark
        ? "#fb923c"
        : "#c2410c"
      : estado === "Asignado"
        ? isDark
          ? "#60a5fa"
          : "#1d4ed8"
        : estado === "EnCamino"
          ? isDark
            ? "#c084fc"
            : "#7e22ce"
          : estado === "PorConfirmarEntrega"
            ? isDark
              ? "#fbbf24"
              : "#b45309"
            : estado === "Entregado"
              ? isDark
                ? "#4ade80"
                : "#15803d"
              : estado === "Devuelto"
                ? isDark
                  ? "#f87171"
                  : "#b91c1c"
                : colors.dangerText;

  return (
    <View style={[styles.badge, estiloBadge]}>
      <Text style={[{ color: colorTexto, fontSize: 11, fontWeight: "800" }]}>
        {formatearEstado(estado)}
      </Text>
    </View>
  );
}

function Accion({
  icono,
  tipo,
  onPress,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  tipo: "detalle" | "asignar" | "asignacion" | "editar" | "editarPedido";
  onPress: () => void;
}) {
  const { isDark } = useAppTheme();

  const estilo =
    tipo === "detalle"
      ? isDark
        ? { backgroundColor: "rgba(180, 83, 9, 0.18)", borderColor: "rgba(180, 83, 9, 0.35)" }
        : styles.botonDetalle
      : tipo === "asignar"
        ? isDark
          ? { backgroundColor: "rgba(124, 58, 237, 0.18)", borderColor: "rgba(124, 58, 237, 0.35)" }
          : styles.botonAsignar
        : tipo === "editar"
          ? isDark
            ? { backgroundColor: "rgba(15, 118, 110, 0.18)", borderColor: "rgba(15, 118, 110, 0.35)" }
            : styles.botonEditar
          : tipo === "editarPedido"
            ? isDark
              ? { backgroundColor: "rgba(59, 130, 246, 0.18)", borderColor: "rgba(59, 130, 246, 0.35)" }
              : styles.botonEditarPedido
            : isDark
              ? { backgroundColor: "rgba(29, 78, 216, 0.18)", borderColor: "rgba(29, 78, 216, 0.35)" }
              : styles.botonAsignacion;

  const color =
    tipo === "detalle"
      ? isDark
        ? "#fbbf24"
        : "#b45309"
      : tipo === "asignar"
        ? isDark
          ? "#a78bfa"
          : "#7c3aed"
        : tipo === "editar"
          ? isDark
            ? "#2dd4bf"
            : "#0f766e"
          : tipo === "editarPedido"
            ? isDark
              ? "#60a5fa"
              : "#2563eb"
            : isDark
              ? "#60a5fa"
              : "#1d4ed8";

  return (
    <Pressable
      onPress={onPress}
      style={[styles.botonIcono, estilo]}
    >
      <Ionicons name={icono} size={18} color={color} />
    </Pressable>
  );
}

function ModalHeader({
  titulo,
  onCerrar,
}: {
  titulo: string;
  onCerrar: () => void;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.modalHead,
        isDark && { borderBottomColor: colors.borderLight },
      ]}
    >
      <Text
        style={[
          styles.modalTitulo,
          isDark && { color: colors.text },
        ]}
      >
        {titulo}
      </Text>

      <Pressable onPress={onCerrar} style={styles.cerrar}>
        <Ionicons
          name="close"
          size={22}
          color={isDark ? colors.textSecondary : "#4b5158"}
        />
      </Pressable>
    </View>
  );
}

function Dato({
  etiqueta,
  valor,
}: {
  etiqueta: string;
  valor: string;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.datoCard,
        isDark && {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.datoEtiqueta,
          isDark && { color: colors.textSecondary },
        ]}
      >
        {etiqueta}
      </Text>
      <Text
        style={[
          styles.datoValor,
          isDark && { color: colors.text },
        ]}
      >
        {valor || "-"}
      </Text>
    </View>
  );
}

function BotonFecha({
  valor,
  placeholder,
  onPress,
}: {
  valor: string;
  placeholder: string;
  onPress: () => void;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.botonFecha,
        isDark && {
          backgroundColor: colors.inputBg,
          borderColor: colors.inputBorder,
        },
      ]}
    >
      <Ionicons name="calendar-outline" size={18} color={colors.primary} />
      <Text
        style={[
          styles.botonFechaTexto,
          isDark && { color: valor ? colors.text : colors.inputPlaceholder },
        ]}
      >
        {valor ? formatearFechaCorta(valor) : placeholder}
      </Text>
    </Pressable>
  );
}

function Calendario({
  visible,
  valor,
  minimo,
  maximo,
  onSeleccionar,
  onCerrar,
}: {
  visible: boolean;
  valor: string;
  minimo?: string;
  maximo?: string;
  onSeleccionar: (fecha: string) => void;
  onCerrar: () => void;
}) {
  const { colors, isDark } = useAppTheme();

  const inicial = valor ? new Date(`${valor}T12:00:00`) : new Date();
  const [mesActual, setMesActual] = useState(inicial);

  useEffect(() => {
    if (visible) {
      setMesActual(valor ? new Date(`${valor}T12:00:00`) : new Date());
    }
  }, [visible, valor]);

  const anio = mesActual.getFullYear();
  const mes = mesActual.getMonth();

  const primerDiaOriginal = new Date(anio, mes, 1).getDay();
  const primerDia = primerDiaOriginal === 0 ? 6 : primerDiaOriginal - 1;
  const cantidadDias = new Date(anio, mes + 1, 0).getDate();

  const celdas: Array<number | null> = [];
  for (let i = 0; i < primerDia; i++) {
    celdas.push(null);
  }
  for (let dia = 1; dia <= cantidadDias; dia++) {
    celdas.push(dia);
  }
  while (celdas.length % 7 !== 0) {
    celdas.push(null);
  }

  const fechaTexto = (dia: number) =>
    `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;

  const estaDeshabilitado = (dia: number) => {
    const actual = new Date(`${fechaTexto(dia)}T12:00:00`);

    if (minimo) {
      const min = new Date(`${minimo}T12:00:00`);
      if (actual < min) return true;
    }

    if (maximo) {
      const max = new Date(`${maximo}T12:00:00`);
      if (actual > max) return true;
    }

    return false;
  };

  const nombreMes = mesActual.toLocaleDateString("es-BO", {
    month: "long",
    year: "numeric",
  });

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
    >
      <View
        style={[
          styles.modalFondo,
          isDark && { backgroundColor: colors.modalBackdrop },
        ]}
      >
        <View
          style={[
            styles.calendarioModal,
            isDark && {
              backgroundColor: colors.modalBg,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <View style={styles.calendarioCabecera}>
            <Pressable
              onPress={() => setMesActual(new Date(anio, mes - 1, 1))}
              style={[
                styles.calendarioNavegacion,
                isDark && { backgroundColor: colors.surfaceElevated },
              ]}
            >
              <Ionicons
                name="chevron-back"
                size={20}
                color={isDark ? colors.text : "#1f2329"}
              />
            </Pressable>

            <Text
              style={[
                styles.calendarioTitulo,
                isDark && { color: colors.text },
              ]}
            >
              {nombreMes}
            </Text>

            <Pressable
              onPress={() => setMesActual(new Date(anio, mes + 1, 1))}
              style={[
                styles.calendarioNavegacion,
                isDark && { backgroundColor: colors.surfaceElevated },
              ]}
            >
              <Ionicons
                name="chevron-forward"
                size={20}
                color={isDark ? colors.text : "#1f2329"}
              />
            </Pressable>
          </View>

          <View style={styles.calendarioSemana}>
            {["L", "M", "M", "J", "V", "S", "D"].map((dia, indice) => (
              <Text
                key={`${dia}-${indice}`}
                style={[
                  styles.calendarioDiaSemana,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                {dia}
              </Text>
            ))}
          </View>

          <View style={styles.calendarioGrid}>
            {celdas.map((dia, indice) => (
              <View key={`${dia}-${indice}`} style={styles.calendarioDiaCaja}>
                {dia !== null && (
                  <Pressable
                    disabled={estaDeshabilitado(dia)}
                    onPress={() => onSeleccionar(fechaTexto(dia))}
                    style={[
                      styles.calendarioDia,
                      valor === fechaTexto(dia) && [
                        styles.calendarioDiaSeleccionado,
                        { backgroundColor: colors.primary },
                      ],
                      estaDeshabilitado(dia) && { opacity: 0.25 },
                    ]}
                  >
                    <Text
                      style={[
                        styles.calendarioDiaTexto,
                        isDark && { color: colors.text },
                        valor === fechaTexto(dia) && styles.calendarioDiaTextoSeleccionado,
                      ]}
                    >
                      {dia}
                    </Text>
                  </Pressable>
                )}
              </View>
            ))}
          </View>

          <View style={{ marginTop: 15, alignItems: "flex-end" }}>
            <Pressable
              onPress={onCerrar}
              style={[
                styles.botonSecundario,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.botonSecundarioTexto,
                  isDark && { color: colors.text },
                ]}
              >
                Cancelar
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatearDinero(valor: number | string) {
  const numero = Number(valor);
  return Number.isNaN(numero) ? "0.00" : numero.toFixed(2);
}

function formatearFecha(fecha: string) {
  if (!fecha) return "Sin fecha";

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function formatearFechaCorta(fecha: string) {
  if (!fecha) return "";

  const valor = new Date(`${fecha}T12:00:00`);
  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleDateString("es-BO");
}

function formatearEstado(estado: string) {
  if (!estado) return "";

  if (estado === "PorConfirmarEntrega") {
    return "Por confirmar entrega";
  }

  if (estado === "EnCamino") {
    return "En camino";
  }

  return estado;
}
