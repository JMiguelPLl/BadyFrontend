export type EstadoAsignacionPedido =
  | "Asignado"
  | "Entregado";

export type EstadoPedido =
  | "Pendiente"
  | "Asignado"
  | "EnCamino"
  | "PorConfirmarEntrega"
  | "Entregado"
  | "Cancelado"
  | "Devuelto";

export interface DetallePedidoAdmin {
  id: number;
  idProducto: number;
  producto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  estado: string;
}

export interface PedidoAdmin {
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
  estado: EstadoPedido | string;
  saldoPendiente?: number | null;
  detalles: DetallePedidoAdmin[];
}

export interface AsignacionVehiculoDisponible {
  id: number;
  idUsuario: number;
  usuario: string;
  correoUsuario?: string | null;
  idVehiculo: number;
  vehiculo: string;
  placa?: string | null;
  cantidadCarga: string;
  fecha: string;
  estado: "Activo" | "Inactivo";
}

/*
 * Representa a una persona que quedó registrada
 * históricamente cuando se asignó el pedido.
 *
 * NO representa necesariamente al personal que
 * actualmente trabaja en el vehículo.
 */
export interface PersonalAsignacionPedido {
  idAsignacionVehiculo: number;
  idUsuario: number;
  usuario: string;
  correoUsuario?: string | null;
}

export interface AsignacionPedido {
  id: number;

  /*
   * Asignación principal usuario-vehículo.
   * Se mantiene por compatibilidad con el frontend.
   */
  idAsignacionVehiculo: number;
  idUsuario: number;
  usuario: string;
  correoUsuario?: string | null;

  idVehiculo: number;
  vehiculo: string;
  placa?: string | null;

  idPedido: number;
  idCliente: number;
  totalPedido: number;

  fechaAsignacion: string;
  fechaEntrega?: string | null;

  estadoAsignacion:
    | EstadoAsignacionPedido
    | string;

  estadoPedido:
    | EstadoPedido
    | string;

  /*
   * NUEVO:
   * Snapshot histórico de todas las personas que
   * estaban asignadas al vehículo cuando se asignó
   * este pedido.
   */
  personalAsignado: PersonalAsignacionPedido[];
}

export interface CrearAsignacionPedidoDto {
  idAsignacionVehiculo: number;
  idPedido: number;
}

export interface RespuestaAsignacionPedido {
  message?: string;
  asignacion?: unknown;
}
