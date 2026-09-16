import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import ModalSistema from "../../components/comun/ModalSistema";
import Paginacion from "../../components/comun/Paginacion";
import { useAppTheme } from "../../hooks/useAppTheme";
import { usePaginacion } from "../../hooks/usePaginacion";
import {
  actualizarProducto,
  cambiarEstadoProducto,
  crearProducto,
  listarProductos,
} from "../../services/productoService";
import { styles } from "../../styles/administrador/productos.styles";
import {
  Producto,
  ProductoFormulario,
  ProductoGuardar,
} from "../../types/producto";

const STOCK_MINIMO = 15;

type FiltroProducto =
  | "Todos"
  | "Activo"
  | "Inactivo"
  | "Disponible"
  | "Indisponible"
  | "PocoStock";

type TipoModal =
  | "ninguno"
  | "formulario"
  | "estado"
  | "mensaje"
  | "verImagen";

type TipoMensaje = "exito" | "error";

const formularioInicial: ProductoFormulario = {
  nombre: "",
  descripcion: "",
  stock: "",
  precio: "",
};

function MiniaturaProducto({
  imagenUrl,
  onPress,
}: {
  imagenUrl?: string | null;
  onPress?: () => void;
}) {
  const { isDark, colors } = useAppTheme();
  const [errorCarga, setErrorCarga] = useState(false);

  if (imagenUrl && !errorCarga) {
    return (
      <Pressable
        onPress={onPress}
        disabled={!onPress}
        style={[
          styles.imagenProductoContainer,
          isDark && {
            backgroundColor: colors.surfaceElevated,
            borderColor: colors.border,
          },
        ]}
      >
        <Image
          source={{ uri: imagenUrl }}
          style={styles.imagenProducto}
          resizeMode="cover"
          onError={() => setErrorCarga(true)}
        />
      </Pressable>
    );
  }

  return (
    <View
      style={[
        styles.iconoProducto,
        isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
      ]}
    >
      <Ionicons name="cube-outline" size={20} color={colors.primary} />
    </View>
  );
}

