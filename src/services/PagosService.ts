import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

import {
  Pago,
  PagoDetalle,
  PagosPorPedido,
} from "../types/pago";

async function obtenerCabeceras() {
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

async function leerRespuesta<T>(
  response: Response
): Promise<T> {
  let resultado: any = null;

  try {
    resultado = await response.json();
  } catch {
    resultado = null;
  }

  if (!response.ok) {
    const mensaje =
      resultado?.message ||
      resultado?.title ||
      (typeof resultado === "string"
        ? resultado
        : "Ocurrió un error al procesar la solicitud.");

    if (response.status === 401) {
      throw new Error(
        "Tu sesión expiró. Inicia sesión nuevamente."
      );
    }

    throw new Error(mensaje);
  }

  return resultado as T;
}

function normalizarPago(item: any): Pago {
  return {
    idPago: Number(
      item?.idPago ?? item?.IdPago ?? item?.id ?? item?.Id ?? 0
    ),
    idPedido: Number(
      item?.idPedido ?? item?.IdPedido ?? 0
    ),
    idCliente: Number(
      item?.idCliente ?? item?.IdCliente ?? 0
    ),
    cliente:
      item?.cliente ??
      item?.Cliente ??
      "",
    sucursal:
      item?.sucursal ??
      item?.Sucursal ??
      "",
    totalPedido: Number(
      item?.totalPedido ?? item?.TotalPedido ?? 0
    ),
    estadoPedido:
      item?.estadoPedido ??
      item?.EstadoPedido ??
      "",
    idUsuario: Number(
      item?.idUsuario ?? item?.IdUsuario ?? 0
    ),
    usuario:
      item?.usuario ??
      item?.Usuario ??
      "",
    fechaPago:
      item?.fechaPago ??
      item?.FechaPago ??
      "",
    tipoPago:
      item?.tipoPago ??
      item?.TipoPago ??
      "",
    montoPagado: Number(
      item?.montoPagado ?? item?.MontoPagado ?? 0
    ),
    saldoPendiente: Number(
      item?.saldoPendiente ?? item?.SaldoPendiente ?? 0
    ),
    estadoPago:
      item?.estadoPago ??
      item?.EstadoPago ??
      item?.estado ??
      item?.Estado ??
      "",
  };
}

function normalizarPagoDetalle(item: any): PagoDetalle {
  return {
    id: Number(item?.id ?? item?.Id ?? 0),
    idPedido: Number(
      item?.idPedido ?? item?.IdPedido ?? 0
    ),
    idUsuario: Number(
      item?.idUsuario ?? item?.IdUsuario ?? 0
    ),
    usuario:
      item?.usuario ??
      item?.Usuario ??
      "",
    correoUsuario:
      item?.correoUsuario ??
      item?.CorreoUsuario ??
      null,
    idTipoPago: Number(
      item?.idTipoPago ?? item?.IdTipoPago ?? 0
    ),
    tipoPago:
      item?.tipoPago ??
      item?.TipoPago ??
      "",
    fechaPago:
      item?.fechaPago ??
      item?.FechaPago ??
      "",
    montoPagado: Number(
      item?.montoPagado ?? item?.MontoPagado ?? 0
    ),
    saldoPendiente: Number(
      item?.saldoPendiente ?? item?.SaldoPendiente ?? 0
    ),
    estado:
      item?.estado ??
      item?.Estado ??
      "",
  };
}

export async function listarPagosCliente(
  idCliente: number
): Promise<Pago[]> {
  const response = await fetch(
    `${API_URL}/Pago/Cliente/${idCliente}`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const resultado = await leerRespuesta<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarPago)
    : [];
}

export async function listarPagosPorPedido(
  idPedido: number
): Promise<PagosPorPedido> {
  const response = await fetch(
    `${API_URL}/Pago/Pedido/${idPedido}`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const resultado = await leerRespuesta<any>(response);

  return {
    idPedido: Number(
      resultado?.idPedido ?? resultado?.IdPedido ?? 0
    ),
    idCliente: Number(
      resultado?.idCliente ?? resultado?.IdCliente ?? 0
    ),
    cliente:
      resultado?.cliente ??
      resultado?.Cliente ??
      "",
    idSucursal: Number(
      resultado?.idSucursal ?? resultado?.IdSucursal ?? 0
    ),
    sucursal:
      resultado?.sucursal ??
      resultado?.Sucursal ??
      "",
    fechaPedido:
      resultado?.fechaPedido ??
      resultado?.FechaPedido ??
      "",
    estadoPedido:
      resultado?.estadoPedido ??
      resultado?.EstadoPedido ??
      "",
    totalPedido: Number(
      resultado?.totalPedido ?? resultado?.TotalPedido ?? 0
    ),
    totalPagado: Number(
      resultado?.totalPagado ?? resultado?.TotalPagado ?? 0
    ),
    saldoPendienteActual: Number(
      resultado?.saldoPendienteActual ??
        resultado?.SaldoPendienteActual ??
        0
    ),
    cantidadPagos: Number(
      resultado?.cantidadPagos ??
        resultado?.CantidadPagos ??
        0
    ),
    pagos: Array.isArray(
      resultado?.pagos ?? resultado?.Pagos
    )
      ? (resultado?.pagos ?? resultado?.Pagos).map(
          (item: any) => ({
            id: Number(item?.id ?? item?.Id ?? 0),
            idPedido: Number(
              item?.idPedido ?? item?.IdPedido ?? 0
            ),
            idUsuario: Number(
              item?.idUsuario ?? item?.IdUsuario ?? 0
            ),
            usuario:
              item?.usuario ?? item?.Usuario ?? "",
            idTipoPago: Number(
              item?.idTipoPago ?? item?.IdTipoPago ?? 0
            ),
            tipoPago:
              item?.tipoPago ?? item?.TipoPago ?? "",
            fechaPago:
              item?.fechaPago ?? item?.FechaPago ?? "",
            montoPagado: Number(
              item?.montoPagado ?? item?.MontoPagado ?? 0
            ),
            saldoPendiente: Number(
              item?.saldoPendiente ??
                item?.SaldoPendiente ??
                0
            ),
            estado:
              item?.estado ?? item?.Estado ?? "",
          })
        )
      : [],
  };
}

export async function obtenerPagoPorId(
  idPago: number
): Promise<PagoDetalle> {
  const response = await fetch(
    `${API_URL}/Pago/${idPago}`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const resultado = await leerRespuesta<any>(response);

  return normalizarPagoDetalle(resultado);
}

export async function listarDetallePagosPedido(
  idPedido: number
): Promise<PagoDetalle[]> {
  const response = await fetch(
    `${API_URL}/Pago/Pedido/${idPedido}/Detalle`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const resultado = await leerRespuesta<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarPagoDetalle)
    : [];
}