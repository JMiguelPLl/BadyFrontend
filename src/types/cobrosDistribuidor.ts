export interface PedidoCobrableDistribuidor {
  idPedido: number;
  idCliente: number;
  cliente: string;
  idSucursal: number;
  sucursal: string;
  ubicacion: string;
  fechaPedido: string;
  fechaEntrega?: string | null;
  estadoPedido: string;
  totalPedido: number;
  totalPagado: number;
  saldoPendiente: number;
  cantidadPagos: number;
}

export interface CobroDistribuidorDetalle {
  idPago: number;
  idUsuario: number;
  usuario: string;
  idTipoPago: number;
  tipoPago: string;
  fechaPago: string;
  montoPagado: number;
  saldoPendienteDespuesPago: number;
  estadoPago: string;
}

export interface CobrosPedidoDistribuidor {
  idPedido: number;
  idCliente: number;
  cliente: string;
  idSucursal: number;
  sucursal: string;
  ubicacion: string;
  fechaPedido: string;
  fechaEntrega?: string | null;
  estadoPedido: string;
  totalPedido: number;
  totalPagadoPedido: number;
  saldoPendiente: number;
  estadoDeuda: string;
  cantidadCobros: number;
  totalCobradoPorMi: number;
  ultimoCobro?: string | null;
  historialCobros: CobroDistribuidorDetalle[];
}

export interface TipoPago {
  id: number;
  descripcion: string;
  estado: string;
}
