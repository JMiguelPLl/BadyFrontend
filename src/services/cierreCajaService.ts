import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

import {
  AperturaCajaDto,
  CerrarCajaDto,
  CierreCaja,
  CierreCajaDetalle,
  CierreCajaPago,
  CierreCajaResumen,
  RespuestaCaja,
} from "../types/cierreCaja";

async function obtenerHeaders() {
  const token = await AsyncStorage.getItem("token");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function leer<T>(response: Response): Promise<T> {
  let resultado: any = null;

  try {
    resultado = await response.json();
  } catch {
    resultado = null;
  }

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error("Tu sesión expiró. Inicia sesión nuevamente.");
    }

    if (response.status === 403) {
      throw new Error("No tienes permisos para realizar esta operación.");
    }

    throw new Error(
      resultado?.message ||
        resultado?.title ||
        "No se pudo procesar la solicitud."
    );
  }

  return resultado as T;
}

function normalizarPago(item: any): CierreCajaPago {
  return {
    id: Number(item?.id ?? item?.Id ?? 0),
    idPago: Number(item?.idPago ?? item?.IdPago ?? 0),
    idPedido: Number(item?.idPedido ?? item?.IdPedido ?? 0),
    idCliente: Number(item?.idCliente ?? item?.IdCliente ?? 0),
    cliente: item?.cliente ?? item?.Cliente ?? "",
    idSucursal: Number(item?.idSucursal ?? item?.IdSucursal ?? 0),
    sucursal: item?.sucursal ?? item?.Sucursal ?? "",
    idTipoPago: Number(item?.idTipoPago ?? item?.IdTipoPago ?? 0),
    tipoPago: item?.tipoPago ?? item?.TipoPago ?? "",
    montoPagado: Number(item?.montoPagado ?? item?.MontoPagado ?? 0),
    fechaPago: item?.fechaPago ?? item?.FechaPago ?? "",
    estadoPago: item?.estadoPago ?? item?.EstadoPago ?? "",
  };
}

function normalizarCaja(item: any): CierreCaja {
  return {
    id: Number(item?.id ?? item?.Id ?? 0),
    idUsuario: Number(item?.idUsuario ?? item?.IdUsuario ?? 0),
    usuario: item?.usuario ?? item?.Usuario ?? "",
    correoUsuario: item?.correoUsuario ?? item?.CorreoUsuario ?? null,
    fechaApertura: item?.fechaApertura ?? item?.FechaApertura ?? "",
    fechaCierre: item?.fechaCierre ?? item?.FechaCierre ?? null,
    totalEfectivo: Number(item?.totalEfectivo ?? item?.TotalEfectivo ?? 0),
    totalQR: Number(item?.totalQR ?? item?.TotalQR ?? 0),
    totalRecaudado: Number(
      item?.totalRecaudado ?? item?.TotalRecaudado ?? 0
    ),
    estado: item?.estado ?? item?.Estado ?? "",
    observacion: item?.observacion ?? item?.Observacion ?? null,
    cantidadPagos: Number(item?.cantidadPagos ?? item?.CantidadPagos ?? 0),
  };
}

function normalizarDetalle(item: any): CierreCajaDetalle {
  const pagos = item?.pagos ?? item?.Pagos ?? [];

  return {
    ...normalizarCaja(item),
    pagos: Array.isArray(pagos) ? pagos.map(normalizarPago) : [],
  };
}

export async function obtenerCajaActual(): Promise<CierreCajaDetalle | null> {
  const response = await fetch(`${API_URL}/CierreCaja/CajaActual`, {
    method: "GET",
    headers: await obtenerHeaders(),
  });

  if (response.status === 404) {
    return null;
  }

  const resultado = await leer<any>(response);
  return normalizarDetalle(resultado);
}

export async function abrirCaja(
  datos?: AperturaCajaDto
): Promise<RespuestaCaja> {
  const response = await fetch(`${API_URL}/CierreCaja/Apertura`, {
    method: "POST",
    headers: await obtenerHeaders(),
    body: JSON.stringify(datos ?? {}),
  });

  const resultado = await leer<any>(response);

  return {
    message: resultado?.message ?? resultado?.Message,
    idCierreCaja: resultado?.idCierreCaja ?? resultado?.IdCierreCaja,
    caja: resultado?.caja
      ? normalizarCaja(resultado.caja)
      : resultado?.Caja
        ? normalizarCaja(resultado.Caja)
        : undefined,
  };
}

export async function cerrarCajaActual(
  datos?: CerrarCajaDto
): Promise<RespuestaCaja> {
  const response = await fetch(`${API_URL}/CierreCaja/CerrarActual`, {
    method: "POST",
    headers: await obtenerHeaders(),
    body: JSON.stringify(datos ?? {}),
  });

  const resultado = await leer<any>(response);

  return {
    message: resultado?.message ?? resultado?.Message,
    cierreCaja: resultado?.cierreCaja
      ? normalizarCaja(resultado.cierreCaja)
      : resultado?.CierreCaja
        ? normalizarCaja(resultado.CierreCaja)
        : undefined,
  };
}

export async function listarHistorialCajas(): Promise<CierreCaja[]> {
  const response = await fetch(`${API_URL}/CierreCaja/Historial`, {
    method: "GET",
    headers: await obtenerHeaders(),
  });

  const resultado = await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarCaja)
    : [];
}

export async function obtenerCierreCajaPorId(
  idCierreCaja: number
): Promise<CierreCajaDetalle> {
  const response = await fetch(`${API_URL}/CierreCaja/${idCierreCaja}`, {
    method: "GET",
    headers: await obtenerHeaders(),
  });

  const resultado = await leer<any>(response);
  return normalizarDetalle(resultado);
}

export async function obtenerResumenCajas(): Promise<CierreCajaResumen> {
  const response = await fetch(`${API_URL}/CierreCaja/Resumen`, {
    method: "GET",
    headers: await obtenerHeaders(),
  });

  const item = await leer<any>(response);

  return {
    totalCajasCerradas: Number(
      item?.totalCajasCerradas ?? item?.TotalCajasCerradas ?? 0
    ),
    totalCajasAbiertas: Number(
      item?.totalCajasAbiertas ?? item?.TotalCajasAbiertas ?? 0
    ),
    totalRecaudadoCerradas: Number(
      item?.totalRecaudadoCerradas ??
        item?.TotalRecaudadoCerradas ??
        0
    ),
    totalRecaudadoAbiertas: Number(
      item?.totalRecaudadoAbiertas ??
        item?.TotalRecaudadoAbiertas ??
        0
    ),
    totalEfectivoGeneral: Number(
      item?.totalEfectivoGeneral ?? item?.TotalEfectivoGeneral ?? 0
    ),
    totalQRGeneral: Number(
      item?.totalQRGeneral ?? item?.TotalQRGeneral ?? 0
    ),
    granTotalRecaudado: Number(
      item?.granTotalRecaudado ?? item?.GranTotalRecaudado ?? 0
    ),
  };
}
