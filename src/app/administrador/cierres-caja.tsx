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
  cerrarCajaPorIdAdmin,
  listarHistorialCierresAdmin,
  obtenerDetalleCierreAdmin,
  obtenerResumenCierresAdmin,
} from "../../services/cierreCajaAdminService";
import {
  anularPago,
  editarPago,
  listarTiposPagoActivos,
} from "../../services/pagoAdminService";

import {
  CierreCajaAdmin,
  CierreCajaDetalleAdmin,
  CierreCajaDetalleItemAdmin,
  CierreCajaResumenAdmin,
} from "../../types/cierreCajaAdmin";
import { TipoPago } from "../../types/pagoAdmin";

import { styles } from "../../styles/administrador/cierresCaja.styles";

type EstadoFiltro =
  | "Todos"
  | "Abierta"
  | "Cerrada"
  | "Anulada";

type ModalActivo =
  | "ninguno"
  | "detalle"
  | "editarPago"
  | "anularPago"
  | "cerrarCaja"
  | "calendarioDesde"
  | "calendarioHasta"
  | "mensaje";

export default function CierresCajaAdministrador() {
  const { colors, isDark } = useAppTheme();

  const [cierres, setCierres] = useState<CierreCajaAdmin[]>([]);
  const [resumen, setResumen] = useState<CierreCajaResumenAdmin | null>(null);

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [estadoFiltro, setEstadoFiltro] = useState<EstadoFiltro>("Todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");

  const [modal, setModal] = useState<ModalActivo>("ninguno");
  const [cierreSeleccionado, setCierreSeleccionado] = useState<CierreCajaAdmin | null>(null);
  const [detalleCierre, setDetalleCierre] = useState<CierreCajaDetalleAdmin | null>(null);

  const [pagoAEditar, setPagoAEditar] = useState<CierreCajaDetalleItemAdmin | null>(null);
  const [pagoAAnular, setPagoAAnular] = useState<CierreCajaDetalleItemAdmin | null>(null);
  const [tiposPago, setTiposPago] = useState<TipoPago[]>([]);
  const [idTipoPago, setIdTipoPago] = useState<string>("");
  const [montoPago, setMontoPago] = useState<string>("");

  const [observacion, setObservacion] = useState("");

  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  useEffect(() => {
    cargarDatos();
    listarTiposPagoActivos().then(setTiposPago).catch(() => {});
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);

      const [dataCierres, dataResumen] = await Promise.all([
        listarHistorialCierresAdmin(),
        obtenerResumenCierresAdmin(),
      ]);

      setCierres(dataCierres);
      setResumen(dataResumen);
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los cierres de caja.",
        true
      );
    } finally {
      setCargando(false);
    }
  };

  const actualizar = async () => {
    await cargarDatos();
  };

  const cierresFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return cierres.filter((item) => {
      const cumpleEstado =
        estadoFiltro === "Todos"
          ? true
          : item.estado.toLowerCase() === estadoFiltro.toLowerCase();

      if (!cumpleEstado) return false;

      const fechaApertura = new Date(item.fechaApertura);

      if (fechaDesde) {
        const d = new Date(`${fechaDesde}T00:00:00`);
        if (fechaApertura < d) return false;
      }

      if (fechaHasta) {
        const h = new Date(`${fechaHasta}T23:59:59`);
        if (fechaApertura > h) return false;
      }

      if (!texto) return true;

      const usuario = (item.usuario || "").toLowerCase();
      const correo = (item.correoUsuario || "").toLowerCase();
      const idStr = String(item.id);

      return (
        usuario.includes(texto) ||
        correo.includes(texto) ||
        idStr.includes(texto)
      );
    });
  }, [cierres, busqueda, estadoFiltro, fechaDesde, fechaHasta]);

  const abrirMensaje = (texto: string, error = false) => {
    setMensaje(texto);
    setEsError(error);
    setModal("mensaje");
  };

  const abrirDetalle = async (cierre: CierreCajaAdmin) => {
    try {
      setProcesando(true);
      setCierreSeleccionado(cierre);
      setModal("detalle");

      const detalle = await obtenerDetalleCierreAdmin(cierre.id);
      setDetalleCierre(detalle);
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el detalle del cierre.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const abrirCerrarCaja = (cierre: CierreCajaAdmin) => {
    setCierreSeleccionado(cierre);
    setObservacion("");
    setModal("cerrarCaja");
  };

  const confirmarCierreCaja = async () => {
    if (!cierreSeleccionado) return;

    try {
      setProcesando(true);

      const respuesta = await cerrarCajaPorIdAdmin(
        cierreSeleccionado.id,
        {
          observacion: observacion.trim() || undefined,
        }
      );

      setModal("ninguno");
      await cargarDatos();

      abrirMensaje(
        respuesta.message || "Caja cerrada correctamente por el administrador."
      );
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cerrar la caja.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const abrirEditarPago = (pago: CierreCajaDetalleItemAdmin) => {
    setPagoAEditar(pago);
    setIdTipoPago(String(pago.idTipoPago));
    setMontoPago(String(pago.montoPagado));
    setModal("editarPago");
  };

  const guardarEdicionPago = async () => {
    if (!pagoAEditar || !detalleCierre) return;

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

      const respuesta = await editarPago(pagoAEditar.idPago, {
        idTipoPago: Number(idTipoPago),
        montoPagado: monto,
      });

      const detalleActualizado = await obtenerDetalleCierreAdmin(
        detalleCierre.id
      );
      setDetalleCierre(detalleActualizado);
      await cargarDatos();

      setModal("detalle");
      setPagoAEditar(null);

      abrirMensaje(
        respuesta.message ||
          "Pago actualizado correctamente. El saldo del pedido y los acumuladores de la caja fueron recalculados."
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

  const abrirAnularPago = (pago: CierreCajaDetalleItemAdmin) => {
    setPagoAAnular(pago);
    setModal("anularPago");
  };

  const confirmarAnulacionPago = async () => {
    if (!pagoAAnular || !detalleCierre) return;

    try {
      setProcesando(true);

      const respuesta = await anularPago(pagoAAnular.idPago);

      const detalleActualizado = await obtenerDetalleCierreAdmin(
        detalleCierre.id
      );
      setDetalleCierre(detalleActualizado);
      await cargarDatos();

      setModal("detalle");
      setPagoAAnular(null);

      abrirMensaje(
        respuesta.message ||
          "Pago anulado correctamente. El saldo del pedido y los acumuladores de la caja fueron recalculados."
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
    setCierreSeleccionado(null);
    setDetalleCierre(null);
    setObservacion("");
    setPagoAEditar(null);
    setPagoAAnular(null);
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
            Cierres de caja
          </Text>
          <Text
            style={[
              styles.subtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Supervisa aperturas, cobros y arqueos de los distribuidores.
          </Text>
        </View>
      </View>

      <View style={styles.resumen}>
        <Resumen
          valor={resumen?.totalCajasAbiertas ?? 0}
          texto="Cajas abiertas"
        />
        <Resumen
          valor={resumen?.totalCajasCerradas ?? 0}
          texto="Cajas cerradas"
        />
        <Resumen
          valor={`Bs ${formatearDinero(resumen?.totalEfectivoGeneral ?? 0)}`}
          texto="Efectivo general"
        />
        <Resumen
          valor={`Bs ${formatearDinero(resumen?.granTotalRecaudado ?? 0)}`}
          texto="Gran total recaudado"
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
              placeholder="Buscar por distribuidor, correo o cierre..."
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
                    label="Abierta"
                    value="Abierta"
                    color={isDark ? "#f3f4f6" : "#1f2329"}
                    style={{
                      backgroundColor: isDark ? "#1a1d21" : "#ffffff",
                      color: isDark ? "#f3f4f6" : "#1f2329",
                    }}
                  />
                  <Picker.Item
                    label="Cerrada"
                    value="Cerrada"
                    color={isDark ? "#f3f4f6" : "#1f2329"}
                    style={{
                      backgroundColor: isDark ? "#1a1d21" : "#ffffff",
                      color: isDark ? "#f3f4f6" : "#1f2329",
                    }}
                  />
                  <Picker.Item
                    label="Anulada"
                    value="Anulada"
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
              onPress={actualizar}
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
        ) : cierresFiltrados.length === 0 ? (
          <View style={styles.vacio}>
            <Ionicons
              name="cash-outline"
              size={48}
              color={colors.textMuted}
            />
            <Text
              style={[
                styles.vacioTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              No se encontraron cierres de caja.
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
                <Head texto="Distribuidor" estilo={styles.colUsuario} />
                <Head texto="Apertura" estilo={styles.colApertura} />
                <Head texto="Cierre" estilo={styles.colCierre} />
                <Head texto="Efectivo" estilo={styles.colEfectivo} />
                <Head texto="QR" estilo={styles.colQr} />
                <Head texto="Total Recaudado" estilo={styles.colTotal} />
                <Head texto="Estado" estilo={styles.colEstado} />
                <Head texto="Acciones" estilo={styles.colAcciones} />
              </View>

              {cierresFiltrados.map((item) => (
                <View
                  key={item.id}
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
                    #{item.id}
                  </Text>

                  <View
                    style={[
                      styles.usuarioCelda,
                      styles.colUsuario,
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
                        {(item.usuario || "D").charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <View style={{ flex: 1 }}>
                      <Text
                        numberOfLines={1}
                        style={[
                          styles.usuarioNombre,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {item.usuario || "Distribuidor"}
                      </Text>
                      <Text
                        style={[
                          styles.usuarioCorreo,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        {item.correoUsuario || "Sin correo"}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={[
                      styles.celda,
                      styles.colApertura,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {formatearFecha(item.fechaApertura)}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colCierre,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {item.fechaCierre
                      ? formatearFecha(item.fechaCierre)
                      : "En curso"}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colEfectivo,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Bs {formatearDinero(item.totalEfectivo)}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colQr,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Bs {formatearDinero(item.totalQR)}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.colTotal,
                      { color: colors.primary, fontWeight: "700" },
                    ]}
                  >
                    Bs {formatearDinero(item.totalRecaudado)}
                  </Text>

                  <View style={styles.colEstado}>
                    <EstadoBadge estado={item.estado} />
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
                        },
                      ]}
                    >
                      <Ionicons
                        name="eye-outline"
                        size={18}
                        color={isDark ? "#fbbf24" : "#b45309"}
                      />
                    </Pressable>

                    {item.estado.toLowerCase() === "abierta" && (
                      <Pressable
                        onPress={() => abrirCerrarCaja(item)}
                        style={[
                          styles.botonIcono,
                          styles.botonCerrar,
                          isDark && {
                            backgroundColor: "rgba(21, 128, 61, 0.18)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="lock-closed-outline"
                          size={18}
                          color={isDark ? "#4ade80" : "#15803d"}
                        />
                      </Pressable>
                    )}
                  </View>
                </View>
              ))}
            </View>
        )}
      </View>

      {/* Modal Detalle de Cierre de Caja */}
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
              titulo="Detalle del Cierre de Caja"
              onCerrar={cerrarModal}
            />

            {procesando || !detalleCierre ? (
              <View style={styles.vacio}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            ) : (
              <ScrollView style={styles.modalBody}>
                <View style={styles.detalleGrid}>
                  <Dato etiqueta="ID Caja" valor={`#${detalleCierre.id}`} />
                  <Dato etiqueta="Distribuidor" valor={detalleCierre.usuario} />
                  <Dato
                    etiqueta="Correo"
                    valor={detalleCierre.correoUsuario || "Sin correo"}
                  />
                  <Dato
                    etiqueta="Estado"
                    valor={detalleCierre.estado}
                  />
                  <Dato
                    etiqueta="Apertura"
                    valor={formatearFecha(detalleCierre.fechaApertura)}
                  />
                  <Dato
                    etiqueta="Cierre"
                    valor={
                      detalleCierre.fechaCierre
                        ? formatearFecha(detalleCierre.fechaCierre)
                        : "En curso"
                    }
                  />
                  <Dato
                    etiqueta="Total Efectivo"
                    valor={`Bs ${formatearDinero(detalleCierre.totalEfectivo)}`}
                  />
                  <Dato
                    etiqueta="Total QR"
                    valor={`Bs ${formatearDinero(detalleCierre.totalQR)}`}
                  />
                  <Dato
                    etiqueta="Total Recaudado"
                    valor={`Bs ${formatearDinero(detalleCierre.totalRecaudado)}`}
                  />
                  <Dato
                    etiqueta="Cantidad Pagos"
                    valor={`${detalleCierre.pagos.length} cobros`}
                  />
                </View>

                {!!detalleCierre.observacion && (
                  <View
                    style={[
                      styles.observacionCaja,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.seccionTitulo,
                        { marginTop: 0, marginBottom: 5 },
                        isDark && { color: colors.text },
                      ]}
                    >
                      Observación
                    </Text>
                    <Text
                      style={[
                        styles.observacionTexto,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      {detalleCierre.observacion}
                    </Text>
                  </View>
                )}

                <Text
                  style={[
                    styles.seccionTitulo,
                    isDark && { color: colors.text },
                  ]}
                >
                  Cobros Realizados en el Turno ({detalleCierre.pagos.length})
                </Text>

                {detalleCierre.pagos.length === 0 ? (
                  <Text
                    style={[
                      styles.vacioTexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    No se registraron cobros durante esta apertura de caja.
                  </Text>
                ) : (
                  detalleCierre.pagos.map((p) => (
                    <View
                      key={p.idPago}
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
                          size={20}
                          color={isDark ? "#4ade80" : "#15803d"}
                        />
                      </View>

                      <View style={styles.pagoInfo}>
                        <Text
                          style={[
                            styles.pagoCliente,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {p.cliente} · Pedido #{p.idPedido}
                        </Text>
                        <Text
                          style={[
                            styles.pagoSecundario,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          {p.tipoPago} · {formatearFecha(p.fechaPago)}
                        </Text>
                      </View>

                      <Text
                        style={[
                          styles.pagoMonto,
                          isDark && { color: colors.successText },
                        ]}
                      >
                        Bs {formatearDinero(p.montoPagado)}
                      </Text>

                      {detalleCierre.estado.toLowerCase() === "abierta" && (
                        <View style={styles.pagoAcciones}>
                          <Pressable
                            onPress={() => abrirEditarPago(p)}
                            style={[
                              styles.botonEditarPago,
                              isDark && {
                                backgroundColor: "rgba(29, 78, 216, 0.18)",
                                borderColor: "rgba(29, 78, 216, 0.35)",
                              },
                            ]}
                          >
                            <Ionicons
                              name="create-outline"
                              size={15}
                              color={isDark ? "#60a5fa" : "#1d4ed8"}
                            />
                          </Pressable>

                          <Pressable
                            onPress={() => abrirAnularPago(p)}
                            style={[
                              styles.botonAnularPago,
                              isDark && {
                                backgroundColor: "rgba(220, 38, 38, 0.18)",
                                borderColor: "rgba(220, 38, 38, 0.35)",
                              },
                            ]}
                          >
                            <Ionicons
                              name="trash-outline"
                              size={15}
                              color={isDark ? "#f87171" : "#dc2626"}
                            />
                          </Pressable>
                        </View>
                      )}
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

      {/* Modal Editar Pago de Caja Abierta */}
      <Modal
        visible={modal === "editarPago"}
        transparent
        animationType="fade"
        onRequestClose={() => setModal("detalle")}
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
              { maxWidth: 520 },
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <ModalHeader
              titulo="Editar Pago de Caja"
              onCerrar={() => setModal("detalle")}
            />

            <ScrollView style={styles.modalBody}>
              {pagoAEditar && (
                <View
                  style={[
                    styles.bannerInfoPago,
                    isDark && {
                      backgroundColor: "rgba(21, 128, 61, 0.15)",
                      borderColor: "rgba(21, 128, 61, 0.35)",
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.bannerInfoTexto,
                      isDark && { color: "#4ade80" },
                    ]}
                  >
                    Pago #{pagoAEditar.idPago} · Pedido #{pagoAEditar.idPedido}
                  </Text>
                  <Text
                    style={[
                      styles.pagoSecundario,
                      { marginTop: 4 },
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Cliente: {pagoAEditar.cliente} ({pagoAEditar.sucursal})
                  </Text>
                </View>
              )}

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
                    styles.selectorModal,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={idTipoPago}
                    onValueChange={(val) => setIdTipoPago(String(val))}
                    style={{
                      color: isDark ? colors.text : "#2d333a",
                      backgroundColor: "transparent",
                    }}
                    dropdownIconColor={isDark ? colors.text : "#2d333a"}
                  >
                    <Picker.Item
                      label="Seleccionar método de pago..."
                      value=""
                      style={{
                        backgroundColor: isDark
                          ? colors.surfaceElevated
                          : "#ffffff",
                        color: isDark ? colors.textMuted : "#8a9199",
                      }}
                    />
                    {tiposPago.map((tipo) => (
                      <Picker.Item
                        key={tipo.id}
                        label={tipo.descripcion}
                        value={String(tipo.id)}
                        style={{
                          backgroundColor: isDark
                            ? colors.surfaceElevated
                            : "#ffffff",
                          color: isDark ? colors.text : "#252b31",
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
                  Monto a pagar (Bs)
                </Text>
                <TextInput
                  value={montoPago}
                  onChangeText={setMontoPago}
                  placeholder="0.00"
                  placeholderTextColor={colors.inputPlaceholder}
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                />
              </View>

              <Text
                style={[
                  styles.vacioTexto,
                  { textAlign: "left", marginTop: 4 },
                  isDark && { color: colors.textMuted },
                ]}
              >
                Nota: Al modificar este pago, el saldo del pedido y los
                acumuladores de la caja abierta se recalcularán
                automáticamente.
              </Text>
            </ScrollView>

            <View style={styles.modalAcciones}>
              <Pressable
                onPress={() => setModal("detalle")}
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
                onPress={guardarEdicionPago}
                style={[
                  styles.botonModal,
                  styles.botonConfirmar,
                  { backgroundColor: colors.primary },
                ]}
              >
                {procesando ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmarTexto}>Guardar cambios</Text>
                )}
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
        onRequestClose={() => setModal("detalle")}
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
              Se anulará el pago #{pagoAAnular?.idPago} de Bs{" "}
              {pagoAAnular
                ? formatearDinero(pagoAAnular.montoPagado)
                : "0.00"}{" "}
              del pedido #{pagoAAnular?.idPedido} ({pagoAAnular?.cliente}). El
              saldo del pedido y los totales de esta caja se recalcularán
              automáticamente.
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
                onPress={() => setModal("detalle")}
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
                onPress={confirmarAnulacionPago}
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

      {/* Modal Cerrar Caja Administrador */}
      <Modal
        visible={modal === "cerrarCaja"}
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
              { maxWidth: 500 },
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <ModalHeader
              titulo="Forzar Cierre de Caja"
              onCerrar={cerrarModal}
            />

            <ScrollView style={styles.modalBody}>
              {cierreSeleccionado && (
                <View
                  style={[
                    styles.observacionCaja,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.pagoCliente,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Distribuidor: {cierreSeleccionado.usuario}
                  </Text>
                  <Text
                    style={[
                      styles.pagoSecundario,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Total recaudado hasta ahora: Bs{" "}
                    {formatearDinero(cierreSeleccionado.totalRecaudado)} (Efectivo: Bs{" "}
                    {formatearDinero(cierreSeleccionado.totalEfectivo)})
                  </Text>
                </View>
              )}

              <View style={{ marginTop: 15 }}>
                <Text
                  style={[
                    styles.filtroEtiqueta,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Observación del cierre (Opcional)
                </Text>
                <TextInput
                  value={observacion}
                  onChangeText={setObservacion}
                  placeholder="Motivo del cierre administrativo o arqueo..."
                  placeholderTextColor={colors.inputPlaceholder}
                  multiline
                  numberOfLines={3}
                  style={[
                    styles.inputBusqueda,
                    {
                      minHeight: 80,
                      padding: 10,
                      textAlignVertical: "top",
                      borderRadius: 11,
                      borderWidth: 1,
                      borderColor: isDark ? colors.inputBorder : "#dfe3e8",
                      backgroundColor: isDark ? colors.inputBg : "#ffffff",
                    },
                    isDark && { color: colors.text },
                  ]}
                />
              </View>
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
                onPress={confirmarCierreCaja}
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
                  <Text style={styles.confirmarTexto}>Cerrar Caja</Text>
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

function EstadoBadge({ estado }: { estado: string }) {
  const { colors, isDark } = useAppTheme();
  const e = (estado || "").toLowerCase();

  return (
    <View
      style={[
        styles.badge,
        e === "abierta"
          ? isDark
            ? { backgroundColor: "rgba(21, 128, 61, 0.22)" }
            : styles.badgeAbierta
          : e === "cerrada"
            ? isDark
              ? { backgroundColor: colors.surfaceElevated }
              : styles.badgeCerrada
            : isDark
              ? { backgroundColor: "rgba(200, 35, 27, 0.22)" }
              : styles.badgeAnulada,
      ]}
    >
      <Text
        style={
          e === "abierta"
            ? isDark
              ? { color: "#4ade80", fontWeight: "800", fontSize: 10 }
              : styles.badgeTextoAbierta
            : e === "cerrada"
              ? isDark
                ? { color: colors.textSecondary, fontWeight: "800", fontSize: 10 }
                : styles.badgeTextoCerrada
              : isDark
                ? { color: colors.dangerText, fontWeight: "800", fontSize: 10 }
                : styles.badgeTextoAnulada
        }
      >
        {estado}
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
