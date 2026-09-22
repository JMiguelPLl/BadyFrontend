import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View
} from "react-native";

import Paginacion from "../../components/comun/Paginacion";
import { useAppTheme } from "../../hooks/useAppTheme";
import { usePaginacion } from "../../hooks/usePaginacion";
import { obtenerUsuario } from "../../services/authService";
import {
  cargarDatosConsolidadosReportes,
  exportarACSV,
  exportarAExcel,
  formatearFechaConHora,
  formatearFechaCorta,
  generarHtmlReporte,
  imprimirReporteHtml,
  obtenerRangoPreset,
  obtenerReportePagosEfectivo,
  obtenerReportePagosQR,
  obtenerResumenMetodosPago,
  procesarReporteCobranzas,
  procesarReporteInventario,
  procesarReporteVentas,
} from "../../services/reporteService";
import { styles } from "../../styles/administrador/reportes.styles";
import { PedidoAdmin } from "../../types/asignacionPedido";
import { CierreCajaAdmin } from "../../types/cierreCajaAdmin";
import { Cliente } from "../../types/cliente";
import { DeudaPedido } from "../../types/pagoAdmin";
import { Producto } from "../../types/producto";
import {
  PagoMetodoReporteItem,
  PestanaReporte,
  PresetFecha,
  ReporteCobranzasFiltros,
  ReporteVentasFiltros,
  ResumenMetodosPago,
  SubPestanaCobranzas,
} from "../../types/reporte";

