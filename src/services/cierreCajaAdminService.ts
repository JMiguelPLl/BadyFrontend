import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

import {
  CerrarCajaAdminDto,
  CierreCajaAdmin,
  CierreCajaDetalleAdmin,
  CierreCajaDetalleItemAdmin,
  CierreCajaResumenAdmin,
  EstadoCajaDistribuidorAdmin,
  FiltrosCierreCajaAdmin,
  RespuestaAccionCajaAdmin,
  RespuestaCerrarCajaAdmin,
} from "../types/cierreCajaAdmin";

async function obtenerHeaders() {
  const token = await AsyncStorage.getItem("token");

  return {
    Accept: "application/json",
    "Content-Type": "application/json",
    ...(token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {}),
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
      throw new Error(
        "Tu sesión expiró. Inicia sesión nuevamente."
      );
    }

    if (response.status === 403) {
      throw new Error(
        "No tienes permisos para realizar esta operación."
      );
    }

    throw new Error(
      resultado?.message ||
        resultado?.title ||
        "No se pudo procesar la solicitud."
    );
  }

  return resultado as T;
}

function normalizarCaja(
  item: any
): CierreCajaAdmin {
  return {
    id: Number(item?.id ?? item?.Id ?? 0),
    idUsuario: Number(
      item?.idUsuario ??
        item?.IdUsuario ??
        0
    ),
    usuario:
      item?.usuario ??
      item?.Usuario ??
      "",
    correoUsuario:
      item?.correoUsuario ??
      item?.CorreoUsuario ??
      null,
    fechaApertura:
      item?.fechaApertura ??
      item?.FechaApertura ??
      "",
    fechaCierre:
      item?.fechaCierre ??
      item?.FechaCierre ??
      null,
    totalEfectivo: Number(
      item?.totalEfectivo ??
        item?.TotalEfectivo ??
        0
    ),
    totalQR: Number(
      item?.totalQR ??
        item?.TotalQR ??
        0
    ),
    totalRecaudado: Number(
      item?.totalRecaudado ??
        item?.TotalRecaudado ??
        0
    ),
    estado:
      item?.estado ??
      item?.Estado ??
      "",
    observacion:
      item?.observacion ??
      item?.Observacion ??
      null,
    cantidadPagos: Number(
      item?.cantidadPagos ??
        item?.CantidadPagos ??
        0
    ),
  };
}

function normalizarDetallePago(
  item: any
): CierreCajaDetalleItemAdmin {
  return {
    id: Number(item?.id ?? item?.Id ?? 0),
    idPago: Number(
      item?.idPago ??
        item?.IdPago ??
        0
    ),
    idPedido: Number(
      item?.idPedido ??
        item?.IdPedido ??
        0
    ),
    idCliente: Number(
      item?.idCliente ??
        item?.IdCliente ??
        0
    ),
    cliente:
      item?.cliente ??
      item?.Cliente ??
      "",
    idSucursal: Number(
      item?.idSucursal ??
        item?.IdSucursal ??
        0
    ),
    sucursal:
      item?.sucursal ??
      item?.Sucursal ??
      "",
    idTipoPago: Number(
      item?.idTipoPago ??
        item?.IdTipoPago ??
        0
    ),
    tipoPago:
      item?.tipoPago ??
      item?.TipoPago ??
      "",
    montoPagado: Number(
      item?.montoPagado ??
        item?.MontoPagado ??
        0
    ),
    fechaPago:
      item?.fechaPago ??
      item?.FechaPago ??
      "",
    estadoPago:
      item?.estadoPago ??
      item?.EstadoPago ??
      "",
  };
}

function normalizarDetalle(
  item: any
): CierreCajaDetalleAdmin {
  const pagos =
    item?.pagos ??
    item?.Pagos ??
    [];

  return {
    ...normalizarCaja(item),
    pagos: Array.isArray(pagos)
      ? pagos.map(normalizarDetallePago)
      : [],
  };
}

export async function listarHistorialCierresAdmin(
  filtros?: FiltrosCierreCajaAdmin
): Promise<CierreCajaAdmin[]> {
  const parametros =
    new URLSearchParams();

  if (
    filtros?.estado &&
    filtros.estado !== "Todos"
  ) {
    parametros.append(
      "estado",
      filtros.estado
    );
  }

  if (filtros?.idUsuario) {
    parametros.append(
      "idUsuario",
      String(filtros.idUsuario)
    );
  }

  if (filtros?.fechaDesde) {
    parametros.append(
      "fechaDesde",
      filtros.fechaDesde
    );
  }

  if (filtros?.fechaHasta) {
    parametros.append(
      "fechaHasta",
      filtros.fechaHasta
    );
  }

  const query =
    parametros.toString();

  const response = await fetch(
    `${API_URL}/CierreCaja/Historial${
      query ? `?${query}` : ""
    }`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado =
    await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarCaja)
    : [];
}

export async function obtenerResumenCierresAdmin(): Promise<
  CierreCajaResumenAdmin
