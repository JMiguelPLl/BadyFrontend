export type EstadoPedidoDistribuidor =
  | "Asignado"
  | "EnCamino"
  | "PorConfirmarEntrega"
  | "Entregado"
  | "Cancelado"
  | "Devuelto";

export interface DetallePedidoDistribuidor {
  id: number;
  idProducto: number;
  producto: string;
  descripcion?: string | null;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estado: string;
}

export interface PedidoDistribuidor {
  idAsignacionPedido: number;
  idPedido: number;
  idCliente: number;
  cliente: string;
  idSucursal: number;
  sucursal: string;
  ubicacion: string;
  fechaPedido: string;
  fechaAsignacion: string;
  fechaEntrega?: string | null;
  observacion?: string | null;
  total: number;
  cantidadTotalProductos?: number;
  estadoAsignacion: string;
  estadoPedido: string;
  idVehiculo?: number;
  vehiculo?: string;
  placa?: string | null;
  cantidadCarga?: string;
  totalPagado?: number;
  saldoPendiente?: number;
  estadoDeuda?: string;
  puedeRegistrarPago?: boolean;
  motivoDevolucion?: string | null;
  fechaDevolucion?: string | null;
  detalles: DetallePedidoDistribuidor[];
}

export interface TipoPago {
  id: number;
  descripcion: string;
  estado: string;
}

export interface PagoDistribuidor {
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

export interface PerfilDistribuidor {
  id: number;
  nombre: string;
  email: string;
  numero?: string;
  telefono?: string;
  estado?: string;
  idRol?: number;
  rol?: string;
}