export default function ProductosAdministrador() {
  const { isDark, colors } = useAppTheme();
  const [productos, setProductos] = useState<Producto[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroProducto>("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [modalActivo, setModalActivo] = useState<TipoModal>("ninguno");
  const [productoSeleccionado, setProductoSeleccionado] =
    useState<Producto | null>(null);
  const [formulario, setFormulario] =
    useState<ProductoFormulario>(formularioInicial);

  // Estados para manejo de archivo de imagen
  const [archivoSeleccionado, setArchivoSeleccionado] = useState<any>(null);
  const [previewLocal, setPreviewLocal] = useState<string | null>(null);
  const [eliminarImagenActual, setEliminarImagenActual] = useState(false);

  const [errores, setErrores] = useState<
    Partial<Record<keyof ProductoFormulario, string>>
  >({});

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<TipoMensaje>("exito");

  useEffect(() => {
    cargarProductos();
  }, []);

  const cargarProductos = async () => {
    try {
      setCargando(true);
      const respuesta = await listarProductos();
      setProductos(Array.isArray(respuesta) ? respuesta : []);
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los productos.",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  const productosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return productos.filter((producto) => {
      const coincideBusqueda =
        !texto ||
        producto.nombre.toLowerCase().includes(texto) ||
        producto.descripcion.toLowerCase().includes(texto) ||
        producto.stock.toString().includes(texto) ||
        producto.precio.toString().includes(texto);

      let coincideFiltro = true;

      switch (filtro) {
        case "Activo":
          coincideFiltro = producto.estado === "Activo";
          break;

        case "Inactivo":
          coincideFiltro = producto.estado === "Inactivo";
          break;

        case "Disponible":
          coincideFiltro =
            producto.estado === "Activo" && producto.stock > 0;
          break;

        case "Indisponible":
          coincideFiltro = producto.stock === 0;
          break;

        case "PocoStock":
          coincideFiltro =
            producto.estado === "Activo" &&
            producto.stock > 0 &&
            producto.stock < STOCK_MINIMO;
          break;

        default:
          coincideFiltro = true;
      }

      return coincideBusqueda && coincideFiltro;
    });
  }, [productos, busqueda, filtro]);

  const {
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    setRegistrosPorPagina,
    totalPaginas,
    totalRegistros,
    datosPaginados: productosPaginados,
  } = usePaginacion(productosFiltrados);

  const totalActivos = useMemo(
    () =>
      productos.filter((producto) => producto.estado === "Activo").length,
    [productos]
  );

  const totalDisponibles = useMemo(
    () =>
      productos.filter(
        (producto) => producto.estado === "Activo" && producto.stock > 0
      ).length,
    [productos]
  );

  const totalIndisponibles = useMemo(
    () => productos.filter((producto) => producto.stock === 0).length,
    [productos]
  );

  const totalPocoStock = useMemo(
    () =>
      productos.filter(
        (producto) =>
          producto.estado === "Activo" &&
          producto.stock > 0 &&
          producto.stock < STOCK_MINIMO
      ).length,
    [productos]
  );

  const seleccionarArchivo = () => {
    if (Platform.OS === "web" && typeof document !== "undefined") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/png,image/jpeg,image/jpg,image/webp,image/gif";
      input.onchange = (e: any) => {
        const file = e.target.files?.[0];
        if (file) {
          if (file.size > 10 * 1024 * 1024) {
            mostrarMensaje("La imagen no debe superar los 10 MB.", "error");
            return;
          }
          setArchivoSeleccionado(file);
          setPreviewLocal(URL.createObjectURL(file));
          setEliminarImagenActual(false);
        }
      };
      input.click();
    }
  };

  const handleQuitarImagen = () => {
    setArchivoSeleccionado(null);
    setPreviewLocal(null);
    setEliminarImagenActual(true);
  };

  const abrirAgregar = () => {
    setProductoSeleccionado(null);
    setFormulario(formularioInicial);
    setArchivoSeleccionado(null);
    setPreviewLocal(null);
    setEliminarImagenActual(false);
    setErrores({});
    setModalActivo("formulario");
  };

  const abrirEditar = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setFormulario({
      nombre: producto.nombre,
      descripcion: producto.descripcion,
      stock: producto.stock.toString(),
      precio: producto.precio.toString(),
      imagen: producto.imagen,
      imagenUrl: producto.imagenUrl,
    });
    setArchivoSeleccionado(null);
    setPreviewLocal(null);
    setEliminarImagenActual(false);
    setErrores({});
    setModalActivo("formulario");
  };

  const abrirVerImagen = (producto: Producto) => {
    if (producto.imagenUrl) {
      setProductoSeleccionado(producto);
      setModalActivo("verImagen");
    }
  };

  const abrirCambiarEstado = (producto: Producto) => {
    setProductoSeleccionado(producto);
    setModalActivo("estado");
  };

  const cerrarModal = () => {
    if (procesando) return;

    setModalActivo("ninguno");
    setProductoSeleccionado(null);
    setArchivoSeleccionado(null);
    setPreviewLocal(null);
    setEliminarImagenActual(false);
    setErrores({});
  };

  const mostrarMensaje = (texto: string, tipo: TipoMensaje) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setModalActivo("mensaje");
  };

  const actualizarCampo = (
    campo: keyof ProductoFormulario,
    valor: string
  ) => {
    setFormulario((actual) => ({
      ...actual,
      [campo]: valor,
    }));

    if (errores[campo]) {
      setErrores((actual) => ({
        ...actual,
        [campo]: undefined,
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Partial<Record<keyof ProductoFormulario, string>> = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre del producto es obligatorio.";
    }

    if (!formulario.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es obligatoria.";
    }

    if (!formulario.stock.trim()) {
      nuevosErrores.stock = "El stock es obligatorio.";
    } else {
      const stockNumero = Number(formulario.stock);
      if (Number.isNaN(stockNumero) || stockNumero < 0) {
        nuevosErrores.stock = "El stock debe ser un número válido.";
      }
    }

    if (!formulario.precio.trim()) {
      nuevosErrores.precio = "El precio es obligatorio.";
    } else {
      const precioNormalizado = formulario.precio.replace(",", ".");
      const precioNumero = Number(precioNormalizado);

      if (Number.isNaN(precioNumero) || precioNumero <= 0) {
        nuevosErrores.precio = "El precio debe ser un número mayor a 0.";
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarProducto = async () => {
    if (!validarFormulario()) return;

    try {
      setProcesando(true);

      const precioNormalizado = formulario.precio.replace(",", ".");
      const datos: ProductoGuardar = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        stock: Number(formulario.stock),
        precio: Number(precioNormalizado),
      };

      let respuesta;

      if (productoSeleccionado) {
        respuesta = await actualizarProducto(
          productoSeleccionado.id,
          datos,
          archivoSeleccionado,
          eliminarImagenActual
        );
      } else {
        respuesta = await crearProducto(datos, archivoSeleccionado);
      }

      await cargarProductos();
      cerrarModal();

      mostrarMensaje(
        respuesta.message ||
          (productoSeleccionado
            ? "Producto actualizado correctamente."
            : "Producto creado correctamente."),
        "exito"
      );
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el producto.",
        "error"
      );
    } finally {
      setProcesando(false);
    }
  };

  const confirmarCambioEstado = async () => {
    if (!productoSeleccionado) return;

    try {
      setProcesando(true);
      const respuesta = await cambiarEstadoProducto(
        productoSeleccionado.id
      );

      await cargarProductos();
      cerrarModal();

      mostrarMensaje(
        respuesta.message ||
          `El producto fue ${
            productoSeleccionado.estado === "Activo"
              ? "desactivado"
              : "activado"
          } correctamente.`,
        "exito"
      );
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado del producto.",
        "error"
      );
    } finally {
      setProcesando(false);
    }
  };

  const seleccionarFiltro = (nuevoFiltro: FiltroProducto) => {
    setFiltro(nuevoFiltro);
    setMostrarFiltros(false);
  };

  const obtenerTextoFiltro = () => {
    switch (filtro) {
      case "Activo":
        return "Activos";
      case "Inactivo":
        return "Inactivos";
      case "Disponible":
        return "Disponibles";
      case "Indisponible":
        return "Indisponibles";
      case "PocoStock":
        return "Poco stock";
      default:
        return "Todos";
    }
  };

  const tieneImagenMostrable = Boolean(
    previewLocal ||
      (productoSeleccionado?.imagenUrl && !eliminarImagenActual)
  );

  const urlImagenMostrable =
    previewLocal ||
    (!eliminarImagenActual ? productoSeleccionado?.imagenUrl || null : null);

  return (
    <ScrollView
      style={[styles.pagina, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contenidoPagina}
    >
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View>
          <Text
            style={[
              styles.titulo,
              isDark && { color: colors.text },
            ]}
          >
            Productos
          </Text>
          <Text
            style={[
              styles.subtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Gestiona el catálogo de productos, precios, inventario e imágenes.
          </Text>
        </View>

        <Pressable
          onPress={abrirAgregar}
          style={({ pressed }) => [
            styles.botonAgregar,
            { backgroundColor: colors.primary },
            pressed && styles.botonPresionado,
          ]}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.botonAgregarTexto}>Nuevo Producto</Text>
        </Pressable>
      </View>

      {/* Resumen KPIs */}
      <View style={styles.resumen}>
        <View
          style={[
            styles.tarjetaResumen,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconoResumen,
              isDark && { backgroundColor: colors.surfaceElevated },
            ]}
          >
            <Ionicons
              name="cube-outline"
              size={22}
              color={isDark ? colors.text : "#1f2329"}
            />
          </View>
          <View>
            <Text
              style={[
                styles.valorResumen,
                isDark && { color: colors.text },
              ]}
            >
              {productos.length}
            </Text>
            <Text
              style={[
                styles.etiquetaResumen,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Total productos
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.tarjetaResumen,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconoActivo,
              isDark && { backgroundColor: "rgba(21, 128, 61, 0.22)" },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={22}
              color={isDark ? "#4ade80" : "#15803d"}
            />
          </View>
          <View>
            <Text
              style={[
                styles.valorResumen,
                isDark && { color: colors.text },
              ]}
            >
              {totalActivos}
            </Text>
            <Text
              style={[
                styles.etiquetaResumen,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Activos
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.tarjetaResumen,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconoAdvertencia,
              isDark && { backgroundColor: "rgba(194, 65, 12, 0.22)" },
            ]}
          >
            <Ionicons
              name="warning-outline"
              size={22}
              color={isDark ? "#fb923c" : "#c2410c"}
            />
          </View>
          <View>
            <Text
              style={[
                styles.valorResumen,
                isDark && { color: colors.text },
              ]}
            >
              {totalPocoStock}
            </Text>
            <Text
              style={[
                styles.etiquetaResumen,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Poco stock
            </Text>
          </View>
        </View>

        <View
          style={[
            styles.tarjetaResumen,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.iconoInactivo,
              isDark && { backgroundColor: "rgba(184, 32, 24, 0.22)" },
            ]}
          >
            <Ionicons
              name="ban-outline"
              size={22}
              color={colors.primary}
            />
          </View>
          <View>
            <Text
              style={[
                styles.valorResumen,
                isDark && { color: colors.text },
              ]}
            >
              {totalIndisponibles}
            </Text>
            <Text
              style={[
                styles.etiquetaResumen,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Agotados
            </Text>
          </View>
        </View>
      </View>

      {/* Tarjeta Tabla */}
      <View
        style={[
          styles.tarjetaTabla,
          isDark && {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.barraHerramientas,
            isDark && { borderBottomColor: colors.border },
          ]}
        >
          <View
            style={[
              styles.buscador,
              isDark && {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <Ionicons
              name="search-outline"
              size={18}
              color={colors.inputPlaceholder}
            />
            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar por nombre, descripción o precio..."
              placeholderTextColor={colors.inputPlaceholder}
              style={[
                styles.inputBusqueda,
                isDark && { color: colors.text },
              ]}
            />
            {busqueda.length > 0 && (
              <Pressable onPress={() => setBusqueda("")}>
                <Ionicons
                  name="close-circle"
                  size={17}
                  color={colors.inputPlaceholder}
                />
              </Pressable>
            )}
          </View>

          <View style={styles.contenedorBotones}>
            <View style={styles.contenedorFiltro}>
              <Pressable
                onPress={() => setMostrarFiltros(!mostrarFiltros)}
                style={({ pressed }) => [
                  styles.botonFiltrar,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                  pressed && styles.botonPresionado,
                ]}
              >
                <Ionicons
                  name="filter-outline"
                  size={18}
                  color={isDark ? colors.text : "#1f2329"}
                />
                <Text
                  style={[
                    styles.botonFiltrarTexto,
                    isDark && { color: colors.text },
                  ]}
                >
                  Filtro: {obtenerTextoFiltro()}
                </Text>
                <Ionicons
                  name={
                    mostrarFiltros
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                  size={16}
                  color={isDark ? colors.text : "#1f2329"}
                />
              </Pressable>

              {mostrarFiltros && (
                <View
                  style={[
                    styles.menuFiltros,
                    isDark && {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <OpcionFiltro
                    texto="Todos"
                    icono="apps-outline"
                    seleccionado={filtro === "Todos"}
                    onPress={() => seleccionarFiltro("Todos")}
                  />
                  <OpcionFiltro
                    texto="Activos"
                    icono="checkmark-circle-outline"
                    seleccionado={filtro === "Activo"}
                    onPress={() => seleccionarFiltro("Activo")}
                  />
                  <OpcionFiltro
                    texto="Inactivos"
                    icono="close-circle-outline"
                    seleccionado={filtro === "Inactivo"}
                    onPress={() => seleccionarFiltro("Inactivo")}
                  />
                  <OpcionFiltro
                    texto="Disponibles"
                    icono="checkmark-done-outline"
                    seleccionado={filtro === "Disponible"}
                    onPress={() => seleccionarFiltro("Disponible")}
                  />
                  <OpcionFiltro
                    texto="Indisponibles"
                    icono="ban-outline"
                    seleccionado={filtro === "Indisponible"}
                    onPress={() => seleccionarFiltro("Indisponible")}
                  />
                  <OpcionFiltro
                    texto="Poco stock"
                    icono="warning-outline"
                    seleccionado={filtro === "PocoStock"}
                    onPress={() => seleccionarFiltro("PocoStock")}
                  />
                </View>
              )}
            </View>

            <Pressable
              onPress={cargarProductos}
              style={({ pressed }) => [
                styles.botonActualizar,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
                pressed && styles.botonPresionado,
              ]}
            >
              <Ionicons
                name="refresh-outline"
                size={18}
                color={isDark ? colors.text : "#1f2329"}
              />
              <Text
                style={[
                  styles.botonActualizarTexto,
                  isDark && { color: colors.text },
                ]}
              >
                Actualizar
              </Text>
            </Pressable>
          </View>
        </View>

        {cargando ? (
          <View style={styles.estadoCentro}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                styles.estadoTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Cargando productos...
            </Text>
          </View>
        ) : productosFiltrados.length === 0 ? (
          <View style={styles.estadoCentro}>
            <Ionicons
              name="cube-outline"
              size={52}
              color={colors.inputPlaceholder}
            />
            <Text
              style={[
                styles.estadoTitulo,
                isDark && { color: colors.text },
              ]}
            >
              No se encontraron productos
            </Text>
            <Text
              style={[
                styles.estadoTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Prueba con otra búsqueda o filtro.
            </Text>
          </View>
        ) : (
          <View style={styles.tabla}>
            <View
              style={[
                styles.filaEncabezado,
                isDark && { backgroundColor: colors.tableHeaderBg },
              ]}
            >
              <Text
                style={[
                  styles.celdaEncabezado,
                  styles.columnaId,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                ID
              </Text>
              <Text
                style={[
                  styles.celdaEncabezado,
                  styles.columnaProducto,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Producto
              </Text>
              <Text
                style={[
                  styles.celdaEncabezado,
                  styles.columnaDescripcion,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Descripción
              </Text>
              <Text
                style={[
                  styles.celdaEncabezado,
                  styles.columnaPrecio,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Precio
              </Text>
              <Text
                style={[
                  styles.celdaEncabezado,
                  styles.columnaStock,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Stock
              </Text>
              <Text
                style={[
                  styles.celdaEncabezado,
                  styles.columnaEstado,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Estado
              </Text>
              <Text
                style={[
                  styles.celdaEncabezado,
                  styles.columnaAcciones,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Acciones
              </Text>
            </View>

            {productosPaginados.map((producto) => {
              const sinStock = producto.stock === 0;
              const pocoStock =
                producto.stock > 0 && producto.stock < STOCK_MINIMO;

              return (
                <View
                  key={producto.id}
                  style={[
                    styles.fila,
                    isDark && {
                      backgroundColor: colors.tableRowBg,
                      borderTopColor: colors.tableBorder,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.celda,
                      styles.columnaId,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    #{producto.id}
                  </Text>

                  <View
                    style={[styles.celdaProducto, styles.columnaProducto]}
                  >
                    <MiniaturaProducto
                      imagenUrl={producto.imagenUrl}
                      onPress={() => abrirVerImagen(producto)}
                    />
                    <Text
                      numberOfLines={2}
                      style={[
                        styles.nombreProducto,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {producto.nombre}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={2}
                    style={[
                      styles.celda,
                      styles.columnaDescripcion,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {producto.descripcion}
                  </Text>

                  <Text
                    style={[
                      styles.precioTexto,
                      styles.columnaPrecio,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Bs {Number(producto.precio).toFixed(2)}
                  </Text>

                  <View
                    style={[styles.celdaStock, styles.columnaStock]}
                  >
                    <View
                      style={[
                        styles.stockBadge,
                        sinStock
                          ? isDark
                            ? { backgroundColor: colors.dangerBg }
                            : styles.stockAgotado
                          : pocoStock
                          ? isDark
                            ? { backgroundColor: colors.warningBg }
                            : styles.stockBajo
                          : isDark
                          ? { backgroundColor: colors.successBg }
                          : styles.stockNormal,
                      ]}
                    >
                      {(sinStock || pocoStock) && (
                        <Ionicons
                          name={
                            sinStock
                              ? "ban-outline"
                              : "warning-outline"
                          }
                          size={14}
                          color={
                            sinStock
                              ? colors.dangerText
                              : colors.warningText
                          }
                        />
                      )}

                      <Text
                        style={[
                          styles.stockTexto,
                          sinStock
                            ? { color: colors.dangerText }
                            : pocoStock
                            ? { color: colors.warningText }
                            : { color: colors.successText },
                        ]}
                      >
                        {producto.stock}
                      </Text>
                    </View>

                    <Text
                      style={[
                        sinStock
                          ? styles.textoIndisponible
                          : pocoStock
                          ? styles.stockBajoTexto
                          : styles.textoDisponible,
                        isDark && { color: colors.textMuted },
                      ]}
                    >
                      {sinStock
                        ? "Agotado"
                        : pocoStock
                        ? "Poco stock"
                        : "Disponible"}
                    </Text>
                  </View>

                  <View
                    style={[styles.celda, styles.columnaEstado]}
                  >
                    <View
                      style={[
                        styles.estadoBadge,
                        producto.estado === "Activo"
                          ? isDark
                            ? { backgroundColor: colors.successBg }
                            : styles.estadoActivoBadge
                          : isDark
                          ? { backgroundColor: colors.dangerBg }
                          : styles.estadoInactivoBadge,
                      ]}
                    >
                      <Text
                        style={
                          producto.estado === "Activo"
                            ? { color: colors.successText, fontSize: 11, fontWeight: "800" }
                            : { color: colors.dangerText, fontSize: 11, fontWeight: "800" }
                        }
                      >
                        {producto.estado}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[styles.acciones, styles.columnaAcciones]}
                  >
                    <Pressable
                      onPress={() => abrirEditar(producto)}
                      style={({ pressed }) => [
                        styles.botonAccion,
                        styles.botonEditar,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                        pressed && styles.botonPresionado,
                      ]}
                    >
                      <Ionicons
                        name="create-outline"
                        size={17}
                        color="#1d4ed8"
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => abrirCambiarEstado(producto)}
                      style={({ pressed }) => [
                        styles.botonAccion,
                        producto.estado === "Activo"
                          ? styles.botonEliminar
                          : styles.botonActivar,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                        pressed && styles.botonPresionado,
                      ]}
                    >
                      <Ionicons
                        name={
                          producto.estado === "Activo"
                            ? "trash-outline"
                            : "refresh-outline"
                        }
                        size={17}
                        color={
                          producto.estado === "Activo"
                            ? colors.dangerText
                            : colors.successText
                        }
                      />
                    </Pressable>
                  </View>
                </View>
              );
            })}

            <Paginacion
              paginaActual={paginaActual}
              totalPaginas={totalPaginas}
              totalRegistros={totalRegistros}
              registrosPorPagina={registrosPorPagina}
              onCambiarPagina={setPaginaActual}
              onCambiarRegistrosPorPagina={setRegistrosPorPagina}
            />
          </View>
        )}
      </View>

      {/* Modal Formulario Producto con Subida y Edición de Imagen */}
      <ModalSistema
        visible={modalActivo === "formulario"}
        titulo={
          productoSeleccionado ? "Editar producto" : "Agregar producto"
        }
        descripcion={
          productoSeleccionado
            ? "Modifica los datos y la imagen del producto seleccionado."
            : "Completa los datos del producto. La fotografía es opcional."
        }
        tipo="formulario"
        textoConfirmar={
          productoSeleccionado ? "Guardar cambios" : "Registrar producto"
        }
        cargando={procesando}
        onCerrar={cerrarModal}
        onConfirmar={guardarProducto}
      >
        <View style={styles.cuerpoModal}>
          {/* SECCIÓN FOTOGRAFÍA DEL PRODUCTO */}
          <View style={styles.seccionImagen}>
            <Text
              style={[
                styles.label,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Fotografía del producto
            </Text>

            {tieneImagenMostrable && urlImagenMostrable ? (
              <View
                style={[
                  styles.previewCard,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Image
                  source={{ uri: urlImagenMostrable }}
                  style={styles.previewImagenGrande}
                  resizeMode="cover"
                />

                <View style={styles.previewInfo}>
                  <View
                    style={[
                      styles.previewBadge,
                      previewLocal
                        ? { backgroundColor: colors.infoBg }
                        : { backgroundColor: colors.successBg },
                    ]}
                  >
                    <Text
                      style={[
                        styles.previewBadgeTexto,
                        previewLocal
                          ? { color: colors.infoText }
                          : { color: colors.successText },
                      ]}
                    >
                      {previewLocal
                        ? "Nueva imagen seleccionada"
                        : "Imagen registrada"}
                    </Text>
                  </View>

                  <View style={styles.previewAcciones}>
                    <Pressable
                      style={[
                        styles.botonCambiarFoto,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                      ]}
                      onPress={seleccionarArchivo}
                    >
                      <Ionicons
                        name="camera-reverse-outline"
                        size={14}
                        color="#1d4ed8"
                      />
                      <Text style={styles.botonCambiarFotoTexto}>Cambiar</Text>
                    </Pressable>

                    <Pressable
                      style={[
                        styles.botonEliminarFoto,
                        isDark && {
                          backgroundColor: colors.dangerBg,
                          borderColor: colors.dangerBorder,
                        },
                      ]}
                      onPress={handleQuitarImagen}
                    >
                      <Ionicons
                        name="trash-outline"
                        size={14}
                        color={colors.dangerText}
                      />
                      <Text
                        style={[
                          styles.botonEliminarFotoTexto,
                          { color: colors.dangerText },
                        ]}
                      >
                        Quitar
                      </Text>
                    </Pressable>
                  </View>
                </View>
              </View>
            ) : (
              <View
                style={[
                  styles.dropzoneSubida,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View
                  style={[
                    styles.iconoSubidaCaja,
                    isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                  ]}
                >
                  <Ionicons
                    name="cloud-upload-outline"
                    size={26}
                    color={colors.primary}
                  />
                </View>

                <Text
                  style={[
                    styles.tituloSubida,
                    isDark && { color: colors.text },
                  ]}
                >
                  Selecciona una imagen para el producto (opcional)
                </Text>
                <Text
                  style={[
                    styles.subtituloSubida,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Formatos permitidos: PNG, JPG, WEBP o GIF (hasta 10 MB)
                </Text>

                <Pressable
                  style={[
                    styles.botonExaminar,
                    { backgroundColor: colors.primary },
                  ]}
                  onPress={seleccionarArchivo}
                >
                  <Ionicons
                    name="image-outline"
                    size={16}
                    color="#ffffff"
                  />
                  <Text style={styles.botonExaminarTexto}>
                    Examinar archivo
                  </Text>
                </Pressable>
              </View>
            )}
          </View>

          {/* CAMPOS DEL FORMULARIO */}
          <View style={styles.grupoInput}>
            <Text
              style={[
                styles.label,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Nombre del producto
            </Text>
            <TextInput
              value={formulario.nombre}
              onChangeText={(val) => actualizarCampo("nombre", val)}
              placeholder="Ejemplo: Agua Purificada 20L"
              placeholderTextColor={colors.inputPlaceholder}
              style={[
                styles.input,
                isDark && {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
                errores.nombre ? styles.inputError : null,
              ]}
            />
            {!!errores.nombre && (
              <Text style={styles.errorCampo}>{errores.nombre}</Text>
            )}
          </View>

          <View style={styles.grupoInput}>
            <Text
              style={[
                styles.label,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Descripción
            </Text>
            <TextInput
              value={formulario.descripcion}
              onChangeText={(val) => actualizarCampo("descripcion", val)}
              placeholder="Ejemplo: Botellón de agua retornable de 20 litros"
              placeholderTextColor={colors.inputPlaceholder}
              multiline
              style={[
                styles.input,
                styles.inputTextArea,
                isDark && {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
                errores.descripcion ? styles.inputError : null,
              ]}
            />
            {!!errores.descripcion && (
              <Text style={styles.errorCampo}>{errores.descripcion}</Text>
            )}
          </View>

          <View style={styles.filaDosColumnas}>
            <View style={styles.columnaMitad}>
              <Text
                style={[
                  styles.label,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Stock inicial
              </Text>
              <TextInput
                value={formulario.stock}
                onChangeText={(val) =>
                  actualizarCampo("stock", val.replace(/[^0-9]/g, ""))
                }
                placeholder="0"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="numeric"
                style={[
                  styles.input,
                  isDark && {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                  errores.stock ? styles.inputError : null,
                ]}
              />
              {!!errores.stock && (
                <Text style={styles.errorCampo}>{errores.stock}</Text>
              )}
            </View>

            <View style={styles.columnaMitad}>
              <Text
                style={[
                  styles.label,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Precio (Bs)
              </Text>
              <TextInput
                value={formulario.precio}
                onChangeText={(val) =>
                  actualizarCampo("precio", val.replace(/[^0-9.,]/g, ""))
                }
                placeholder="0.00"
                placeholderTextColor={colors.inputPlaceholder}
                keyboardType="decimal-pad"
                style={[
                  styles.input,
                  isDark && {
                    backgroundColor: colors.inputBg,
                    borderColor: colors.inputBorder,
                    color: colors.text,
                  },
                  errores.precio ? styles.inputError : null,
                ]}
              />
              {!!errores.precio && (
                <Text style={styles.errorCampo}>{errores.precio}</Text>
              )}
            </View>
          </View>
        </View>
      </ModalSistema>

      {/* Modal Ver Imagen en Grande */}
      {modalActivo === "verImagen" && productoSeleccionado?.imagenUrl && (
        <ModalSistema
          visible={true}
          titulo={productoSeleccionado.nombre}
          descripcion={`Precio: Bs ${Number(productoSeleccionado.precio).toFixed(2)} · Stock: ${productoSeleccionado.stock}`}
          tipo="confirmacion"
          textoConfirmar="Cerrar"
          mostrarCancelar={false}
          onCerrar={cerrarModal}
          onConfirmar={cerrarModal}
        >
          <View style={{ alignItems: "center", paddingVertical: 16 }}>
            <Image
              source={{ uri: productoSeleccionado.imagenUrl }}
              style={{
                width: 260,
                height: 260,
                borderRadius: 18,
                backgroundColor: isDark ? colors.surfaceElevated : "#f5f6f8",
              }}
              resizeMode="contain"
            />
          </View>
        </ModalSistema>
      )}

      {/* Modal Cambiar Estado */}
      <ModalSistema
        visible={modalActivo === "estado"}
        titulo={
          productoSeleccionado?.estado === "Activo"
            ? "Desactivar producto"
            : "Reactivar producto"
        }
        descripcion={
          productoSeleccionado?.estado === "Activo"
            ? `¿Deseas desactivar el producto ${productoSeleccionado?.nombre}?`
            : `¿Deseas reactivar el producto ${productoSeleccionado?.nombre}?`
        }
        tipo="confirmacion"
        textoConfirmar={
          productoSeleccionado?.estado === "Activo"
            ? "Desactivar"
            : "Reactivar"
        }
        cargando={procesando}
        onCerrar={cerrarModal}
        onConfirmar={confirmarCambioEstado}
      />

      {/* Modal Mensaje Feedback */}
      <ModalSistema
        visible={modalActivo === "mensaje"}
        titulo={
          tipoMensaje === "exito"
            ? "Operación realizada"
            : "Ocurrió un problema"
        }
        descripcion={mensaje}
        tipo={tipoMensaje}
        textoConfirmar="Entendido"
        mostrarCancelar={false}
        onCerrar={cerrarModal}
        onConfirmar={cerrarModal}
      />
    </ScrollView>
  );
}

function OpcionFiltro({
  texto,
  icono,
  seleccionado,
  onPress,
}: {
  texto: string;
  icono: any;
  seleccionado: boolean;
  onPress: () => void;
}) {
  const { isDark, colors } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.opcionFiltro,
        seleccionado && (isDark ? { backgroundColor: colors.infoBg } : styles.opcionFiltroSeleccionada),
        pressed && styles.opcionPresionada,
      ]}
    >
      <Ionicons
        name={icono}
        size={17}
        color={seleccionado ? (isDark ? colors.infoText : "#2563eb") : (isDark ? colors.textSecondary : "#68707a")}
      />
      <Text
        style={[
          styles.opcionFiltroTexto,
          isDark && { color: colors.textSecondary },
          seleccionado && (isDark ? { color: colors.infoText, fontWeight: "700" } : styles.opcionFiltroTextoSeleccionado),
        ]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}