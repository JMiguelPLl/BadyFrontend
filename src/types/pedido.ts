export type EstadoPedido =
  | "Pendiente"
  | "Asignado"
  | "EnCamino"
  | "PorConfirmarEntrega"
  | "Entregado"
  | "Cancelado"
  | "Devuelto"
  | string;

export interface DetallePedido {
  id: number;
  idProducto: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estado: string;
  imagen?: string | null;
  imagenUrl?: string | null;
}

export interface Pedido {
  id: number;
  idCliente: number;
  cliente: string;
  idSucursal: number;
  sucursal: string;
  fechaPedido: string;
  observacion?: string | null;
  motivoEdicion?: string | null;
  motivoDevolucion?: string | null;
  fechaDevolucion?: string | null;
  total: number;
  estado: EstadoPedido;
  saldoPendiente?: number | null;
  detalles: DetallePedido[];
}

export interface ProductoPedido {
  id: number;
  nombre: string;
  descripcion: string;
  stock: number;
  precio: number;
  estado: string;
  imagen?: string | null;
  imagenUrl?: string | null;
}

export interface SucursalPedido {
  id: number;
  idCliente: number;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  estado: string;
}

export interface CrearDetallePedidoDto {
  idProducto: number;
  cantidad: number;
}

export interface CrearPedidoDto {
  idCliente: number;
  idSucursal: number;
  observacion?: string | null;
  detalles: CrearDetallePedidoDto[];
}

export interface ActualizarDetallePedidoDto {
  idProducto: number;
  cantidad: number;
}

export interface ActualizarPedidoDto {
  idCliente: number;
  idSucursal: number;
  observacion?: string | null;
  motivoEdicion?: string | null;
  detalles: ActualizarDetallePedidoDto[];
}

export interface RespuestaApiPedido {
  message?: string;
  idPedido?: number;
  total?: number;
  motivoEdicion?: string | null;
  motivoDevolucion?: string | null;
  fechaDevolucion?: string | null;
  cantidadDetalles?: number;
  estado?: string;
}
