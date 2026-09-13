import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";
import {
  obtenerActividadDashboard,
  obtenerIngresosDashboard,
  obtenerResumenDashboard,
} from "../../services/dashboardService";
import { obtenerResumenCierresAdmin } from "../../services/cierreCajaAdminService";

import {
  DashboardActividad,
  DashboardResumen,
  IngresoMensual,
} from "../../types/dashboard";
import { CierreCajaResumenAdmin } from "../../types/cierreCajaAdmin";
import { styles } from "../../styles/administrador/dashboard.styles";

function MiniaturaDashboardProducto({
  imagenUrl,
}: {
  imagenUrl?: string | null;
}) {
  const { isDark, colors } = useAppTheme();
  const [errorCarga, setErrorCarga] = useState(false);

  if (imagenUrl && !errorCarga) {
    return (
      <View
        style={{
          width: 38,
          height: 38,
          borderRadius: 11,
          overflow: "hidden",
          backgroundColor: isDark ? colors.surfaceElevated : "#f4f5f7",
          borderWidth: 1,
          borderColor: isDark ? colors.border : "#eceef1",
          marginRight: 2,
        }}
      >
        <Image
          source={{ uri: imagenUrl }}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
          onError={() => setErrorCarga(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.listaIcono,
        {
          backgroundColor: isDark
            ? "rgba(184, 32, 24, 0.22)"
            : "#ffeded",
        },
      ]}
    >
      <Ionicons
        name="warning-outline"
        size={20}
        color={colors.primary}
      />
    </View>
  );
}

export default function DashboardAdministrador() {
  const router = useRouter();
  const { isDark, colors } = useAppTheme();

  const fechaActual = new Date();
  const [anio, setAnio] = useState<number>(fechaActual.getFullYear());
  const [mes, setMes] = useState<number>(fechaActual.getMonth() + 1);

  const [resumen, setResumen] = useState<DashboardResumen | null>(null);
  const [ingresos, setIngresos] = useState<IngresoMensual[]>([]);
  const [actividad, setActividad] = useState<DashboardActividad | null>(null);
  const [resumenCajas, setResumenCajas] =
    useState<CierreCajaResumenAdmin | null>(null);

  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarDatosDashboard(false);
  }, [anio, mes]);

  const cargarDatosDashboard = async (esActualizacionManual = false) => {
    try {
      if (esActualizacionManual) {
        setActualizando(true);
      } else {
        setCargando(true);
      }
      setError(null);

      const [
        resumenData,
        ingresosData,
        actividadData,
        cajasData,
      ] = await Promise.all([
        obtenerResumenDashboard(anio, mes),
        obtenerIngresosDashboard(anio),
        obtenerActividadDashboard(),
        obtenerResumenCierresAdmin().catch(() => null),
      ]);

      setResumen(resumenData);
      setIngresos(Array.isArray(ingresosData) ? ingresosData : []);
      setActividad(actividadData);
      setResumenCajas(cajasData);
    } catch (err: any) {
      console.error("Error al cargar dashboard:", err);
      setError(
        err instanceof Error
          ? err.message
          : "No se pudieron obtener todos los datos del dashboard."
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  const listaAnios = useMemo(() => {
    const actual = new Date().getFullYear();
    return [actual - 2, actual - 1, actual, actual + 1];
  }, []);

  const listaMeses = useMemo(
    () => [
      { id: 1, nombre: "Enero" },
      { id: 2, nombre: "Febrero" },
      { id: 3, nombre: "Marzo" },
      { id: 4, nombre: "Abril" },
      { id: 5, nombre: "Mayo" },
      { id: 6, nombre: "Junio" },
      { id: 7, nombre: "Julio" },
      { id: 8, nombre: "Agosto" },
      { id: 9, nombre: "Septiembre" },
      { id: 10, nombre: "Octubre" },
      { id: 11, nombre: "Noviembre" },
      { id: 12, nombre: "Diciembre" },
    ],
    []
  );

  const maxIngreso = useMemo(() => {
    if (!ingresos.length) return 1;
    const max = Math.max(...ingresos.map((i) => Number(i?.total ?? 0)));
    return max > 0 ? max : 1;
  }, [ingresos]);

  const totalPedidosEstados = useMemo(() => {
    if (!actividad?.pedidosPorEstado) return 0;
    return actividad.pedidosPorEstado.reduce(
      (acc, curr) => acc + Number(curr?.cantidad ?? 0),
      0
    );
  }, [actividad]);

  if (cargando && !resumen && !ingresos.length) {
    return (
      <View
        style={[
          styles.estadoCentro,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            styles.estadoTexto,
            isDark && { color: colors.textSecondary },
          ]}
        >
          Cargando métricas del sistema...
        </Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.pagina, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contenido}
    >
      {/* Encabezado y Filtros */}
      <View style={styles.encabezado}>
        <View>
          <Text
            style={[
              styles.titulo,
              isDark && { color: colors.text },
            ]}
          >
            Panel General
          </Text>
          <Text
            style={[
              styles.subtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Resumen financiero, operativo y control de inventario
          </Text>
        </View>

        <View style={styles.filtrosPeriodo}>
          <View style={styles.grupoFiltro}>
            <Text
              style={[
                styles.filtroEtiqueta,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Año
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
                selectedValue={anio}
                onValueChange={(val) => setAnio(Number(val))}
                style={[
                  styles.selector,
                  isDark && { color: colors.text, backgroundColor: colors.inputBg },
                ]}
              >
                {listaAnios.map((a) => (
                  <Picker.Item key={a} label={String(a)} value={a} />
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
              Mes
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
                selectedValue={mes}
                onValueChange={(val) => setMes(Number(val))}
                style={[
                  styles.selector,
                  isDark && { color: colors.text, backgroundColor: colors.inputBg },
                ]}
              >
                {listaMeses.map((m) => (
                  <Picker.Item key={m.id} label={m.nombre} value={m.id} />
                ))}
              </Picker>
            </View>
          </View>

          <Pressable
            style={({ pressed }) => [
              styles.botonActualizar,
              isDark && {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
              pressed && { opacity: 0.7 },
            ]}
            onPress={() => cargarDatosDashboard(true)}
            disabled={actualizando}
          >
            {actualizando ? (
              <ActivityIndicator size="small" color={colors.primary} />
            ) : (
              <Ionicons
                name="refresh-outline"
                size={18}
                color={isDark ? colors.text : "#1f2329"}
              />
            )}
            <Text
              style={[
                styles.botonActualizarTexto,
                isDark && { color: colors.text },
              ]}
            >
              {actualizando ? "Actualizando..." : "Actualizar"}
            </Text>
          </Pressable>
        </View>
      </View>

      {!!error && (
        <View
          style={[
            styles.errorCaja,
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
              styles.errorTexto,
              { color: colors.dangerText },
            ]}
          >
            {error}
          </Text>
        </View>
      )}

      {/* Tarjetas KPI Principales */}
      <View style={styles.kpis}>
        <View
          style={[
            styles.kpiCard,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.kpiTop}>
            <Text
              style={[
                styles.kpiEtiqueta,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Ventas del Mes
            </Text>
            <View
              style={[
                styles.kpiIcono,
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Ionicons
                name="cart-outline"
                size={22}
                color={colors.primary}
              />
            </View>
          </View>
          <Text
            style={[
              styles.kpiValor,
              isDark && { color: colors.text },
            ]}
          >
            Bs {Number(resumen?.ingresosMes ?? 0).toFixed(2)}
          </Text>
          <Text
            style={[
              styles.kpiAyuda,
              isDark && { color: colors.textMuted },
            ]}
          >
            Mes anterior: Bs {Number(resumen?.ingresosMesAnterior ?? 0).toFixed(2)}
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.kpiTop}>
            <Text
              style={[
                styles.kpiEtiqueta,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Total Cobrado
            </Text>
            <View
              style={[
                styles.kpiIcono,
                {
                  backgroundColor: isDark
                    ? "rgba(21, 128, 61, 0.22)"
                    : "#e9f8ef",
                },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={22}
                color={isDark ? "#4ade80" : "#1e874b"}
              />
            </View>
          </View>
          <Text
            style={[
              styles.kpiValor,
              { color: isDark ? "#4ade80" : "#1e874b" },
            ]}
          >
            Bs {Number(resumen?.totalCobrado ?? 0).toFixed(2)}
          </Text>
          <Text
            style={[
              styles.kpiAyuda,
              isDark && { color: colors.textMuted },
            ]}
          >
            Efectividad cobranza: {Number(resumen?.porcentajeCobranza ?? 0).toFixed(1)}%
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.kpiTop}>
            <Text
              style={[
                styles.kpiEtiqueta,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Saldo Pendiente
            </Text>
            <View
              style={[
                styles.kpiIcono,
                {
                  backgroundColor: isDark
                    ? "rgba(194, 65, 12, 0.22)"
                    : "#fff5dd",
                },
              ]}
            >
              <Ionicons
                name="time-outline"
                size={22}
                color={isDark ? "#fb923c" : "#a86c00"}
              />
            </View>
          </View>
          <Text
            style={[
              styles.kpiValor,
              { color: isDark ? "#fb923c" : "#a86c00" },
            ]}
          >
            Bs {Number(resumen?.deudaPendienteMes ?? 0).toFixed(2)}
          </Text>
          <Text
            style={[
              styles.kpiAyuda,
              isDark && { color: colors.textMuted },
            ]}
          >
            Cuentas por cobrar del periodo
          </Text>
        </View>

        <View
          style={[
            styles.kpiCard,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View style={styles.kpiTop}>
            <Text
              style={[
                styles.kpiEtiqueta,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Pedidos Totales
            </Text>
            <View
              style={[
                styles.kpiIcono,
                {
                  backgroundColor: isDark
                    ? "rgba(29, 78, 216, 0.22)"
                    : "#e8f2ff",
                },
              ]}
            >
              <Ionicons
                name="cube-outline"
                size={22}
                color={isDark ? "#60a5fa" : "#1565c0"}
              />
            </View>
          </View>
          <Text
            style={[
              styles.kpiValor,
              { color: isDark ? "#60a5fa" : "#1565c0" },
            ]}
          >
            {Number(resumen?.pedidosMes ?? 0)}
          </Text>
          <Text
            style={[
              styles.kpiAyuda,
              isDark && { color: colors.textMuted },
            ]}
          >
            Pendientes entrega: {Number(resumen?.pedidosPendientesConfirmacion ?? 0)}
          </Text>
        </View>
      </View>

      {/* SECCIÓN CIERRES DE CAJA Y ARQUEOS */}
      <View
        style={[
          styles.seccionCajas,
          isDark && {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.seccionCajasHead}>
          <View style={styles.seccionCajasTituloRow}>
            <View
              style={[
                styles.seccionCajasIcono,
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Ionicons
                name="cash-outline"
                size={24}
                color={colors.primary}
              />
            </View>
            <View>
              <Text
                style={[
                  styles.seccionCajasTitulo,
                  isDark && { color: colors.text },
                ]}
              >
                Control de Cajas y Recaudaciones
              </Text>
              <Text
                style={[
                  styles.seccionCajasSubtitulo,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Estado de las cajas de distribuidores y arqueos activos
              </Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.botonIrCierres,
              { backgroundColor: colors.primary },
            ]}
            onPress={() => router.push("/administrador/cierres-caja")}
          >
            <Text style={styles.botonIrCierresTexto}>
              Gestionar Cierres de Caja
            </Text>
            <Ionicons name="arrow-forward" size={16} color="#ffffff" />
          </Pressable>
        </View>

        <View style={styles.cajasGrid}>
          <View
            style={[
              styles.cajaMiniCard,
              isDark && {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.cajaMiniEtiqueta,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Cajas Abiertas
            </Text>
            <Text
              style={[
                styles.cajaMiniValor,
                { color: isDark ? "#4ade80" : "#1e874b" },
              ]}
            >
              {Number(resumenCajas?.totalCajasAbiertas ?? 0)}
            </Text>
            <Text
              style={[
                styles.cajaMiniDetalle,
                isDark && { color: colors.textMuted },
              ]}
            >
              En ruta: Bs {Number(resumenCajas?.totalRecaudadoAbiertas ?? 0).toFixed(2)}
            </Text>
          </View>

          <View
            style={[
              styles.cajaMiniCard,
              isDark && {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.cajaMiniEtiqueta,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Cajas Cerradas
            </Text>
            <Text
              style={[
                styles.cajaMiniValor,
                isDark && { color: colors.text },
              ]}
            >
              {Number(resumenCajas?.totalCajasCerradas ?? 0)}
            </Text>
            <Text
              style={[
                styles.cajaMiniDetalle,
                isDark && { color: colors.textMuted },
              ]}
            >
              Liquidado: Bs {Number(resumenCajas?.totalRecaudadoCerradas ?? 0).toFixed(2)}
            </Text>
          </View>

          <View
            style={[
              styles.cajaMiniCard,
              isDark && {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.cajaMiniEtiqueta,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Recaudado en Efectivo
            </Text>
            <Text
              style={[
                styles.cajaMiniValor,
                { color: isDark ? "#60a5fa" : "#1565c0" },
              ]}
            >
              Bs {Number(resumenCajas?.totalEfectivoGeneral ?? 0).toFixed(2)}
            </Text>
            <Text
              style={[
                styles.cajaMiniDetalle,
                isDark && { color: colors.textMuted },
              ]}
            >
              Arqueos totales en efectivo
            </Text>
          </View>

          <View
            style={[
              styles.cajaMiniCard,
              isDark && {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Text
              style={[
                styles.cajaMiniEtiqueta,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Recaudado por QR
            </Text>
            <Text
              style={[
                styles.cajaMiniValor,
                { color: isDark ? "#c084fc" : "#7c3aed" },
              ]}
            >
              Bs {Number(resumenCajas?.totalQRGeneral ?? 0).toFixed(2)}
            </Text>
            <Text
              style={[
                styles.cajaMiniDetalle,
                isDark && { color: colors.textMuted },
              ]}
            >
              Transferencias QR directas
            </Text>
          </View>

          <View
            style={[
              styles.cajaMiniCard,
              {
                backgroundColor: isDark
                  ? "rgba(200, 35, 27, 0.18)"
                  : "#fff0ef",
                borderColor: isDark
                  ? "rgba(200, 35, 27, 0.35)"
                  : "#f7c7c4",
              },
            ]}
          >
            <Text
              style={[
                styles.cajaMiniEtiqueta,
                { color: colors.primary },
              ]}
            >
              Gran Total Recaudado
            </Text>
            <Text
              style={[
                styles.cajaMiniValor,
                { color: colors.primary },
              ]}
            >
              Bs {Number(resumenCajas?.granTotalRecaudado ?? 0).toFixed(2)}
            </Text>
            <Text
              style={[
                styles.cajaMiniDetalle,
                isDark && { color: colors.textMuted },
              ]}
            >
              Suma total de todas las cajas
            </Text>
          </View>
        </View>
      </View>

      {/* Gráficos Principales */}
      <View style={styles.filaPrincipal}>
        {/* Gráfico de Ventas Mensuales */}
        <View
          style={[
            styles.panelGrande,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.panelTitulo,
              isDark && { color: colors.text },
            ]}
          >
            Ingresos por Mes ({anio})
          </Text>
          <Text
            style={[
              styles.panelSubtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Comportamiento de facturación a lo largo del año
          </Text>

          <View style={styles.graficoColumnas}>
            {ingresos.map((item) => {
              const valorTotal = Number(item?.total ?? 0);
              const alturaPorcentaje = Math.max(
                4,
                Math.round((valorTotal / maxIngreso) * 100)
              );

              return (
                <View key={item.mes} style={styles.columnaMes}>
                  <Text
                    style={[
                      styles.valorColumna,
                      isDark && { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {valorTotal > 0 ? `${(valorTotal / 1000).toFixed(1)}k` : "0"}
                  </Text>

                  <View
                    style={[
                      styles.barraFondo,
                      isDark && { backgroundColor: colors.surfaceElevated },
                    ]}
                  >
                    <View
                      style={[
                        styles.barraIngreso,
                        {
                          height: `${alturaPorcentaje}%`,
                          backgroundColor: colors.primary,
                        },
                      ]}
                    />
                  </View>

                  <Text
                    style={[
                      styles.etiquetaMes,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    {item.nombreMes || `Mes ${item.mes}`}
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Distribución de Estados de Pedidos */}
        <View
          style={[
            styles.panelMedio,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.panelTitulo,
              isDark && { color: colors.text },
            ]}
          >
            Distribución de Pedidos
          </Text>
          <Text
            style={[
              styles.panelSubtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Total analizado: {totalPedidosEstados} pedidos
          </Text>

          <View style={{ marginTop: 14 }}>
            {(actividad?.pedidosPorEstado ?? []).map((item) => {
              const cantidad = Number(item?.cantidad ?? 0);
              const porcentaje =
                totalPedidosEstados > 0
                  ? Math.round((cantidad / totalPedidosEstados) * 100)
                  : 0;

              return (
                <View key={item.estado} style={styles.progresoContenedor}>
                  <View style={styles.progresoCabecera}>
                    <Text
                      style={[
                        styles.progresoEtiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      {item.estado}
                    </Text>
                    <Text
                      style={[
                        styles.progresoValor,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {cantidad} ({porcentaje}%)
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.progresoFondo,
                      isDark && { backgroundColor: colors.surfaceElevated },
                    ]}
                  >
                    <View
                      style={[
                        styles.progresoBarra,
                        {
                          width: `${porcentaje}%`,
                          backgroundColor:
                            (item.estado || "").toLowerCase() === "entregado"
                              ? "#1e874b"
                              : (item.estado || "").toLowerCase() === "encamino"
                              ? "#1565c0"
                              : (item.estado || "").toLowerCase() === "pendiente"
                              ? "#a86c00"
                              : colors.primary,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>

      {/* Actividad Reciente y Productos con Bajo Stock */}
      <View style={styles.filaSecundaria}>
        <View
          style={[
            styles.panelMedio,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.panelTitulo,
              isDark && { color: colors.text },
            ]}
          >
            Últimos Pagos Registrados
          </Text>
          <Text
            style={[
              styles.panelSubtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Cobranzas recientes recibidas
          </Text>

          <View style={{ marginTop: 12 }}>
            {(actividad?.ultimosPagos ?? []).length === 0 ? (
              <Text
                style={[
                  styles.estadoTexto,
                  isDark && { color: colors.textMuted },
                ]}
              >
                No hay pagos registrados recientemente.
              </Text>
            ) : (
              (actividad?.ultimosPagos ?? []).map((pago) => {
                const monto = Number(pago?.montoPagado ?? 0);
                const idPago = pago?.idPago || pago?.idPedido || Math.random();

                return (
                  <View
                    key={idPago}
                    style={[
                      styles.listaItem,
                      isDark && { borderBottomColor: colors.borderLight },
                    ]}
                  >
                    <View
                      style={[
                        styles.listaIcono,
                        {
                          backgroundColor: isDark
                            ? "rgba(21, 128, 61, 0.22)"
                            : "#e9f8ef",
                        },
                      ]}
                    >
                      <Ionicons
                        name="cash-outline"
                        size={20}
                        color={isDark ? "#4ade80" : "#1e874b"}
                      />
                    </View>
                    <View style={styles.listaInfo}>
                      <Text
                        style={[
                          styles.listaTitulo,
                          isDark && { color: colors.text },
                        ]}
                      >
                        Pedido #{pago?.idPedido}
                      </Text>
                      <Text
                        style={[
                          styles.listaSubtitulo,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        {pago?.cliente || "Cliente"} · {pago?.tipoPago || "Pago"}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.listaValor,
                        { color: isDark ? "#4ade80" : "#1e874b" },
                      ]}
                    >
                      + Bs {monto.toFixed(2)}
                    </Text>
                  </View>
                );
              })
            )}
          </View>
        </View>

        <View
          style={[
            styles.panelMedio,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <Text
            style={[
              styles.panelTitulo,
              isDark && { color: colors.text },
            ]}
          >
            Alertas de Inventario
          </Text>
          <Text
            style={[
              styles.panelSubtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Productos con stock reducido
          </Text>

          <View style={{ marginTop: 12 }}>
            {(actividad?.productosStockBajo ?? []).length === 0 ? (
              <Text
                style={[
                  styles.estadoTexto,
                  isDark && { color: colors.textMuted },
                ]}
              >
                Inventario en niveles óptimos.
              </Text>
            ) : (
              (actividad?.productosStockBajo ?? []).map((prod) => {
                const precio = Number(prod?.precio ?? 0);
                const stock = Number(prod?.stock ?? 0);
                const idProducto = prod?.idProducto || Math.random();

                return (
                  <View
                    key={idProducto}
                    style={[
                      styles.listaItem,
                      isDark && { borderBottomColor: colors.borderLight },
                    ]}
                  >
                    <MiniaturaDashboardProducto imagenUrl={prod?.imagenUrl} />
                    <View style={styles.listaInfo}>
                      <Text
                        style={[
                          styles.listaTitulo,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {prod?.producto || "Producto"}
                      </Text>
                      <Text
                        style={[
                          styles.listaSubtitulo,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Precio: Bs {precio.toFixed(2)}
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.estadoBadge,
                        {
                          backgroundColor: isDark
                            ? "rgba(184, 32, 24, 0.22)"
                            : "#ffeded",
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.estadoBadgeTexto,
                          { color: colors.primary },
                        ]}
                      >
                        Stock: {stock}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}