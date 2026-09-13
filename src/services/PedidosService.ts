import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "../constants/api";

import {
  ActualizarPedidoDto,
  CrearPedidoDto,
  Pedido,
  ProductoPedido,
  RespuestaApiPedido,
  SucursalPedido,
} from "../types/pedido";
import { resolverUrlImagen } from "./productoService";

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

function normalizarDetalle(detalle: any) {
  const imagen = detalle?.imagen ?? detalle?.Imagen ?? null;
  const rawUrl = detalle?.imagenUrl ?? detalle?.ImagenUrl ?? null;
  const imagenUrl = resolverUrlImagen(rawUrl, imagen);

  return {
    id: Number(detalle?.id ?? detalle?.Id ?? 0),
    idProducto: Number(
      detalle?.idProducto ??
        detalle?.IdProducto ??
        detalle?.id_producto ??
        0
    ),
    producto:
      detalle?.producto ??
      detalle?.Producto ??
      "Producto",
    cantidad: Number(
      detalle?.cantidad ?? detalle?.Cantidad ?? 0
    ),
    precioUnitario: Number(
      detalle?.precioUnitario ??
        detalle?.PrecioUnitario ??
        0
    ),
    subtotal: Number(
      detalle?.subtotal ?? detalle?.Subtotal ?? 0
    ),
    estado:
      detalle?.estado ??
      detalle?.Estado ??
      "",
    imagen: imagen,
    imagenUrl: imagenUrl,
  };
}

function normalizarPedido(pedido: any): Pedido {
  const detallesRecibidos =
    pedido?.detalles ??
    pedido?.Detalles ??
    [];

  return {
    id: Number(pedido?.id ?? pedido?.Id ?? 0),
    idCliente: Number(
      pedido?.idCliente ??
        pedido?.IdCliente ??
        pedido?.id_cliente ??
        0
    ),
    cliente:
      pedido?.cliente ??
      pedido?.Cliente ??
      "",
    idSucursal: Number(
      pedido?.idSucursal ??
        pedido?.IdSucursal ??
        pedido?.id_sucursal ??
        0
    ),
    sucursal:
      pedido?.sucursal ??
      pedido?.Sucursal ??
      "",
    fechaPedido:
      pedido?.fechaPedido ??
      pedido?.FechaPedido ??
      pedido?.fecha ??
      pedido?.Fecha ??
      "",
    observacion:
      pedido?.observacion ??
      pedido?.Observacion ??
      null,
    motivoEdicion:
      pedido?.motivoEdicion ??
      pedido?.MotivoEdicion ??
      pedido?.motivo_edicion ??
      null,
    motivoDevolucion:
      pedido?.motivoDevolucion ??
      pedido?.MotivoDevolucion ??
      pedido?.motivo_devolucion ??
      null,
    fechaDevolucion:
      pedido?.fechaDevolucion ??
      pedido?.FechaDevolucion ??
      pedido?.fecha_devolucion ??
      null,
    total: Number(
      pedido?.total ?? pedido?.Total ?? 0
    ),
    estado:
      pedido?.estado ??
      pedido?.Estado ??
      "",
    saldoPendiente:
      pedido?.saldoPendiente !== undefined &&
      pedido?.saldoPendiente !== null
        ? Number(pedido.saldoPendiente)
        : pedido?.SaldoPendiente !== undefined &&
            pedido?.SaldoPendiente !== null
          ? Number(pedido.SaldoPendiente)
          : null,
    detalles: Array.isArray(detallesRecibidos)
      ? detallesRecibidos.map(normalizarDetalle)
      : [],
  };
}

export async function listarPedidosCliente(
  idCliente: number
): Promise<Pedido[]> {
  const response = await fetch(
    `${API_URL}/Pedido/ListarPorCliente/${idCliente}`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const resultado = await leerRespuesta<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarPedido)
    : [];
}

export async function listarMisPedidos(): Promise<Pedido[]> {
  const response = await fetch(
    `${API_URL}/Pedido/MisPedidos`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const resultado = await leerRespuesta<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarPedido)
    : [];
}

export async function listarMisPendientesConfirmacion(): Promise<
  Pedido[]
> {
  const response = await fetch(
    `${API_URL}/Pedido/MisPendientesConfirmacion`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const resultado = await leerRespuesta<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarPedido)
    : [];
}

