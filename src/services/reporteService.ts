import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";
import * as XLSX from "xlsx";
import { API_URL } from "../constants/api";
import { listarPedidos } from "./asignacionPedidoService";
import {
  listarHistorialCierresAdmin,
  obtenerDetalleCierreAdmin,
} from "./cierreCajaAdminService";
import { listarClientes } from "./clienteService";
import { listarDeudas } from "./pagoAdminService";
import { listarProductos } from "./productoService";
import { DetallePedidoAdmin, PedidoAdmin } from "../types/asignacionPedido";
import { CierreCajaAdmin } from "../types/cierreCajaAdmin";
import { Cliente } from "../types/cliente";
import { DeudaPedido } from "../types/pagoAdmin";
import { Producto } from "../types/producto";
import {
  ArqueoItemReporte,
  CobroItemReporte,
  CuentaPorCobrarReporte,
  FiltrosReporteMetodosPago,
  KpisCobranzas,
  KpisInventario,
  KpisVentas,
  PagoMetodoReporteItem,
  PresetFecha,
  ProductoRotacionReporte,
  ReporteCobranzasFiltros,
  ReporteVentasFiltros,
  ResultadoReporteCobranzas,
  ResultadoReporteInventario,
  ResultadoReporteVentas,
  ResumenMetodosPago,
  TopProductoVenta,
  VentaItemReporte,
  VentasPorFecha,
} from "../types/reporte";

// =========================================================
// UTILITARIOS DE FECHAS
// =========================================================

export function formatearFechaCorta(fechaIso?: string): string {
  if (!fechaIso) return "-";
  try {
    const d = new Date(fechaIso);
    if (isNaN(d.getTime())) return fechaIso;
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    return `${dia}/${mes}/${anio}`;
  } catch {
    return fechaIso || "-";
  }
}

export function formatearFechaConHora(fechaIso?: string): string {
  if (!fechaIso) return "-";
  try {
    const d = new Date(fechaIso);
    if (isNaN(d.getTime())) return fechaIso;
    const dia = String(d.getDate()).padStart(2, "0");
    const mes = String(d.getMonth() + 1).padStart(2, "0");
    const anio = d.getFullYear();
    const hora = String(d.getHours()).padStart(2, "0");
    const min = String(d.getMinutes()).padStart(2, "0");
    return `${dia}/${mes}/${anio} ${hora}:${min}`;
  } catch {
    return fechaIso || "-";
  }
}

export function obtenerRangoPreset(preset: PresetFecha): {
  inicio: string;
  fin: string;
} {
  const ahora = new Date();
  const hoyStr = ahora.toISOString().split("T")[0];

  switch (preset) {
    case "hoy":
      return { inicio: hoyStr, fin: hoyStr };

    case "semana": {
      const primerDiaSemana = new Date(ahora);
      const diaSemana = ahora.getDay() === 0 ? 6 : ahora.getDay() - 1; // Lunes = 0
      primerDiaSemana.setDate(ahora.getDate() - diaSemana);
      return {
        inicio: primerDiaSemana.toISOString().split("T")[0],
        fin: hoyStr,
      };
    }

    case "mes": {
      const primerDiaMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      return {
        inicio: primerDiaMes.toISOString().split("T")[0],
        fin: hoyStr,
      };
    }

    case "30dias": {
      const hace30Dias = new Date(ahora);
      hace30Dias.setDate(ahora.getDate() - 30);
      return {
        inicio: hace30Dias.toISOString().split("T")[0],
        fin: hoyStr,
      };
    }

    case "anio": {
      const primerDiaAnio = new Date(ahora.getFullYear(), 0, 1);
      return {
        inicio: primerDiaAnio.toISOString().split("T")[0],
        fin: hoyStr,
      };
    }

    case "todos":
    default:
      return { inicio: "", fin: "" };
  }
}

function estaEnRangoFecha(
  fechaStr?: string,
  fechaInicio?: string,
  fechaFin?: string
): boolean {
  if (!fechaStr) return false;
  if (!fechaInicio && !fechaFin) return true;

  try {
    const fechaObj = new Date(fechaStr);
    if (isNaN(fechaObj.getTime())) return true;

    const fechaSoloDia = fechaObj.toISOString().split("T")[0];

    if (fechaInicio && fechaSoloDia < fechaInicio) return false;
    if (fechaFin && fechaSoloDia > fechaFin) return false;

    return true;
  } catch {
    return true;
  }
}

// =========================================================
// HU-47: PROCESAMIENTO DE REPORTE DE VENTAS Y PEDIDOS
// =========================================================

