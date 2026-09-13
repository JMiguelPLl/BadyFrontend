import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

import {
  CrearPagoDto,
  DetalleAdministrativoDeuda,
  DeudaPedido,
  EditarPagoDto,
  RespuestaPago,
  TipoPago,
  UsuarioSesionPago,
} from "../types/pagoAdmin";

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
        "No tienes permisos para realizar esta operación."
      );
    }

    throw new Error(mensaje);
  }

  return resultado as T;
}

function normalizarDeuda(
  item: any
): DeudaPedido {
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
    fechaPedido:
      item?.fechaPedido ??
      item?.FechaPedido ??
      "",
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
    estadoDeuda:
      item?.estadoDeuda ??
      item?.EstadoDeuda ??
      "Pendiente",
    cantidadPagos: Number(
      item?.cantidadPagos ??
        item?.CantidadPagos ??
        0
    ),
  };
}

function normalizarDetalle(
  item: any
): DetalleAdministrativoDeuda {
  const entrega =
    item?.entrega ??
    item?.Entrega ??
    null;

  const productos =
    item?.productos ??
    item?.Productos ??
    [];

  const pagos =
    item?.pagos ??
    item?.Pagos ??
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
    fechaPedido:
      item?.fechaPedido ??
      item?.FechaPedido ??
      "",
    estadoPedido:
      item?.estadoPedido ??
      item?.EstadoPedido ??
      "",
    observacion:
      item?.observacion ??
      item?.Observacion ??
      null,
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
    estadoDeuda:
      item?.estadoDeuda ??
      item?.EstadoDeuda ??
      "Pendiente",
    cantidadPagos: Number(
      item?.cantidadPagos ??
        item?.CantidadPagos ??
        0
    ),
    entrega: entrega
      ? {
          idAsignacionPedido:
            entrega?.idAsignacionPedido ??
            entrega?.IdAsignacionPedido ??
            null,
          idVehiculo:
            entrega?.idVehiculo ??
            entrega?.IdVehiculo ??
            null,
          vehiculo:
            entrega?.vehiculo ??
            entrega?.Vehiculo ??
            null,
          placa:
            entrega?.placa ??
            entrega?.Placa ??
            null,
          fechaAsignacion:
            entrega?.fechaAsignacion ??
            entrega?.FechaAsignacion ??
            null,
          fechaEntrega:
            entrega?.fechaEntrega ??
            entrega?.FechaEntrega ??
            null,
          estadoAsignacion:
            entrega?.estadoAsignacion ??
            entrega?.EstadoAsignacion ??
            null,
          confirmadoPorCliente: Boolean(
            entrega?.confirmadoPorCliente ??
              entrega?.ConfirmadoPorCliente ??
              false
          ),
          personal: Array.isArray(
            entrega?.personal ??
              entrega?.Personal
          )
            ? (
                entrega?.personal ??
                entrega?.Personal
              ).map((persona: any) => ({
                idUsuario: Number(
                  persona?.idUsuario ??
                    persona?.IdUsuario ??
                    0
                ),
                usuario:
                  persona?.usuario ??
                  persona?.Usuario ??
                  "",
                correo:
                  persona?.correo ??
                  persona?.Correo ??
                  null,
              }))
            : [],
        }
      : null,
    productos: Array.isArray(productos)
      ? productos.map((producto: any) => ({
          idDetalle: Number(
            producto?.idDetalle ??
              producto?.IdDetalle ??
              0
          ),
          idProducto: Number(
            producto?.idProducto ??
              producto?.IdProducto ??
              0
          ),
          producto:
            producto?.producto ??
            producto?.Producto ??
            "",
          cantidad: Number(
            producto?.cantidad ??
              producto?.Cantidad ??
              0
          ),
          precioUnitario: Number(
            producto?.precioUnitario ??
              producto?.PrecioUnitario ??
              0
          ),
          subtotal: Number(
            producto?.subtotal ??
              producto?.Subtotal ??
              0
          ),
          estado:
            producto?.estado ??
            producto?.Estado ??
            "",
        }))
      : [],
    pagos: Array.isArray(pagos)
      ? pagos.map((pago: any) => ({
          id: Number(
            pago?.id ??
              pago?.Id ??
              0
          ),
          idUsuario: Number(
            pago?.idUsuario ??
              pago?.IdUsuario ??
              0
          ),
          usuario:
            pago?.usuario ??
            pago?.Usuario ??
            "",
          correoUsuario:
            pago?.correoUsuario ??
            pago?.CorreoUsuario ??
            null,
          idTipoPago: Number(
            pago?.idTipoPago ??
              pago?.IdTipoPago ??
              0
          ),
          tipoPago:
            pago?.tipoPago ??
            pago?.TipoPago ??
            "",
          fechaPago:
            pago?.fechaPago ??
            pago?.FechaPago ??
            "",
          montoPagado: Number(
            pago?.montoPagado ??
              pago?.MontoPagado ??
              0
          ),
          saldoPendiente: Number(
            pago?.saldoPendiente ??
              pago?.SaldoPendiente ??
              0
          ),
          estado:
            pago?.estado ??
            pago?.Estado ??
            "",
        }))
      : [],
  };
}

