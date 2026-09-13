export interface Pago {
  idPago: number;
  idPedido: number;
  idCliente: number;
  cliente: string;
  sucursal: string;
  totalPedido: number;
  estadoPedido: string;
  idUsuario: number;
  usuario: string;
  fechaPago: string;
  tipoPago: string;
  montoPagado: number;
  saldoPendiente: number;
  estadoPago: string;
}

export interface PagoDetalle {
  id: number;
  idPedido: number;
  idUsuario: number;
  usuario: string;
  correoUsuario?: string | null;
  idTipoPago: number;
  tipoPago: string;
  fechaPago: string;
  montoPagado: number;
  saldoPendiente: number;
  estado: string;
}

export interface PagosPorPedido {
  idPedido: number;
  idCliente: number;
  cliente: string;
  idSucursal: number;
  sucursal: string;
  fechaPedido: string;
  estadoPedido: string;
  totalPedido: number;
  totalPagado: number;
  saldoPendienteActual: number;
  cantidadPagos: number;
  pagos: PagoResumen[];
}

export interface PagoResumen {
  id: number;
  idPedido: number;
  idUsuario: number;
  usuario: string;
  idTipoPago: number;
  tipoPago: string;
  fechaPago: string;
  montoPagado: number;
  saldoPendiente: number;
  estado: string;
}

export interface PedidoPagosAgrupado {
  idPedido: number;
  cliente: string;
  sucursal: string;
  totalPedido: number;
  estadoPedido: string;
  totalPagado: number;
  saldoPendiente: number;
  cantidadPagos: number;
  ultimaFechaPago: string;
  pagos: Pago[];
}