export function procesarReporteVentas(
  pedidos: PedidoAdmin[],
  filtros: ReporteVentasFiltros
): ResultadoReporteVentas {
  const busqueda = (filtros.busqueda || "").trim().toLowerCase();

  // Filtrado de pedidos
  const pedidosFiltrados = pedidos.filter((p) => {
    // 1. Rango de fechas
    if (!estaEnRangoFecha(p.fechaPedido, filtros.fechaInicio, filtros.fechaFin)) {
      return false;
    }

    // 2. Filtro por estado
    if (
      filtros.estado &&
      filtros.estado !== "Todos" &&
      p.estado?.toLowerCase() !== filtros.estado.toLowerCase()
    ) {
      return false;
    }

    // 3. Filtro por cliente
    if (filtros.idCliente && p.idCliente !== filtros.idCliente) {
      return false;
    }

    // 4. Filtro por producto dentro de los detalles
    if (
      filtros.idProducto &&
      !p.detalles.some((d: DetallePedidoAdmin) => d.idProducto === filtros.idProducto)
    ) {
      return false;
    }

    // 5. Búsqueda por texto (id, cliente, sucursal, producto)
    if (busqueda) {
      const matchId = String(p.id).includes(busqueda);
      const matchCliente = (p.cliente || "").toLowerCase().includes(busqueda);
      const matchSucursal = (p.sucursal || "").toLowerCase().includes(busqueda);
      const matchDetalles = p.detalles.some((d: DetallePedidoAdmin) =>
        (d.producto || "").toLowerCase().includes(busqueda)
      );
      if (!matchId && !matchCliente && !matchSucursal && !matchDetalles) {
        return false;
      }
    }

    return true;
  });

  // KPIs
  let totalFacturado = 0;
  let pedidosEntregados = 0;
  let pedidosDevueltos = 0;
  let pedidosCancelados = 0;
  let pedidosPendientes = 0;
  let pedidosEnCamino = 0;
  let totalUnidadesVendidas = 0;

  const ventasPorDiaMap = new Map<string, { total: number; cantidad: number }>();
  const topProductosMap = new Map<
    number,
    { nombre: string; cantidad: number; total: number }
  >();

  const items: VentaItemReporte[] = pedidosFiltrados.map((p) => {
    const totalProductos = p.detalles.reduce(
      (acc: number, d: DetallePedidoAdmin) => acc + d.cantidad,
      0
    );
    const resumenProductos =
      p.detalles
        .map((d: DetallePedidoAdmin) => `${d.cantidad}x ${d.producto}`)
        .join(", ") || "Sin productos";

    const estadoNorm = (p.estado || "").toLowerCase();
    const esEntregado =
      estadoNorm === "entregado" || estadoNorm === "porconfirmarentrega";

    if (esEntregado) {
      pedidosEntregados++;
      totalFacturado += p.total;
      totalUnidadesVendidas += totalProductos;

      // Agrupación de top productos sobre pedidos entregados
      p.detalles.forEach((d: DetallePedidoAdmin) => {
        const actual = topProductosMap.get(d.idProducto) || {
          nombre: d.producto || `Producto #${d.idProducto}`,
          cantidad: 0,
          total: 0,
        };
        actual.cantidad += d.cantidad;
        actual.total += d.subtotal;
        topProductosMap.set(d.idProducto, actual);
      });

      // Agrupación temporal para gráfica de evolución
      const diaIso = p.fechaPedido ? p.fechaPedido.split("T")[0] : "S/F";
      const diaActual = ventasPorDiaMap.get(diaIso) || { total: 0, cantidad: 0 };
      diaActual.total += p.total;
      diaActual.cantidad += 1;
      ventasPorDiaMap.set(diaIso, diaActual);
    } else if (estadoNorm === "devuelto") {
      pedidosDevueltos++;
    } else if (estadoNorm === "cancelado") {
      pedidosCancelados++;
    } else if (estadoNorm === "encamino") {
      pedidosEnCamino++;
    } else {
      pedidosPendientes++;
    }

    return {
      idPedido: p.id,
      fecha: p.fechaPedido,
      cliente: p.cliente,
      idCliente: p.idCliente,
      sucursal: p.sucursal,
      productosResumen: resumenProductos,
      totalProductos,
      total: p.total,
      saldo: p.saldoPendiente ?? 0,
      estado: p.estado,
      motivoDevolucion: p.motivoDevolucion,
      motivoEdicion: p.motivoEdicion,
    };
  });

  const cantidadPedidos = pedidosFiltrados.length;
  const ticketPromedio =
    pedidosEntregados > 0 ? totalFacturado / pedidosEntregados : 0;

  const denominadorEfectividad =
    pedidosEntregados + pedidosDevueltos + pedidosCancelados;
  const tasaEfectividad =
    denominadorEfectividad > 0
      ? (pedidosEntregados / denominadorEfectividad) * 100
      : 0;

  // Evolución temporal ordenada cronológicamente
  const ventasPorFecha: VentasPorFecha[] = Array.from(ventasPorDiaMap.entries())
    .sort(([fechaA], [fechaB]) => fechaA.localeCompare(fechaB))
    .map(([fechaIso, datos]) => ({
      etiqueta: formatearFechaCorta(fechaIso),
      fechaIso,
      total: datos.total,
      cantidadPedidos: datos.cantidad,
    }));

  // Top 5 productos
  const topProductos: TopProductoVenta[] = Array.from(topProductosMap.entries())
    .map(([idProducto, d]) => ({
      idProducto,
      nombre: d.nombre,
      cantidadVendida: d.cantidad,
      totalIngresos: d.total,
    }))
    .sort((a, b) => b.cantidadVendida - a.cantidadVendida)
    .slice(0, 5);

  const kpis: KpisVentas = {
    totalFacturado,
    cantidadPedidos,
    ticketPromedio,
    totalUnidadesVendidas,
    pedidosEntregados,
    pedidosDevueltos,
    pedidosCancelados,
    pedidosPendientes,
    pedidosEnCamino,
    tasaEfectividad: Number(tasaEfectividad.toFixed(1)),
  };

  return {
    kpis,
    items,
    ventasPorFecha,
    topProductos,
  };
}

// =========================================================
// HU-48: PROCESAMIENTO DE COBRANZAS, ARQUEOS Y DEUDAS
// =========================================================

