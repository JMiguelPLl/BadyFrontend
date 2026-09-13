import AsyncStorage from "@react-native-async-storage/async-storage";
import { Linking, Platform } from "react-native";

import {
  PagoDistribuidor,
  PedidoDistribuidor,
  PerfilDistribuidor,
  TipoPago,
} from "../types/distribuidor";

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

function normalizarDetalle(detalle: any) {
  return {
    id: Number(
      detalle?.id ??
        detalle?.Id ??
        detalle?.idDetalle ??
        detalle?.IdDetalle ??
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
    descripcion:
      detalle?.descripcion ??
      detalle?.Descripcion ??
      null,
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

function normalizarPedido(pedido: any): PedidoDistribuidor {
  const productosRecibidos =
    pedido?.detalles ??
    pedido?.Detalles ??
    pedido?.productos ??
    pedido?.Productos ??
    [];

  return {
    idAsignacionPedido: Number(
      pedido?.idAsignacionPedido ??
        pedido?.IdAsignacionPedido ??
        pedido?.id_asignacion_pedido ??
        0
    ),
    idPedido: Number(
      pedido?.idPedido ??
        pedido?.IdPedido ??
        pedido?.id_pedido ??
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
    ubicacion:
      pedido?.ubicacion ??
      pedido?.Ubicacion ??
      pedido?.ubicacionSucursal ??
      pedido?.UbicacionSucursal ??
      "",
    fechaPedido:
      pedido?.fechaPedido ??
      pedido?.FechaPedido ??
      "",
    fechaAsignacion:
      pedido?.fechaAsignacion ??
      pedido?.FechaAsignacion ??
      "",
    fechaEntrega:
      pedido?.fechaEntrega ??
      pedido?.FechaEntrega ??
      null,
    observacion:
      pedido?.observacion ??
      pedido?.Observacion ??
      pedido?.observacionPedido ??
      pedido?.ObservacionPedido ??
      null,
    total: Number(
      pedido?.total ??
        pedido?.Total ??
        pedido?.totalPedido ??
        pedido?.TotalPedido ??
        0
    ),
    cantidadTotalProductos: Number(
      pedido?.cantidadTotalProductos ??
        pedido?.CantidadTotalProductos ??
        0
    ),
    estadoAsignacion:
      pedido?.estadoAsignacion ??
      pedido?.EstadoAsignacion ??
      "",
    estadoPedido:
      pedido?.estadoPedido ??
      pedido?.EstadoPedido ??
      pedido?.estado ??
      pedido?.Estado ??
      "",
    idVehiculo: Number(
      pedido?.idVehiculo ??
        pedido?.IdVehiculo ??
        0
    ),
    vehiculo:
      pedido?.vehiculo ??
      pedido?.Vehiculo ??
      "",
    placa:
      pedido?.placa ??
      pedido?.Placa ??
      null,
    cantidadCarga:
      pedido?.cantidadCarga ??
      pedido?.CantidadCarga ??
      "",
    totalPagado: Number(
      pedido?.totalPagado ??
        pedido?.TotalPagado ??
        0
    ),
    saldoPendiente: Number(
      pedido?.saldoPendiente ??
        pedido?.SaldoPendiente ??
        0
    ),
    estadoDeuda:
      pedido?.estadoDeuda ??
      pedido?.EstadoDeuda ??
      "",
    puedeRegistrarPago: Boolean(
      pedido?.puedeRegistrarPago ??
        pedido?.PuedeRegistrarPago ??
        false
    ),
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
    detalles: Array.isArray(productosRecibidos)
      ? productosRecibidos.map(normalizarDetalle)
      : [],
  };
}

export async function listarMisPedidos(): Promise<
  PedidoDistribuidor[]
> {
  const response = await fetch(
    `${API_URL}/DistribuidorPedido/MisPedidos`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado = await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map(normalizarPedido)
    : [];
}

export async function obtenerDetallePedidoDistribuidor(
  idAsignacionPedido: number
): Promise<PedidoDistribuidor> {
  const response = await fetch(
    `${API_URL}/DistribuidorPedido/${idAsignacionPedido}/Detalle`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado = await leer<any>(response);

  return normalizarPedido(resultado);
}

export async function ponerEnCamino(
  idAsignacionPedido: number
) {
  const response = await fetch(
    `${API_URL}/DistribuidorPedido/${idAsignacionPedido}/EnCamino`,
    {
      method: "PATCH",
      headers: await obtenerHeaders(),
    }
  );

  return await leer<{
    message?: string;
    idAsignacionPedido?: number;
    idPedido?: number;
    estadoAsignacion?: string;
    estadoPedido?: string;
  }>(response);
}

export async function marcarEntregado(
  idAsignacionPedido: number
) {
  const response = await fetch(
    `${API_URL}/DistribuidorPedido/${idAsignacionPedido}/Entregar`,
    {
      method: "PATCH",
      headers: await obtenerHeaders(),
    }
  );

  return await leer<{
    message?: string;
    idAsignacionPedido?: number;
    idPedido?: number;
    fechaEntrega?: string;
    estadoAsignacion?: string;
    estadoPedido?: string;
  }>(response);
}

export async function abrirUbicacion(
  ubicacion: string
) {
  const valor = ubicacion?.trim();

  if (!valor) {
    throw new Error(
      "La sucursal no tiene una ubicación registrada."
    );
  }

  if (
    /^https?:\/\//i.test(valor) ||
    /^geo:/i.test(valor)
  ) {
    await Linking.openURL(valor);
    return;
  }

  const url =
    Platform.OS === "android"
      ? `geo:0,0?q=${encodeURIComponent(valor)}`
      : Platform.OS === "ios"
        ? `http://maps.apple.com/?q=${encodeURIComponent(
            valor
          )}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
            valor
          )}`;

  await Linking.openURL(url);
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

  const resultado = await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map((tipo) => ({
        id: Number(tipo?.id ?? tipo?.Id ?? 0),
        descripcion:
          tipo?.descripcion ??
          tipo?.Descripcion ??
          "",
        estado:
          tipo?.estado ??
          tipo?.Estado ??
          "Activo",
      }))
    : [];
}

export async function registrarPago(datos: {
  idPedido: number;
  idTipoPago: number;
  montoPagado: number;
}) {
  const usuarioTexto =
    await AsyncStorage.getItem("usuario");

  if (!usuarioTexto) {
    throw new Error(
      "No se encontró la información del usuario."
    );
  }

  const usuario = JSON.parse(usuarioTexto);

  const idUsuario = Number(
    usuario?.id ??
      usuario?.Id ??
      0
  );

  if (idUsuario <= 0) {
    throw new Error(
      "No se pudo determinar el distribuidor autenticado."
    );
  }

  const response = await fetch(
    `${API_URL}/Pago/Agregar`,
    {
      method: "POST",
      headers: await obtenerHeaders(),
      body: JSON.stringify({
        idPedido: datos.idPedido,
        idUsuario,
        idTipoPago: datos.idTipoPago,
        montoPagado: datos.montoPagado,
      }),
    }
  );

  return await leer<any>(response);
}

export async function listarPagosRegistrados(): Promise<
  PagoDistribuidor[]
> {
  const usuarioTexto =
    await AsyncStorage.getItem("usuario");

  if (!usuarioTexto) {
    return [];
  }

  const usuario = JSON.parse(usuarioTexto);

  const idUsuario = Number(
    usuario?.id ??
      usuario?.Id ??
      0
  );

  if (idUsuario <= 0) {
    return [];
  }

  const response = await fetch(
    `${API_URL}/Pago/Usuario/${idUsuario}`,
    {
      method: "GET",
      headers: await obtenerHeaders(),
    }
  );

  const resultado = await leer<any[]>(response);

  return Array.isArray(resultado)
    ? resultado.map((pago) => ({
        id: Number(
          pago?.id ??
            pago?.Id ??
            pago?.idPago ??
            pago?.IdPago ??
            0
        ),
        idPedido: Number(
          pago?.idPedido ??
            pago?.IdPedido ??
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
          pago?.estadoPago ??
          pago?.EstadoPago ??
          pago?.estado ??
          pago?.Estado ??
          "",
      }))
    : [];
}

export async function obtenerPerfil(): Promise<PerfilDistribuidor> {
  const usuarioTexto = await AsyncStorage.getItem("usuario");
  const usuarioGuardado = usuarioTexto ? JSON.parse(usuarioTexto) : {};
  const id = Number(usuarioGuardado?.id ?? usuarioGuardado?.Id ?? 0);

  if (id > 0) {
    try {
      const response = await fetch(`${API_URL}/Usuarios/${id}`, {
        method: "GET",
        headers: await obtenerHeaders(),
      });

      if (response.ok) {
        const resultado = await leer<any>(response);

        const perfilNormalizado: PerfilDistribuidor = {
          id: Number(resultado?.id ?? resultado?.Id ?? id),
          nombre:
            resultado?.nombre ??
            resultado?.Nombre ??
            usuarioGuardado?.nombre ??
            "",
          email:
            resultado?.email ??
            resultado?.Email ??
            usuarioGuardado?.email ??
            "",
          numero:
            resultado?.numero ??
            resultado?.Numero ??
            resultado?.telefono ??
            resultado?.Telefono ??
            "",
          telefono:
            resultado?.telefono ??
            resultado?.Telefono ??
            resultado?.numero ??
            resultado?.Numero ??
            "",
          estado:
            resultado?.estado ??
            resultado?.Estado ??
            "Activo",
          idRol: Number(
            resultado?.idRol ??
              resultado?.IdRol ??
              usuarioGuardado?.idRol ??
              0
          ),
          rol:
            resultado?.rol ??
            resultado?.Rol ??
            usuarioGuardado?.rol ??
            "Distribuidor",
        };

        // Guardar el número / teléfono en AsyncStorage para que quede sincronizado
        await AsyncStorage.setItem(
          "usuario",
          JSON.stringify({
            ...usuarioGuardado,
            nombre: perfilNormalizado.nombre,
            email: perfilNormalizado.email,
            numero: perfilNormalizado.numero,
            telefono: perfilNormalizado.telefono,
            idRol: perfilNormalizado.idRol,
            rol: perfilNormalizado.rol,
          })
        );

        return perfilNormalizado;
      }
    } catch (e) {
      console.error("Error al obtener perfil de usuario:", e);
    }
  }

  return {
    id: Number(usuarioGuardado?.id ?? usuarioGuardado?.Id ?? 0),
    nombre: usuarioGuardado?.nombre ?? usuarioGuardado?.Nombre ?? "",
    email: usuarioGuardado?.email ?? usuarioGuardado?.Email ?? "",
    numero:
      usuarioGuardado?.numero ??
      usuarioGuardado?.Numero ??
      usuarioGuardado?.telefono ??
      usuarioGuardado?.Telefono ??
      "",
    telefono:
      usuarioGuardado?.telefono ??
      usuarioGuardado?.Telefono ??
      usuarioGuardado?.numero ??
      usuarioGuardado?.Numero ??
      "",
    idRol: Number(usuarioGuardado?.idRol ?? usuarioGuardado?.IdRol ?? 0),
    rol: usuarioGuardado?.rol ?? usuarioGuardado?.Rol ?? "Distribuidor",
  };
}

export async function actualizarPerfil(datos: {
  id?: number;
  nombre: string;
  email: string;
  telefono?: string;
  numero?: string;
  idRol?: number;
  contrasena?: string;
}) {
  const usuarioTexto = await AsyncStorage.getItem("usuario");
  const usuarioActual = usuarioTexto ? JSON.parse(usuarioTexto) : {};
  const id = datos.id || Number(usuarioActual?.id ?? usuarioActual?.Id ?? 0);
  const idRol =
    datos.idRol || Number(usuarioActual?.idRol ?? usuarioActual?.IdRol ?? 2);

  const body = {
    nombre: datos.nombre.trim(),
    telefono: (datos.telefono || datos.numero || "").trim(),
    email: datos.email.trim(),
    idRol: idRol,
    contrasena: datos.contrasena?.trim() || undefined,
  };

  const response = await fetch(`${API_URL}/Usuarios/Modificar/${id}`, {
    method: "PUT",
    headers: await obtenerHeaders(),
    body: JSON.stringify(body),
  });

  const resultado = await leer<any>(response);

  if (usuarioTexto) {
    await AsyncStorage.setItem(
      "usuario",
      JSON.stringify({
        ...usuarioActual,
        nombre:
          resultado?.usuario?.nombre ??
          resultado?.nombre ??
          datos.nombre,
        email:
          resultado?.usuario?.email ??
          resultado?.email ??
          datos.email,
        numero:
          resultado?.usuario?.numero ??
          resultado?.numero ??
          body.telefono,
        telefono:
          resultado?.usuario?.numero ??
          resultado?.numero ??
          body.telefono,
      })
    );
  }

  return resultado;
}

