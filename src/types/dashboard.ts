export interface DashboardResumen {
  anio: number;
  mes: number;
  ingresosMes: number;
  ingresosMesAnterior: number;
  variacionIngresosPorcentaje: number;
  deudaPendienteTotal: number;
  deudaPendienteMes: number;
  pedidosMes: number;
  pedidosPendientesConfirmacion: number;
  productosStockBajo: number;
  totalVendidoEntregado: number;
  totalCobrado: number;
  porcentajeCobranza: number;
}

export interface IngresoMensual {
  mes: number;
  nombreMes: string;
  total: number;
}

export interface PedidoPorEstado {
  estado: string;
  cantidad: number;
}

export interface ClienteMayorDeuda {
  idCliente: number;
  cliente: string;
  deudaPendiente: number;
  cantidadPedidosConDeuda: number;
}

export interface ProductoStockBajo {
  idProducto: number;
  producto: string;
  stock: number;
  precio: number;
  estado: string;
  imagen?: string | null;
  imagenUrl?: string | null;
}

export interface UltimoPagoDashboard {
  idPago: number;
  idPedido: number;
  cliente: string;
  usuario: string;
  tipoPago: string;
  fechaPago: string;
  montoPagado: number;
  saldoPendiente: number;
}

export interface UltimoPedidoDashboard {
  idPedido: number;
  cliente: string;
  sucursal: string;
  fechaPedido: string;
  total: number;
  estado: string;
}

export interface DashboardActividad {
  pedidosPorEstado: PedidoPorEstado[];
  clientesMayorDeuda: ClienteMayorDeuda[];
  productosStockBajo: ProductoStockBajo[];
  ultimosPagos: UltimoPagoDashboard[];
  ultimosPedidos: UltimoPedidoDashboard[];
}