export function procesarReporteCobranzas(
  deudas: DeudaPedido[],
  cierres: CierreCajaAdmin[],
  filtros: ReporteCobranzasFiltros = {},
  pagosDetallados: PagoMetodoReporteItem[] = []
): ResultadoReporteCobranzas {
  const busqueda = (filtros.busqueda || "").trim().toLowerCase();
  const metodoFiltro = (filtros.metodoPago || "Todos").trim().toLowerCase();

  // 1. Cuentas por Cobrar (Deudores)
  const deudasPendientes = deudas.filter((d) => {
    if (d.saldoPendiente <= 0) return false;

    if (!estaEnRangoFecha(d.fechaPedido, filtros.fechaInicio, filtros.fechaFin)) {
      return false;
    }

    if (
      filtros.estadoDeuda &&
      filtros.estadoDeuda !== "Todos" &&
      d.estadoDeuda?.toLowerCase() !== filtros.estadoDeuda.toLowerCase()
    ) {
      return false;
    }

    if (busqueda) {
      const matchCliente = (d.cliente || "").toLowerCase().includes(busqueda);
      const matchSucursal = (d.sucursal || "").toLowerCase().includes(busqueda);
      const matchId = String(d.idPedido).includes(busqueda);
      if (!matchCliente && !matchSucursal && !matchId) return false;
    }

    return true;
  });

  // Agrupar cuentas por cobrar por cliente
  const clientesDeudaMap = new Map<number, CuentaPorCobrarReporte>();

  deudasPendientes.forEach((d) => {
    const actual = clientesDeudaMap.get(d.idCliente) || {
      idCliente: d.idCliente,
      cliente: d.cliente,
      cantidadPedidosConDeuda: 0,
      totalDeuda: 0,
      totalFacturado: 0,
      fechaUltimoPedido: d.fechaPedido,
      sucursal: d.sucursal,
    };

    actual.cantidadPedidosConDeuda++;
    actual.totalDeuda += d.saldoPendiente;
    actual.totalFacturado += d.totalPedido;
    if (d.fechaPedido > actual.fechaUltimoPedido) {
      actual.fechaUltimoPedido = d.fechaPedido;
    }
    clientesDeudaMap.set(d.idCliente, actual);
  });

  const cuentasPorCobrar = Array.from(clientesDeudaMap.values()).sort(
    (a, b) => b.totalDeuda - a.totalDeuda
  );

  // 2. Historial de Pagos / Cobros registrados (con método exacto Efectivo o QR)
  const cobros: CobroItemReporte[] = [];
  const pedidosConPagoRegistrado = new Set<number>();
  let idContador = 1;

  // Prioridad 1: Procesar pagos detallados (cada uno con su tipoPago real)
  if (pagosDetallados && pagosDetallados.length > 0) {
    pagosDetallados.forEach((p) => {
      const fecha = p.fechaPago;
      if (!estaEnRangoFecha(fecha, filtros.fechaInicio, filtros.fechaFin)) {
        return;
      }

      if (busqueda) {
        const matchCliente = (p.cliente || "").toLowerCase().includes(busqueda);
        const matchId = String(p.idPedido).includes(busqueda);
        const matchPago = String(p.idPago).includes(busqueda);
        const matchUsuario = (p.usuario || "").toLowerCase().includes(busqueda);
        if (!matchCliente && !matchId && !matchPago && !matchUsuario) return;
      }

      const tipo = (p.tipoPago || "").toLowerCase();
      const esQR = tipo.includes("qr") || tipo.includes("digital");
      const metodoExacto = esQR ? "QR" : "Efectivo";

      // Filtro de método de pago ("Todos", "Efectivo", "QR")
      if (metodoFiltro === "efectivo" && esQR) return;
      if (metodoFiltro === "qr" && !esQR) return;

      pedidosConPagoRegistrado.add(p.idPedido);

      cobros.push({
        idPago: p.idPago || idContador++,
        idPedido: p.idPedido,
        fecha: p.fechaPago,
        cliente: p.cliente || "Cliente",
        cobradoPor: p.usuario || "Distribuidor",
        metodoPago: metodoExacto,
        monto: p.montoPagado,
        estado: p.estadoPago || "Completado",
        observacion: `Cobro de pedido #${p.idPedido}`,
      });
    });
  }

  // Prioridad 2: Pedidos con totalPagado > 0 no incluidos en pagosDetallados
  deudas.forEach((d) => {
    if (d.totalPagado > 0 && !pedidosConPagoRegistrado.has(d.idPedido)) {
      if (
        !estaEnRangoFecha(d.fechaPedido, filtros.fechaInicio, filtros.fechaFin)
      ) {
        return;
      }

      if (busqueda) {
        const matchCliente = (d.cliente || "").toLowerCase().includes(busqueda);
        const matchId = String(d.idPedido).includes(busqueda);
        if (!matchCliente && !matchId) return;
      }

      // Por defecto para pedidos en ruta es Efectivo (nunca "Efectivo / QR")
      const metodoExacto = "Efectivo";

      if (metodoFiltro === "qr") return; // Si se filtró solo QR, este pago en efectivo no entra

      cobros.push({
        idPago: idContador++,
        idPedido: d.idPedido,
        fecha: d.fechaPedido,
        cliente: d.cliente,
        cobradoPor: "Sistema de Caja",
        metodoPago: metodoExacto,
        monto: d.totalPagado,
        estado: d.saldoPendiente <= 0 ? "Completado" : "Pago Parcial",
        observacion: `Abono de pedido #${d.idPedido}`,
      });
    }
  });

  // Ordenar cobros por fecha más reciente
  cobros.sort(
    (a, b) => new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
  );

  // 3. Arqueos de Caja con filtro por método de pago
  const arqueosFiltrados = cierres.filter((c) => {
    if (!estaEnRangoFecha(c.fechaCierre || c.fechaApertura, filtros.fechaInicio, filtros.fechaFin)) {
      return false;
    }

    if (busqueda) {
      const matchUsuario = (c.usuario || "").toLowerCase().includes(busqueda);
      const matchId = String(c.id).includes(busqueda);
      if (!matchUsuario && !matchId) return false;
    }

    // Filtrar arqueos por método solicitado (Efectivo / QR / Todos)
    if (metodoFiltro === "efectivo" && c.totalEfectivo <= 0) {
      return false;
    }

    if (metodoFiltro === "qr" && c.totalQR <= 0) {
      return false;
    }

    return true;
  });

  const arqueos: ArqueoItemReporte[] = arqueosFiltrados.map((c) => ({
    idCierre: c.id,
    usuario: c.usuario,
    fechaApertura: c.fechaApertura,
    fechaCierre: c.fechaCierre,
    ventasEfectivo: c.totalEfectivo,
    ventasDigital: c.totalQR,
    totalRecaudado: c.totalRecaudado,
    estado: c.estado,
    observacion: c.observacion || "-",
    cantidadPagos: c.cantidadPagos,
  }));

  // Totales y KPIs
  const totalCobrado = cobros.reduce((acc, c) => acc + c.monto, 0);
  const totalDeudaGlobal = deudas.reduce((acc, d) => acc + d.saldoPendiente, 0);
  const totalCobradoEfectivo = cobros
    .filter((c) => c.metodoPago === "Efectivo")
    .reduce((acc, c) => acc + c.monto, 0);
  const totalCobradoDigital = cobros
    .filter((c) => c.metodoPago === "QR")
    .reduce((acc, c) => acc + c.monto, 0);
  const diferenciaNetaArqueos = 0;

  const kpis: KpisCobranzas = {
    totalCobrado,
    totalDeudaGlobal,
    totalCobradoEfectivo:
      totalCobradoEfectivo > 0
        ? totalCobradoEfectivo
        : arqueos.reduce((acc, a) => acc + a.ventasEfectivo, 0),
    totalCobradoDigital:
      totalCobradoDigital > 0
        ? totalCobradoDigital
        : arqueos.reduce((acc, a) => acc + a.ventasDigital, 0),
    cantidadPagosRegistrados: cobros.length,
    cantidadArqueosRealizados: arqueos.length,
    diferenciaNetaArqueos,
  };

  return {
    kpis,
    cobros,
    cuentasPorCobrar,
    arqueos,
  };
}