export async function listarDeudas(
  estado?: "Pendiente" | "Pagado"
): Promise<DeudaPedido[]> {
  const query = estado
    ? `?estado=${encodeURIComponent(estado)}`
    : "";

  const response = await fetch(
    `${API_URL}/Pago/Deudas${query}`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado =
    await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarDeuda)
    : [];
}

export async function obtenerDetalleAdministrativoDeuda(
  idPedido: number
): Promise<DetalleAdministrativoDeuda> {
  const response = await fetch(
    `${API_URL}/Pago/Pedido/${idPedido}/DetalleAdministrativo`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado =
    await leer<any>(response);

  return normalizarDetalle(resultado);
}

export async function listarTiposPagoActivos(): Promise<
  TipoPago[]
> {
  const response = await fetch(
    `${API_URL}/TipoPago/Activos`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado =
    await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map((item) => ({
        id: Number(
          item?.id ??
            item?.Id ??
            0
        ),
        descripcion:
          item?.descripcion ??
          item?.Descripcion ??
          "",
        estado:
          item?.estado ??
          item?.Estado ??
          "Activo",
      }))
    : [];
}

export async function crearPago(
  datos: CrearPagoDto
): Promise<RespuestaPago> {
  const response = await fetch(
    `${API_URL}/Pago/Agregar`,
    {
      method: "POST",
      headers: await obtenerHeaders(),
      body: JSON.stringify(datos),
    }
  );

  return leer<RespuestaPago>(response);
}

export async function editarPago(
  idPago: number,
  datos: EditarPagoDto
): Promise<RespuestaPago> {
  const response = await fetch(
    `${API_URL}/Pago/${idPago}`,
    {
      method: "PUT",
      headers: await obtenerHeaders(),
      body: JSON.stringify(datos),
    }
  );

  return leer<RespuestaPago>(response);
}

export async function anularPago(
  idPago: number
): Promise<RespuestaPago> {
  const response = await fetch(
    `${API_URL}/Pago/${idPago}/Anular`,
    {
      method: "PATCH",
      headers: await obtenerHeaders(),
    }
  );

  return leer<RespuestaPago>(response);
}

export async function obtenerUsuarioSesionPago(): Promise<
  UsuarioSesionPago | null
> {
  const usuario =
    await AsyncStorage.getItem("usuario");

  if (!usuario) {
    return null;
  }

  try {
    const datos = JSON.parse(usuario);

    return {
      id: Number(
        datos?.id ??
          datos?.Id ??
          0
      ),
      nombre:
        datos?.nombre ??
        datos?.Nombre ??
        "",
      email:
        datos?.email ??
        datos?.Email ??
        "",
      rol:
        datos?.rol ??
        datos?.Rol ??
        "",
      tipoCuenta:
        datos?.tipoCuenta ??
        datos?.TipoCuenta ??
        "",
    };
  } catch {
    return null;
  }
}