export async function confirmarEntregaPedido(
  idPedido: number
): Promise<RespuestaApiPedido> {
  const response = await fetch(
    `${API_URL}/Pedido/${idPedido}/ConfirmarEntrega`,
    {
      method: "PATCH",
      headers: await obtenerCabeceras(),
    }
  );

  return leerRespuesta<RespuestaApiPedido>(response);
}

export async function rechazarEntregaPedido(
  idPedido: number,
  motivo: string
): Promise<RespuestaApiPedido> {
  const response = await fetch(
    `${API_URL}/Pedido/${idPedido}/RechazarEntrega`,
    {
      method: "PATCH",
      headers: await obtenerCabeceras(),
      body: JSON.stringify({ motivo: motivo.trim() }),
    }
  );

  return leerRespuesta<RespuestaApiPedido>(response);
}

export async function noConfirmarEntregaPedido(
  idPedido: number,
  motivo?: string
): Promise<RespuestaApiPedido> {
  return rechazarEntregaPedido(idPedido, motivo || "Pedido no recibido");
}

export async function obtenerPedidoPorId(
  idPedido: number
): Promise<Pedido> {
  const response = await fetch(
    `${API_URL}/Pedido/${idPedido}`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const resultado = await leerRespuesta<any>(response);
  return normalizarPedido(resultado);
}

export async function actualizarPedido(
  idPedido: number,
  datos: ActualizarPedidoDto
): Promise<RespuestaApiPedido> {
  const response = await fetch(
    `${API_URL}/Pedido/${idPedido}`,
    {
      method: "PUT",
      headers: await obtenerCabeceras(),
      body: JSON.stringify(datos),
    }
  );

  return leerRespuesta<RespuestaApiPedido>(response);
}

export async function cancelarPedido(
  idPedido: number
): Promise<RespuestaApiPedido> {
  const response = await fetch(
    `${API_URL}/Pedido/${idPedido}/cancelar`,
    {
      method: "PATCH",
      headers: await obtenerCabeceras(),
    }
  );

  return leerRespuesta<RespuestaApiPedido>(response);
}

export async function listarProductosDisponibles(): Promise<
  ProductoPedido[]
> {
  const response = await fetch(
    `${API_URL}/Producto/Disponibles`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const resultado = await leerRespuesta<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map((producto) => {
        const imagen = producto?.imagen ?? producto?.Imagen ?? null;
        const rawUrl = producto?.imagenUrl ?? producto?.ImagenUrl ?? null;
        const imagenUrl = resolverUrlImagen(rawUrl, imagen);

        return {
          id: Number(producto?.id ?? producto?.Id ?? 0),
          nombre:
            producto?.nombre ??
            producto?.Nombre ??
            "",
          descripcion:
            producto?.descripcion ??
            producto?.Descripcion ??
            "",
          stock: Number(
            producto?.stock ?? producto?.Stock ?? 0
          ),
          precio: Number(
            producto?.precio ?? producto?.Precio ?? 0
          ),
          estado:
            producto?.estado ??
            producto?.Estado ??
            "",
          imagen: imagen,
          imagenUrl: imagenUrl,
        };
      })
    : [];
}

export async function listarSucursalesCliente(
  idCliente: number
): Promise<SucursalPedido[]> {
  const response = await fetch(
    `${API_URL}/Sucursal/Cliente/${idCliente}`,
    {
      method: "GET",
      headers: await obtenerCabeceras(),
    }
  );

  const resultado = await leerRespuesta<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map((sucursal) => ({
        id: Number(
          sucursal?.id ?? sucursal?.Id ?? 0
        ),
        idCliente: Number(
          sucursal?.idCliente ??
            sucursal?.IdCliente ??
            sucursal?.id_cliente ??
            idCliente
        ),
        nombre:
          sucursal?.nombre ??
          sucursal?.Nombre ??
          "",
        descripcion:
          sucursal?.descripcion ??
          sucursal?.Descripcion ??
          "",
        ubicacion:
          sucursal?.ubicacion ??
          sucursal?.Ubicacion ??
          "",
        estado:
          sucursal?.estado ??
          sucursal?.Estado ??
          "",
      }))
    : [];
}

export async function crearPedido(
  datos: CrearPedidoDto
): Promise<RespuestaApiPedido> {
  const response = await fetch(
    `${API_URL}/Pedido/Crear`,
    {
      method: "POST",
      headers: await obtenerCabeceras(),
      body: JSON.stringify(datos),
    }
  );

  return leerRespuesta<RespuestaApiPedido>(response);
}