// =========================================================
// HU-49: PROCESAMIENTO DE INVENTARIO Y ROTACIÓN DE STOCK
// =========================================================

export function procesarReporteInventario(
  productos: Producto[],
  pedidos: PedidoAdmin[],
  fechaInicio?: string,
  fechaFin?: string
): ResultadoReporteInventario {
  // Conteo de ventas por producto en el rango
  const ventasMap = new Map<number, { unidades: number; ingresos: number }>();

  const pedidosEntregados = pedidos.filter((p) => {
    const est = (p.estado || "").toLowerCase();
    if (est !== "entregado" && est !== "porconfirmarentrega") return false;
    return estaEnRangoFecha(p.fechaPedido, fechaInicio, fechaFin);
  });

  pedidosEntregados.forEach((p) => {
    p.detalles.forEach((d: DetallePedidoAdmin) => {
      const actual = ventasMap.get(d.idProducto) || { unidades: 0, ingresos: 0 };
      actual.unidades += d.cantidad;
      actual.ingresos += d.subtotal;
      ventasMap.set(d.idProducto, actual);
    });
  });

  let valorizacionTotal = 0;
  let totalUnidadesStock = 0;
  let cantidadStockBajo = 0;
  let cantidadAgotados = 0;
  let productoMasVendido = "-";
  let maxVentas = -1;

  const productosReporte: ProductoRotacionReporte[] = productos.map((prod) => {
    const ventas = ventasMap.get(prod.id) || { unidades: 0, ingresos: 0 };
    const valorizacion = prod.stock * prod.precio;

    valorizacionTotal += valorizacion;
    totalUnidadesStock += prod.stock;

    let nivelAlerta: "optimo" | "alerta" | "critico" = "optimo";
    let sugerenciaProduccion = 0;

    if (prod.stock <= 0) {
      nivelAlerta = "critico";
      cantidadAgotados++;
      sugerenciaProduccion = Math.max(30, ventas.unidades * 2);
    } else if (prod.stock < 15) {
      nivelAlerta = "alerta";
      cantidadStockBajo++;
      sugerenciaProduccion = Math.max(20, Math.ceil(ventas.unidades * 1.5) - prod.stock);
    } else {
      nivelAlerta = "optimo";
    }

    // Ratio de rotación: Unidades vendidas en periodo / Stock actual
    const rotacionRatio = Number(
      (ventas.unidades / Math.max(prod.stock, 1)).toFixed(2)
    );

    if (ventas.unidades > maxVentas) {
      maxVentas = ventas.unidades;
      productoMasVendido = prod.nombre;
    }

    return {
      idProducto: prod.id,
      nombre: prod.nombre,
      descripcion: prod.descripcion,
      precio: prod.precio,
      stockActual: prod.stock,
      valorizacion,
      unidadesVendidas: ventas.unidades,
      totalGenerado: ventas.ingresos,
      rotacionRatio,
      nivelAlerta,
      sugerenciaProduccion: Math.max(0, sugerenciaProduccion),
      estado: prod.estado,
      imagenUrl: prod.imagenUrl,
    };
  });

  // Ordenar por nivel de criticidad (críticos primero, luego alertas, luego mayor venta)
  productosReporte.sort((a, b) => {
    const orden = { critico: 0, alerta: 1, optimo: 2 };
    if (orden[a.nivelAlerta] !== orden[b.nivelAlerta]) {
      return orden[a.nivelAlerta] - orden[b.nivelAlerta];
    }
    return b.unidadesVendidas - a.unidadesVendidas;
  });

  const kpis: KpisInventario = {
    valorizacionTotal,
    totalUnidadesStock,
    cantidadStockBajo,
    cantidadAgotados,
    totalProductosActivos: productos.filter((p) => p.estado === "Activo").length,
    productoMasVendido: maxVentas > 0 ? productoMasVendido : "Sin ventas en periodo",
  };

  return {
    kpis,
    productos: productosReporte,
  };
}

// =========================================================
// CARGA INICIAL CONSOLIDADA
// =========================================================

