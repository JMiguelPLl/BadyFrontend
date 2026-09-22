import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from "@react-native-picker/picker";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Platform,
  Pressable,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  crearPedido,
  listarProductosDisponibles,
} from "../../services/PedidosService";
import { resolverUrlImagen } from "../../services/productoService";
import { listarSucursalesCliente } from "../../services/sucursalService";

const ROJO = "#C62828";
const ROJO_OSCURO = "#A91E1E";
const VERDE = "#1F8A4C";
const BLANCO = "#FFFFFF";
const FONDO = "#F4F5F7";


type Producto = {
  id: number;
  nombre: string;
  descripcion: string;
  stock: number;
  precio: number;
  estado: string;
  imagen?: string | null;
  imagenUrl?: string | null;
};

function ImagenProductoCatalogo({ imagenUrl }: { imagenUrl?: string | null }) {
  const { colors, isDark } = useAppTheme();
  const [errorCarga, setErrorCarga] = useState(false);

  if (imagenUrl && !errorCarga) {
    return (
      <View
        style={[
          styles.productoImagenContainer,
          isDark && {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        <Image
          source={{ uri: imagenUrl }}
          style={styles.productoImagen}
          resizeMode="cover"
          onError={() => setErrorCarga(true)}
        />
      </View>
    );
  }

  return (
    <View
      style={[
        styles.productoIcono,
        isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
      ]}
    >
      <Ionicons name="cube-outline" size={26} color={colors.primary} />
    </View>
  );
}

type Sucursal = {
  id: number;
  idCliente: number;
  nombre: string;
  descripcion?: string;
  ubicacion?: string;
  estado: string;
};

type UsuarioSesion = {
  id?: number;
  idCliente?: number;
  nombre?: string;
  email?: string;
  rol?: string;
  tipoCuenta?: string;
  token?: string;
};

type CantidadesSeleccionadas = Record<number, number>;

export default function CrearPedidoScreen() {
  const router = useRouter();
  const { colors, isDark } = useAppTheme();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [cantidades, setCantidades] = useState<CantidadesSeleccionadas>({});

  const [busqueda, setBusqueda] = useState("");
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");
  const [guardandoPedido, setGuardandoPedido] = useState(false);
  const [observacion, setObservacion] = useState("");

  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [nombreCliente, setNombreCliente] = useState("");
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [idSucursalSeleccionada, setIdSucursalSeleccionada] =
    useState<number | null>(null);
  const [cargandoSucursales, setCargandoSucursales] = useState(true);
  const [errorSucursales, setErrorSucursales] = useState("");

  useEffect(() => {
    inicializarPantalla();
  }, []);

  const inicializarPantalla = async () => {
    await Promise.all([
      cargarProductos(),
      cargarDatosClienteYSucursales(),
    ]);
  };

  const obtenerToken = async () => {
    return await AsyncStorage.getItem("token");
  };

  const cargarProductos = async (esActualizacion = false) => {
    try {
      setError("");

      if (esActualizacion) {
        setActualizando(true);
      } else {
        setCargando(true);
      }

      const productosRecibidos = await listarProductosDisponibles();
      setProductos(productosRecibidos);

      setCantidades((cantidadesAnteriores) => {
        const cantidadesCorregidas: CantidadesSeleccionadas = {};

        productosRecibidos.forEach((producto) => {
          const cantidadAnterior =
            cantidadesAnteriores[producto.id] ?? 0;

          if (cantidadAnterior > 0) {
            cantidadesCorregidas[producto.id] = Math.min(
              cantidadAnterior,
              producto.stock
            );
          }
        });

        return cantidadesCorregidas;
      });
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al cargar los productos.";

      setError(mensaje);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return productos;
    }

    return productos.filter(
      (producto) =>
        producto.nombre.toLowerCase().includes(texto) ||
        producto.descripcion.toLowerCase().includes(texto)
    );
  }, [productos, busqueda]);

  const productosSeleccionados = useMemo(() => {
    return productos
      .filter((producto) => (cantidades[producto.id] ?? 0) > 0)
      .map((producto) => {
        const cantidad = cantidades[producto.id] ?? 0;

        return {
          ...producto,
          cantidad,
          subtotal: cantidad * Number(producto.precio),
        };
      });
  }, [productos, cantidades]);

  const cantidadTotal = useMemo(() => {
    return productosSeleccionados.reduce(
      (total, producto) => total + producto.cantidad,
      0
    );
  }, [productosSeleccionados]);

  const totalPedido = useMemo(() => {
    return productosSeleccionados.reduce(
      (total, producto) => total + producto.subtotal,
      0
    );
  }, [productosSeleccionados]);

  const aumentarCantidad = (producto: Producto) => {
    setCantidades((cantidadesAnteriores) => {
      const cantidadActual =
        cantidadesAnteriores[producto.id] ?? 0;

      if (cantidadActual >= producto.stock) {
        Alert.alert(
          "Stock insuficiente",
          `Solo hay ${producto.stock} unidades disponibles de ${producto.nombre}.`
        );

        return cantidadesAnteriores;
      }

      return {
        ...cantidadesAnteriores,
        [producto.id]: cantidadActual + 1,
      };
    });
  };

  const disminuirCantidad = (productoId: number) => {
    setCantidades((cantidadesAnteriores) => {
      const cantidadActual =
        cantidadesAnteriores[productoId] ?? 0;

      if (cantidadActual <= 1) {
        const nuevasCantidades = {
          ...cantidadesAnteriores,
        };

        delete nuevasCantidades[productoId];

        return nuevasCantidades;
      }

      return {
        ...cantidadesAnteriores,
        [productoId]: cantidadActual - 1,
      };
    });
  };

  const quitarProducto = (productoId: number) => {
    setCantidades((cantidadesAnteriores) => {
      const nuevasCantidades = { ...cantidadesAnteriores };
      delete nuevasCantidades[productoId];
      return nuevasCantidades;
    });
  };

  const cambiarCantidadEscrita = (producto: Producto, texto: string) => {
    const soloNumeros = texto.replace(/[^0-9]/g, "");

    if (soloNumeros === "") {
      quitarProducto(producto.id);
      return;
    }

    const cantidadIngresada = Number(soloNumeros);

    if (cantidadIngresada <= 0) {
      quitarProducto(producto.id);
      return;
    }

    if (cantidadIngresada > producto.stock) {
      setCantidades((cantidadesAnteriores) => ({
        ...cantidadesAnteriores,
        [producto.id]: producto.stock,
      }));

      Alert.alert(
        "Stock insuficiente",
        `Solo hay ${producto.stock} unidades disponibles de ${producto.nombre}.`
      );
      return;
    }

    setCantidades((cantidadesAnteriores) => ({
      ...cantidadesAnteriores,
      [producto.id]: cantidadIngresada,
    }));
  };

  const cargarDatosClienteYSucursales = async () => {
    try {
      setCargandoSucursales(true);
      setErrorSucursales("");

      const usuarioGuardado = await AsyncStorage.getItem("usuario");

      if (!usuarioGuardado) {
        throw new Error(
          "No se encontraron los datos del cliente. Vuelve a iniciar sesión."
        );
      }

      const usuario: UsuarioSesion = JSON.parse(usuarioGuardado);
      const clienteId = Number(usuario.idCliente ?? usuario.id);

      if (!Number.isInteger(clienteId) || clienteId <= 0) {
        throw new Error(
          "La sesión no contiene un identificador de cliente válido."
        );
      }

      setIdCliente(clienteId);
      setNombreCliente(usuario.nombre ?? "Cliente");

      const respuesta = await listarSucursalesCliente(clienteId);
      const sucursalesActivas = (Array.isArray(respuesta) ? respuesta : [])
        .filter(
          (sucursal) =>
            sucursal.estado?.toLowerCase() === "activo"
        );

      setSucursales(sucursalesActivas);

      if (sucursalesActivas.length === 1) {
        setIdSucursalSeleccionada(sucursalesActivas[0].id);
      } else {
        setIdSucursalSeleccionada(null);
      }
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las sucursales.";

      setErrorSucursales(mensaje);
      setSucursales([]);
      setIdSucursalSeleccionada(null);
    } finally {
      setCargandoSucursales(false);
    }
  };

  const registrarPedido = async () => {
    if (guardandoPedido) {
      return;
    }

    if (productosSeleccionados.length === 0) {
      Alert.alert(
        "Pedido vacío",
        "Selecciona al menos un producto."
      );
      return;
    }

    try {
      setGuardandoPedido(true);

      const token = await obtenerToken();

      if (!token) {
        Alert.alert(
          "Sesión no válida",
          "No se encontró el token de autenticación. Vuelve a iniciar sesión."
        );
        return;
      }

      if (!idCliente) {
        Alert.alert(
          "Cliente no identificado",
          "No se pudo identificar al cliente de la sesión."
        );
        return;
      }

      if (!idSucursalSeleccionada) {
        Alert.alert(
          "Selecciona una sucursal",
          "Debes seleccionar la sucursal donde se entregará el pedido."
        );
        return;
      }

      const pedido = {
        idCliente,
        idSucursal: idSucursalSeleccionada,
        observacion: observacion.trim() ? observacion.trim() : null,
        detalles: productosSeleccionados.map((producto) => ({
          idProducto: producto.id,
          cantidad: producto.cantidad,
        })),
      };

      const respuesta = await crearPedido(pedido);

      setCantidades({});
      setObservacion("");
      await cargarProductos(true);

      const mensajeExito =
        respuesta?.message ??
        "Tu pedido fue registrado exitosamente y está pendiente de atención.";

      if (Platform.OS === "web") {
        window.alert(`Pedido creado\n\n${mensajeExito}`);
        router.replace("/cliente/pedidos");
      } else {
        Alert.alert(
          "Pedido creado",
          mensajeExito,
          [
            {
              text: "Ver mis pedidos",
              onPress: () => {
                router.replace("/cliente/pedidos");
              },
            },
          ],
          {
            cancelable: false,
            onDismiss: () => {
              router.replace("/cliente/pedidos");
            },
          }
        );
      }
    } catch (error) {
      Alert.alert(
        "No se pudo crear el pedido",
        error instanceof Error
          ? error.message
          : "Ocurrió un error inesperado."
      );
    } finally {
      setGuardandoPedido(false);
    }
  };

  const confirmarPedido = () => {
    if (!idSucursalSeleccionada) {
      Alert.alert(
        "Selecciona una sucursal",
        "Antes de crear el pedido debes seleccionar una sucursal."
      );
      return;
    }

    if (productosSeleccionados.length === 0) {
      Alert.alert(
        "Pedido vacío",
        "Selecciona al menos un producto."
      );
      return;
    }

    Alert.alert(
      "Confirmar pedido",
      `Registrarás ${cantidadTotal} ${
        cantidadTotal === 1 ? "unidad" : "unidades"
      } por un total de Bs ${formatearPrecio(totalPedido)}.`,
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Crear pedido",
          onPress: registrarPedido,
        },
      ]
    );
  };

  const renderizarProducto = ({
    item,
  }: {
    item: Producto;
  }) => {
    const cantidad = cantidades[item.id] ?? 0;
    const estaSeleccionado = cantidad > 0;
    const subtotal = cantidad * Number(item.precio);

    return (
      <View
        style={[
          styles.productoCard,
          isDark && {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
          estaSeleccionado && [
            styles.productoSeleccionado,
            isDark && {
              borderColor: "rgba(200, 35, 27, 0.4)",
              backgroundColor: "rgba(200, 35, 27, 0.08)",
            },
          ],
        ]}
      >
        <ImagenProductoCatalogo imagenUrl={item.imagenUrl} />

        <View style={styles.productoInformacion}>
          <View style={styles.productoTituloFila}>
            <Text
              style={[
                styles.productoNombre,
                isDark && { color: colors.text },
              ]}
              numberOfLines={2}
            >
              {item.nombre}
            </Text>

            {!!item.descripcion?.trim() && (
              <View
                style={[
                  styles.productoPresentacion,
                  isDark && {
                    backgroundColor: "rgba(200, 35, 27, 0.22)",
                    borderColor: "rgba(200, 35, 27, 0.35)",
                  },
                ]}
              >
                <Text
                  style={[
                    styles.productoPresentacionTexto,
                    { color: colors.primary },
                  ]}
                  numberOfLines={1}
                >
                  {item.descripcion}
                </Text>
              </View>
            )}
          </View>

          <View style={styles.productoDatos}>
            <Text
              style={[
                styles.productoPrecio,
                { color: isDark ? "#4ade80" : VERDE },
              ]}
            >
              Bs {formatearPrecio(item.precio)}
            </Text>

            <View style={styles.stockContainer}>
              <Ionicons
                name="layers-outline"
                size={14}
                color={isDark ? colors.textSecondary : "#6D6D6D"}
              />

              <Text
                style={[
                  styles.productoStock,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Stock: {item.stock}
              </Text>
            </View>
          </View>

          {estaSeleccionado && (
            <View style={styles.subtotalContainer}>
              <Ionicons
                name="calculator-outline"
                size={14}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.subtotalTexto,
                  { color: colors.primary },
                ]}
              >
                Subtotal: Bs {formatearPrecio(subtotal)}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.contador}>
          <Pressable
            style={[
              styles.botonCantidad,
              isDark && {
                backgroundColor: "rgba(200, 35, 27, 0.18)",
                borderColor: "rgba(200, 35, 27, 0.35)",
              },
              cantidad === 0 && [
                styles.botonCantidadDeshabilitado,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ],
            ]}
            onPress={() => disminuirCantidad(item.id)}
            disabled={cantidad === 0}
          >
            <Ionicons
              name="remove"
              size={21}
              color={
                cantidad === 0
                  ? isDark
                    ? colors.textMuted
                    : "#B4B4B4"
                  : colors.primary
              }
            />
          </Pressable>

          <TextInput
            style={[
              styles.cantidadInput,
              isDark && {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
                color: colors.text,
              },
            ]}
            value={String(cantidad)}
            onChangeText={(texto) => cambiarCantidadEscrita(item, texto)}
            keyboardType="number-pad"
            inputMode="numeric"
            selectTextOnFocus
            maxLength={Math.max(2, String(item.stock).length + 1)}
            textAlign="center"
          />

          <Pressable
            style={[
              styles.botonCantidad,
              isDark && {
                backgroundColor: "rgba(200, 35, 27, 0.18)",
                borderColor: "rgba(200, 35, 27, 0.35)",
              },
              cantidad >= item.stock && [
                styles.botonCantidadDeshabilitado,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ],
            ]}
            onPress={() => aumentarCantidad(item)}
            disabled={cantidad >= item.stock}
          >
            <Ionicons
              name="add"
              size={21}
              color={
                cantidad >= item.stock
                  ? isDark
                    ? colors.textMuted
                    : "#B4B4B4"
                  : colors.primary
              }
            />
          </Pressable>
        </View>
      </View>
    );
  };

  if (cargando) {
    return (
      <SafeAreaView
        style={[
          styles.cargandoContainer,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            styles.cargandoTexto,
            isDark && { color: colors.textSecondary },
          ]}
        >
          Cargando productos...
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.pantalla,
        { backgroundColor: colors.background },
      ]}
    >
      <FlatList
        data={productosFiltrados}
        keyExtractor={(producto) => producto.id.toString()}
        renderItem={renderizarProducto}
        contentContainerStyle={styles.listaContenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={() => cargarProductos(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
        ListHeaderComponent={
          <>
            <View style={styles.encabezado}>
              <View>
                <Text
                  style={[
                    styles.titulo,
                    isDark && { color: colors.text },
                  ]}
                >
                  Crear pedido
                </Text>
                <Text
                  style={[
                    styles.subtitulo,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Selecciona los productos que deseas
                </Text>
              </View>

              <View
                style={[
                  styles.carritoIcono,
                  isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                ]}
              >
                <Ionicons
                  name="cart-outline"
                  size={25}
                  color={colors.primary}
                />
                {cantidadTotal > 0 && (
                  <View
                    style={[
                      styles.carritoContador,
                      { backgroundColor: colors.primary, borderColor: colors.background },
                    ]}
                  >
                    <Text style={styles.carritoContadorTexto}>
                      {cantidadTotal > 99 ? "99+" : cantidadTotal}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            <View
              style={[
                styles.sucursalCard,
                isDark && {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                },
              ]}
            >
              <View style={styles.sucursalEncabezado}>
                <View style={styles.sucursalTituloContainer}>
                  <Ionicons
                    name="location-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <View>
                    <Text
                      style={[
                        styles.sucursalTitulo,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Sucursal de entrega
                    </Text>
                    <Text
                      style={[
                        styles.sucursalCliente,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Cliente: {nombreCliente || "Cargando..."}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.botonActualizarSucursales,
                    isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                  ]}
                  onPress={cargarDatosClienteYSucursales}
                  disabled={cargandoSucursales}
                >
                  {cargandoSucursales ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : (
                    <Ionicons name="refresh" size={19} color={colors.primary} />
                  )}
                </Pressable>
              </View>

              {cargandoSucursales ? (
                <View style={styles.sucursalCargando}>
                  <ActivityIndicator size="small" color={colors.primary} />
                  <Text
                    style={[
                      styles.sucursalCargandoTexto,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Cargando sucursales...
                  </Text>
                </View>
              ) : errorSucursales ? (
                <View
                  style={[
                    styles.sucursalError,
                    isDark && {
                      backgroundColor: colors.dangerBg,
                      borderColor: colors.dangerBorder,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="alert-circle-outline"
                    size={20}
                    color={colors.dangerText}
                  />
                  <Text
                    style={[
                      styles.sucursalErrorTexto,
                      { color: colors.dangerText },
                    ]}
                  >
                    {errorSucursales}
                  </Text>
                </View>
              ) : sucursales.length === 0 ? (
                <View
                  style={[
                    styles.sucursalError,
                    isDark && {
                      backgroundColor: colors.dangerBg,
                      borderColor: colors.dangerBorder,
                      borderWidth: 1,
                    },
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={colors.dangerText}
                  />
                  <Text
                    style={[
                      styles.sucursalErrorTexto,
                      { color: colors.dangerText },
                    ]}
                  >
                    No tienes sucursales activas registradas.
                  </Text>
                </View>
              ) : (
                <View
                  style={[
                    styles.pickerContainer,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={idSucursalSeleccionada ?? ""}
                    onValueChange={(valor) =>
                      setIdSucursalSeleccionada(
                        valor === "" ? null : Number(valor)
                      )
                    }
                    style={[
                      styles.picker,
                      isDark && { color: colors.text },
                    ]}
                    dropdownIconColor={colors.textSecondary}
                  >
                    <Picker.Item
                      label="Selecciona una sucursal"
                      value=""
                      color={colors.inputPlaceholder}
                    />
                    {sucursales.map((sucursal) => (
                      <Picker.Item
                        key={sucursal.id}
                        label={`${sucursal.nombre}${
                          sucursal.ubicacion
                            ? ` - ${sucursal.ubicacion}`
                            : ""
                        }`}
                        value={sucursal.id}
                      />
                    ))}
                  </Picker>
                </View>
              )}

              {!!idSucursalSeleccionada && (
                <View style={styles.sucursalSeleccionadaInfo}>
                  <Ionicons
                    name="checkmark-circle"
                    size={17}
                    color={isDark ? "#4ade80" : VERDE}
                  />
                  <Text
                    style={[
                      styles.sucursalSeleccionadaTexto,
                      { color: isDark ? "#4ade80" : VERDE },
                    ]}
                  >
                    {sucursales.find(
                      (sucursal) =>
                        sucursal.id === idSucursalSeleccionada
                    )?.nombre ?? "Sucursal seleccionada"}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.resumenCard,
                isDark && {
                  backgroundColor: colors.card,
                  borderColor: colors.border,
                  borderWidth: 1,
                },
              ]}
            >
              <View style={styles.resumenEncabezado}>
                <View style={styles.resumenTituloContainer}>
                  <Ionicons
                    name="receipt-outline"
                    size={22}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.resumenTitulo,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Tu pedido
                  </Text>
                </View>
              </View>

              {productosSeleccionados.length === 0 ? (
                <View style={styles.pedidoVacio}>
                  <Ionicons
                    name="basket-outline"
                    size={35}
                    color={colors.textMuted}
                  />
                  <Text
                    style={[
                      styles.pedidoVacioTitulo,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Todavía no seleccionaste productos
                  </Text>
                  <Text
                    style={[
                      styles.pedidoVacioTexto,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    Utiliza los botones + para agregarlos.
                  </Text>
                </View>
              ) : (
                <>
                  <View style={styles.resumenProductos}>
                    {productosSeleccionados.map((producto) => (
                      <View
                        key={producto.id}
                        style={[
                          styles.resumenFila,
                          isDark && { borderBottomColor: colors.borderLight },
                        ]}
                      >
                        <View style={styles.resumenNombreContainer}>
                          <View style={styles.resumenNombreFila}>
                            <Text
                              style={[
                                styles.resumenNombre,
                                isDark && { color: colors.text },
                              ]}
                              numberOfLines={1}
                            >
                              {producto.nombre}
                            </Text>

                            {!!producto.descripcion?.trim() && (
                              <View
                                style={[
                                  styles.resumenPresentacion,
                                  isDark && {
                                    backgroundColor: "rgba(200, 35, 27, 0.22)",
                                  },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.resumenPresentacionTexto,
                                    { color: colors.primary },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {producto.descripcion}
                                </Text>
                              </View>
                            )}
                          </View>

                          <Text
                            style={[
                              styles.resumenCantidad,
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            {producto.cantidad} × Bs {formatearPrecio(producto.precio)}
                          </Text>
                        </View>

                        <View style={styles.resumenAcciones}>
                          <Text
                            style={[
                              styles.resumenSubtotal,
                              isDark && { color: colors.text },
                            ]}
                          >
                            Bs {formatearPrecio(producto.subtotal)}
                          </Text>

                          <Pressable
                            style={[
                              styles.botonQuitar,
                              isDark && {
                                backgroundColor: "rgba(200, 35, 27, 0.18)",
                                borderColor: "rgba(200, 35, 27, 0.35)",
                              },
                            ]}
                            onPress={() => quitarProducto(producto.id)}
                          >
                            <Ionicons name="trash-outline" size={15} color={colors.primary} />
                            <Text
                              style={[
                                styles.botonQuitarTexto,
                                { color: colors.primary },
                              ]}
                            >
                              Quitar
                            </Text>
                          </Pressable>
                        </View>
                      </View>
                    ))}
                  </View>

                  {/* Observación de Entrega (Opcional) */}
                  <View style={styles.observacionContainer}>
                    <View style={styles.observacionHeader}>
                      <Ionicons
                        name="chatbox-ellipses-outline"
                        size={17}
                        color={colors.primary}
                      />
                      <Text
                        style={[
                          styles.observacionLabel,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Observación de entrega (opcional)
                      </Text>
                    </View>
                    <TextInput
                      style={[
                        styles.observacionInput,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                          color: colors.text,
                        },
                      ]}
                      placeholder="Ej: Dejar en portería, timbre averiado..."
                      placeholderTextColor={colors.inputPlaceholder}
                      value={observacion}
                      onChangeText={setObservacion}
                      multiline
                      numberOfLines={2}
                    />
                  </View>

                  <View
                    style={[
                      styles.separador,
                      isDark && { backgroundColor: colors.borderLight },
                    ]}
                  />

                  <View style={styles.totalFila}>
                    <View>
                      <Text
                        style={[
                          styles.totalEtiqueta,
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Total del pedido
                      </Text>
                      <Text
                        style={[
                          styles.totalUnidades,
                          isDark && { color: colors.textMuted },
                        ]}
                      >
                        {cantidadTotal} {cantidadTotal === 1 ? "unidad" : "unidades"}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.totalPrecio,
                        { color: colors.primary },
                      ]}
                    >
                      Bs {formatearPrecio(totalPedido)}
                    </Text>
                  </View>

                  <Pressable
                    style={[
                      styles.botonConfirmar,
                      { backgroundColor: colors.primary },
                      (guardandoPedido || !idSucursalSeleccionada) &&
                        styles.botonConfirmarDeshabilitado,
                    ]}
                    onPress={confirmarPedido}
                    disabled={guardandoPedido || !idSucursalSeleccionada}
                  >
                    {guardandoPedido ? (
                      <ActivityIndicator size="small" color={BLANCO} />
                    ) : (
                      <Ionicons
                        name="checkmark-circle-outline"
                        size={22}
                        color={BLANCO}
                      />
                    )}
                    <Text style={styles.botonConfirmarTexto}>
                      {guardandoPedido
                        ? "Registrando pedido..."
                        : "Confirmar pedido"}
                    </Text>
                  </Pressable>
                </>
              )}
            </View>

            <View
              style={[
                styles.buscadorContainer,
                isDark && {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                },
              ]}
            >
              <Ionicons
                name="search-outline"
                size={21}
                color={colors.inputPlaceholder}
              />
              <TextInput
                style={[
                  styles.buscadorInput,
                  isDark && { color: colors.text },
                ]}
                value={busqueda}
                onChangeText={setBusqueda}
                placeholder="Buscar producto..."
                placeholderTextColor={colors.inputPlaceholder}
                autoCapitalize="none"
                returnKeyType="search"
              />
              {busqueda.length > 0 && (
                <Pressable onPress={() => setBusqueda("")}>
                  <Ionicons
                    name="close-circle"
                    size={21}
                    color={colors.inputPlaceholder}
                  />
                </Pressable>
              )}
            </View>

            <View style={styles.listaTituloContainer}>
              <Text
                style={[
                  styles.listaTitulo,
                  isDark && { color: colors.text },
                ]}
              >
                Productos disponibles
              </Text>
              <Text
                style={[
                  styles.listaCantidad,
                  isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                  { color: colors.primary },
                ]}
              >
                {productosFiltrados.length}
              </Text>
            </View>

            {error ? (
              <View
                style={[
                  styles.errorContainer,
                  isDark && {
                    backgroundColor: colors.dangerBg,
                    borderColor: colors.dangerBorder,
                    borderWidth: 1,
                  },
                ]}
              >
                <Ionicons
                  name="alert-circle-outline"
                  size={23}
                  color={colors.dangerText}
                />
                <View style={styles.errorInformacion}>
                  <Text
                    style={[
                      styles.errorTitulo,
                      { color: colors.dangerText },
                    ]}
                  >
                    No se pudieron cargar los productos
                  </Text>
                  <Text
                    style={[
                      styles.errorTexto,
                      { color: colors.dangerText },
                    ]}
                  >
                    {error}
                  </Text>
                </View>
                <Pressable
                  style={[
                    styles.botonReintentar,
                    isDark && { backgroundColor: colors.surfaceElevated },
                  ]}
                  onPress={() => cargarProductos()}
                >
                  <Ionicons name="refresh" size={20} color={colors.primary} />
                </Pressable>
              </View>
            ) : null}
          </>
        }
        ListEmptyComponent={
          !error ? (
            <View style={styles.sinResultados}>
              <Ionicons
                name="search-outline"
                size={45}
                color={colors.textMuted}
              />
              <Text
                style={[
                  styles.sinResultadosTitulo,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                No se encontraron productos
              </Text>
              <Text
                style={[
                  styles.sinResultadosTexto,
                  isDark && { color: colors.textMuted },
                ]}
              >
                Prueba escribiendo otro nombre.
              </Text>
            </View>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

function formatearPrecio(valor: number | string) {
  const numero = Number(valor);
  if (Number.isNaN(numero)) {
    return "0.00";
  }
  return numero.toFixed(2);
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: FONDO,
  },
  listaContenido: {
    padding: 18,
    paddingBottom: 110,
  },
  cargandoContainer: {
    flex: 1,
    backgroundColor: FONDO,
    justifyContent: "center",
    alignItems: "center",
  },
  cargandoTexto: {
    marginTop: 12,
    color: "#6D6D6D",
    fontSize: 15,
  },
  encabezado: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 18,
  },
  titulo: {
    fontSize: 27,
    fontWeight: "800",
    color: "#202020",
  },
  subtitulo: {
    marginTop: 3,
    fontSize: 14,
    color: "#747474",
  },
  carritoIcono: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: "#FBE7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  carritoContador: {
    position: "absolute",
    top: -5,
    right: -5,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 5,
    backgroundColor: ROJO,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: BLANCO,
  },
  carritoContadorTexto: {
    color: BLANCO,
    fontSize: 10,
    fontWeight: "800",
  },
  sucursalCard: {
    backgroundColor: BLANCO,
    borderRadius: 20,
    padding: 17,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E8E8E8",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  sucursalEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  sucursalTituloContainer: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  sucursalTitulo: {
    fontSize: 17,
    fontWeight: "800",
    color: "#282828",
  },
  sucursalCliente: {
    marginTop: 2,
    fontSize: 12,
    color: "#777777",
  },
  botonActualizarSucursales: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FBE7E7",
    alignItems: "center",
    justifyContent: "center",
  },
  sucursalCargando: {
    minHeight: 58,
    marginTop: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 9,
  },
  sucursalCargandoTexto: {
    color: "#777777",
    fontSize: 13,
  },
  sucursalError: {
    marginTop: 13,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#FCE8E8",
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  sucursalErrorTexto: {
    flex: 1,
    color: ROJO_OSCURO,
    fontSize: 12,
    lineHeight: 17,
  },
  pickerContainer: {
    marginTop: 13,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#DCDCDC",
    borderRadius: 13,
    backgroundColor: "#FAFAFA",
  },
  picker: {
    width: "100%",
    minHeight: 52,
    color: "#292929",
    backgroundColor: "transparent",
  },
  sucursalSeleccionadaInfo: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  sucursalSeleccionadaTexto: {
    flex: 1,
    color: VERDE,
    fontSize: 12,
    fontWeight: "700",
  },
  resumenCard: {
    backgroundColor: BLANCO,
    borderRadius: 20,
    padding: 17,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.07,
    shadowRadius: 8,
    elevation: 3,
  },
  resumenEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resumenTituloContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resumenTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#282828",
  },
  pedidoVacio: {
    alignItems: "center",
    paddingVertical: 22,
  },
  pedidoVacioTitulo: {
    marginTop: 9,
    fontSize: 14,
    fontWeight: "700",
    color: "#585858",
  },
  pedidoVacioTexto: {
    marginTop: 3,
    fontSize: 12,
    color: "#909090",
  },
  resumenProductos: {
    marginTop: 15,
    gap: 11,
  },
  resumenFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  resumenNombreContainer: {
    flex: 1,
  },
  resumenNombreFila: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 6,
  },
  resumenNombre: {
    flexShrink: 1,
    fontSize: 14,
    fontWeight: "700",
    color: "#333333",
  },
  resumenPresentacion: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 7,
    backgroundColor: "#FBE5E5",
  },
  resumenPresentacionTexto: {
    maxWidth: 70,
    color: ROJO,
    fontSize: 10,
    fontWeight: "800",
  },
  resumenCantidad: {
    marginTop: 4,
    fontSize: 12,
    color: "#7A7A7A",
  },
  resumenAcciones: {
    alignItems: "flex-end",
    gap: 6,
  },
  resumenSubtotal: {
    fontSize: 14,
    fontWeight: "800",
    color: "#333333",
  },
  botonQuitar: {
    minHeight: 28,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: "#FBE7E7",
    borderWidth: 1,
    borderColor: "#F0CACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  botonQuitarTexto: {
    color: ROJO,
    fontSize: 11,
    fontWeight: "800",
  },
  separador: {
    height: 1,
    backgroundColor: "#EBEBEB",
    marginVertical: 15,
  },
  totalFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalEtiqueta: {
    fontSize: 14,
    fontWeight: "700",
    color: "#555555",
  },
  totalUnidades: {
    marginTop: 2,
    fontSize: 12,
    color: "#858585",
  },
  totalPrecio: {
    fontSize: 23,
    fontWeight: "900",
    color: ROJO,
  },
  observacionContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  observacionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  observacionLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
  },
  observacionInput: {
    minHeight: 58,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: "#1F2329",
    backgroundColor: "#F9FAFB",
    textAlignVertical: "top",
  },
  botonConfirmar: {
    minHeight: 52,
    marginTop: 16,
    borderRadius: 15,
    backgroundColor: ROJO,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  botonConfirmarDeshabilitado: {
    opacity: 0.65,
  },
  botonConfirmarTexto: {
    color: BLANCO,
    fontSize: 15,
    fontWeight: "800",
  },
  buscadorContainer: {
    minHeight: 53,
    paddingHorizontal: 15,
    borderRadius: 16,
    backgroundColor: BLANCO,
    borderWidth: 1,
    borderColor: "#E6E6E6",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 18,
  },
  buscadorInput: {
    flex: 1,
    fontSize: 15,
    color: "#262626",
  },
  listaTituloContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
  },
  listaTitulo: {
    fontSize: 18,
    fontWeight: "800",
    color: "#282828",
  },
  listaCantidad: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    backgroundColor: "#F9DFDF",
    color: ROJO,
    textAlign: "center",
    lineHeight: 24,
    fontSize: 12,
    fontWeight: "800",
  },
  productoCard: {
    padding: 15,
    marginBottom: 12,
    borderRadius: 18,
    backgroundColor: BLANCO,
    borderWidth: 1,
    borderColor: "#EBEBEB",
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  productoSeleccionado: {
    borderColor: "#E8AAAA",
    backgroundColor: "#FFF9F9",
  },
  productoImagenContainer: {
    width: 52,
    height: 52,
    borderRadius: 15,
    overflow: "hidden",
    backgroundColor: "#FBE8E8",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "#F0CACA",
    alignItems: "center",
    justifyContent: "center",
  },
  productoImagen: {
    width: "100%",
    height: "100%",
  },
  productoIcono: {
    width: 52,
    height: 52,
    borderRadius: 15,
    backgroundColor: "#FBE8E8",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  productoInformacion: {
    flex: 1,
    marginRight: 10,
  },
  productoTituloFila: {
    flexDirection: "row",
    alignItems: "flex-start",
    flexWrap: "wrap",
    gap: 7,
  },
  productoNombre: {
    flexShrink: 1,
    fontSize: 15,
    lineHeight: 20,
    fontWeight: "800",
    color: "#272727",
  },
  productoPresentacion: {
    minHeight: 28,
    paddingHorizontal: 9,
    borderRadius: 9,
    backgroundColor: "#FBE5E5",
    borderWidth: 1,
    borderColor: "#F0CACA",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  productoPresentacionTexto: {
    maxWidth: 85,
    fontSize: 13,
    fontWeight: "900",
    color: ROJO,
  },
  productoDatos: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 11,
  },
  productoPrecio: {
    fontSize: 16,
    fontWeight: "900",
    color: VERDE,
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  productoStock: {
    fontSize: 11,
    color: "#6D6D6D",
  },
  subtotalContainer: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  subtotalTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: ROJO,
  },
  contador: {
    alignItems: "center",
    gap: 5,
  },
  botonCantidad: {
    width: 35,
    height: 35,
    borderRadius: 11,
    backgroundColor: "#F9E7E7",
    borderWidth: 1,
    borderColor: "#EDCACA",
    alignItems: "center",
    justifyContent: "center",
  },
  botonCantidadDeshabilitado: {
    backgroundColor: "#F1F1F1",
    borderColor: "#E7E7E7",
  },
  cantidadInput: {
    width: 44,
    height: 38,
    paddingHorizontal: 3,
    paddingVertical: 0,
    borderRadius: 10,
    backgroundColor: BLANCO,
    borderWidth: 1,
    borderColor: "#D9D9D9",
    textAlign: "center",
    fontSize: 16,
    fontWeight: "900",
    color: "#303030",
  },
  errorContainer: {
    padding: 14,
    marginBottom: 14,
    borderRadius: 15,
    backgroundColor: "#FCE8E8",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  errorInformacion: {
    flex: 1,
  },
  errorTitulo: {
    fontSize: 13,
    fontWeight: "800",
    color: ROJO_OSCURO,
  },
  errorTexto: {
    marginTop: 2,
    fontSize: 12,
    color: "#7C4B4B",
  },
  botonReintentar: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: BLANCO,
    alignItems: "center",
    justifyContent: "center",
  },
  sinResultados: {
    paddingVertical: 55,
    alignItems: "center",
  },
  sinResultadosTitulo: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: "800",
    color: "#555555",
  },
  sinResultadosTexto: {
    marginTop: 4,
    fontSize: 13,
    color: "#8A8A8A",
  },
});