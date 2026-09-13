import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import {
  AsignacionPedido,
  AsignacionVehiculoDisponible,
  CrearAsignacionPedidoDto,
  PedidoAdmin,
  PersonalAsignacionPedido,
  RespuestaAsignacionPedido,
} from "../types/asignacionPedido";

const API_URL =
  Platform.OS === "web"
    ? "https://localhost:7228/api"
    : "http://10.0.2.2:5127/api";

async function obtenerHeaders() {
  const token =
    await AsyncStorage.getItem(
      "token"
    );

  return {
    Accept: "application/json",
    "Content-Type":
      "application/json",
    ...(token
      ? {
          Authorization:
            `Bearer ${token}`,
        }
      : {}),
  };
}

async function leer<T>(
  response: Response
): Promise<T> {
  let resultado: any = null;

  try {
    resultado =
      await response.json();
  } catch {
    resultado = null;
  }

  if (!response.ok) {
    const mensaje =
      resultado?.message ||
      resultado?.title ||
      (typeof resultado ===
      "string"
        ? resultado
        : "Ocurrió un error al procesar la solicitud.");

    if (
      response.status === 401
    ) {
      throw new Error(
        "Tu sesión expiró. Inicia sesión nuevamente."
      );
    }

    throw new Error(mensaje);
  }

  return resultado as T;
}

function normalizarDetalle(
  detalle: any
) {
  return {
    id: Number(
      detalle?.id ??
        detalle?.Id ??
        0
    ),

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
      detalle?.cantidad ??
        detalle?.Cantidad ??
        0
    ),

    precioUnitario: Number(
      detalle?.precioUnitario ??
        detalle?.PrecioUnitario ??
        0
    ),

    subtotal: Number(
      detalle?.subtotal ??
        detalle?.Subtotal ??
        0
    ),

    estado:
      detalle?.estado ??
      detalle?.Estado ??
      "",
  };
}

function normalizarPedido(
  pedido: any
): PedidoAdmin {
  const detallesRecibidos =
    pedido?.detalles ??
    pedido?.Detalles ??
    [];

  return {
    id: Number(
      pedido?.id ??
        pedido?.Id ??
        0
    ),

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

    total: Number(
      pedido?.total ??
        pedido?.Total ??
        0
    ),

    estado:
      pedido?.estado ??
      pedido?.Estado ??
      "",

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

    saldoPendiente:
      pedido?.saldoPendiente !==
        undefined &&
      pedido?.saldoPendiente !==
        null
        ? Number(
            pedido.saldoPendiente
          )
        : pedido?.SaldoPendiente !==
              undefined &&
            pedido?.SaldoPendiente !==
              null
          ? Number(
              pedido.SaldoPendiente
            )
          : null,

    detalles:
      Array.isArray(
        detallesRecibidos
      )
        ? detallesRecibidos.map(
            normalizarDetalle
          )
        : [],
  };
}