export async function cargarDatosConsolidadosReportes(): Promise<{
  pedidos: PedidoAdmin[];
  deudas: DeudaPedido[];
  cierres: CierreCajaAdmin[];
  productos: Producto[];
  clientes: Cliente[];
  pagosDetallados: PagoMetodoReporteItem[];
}> {
  const [
    pedidosRes,
    deudasRes,
    cierresRes,
    productosRes,
    clientesRes,
    pagosEfRes,
    pagosQrRes,
  ] = await Promise.allSettled([
    listarPedidos(),
    listarDeudas(),
    listarHistorialCierresAdmin(),
    listarProductos(),
    listarClientes(),
    obtenerReportePagosEfectivo(),
    obtenerReportePagosQR(),
  ]);

  const pedidos = pedidosRes.status === "fulfilled" ? pedidosRes.value : [];
  const deudas = deudasRes.status === "fulfilled" ? deudasRes.value : [];
  const cierres = cierresRes.status === "fulfilled" ? cierresRes.value : [];
  const productos = productosRes.status === "fulfilled" ? productosRes.value : [];
  const clientes = clientesRes.status === "fulfilled" ? clientesRes.value : [];
  const pagosEf = pagosEfRes.status === "fulfilled" ? pagosEfRes.value : [];
  const pagosQr = pagosQrRes.status === "fulfilled" ? pagosQrRes.value : [];

  let pagosDetallados: PagoMetodoReporteItem[] = [...pagosEf, ...pagosQr];

  // Si los endpoints de reporte de pagos no retornan registros, enriquecemos
  // automáticamente consultando los detalles de los cierres (que guardan cada pago con tipoPago):
  if (pagosDetallados.length === 0 && cierres.length > 0) {
    try {
      const detallesCierres = await Promise.allSettled(
        cierres.slice(0, 30).map((c) => obtenerDetalleCierreAdmin(c.id))
      );
      detallesCierres.forEach((res) => {
        if (res.status === "fulfilled" && res.value?.pagos) {
          res.value.pagos.forEach((p) => {
            pagosDetallados.push({
              idPago: p.idPago || p.id,
              idPedido: p.idPedido,
              idCliente: p.idCliente,
              cliente: p.cliente,
              idSucursal: p.idSucursal,
              sucursal: p.sucursal,
              idUsuario: undefined,
              usuario: undefined,
              idTipoPago: p.idTipoPago,
              tipoPago: p.tipoPago || (p.idTipoPago === 2 ? "QR" : "Efectivo"),
              montoPagado: p.montoPagado,
              fechaPago: p.fechaPago,
              estadoPago: p.estadoPago,
            });
          });
        }
      });
    } catch (err) {
      console.warn("No se pudieron enriquecer pagos desde cierres:", err);
    }
  }

  return {
    pedidos,
    deudas,
    cierres,
    productos,
    clientes,
    pagosDetallados,
  };
}

// =========================================================
// EXPORTACIÓN A EXCEL (.xlsx) Y CSV
// =========================================================

/**
 * Exporta directamente a un archivo binario de Microsoft Excel (.xlsx).
 * Calcula dinámicamente anchos de columnas con margen amplio para que Excel
 * NUNCA trunque celdas ni muestre "###########".
 */
export function exportarAExcel(
  nombreArchivo: string,
  nombreHoja: string,
  encabezados: string[],
  filas: (string | number)[][]
): void {
  if (Platform.OS === "web") {
    try {
      const aoa = [encabezados, ...filas];
      const ws = XLSX.utils.aoa_to_sheet(aoa);

      // Calcular anchos de columna automáticos con margen para evitar ###########
      const colWidths = encabezados.map((col, colIdx) => {
        let maxLen = String(col).length;
        filas.forEach((fila) => {
          const val = fila[colIdx];
          if (val !== undefined && val !== null) {
            maxLen = Math.max(maxLen, String(val).length);
          }
        });
        // Mínimo 14 de ancho, y +5 de margen de seguridad para fechas y montos
        return { wch: Math.max(maxLen + 5, 14) };
      });
      ws["!cols"] = colWidths;

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, nombreHoja.slice(0, 31));

      // Generar como ArrayBuffer y forzar descarga
      const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const blob = new Blob([wbout], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.href = url;
      enlace.download = `${nombreArchivo}.xlsx`;
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error al exportar Excel (.xlsx):", e);
    }
  } else {
    console.log(`[EXCEL EXPORT ${nombreArchivo}.xlsx]`);
  }
}

