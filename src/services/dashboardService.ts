import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

import {
  DashboardActividad,
  DashboardResumen,
  IngresoMensual,
} from "../types/dashboard";
import { resolverUrlImagen } from "./productoService";

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

    if (response.status === 403) {
      throw new Error(
        "No tienes permisos para ver el dashboard administrativo."
      );
    }

    throw new Error(mensaje);
  }

  return resultado as T;
}

function normalizarResumen(item: any): DashboardResumen {
  return {
    anio: Number(item?.anio ?? item?.Anio ?? 0),
    mes: Number(item?.mes ?? item?.Mes ?? 0),
    ingresosMes: Number(
      item?.ingresosMes ?? item?.IngresosMes ?? 0
    ),
    ingresosMesAnterior: Number(
      item?.ingresosMesAnterior ??
        item?.IngresosMesAnterior ??
        0
    ),
    variacionIngresosPorcentaje: Number(
      item?.variacionIngresosPorcentaje ??
        item?.VariacionIngresosPorcentaje ??
        0
    ),
    deudaPendienteTotal: Number(
      item?.deudaPendienteTotal ??
        item?.DeudaPendienteTotal ??
        0
    ),
    deudaPendienteMes: Number(
      item?.deudaPendienteMes ??
        item?.DeudaPendienteMes ??
        0
    ),
    pedidosMes: Number(
      item?.pedidosMes ?? item?.PedidosMes ?? 0
    ),
    pedidosPendientesConfirmacion: Number(
      item?.pedidosPendientesConfirmacion ??
        item?.PedidosPendientesConfirmacion ??
        0
    ),
    productosStockBajo: Number(
      item?.productosStockBajo ??
        item?.ProductosStockBajo ??
        0
    ),
    totalVendidoEntregado: Number(
      item?.totalVendidoEntregado ??
        item?.TotalVendidoEntregado ??
        0
    ),
    totalCobrado: Number(
      item?.totalCobrado ??
        item?.TotalCobrado ??
        0
    ),
    porcentajeCobranza: Number(
      item?.porcentajeCobranza ??
        item?.PorcentajeCobranza ??
        0
    ),
  };
}

function normalizarIngreso(item: any): IngresoMensual {
  return {
    mes: Number(item?.mes ?? item?.Mes ?? 0),
    nombreMes:
      item?.nombreMes ??
      item?.NombreMes ??
      "",
    total: Number(item?.total ?? item?.Total ?? 0),
  };
}

function normalizarActividad(item: any): DashboardActividad {
  const estados =
    item?.pedidosPorEstado ??
    item?.PedidosPorEstado ??
    [];

  const clientes =
    item?.clientesMayorDeuda ??
    item?.ClientesMayorDeuda ??
    [];

  const productos =
    item?.productosStockBajo ??
    item?.ProductosStockBajo ??
    [];

  const pagos =
    item?.ultimosPagos ??
    item?.UltimosPagos ??
    [];

  const pedidos =
    item?.ultimosPedidos ??
    item?.UltimosPedidos ??
    [];

  return {
    pedidosPorEstado: Array.isArray(estados)
      ? estados.map((x: any) => ({
          estado: x?.estado ?? x?.Estado ?? "",
          cantidad: Number(
            x?.cantidad ?? x?.Cantidad ?? 0
          ),
        }))
      : [],

    clientesMayorDeuda: Array.isArray(clientes)
      ? clientes.map((x: any) => ({
          idCliente: Number(
            x?.idCliente ?? x?.IdCliente ?? 0
          ),
          cliente:
            x?.cliente ?? x?.Cliente ?? "",
          deudaPendiente: Number(
            x?.deudaPendiente ??
              x?.DeudaPendiente ??
              0
          ),
          cantidadPedidosConDeuda: Number(
            x?.cantidadPedidosConDeuda ??
              x?.CantidadPedidosConDeuda ??
              0
          ),
        }))
      : [],

    productosStockBajo: Array.isArray(productos)
      ? productos.map((x: any) => {
          const imagen = x?.imagen ?? x?.Imagen ?? null;
          const rawUrl = x?.imagenUrl ?? x?.ImagenUrl ?? null;
          return {
            idProducto: Number(
              x?.idProducto ?? x?.IdProducto ?? 0
            ),
            producto:
              x?.producto ?? x?.Producto ?? "",
            stock: Number(
              x?.stock ?? x?.Stock ?? 0
            ),
            precio: Number(
              x?.precio ?? x?.Precio ?? 0
            ),
            estado:
              x?.estado ?? x?.Estado ?? "",
            imagen: imagen,
            imagenUrl: resolverUrlImagen(rawUrl, imagen),
          };
        })
      : [],

    ultimosPagos: Array.isArray(pagos)
      ? pagos.map((x: any) => ({
          idPago: Number(
            x?.idPago ?? x?.IdPago ?? 0
          ),
          idPedido: Number(
            x?.idPedido ?? x?.IdPedido ?? 0
          ),
          cliente:
            x?.cliente ?? x?.Cliente ?? "",
          usuario:
            x?.usuario ?? x?.Usuario ?? "",
          tipoPago:
            x?.tipoPago ?? x?.TipoPago ?? "",
          fechaPago:
            x?.fechaPago ?? x?.FechaPago ?? "",
          montoPagado: Number(
            x?.montoPagado ??
              x?.MontoPagado ??
              0
          ),
          saldoPendiente: Number(
            x?.saldoPendiente ??
              x?.SaldoPendiente ??
              0
          ),
        }))
      : [],

    ultimosPedidos: Array.isArray(pedidos)
      ? pedidos.map((x: any) => ({
          idPedido: Number(
            x?.idPedido ?? x?.IdPedido ?? 0
          ),
          cliente:
            x?.cliente ?? x?.Cliente ?? "",
          sucursal:
            x?.sucursal ?? x?.Sucursal ?? "",
          fechaPedido:
            x?.fechaPedido ??
            x?.FechaPedido ??
            "",
          total: Number(
            x?.total ?? x?.Total ?? 0
          ),
          estado:
            x?.estado ?? x?.Estado ?? "",
        }))
      : [],
  };
}

export async function obtenerResumenDashboard(
  anio?: number,
  mes?: number
): Promise<DashboardResumen> {
  const parametros = new URLSearchParams();

  if (anio) {
    parametros.append("anio", String(anio));
  }

  if (mes) {
    parametros.append("mes", String(mes));
  }

  const query =
    parametros.toString()
      ? `?${parametros.toString()}`
      : "";

  const response = await fetch(
    `${API_URL}/Dashboard/Resumen${query}`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  return normalizarResumen(
    await leer<any>(response)
  );
}

export async function obtenerIngresosDashboard(
  anio: number
): Promise<IngresoMensual[]> {
  const response = await fetch(
    `${API_URL}/Dashboard/Ingresos?anio=${encodeURIComponent(
      String(anio)
    )}`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado = await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarIngreso)
    : [];
}

export async function obtenerActividadDashboard(): Promise<
  DashboardActividad
> {
  const response = await fetch(
    `${API_URL}/Dashboard/Actividad`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  return normalizarActividad(
    await leer<any>(response)
  );
}