function normalizarAsignacionVehiculo(
  item: any
): AsignacionVehiculoDisponible {
  return {
    id: Number(
      item?.id ??
        item?.Id ??
        0
    ),

    idUsuario: Number(
      item?.idUsuario ??
        item?.IdUsuario ??
        item?.id_usuario ??
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

    idVehiculo: Number(
      item?.idVehiculo ??
        item?.IdVehiculo ??
        item?.id_vehiculo ??
        0
    ),

    vehiculo:
      item?.vehiculo ??
      item?.Vehiculo ??
      "",

    placa:
      item?.placa ??
      item?.Placa ??
      null,

    cantidadCarga:
      item?.cantidadCarga ??
      item?.CantidadCarga ??
      "",

    fecha:
      item?.fecha ??
      item?.Fecha ??
      "",

    estado:
      item?.estado ??
      item?.Estado ??
      "Activo",
  };
}

/*
 * NUEVO:
 * Normaliza cada integrante del snapshot histórico.
 */
function normalizarPersonalAsignado(
  item: any
): PersonalAsignacionPedido {
  return {
    idAsignacionVehiculo:
      Number(
        item?.idAsignacionVehiculo ??
          item?.IdAsignacionVehiculo ??
          0
      ),

    idUsuario:
      Number(
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
  };
}

function normalizarAsignacionPedido(
  item: any
): AsignacionPedido {
  const personalRecibido =
    item?.personalAsignado ??
    item?.PersonalAsignado ??
    [];

  return {
    id: Number(
      item?.id ??
        item?.Id ??
        0
    ),

    idAsignacionVehiculo:
      Number(
        item?.idAsignacionVehiculo ??
          item?.IdAsignacionVehiculo ??
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

    correoUsuario:
      item?.correoUsuario ??
      item?.CorreoUsuario ??
      null,

    idVehiculo: Number(
      item?.idVehiculo ??
        item?.IdVehiculo ??
        0
    ),

    vehiculo:
      item?.vehiculo ??
      item?.Vehiculo ??
      "",

    placa:
      item?.placa ??
      item?.Placa ??
      null,

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

    totalPedido: Number(
      item?.totalPedido ??
        item?.TotalPedido ??
        0
    ),

    fechaAsignacion:
      item?.fechaAsignacion ??
      item?.FechaAsignacion ??
      "",

    fechaEntrega:
      item?.fechaEntrega ??
      item?.FechaEntrega ??
      null,

    estadoAsignacion:
      item?.estadoAsignacion ??
      item?.EstadoAsignacion ??
      "",

    estadoPedido:
      item?.estadoPedido ??
      item?.EstadoPedido ??
      "",

    /*
     * NUEVO:
     * Este array viene directamente del backend histórico.
     */
    personalAsignado:
      Array.isArray(
        personalRecibido
      )
        ? personalRecibido.map(
            normalizarPersonalAsignado
          )
        : [],
  };
}

export async function listarPedidos(): Promise<
  PedidoAdmin[]
> {
  const response =
    await fetch(
      `${API_URL}/Pedido/Listar`,
      {
        method: "GET",
        headers:
          await obtenerHeaders(),
      }
    );

  const resultado =
    await leer<any[]>(
      response
    );

  return Array.isArray(
    resultado
  )
    ? resultado.map(
        normalizarPedido
      )
    : [];
}

export async function obtenerPedidoPorId(
  idPedido: number
): Promise<PedidoAdmin> {
  const response =
    await fetch(
      `${API_URL}/Pedido/${idPedido}`,
      {
        method: "GET",
        headers:
          await obtenerHeaders(),
      }
    );

  const resultado =
    await leer<any>(
      response
    );

  return normalizarPedido(
    resultado
  );
}

export async function listarAsignacionesVehiculoActivas(): Promise<
  AsignacionVehiculoDisponible[]
> {
  const response =
    await fetch(
      `${API_URL}/Asignacion_vehiculo/Listar`,
      {
        method: "GET",
        headers:
          await obtenerHeaders(),
      }
    );

  const resultado =
    await leer<any[]>(
      response
    );

  const asignaciones =
    Array.isArray(
      resultado
    )
      ? resultado.map(
          normalizarAsignacionVehiculo
        )
      : [];

  return asignaciones.filter(
    (asignacion) =>
      asignacion.estado ===
      "Activo"
  );
}

export async function listarAsignacionesPedido(): Promise<
  AsignacionPedido[]
> {
  const response =
    await fetch(
      `${API_URL}/AsignacionPedido/Listar`,
      {
        method: "GET",
        headers:
          await obtenerHeaders(),
      }
    );

  const resultado =
    await leer<any[]>(
      response
    );

  return Array.isArray(
    resultado
  )
    ? resultado.map(
        normalizarAsignacionPedido
      )
    : [];
}

export async function crearAsignacionPedido(
  datos: CrearAsignacionPedidoDto
): Promise<RespuestaAsignacionPedido> {
  const response =
    await fetch(
      `${API_URL}/AsignacionPedido/Agregar`,
      {
        method: "POST",
        headers:
          await obtenerHeaders(),
        body: JSON.stringify(
          datos
        ),
      }
    );

  return leer<RespuestaAsignacionPedido>(
    response
  );
}

export async function editarAsignacionPedido(
  idAsignacionPedido: number,
  datos: CrearAsignacionPedidoDto
): Promise<RespuestaAsignacionPedido> {
  const response =
    await fetch(
      `${API_URL}/AsignacionPedido/${idAsignacionPedido}`,
      {
        method: "PUT",
        headers:
          await obtenerHeaders(),
        body: JSON.stringify(
          datos
        ),
      }
    );

  return leer<RespuestaAsignacionPedido>(
    response
  );
}

export interface EditarPedidoAdminDto {
  idCliente: number;
  idSucursal: number;
  observacion?: string | null;
  motivoEdicion?: string | null;
  detalles: {
    idProducto: number;
    cantidad: number;
  }[];
}

export async function editarPedidoAdmin(
  idPedido: number,
  datos: EditarPedidoAdminDto
): Promise<any> {
  const response = await fetch(
    `${API_URL}/Pedido/${idPedido}`,
    {
      method: "PUT",
      headers: await obtenerHeaders(),
      body: JSON.stringify(datos),
    }
  );

  return leer<any>(response);
}

