export type EstadoCierreCajaAdmin =
  | "Abierta"
  | "Cerrada"
  | "Anulada"
  | string;

export interface CierreCajaAdmin {
  id: number;
  idUsuario: number;
  usuario: string;
  correoUsuario?: string | null;
  fechaApertura: string;
  fechaCierre?: string | null;
  totalEfectivo: number;
  totalQR: number;
  totalRecaudado: number;
  estado: EstadoCierreCajaAdmin;
  observacion?: string | null;
  cantidadPagos: number;
}

export interface CierreCajaDetalleItemAdmin {
  id: number;
  idPago: number;
  idPedido: number;
  idCliente: number;
  cliente: string;
  idSucursal: number;
  sucursal: string;
  idTipoPago: number;
  tipoPago: string;
  montoPagado: number;
  fechaPago: string;
  estadoPago: string;
}

export interface CierreCajaDetalleAdmin
  extends CierreCajaAdmin {
  pagos: CierreCajaDetalleItemAdmin[];
}

export interface CierreCajaResumenAdmin {
  totalCajasCerradas: number;
  totalCajasAbiertas: number;
  totalRecaudadoCerradas: number;
  totalRecaudadoAbiertas: number;
  totalEfectivoGeneral: number;
  totalQRGeneral: number;
  granTotalRecaudado: number;
}

export interface FiltrosCierreCajaAdmin {
  estado?: string;
  idUsuario?: number;
  fechaDesde?: string;
  fechaHasta?: string;
}

export interface CerrarCajaAdminDto {
  observacion?: string | null;
}

export interface RespuestaCerrarCajaAdmin {
  message?: string;
  cierreCaja?: CierreCajaAdmin;
}
