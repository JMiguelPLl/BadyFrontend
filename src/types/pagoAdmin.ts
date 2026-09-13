export type EstadoDeuda = "Pendiente" | "Pagado";

export interface DeudaPedido {
  idPedido: number;
  idCliente: number;
  cliente: string;
  idSucursal: number;
  sucursal: string;
  fechaPedido: string;
  estadoPedido: string;
  totalPedido: number;
  totalPagado: number;
  saldoPendiente: number;
  estadoDeuda: EstadoDeuda | string;
  cantidadPagos: number;
}

export interface ProductoDeudaDetalle {
  idDetalle: number;
  idProducto: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estado: string;
}

export interface PersonalEntrega {
  idUsuario: number;
  usuario: string;
  correo?: string | null;
}

export interface EntregaPedidoDetalle {
  idAsignacionPedido?: number | null;
  idVehiculo?: number | null;
  vehiculo?: string | null;
  placa?: string | null;
  fechaAsignacion?: string | null;
  fechaEntrega?: string | null;
  estadoAsignacion?: string | null;
  confirmadoPorCliente: boolean;
  personal: PersonalEntrega[];
}

export interface PagoHistorialAdmin {
  id: number;
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

export interface DetalleAdministrativoDeuda {
  idPedido: number;
  idCliente: number;
  cliente: string;
  idSucursal: number;
  sucursal: string;
  fechaPedido: string;
  estadoPedido: string;
  observacion?: string | null;
  totalPedido: number;
  totalPagado: number;
  saldoPendiente: number;
  estadoDeuda: EstadoDeuda | string;
  cantidadPagos: number;
  entrega?: EntregaPedidoDetalle | null;
  productos: ProductoDeudaDetalle[];
  pagos: PagoHistorialAdmin[];
}

export interface TipoPago {
  id: number;
  descripcion: string;
  estado: string;
}

export interface CrearPagoDto {
  idPedido: number;
  idUsuario: number;
  idTipoPago: number;
  montoPagado: number;
}

export interface EditarPagoDto {
  idTipoPago: number;
  montoPagado: number;
}

export interface RespuestaPago {
  message?: string;
  pago?: {
    id?: number;
    idPedido?: number;
    idUsuario?: number;
    usuario?: string;
    idTipoPago?: number;
    tipoPago?: string;
    fecha?: string;
    montoPagado?: number;
    saldoPendiente?: number;
    estadoDeuda?: string;
  };
}

export interface UsuarioSesionPago {
  id: number;
  nombre?: string;
  email?: string;
  rol?: string;
  tipoCuenta?: string;
}