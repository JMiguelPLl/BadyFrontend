export type EstadoCierreCaja = "Abierta" | "Cerrada" | "Anulada" | string;

export interface CierreCajaPago {
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

export interface CierreCaja {
  id: number;
  idUsuario: number;
  usuario: string;
  correoUsuario?: string | null;
  fechaApertura: string;
  fechaCierre?: string | null;
  totalEfectivo: number;
  totalQR: number;
  totalRecaudado: number;
  estado: EstadoCierreCaja;
  observacion?: string | null;
  cantidadPagos: number;
}

export interface CierreCajaDetalle extends CierreCaja {
  pagos: CierreCajaPago[];
}

export interface CierreCajaResumen {
  totalCajasCerradas: number;
  totalCajasAbiertas: number;
  totalRecaudadoCerradas: number;
  totalRecaudadoAbiertas: number;
  totalEfectivoGeneral: number;
  totalQRGeneral: number;
  granTotalRecaudado: number;
}

export interface AperturaCajaDto {
  observacion?: string | null;
}

export interface CerrarCajaDto {
  observacion?: string | null;
}

export interface RespuestaCaja {
  message?: string;
  idCierreCaja?: number;
  caja?: CierreCaja;
  cierreCaja?: CierreCaja;
}
