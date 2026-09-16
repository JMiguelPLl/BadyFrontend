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

import { useAppTheme } from "../../hooks/useAppTheme";
import {
  anularPago,
  crearPago,
  editarPago,
  listarDeudas,
  listarTiposPagoActivos,
  obtenerDetalleAdministrativoDeuda,
  obtenerUsuarioSesionPago,
} from "../../services/pagoAdminService";

import {
  DetalleAdministrativoDeuda,
  DeudaPedido,
  PagoHistorialAdmin,
  TipoPago,
  UsuarioSesionPago,
} from "../../types/pagoAdmin";

import Paginacion from "../../components/comun/Paginacion";
import { usePaginacion } from "../../hooks/usePaginacion";
import { styles } from "../../styles/administrador/pagos.styles";

type EstadoFiltro = "Todos" | "Pendiente" | "Pagado";

type ModalActivo =
  | "ninguno"
  | "detalle"
  | "historial"
  | "crearPago"
  | "editarPago"
  | "anularPago"
  | "calendarioDesde"
  | "calendarioHasta"
  | "mensaje";

export default function PagosAdministrador() {
  const { colors, isDark } = useAppTheme();

  const [deudas, setDeudas] = useState<DeudaPedido[]>([]);
  const [detalle, setDetalle] = useState<DetalleAdministrativoDeuda | null>(null);
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([]);
  const [usuarioSesion, setUsuarioSesion] = useState<UsuarioSesionPago | null>(null);

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("Todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [modal, setModal] = useState<ModalActivo>("ninguno");
  const [deudaSeleccionada, setDeudaSeleccionada] = useState<DeudaPedido | null>(null);
  const [pagoSeleccionado, setPagoSeleccionado] = useState<PagoHistorialAdmin | null>(null);

  const [idTipoPago, setIdTipoPago] = useState("");
  const [montoPago, setMontoPago] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  useEffect(() => {
    cargarInicial();
  }, []);

  const cargarInicial = async () => {
    try {
      setCargando(true);

      const [dataDeudas, dataTipos, dataUsuario] = await Promise.all([
        listarDeudas(),
        listarTiposPagoActivos(),
        obtenerUsuarioSesionPago(),
      ]);

      setDeudas(dataDeudas);
      setTiposPago(dataTipos);
      setUsuarioSesion(dataUsuario);
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los datos de pagos y deudas.",
        true
      );
    } finally {
      setCargando(false);
    }
  };

  const actualizarDeudas = async () => {
    try {
      setCargando(true);
      const dataDeudas = await listarDeudas();
      setDeudas(dataDeudas);
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron actualizar las deudas.",
        true
      );
    } finally {
      setCargando(false);
    }
  };

  const deudasFiltradas = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return deudas.filter((deuda) => {
      const cumpleEstado =
        estadoFiltro === "Todos"
          ? true
          : estadoFiltro === "Pendiente"
            ? deuda.saldoPendiente > 0
            : deuda.saldoPendiente <= 0;

      if (!cumpleEstado) return false;

      const fechaPedido = new Date(deuda.fechaPedido);

      if (fechaDesde) {
        const d = new Date(`${fechaDesde}T00:00:00`);
        if (fechaPedido < d) return false;
      }

      if (fechaHasta) {
        const h = new Date(`${fechaHasta}T23:59:59`);
        if (fechaPedido > h) return false;
      }

      if (!texto) return true;

      const cliente = (deuda.cliente || "").toLowerCase();
      const sucursal = (deuda.sucursal || "").toLowerCase();
      const idStr = String(deuda.idPedido);

      return (
        cliente.includes(texto) ||
        sucursal.includes(texto) ||
        idStr.includes(texto)
      );
    });
  }, [deudas, busqueda, estadoFiltro, fechaDesde, fechaHasta]);

  const pendientes = useMemo(
    () => deudas.filter((d) => d.saldoPendiente > 0).length,
    [deudas]
  );

  const pagadas = useMemo(
    () => deudas.filter((d) => d.saldoPendiente <= 0).length,
    [deudas]
  );

  const {
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    setRegistrosPorPagina,
    totalPaginas,
    totalRegistros,
    datosPaginados: deudasPaginadas,
  } = usePaginacion(deudasFiltradas);

  const totalPorCobrar = useMemo(
    () => deudas.reduce((acc, d) => acc + d.saldoPendiente, 0),
    [deudas]
  );

  const totalCobrado = useMemo(
    () => deudas.reduce((acc, d) => acc + d.totalPagado, 0),
    [deudas]
  );

  const abrirMensaje = (texto: string, error = false) => {
    setMensaje(texto);
    setEsError(error);
    setModal("mensaje");
  };

  const cargarDetalle = async (deuda: DeudaPedido) => {
    try {
      setProcesando(true);
      setDeudaSeleccionada(deuda);

      const detalleCompleto = await obtenerDetalleAdministrativoDeuda(
        deuda.idPedido
      );

      setDetalle(detalleCompleto);
      return detalleCompleto;
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo obtener el detalle de la deuda.",
        true
      );
      return null;
    } finally {
      setProcesando(false);
    }
  };

  const abrirDetalle = async (deuda: DeudaPedido) => {
    setModal("detalle");
    await cargarDetalle(deuda);
  };

  const abrirHistorial = async (deuda: DeudaPedido) => {
    setModal("historial");
    await cargarDetalle(deuda);
  };

  const abrirCrearPago = (deuda: DeudaPedido) => {
    if (deuda.saldoPendiente <= 0) {
      abrirMensaje("Este pedido ya se encuentra completamente pagado.", true);
      return;
    }

    setDeudaSeleccionada(deuda);
    setPagoSeleccionado(null);
    setIdTipoPago(tiposPago.length ? String(tiposPago[0].id) : "");
    setMontoPago(formatearDinero(deuda.saldoPendiente));
    setModal("crearPago");
  };

  const abrirEditarPago = (pago: PagoHistorialAdmin) => {
    setPagoSeleccionado(pago);
    setIdTipoPago(String(pago.idTipoPago));
    setMontoPago(formatearDinero(pago.montoPagado));
    setModal("editarPago");
  };

  const guardarNuevoPago = async () => {
    if (!deudaSeleccionada) return;

    const monto = Number(montoPago);

    if (!idTipoPago) {
      abrirMensaje("Selecciona un método de pago.", true);
      return;
    }

    if (Number.isNaN(monto) || monto <= 0) {
      abrirMensaje("Ingresa un monto válido mayor a 0.", true);
      return;
    }

    try {
      setProcesando(true);

      const respuesta = await crearPago({
        idPedido: deudaSeleccionada.idPedido,
        idUsuario: usuarioSesion?.id ?? 0,
        idTipoPago: Number(idTipoPago),
        montoPagado: monto,
      });

      setModal("ninguno");
      await actualizarDeudas();

      abrirMensaje(
        respuesta.message || "Pago registrado correctamente en el sistema."
      );
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el pago.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const guardarEdicionPago = async () => {
    if (!pagoSeleccionado || !deudaSeleccionada) return;

    const monto = Number(montoPago);

    if (!idTipoPago) {
      abrirMensaje("Selecciona un método de pago.", true);
      return;
    }

    if (Number.isNaN(monto) || monto <= 0) {
      abrirMensaje("Ingresa un monto válido mayor a 0.", true);
      return;
    }

    try {
      setProcesando(true);

      const respuesta = await editarPago(pagoSeleccionado.id, {
        idTipoPago: Number(idTipoPago),
        montoPagado: monto,
      });

      setModal("historial");
      await actualizarDeudas();

      const deuda = deudas.find(
        (d) => d.idPedido === deudaSeleccionada.idPedido
      );

      if (deuda) {
        await cargarDetalle(deuda);
      }

      abrirMensaje(
        respuesta.message || "Pago actualizado correctamente."
      );
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo actualizar el pago.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const abrirAnularPago = (pago: PagoHistorialAdmin) => {
    setPagoSeleccionado(pago);
    setModal("anularPago");
  };

  const ejecutarAnularPago = async () => {
    if (!pagoSeleccionado || !deudaSeleccionada) return;

    try {
      setProcesando(true);

      const respuesta = await anularPago(pagoSeleccionado.id);

      setModal("historial");
      await actualizarDeudas();

      const deuda = deudas.find(
        (d) => d.idPedido === deudaSeleccionada.idPedido
      );

      if (deuda) {
        await cargarDetalle(deuda);
      }

      abrirMensaje(
        respuesta.message ||
          "Pago anulado correctamente. Los saldos fueron recalculados."
      );
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo anular el pago.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const cerrarModal = () => {
    if (procesando) return;

    setModal("ninguno");
    setDetalle(null);
    setDeudaSeleccionada(null);
    setPagoSeleccionado(null);
    setIdTipoPago("");
    setMontoPago("");
  };

  const limpiarFiltros = () => {
    setBusqueda("");
    setEstadoFiltro("Todos");
    setFechaDesde("");
    setFechaHasta("");
  };

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
            Pagos y deudas
          </Text>
          <Text
            style={[
              styles.subtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Gestiona cuentas por cobrar, pagos e historial de clientes.
          </Text>
        </View>
      </View>

      <View style={styles.resumen}>
        <Resumen valor={pendientes} texto="Deudas pendientes" />
        <Resumen valor={pagadas} texto="Saldos pagados" />
        <Resumen
          valor={`Bs ${formatearDinero(totalPorCobrar)}`}
          texto="Total por cobrar"
        />
        <Resumen
          valor={`Bs ${formatearDinero(totalCobrado)}`}
          texto="Total registrado en pagos"
        />
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
                  onValueChange={(valor) =>
                    setEstadoFiltro(String(valor) as EstadoFiltro)
                  }
                  style={[
                    styles.selector,
                    {
                      backgroundColor: isDark ? colors.inputBg : "#ffffff",
                      color: isDark ? colors.text : "#1f2329",
                    },
                  ]}
                  dropdownIconColor={colors.textSecondary}
                >
                  <Picker.Item
                    label="Todos"
                    value="Todos"
                    color={isDark ? "#f3f4f6" : "#1f2329"}
                    style={{
                      backgroundColor: isDark ? "#1a1d21" : "#ffffff",
                      color: isDark ? "#f3f4f6" : "#1f2329",
                    }}
                  />
                  <Picker.Item
                    label="Saldo pendiente"
                    value="Pendiente"
                    color={isDark ? "#f3f4f6" : "#1f2329"}
                    style={{
                      backgroundColor: isDark ? "#1a1d21" : "#ffffff",
                      color: isDark ? "#f3f4f6" : "#1f2329",
                    }}
                  />
                  <Picker.Item
                    label="Saldo pagado"
                    value="Pagado"
                    color={isDark ? "#f3f4f6" : "#1f2329"}
                    style={{
                      backgroundColor: isDark ? "#1a1d21" : "#ffffff",
                      color: isDark ? "#f3f4f6" : "#1f2329",
                    }}
                  />
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
              onPress={actualizarDeudas}
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
        ) : deudasFiltradas.length === 0 ? (
          <View style={styles.vacio}>
            <Ionicons
              name="wallet-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text
              style={[
                styles.vacioTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              No se encontraron deudas ni pagos registrados.
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
                <Head texto="Fecha Pedido" estilo={styles.colFecha} />
                <Head texto="Total Pedido" estilo={styles.colTotal} />
                <Head texto="Total Pagado" estilo={styles.colPagado} />
                <Head texto="Saldo Pendiente" estilo={styles.colSaldo} />
                <Head texto="Estado" estilo={styles.colEstado} />
                <Head texto="Acciones" estilo={styles.colAcciones} />
              </View>

              {deudasPaginadas.map((item) => (
                <View
                  key={item.idPedido}
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
                    #{item.idPedido}
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
                        {(item.cliente || "C").charAt(0).toUpperCase()}
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
                        {item.cliente || "Cliente"}
                      </Text>
                      <Text
                        style={[
                          styles.clienteSecundario,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Cliente #{item.idCliente}
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
                    {item.sucursal || "Sin sucursal"}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colFecha,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {formatearFecha(item.fechaPedido)}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colTotal,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Bs {formatearDinero(item.totalPedido)}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colPagado,
                      isDark && { color: colors.successText },
                    ]}
                  >
                    Bs {formatearDinero(item.totalPagado)}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colSaldo,
                      item.saldoPendiente <= 0
                        ? isDark
                          ? { color: colors.successText, fontWeight: "700" }
                          : styles.saldoPagadoTexto
                        : isDark
                          ? { color: colors.dangerText, fontWeight: "700" }
                          : styles.saldoPendienteTexto,
                    ]}
                  >
                    {item.saldoPendiente <= 0
                      ? "Pagado"
                      : `Bs ${formatearDinero(item.saldoPendiente)}`}
                  </Text>

                  <View style={styles.colEstado}>
                    <EstadoBadge saldoPendiente={item.saldoPendiente} />
                  </View>

                  <View
                    style={[
                      styles.accionesCelda,
                      styles.colAcciones,
                    ]}
                  >
                    <Pressable
                      onPress={() => abrirDetalle(item)}
                      style={[
                        styles.botonIcono,
                        styles.botonDetalle,
                        isDark && {
                          backgroundColor: "rgba(180, 83, 9, 0.18)",
                          borderColor: "rgba(180, 83, 9, 0.35)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={18}
                        color={isDark ? "#fbbf24" : "#b45309"}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => abrirHistorial(item)}
                      style={[
                        styles.botonIcono,
                        styles.botonHistorial,
                        isDark && {
                          backgroundColor: "rgba(29, 78, 216, 0.18)",
                          borderColor: "rgba(29, 78, 216, 0.35)",
                        },
                      ]}
                    >
                      <Ionicons
                        name="receipt-outline"
                        size={18}
                        color={isDark ? "#60a5fa" : "#1d4ed8"}
                      />
                    </Pressable>

                    {item.saldoPendiente > 0 && (
                      <Pressable
                        onPress={() => abrirCrearPago(item)}
                        style={[
                          styles.botonIcono,
                          styles.botonPago,
                          isDark && {
                            backgroundColor: "rgba(21, 128, 61, 0.18)",
                            borderColor: "rgba(21, 128, 61, 0.35)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="cash-outline"
                          size={18}
                          color={isDark ? "#4ade80" : "#15803d"}
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}

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

      {/* Modal Detalle Administrativo Deuda */}
      <Modal
        visible={modal === "detalle"}
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
              titulo="Detalle Administrativo de Deuda"
              onCerrar={cerrarModal}
            />

            {procesando || !detalle ? (
              <View style={styles.vacio}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detalleGrid}>
                  <Dato etiqueta="ID Pedido" valor={`#${detalle.idPedido}`} />
                  <Dato etiqueta="Cliente" valor={detalle.cliente} />
                  <Dato
                    etiqueta="Sucursal"
                    valor={detalle.sucursal || "Sin sucursal"}
                  />
                  <Dato
                    etiqueta="Fecha Pedido"
                    valor={formatearFecha(detalle.fechaPedido)}
                  />
                  <Dato
                    etiqueta="Estado Pedido"
                    valor={formatearEstadoPedido(detalle.estadoPedido)}
                  />
                  <Dato
                    etiqueta="Total Pedido"
                    valor={`Bs ${formatearDinero(detalle.totalPedido)}`}
                  />
                  <Dato
                    etiqueta="Total Pagado"
                    valor={`Bs ${formatearDinero(detalle.totalPagado)}`}
                  />
                  <Dato
                    etiqueta="Saldo Pendiente"
                    valor={
                      detalle.saldoPendiente <= 0
                        ? "Completamente pagado"
                        : `Bs ${formatearDinero(detalle.saldoPendiente)}`
                    }
                  />
                  <Dato
                    etiqueta="Cantidad Pagos"
                    valor={`${detalle.pagos.length} pagos`}
                  />
                </View>

                {detalle.entrega && (
                  <View style={{ marginTop: 15 }}>
                    <Text
                      style={[
                        styles.seccionTitulo,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Información de Entrega
                    </Text>

                    <View
                      style={[
                        styles.entregaCard,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.entregaTitulo,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {detalle.entrega.vehiculo || "Vehículo no asignado"}
                        {detalle.entrega.placa ? ` · ${detalle.entrega.placa}` : ""}
                      </Text>
                      <Text
                        style={[
                          styles.entregaTexto,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Fecha entrega:{" "}
                        {detalle.entrega.fechaEntrega
                          ? formatearFecha(detalle.entrega.fechaEntrega)
                          : "Pendiente"}
                      </Text>

                      {detalle.entrega.personal && detalle.entrega.personal.length > 0 && (
                        <View style={styles.personalChipWrap}>
                          {detalle.entrega.personal.map((p) => (
                            <View
                              key={p.idUsuario}
                              style={[
                                styles.personalChip,
                                isDark && { backgroundColor: "rgba(200, 35, 27, 0.2)" },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.personalChipTexto,
                                  isDark && { color: colors.text },
                                ]}
                              >
                                {p.usuario}
                              </Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  </View>
                )}

                <Text
                  style={[
                    styles.seccionTitulo,
                    isDark && { color: colors.text },
                  ]}
                >
                  Productos del pedido ({detalle.productos.length})
                </Text>

                {detalle.productos.length === 0 ? (
                  <Text
                    style={[
                      styles.vacioTexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    Este pedido no contiene productos registrados.
                  </Text>
                ) : (
                  detalle.productos.map((prod, idx) => (
                    <View
                      key={`${prod.idProducto}-${idx}`}
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
                          {prod.producto}
                        </Text>
                        <Text
                          style={[
                            styles.productoSecundario,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          {prod.cantidad} x Bs {formatearDinero(prod.precioUnitario)}
                        </Text>
                      </View>
                      <Text
                        style={[
                          styles.productoSubtotal,
                          isDark && { color: colors.text },
                        ]}
                      >
                        Bs {formatearDinero(prod.subtotal)}
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
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Historial de Pagos */}
      <Modal
        visible={modal === "historial"}
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
              titulo="Historial de Pagos del Pedido"
              onCerrar={cerrarModal}
            />

            {procesando || !detalle ? (
              <View style={styles.vacio}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView style={styles.modalBody}>
                <View
                  style={[
                    styles.resumenSaldo,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                >
                  <View style={styles.resumenSaldoFila}>
                    <Text
                      style={[
                        styles.resumenSaldoEtiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Pedido #{detalle.idPedido}
                    </Text>
                    <Text
                      style={[
                        styles.resumenSaldoValor,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {detalle.cliente}
                    </Text>
                  </View>

                  <View style={styles.resumenSaldoFila}>
                    <Text
                      style={[
                        styles.resumenSaldoEtiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Total pedido:
                    </Text>
                    <Text
                      style={[
                        styles.resumenSaldoValor,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Bs {formatearDinero(detalle.totalPedido)}
                    </Text>
                  </View>

                  <View style={styles.resumenSaldoFila}>
                    <Text
                      style={[
                        styles.resumenSaldoEtiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Total pagado:
                    </Text>
                    <Text
                      style={[
                        styles.resumenSaldoValor,
                        isDark && { color: colors.successText },
                      ]}
                    >
                      Bs {formatearDinero(detalle.totalPagado)}
                    </Text>
                  </View>

                  <View style={styles.resumenSaldoFila}>
                    <Text
                      style={[
                        styles.resumenSaldoEtiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Saldo pendiente:
                    </Text>
                    <Text
                      style={[
                        styles.resumenSaldoValor,
                        detalle.saldoPendiente <= 0
                          ? isDark
                            ? { color: colors.successText }
                            : { color: "#15803d" }
                          : { color: colors.primary },
                      ]}
                    >
                      Bs {formatearDinero(detalle.saldoPendiente)}
                    </Text>
                  </View>
                </View>

                <Text
                  style={[
                    styles.seccionTitulo,
                    isDark && { color: colors.text },
                  ]}
                >
                  Pagos registrados ({detalle.pagos.length})
                </Text>

                {detalle.pagos.length === 0 ? (
                  <Text
                    style={[
                      styles.vacioTexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    No se han registrado pagos para este pedido.
                  </Text>
                ) : (
                  detalle.pagos.map((pago) => (
                    <View
                      key={pago.id}
                      style={[
                        styles.pagoCard,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View
                        style={[
                          styles.pagoIcono,
                          isDark && { backgroundColor: "rgba(21, 128, 61, 0.22)" },
                        ]}
                      >
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={22}
                          color={isDark ? "#4ade80" : "#15803d"}
                        />
                      </View>

                      <View style={styles.pagoInfo}>
                        <Text
                          style={[
                            styles.pagoUsuario,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {pago.tipoPago} · #{pago.id}
                        </Text>
                        <Text
                          style={[
                            styles.pagoSecundario,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Cobrado por {pago.usuario} · {formatearFecha(pago.fechaPago)}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.pagoMonto,
                          isDark && { color: colors.successText },
                        ]}
                      >
                        Bs {formatearDinero(pago.montoPagado)}
                      </Text>

                      <View style={{ flexDirection: "row", gap: 6 }}>
                        <Pressable
                          onPress={() => abrirEditarPago(pago)}
                          style={[
                            styles.botonIcono,
                            styles.botonEditar,
                            isDark && {
                              backgroundColor: "rgba(29, 78, 216, 0.18)",
                              borderColor: "rgba(29, 78, 216, 0.35)",
                            },
                          ]}
                        >
                          <Ionicons
                            name="create-outline"
                            size={16}
                            color={isDark ? "#60a5fa" : "#1d4ed8"}
                          />
                        </Pressable>

                        <Pressable
                          onPress={() => abrirAnularPago(pago)}
                          style={[
                            styles.botonIcono,
                            styles.botonAnular,
                            isDark && {
                              backgroundColor: "rgba(220, 38, 38, 0.18)",
                              borderColor: "rgba(220, 38, 38, 0.35)",
                            },
                          ]}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={16}
                            color={isDark ? "#f87171" : "#dc2626"}
                          />
                        </Pressable>
                      </View>
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
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmar Anulación de Pago */}
      <Modal
        visible={modal === "anularPago"}
        transparent
        animationType="fade"
        onRequestClose={() => setModal("historial")}
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
              name="alert-circle-outline"
              size={48}
              color={colors.dangerText}
            />
            <Text
              style={[
                styles.mensajeTitulo,
                isDark && { color: colors.text },
              ]}
            >
              ¿Anular este pago?
            </Text>
            <Text
              style={[
                styles.mensajeTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Se anulará el pago #{pagoSeleccionado?.id} de Bs{" "}
              {pagoSeleccionado
                ? formatearDinero(pagoSeleccionado.montoPagado)
                : "0.00"}{" "}
              registrado por {pagoSeleccionado?.usuario}. El saldo pendiente del
              pedido y el total de la caja se recalcularán automáticamente.
            </Text>

            <View
              style={{
                flexDirection: "row",
                gap: 12,
                marginTop: 20,
                width: "100%",
              }}
            >
              <Pressable
                onPress={() => setModal("historial")}
                style={[
                  styles.botonModal,
                  styles.botonCancelar,
                  { flex: 1 },
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
                onPress={ejecutarAnularPago}
                style={[
                  styles.botonModal,
                  styles.botonConfirmar,
                  { flex: 1, backgroundColor: colors.primary },
                ]}
              >
                {procesando ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmarTexto}>Anular pago</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Formulario Pago (Crear / Editar) */}
      <ModalFormularioPago
        visible={modal === "crearPago" || modal === "editarPago"}
        titulo={
          modal === "editarPago"
            ? "Editar Pago Registrado"
            : "Registrar Pago de Deuda"
        }
        esEdicion={modal === "editarPago"}
        deuda={deudaSeleccionada}
        tiposPago={tiposPago}
        usuarioSesion={usuarioSesion}
        idTipoPago={idTipoPago}
        setIdTipoPago={setIdTipoPago}
        montoPago={montoPago}
        setMontoPago={setMontoPago}
        procesando={procesando}
        onCerrar={
          modal === "editarPago" ? () => setModal("historial") : cerrarModal
        }
        onGuardar={
          modal === "editarPago" ? guardarEdicionPago : guardarNuevoPago
        }
      />

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
              onPress={cerrarModal}
              style={[
                styles.botonModal,
                styles.botonConfirmar,
                { marginTop: 18, backgroundColor: colors.primary },
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
  valor: string | number;
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
  estilo: any;
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

function EstadoBadge({ saldoPendiente }: { saldoPendiente: number }) {
  const { colors, isDark } = useAppTheme();
  const pagado = saldoPendiente <= 0;

  return (
    <View
      style={[
        styles.badge,
        pagado
          ? isDark
            ? { backgroundColor: "rgba(21, 128, 61, 0.22)" }
            : styles.badgePagado
          : isDark
            ? { backgroundColor: "rgba(200, 35, 27, 0.22)" }
            : styles.badgePendiente,
      ]}
    >
      <Text
        style={
          pagado
            ? { color: isDark ? "#4ade80" : "#15803d", fontWeight: "700" }
            : { color: colors.dangerText, fontWeight: "700" }
        }
      >
        {pagado ? "Pagado" : "Pendiente"}
      </Text>
    </View>
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
          backgroundColor: colors.surfaceElevated,
          borderColor: colors.border,
          borderWidth: 1,
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

function ModalFormularioPago({
  visible,
  titulo,
  esEdicion,
  deuda,
  tiposPago,
  usuarioSesion,
  idTipoPago,
  setIdTipoPago,
  montoPago,
  setMontoPago,
  procesando,
  onCerrar,
  onGuardar,
}: {
  visible: boolean;
  titulo: string;
  esEdicion: boolean;
  deuda: DeudaPedido | null;
  tiposPago: TipoPago[];
  usuarioSesion: UsuarioSesionPago | null;
  idTipoPago: string;
  setIdTipoPago: (v: string) => void;
  montoPago: string;
  setMontoPago: (v: string) => void;
  procesando: boolean;
  onCerrar: () => void;
  onGuardar: () => void;
}) {
  const { colors, isDark } = useAppTheme();

  const monto = Number(montoPago) || 0;
  const saldoActual = deuda?.saldoPendiente || 0;
  const saldoEstimado = Math.max(0, saldoActual - monto);
  const textoBoton = esEdicion ? "Guardar cambios" : "Registrar pago";

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
            styles.modal,
            isDark && {
              backgroundColor: colors.modalBg,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <ModalHeader titulo={titulo} onCerrar={onCerrar} />

          <ScrollView style={styles.modalBody}>
            {deuda && (
              <View
                style={[
                  styles.saldoPagoCaja,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.saldoPagoEtiqueta,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Pedido #{deuda.idPedido} · {deuda.cliente}
                </Text>
                <Text
                  style={[
                    styles.saldoPagoMonto,
                    { color: colors.primary },
                  ]}
                >
                  Saldo actual: Bs {formatearDinero(deuda.saldoPendiente)}
                </Text>
              </View>
            )}

            <View style={styles.formulario}>
              <View style={styles.campo}>
                <Text
                  style={[
                    styles.etiqueta,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cobrador (Administrador en sesión)
                </Text>
                <TextInput
                  editable={false}
                  value={
                    usuarioSesion
                      ? `${usuarioSesion.nombre} (${usuarioSesion.rol})`
                      : "Administrador"
                  }
                  style={[
                    styles.input,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.textSecondary,
                    },
                  ]}
                />
              </View>

              <View style={styles.campo}>
                <Text
                  style={[
                    styles.etiqueta,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Método de pago
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
                    selectedValue={idTipoPago}
                    onValueChange={(valor) => setIdTipoPago(String(valor))}
                    style={[
                      styles.selector,
                      {
                        backgroundColor: isDark ? colors.inputBg : "#ffffff",
                        color: isDark ? colors.text : "#1f2329",
                      },
                    ]}
                    dropdownIconColor={colors.textSecondary}
                  >
                    <Picker.Item
                      label="Seleccione tipo de pago"
                      value=""
                      color={colors.inputPlaceholder}
                      style={{
                        backgroundColor: isDark ? "#1a1d21" : "#ffffff",
                        color: colors.inputPlaceholder,
                      }}
                    />
                    {tiposPago.map((tipo) => (
                      <Picker.Item
                        key={tipo.id}
                        label={tipo.descripcion}
                        value={String(tipo.id)}
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

              <View style={styles.campo}>
                <Text
                  style={[
                    styles.etiqueta,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Monto pagado
                </Text>
                <TextInput
                  value={montoPago}
                  onChangeText={setMontoPago}
                  keyboardType="decimal-pad"
                  placeholder="Ej: 2000"
                  placeholderTextColor={colors.inputPlaceholder}
                  style={[
                    styles.input,
                    isDark && {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                      color: colors.text,
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.ayuda,
                    isDark && { color: colors.textMuted },
                  ]}
                >
                  {esEdicion
                    ? "El backend recalculará automáticamente todos los saldos posteriores del pedido."
                    : "El saldo final será calculado nuevamente por el backend. Esta vista es informativa."}
                </Text>
              </View>

              {!esEdicion && monto > 0 && (
                <View
                  style={[
                    styles.datoCard,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.datoEtiqueta,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Saldo estimado después del pago
                  </Text>
                  <Text
                    style={[
                      styles.datoValor,
                      saldoEstimado <= 0
                        ? isDark
                          ? { color: "#4ade80" }
                          : { color: "#15803d" }
                        : { color: colors.primary },
                    ]}
                  >
                    {saldoEstimado <= 0
                      ? "Saldo pagado"
                      : `Bs ${formatearDinero(saldoEstimado)}`}
                  </Text>
                </View>
              )}
            </View>
          </ScrollView>

          <View style={styles.modalAcciones}>
            <Pressable
              onPress={onCerrar}
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
              onPress={onGuardar}
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
                <Text style={styles.confirmarTexto}>{textoBoton}</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
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

function formatearEstadoPedido(estado: string) {
  if (estado === "PorConfirmarEntrega") {
    return "Por confirmar entrega";
  }

  if (estado === "EnCamino") {
    return "En camino";
  }

  return estado;
}