export function exportarACSV(
  nombreArchivo: string,
  encabezados: string[],
  filas: (string | number)[][]
): void {
  const escaparCampo = (valor: string | number) => {
    const texto = String(valor ?? "").replace(/"/g, '""');
    return `"${texto}"`;
  };

  // Agregar directiva sep=; para que Excel en Windows use punto y coma sin desconfigurar columnas
  const encabezadoDirectiva = "sep=;";
  const lineaEncabezados = encabezados.map(escaparCampo).join(";");
  const lineasFilas = filas
    .map((fila) => fila.map(escaparCampo).join(";"))
    .join("\r\n");

  const contenidoCSV = `${encabezadoDirectiva}\r\n${lineaEncabezados}\r\n${lineasFilas}`;

  if (Platform.OS === "web") {
    try {
      const blob = new Blob(["\uFEFF" + contenidoCSV], {
        type: "text/csv;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const enlace = document.createElement("a");
      enlace.setAttribute("href", url);
      enlace.setAttribute("download", `${nombreArchivo}.csv`);
      document.body.appendChild(enlace);
      enlace.click();
      document.body.removeChild(enlace);
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error("Error al exportar CSV en Web:", e);
    }
  } else {
    // Para React Native (Android / iOS)
    console.log(`[CSV EXPORT ${nombreArchivo}]:\n`, contenidoCSV);
  }
}

// =========================================================
// GENERACIÓN E IMPRESIÓN DE REPORTE PDF LIMPIO
// =========================================================

export interface KpiImpresion {
  titulo: string;
  valor: string;
  subtexto?: string;
  color?: string;
}

export interface TablaImpresion {
  titulo?: string;
  encabezados: string[];
  filas: (string | number)[][];
  alineaciones?: ("left" | "center" | "right")[];
}

export interface ReporteImpresionDatos {
  tituloReporte: string;
  subtitulo?: string;
  rangoFechas: string;
  filtrosAplicados?: string;
  usuarioGenerador?: string;
  kpis: KpiImpresion[];
  tablas: TablaImpresion[];
}

/**
 * Genera un documento HTML profesional, paginado e independiente, diseñado
 * específicamente para impresión (@media print) y exportación a PDF sin
 * incluir el Sidebar, botones de la app ni cortes por scroll containers.
 */
export function generarHtmlReporte(datos: ReporteImpresionDatos): string {
  const fechaHoraActual = new Date().toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const kpisHtml = datos.kpis
    .map(
      (k) => `
      <div class="kpi-card">
        <div class="kpi-title">${k.titulo}</div>
        <div class="kpi-value" style="color: ${k.color || "#1e293b"}">${k.valor}</div>
        ${k.subtexto ? `<div class="kpi-sub">${k.subtexto}</div>` : ""}
      </div>
    `
    )
    .join("");

  const tablasHtml = datos.tablas
    .map((tabla) => {
      const ths = tabla.encabezados
        .map((h, idx) => {
          const align = tabla.alineaciones?.[idx] || "left";
          return `<th style="text-align: ${align};">${h}</th>`;
        })
        .join("");

      const trs = tabla.filas
        .map((fila) => {
          const tds = fila
            .map((celda, idx) => {
              const align = tabla.alineaciones?.[idx] || "left";
              const contenido = String(celda ?? "-");
              let extraClass = "";

              const cLower = contenido.toLowerCase();
              if (
                cLower === "entregado" ||
                cLower === "cerrada" ||
                cLower === "óptimo" ||
                cLower === "optimo"
              ) {
                extraClass = "badge-success";
              } else if (
                cLower === "pendiente" ||
                cLower === "abierta" ||
                cLower === "alerta reposición" ||
                cLower === "alerta"
              ) {
                extraClass = "badge-warning";
              } else if (
                cLower === "devuelto" ||
                cLower === "cancelado" ||
                cLower === "crítico" ||
                cLower === "critico" ||
                cLower === "agotado"
              ) {
                extraClass = "badge-danger";
              }

              if (extraClass) {
                return `<td style="text-align: ${align};"><span class="badge ${extraClass}">${contenido}</span></td>`;
              }
              return `<td style="text-align: ${align};">${contenido}</td>`;
            })
            .join("");
          return `<tr>${tds}</tr>`;
        })
        .join("");

      return `
        ${tabla.titulo ? `<h3 class="section-title">${tabla.titulo}</h3>` : ""}
        <table class="report-table">
          <thead>
            <tr>${ths}</tr>
          </thead>
          <tbody>
            ${trs}
          </tbody>
        </table>
      `;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>${datos.tituloReporte} - BADY'S</title>
  <style>
    * {
      box-sizing: border-box;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 16px;
      color: #1e293b;
      background-color: #ffffff;
      font-size: 10px;
      line-height: 1.35;
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2.5px solid #c8231b;
      padding-bottom: 10px;
      margin-bottom: 12px;
    }
    .company-name {
      font-size: 20px;
      font-weight: 900;
      color: #c8231b;
      letter-spacing: 0.5px;
      margin: 0;
    }
    .company-subtitle {
      font-size: 10.5px;
      color: #64748b;
      margin: 2px 0 0 0;
    }
    .report-title-main {
      font-size: 15px;
      font-weight: 800;
      color: #0f172a;
      margin: 6px 0 2px 0;
    }
    .meta-box {
      text-align: right;
      font-size: 9.5px;
      color: #475569;
    }
    .meta-box strong {
      color: #1e293b;
    }
    .filter-banner {
      background-color: #f8fafc;
      border: 1px solid #e2e8f0;
      border-left: 4px solid #c8231b;
      padding: 6px 12px;
      border-radius: 4px;
      margin-bottom: 14px;
      font-size: 10px;
      display: flex;
      justify-content: space-between;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
      margin-bottom: 16px;
      page-break-inside: avoid;
    }
    .kpi-card {
      background: #f8fafc;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 10px;
    }
    .kpi-title {
      font-size: 8.5px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #64748b;
      margin-bottom: 3px;
    }
    .kpi-value {
      font-size: 15px;
      font-weight: 800;
      margin-bottom: 2px;
    }
    .kpi-sub {
      font-size: 8.5px;
      color: #94a3b8;
    }
    .section-title {
      font-size: 12px;
      font-weight: 700;
      color: #1e293b;
      margin: 14px 0 6px 0;
      padding-bottom: 3px;
      border-bottom: 1.5px solid #e2e8f0;
    }
    .report-table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 16px;
      font-size: 9.5px;
    }
    .report-table thead {
      display: table-header-group;
    }
    .report-table th {
      background-color: #c8231b !important;
      color: #ffffff !important;
      font-weight: 700;
      padding: 6px 7px;
      border: 1px solid #b91c1c;
      text-transform: uppercase;
      font-size: 8.5px;
    }
    .report-table td {
      padding: 5px 7px;
      border: 1px solid #e2e8f0;
      color: #334155;
    }
    .report-table tbody tr:nth-child(even) {
      background-color: #f8fafc !important;
    }
    .badge {
      display: inline-block;
      padding: 1.5px 5px;
      border-radius: 3px;
      font-size: 8.5px;
      font-weight: 700;
      text-transform: capitalize;
    }
    .badge-success {
      background-color: #e9f8ef !important;
      color: #1e874b !important;
      border: 1px solid #b7ebd0;
    }
    .badge-warning {
      background-color: #fff5dd !important;
      color: #a86c00 !important;
      border: 1px solid #fedc9b;
    }
    .badge-danger {
      background-color: #fee2e2 !important;
      color: #b91c1c !important;
      border: 1px solid #fca5a5;
    }
    .footer-signatures {
      margin-top: 30px;
      display: flex;
      justify-content: space-around;
      page-break-inside: avoid;
    }
    .signature-line {
      width: 190px;
      border-top: 1px solid #64748b;
      text-align: center;
      padding-top: 4px;
      font-size: 9px;
      color: #475569;
    }
    .footer-doc {
      margin-top: 20px;
      border-top: 1px dashed #cbd5e1;
      padding-top: 5px;
      font-size: 8.5px;
      color: #94a3b8;
      display: flex;
      justify-content: space-between;
      page-break-inside: avoid;
    }
    @media print {
      @page {
        size: A4 portrait;
        margin: 8mm 10mm 10mm 10mm;
      }
      body {
        padding: 0;
      }
      tr {
        page-break-inside: avoid;
      }
      .kpi-grid {
        page-break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="company-name">DISTRIBUIDORA BADY'S</div>
      <div class="company-subtitle">Purificadora de Agua & Bebidas · Tupiza, Potosí, Bolivia</div>
      <div class="report-title-main">${datos.tituloReporte}</div>
      ${datos.subtitulo ? `<div style="font-size: 9.5px; color: #64748b;">${datos.subtitulo}</div>` : ""}
    </div>
    <div class="meta-box">
      <div><strong>Fecha Emisión:</strong> ${fechaHoraActual}</div>
      <div><strong>Generado por:</strong> ${datos.usuarioGenerador || "Administrador"}</div>
      <div><strong>Estado:</strong> Oficial / Confidencial</div>
    </div>
  </div>

  <div class="filter-banner">
    <div><strong>Período Analizado:</strong> ${datos.rangoFechas}</div>
    ${datos.filtrosAplicados ? `<div><strong>Filtros:</strong> ${datos.filtrosAplicados}</div>` : ""}
  </div>

  <div class="kpi-grid">
    ${kpisHtml}
  </div>

  ${tablasHtml}

  <div class="footer-signatures">
    <div class="signature-line">
      <strong>Administrador / Gerente</strong><br/>
      Firma y Sello
    </div>
    <div class="signature-line">
      <strong>Control Contable / Auditoría</strong><br/>
      Revisión
    </div>
  </div>

  <div class="footer-doc">
    <span>Sistema Administrativo Bady's — Módulo de Reportes</span>
    <span>Documento de control interno confidencial</span>
  </div>
</body>
</html>`;
}

/**
 * Imprime el documento HTML abriendo un iframe aislado sin el navbar, sidebar
 * ni contenedores con scroll de la aplicación principal.
 */
export function imprimirReporteHtml(htmlContent: string): void {
  if (Platform.OS === "web") {
    try {
      const iframeId = "iframe-impresion-reporte";
      let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
      if (iframe) {
        iframe.remove();
      }
      iframe = document.createElement("iframe");
      iframe.id = iframeId;
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "none";
      document.body.appendChild(iframe);

      const doc = iframe.contentWindow?.document;
      if (doc) {
        doc.open();
        doc.write(htmlContent);
        doc.close();

        setTimeout(() => {
          if (iframe?.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
          }
        }, 350);
      }
    } catch (e) {
      console.error("Error al imprimir reporte en iframe:", e);
      // Fallback a ventana emergente si el iframe fue bloqueado
      const win = window.open("", "_blank");
      if (win) {
        win.document.write(htmlContent);
        win.document.close();
        win.focus();
        setTimeout(() => {
          win.print();
        }, 350);
      }
    }
  } else {
    console.log("Impresión solo disponible en Web.");
  }
}

// =========================================================
// REPORTE DE MÉTODOS DE PAGO: EFECTIVO, QR Y RESUMEN
// =========================================================

async function obtenerHeaders() {
  const token = await AsyncStorage.getItem("token");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function leer<T>(response: Response): Promise<T> {
  let resultado: any = null;

  try {
    resultado = await response.json();
  } catch {
    resultado = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
    }

    if (response.status === 403) {
      throw new Error("No tienes permisos para realizar esta operación.");
    }

    throw new Error(
      resultado?.message ||
        resultado?.title ||
        "No se pudo procesar la solicitud."
    );
  }

  return resultado as T;
}

function normalizarPagoReporte(item: any): PagoMetodoReporteItem {
  return {
    idPago: Number(item?.idPago ?? item?.IdPago ?? item?.id ?? item?.Id ?? 0),
    idPedido: Number(item?.idPedido ?? item?.IdPedido ?? 0),
    idCliente: Number(item?.idCliente ?? item?.IdCliente ?? 0),
    cliente: item?.cliente ?? item?.Cliente ?? "Cliente",
    idSucursal:
      item?.idSucursal ?? item?.IdSucursal
        ? Number(item?.idSucursal ?? item?.IdSucursal)
        : undefined,
    sucursal: item?.sucursal ?? item?.Sucursal ?? undefined,
    idUsuario:
      item?.idUsuario ?? item?.IdUsuario
        ? Number(item?.idUsuario ?? item?.IdUsuario)
        : undefined,
    usuario:
      item?.usuario ??
      item?.Usuario ??
      item?.cobradoPor ??
      item?.CobradoPor ??
      undefined,
    idTipoPago: Number(item?.idTipoPago ?? item?.IdTipoPago ?? 0),
    tipoPago:
      item?.tipoPago ??
      item?.TipoPago ??
      (Number(item?.idTipoPago ?? item?.IdTipoPago ?? 0) === 2 ? "QR" : "Efectivo"),
    montoPagado: Number(
      item?.montoPagado ?? item?.MontoPagado ?? item?.monto ?? item?.Monto ?? 0
    ),
    fechaPago:
      item?.fechaPago ??
      item?.FechaPago ??
      item?.fecha ??
      item?.Fecha ??
      "",
    estadoPago:
      item?.estadoPago ??
      item?.EstadoPago ??
      item?.estado ??
      item?.Estado ??
      "Completado",
  };
}

export function extraerArrayPagos(data: any): any[] {
  if (!data) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.data)) return data.data;
  if (Array.isArray(data.$values)) return data.$values;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.resultado)) return data.resultado;
  if (Array.isArray(data.value)) return data.value;
  if (Array.isArray(data.pagos)) return data.pagos;
  if (data.data && Array.isArray(data.data.$values)) return data.data.$values;
  return [];
}

export async function obtenerReportePagosEfectivo(
  filtros?: FiltrosReporteMetodosPago
): Promise<PagoMetodoReporteItem[]> {
  const params = new URLSearchParams();
  if (filtros?.fechaDesde) {
    params.append("fechaDesde", filtros.fechaDesde);
    params.append("fechaInicio", filtros.fechaDesde);
  }
  if (filtros?.fechaHasta) {
    params.append("fechaHasta", filtros.fechaHasta);
    params.append("fechaFin", filtros.fechaHasta);
  }
  if (filtros?.idUsuario) params.append("idUsuario", String(filtros.idUsuario));
  if (filtros?.idCliente) params.append("idCliente", String(filtros.idCliente));

  const qs = params.toString();
  try {
    const response = await fetch(
      `${API_URL}/Pago/Reportes/Efectivo${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
        headers: await obtenerHeaders(),
      }
    );

    const data = await leer<any>(response);
    const arr = extraerArrayPagos(data);
    return arr.map((item) =>
      normalizarPagoReporte({
        ...item,
        tipoPago: item?.tipoPago || item?.TipoPago || "Efectivo",
      })
    );
  } catch (err) {
    console.warn("Error en obtenerReportePagosEfectivo:", err);
    return [];
  }
}

export async function obtenerReportePagosQR(
  filtros?: FiltrosReporteMetodosPago
): Promise<PagoMetodoReporteItem[]> {
  const params = new URLSearchParams();
  if (filtros?.fechaDesde) {
    params.append("fechaDesde", filtros.fechaDesde);
    params.append("fechaInicio", filtros.fechaDesde);
  }
  if (filtros?.fechaHasta) {
    params.append("fechaHasta", filtros.fechaHasta);
    params.append("fechaFin", filtros.fechaHasta);
  }
  if (filtros?.idUsuario) params.append("idUsuario", String(filtros.idUsuario));
  if (filtros?.idCliente) params.append("idCliente", String(filtros.idCliente));

  const qs = params.toString();
  try {
    const response = await fetch(
      `${API_URL}/Pago/Reportes/QR${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
        headers: await obtenerHeaders(),
      }
    );

    const data = await leer<any>(response);
    const arr = extraerArrayPagos(data);
    return arr.map((item) =>
      normalizarPagoReporte({
        ...item,
        tipoPago: item?.tipoPago || item?.TipoPago || "QR",
      })
    );
  } catch (err) {
    console.warn("Error en obtenerReportePagosQR:", err);
    return [];
  }
}

export async function obtenerResumenMetodosPago(
  fechaDesde?: string,
  fechaHasta?: string
): Promise<ResumenMetodosPago> {
  const params = new URLSearchParams();
  if (fechaDesde) {
    params.append("fechaDesde", fechaDesde);
    params.append("fechaInicio", fechaDesde);
  }
  if (fechaHasta) {
    params.append("fechaHasta", fechaHasta);
    params.append("fechaFin", fechaHasta);
  }

  const qs = params.toString();
  try {
    const response = await fetch(
      `${API_URL}/Pago/Reportes/ResumenMetodosPago${qs ? `?${qs}` : ""}`,
      {
        method: "GET",
        headers: await obtenerHeaders(),
      }
    );

    const itemRaw = await leer<any>(response);
    const item =
      itemRaw?.data ?? itemRaw?.resultado ?? itemRaw?.resumen ?? itemRaw;
    return {
      totalGeneral: Number(item?.totalGeneral ?? item?.TotalGeneral ?? 0),
      cantidadPagosTotal: Number(
        item?.cantidadPagosTotal ?? item?.CantidadPagosTotal ?? 0
      ),
      totalEfectivo: Number(item?.totalEfectivo ?? item?.TotalEfectivo ?? 0),
      cantidadPagosEfectivo: Number(
        item?.cantidadPagosEfectivo ?? item?.CantidadPagosEfectivo ?? 0
      ),
      porcentajeEfectivo: Number(
        item?.porcentajeEfectivo ?? item?.PorcentajeEfectivo ?? 0
      ),
      totalQR: Number(item?.totalQR ?? item?.TotalQR ?? 0),
      cantidadPagosQR: Number(
        item?.cantidadPagosQR ?? item?.CantidadPagosQR ?? 0
      ),
      porcentajeQR: Number(item?.porcentajeQR ?? item?.PorcentajeQR ?? 0),
    };
  } catch (err) {
    console.warn("Error en obtenerResumenMetodosPago:", err);
    return {
      totalGeneral: 0,
      cantidadPagosTotal: 0,
      totalEfectivo: 0,
      cantidadPagosEfectivo: 0,
      porcentajeEfectivo: 0,
      totalQR: 0,
      cantidadPagosQR: 0,
      porcentajeQR: 0,
    };
  }
}

