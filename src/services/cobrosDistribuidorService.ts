import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import {
  CobrosPedidoDistribuidor,
  CobroDistribuidorDetalle,
  PedidoCobrableDistribuidor,
} from "../types/cobrosDistribuidor";

const API_URL =
  Platform.OS === "web"
    ? "https://localhost:7228/api"
    : "http://10.0.2.2:5127/api";

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

async function leer<T>(
  response: Response
): Promise<T> {
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

    throw new Error(
      resultado?.message ||
        resultado?.title ||
        "No se pudo procesar la solicitud."
    );
  }

  return resultado as T;
}

function normalizarPedidoCobrable(
  item: any
): PedidoCobrableDistribuidor {
  return {
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

    ubicacion:
      item?.ubicacion ??
      item?.Ubicacion ??
      "",

    fechaPedido:
      item?.fechaPedido ??
      item?.FechaPedido ??
      "",

    fechaEntrega:
      item?.fechaEntrega ??
      item?.FechaEntrega ??
      null,

    estadoPedido:
      item?.estadoPedido ??
      item?.EstadoPedido ??
      "",

    totalPedido: Number(
      item?.totalPedido ??
        item?.TotalPedido ??
        0
    ),

    totalPagado: Number(
      item?.totalPagado ??
        item?.TotalPagado ??
        0
    ),

    saldoPendiente: Number(
      item?.saldoPendiente ??
        item?.SaldoPendiente ??
        0
    ),

    cantidadPagos: Number(
      item?.cantidadPagos ??
        item?.CantidadPagos ??
        0
    ),
  };
}

function normalizarCobroDetalle(
  item: any
): CobroDistribuidorDetalle {
  return {
    idPago: Number(
      item?.idPago ??
        item?.IdPago ??
        0
    ),

    idUsuario: Number(
      item?.idUsuario ??
        item?.IdUsuario ??
        0
    ),

    usuario:
      item?.usuario ??
      item?.Usuario ??
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

    fechaPago:
      item?.fechaPago ??
      item?.FechaPago ??
      "",

    montoPagado: Number(
      item?.montoPagado ??
        item?.MontoPagado ??
        0
    ),

    saldoPendienteDespuesPago:
      Number(
        item?.saldoPendienteDespuesPago ??
          item?.SaldoPendienteDespuesPago ??
          0
      ),

    estadoPago:
      item?.estadoPago ??
      item?.EstadoPago ??
      "",
  };
}

function normalizarCobrosPedido(
  item: any
): CobrosPedidoDistribuidor {
  const historial =
    item?.historialCobros ??
    item?.HistorialCobros ??
    [];

  return {
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

    ubicacion:
      item?.ubicacion ??
      item?.Ubicacion ??
      "",

    fechaPedido:
      item?.fechaPedido ??
      item?.FechaPedido ??
      "",

    fechaEntrega:
      item?.fechaEntrega ??
      item?.FechaEntrega ??
      null,

    estadoPedido:
      item?.estadoPedido ??
      item?.EstadoPedido ??
      "",

    totalPedido: Number(
      item?.totalPedido ??
        item?.TotalPedido ??
        0
    ),

    totalPagadoPedido: Number(
      item?.totalPagadoPedido ??
        item?.TotalPagadoPedido ??
        0
    ),

    saldoPendiente: Number(
      item?.saldoPendiente ??
        item?.SaldoPendiente ??
        0
    ),

    estadoDeuda:
      item?.estadoDeuda ??
      item?.EstadoDeuda ??
      "",

    cantidadCobros: Number(
      item?.cantidadCobros ??
        item?.CantidadCobros ??
        0
    ),

    totalCobradoPorMi: Number(
      item?.totalCobradoPorMi ??
        item?.TotalCobradoPorMi ??
        0
    ),

    ultimoCobro:
      item?.ultimoCobro ??
      item?.UltimoCobro ??
      null,

    historialCobros:
      Array.isArray(historial)
        ? historial.map(
            normalizarCobroDetalle
          )
        : [],
  };
}

export async function listarPedidosCobrablesDistribuidor(): Promise<
  PedidoCobrableDistribuidor[]
> {
  const response = await fetch(
    `${API_URL}/Pago/Distribuidor/PedidosCobrables`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado = await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(
        normalizarPedidoCobrable
      )
    : [];
}

export async function listarMisCobrosPorPedido(): Promise<
  CobrosPedidoDistribuidor[]
> {
  const response = await fetch(
    `${API_URL}/Pago/Distribuidor/MisCobrosPorPedido`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado = await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(
        normalizarCobrosPedido
      )
    : [];
}
