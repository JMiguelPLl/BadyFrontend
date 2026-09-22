export type PestanaReporte =
  | "ventas"
  | "metodosPago"
  | "cobranzas"
  | "inventario";

export type SubPestanaCobranzas = "cobros" | "deudas" | "arqueos";

export type PresetFecha =
  | "hoy"
  | "semana"
  | "mes"
  | "30dias"
  | "anio"
  | "todos"
  | "personalizado";

// =========================================================
// HU-47: REPORTE DE VENTAS Y PEDIDOS
// =========================================================

export interface ReporteVentasFiltros {
  fechaInicio?: string;
  fechaFin?: string;
  estado?: string;
  idCliente?: number;
  idProducto?: number;
  busqueda?: string;
  preset?: PresetFecha;
}

export interface KpisVentas {
  totalFacturado: number;
  cantidadPedidos: number;
  ticketPromedio: number;
  totalUnidadesVendidas: number;
  pedidosEntregados: number;
  pedidosDevueltos: number;
  pedidosCancelados: number;
  pedidosPendientes: number;
  pedidosEnCamino: number;
  tasaEfectividad: number; // Porcentaje de 0 a 100
}

export interface VentaItemReporte {
  idPedido: number;
  fecha: string;
  cliente: string;
  idCliente: number;
  sucursal: string;
  productosResumen: string;
  totalProductos: number;
  total: number;
  saldo: number;
  estado: string;
  motivoDevolucion?: string | null;
  motivoEdicion?: string | null;
}

export interface VentasPorFecha {
  etiqueta: string;
  fechaIso: string;
  total: number;
  cantidadPedidos: number;
}

export interface TopProductoVenta {
  idProducto: number;
  nombre: string;
  cantidadVendida: number;
  totalIngresos: number;
}

export interface ResultadoReporteVentas {
  kpis: KpisVentas;
  items: VentaItemReporte[];
  ventasPorFecha: VentasPorFecha[];
  topProductos: TopProductoVenta[];
}

// =========================================================
// HU-48: REPORTE DE COBRANZAS, ARQUEOS Y DEUDAS
// =========================================================

export interface ReporteCobranzasFiltros {
  fechaInicio?: string;
  fechaFin?: string;
  metodoPago?: string;
  estadoDeuda?: string;
  busqueda?: string;
  preset?: PresetFecha;
}

export interface KpisCobranzas {
  totalCobrado: number;
  totalDeudaGlobal: number;
  totalCobradoEfectivo: number;
  totalCobradoDigital: number;
  cantidadPagosRegistrados: number;
  cantidadArqueosRealizados: number;
  diferenciaNetaArqueos: number;
}

export interface CobroItemReporte {
  idPago: number;
  idPedido: number;
  fecha: string;
  cliente: string;
  cobradoPor: string;
  metodoPago: string;
  monto: number;
  estado: string;
  observacion?: string;
}

export interface CuentaPorCobrarReporte {
  idCliente: number;
  cliente: string;
  cantidadPedidosConDeuda: number;
  totalDeuda: number;
  totalFacturado: number;
  fechaUltimoPedido: string;
  sucursal: string;
}

export interface ArqueoItemReporte {
  idCierre: number;
  usuario: string;
  fechaApertura: string;
  fechaCierre?: string | null;
  ventasEfectivo: number;
  ventasDigital: number;
  totalRecaudado: number;
  estado: string;
  observacion?: string | null;
  cantidadPagos?: number;
}

export interface ResultadoReporteCobranzas {
  kpis: KpisCobranzas;
  cobros: CobroItemReporte[];
  cuentasPorCobrar: CuentaPorCobrarReporte[];
  arqueos: ArqueoItemReporte[];
}

// =========================================================
// HU-49: REPORTE DE INVENTARIO Y ROTACIÓN DE STOCK
// =========================================================

export type NivelAlertaStock = "optimo" | "alerta" | "critico";

export interface KpisInventario {
  valorizacionTotal: number;
  totalUnidadesStock: number;
  cantidadStockBajo: number;
  cantidadAgotados: number;
  totalProductosActivos: number;
  productoMasVendido: string;
}

export interface ProductoRotacionReporte {
  idProducto: number;
  nombre: string;
  descripcion: string;
  precio: number;
  stockActual: number;
  valorizacion: number;
  unidadesVendidas: number;
  totalGenerado: number;
  rotacionRatio: number;
  nivelAlerta: NivelAlertaStock;
  sugerenciaProduccion: number;
  estado: string;
  imagenUrl?: string | null;
}

export interface ResultadoReporteInventario {
  kpis: KpisInventario;
  productos: ProductoRotacionReporte[];
}

// =========================================================
// REPORTE DE MÉTODOS DE PAGO (EFECTIVO Y QR)
// =========================================================

export interface ResumenMetodosPago {
  totalGeneral: number;
  cantidadPagosTotal: number;
  totalEfectivo: number;
  cantidadPagosEfectivo: number;
  porcentajeEfectivo: number;
  totalQR: number;
  cantidadPagosQR: number;
  porcentajeQR: number;
}

export interface PagoMetodoReporteItem {
  idPago: number;
  idPedido: number;
  idCliente: number;
  cliente: string;
  idSucursal?: number;
  sucursal?: string;
  idUsuario?: number;
  usuario?: string;
  idTipoPago: number;
  tipoPago: string;
  montoPagado: number;
  fechaPago: string;
  estadoPago: string;
}

export interface FiltrosReporteMetodosPago {
  fechaDesde?: string;
  fechaHasta?: string;
  idUsuario?: number;
  idCliente?: number;
  metodo?: "Todos" | "Efectivo" | "QR";
  busqueda?: string;
  preset?: PresetFecha;
}