export default function ReportesAdministrador() {
  const { colors, isDark } = useAppTheme();

  // Nombre del administrador que emite el reporte
  const [adminActual, setAdminActual] = useState<string>("Administrador");

  useEffect(() => {
    obtenerUsuario().then((u) => {
      if (u) {
        const nombreCompleto = `${u.nombre || ""} ${u.apellido || ""}`.trim();
        setAdminActual(nombreCompleto || "Administrador");
      }
    });
  }, []);

  // Pestaña principal activa
  const [pestanaActiva, setPestanaActiva] = useState<PestanaReporte>("ventas");

  // Sub-pestaña de cobranzas activa
  const [subPestanaCobranzas, setSubPestanaCobranzas] =
    useState<SubPestanaCobranzas>("cobros");

  // Preset de fecha activo
  const [presetFecha, setPresetFecha] = useState<PresetFecha>("mes");

  // Rango de fechas manual
  const rangoInicial = useMemo(() => obtenerRangoPreset("mes"), []);
  const [fechaInicio, setFechaInicio] = useState<string>(rangoInicial.inicio);
  const [fechaFin, setFechaFin] = useState<string>(rangoInicial.fin);

  // Filtros adicionales de ventas
  const [filtroEstadoVentas, setFiltroEstadoVentas] = useState<string>("Todos");
  const [filtroClienteVentas, setFiltroClienteVentas] = useState<string>("Todos");
  const [busquedaVentas, setBusquedaVentas] = useState<string>("");

  // Filtros adicionales de cobranzas
  const [busquedaCobranzas, setBusquedaCobranzas] = useState<string>("");

  // Filtros adicionales de inventario
  const [busquedaInventario, setBusquedaInventario] = useState<string>("");
  const [filtroAlertaStock, setFiltroAlertaStock] = useState<string>("Todos");

  // Estados de reporte de métodos de pago (Efectivo y QR)
  const [resumenMetodos, setResumenMetodos] = useState<ResumenMetodosPago | null>(null);
  const [pagosMetodos, setPagosMetodos] = useState<PagoMetodoReporteItem[]>([]);
  const [cargandoMetodos, setCargandoMetodos] = useState<boolean>(false);
  const [filtroMetodoPago, setFiltroMetodoPago] = useState<"Todos" | "Efectivo" | "QR">("Todos");
  const [busquedaMetodos, setBusquedaMetodos] = useState<string>("");

  // Estados de datos crudos
  const [cargando, setCargando] = useState<boolean>(true);
  const [pedidos, setPedidos] = useState<PedidoAdmin[]>([]);
  const [deudas, setDeudas] = useState<DeudaPedido[]>([]);
  const [cierres, setCierres] = useState<CierreCajaAdmin[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarMetodosPago = async (fInicio?: string, fFin?: string) => {
    try {
      setCargandoMetodos(true);
      const [resumen, pagosEf, pagosQr] = await Promise.all([
        obtenerResumenMetodosPago(fInicio || undefined, fFin || undefined),
        obtenerReportePagosEfectivo({
          fechaDesde: fInicio || undefined,
          fechaHasta: fFin || undefined,
        }),
        obtenerReportePagosQR({
          fechaDesde: fInicio || undefined,
          fechaHasta: fFin || undefined,
        }),
      ]);
      setResumenMetodos(resumen);
      const combinados = [...pagosEf, ...pagosQr].sort(
        (a, b) => new Date(b.fechaPago).getTime() - new Date(a.fechaPago).getTime()
      );
      setPagosMetodos(combinados);
    } catch (error) {
      console.error("Error al cargar métodos de pago:", error);
    } finally {
      setCargandoMetodos(false);
    }
  };

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const datos = await cargarDatosConsolidadosReportes();
      setPedidos(datos.pedidos);
      setDeudas(datos.deudas);
      setCierres(datos.cierres);
      setProductos(datos.productos);
      setClientes(datos.clientes);
      cargarMetodosPago(fechaInicio, fechaFin);
    } catch (error) {
      Alert.alert(
        "Error",
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los datos para los reportes."
      );
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    if (pestanaActiva === "metodosPago") {
      cargarMetodosPago(fechaInicio, fechaFin);
    }
  }, [pestanaActiva, fechaInicio, fechaFin]);

  // Cambio de preset de fechas
  const aplicarPresetFecha = (preset: PresetFecha) => {
    setPresetFecha(preset);
    const { inicio, fin } = obtenerRangoPreset(preset);
    setFechaInicio(inicio);
    setFechaFin(fin);
  };

  // =========================================================
  // PROCESAMIENTO ANALÍTICO
  // =========================================================

  const reporteVentas = useMemo(() => {
    const filtros: ReporteVentasFiltros = {
      fechaInicio,
      fechaFin,
      estado: filtroEstadoVentas,
      idCliente:
        filtroClienteVentas !== "Todos"
          ? Number(filtroClienteVentas)
          : undefined,
      busqueda: busquedaVentas,
    };
    return procesarReporteVentas(pedidos, filtros);
  }, [
    pedidos,
    fechaInicio,
    fechaFin,
    filtroEstadoVentas,
    filtroClienteVentas,
    busquedaVentas,
  ]);

  const reporteCobranzas = useMemo(() => {
    const filtros: ReporteCobranzasFiltros = {
      fechaInicio,
      fechaFin,
      busqueda: busquedaCobranzas,
    };
    return procesarReporteCobranzas(deudas, cierres, filtros);
  }, [deudas, cierres, fechaInicio, fechaFin, busquedaCobranzas]);

  const reporteInventario = useMemo(() => {
    return procesarReporteInventario(productos, pedidos, fechaInicio, fechaFin);
  }, [productos, pedidos, fechaInicio, fechaFin]);

  // Filtrado específico de inventario por búsqueda y nivel de alerta
  const productosInventarioFiltrados = useMemo(() => {
    const b = busquedaInventario.trim().toLowerCase();
    return reporteInventario.productos.filter((p) => {
      if (filtroAlertaStock !== "Todos" && p.nivelAlerta !== filtroAlertaStock) {
        return false;
      }
      if (b) {
        const matchNombre = p.nombre.toLowerCase().includes(b);
        const matchId = String(p.idProducto).includes(b);
        if (!matchNombre && !matchId) return false;
      }
      return true;
    });
  }, [reporteInventario, busquedaInventario, filtroAlertaStock]);

  // Filtrado de pagos por método (Efectivo y QR)
  const pagosMetodosFiltrados = useMemo(() => {
    const b = busquedaMetodos.trim().toLowerCase();
    return pagosMetodos.filter((p) => {
      if (filtroMetodoPago === "Efectivo" && !p.tipoPago.toLowerCase().includes("efectivo")) {
        return false;
      }
      if (filtroMetodoPago === "QR" && !p.tipoPago.toLowerCase().includes("qr")) {
        return false;
      }
      if (b) {
        const matchCliente = p.cliente?.toLowerCase().includes(b);
        const matchUsuario = p.usuario?.toLowerCase().includes(b);
        const matchPedido = String(p.idPedido).includes(b);
        const matchPago = String(p.idPago).includes(b);
        if (!matchCliente && !matchUsuario && !matchPedido && !matchPago) {
          return false;
        }
      }
      return true;
    });
  }, [pagosMetodos, filtroMetodoPago, busquedaMetodos]);

  // Hooks de paginación para todas las tablas
  const paginacionVentas = usePaginacion(reporteVentas.items, { registrosPorPaginaInicial: 10 });
  const paginacionCobros = usePaginacion(reporteCobranzas.cobros, { registrosPorPaginaInicial: 10 });
  const paginacionDeudas = usePaginacion(reporteCobranzas.cuentasPorCobrar, { registrosPorPaginaInicial: 10 });
  const paginacionArqueos = usePaginacion(reporteCobranzas.arqueos, { registrosPorPaginaInicial: 10 });
  const paginacionInventario = usePaginacion(productosInventarioFiltrados, { registrosPorPaginaInicial: 10 });
  const paginacionMetodos = usePaginacion(pagosMetodosFiltrados, { registrosPorPaginaInicial: 10 });

  // =========================================================
  // EXPORTACIÓN A EXCEL (.xlsx) Y CSV
  // =========================================================

  const handleExportarExcel = () => {
    if (pestanaActiva === "ventas") {
      const encabezados = [
        "ID Pedido",
        "Fecha y Hora",
        "Cliente",
        "Sucursal",
        "Productos",
        "Cant. Total",
        "Total (Bs)",
        "Saldo (Bs)",
        "Estado",
        "Motivo Devolución / Edición",
      ];
      const filas = reporteVentas.items.map((it) => [
        it.idPedido,
        formatearFechaConHora(it.fecha),
        it.cliente,
        it.sucursal,
        it.productosResumen,
        it.totalProductos,
        Number(it.total.toFixed(2)),
        Number(it.saldo.toFixed(2)),
        it.estado,
        it.motivoDevolucion || it.motivoEdicion || "-",
      ]);
      exportarAExcel(
        `Reporte_Ventas_${fechaInicio || "inicio"}_al_${fechaFin || "fin"}`,
        "Ventas y Pedidos",
        encabezados,
        filas
      );
    } else if (pestanaActiva === "cobranzas") {
      if (subPestanaCobranzas === "cobros") {
        const encabezados = [
          "ID Pago",
          "ID Pedido",
          "Fecha y Hora",
          "Cliente",
          "Cobrado Por",
          "Método Pago",
          "Monto Cobrado (Bs)",
          "Estado Pago",
        ];
        const filas = reporteCobranzas.cobros.map((c) => [
          c.idPago,
          c.idPedido,
          formatearFechaConHora(c.fecha),
          c.cliente,
          c.cobradoPor,
          c.metodoPago,
          Number(c.monto.toFixed(2)),
          c.estado,
        ]);
        exportarAExcel(
          `Reporte_Cobros_${fechaInicio || "inicio"}_al_${fechaFin || "fin"}`,
          "Cobros Registrados",
          encabezados,
          filas
        );
      } else if (subPestanaCobranzas === "deudas") {
        const encabezados = [
          "ID Cliente",
          "Cliente",
          "Sucursal",
          "Pedidos con Deuda",
          "Total Facturado (Bs)",
          "Total Deuda Pendiente (Bs)",
          "Último Pedido",
        ];
        const filas = reporteCobranzas.cuentasPorCobrar.map((d) => [
          d.idCliente,
          d.cliente,
          d.sucursal,
          d.cantidadPedidosConDeuda,
          Number(d.totalFacturado.toFixed(2)),
          Number(d.totalDeuda.toFixed(2)),
          formatearFechaCorta(d.fechaUltimoPedido),
        ]);
        exportarAExcel(
          `Reporte_Cuentas_Por_Cobrar_${fechaInicio || "inicio"}_al_${fechaFin || "fin"}`,
          "Cuentas por Cobrar",
          encabezados,
          filas
        );
      } else {
        const encabezados = [
          "ID Cierre",
          "Usuario Chofer",
          "Fecha Apertura",
          "Fecha Cierre",
          "Ventas Efectivo (Bs)",
          "Ventas Digital (Bs)",
          "Total Recaudado (Bs)",
          "Pagos Registrados",
          "Estado",
        ];
        const filas = reporteCobranzas.arqueos.map((a) => [
          a.idCierre,
          a.usuario,
          formatearFechaConHora(a.fechaApertura),
          formatearFechaConHora(a.fechaCierre || undefined),
          Number(a.ventasEfectivo.toFixed(2)),
          Number(a.ventasDigital.toFixed(2)),
          Number(a.totalRecaudado.toFixed(2)),
          a.cantidadPagos || 0,
          a.estado,
        ]);
        exportarAExcel(
          `Reporte_Arqueos_Caja_${fechaInicio || "inicio"}_al_${fechaFin || "fin"}`,
          "Arqueos Choferes",
          encabezados,
          filas
        );
      }
    } else if (pestanaActiva === "metodosPago") {
      const encabezados = [
        "ID Pago",
        "ID Pedido",
        "Fecha y Hora",
        "Cliente",
        "Sucursal",
        "Cobrado Por",
        "Método Pago",
        "Monto Cobrado (Bs)",
        "Estado Pago",
      ];
      const filas = pagosMetodosFiltrados.map((p) => [
        p.idPago,
        p.idPedido,
        formatearFechaConHora(p.fechaPago),
        p.cliente || "-",
        p.sucursal || "-",
        p.usuario || "-",
        p.tipoPago,
        Number(p.montoPagado.toFixed(2)),
        p.estadoPago,
      ]);
      exportarAExcel(
        `Reporte_Metodos_Pago_${fechaInicio || "inicio"}_al_${fechaFin || "fin"}`,
        "Métodos de Pago",
        encabezados,
        filas
      );
    } else {
      // Inventario
      const encabezados = [
        "ID Producto",
        "Producto",
        "Precio Unitario (Bs)",
        "Stock Actual (Unid)",
        "Valorización (Bs)",
        "Unidades Vendidas en Periodo",
        "Total Generado (Bs)",
        "Índice Rotación",
        "Nivel Alerta",
        "Sugerencia Producción (Unid)",
      ];
      const filas = productosInventarioFiltrados.map((p) => [
        p.idProducto,
        p.nombre,
        Number(p.precio.toFixed(2)),
        p.stockActual,
        Number(p.valorizacion.toFixed(2)),
        p.unidadesVendidas,
        Number(p.totalGenerado.toFixed(2)),
        Number(p.rotacionRatio.toFixed(2)),
        p.nivelAlerta.toUpperCase(),
        p.sugerenciaProduccion,
      ]);
      exportarAExcel(
        `Reporte_Inventario_Produccion_${new Date().toISOString().split("T")[0]}`,
        "Inventario y Stock",
        encabezados,
        filas
      );
    }
  };

  const handleExportarCSV = () => {
    if (pestanaActiva === "ventas") {
      const encabezados = [
        "ID Pedido",
        "Fecha",
        "Cliente",
        "Sucursal",
        "Productos",
        "Total Productos",
        "Total (Bs)",
        "Saldo (Bs)",
        "Estado",
        "Motivo Devolución / Edición",
      ];
      const filas = reporteVentas.items.map((it) => [
        it.idPedido,
        formatearFechaConHora(it.fecha),
        it.cliente,
        it.sucursal,
        it.productosResumen,
        it.totalProductos,
        it.total.toFixed(2),
        it.saldo.toFixed(2),
        it.estado,
        it.motivoDevolucion || it.motivoEdicion || "-",
      ]);
      exportarACSV(
        `Reporte_Ventas_${fechaInicio || "inicio"}_al_${fechaFin || "fin"}`,
        encabezados,
        filas
      );
    } else if (pestanaActiva === "cobranzas") {
      if (subPestanaCobranzas === "cobros") {
        const encabezados = [
          "ID Pago",
          "ID Pedido",
          "Fecha",
          "Cliente",
          "Cobrado Por",
          "Método Pago",
          "Monto (Bs)",
          "Estado",
        ];
        const filas = reporteCobranzas.cobros.map((c) => [
          c.idPago,
          c.idPedido,
          formatearFechaConHora(c.fecha),
          c.cliente,
          c.cobradoPor,
          c.metodoPago,
          c.monto.toFixed(2),
          c.estado,
        ]);
        exportarACSV(
          `Reporte_Cobranzas_${fechaInicio || "inicio"}_al_${fechaFin || "fin"}`,
          encabezados,
          filas
        );
      } else if (subPestanaCobranzas === "deudas") {
        const encabezados = [
          "ID Cliente",
          "Cliente",
          "Sucursal",
          "Pedidos con Deuda",
          "Total Facturado (Bs)",
          "Total Deuda Pendiente (Bs)",
          "Último Pedido",
        ];
        const filas = reporteCobranzas.cuentasPorCobrar.map((d) => [
          d.idCliente,
          d.cliente,
          d.sucursal,
          d.cantidadPedidosConDeuda,
          d.totalFacturado.toFixed(2),
          d.totalDeuda.toFixed(2),
          formatearFechaCorta(d.fechaUltimoPedido),
        ]);
        exportarACSV(
          `Reporte_Cuentas_Por_Cobrar_${fechaInicio || "inicio"}_al_${fechaFin || "fin"}`,
          encabezados,
          filas
        );
      } else {
        const encabezados = [
          "ID Cierre",
          "Usuario Chofer",
          "Fecha Apertura",
          "Fecha Cierre",
          "Ventas Efectivo (Bs)",
          "Ventas Digital (Bs)",
          "Total Recaudado (Bs)",
          "Pagos Registrados",
          "Estado",
        ];
        const filas = reporteCobranzas.arqueos.map((a) => [
          a.idCierre,
          a.usuario,
          formatearFechaConHora(a.fechaApertura),
          formatearFechaConHora(a.fechaCierre || undefined),
          a.ventasEfectivo.toFixed(2),
          a.ventasDigital.toFixed(2),
          a.totalRecaudado.toFixed(2),
          a.cantidadPagos || 0,
          a.estado,
        ]);
        exportarACSV(
          `Reporte_Arqueos_Caja_${fechaInicio || "inicio"}_al_${fechaFin || "fin"}`,
          encabezados,
          filas
        );
      }
    } else if (pestanaActiva === "metodosPago") {
      const encabezados = [
        "ID Pago",
        "ID Pedido",
        "Fecha y Hora",
        "Cliente",
        "Sucursal",
        "Cobrado Por",
        "Método Pago",
        "Monto Cobrado (Bs)",
        "Estado Pago",
      ];
      const filas = pagosMetodosFiltrados.map((p) => [
        p.idPago,
        p.idPedido,
        formatearFechaConHora(p.fechaPago),
        p.cliente || "-",
        p.sucursal || "-",
        p.usuario || "-",
        p.tipoPago,
        p.montoPagado.toFixed(2),
        p.estadoPago,
      ]);
      exportarACSV(
        `Reporte_Metodos_Pago_${fechaInicio || "inicio"}_al_${fechaFin || "fin"}`,
        encabezados,
        filas
      );
    } else {
      // Inventario
      const encabezados = [
        "ID Producto",
        "Producto",
        "Precio Unitario (Bs)",
        "Stock Actual (Unid)",
        "Valorización (Bs)",
        "Unidades Vendidas en Periodo",
        "Total Generado (Bs)",
        "Índice Rotación",
        "Nivel Alerta",
        "Sugerencia Producción (Unid)",
      ];
      const filas = productosInventarioFiltrados.map((p) => [
        p.idProducto,
        p.nombre,
        p.precio.toFixed(2),
        p.stockActual,
        p.valorizacion.toFixed(2),
        p.unidadesVendidas,
        p.totalGenerado.toFixed(2),
        p.rotacionRatio.toFixed(2),
        p.nivelAlerta.toUpperCase(),
        p.sugerenciaProduccion,
      ]);
      exportarACSV(
        `Reporte_Inventario_Produccion_${new Date().toISOString().split("T")[0]}`,
        encabezados,
        filas
      );
    }
  };

  // =========================================================
  // IMPRESIÓN LIMPIA DE REPORTE OFICIAL EN PDF
  // =========================================================

  const handleImprimir = () => {
    const rangoTexto = `Del ${fechaInicio || "Inicio histórico"} al ${fechaFin || "Hoy"}`;

    if (pestanaActiva === "ventas") {
      const encabezados = [
        "ID",
        "Fecha",
        "Cliente",
        "Sucursal",
        "Productos",
        "Cant.",
        "Total (Bs)",
        "Saldo (Bs)",
        "Estado",
      ];
      const filas = reporteVentas.items.map((it) => [
        `#${it.idPedido}`,
        formatearFechaConHora(it.fecha),
        it.cliente,
        it.sucursal,
        it.productosResumen,
        it.totalProductos,
        `Bs ${it.total.toFixed(2)}`,
        `Bs ${it.saldo.toFixed(2)}`,
        it.estado,
      ]);

      const tablas = [];

      if (reporteVentas.topProductos.length > 0) {
        tablas.push({
          titulo: "Top 5 Productos con Mayor Salida en el Período",
          encabezados: [
            "Ranking",
            "Producto",
            "Unidades Vendidas",
            "Total Facturado (Bs)",
          ],
          filas: reporteVentas.topProductos.slice(0, 5).map((p, idx) => [
            `#${idx + 1}`,
            p.nombre,
            `${p.cantidadVendida} unid.`,
            `Bs ${p.totalIngresos.toFixed(2)}`,
          ]),
          alineaciones: ["center", "left", "center", "right"] as (
            | "center"
            | "left"
            | "right"
          )[],
        });
      }

      tablas.push({
        titulo: `Detalle de Pedidos Realizados (${reporteVentas.items.length} pedidos)`,
        encabezados,
        filas,
        alineaciones: [
          "center",
          "left",
          "left",
          "left",
          "left",
          "center",
          "right",
          "right",
          "center",
        ] as ("center" | "left" | "right")[],
      });

      const html = generarHtmlReporte({
        tituloReporte: "Reporte de Ventas y Pedidos Realizados",
        subtitulo:
          "Análisis comercial de ventas, facturación y volumen de pedidos",
        rangoFechas: rangoTexto,
        filtrosAplicados: `Estado: ${filtroEstadoVentas} · Cliente: ${
          filtroClienteVentas !== "Todos"
            ? clientes.find((c) => c.id === Number(filtroClienteVentas))
                ?.nombre || filtroClienteVentas
            : "Todos"
        }`,
        usuarioGenerador: adminActual,
        kpis: [
          {
            titulo: "Total Facturado",
            valor: `Bs ${reporteVentas.kpis.totalFacturado.toFixed(2)}`,
            subtexto: `En ${reporteVentas.kpis.pedidosEntregados} entregas`,
            color: "#1e874b",
          },
          {
            titulo: "Pedidos Realizados",
            valor: String(reporteVentas.kpis.cantidadPedidos),
            subtexto: `${reporteVentas.kpis.pedidosPendientes} pendientes · ${reporteVentas.kpis.pedidosEnCamino} en ruta`,
            color: "#1565c0",
          },
          {
            titulo: "Ticket Promedio",
            valor: `Bs ${reporteVentas.kpis.ticketPromedio.toFixed(2)}`,
            subtexto: "Por entrega efectiva",
            color: "#c8231b",
          },
          {
            titulo: "Eficacia de Entrega",
            valor: `${reporteVentas.kpis.tasaEfectividad.toFixed(1)}%`,
            subtexto: `${reporteVentas.kpis.pedidosDevueltos} devueltos · ${reporteVentas.kpis.pedidosCancelados} cancelados`,
            color: "#0f766e",
          },
        ],
        tablas,
      });

      imprimirReporteHtml(html);
    } else if (pestanaActiva === "cobranzas") {
      let tituloSub = "Cobros Registrados";
      let encabezados: string[] = [];
      let filas: (string | number)[][] = [];
      let alineaciones: ("left" | "center" | "right")[] = [];

      if (subPestanaCobranzas === "cobros") {
        tituloSub = `Cobros Recaudados en el Período (${reporteCobranzas.cobros.length} pagos)`;
        encabezados = [
          "ID Pago",
          "Pedido",
          "Fecha",
          "Cliente",
          "Cobrado Por",
          "Método",
          "Monto (Bs)",
          "Estado",
        ];
        filas = reporteCobranzas.cobros.map((c) => [
          `#${c.idPago}`,
          `#${c.idPedido}`,
          formatearFechaConHora(c.fecha),
          c.cliente,
          c.cobradoPor,
          c.metodoPago,
          `Bs ${c.monto.toFixed(2)}`,
          c.estado,
        ]);
        alineaciones = [
          "center",
          "center",
          "left",
          "left",
          "left",
          "center",
          "right",
          "center",
        ];
      } else if (subPestanaCobranzas === "deudas") {
        tituloSub = `Cuentas por Cobrar a Clientes (${reporteCobranzas.cuentasPorCobrar.length} deudores)`;
        encabezados = [
          "ID Cliente",
          "Cliente",
          "Sucursal",
          "Pedidos con Deuda",
          "Total Facturado",
          "Deuda Pendiente (Bs)",
          "Último Pedido",
        ];
        filas = reporteCobranzas.cuentasPorCobrar.map((d) => [
          `#${d.idCliente}`,
          d.cliente,
          d.sucursal,
          `${d.cantidadPedidosConDeuda} pedidos`,
          `Bs ${d.totalFacturado.toFixed(2)}`,
          `Bs ${d.totalDeuda.toFixed(2)}`,
          formatearFechaCorta(d.fechaUltimoPedido),
        ]);
        alineaciones = [
          "center",
          "left",
          "left",
          "center",
          "right",
          "right",
          "center",
        ];
      } else {
        tituloSub = `Arqueos y Cierres de Caja (${reporteCobranzas.arqueos.length} cierres)`;
        encabezados = [
          "ID Cierre",
          "Chofer / Caja",
          "Fecha",
          "Ventas Efectivo",
          "Ventas Digital QR",
          "Total Recaudado (Bs)",
          "Estado",
        ];
        filas = reporteCobranzas.arqueos.map((a) => [
          `#${a.idCierre}`,
          a.usuario,
          formatearFechaCorta(a.fechaCierre || a.fechaApertura),
          `Bs ${a.ventasEfectivo.toFixed(2)}`,
          `Bs ${a.ventasDigital.toFixed(2)}`,
          `Bs ${a.totalRecaudado.toFixed(2)}`,
          a.estado,
        ]);
        alineaciones = [
          "center",
          "left",
          "center",
          "right",
          "right",
          "right",
          "center",
        ];
      }

      const html = generarHtmlReporte({
        tituloReporte: "Reporte de Cobranzas, Arqueos y Deudas",
        subtitulo:
          "Auditoría de recaudación de choferes, canales de cobro y cuentas deudoras",
        rangoFechas: rangoTexto,
        filtrosAplicados: `Sección activa: ${subPestanaCobranzas.toUpperCase()}`,
        usuarioGenerador: adminActual,
        kpis: [
          {
            titulo: "Total Cobrado",
            valor: `Bs ${reporteCobranzas.kpis.totalCobrado.toFixed(2)}`,
            subtexto: `En ${reporteCobranzas.kpis.cantidadPagosRegistrados} pagos`,
            color: "#1e874b",
          },
          {
            titulo: "Cuentas por Cobrar",
            valor: `Bs ${reporteCobranzas.kpis.totalDeudaGlobal.toFixed(2)}`,
            subtexto: `${reporteCobranzas.cuentasPorCobrar.length} clientes con saldo`,
            color: "#c8231b",
          },
          {
            titulo: "Cobros en Efectivo",
            valor: `Bs ${reporteCobranzas.kpis.totalCobradoEfectivo.toFixed(2)}`,
            subtexto: "Recibido en mano",
            color: "#0284c7",
          },
          {
            titulo: "Cobros Digitales QR",
            valor: `Bs ${reporteCobranzas.kpis.totalCobradoDigital.toFixed(2)}`,
            subtexto: "Transferencia / QR",
            color: "#7c3aed",
          },
        ],
        tablas: [
          {
            titulo: tituloSub,
            encabezados,
            filas,
            alineaciones,
          },
        ],
      });

      imprimirReporteHtml(html);
    } else if (pestanaActiva === "metodosPago") {
      const encabezados = [
        "ID",
        "Pedido",
        "Fecha / Hora",
        "Cliente",
        "Sucursal",
        "Cobrado Por",
        "Método",
        "Monto (Bs)",
        "Estado",
      ];
      const filas = pagosMetodosFiltrados.map((p) => [
        `#${p.idPago}`,
        `#${p.idPedido}`,
        formatearFechaConHora(p.fechaPago),
        p.cliente || "-",
        p.sucursal || "-",
        p.usuario || "-",
        p.tipoPago,
        `Bs ${p.montoPagado.toFixed(2)}`,
        p.estadoPago,
      ]);

      const html = generarHtmlReporte({
        tituloReporte: "Reporte de Métodos de Pago (Efectivo vs QR)",
        subtitulo:
          "Desglose y auditoría analítica de ingresos recaudados por canales de pago",
        rangoFechas: rangoTexto,
        filtrosAplicados: `Método: ${filtroMetodoPago} · Búsqueda: ${busquedaMetodos || "Ninguna"}`,
        usuarioGenerador: adminActual,
        kpis: [
          {
            titulo: "Total Recaudado",
            valor: `Bs ${(resumenMetodos?.totalGeneral ?? 0).toFixed(2)}`,
            subtexto: `${resumenMetodos?.cantidadPagosTotal ?? 0} pagos en total`,
            color: "#0f172a",
          },
          {
            titulo: "Total Efectivo",
            valor: `Bs ${(resumenMetodos?.totalEfectivo ?? 0).toFixed(2)}`,
            subtexto: `${resumenMetodos?.cantidadPagosEfectivo ?? 0} pagos (${(resumenMetodos?.porcentajeEfectivo ?? 0).toFixed(1)}%)`,
            color: "#16a34a",
          },
          {
            titulo: "Total Digital QR",
            valor: `Bs ${(resumenMetodos?.totalQR ?? 0).toFixed(2)}`,
            subtexto: `${resumenMetodos?.cantidadPagosQR ?? 0} pagos (${(resumenMetodos?.porcentajeQR ?? 0).toFixed(1)}%)`,
            color: "#2563eb",
          },
          {
            titulo: "Preferencia Efectivo / QR",
            valor: `${(resumenMetodos?.porcentajeEfectivo ?? 0).toFixed(0)}% / ${(resumenMetodos?.porcentajeQR ?? 0).toFixed(0)}%`,
            subtexto: "Distribución porcentual",
            color: "#7c3aed",
          },
        ],
        tablas: [
          {
            titulo: `Detalle de Pagos (${pagosMetodosFiltrados.length} registros)`,
            encabezados,
            filas,
            alineaciones: [
              "center",
              "center",
              "center",
              "left",
              "left",
              "left",
              "center",
              "right",
              "center",
            ],
          },
        ],
      });

      imprimirReporteHtml(html);
    } else {
      // Inventario
      const encabezados = [
        "ID",
        "Producto",
        "Precio",
        "Stock Físico",
        "Valorización (Bs)",
        "Vendidos Periodo",
        "Ingresos (Bs)",
        "Índice Rotación",
        "Alerta Reposición",
      ];
      const filas = productosInventarioFiltrados.map((p) => [
        `#${p.idProducto}`,
        p.nombre,
        `Bs ${p.precio.toFixed(2)}`,
        `${p.stockActual} unid.`,
        `Bs ${p.valorizacion.toFixed(2)}`,
        `${p.unidadesVendidas} unid.`,
        `Bs ${p.totalGenerado.toFixed(2)}`,
        p.rotacionRatio.toFixed(2),
        p.nivelAlerta.toUpperCase(),
      ]);

      const html = generarHtmlReporte({
        tituloReporte: "Reporte de Inventario y Rotación de Stock",
        subtitulo:
          "Control de existencias para planificación de producción y reposición de bidones",
        rangoFechas: rangoTexto,
        filtrosAplicados: `Nivel Stock: ${filtroAlertaStock} · Búsqueda: ${
          busquedaInventario || "Ninguna"
        }`,
        usuarioGenerador: adminActual,
        kpis: [
          {
            titulo: "Valorización Inventario",
            valor: `Bs ${reporteInventario.kpis.valorizacionTotal.toFixed(2)}`,
            subtexto: "Valor total en almacén",
            color: "#1e874b",
          },
          {
            titulo: "Unidades en Almacén",
            valor: `${reporteInventario.kpis.totalUnidadesStock} unid.`,
            subtexto: `${productos.length} productos registrados`,
            color: "#1565c0",
          },
          {
            titulo: "Productos en Riesgo",
            valor: String(
              reporteInventario.kpis.cantidadStockBajo +
                reporteInventario.kpis.cantidadAgotados
            ),
            subtexto: `${reporteInventario.kpis.cantidadAgotados} agotados · ${reporteInventario.kpis.cantidadStockBajo} bajo stock`,
            color: "#c8231b",
          },
          {
            titulo: "Mayor Salida",
            valor: reporteInventario.kpis.productoMasVendido,
            subtexto: "Producto con más rotación",
            color: "#0f766e",
          },
        ],
        tablas: [
          {
            titulo: `Rotación de Stock y Existencias (${productosInventarioFiltrados.length} productos)`,
            encabezados,
            filas,
            alineaciones: [
              "center",
              "left",
              "right",
              "center",
              "right",
              "center",
              "right",
              "center",
              "center",
            ],
          },
        ],
      });

      imprimirReporteHtml(html);
    }
  };

  return (
    <ScrollView
      style={[styles.pagina, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contenidoPagina}
    >
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View style={styles.bloqueTitulos}>
          <Text style={[styles.titulo, isDark && { color: colors.text }]}>
            Reportes Gerenciales
          </Text>
          <Text
            style={[styles.subtitulo, isDark && { color: colors.textSecondary }]}
          >
            Análisis comercial, control contable de cobranzas y gestión de
            inventario para producción.
          </Text>
        </View>

        <View style={styles.accionesEncabezado}>
          <Pressable
            style={[
              styles.botonSecundario,
              isDark && {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={cargarDatos}
          >
            <Ionicons
              name="refresh-outline"
              size={16}
              color={isDark ? colors.text : "#334155"}
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

          <Pressable
            style={[
              styles.botonSecundario,
              isDark && {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={handleImprimir}
          >
            <Ionicons
              name="print-outline"
              size={16}
              color={isDark ? colors.text : "#334155"}
            />
            <Text
              style={[
                styles.botonSecundarioTexto,
                isDark && { color: colors.text },
              ]}
            >
              Imprimir PDF
            </Text>
          </Pressable>

          <Pressable style={styles.botonExcel} onPress={handleExportarExcel}>
            <Ionicons name="document-text-outline" size={16} color="#ffffff" />
            <Text style={styles.botonExcelTexto}>Exportar Excel (.xlsx)</Text>
          </Pressable>

          <Pressable
            style={[
              styles.botonSecundario,
              isDark && {
                backgroundColor: colors.surface,
                borderColor: colors.border,
              },
            ]}
            onPress={handleExportarCSV}
          >
            <Ionicons
              name="download-outline"
              size={16}
              color={isDark ? colors.text : "#334155"}
            />
            <Text
              style={[
                styles.botonSecundarioTexto,
                isDark && { color: colors.text },
              ]}
            >
              CSV
            </Text>
          </Pressable>
        </View>
      </View>


      <View
        style={[
          styles.pestanasContainer,
          isDark && { backgroundColor: colors.surfaceElevated },
        ]}
      >
        <Pressable
          style={[
            styles.pestanaBoton,
            pestanaActiva === "ventas" && styles.pestanaBotonActivo,
            isDark &&
              pestanaActiva === "ventas" && {
                backgroundColor: colors.surface,
              },
          ]}
          onPress={() => setPestanaActiva("ventas")}
        >
          <Ionicons
            name="trending-up-outline"
            size={18}
            color={
              pestanaActiva === "ventas"
                ? "#c8231b"
                : isDark
                ? colors.textSecondary
                : "#64748b"
            }
          />
          <Text
            style={[
              styles.pestanaTexto,
              pestanaActiva === "ventas" && styles.pestanaTextoActivo,
            ]}
          >
            Ventas y Pedidos 
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.pestanaBoton,
            pestanaActiva === "cobranzas" && styles.pestanaBotonActivo,
            isDark &&
              pestanaActiva === "cobranzas" && {
                backgroundColor: colors.surface,
              },
          ]}
          onPress={() => setPestanaActiva("cobranzas")}
        >
          <Ionicons
            name="wallet-outline"
            size={18}
            color={
              pestanaActiva === "cobranzas"
                ? "#c8231b"
                : isDark
                ? colors.textSecondary
                : "#64748b"
            }
          />
          <Text
            style={[
              styles.pestanaTexto,
              pestanaActiva === "cobranzas" && styles.pestanaTextoActivo,
            ]}
          >
            Cobranzas y Arqueos 
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.pestanaBoton,
            pestanaActiva === "inventario" && styles.pestanaBotonActivo,
            isDark &&
              pestanaActiva === "inventario" && {
                backgroundColor: colors.surface,
              },
          ]}
          onPress={() => setPestanaActiva("inventario")}
        >
          <Ionicons
            name="cube-outline"
            size={18}
            color={
              pestanaActiva === "inventario"
                ? "#c8231b"
                : isDark
                ? colors.textSecondary
                : "#64748b"
            }
          />
          <Text
            style={[
              styles.pestanaTexto,
              pestanaActiva === "inventario" && styles.pestanaTextoActivo,
            ]}
          >
            Inventario y Stock 
          </Text>
        </Pressable>

        <Pressable
          style={[
            styles.pestanaBoton,
            pestanaActiva === "metodosPago" && styles.pestanaBotonActivo,
            isDark &&
              pestanaActiva === "metodosPago" && {
                backgroundColor: colors.surface,
              },
          ]}
          onPress={() => setPestanaActiva("metodosPago")}
        >
          <Ionicons
            name="card-outline"
            size={18}
            color={
              pestanaActiva === "metodosPago"
                ? "#c8231b"
                : isDark
                ? colors.textSecondary
                : "#64748b"
            }
          />
          <Text
            style={[
              styles.pestanaTexto,
              pestanaActiva === "metodosPago" && styles.pestanaTextoActivo,
            ]}
          >
            Métodos de Pago (Efectivo / QR)
          </Text>
        </Pressable>
      </View>

      {/* Barra de Filtros y Rango de Fechas */}
      <View
        style={[
          styles.tarjetaFiltros,
          isDark && {
            backgroundColor: colors.surface,
            borderColor: colors.border,
          },
        ]}
      >
        <View style={styles.filaFiltros}>
          {/* Fecha Inicio */}
          <View style={styles.grupoFiltro}>
            <Text
              style={[
                styles.etiquetaFiltro,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Fecha Inicio (AAAA-MM-DD)
            </Text>
            <TextInput
              style={[
                styles.inputFecha,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={fechaInicio}
              onChangeText={(t) => {
                setFechaInicio(t);
                setPresetFecha("personalizado");
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Fecha Fin */}
          <View style={styles.grupoFiltro}>
            <Text
              style={[
                styles.etiquetaFiltro,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Fecha Fin (AAAA-MM-DD)
            </Text>
            <TextInput
              style={[
                styles.inputFecha,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                  color: colors.text,
                },
              ]}
              value={fechaFin}
              onChangeText={(t) => {
                setFechaFin(t);
                setPresetFecha("personalizado");
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#94a3b8"
            />
          </View>

          {/* Filtros específicos de Ventas */}
          {pestanaActiva === "ventas" && (
            <>
              <View style={styles.grupoFiltro}>
                <Text
                  style={[
                    styles.etiquetaFiltro,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Estado Pedido
                </Text>
                <View
                  style={[
                    styles.pickerContainer,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={filtroEstadoVentas}
                    onValueChange={(val) => setFiltroEstadoVentas(String(val))}
                    style={[styles.picker, isDark && { color: colors.text }]}
                  >
                    <Picker.Item label="Todos los estados" value="Todos" />
                    <Picker.Item label="Entregado" value="Entregado" />
                    <Picker.Item label="Pendiente" value="Pendiente" />
                    <Picker.Item label="En camino" value="EnCamino" />
                    <Picker.Item label="Asignado" value="Asignado" />
                    <Picker.Item label="Devuelto" value="Devuelto" />
                    <Picker.Item label="Cancelado" value="Cancelado" />
                  </Picker>
                </View>
              </View>

              <View style={styles.grupoFiltro}>
                <Text
                  style={[
                    styles.etiquetaFiltro,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cliente
                </Text>
                <View
                  style={[
                    styles.pickerContainer,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={filtroClienteVentas}
                    onValueChange={(val) => setFiltroClienteVentas(String(val))}
                    style={[styles.picker, isDark && { color: colors.text }]}
                  >
                    <Picker.Item label="Todos los clientes" value="Todos" />
                    {clientes.map((c) => (
                      <Picker.Item
                        key={c.id}
                        label={`${c.nombre}`}
                        value={String(c.id)}
                      />
                    ))}
                  </Picker>
                </View>
              </View>
            </>
          )}

          {/* Filtro específico de Inventario */}
          {pestanaActiva === "inventario" && (
            <View style={styles.grupoFiltro}>
              <Text
                style={[
                  styles.etiquetaFiltro,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Nivel de Stock
              </Text>
              <View
                style={[
                  styles.pickerContainer,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Picker
                  selectedValue={filtroAlertaStock}
                  onValueChange={(val) => setFiltroAlertaStock(String(val))}
                  style={[styles.picker, isDark && { color: colors.text }]}
                >
                  <Picker.Item label="Todos los niveles" value="Todos" />
                  <Picker.Item label="🟢 Stock Óptimo" value="optimo" />
                  <Picker.Item label="🟡 Alerta (<15 unid)" value="alerta" />
                  <Picker.Item label="🔴 Crítico / Agotado" value="critico" />
                </Picker>
              </View>
            </View>
          )}

          {/* Filtros específicos de Métodos de Pago */}
          {pestanaActiva === "metodosPago" && (
            <>
              <View style={styles.grupoFiltro}>
                <Text
                  style={[
                    styles.etiquetaFiltro,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Método de Pago
                </Text>
                <View
                  style={[
                    styles.pickerContainer,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={filtroMetodoPago}
                    onValueChange={(val) => setFiltroMetodoPago(val as any)}
                    style={[styles.picker, isDark && { color: colors.text }]}
                  >
                    <Picker.Item label="Todos los métodos" value="Todos" />
                    <Picker.Item label="💵 Solo Efectivo" value="Efectivo" />
                    <Picker.Item label="📱 Solo QR" value="QR" />
                  </Picker>
                </View>
              </View>

              <View style={[styles.grupoFiltro, { flex: 1, minWidth: 220 }]}>
                <Text
                  style={[
                    styles.etiquetaFiltro,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Buscar en Pagos
                </Text>
                <TextInput
                  style={[
                    styles.inputFecha,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                  value={busquedaMetodos}
                  onChangeText={setBusquedaMetodos}
                  placeholder="Buscar por cliente, chofer o #pedido..."
                  placeholderTextColor="#94a3b8"
                />
              </View>
            </>
          )}
        </View>

        {/* Presets Rápidos de Fechas */}
        <View style={styles.chipsContainer}>
          <Text
            style={{
              fontSize: 11,
              fontWeight: "700",
              color: isDark ? colors.textSecondary : "#64748b",
              marginRight: 4,
            }}
          >
            Periodo rápido:
          </Text>

          {(
            [
              { clave: "hoy", etiqueta: "Hoy" },
              { clave: "semana", etiqueta: "Esta Semana" },
              { clave: "mes", etiqueta: "Este Mes" },
              { clave: "30dias", etiqueta: "Últimos 30 días" },
              { clave: "anio", etiqueta: "Este Año" },
              { clave: "todos", etiqueta: "Histórico Total" },
            ] as const
          ).map((p) => (
            <Pressable
              key={p.clave}
              style={[
                styles.chipPreset,
                presetFecha === p.clave && styles.chipPresetActivo,
                isDark && {
                  backgroundColor:
                    presetFecha === p.clave
                      ? "rgba(200, 35, 27, 0.2)"
                      : colors.surfaceElevated,
                  borderColor:
                    presetFecha === p.clave
                      ? "rgba(200, 35, 27, 0.4)"
                      : colors.border,
                },
              ]}
              onPress={() => aplicarPresetFecha(p.clave)}
            >
              <Text
                style={[
                  styles.chipPresetTexto,
                  presetFecha === p.clave && styles.chipPresetTextoActivo,
                  isDark &&
                    presetFecha !== p.clave && {
                      color: colors.textSecondary,
                    },
                ]}
              >
                {p.etiqueta}
              </Text>
            </Pressable>
          ))}
        </View>
      </View>

      {/* Contenido Dinámico según pestaña */}
      {cargando ? (
        <View style={styles.estadoVacio}>
          <ActivityIndicator size="large" color="#c8231b" />
          <Text
            style={[
              styles.estadoVacioTexto,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Consolidando datos e indicadores...
          </Text>
        </View>
      ) : (
        <>
          {pestanaActiva === "ventas" && (
            <>
              {/* Tarjetas KPI Ventas */}
              <View style={styles.kpiGrid}>
                {/* Total Facturado */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Facturación Total
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(30, 135, 75, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="cash-outline"
                        size={20}
                        color="#1e874b"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      { color: "#1e874b" },
                    ]}
                  >
                    Bs {reporteVentas.kpis.totalFacturado.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    En {reporteVentas.kpis.pedidosEntregados} pedidos entregados
                  </Text>
                </View>

                {/* Total Pedidos Realizados */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Pedidos Realizados
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(21, 101, 192, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="cart-outline"
                        size={20}
                        color="#1565c0"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {reporteVentas.kpis.cantidadPedidos}
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    {reporteVentas.kpis.pedidosPendientes} pendientes ·{" "}
                    {reporteVentas.kpis.pedidosEnCamino} en ruta
                  </Text>
                </View>

                {/* Ticket Promedio */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Ticket Promedio
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(200, 35, 27, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="pricetag-outline"
                        size={20}
                        color="#c8231b"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Bs {reporteVentas.kpis.ticketPromedio.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    Promedio por pedido entregado
                  </Text>
                </View>

                {/* Unidades Vendidas */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Productos Vendidos
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(168, 108, 0, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="layers-outline"
                        size={20}
                        color="#a86c00"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {reporteVentas.kpis.totalUnidadesVendidas} unid.
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    {reporteVentas.kpis.tasaEfectividad}% efectividad de entrega
                  </Text>
                </View>
              </View>

              {/* Gráfica de Evolución y Distribución */}
              {reporteVentas.ventasPorFecha.length > 0 && (
                <View
                  style={[
                    styles.seccionGrafica,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.graficaTitulo,
                      isDark && { color: colors.text },
                    ]}
                  >
                    📈 Evolución de Ventas por Fecha (Bs)
                  </Text>

                  {/* Barras de ventas */}
                  <View style={styles.barrasContainer}>
                    {(() => {
                      const maxVenta = Math.max(
                        ...reporteVentas.ventasPorFecha.map((v) => v.total),
                        1
                      );

                      return reporteVentas.ventasPorFecha
                        .slice(-12)
                        .map((v, i) => {
                          const porcentaje = Math.max(
                            8,
                            (v.total / maxVenta) * 100
                          );

                          return (
                            <View key={i} style={styles.columnaBarra}>
                              <Text
                                style={[
                                  styles.barraMonto,
                                  isDark && { color: colors.textSecondary },
                                ]}
                              >
                                {v.total >= 1000
                                  ? `${(v.total / 1000).toFixed(1)}k`
                                  : v.total.toFixed(0)}
                              </Text>
                              <View
                                style={[
                                  styles.barraPilar,
                                  { height: `${porcentaje}%` },
                                ]}
                              />
                              <Text
                                style={[
                                  styles.barraEtiqueta,
                                  isDark && { color: colors.textMuted },
                                ]}
                                numberOfLines={1}
                              >
                                {v.etiqueta.slice(0, 5)}
                              </Text>
                            </View>
                          );
                        });
                    })()}
                  </View>
                </View>
              )}

              {/* Tabla Detallada de Pedidos y Ventas */}
              <View
                style={[
                  styles.tarjetaTabla,
                  isDark && {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.tablaEncabezado}>
                  <Text
                    style={[
                      styles.tablaTitulo,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Detalle de Pedidos Realizados ({reporteVentas.items.length})
                  </Text>

                  <View
                    style={[
                      styles.buscadorContainer,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Ionicons name="search-outline" size={16} color="#94a3b8" />
                    <TextInput
                      style={[
                        styles.buscadorInput,
                        isDark && { color: colors.text },
                      ]}
                      placeholder="Buscar por ID, cliente, producto..."
                      placeholderTextColor="#94a3b8"
                      value={busquedaVentas}
                      onChangeText={setBusquedaVentas}
                    />
                  </View>
                </View>

                {/* Cabecera de Tabla */}
                <View
                  style={[
                    styles.filaTablaHeader,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.celdaHeaderTexto, { width: 70 }]}>
                    # Pedido
                  </Text>
                  <Text style={[styles.celdaHeaderTexto, { width: 90 }]}>
                    Fecha
                  </Text>
                  <Text style={[styles.celdaHeaderTexto, { flex: 1.5 }]}>
                    Cliente / Sucursal
                  </Text>
                  <Text style={[styles.celdaHeaderTexto, { flex: 2 }]}>
                    Productos
                  </Text>
                  <Text
                    style={[
                      styles.celdaHeaderTexto,
                      { width: 90, textAlign: "right" },
                    ]}
                  >
                    Total (Bs)
                  </Text>
                  <Text
                    style={[
                      styles.celdaHeaderTexto,
                      { width: 80, textAlign: "right" },
                    ]}
                  >
                    Saldo (Bs)
                  </Text>
                  <Text
                    style={[
                      styles.celdaHeaderTexto,
                      { width: 110, textAlign: "center" },
                    ]}
                  >
                    Estado
                  </Text>
                </View>

                {/* Filas de la tabla */}
                {reporteVentas.items.length === 0 ? (
                  <View style={styles.estadoVacio}>
                    <Ionicons
                      name="receipt-outline"
                      size={40}
                      color="#94a3b8"
                    />
                    <Text
                      style={[
                        styles.estadoVacioTexto,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      No se encontraron pedidos en el rango seleccionado
                    </Text>
                  </View>
                ) : (
                  paginacionVentas.datosPaginados.map((p) => {
                    const colorBadge =
                      p.estado === "Entregado"
                        ? { bg: "#e9f8ef", text: "#1e874b" }
                        : p.estado === "Devuelto"
                        ? { bg: "#fee2e2", text: "#b91c1c" }
                        : p.estado === "Cancelado"
                        ? { bg: "#ffeded", text: "#b42318" }
                        : p.estado === "EnCamino"
                        ? { bg: "#e8f2ff", text: "#1565c0" }
                        : { bg: "#fff5dd", text: "#a86c00" };

                    return (
                      <View
                        key={p.idPedido}
                        style={[
                          styles.filaTabla,
                          isDark && { borderBottomColor: colors.borderLight },
                        ]}
                      >
                        <Text
                          style={[
                            styles.celdaTextoBold,
                            { width: 70 },
                            isDark && { color: colors.text },
                          ]}
                        >
                          #{p.idPedido}
                        </Text>
                        <Text
                          style={[
                            styles.celdaTexto,
                            { width: 90 },
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          {formatearFechaCorta(p.fecha)}
                        </Text>
                        <View style={{ flex: 1.5, paddingRight: 8 }}>
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              isDark && { color: colors.text },
                            ]}
                            numberOfLines={1}
                          >
                            {p.cliente}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTexto,
                              { fontSize: 11 },
                              isDark && { color: colors.textMuted },
                            ]}
                            numberOfLines={1}
                          >
                            {p.sucursal}
                          </Text>
                        </View>
                        <View style={{ flex: 2, paddingRight: 8 }}>
                          <Text
                            style={[
                              styles.celdaTexto,
                              isDark && { color: colors.text },
                            ]}
                            numberOfLines={2}
                          >
                            {p.productosResumen}
                          </Text>
                          {!!p.motivoDevolucion && (
                            <Text
                              style={{
                                fontSize: 10,
                                color: "#b91c1c",
                                fontWeight: "700",
                              }}
                              numberOfLines={1}
                            >
                              Devuelto: {p.motivoDevolucion}
                            </Text>
                          )}
                        </View>
                        <Text
                          style={[
                            styles.celdaTextoBold,
                            { width: 90, textAlign: "right" },
                            isDark && { color: colors.text },
                          ]}
                        >
                          Bs {p.total.toFixed(2)}
                        </Text>
                        <Text
                          style={[
                            styles.celdaTexto,
                            {
                              width: 80,
                              textAlign: "right",
                              color: p.saldo > 0 ? "#b91c1c" : "#1e874b",
                              fontWeight: "700",
                            },
                          ]}
                        >
                          Bs {p.saldo.toFixed(2)}
                        </Text>
                        <View
                          style={{
                            width: 110,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: colorBadge.bg },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeTexto,
                                { color: colorBadge.text },
                              ]}
                            >
                              {p.estado}
                            </Text>
                          </View>
                        </View>
                      </View>
                    );
                  })
                )}
                <Paginacion
                  paginaActual={paginacionVentas.paginaActual}
                  totalPaginas={paginacionVentas.totalPaginas}
                  totalRegistros={paginacionVentas.totalRegistros}
                  registrosPorPagina={paginacionVentas.registrosPorPagina}
                  onCambiarPagina={paginacionVentas.setPaginaActual}
                  onCambiarRegistrosPorPagina={paginacionVentas.setRegistrosPorPagina}
                />
              </View>
            </>
          )}

          {pestanaActiva === "cobranzas" && (
            <>
              {/* Tarjetas KPI Cobranzas */}
              <View style={styles.kpiGrid}>
                {/* Total Cobrado */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Total Cobrado
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(30, 135, 75, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={20}
                        color="#1e874b"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      { color: "#1e874b" },
                    ]}
                  >
                    Bs {reporteCobranzas.kpis.totalCobrado.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    {reporteCobranzas.kpis.cantidadPagosRegistrados} cobros
                    registrados
                  </Text>
                </View>

                {/* Total Deuda Pendiente */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Cuentas por Cobrar
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(200, 35, 27, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="alert-circle-outline"
                        size={20}
                        color="#c8231b"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      { color: "#c8231b" },
                    ]}
                  >
                    Bs {reporteCobranzas.kpis.totalDeudaGlobal.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    En{" "}
                    {reporteCobranzas.cuentasPorCobrar.length} clientes con
                    saldo pendiente
                  </Text>
                </View>

                {/* Cobros Efectivo vs Digital */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Métodos de Pago
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(21, 101, 192, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="card-outline"
                        size={20}
                        color="#1565c0"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Bs{" "}
                    {reporteCobranzas.kpis.totalCobradoEfectivo.toFixed(0)}{" "}
                    <Text
                      style={{
                        fontSize: 13,
                        color: isDark ? colors.textSecondary : "#64748b",
                      }}
                    >
                      Efec.
                    </Text>
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    Bs{" "}
                    {reporteCobranzas.kpis.totalCobradoDigital.toFixed(0)}{" "}
                    en QR / Digital
                  </Text>
                </View>

                {/* Arqueos Realizados */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Arqueos de Caja
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(168, 108, 0, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={20}
                        color="#a86c00"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {reporteCobranzas.kpis.cantidadArqueosRealizados} cierres
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      {
                        color:
                          reporteCobranzas.kpis.diferenciaNetaArqueos < 0
                            ? "#b91c1c"
                            : "#1e874b",
                        fontWeight: "700",
                      },
                    ]}
                  >
                    Dif. Neta: Bs{" "}
                    {reporteCobranzas.kpis.diferenciaNetaArqueos.toFixed(2)}
                  </Text>
                </View>
              </View>

              {/* Sub-pestañas de Cobranzas */}
              <View style={styles.subPestanasContainer}>
                <Pressable
                  style={[
                    styles.subPestanaItem,
                    subPestanaCobranzas === "cobros" &&
                      styles.subPestanaItemActivo,
                  ]}
                  onPress={() => setSubPestanaCobranzas("cobros")}
                >
                  <Ionicons
                    name="cash-outline"
                    size={14}
                    color={
                      subPestanaCobranzas === "cobros" ? "#ffffff" : "#64748b"
                    }
                  />
                  <Text
                    style={[
                      styles.subPestanaTexto,
                      subPestanaCobranzas === "cobros" &&
                        styles.subPestanaTextoActivo,
                    ]}
                  >
                    Historial de Cobros ({reporteCobranzas.cobros.length})
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.subPestanaItem,
                    subPestanaCobranzas === "deudas" &&
                      styles.subPestanaItemActivo,
                  ]}
                  onPress={() => setSubPestanaCobranzas("deudas")}
                >
                  <Ionicons
                    name="people-outline"
                    size={14}
                    color={
                      subPestanaCobranzas === "deudas" ? "#ffffff" : "#64748b"
                    }
                  />
                  <Text
                    style={[
                      styles.subPestanaTexto,
                      subPestanaCobranzas === "deudas" &&
                        styles.subPestanaTextoActivo,
                    ]}
                  >
                    Cuentas por Cobrar (
                    {reporteCobranzas.cuentasPorCobrar.length})
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.subPestanaItem,
                    subPestanaCobranzas === "arqueos" &&
                      styles.subPestanaItemActivo,
                  ]}
                  onPress={() => setSubPestanaCobranzas("arqueos")}
                >
                  <Ionicons
                    name="file-tray-full-outline"
                    size={14}
                    color={
                      subPestanaCobranzas === "arqueos" ? "#ffffff" : "#64748b"
                    }
                  />
                  <Text
                    style={[
                      styles.subPestanaTexto,
                      subPestanaCobranzas === "arqueos" &&
                        styles.subPestanaTextoActivo,
                    ]}
                  >
                    Arqueos y Cierres ({reporteCobranzas.arqueos.length})
                  </Text>
                </Pressable>
              </View>

              {/* Tabla de Cobranzas según sub-pestaña */}
              <View
                style={[
                  styles.tarjetaTabla,
                  isDark && {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.tablaEncabezado}>
                  <Text
                    style={[
                      styles.tablaTitulo,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {subPestanaCobranzas === "cobros" &&
                      "Detalle de Pagos y Cobros Registrados"}
                    {subPestanaCobranzas === "deudas" &&
                      "Clientes con Saldos Pendientes (Cuentas por Cobrar)"}
                    {subPestanaCobranzas === "arqueos" &&
                      "Arqueos y Cierres de Caja de Choferes"}
                  </Text>

                  <View
                    style={[
                      styles.buscadorContainer,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Ionicons name="search-outline" size={16} color="#94a3b8" />
                    <TextInput
                      style={[
                        styles.buscadorInput,
                        isDark && { color: colors.text },
                      ]}
                      placeholder="Filtrar registros..."
                      placeholderTextColor="#94a3b8"
                      value={busquedaCobranzas}
                      onChangeText={setBusquedaCobranzas}
                    />
                  </View>
                </View>

                {/* Sub-tabla 1: Cobros */}
                {subPestanaCobranzas === "cobros" && (
                  <>
                    <View
                      style={[
                        styles.filaTablaHeader,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.celdaHeaderTexto, { width: 70 }]}>
                        # Pago
                      </Text>
                      <Text style={[styles.celdaHeaderTexto, { width: 80 }]}>
                        # Pedido
                      </Text>
                      <Text style={[styles.celdaHeaderTexto, { width: 100 }]}>
                        Fecha
                      </Text>
                      <Text style={[styles.celdaHeaderTexto, { flex: 2 }]}>
                        Cliente
                      </Text>
                      <Text style={[styles.celdaHeaderTexto, { flex: 1.5 }]}>
                        Método / Registro
                      </Text>
                      <Text
                        style={[
                          styles.celdaHeaderTexto,
                          { width: 100, textAlign: "right" },
                        ]}
                      >
                        Monto (Bs)
                      </Text>
                      <Text
                        style={[
                          styles.celdaHeaderTexto,
                          { width: 110, textAlign: "center" },
                        ]}
                      >
                        Estado
                      </Text>
                    </View>

                    {reporteCobranzas.cobros.length === 0 ? (
                      <View style={styles.estadoVacio}>
                        <Ionicons
                          name="wallet-outline"
                          size={40}
                          color="#94a3b8"
                        />
                        <Text
                          style={[
                            styles.estadoVacioTexto,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          No hay cobros registrados en el periodo seleccionado
                        </Text>
                      </View>
                    ) : (
                      paginacionCobros.datosPaginados.map((c) => (
                        <View
                          key={c.idPago}
                          style={[
                            styles.filaTabla,
                            isDark && {
                              borderBottomColor: colors.borderLight,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              { width: 70 },
                              isDark && { color: colors.text },
                            ]}
                          >
                            #{c.idPago}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTexto,
                              { width: 80 },
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            Pedido #{c.idPedido}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTexto,
                              { width: 90 },
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            {formatearFechaCorta(c.fecha)}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              { flex: 2, paddingRight: 8 },
                              isDark && { color: colors.text },
                            ]}
                            numberOfLines={1}
                          >
                            {c.cliente}
                          </Text>
                          <View style={{ flex: 1.5, paddingRight: 8 }}>
                            <Text
                              style={[
                                styles.celdaTextoBold,
                                isDark && { color: colors.text },
                              ]}
                              numberOfLines={1}
                            >
                              {c.metodoPago}
                            </Text>
                            <Text
                              style={[
                                styles.celdaTexto,
                                { fontSize: 11 },
                                isDark && { color: colors.textMuted },
                              ]}
                              numberOfLines={1}
                            >
                              {c.cobradoPor}
                            </Text>
                          </View>
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              {
                                width: 100,
                                textAlign: "right",
                                color: "#1e874b",
                              },
                            ]}
                          >
                            Bs {c.monto.toFixed(2)}
                          </Text>
                          <View
                            style={{
                              width: 110,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <View
                              style={[
                                styles.badge,
                                { backgroundColor: "#e9f8ef" },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.badgeTexto,
                                  { color: "#1e874b" },
                                ]}
                              >
                                {c.estado}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))
                    )}
                    <Paginacion
                      paginaActual={paginacionCobros.paginaActual}
                      totalPaginas={paginacionCobros.totalPaginas}
                      totalRegistros={paginacionCobros.totalRegistros}
                      registrosPorPagina={paginacionCobros.registrosPorPagina}
                      onCambiarPagina={paginacionCobros.setPaginaActual}
                      onCambiarRegistrosPorPagina={paginacionCobros.setRegistrosPorPagina}
                    />
                  </>
                )}

                {/* Sub-tabla 2: Cuentas por Cobrar */}
                {subPestanaCobranzas === "deudas" && (
                  <>
                    <View
                      style={[
                        styles.filaTablaHeader,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.celdaHeaderTexto, { width: 70 }]}>
                        ID
                      </Text>
                      <Text style={[styles.celdaHeaderTexto, { flex: 2 }]}>
                        Cliente
                      </Text>
                      <Text style={[styles.celdaHeaderTexto, { flex: 1.5 }]}>
                        Sucursal
                      </Text>
                      <Text
                        style={[
                          styles.celdaHeaderTexto,
                          { width: 100, textAlign: "center" },
                        ]}
                      >
                        Pedidos Pend.
                      </Text>
                      <Text
                        style={[
                          styles.celdaHeaderTexto,
                          { width: 110, textAlign: "right" },
                        ]}
                      >
                        Total Pedidos
                      </Text>
                      <Text
                        style={[
                          styles.celdaHeaderTexto,
                          { width: 120, textAlign: "right" },
                        ]}
                      >
                        Deuda Total (Bs)
                      </Text>
                    </View>

                    {reporteCobranzas.cuentasPorCobrar.length === 0 ? (
                      <View style={styles.estadoVacio}>
                        <Ionicons
                          name="checkmark-circle-outline"
                          size={40}
                          color="#1e874b"
                        />
                        <Text
                          style={[
                            styles.estadoVacioTexto,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          ¡Excelente! No hay clientes con saldo deudor pendiente
                        </Text>
                      </View>
                    ) : (
                      paginacionDeudas.datosPaginados.map((d) => (
                        <View
                          key={d.idCliente}
                          style={[
                            styles.filaTabla,
                            isDark && {
                              borderBottomColor: colors.borderLight,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              { width: 70 },
                              isDark && { color: colors.text },
                            ]}
                          >
                            #{d.idCliente}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              { flex: 2, paddingRight: 8 },
                              isDark && { color: colors.text },
                            ]}
                            numberOfLines={1}
                          >
                            {d.cliente}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTexto,
                              { flex: 1.5, paddingRight: 8 },
                              isDark && { color: colors.textSecondary },
                            ]}
                            numberOfLines={1}
                          >
                            {d.sucursal}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTexto,
                              { width: 100, textAlign: "center" },
                              isDark && { color: colors.text },
                            ]}
                          >
                            {d.cantidadPedidosConDeuda} pedidos
                          </Text>
                          <Text
                            style={[
                              styles.celdaTexto,
                              { width: 110, textAlign: "right" },
                              isDark && { color: colors.textMuted },
                            ]}
                          >
                            Bs {d.totalFacturado.toFixed(2)}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              {
                                width: 120,
                                textAlign: "right",
                                color: "#b91c1c",
                              },
                            ]}
                          >
                            Bs {d.totalDeuda.toFixed(2)}
                          </Text>
                        </View>
                      ))
                    )}
                    <Paginacion
                      paginaActual={paginacionDeudas.paginaActual}
                      totalPaginas={paginacionDeudas.totalPaginas}
                      totalRegistros={paginacionDeudas.totalRegistros}
                      registrosPorPagina={paginacionDeudas.registrosPorPagina}
                      onCambiarPagina={paginacionDeudas.setPaginaActual}
                      onCambiarRegistrosPorPagina={paginacionDeudas.setRegistrosPorPagina}
                    />
                  </>
                )}

                {/* Sub-tabla 3: Arqueos de Caja */}
                {subPestanaCobranzas === "arqueos" && (
                  <>
                    <View
                      style={[
                        styles.filaTablaHeader,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <Text style={[styles.celdaHeaderTexto, { width: 70 }]}>
                        # Cierre
                      </Text>
                      <Text style={[styles.celdaHeaderTexto, { flex: 1.5 }]}>
                        Chofer / Caja
                      </Text>
                      <Text style={[styles.celdaHeaderTexto, { width: 100 }]}>
                        Fecha
                      </Text>
                      <Text
                        style={[
                          styles.celdaHeaderTexto,
                          { width: 100, textAlign: "right" },
                        ]}
                      >
                        Ventas Efec.
                      </Text>
                      <Text
                        style={[
                          styles.celdaHeaderTexto,
                          { width: 100, textAlign: "right" },
                        ]}
                      >
                        Ventas Digital
                      </Text>
                      <Text
                        style={[
                          styles.celdaHeaderTexto,
                          { width: 110, textAlign: "right" },
                        ]}
                      >
                        Total Recaudado
                      </Text>
                      <Text
                        style={[
                          styles.celdaHeaderTexto,
                          { width: 110, textAlign: "center" },
                        ]}
                      >
                        Estado
                      </Text>
                    </View>

                    {reporteCobranzas.arqueos.length === 0 ? (
                      <View style={styles.estadoVacio}>
                        <Ionicons
                          name="file-tray-outline"
                          size={40}
                          color="#94a3b8"
                        />
                        <Text
                          style={[
                            styles.estadoVacioTexto,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          No hay cierres de caja en este rango de fechas
                        </Text>
                      </View>
                    ) : (
                      paginacionArqueos.datosPaginados.map((a) => (
                        <View
                          key={a.idCierre}
                          style={[
                            styles.filaTabla,
                            isDark && {
                              borderBottomColor: colors.borderLight,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              { width: 70 },
                              isDark && { color: colors.text },
                            ]}
                          >
                            #{a.idCierre}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              { flex: 1.5 },
                              isDark && { color: colors.text },
                            ]}
                            numberOfLines={1}
                          >
                            {a.usuario}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTexto,
                              { width: 100 },
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            {formatearFechaCorta(a.fechaCierre || a.fechaApertura)}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTexto,
                              { width: 100, textAlign: "right" },
                              isDark && { color: colors.text },
                            ]}
                          >
                            Bs {a.ventasEfectivo.toFixed(2)}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTexto,
                              { width: 100, textAlign: "right" },
                              isDark && { color: colors.text },
                            ]}
                          >
                            Bs {a.ventasDigital.toFixed(2)}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              { width: 110, textAlign: "right" },
                              isDark && { color: colors.text },
                            ]}
                          >
                            Bs {a.totalRecaudado.toFixed(2)}
                          </Text>
                          <View
                            style={{
                              width: 90,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <View
                              style={[
                                styles.badge,
                                {
                                  backgroundColor:
                                    a.estado === "Cerrada"
                                      ? "#e9f8ef"
                                      : "#fff5dd",
                                },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.badgeTexto,
                                  {
                                    color:
                                      a.estado === "Cerrada"
                                        ? "#1e874b"
                                        : "#a86c00",
                                  },
                                ]}
                              >
                                {a.estado}
                              </Text>
                            </View>
                          </View>
                        </View>
                      ))
                    )}
                    <Paginacion
                      paginaActual={paginacionArqueos.paginaActual}
                      totalPaginas={paginacionArqueos.totalPaginas}
                      totalRegistros={paginacionArqueos.totalRegistros}
                      registrosPorPagina={paginacionArqueos.registrosPorPagina}
                      onCambiarPagina={paginacionArqueos.setPaginaActual}
                      onCambiarRegistrosPorPagina={paginacionArqueos.setRegistrosPorPagina}
                    />
                  </>
                )}
              </View>
            </>
          )}

          {pestanaActiva === "inventario" && (
            <>
              {/* Tarjetas KPI Inventario */}
              <View style={styles.kpiGrid}>
                {/* Valorización Total */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Valorización Almacén
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(21, 101, 192, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="storefront-outline"
                        size={20}
                        color="#1565c0"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      { color: "#1565c0" },
                    ]}
                  >
                    Bs {reporteInventario.kpis.valorizacionTotal.toFixed(2)}
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    Valor total de stock físico activo
                  </Text>
                </View>

                {/* Unidades en Stock */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Unidades Físicas
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(30, 135, 75, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="cube-outline"
                        size={20}
                        color="#1e874b"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {reporteInventario.kpis.totalUnidadesStock} unid.
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    En {reporteInventario.kpis.totalProductosActivos} productos
                    activos
                  </Text>
                </View>

                {/* Stock Crítico / Alerta */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Alertas de Stock
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(200, 35, 27, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="warning-outline"
                        size={20}
                        color="#c8231b"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      {
                        color:
                          reporteInventario.kpis.cantidadStockBajo > 0 ||
                          reporteInventario.kpis.cantidadAgotados > 0
                            ? "#c8231b"
                            : "#1e874b",
                      },
                    ]}
                  >
                    {reporteInventario.kpis.cantidadStockBajo +
                      reporteInventario.kpis.cantidadAgotados}{" "}
                    productos
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    {reporteInventario.kpis.cantidadAgotados} agotados ·{" "}
                    {reporteInventario.kpis.cantidadStockBajo} bajo stock
                  </Text>
                </View>

                {/* Producto Más Vendido */}
                <View
                  style={[
                    styles.kpiCard,
                    isDark && {
                      backgroundColor: colors.surface,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <View style={styles.kpiCabecera}>
                    <Text
                      style={[
                        styles.kpiTitulo,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Mayor Rotación
                    </Text>
                    <View
                      style={[
                        styles.kpiIconoContenedor,
                        { backgroundColor: "rgba(168, 108, 0, 0.12)" },
                      ]}
                    >
                      <Ionicons
                        name="trophy-outline"
                        size={20}
                        color="#a86c00"
                      />
                    </View>
                  </View>
                  <Text
                    style={[
                      styles.kpiValor,
                      { fontSize: 16 },
                      isDark && { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {reporteInventario.kpis.productoMasVendido}
                  </Text>
                  <Text
                    style={[
                      styles.kpiSubtexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    Líder de ventas en el periodo
                  </Text>
                </View>
              </View>

              {/* Banner Semáforo de Producción */}
              <View
                style={[
                  styles.seccionGrafica,
                  {
                    backgroundColor: isDark
                      ? "rgba(200, 35, 27, 0.1)"
                      : "#fff5f5",
                    borderColor: isDark
                      ? "rgba(200, 35, 27, 0.3)"
                      : "#fed7d7",
                    marginBottom: 16,
                  },
                ]}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 4,
                  }}
                >
                  <Ionicons name="construct-outline" size={18} color="#c8231b" />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "800",
                      color: isDark ? colors.text : "#9b2c2c",
                    }}
                  >
                    Planificación de Producción y Reposición de Bidones
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 12,
                    color: isDark ? colors.textSecondary : "#742a2a",
                    lineHeight: 16,
                  }}
                >
                  El sistema analiza la velocidad de ventas (rotación) vs el
                  stock actual en almacén para sugerir las cantidades a
                  embotellar/reponer prioritariamente.
                </Text>
              </View>

              {/* Tabla Detallada de Inventario y Rotación */}
              <View
                style={[
                  styles.tarjetaTabla,
                  isDark && {
                    backgroundColor: colors.surface,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.tablaEncabezado}>
                  <Text
                    style={[
                      styles.tablaTitulo,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Planilla de Inventario y Producción (
                    {productosInventarioFiltrados.length})
                  </Text>

                  <View
                    style={[
                      styles.buscadorContainer,
                      isDark && {
                        backgroundColor: colors.surfaceElevated,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Ionicons name="search-outline" size={16} color="#94a3b8" />
                    <TextInput
                      style={[
                        styles.buscadorInput,
                        isDark && { color: colors.text },
                      ]}
                      placeholder="Buscar producto por nombre o ID..."
                      placeholderTextColor="#94a3b8"
                      value={busquedaInventario}
                      onChangeText={setBusquedaInventario}
                    />
                  </View>
                </View>

                {/* Cabecera de Tabla */}
                <View
                  style={[
                    styles.filaTablaHeader,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderBottomColor: colors.border,
                    },
                  ]}
                >
                  <Text style={[styles.celdaHeaderTexto, { width: 50 }]}>
                    ID
                  </Text>
                  <Text style={[styles.celdaHeaderTexto, { flex: 2 }]}>
                    Producto
                  </Text>
                  <Text
                    style={[
                      styles.celdaHeaderTexto,
                      { width: 90, textAlign: "right" },
                    ]}
                  >
                    Precio Unit.
                  </Text>
                  <Text
                    style={[
                      styles.celdaHeaderTexto,
                      { width: 90, textAlign: "right" },
                    ]}
                  >
                    Stock Actual
                  </Text>
                  <Text
                    style={[
                      styles.celdaHeaderTexto,
                      { width: 100, textAlign: "right" },
                    ]}
                  >
                    Valorización
                  </Text>
                  <Text
                    style={[
                      styles.celdaHeaderTexto,
                      { width: 100, textAlign: "right" },
                    ]}
                  >
                    Ventas Periodo
                  </Text>
                  <Text
                    style={[
                      styles.celdaHeaderTexto,
                      { width: 80, textAlign: "center" },
                    ]}
                  >
                    Rotación
                  </Text>
                  <Text
                    style={[
                      styles.celdaHeaderTexto,
                      { width: 120, textAlign: "center" },
                    ]}
                  >
                    Nivel Alerta
                  </Text>
                  <Text
                    style={[
                      styles.celdaHeaderTexto,
                      { width: 130, textAlign: "right" },
                    ]}
                  >
                    Sugerencia Repos.
                  </Text>
                </View>

                {/* Filas */}
                {productosInventarioFiltrados.length === 0 ? (
                  <View style={styles.estadoVacio}>
                    <Ionicons name="cube-outline" size={40} color="#94a3b8" />
                    <Text
                      style={[
                        styles.estadoVacioTexto,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      No se encontraron productos coincidentes
                    </Text>
                  </View>
                ) : (
                  paginacionInventario.datosPaginados.map((p) => {
                    const badgeSemaforo =
                      p.nivelAlerta === "critico"
                        ? {
                            bg: "#fee2e2",
                            text: "#b91c1c",
                            icono: "close-circle",
                            etiqueta: "Crítico",
                          }
                        : p.nivelAlerta === "alerta"
                        ? {
                            bg: "#fff5dd",
                            text: "#a86c00",
                            icono: "alert-circle",
                            etiqueta: "Bajo Stock",
                          }
                        : {
                            bg: "#e9f8ef",
                            text: "#1e874b",
                            icono: "checkmark-circle",
                            etiqueta: "Óptimo",
                          };

                    return (
                      <View
                        key={p.idProducto}
                        style={[
                          styles.filaTabla,
                          isDark && {
                            borderBottomColor: colors.borderLight,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.celdaTextoBold,
                            { width: 50 },
                            isDark && { color: colors.text },
                          ]}
                        >
                          #{p.idProducto}
                        </Text>
                        <View style={{ flex: 2, paddingRight: 8 }}>
                          <Text
                            style={[
                              styles.celdaTextoBold,
                              isDark && { color: colors.text },
                            ]}
                            numberOfLines={1}
                          >
                            {p.nombre}
                          </Text>
                          <Text
                            style={[
                              styles.celdaTexto,
                              { fontSize: 11 },
                              isDark && { color: colors.textMuted },
                            ]}
                            numberOfLines={1}
                          >
                            {p.descripcion}
                          </Text>
                        </View>
                        <Text
                          style={[
                            styles.celdaTexto,
                            { width: 90, textAlign: "right" },
                            isDark && { color: colors.text },
                          ]}
                        >
                          Bs {p.precio.toFixed(2)}
                        </Text>
                        <Text
                          style={[
                            styles.celdaTextoBold,
                            {
                              width: 90,
                              textAlign: "right",
                              color:
                                p.stockActual <= 0
                                  ? "#b91c1c"
                                  : p.stockActual < 15
                                  ? "#a86c00"
                                  : isDark
                                  ? colors.text
                                  : "#0f172a",
                            },
                          ]}
                        >
                          {p.stockActual} unid.
                        </Text>
                        <Text
                          style={[
                            styles.celdaTextoBold,
                            { width: 100, textAlign: "right" },
                            isDark && { color: colors.text },
                          ]}
                        >
                          Bs {p.valorizacion.toFixed(2)}
                        </Text>
                        <Text
                          style={[
                            styles.celdaTexto,
                            { width: 100, textAlign: "right" },
                            isDark && { color: colors.text },
                          ]}
                        >
                          {p.unidadesVendidas} unid.
                        </Text>
                        <Text
                          style={[
                            styles.celdaTexto,
                            { width: 80, textAlign: "center" },
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          {p.rotacionRatio}x
                        </Text>
                        <View
                          style={{
                            width: 120,
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <View
                            style={[
                              styles.semaforoPildora,
                              { backgroundColor: badgeSemaforo.bg },
                            ]}
                          >
                            <Ionicons
                              name={badgeSemaforo.icono as any}
                              size={12}
                              color={badgeSemaforo.text}
                            />
                            <Text
                              style={[
                                styles.semaforoTexto,
                                { color: badgeSemaforo.text },
                              ]}
                            >
                              {badgeSemaforo.etiqueta}
                            </Text>
                          </View>
                        </View>
                        <Text
                          style={[
                            styles.celdaTextoBold,
                            {
                              width: 130,
                              textAlign: "right",
                              color:
                                p.sugerenciaProduccion > 0
                                  ? "#c8231b"
                                  : isDark
                                  ? colors.textSecondary
                                  : "#64748b",
                            },
                          ]}
                        >
                          {p.sugerenciaProduccion > 0
                            ? `+${p.sugerenciaProduccion} unid.`
                            : "Suficiente"}
                        </Text>
                      </View>
                    );
                  })
                )}
                <Paginacion
                  paginaActual={paginacionInventario.paginaActual}
                  totalPaginas={paginacionInventario.totalPaginas}
                  totalRegistros={paginacionInventario.totalRegistros}
                  registrosPorPagina={paginacionInventario.registrosPorPagina}
                  onCambiarPagina={paginacionInventario.setPaginaActual}
                  onCambiarRegistrosPorPagina={paginacionInventario.setRegistrosPorPagina}
                />
              </View>
            </>
          )}

          {pestanaActiva === "metodosPago" && (
            <>
              {cargandoMetodos ? (
                <View style={styles.estadoVacio}>
                  <ActivityIndicator size="large" color="#c8231b" />
                  <Text
                    style={[
                      styles.estadoVacioTexto,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Cargando reporte de métodos de pago...
                  </Text>
                </View>
              ) : (
                <>
                  {/* Tarjetas KPI Métodos de Pago */}
                  <View style={styles.kpiGrid}>
                    {/* Recaudación Total */}
                    <View
                      style={[
                        styles.kpiCard,
                        isDark && {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.kpiCabecera}>
                        <Text
                          style={[
                            styles.kpiTitulo,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Recaudación Total
                        </Text>
                        <View
                          style={[
                            styles.kpiIconoContenedor,
                            { backgroundColor: "rgba(15, 23, 42, 0.08)" },
                          ]}
                        >
                          <Ionicons
                            name="cash-outline"
                            size={20}
                            color={isDark ? colors.text : "#0f172a"}
                          />
                        </View>
                      </View>
                      <Text
                        style={[
                          styles.kpiValor,
                          isDark && { color: colors.text },
                        ]}
                      >
                        Bs {(resumenMetodos?.totalGeneral ?? 0).toFixed(2)}
                      </Text>
                      <Text
                        style={[
                          styles.kpiSubtexto,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        {resumenMetodos?.cantidadPagosTotal ?? 0} pagos registrados
                      </Text>
                    </View>

                    {/* Total Efectivo */}
                    <View
                      style={[
                        styles.kpiCard,
                        isDark && {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.kpiCabecera}>
                        <Text
                          style={[
                            styles.kpiTitulo,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Cobrado en Efectivo
                        </Text>
                        <View
                          style={[
                            styles.kpiIconoContenedor,
                            { backgroundColor: "rgba(22, 163, 74, 0.12)" },
                          ]}
                        >
                          <Ionicons
                            name="cash-outline"
                            size={20}
                            color="#16a34a"
                          />
                        </View>
                      </View>
                      <Text style={[styles.kpiValor, { color: "#16a34a" }]}>
                        Bs {(resumenMetodos?.totalEfectivo ?? 0).toFixed(2)}
                      </Text>
                      <Text
                        style={[
                          styles.kpiSubtexto,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        {resumenMetodos?.cantidadPagosEfectivo ?? 0} pagos (
                        {(resumenMetodos?.porcentajeEfectivo ?? 0).toFixed(1)}%)
                      </Text>
                    </View>

                    {/* Total QR */}
                    <View
                      style={[
                        styles.kpiCard,
                        isDark && {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.kpiCabecera}>
                        <Text
                          style={[
                            styles.kpiTitulo,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Cobrado por QR
                        </Text>
                        <View
                          style={[
                            styles.kpiIconoContenedor,
                            { backgroundColor: "rgba(37, 99, 235, 0.12)" },
                          ]}
                        >
                          <Ionicons
                            name="qr-code-outline"
                            size={20}
                            color="#2563eb"
                          />
                        </View>
                      </View>
                      <Text style={[styles.kpiValor, { color: "#2563eb" }]}>
                        Bs {(resumenMetodos?.totalQR ?? 0).toFixed(2)}
                      </Text>
                      <Text
                        style={[
                          styles.kpiSubtexto,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        {resumenMetodos?.cantidadPagosQR ?? 0} pagos (
                        {(resumenMetodos?.porcentajeQR ?? 0).toFixed(1)}%)
                      </Text>
                    </View>

                    {/* Proporción Efectivo / QR */}
                    <View
                      style={[
                        styles.kpiCard,
                        isDark && {
                          backgroundColor: colors.surface,
                          borderColor: colors.border,
                        },
                      ]}
                    >
                      <View style={styles.kpiCabecera}>
                        <Text
                          style={[
                            styles.kpiTitulo,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Proporción Efectivo / QR
                        </Text>
                        <View
                          style={[
                            styles.kpiIconoContenedor,
                            { backgroundColor: "rgba(124, 58, 237, 0.12)" },
                          ]}
                        >
                          <Ionicons
                            name="pie-chart-outline"
                            size={20}
                            color="#7c3aed"
                          />
                        </View>
                      </View>
                      <Text style={[styles.kpiValor, { color: "#7c3aed" }]}>
                        {(resumenMetodos?.porcentajeEfectivo ?? 0).toFixed(0)}% /{" "}
                        {(resumenMetodos?.porcentajeQR ?? 0).toFixed(0)}%
                      </Text>
                      <Text
                        style={[
                          styles.kpiSubtexto,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        {resumenMetodos?.totalGeneral
                          ? resumenMetodos.totalEfectivo >= resumenMetodos.totalQR
                            ? "Predominio de pagos en efectivo"
                            : "Predominio de pagos digitales QR"
                          : "Sin transacciones registradas"}
                      </Text>
                    </View>
                  </View>

                  {/* Barra Comparativa Visual Efectivo vs QR */}
                  <View
                    style={[
                      styles.barraComparativaContainer,
                      isDark && {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.barraComparativaTitulo,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Distribución de Métodos de Pago
                    </Text>
                    <View style={styles.barraComparativaTrack}>
                      <View
                        style={[
                          styles.segmentoEfectivo,
                          {
                            flex:
                              resumenMetodos?.totalGeneral &&
                              resumenMetodos.totalGeneral > 0
                                ? Math.max(1, resumenMetodos.totalEfectivo)
                                : 1,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.segmentoQR,
                          {
                            flex:
                              resumenMetodos?.totalGeneral &&
                              resumenMetodos.totalGeneral > 0
                                ? Math.max(1, resumenMetodos.totalQR)
                                : 0.001,
                          },
                        ]}
                      />
                    </View>
                    <View style={styles.leyendaComparativa}>
                      <View style={styles.itemLeyenda}>
                        <View
                          style={[
                            styles.indicadorColor,
                            { backgroundColor: "#16a34a" },
                          ]}
                        />
                        <Text
                          style={[
                            styles.textoLeyenda,
                            isDark && { color: colors.text },
                          ]}
                        >
                          Efectivo: Bs{" "}
                          {(resumenMetodos?.totalEfectivo ?? 0).toFixed(2)} (
                          {(resumenMetodos?.porcentajeEfectivo ?? 0).toFixed(1)}%)
                        </Text>
                      </View>

                      <View style={styles.itemLeyenda}>
                        <View
                          style={[
                            styles.indicadorColor,
                            { backgroundColor: "#2563eb" },
                          ]}
                        />
                        <Text
                          style={[
                            styles.textoLeyenda,
                            isDark && { color: colors.text },
                          ]}
                        >
                          QR / Digital: Bs{" "}
                          {(resumenMetodos?.totalQR ?? 0).toFixed(2)} (
                          {(resumenMetodos?.porcentajeQR ?? 0).toFixed(1)}%)
                        </Text>
                      </View>
                    </View>
                  </View>

                  {/* Tabla Detallada de Pagos por Método */}
                  <View
                    style={[
                      styles.tarjetaTabla,
                      isDark && {
                        backgroundColor: colors.surface,
                        borderColor: colors.border,
                      },
                    ]}
                  >
                    <View style={styles.tablaEncabezado}>
                      <Text
                        style={[
                          styles.tablaTitulo,
                          isDark && { color: colors.text },
                        ]}
                      >
                        Detalle de Pagos por Método ({pagosMetodosFiltrados.length})
                      </Text>
                    </View>

                    <ScrollView horizontal showsHorizontalScrollIndicator>
                      <View>
                        {/* Cabecera de la tabla */}
                        <View
                          style={[
                            styles.filaTablaHeader,
                            isDark && {
                              backgroundColor: colors.surfaceElevated,
                              borderBottomColor: colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.celdaHeaderTexto,
                              { width: 70, textAlign: "center" },
                            ]}
                          >
                            ID Pago
                          </Text>
                          <Text
                            style={[
                              styles.celdaHeaderTexto,
                              { width: 80, textAlign: "center" },
                            ]}
                          >
                            Pedido
                          </Text>
                          <Text
                            style={[styles.celdaHeaderTexto, { width: 140 }]}
                          >
                            Fecha y Hora
                          </Text>
                          <Text
                            style={[styles.celdaHeaderTexto, { width: 180 }]}
                          >
                            Cliente
                          </Text>
                          <Text
                            style={[styles.celdaHeaderTexto, { width: 140 }]}
                          >
                            Sucursal
                          </Text>
                          <Text
                            style={[styles.celdaHeaderTexto, { width: 150 }]}
                          >
                            Cobrado Por
                          </Text>
                          <Text
                            style={[
                              styles.celdaHeaderTexto,
                              { width: 120, textAlign: "center" },
                            ]}
                          >
                            Método
                          </Text>
                          <Text
                            style={[
                              styles.celdaHeaderTexto,
                              { width: 110, textAlign: "right" },
                            ]}
                          >
                            Monto (Bs)
                          </Text>
                          <Text
                            style={[
                              styles.celdaHeaderTexto,
                              { width: 100, textAlign: "center" },
                            ]}
                          >
                            Estado
                          </Text>
                        </View>

                        {/* Filas */}
                        {pagosMetodosFiltrados.length === 0 ? (
                          <View style={styles.estadoVacio}>
                            <Ionicons
                              name="card-outline"
                              size={40}
                              color="#94a3b8"
                            />
                            <Text
                              style={[
                                styles.estadoVacioTexto,
                                isDark && { color: colors.textSecondary },
                              ]}
                            >
                              No se encontraron pagos con los filtros seleccionados
                            </Text>
                          </View>
                        ) : (
                          paginacionMetodos.datosPaginados.map(
                            (item, index) => {
                              const esQR = item.tipoPago
                                .toLowerCase()
                                .includes("qr");
                              return (
                                <View
                                  key={`pago-${item.idPago}-${index}`}
                                  style={[
                                    styles.filaTabla,
                                    isDark && {
                                      borderBottomColor: colors.borderLight,
                                    },
                                  ]}
                                >
                                  <Text
                                    style={[
                                      styles.celdaTextoBold,
                                      { width: 70, textAlign: "center" },
                                      isDark && { color: colors.text },
                                    ]}
                                  >
                                    #{item.idPago}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.celdaTexto,
                                      {
                                        width: 80,
                                        textAlign: "center",
                                        color: "#c8231b",
                                        fontWeight: "700",
                                      },
                                    ]}
                                  >
                                    #{item.idPedido}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.celdaTexto,
                                      { width: 140 },
                                      isDark && {
                                        color: colors.textSecondary,
                                      },
                                    ]}
                                  >
                                    {formatearFechaConHora(item.fechaPago)}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.celdaTextoBold,
                                      { width: 180 },
                                      isDark && { color: colors.text },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {item.cliente || "Sin cliente"}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.celdaTexto,
                                      { width: 140 },
                                      isDark && {
                                        color: colors.textSecondary,
                                      },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {item.sucursal || "-"}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.celdaTexto,
                                      { width: 150 },
                                      isDark && {
                                        color: colors.textSecondary,
                                      },
                                    ]}
                                    numberOfLines={1}
                                  >
                                    {item.usuario || "Distribuidor"}
                                  </Text>
                                  <View
                                    style={{
                                      width: 120,
                                      alignItems: "center",
                                      justifyContent: "center",
                                    }}
                                  >
                                    <View
                                      style={
                                        esQR
                                          ? styles.badgeMetodoQR
                                          : styles.badgeMetodoEfectivo
                                      }
                                    >
                                      <Text
                                        style={
                                          esQR
                                            ? styles.badgeMetodoTextoQR
                                            : styles.badgeMetodoTextoEfectivo
                                        }
                                      >
                                        {esQR ? "QR Digital" : "Efectivo"}
                                      </Text>
                                    </View>
                                  </View>
                                  <Text
                                    style={[
                                      styles.celdaTextoBold,
                                      {
                                        width: 110,
                                        textAlign: "right",
                                        color: esQR ? "#2563eb" : "#16a34a",
                                      },
                                    ]}
                                  >
                                    Bs {item.montoPagado.toFixed(2)}
                                  </Text>
                                  <Text
                                    style={[
                                      styles.celdaTexto,
                                      { width: 100, textAlign: "center" },
                                      isDark && {
                                        color: colors.textSecondary,
                                      },
                                    ]}
                                  >
                                    {item.estadoPago || "Completado"}
                                  </Text>
                                </View>
                              );
                            }
                          )
                        )}
                      </View>
                    </ScrollView>

                    {/* Paginación */}
                    <Paginacion
                      paginaActual={paginacionMetodos.paginaActual}
                      totalPaginas={paginacionMetodos.totalPaginas}
                      totalRegistros={paginacionMetodos.totalRegistros}
                      registrosPorPagina={paginacionMetodos.registrosPorPagina}
                      onCambiarPagina={paginacionMetodos.setPaginaActual}
                      onCambiarRegistrosPorPagina={paginacionMetodos.setRegistrosPorPagina}
                    />
                  </View>
                </>
              )}
            </>
          )}
        </>
      )}
    </ScrollView>
  );
}