> {
  const response = await fetch(
    `${API_URL}/CierreCaja/Resumen`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const item = await leer<any>(response);

  return {
    totalCajasCerradas: Number(
      item?.totalCajasCerradas ??
        item?.TotalCajasCerradas ??
        0
    ),
    totalCajasAbiertas: Number(
      item?.totalCajasAbiertas ??
        item?.TotalCajasAbiertas ??
        0
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
      item?.totalEfectivoGeneral ??
        item?.TotalEfectivoGeneral ??
        0
    ),
    totalQRGeneral: Number(
      item?.totalQRGeneral ??
        item?.TotalQRGeneral ??
        0
    ),
    granTotalRecaudado: Number(
      item?.granTotalRecaudado ??
        item?.GranTotalRecaudado ??
        0
    ),
  };
}

export async function obtenerDetalleCierreAdmin(
  id: number
): Promise<CierreCajaDetalleAdmin> {
  const response = await fetch(
    `${API_URL}/CierreCaja/${id}`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado =
    await leer<any>(response);

  return normalizarDetalle(resultado);
}

export async function cerrarCajaPorIdAdmin(
  id: number,
  datos?: CerrarCajaAdminDto
): Promise<RespuestaCerrarCajaAdmin> {
  const response = await fetch(
    `${API_URL}/CierreCaja/${id}/Cerrar`,
    {
      method: "POST",
      headers: await obtenerHeaders(),
      body: JSON.stringify(
        datos ?? {}
      ),
    }
  );

  const resultado =
    await leer<any>(response);

  return {
    message:
      resultado?.message ??
      resultado?.Message,
    cierreCaja:
      resultado?.cierreCaja
        ? normalizarCaja(
            resultado.cierreCaja
          )
        : resultado?.CierreCaja
          ? normalizarCaja(
              resultado.CierreCaja
            )
          : undefined,
  };
}

function normalizarEstadoCaja(item: any): EstadoCajaDistribuidorAdmin {
  return {
    idUsuario: Number(item?.idUsuario ?? item?.IdUsuario ?? 0),
    usuario: item?.usuario ?? item?.Usuario ?? "",
    correo:
      item?.correo ??
      item?.Correo ??
      item?.correoUsuario ??
      item?.CorreoUsuario ??
      null,
    correoUsuario:
      item?.correoUsuario ??
      item?.CorreoUsuario ??
      item?.correo ??
      item?.Correo ??
      null,
    cajaAbierta: Boolean(
      item?.cajaAbierta ??
        item?.CajaAbierta ??
        (item?.estado
          ? String(item.estado).toLowerCase() === "abierta"
          : false)
    ),
    idCierreCaja:
      item?.idCierreCaja ??
      item?.IdCierreCaja ??
      item?.id ??
      item?.Id ??
      null,
    fechaApertura:
      item?.fechaApertura ??
      item?.FechaApertura ??
      null,
    totalEfectivo: Number(
      item?.totalEfectivo ??
        item?.TotalEfectivo ??
        0
    ),
    totalQR: Number(
      item?.totalQR ??
        item?.TotalQR ??
        0
    ),
    totalRecaudado: Number(
      item?.totalRecaudado ??
        item?.TotalRecaudado ??
        0
    ),
    cantidadPagos: Number(
      item?.cantidadPagos ??
        item?.CantidadPagos ??
        0
    ),
  };
}

export async function obtenerEstadoCajasAdmin(): Promise<
  EstadoCajaDistribuidorAdmin[]
> {
  const response = await fetch(
    `${API_URL}/CierreCaja/Admin/EstadoCajas`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado =
    await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarEstadoCaja)
    : [];
}

export async function abrirCajaUsuarioAdmin(
  idUsuario: number
): Promise<RespuestaAccionCajaAdmin> {
  const response = await fetch(
    `${API_URL}/CierreCaja/Admin/AbrirUsuario/${idUsuario}`,
    {
      method: "POST",
      headers: await obtenerHeaders(),
    }
  );

  return await leer<RespuestaAccionCajaAdmin>(response);
}

export async function cerrarCajaUsuarioAdmin(
  idUsuario: number
): Promise<RespuestaAccionCajaAdmin> {
  const response = await fetch(
    `${API_URL}/CierreCaja/Admin/CerrarUsuario/${idUsuario}`,
    {
      method: "POST",
      headers: await obtenerHeaders(),
    }
  );

  return await leer<RespuestaAccionCajaAdmin>(response);
}

export async function abrirTodasCajasAdmin(): Promise<RespuestaAccionCajaAdmin> {
  const response = await fetch(
    `${API_URL}/CierreCaja/Admin/AbrirTodos`,
    {
      method: "POST",
      headers: await obtenerHeaders(),
    }
  );

  return await leer<RespuestaAccionCajaAdmin>(response);
}

export async function cerrarTodasCajasAdmin(): Promise<RespuestaAccionCajaAdmin> {
  const response = await fetch(
    `${API_URL}/CierreCaja/Admin/CerrarTodos`,
    {
      method: "POST",
      headers: await obtenerHeaders(),
    }
  );

  return await leer<RespuestaAccionCajaAdmin>(response);
}
