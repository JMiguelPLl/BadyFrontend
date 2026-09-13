import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import MapaSucursal from "../../components/MapaSucursal";
import { useAppTheme } from "../../hooks/useAppTheme";
import { listarClientes } from "../../services/clienteService";
import {
  agregarSucursal,
  cambiarEstadoSucursal,
  listarTodasSucursales,
  modificarSucursal,
  obtenerSucursalPorId,
  Sucursal,
} from "../../services/sucursalService";
import { Cliente } from "../../types/cliente";
import { styles } from "../../styles/administrador/sucursales.styles";

type FiltroEstado = "Todos" | "Activo" | "Inactivo";

type ModalActivo =
  | "ninguno"
  | "crear"
  | "editar"
  | "detalle"
  | "estado"
  | "mensaje";

interface ClienteAgrupado {
  id: number;
  nombre: string;
  email: string;
  numero: string;
  estadoCliente: string;
  sucursales: Sucursal[];
}

function extraerCoordenadas(ubicacion: string): {
  latitude: number;
  longitude: number;
} {
  if (!ubicacion) return { latitude: -17.7833, longitude: -63.1821 };

  const regex = /(-?\d{1,3}\.\d+)[,\s]+(-?\d{1,3}\.\d+)/;
  const match = ubicacion.match(regex);
  if (match) {
    const lat = parseFloat(match[1]);
    const lng = parseFloat(match[2]);
    if (!isNaN(lat) && !isNaN(lng)) {
      return { latitude: lat, longitude: lng };
    }
  }

  return { latitude: -17.7833, longitude: -63.1821 };
}

function abrirEnGoogleMaps(ubicacion: string) {
  if (!ubicacion) return;

  const coords = extraerCoordenadas(ubicacion);
  const esUrl =
    ubicacion.startsWith("http://") || ubicacion.startsWith("https://");

  const url = esUrl
    ? ubicacion
    : `https://www.google.com/maps/search/?api=1&query=${coords.latitude},${coords.longitude}`;

  Linking.openURL(url).catch(() => {});
}

export default function SucursalesAdministrador() {
  const { colors, isDark } = useAppTheme();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [clientesExpandidos, setClientesExpandidos] = useState<
    Record<number, boolean>
  >({});

  const [modal, setModal] = useState<ModalActivo>("ninguno");
  const [sucursalSeleccionada, setSucursalSeleccionada] =
    useState<Sucursal | null>(null);

  // Formulario de sucursal
  const [idClienteForm, setIdClienteForm] = useState<string>("");
  const [nombreForm, setNombreForm] = useState("");
  const [descripcionForm, setDescripcionForm] = useState("");
  const [ubicacionForm, setUbicacionForm] = useState("");

  // Modal de mensaje
  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const [listaClientes, listaSucursales] = await Promise.all([
        listarClientes().catch(() => []),
        listarTodasSucursales().catch(() => []),
      ]);

      setClientes(listaClientes);
      setSucursales(listaSucursales);

      // Por defecto todos los clientes inician colapsados
      setClientesExpandidos({});
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar las sucursales.",
        true
      );
    } finally {
      setCargando(false);
    }
  };

  const abrirMensaje = (texto: string, error = false) => {
    setMensaje(texto);
    setEsError(error);
    setModal("mensaje");
  };

  const toggleExpandirCliente = (idCliente: number) => {
    setClientesExpandidos((prev) => ({
      ...prev,
      [idCliente]: !prev[idCliente],
    }));
  };

  const clientesAgrupados = useMemo(() => {
    const mapaClientes = new Map<number, ClienteAgrupado>();

    // 1. Agregar clientes conocidos
    clientes.forEach((c) => {
      mapaClientes.set(c.id, {
        id: c.id,
        nombre: c.nombre,
        email: c.email,
        numero: c.numero,
        estadoCliente: c.estado,
        sucursales: [],
      });
    });

    // 2. Asociar sucursales a clientes
    sucursales.forEach((s) => {
      if (mapaClientes.has(s.idCliente)) {
        mapaClientes.get(s.idCliente)!.sucursales.push(s);
      } else {
        // Cliente no registrado en lista principal o sucursal huérfana
        mapaClientes.set(s.idCliente, {
          id: s.idCliente,
          nombre: s.cliente || `Cliente #${s.idCliente}`,
          email: "",
          numero: "",
          estadoCliente: "Activo",
          sucursales: [s],
        });
      }
    });

    return Array.from(mapaClientes.values());
  }, [clientes, sucursales]);

  // Resúmenes KPI
  const totalSucursales = sucursales.length;
  const sucursalesActivas = sucursales.filter(
    (s) =>
      s.estado.toLowerCase() === "activo" || s.estado.toLowerCase() === "activa"
  ).length;
  const sucursalesInactivas = totalSucursales - sucursalesActivas;
  const clientesConSucursal = clientesAgrupados.filter(
    (c) => c.sucursales.length > 0
  ).length;

  // Filtrado
  const clientesFiltrados = useMemo(() => {
    const query = busqueda.trim().toLowerCase();

    return clientesAgrupados
      .map((item) => {
        let sucursalesVisibles = item.sucursales;

        if (filtroEstado !== "Todos") {
          sucursalesVisibles = sucursalesVisibles.filter((s) => {
            const estadoNormal = s.estado.toLowerCase();
            return filtroEstado === "Activo"
              ? estadoNormal === "activo" || estadoNormal === "activa"
              : estadoNormal === "inactivo" || estadoNormal === "inactiva";
          });
        }

        const coincideCliente =
          item.nombre.toLowerCase().includes(query) ||
          item.email.toLowerCase().includes(query) ||
          item.numero.toLowerCase().includes(query);

        const coincideSucursal = sucursalesVisibles.some(
          (s) =>
            s.nombre.toLowerCase().includes(query) ||
            s.descripcion.toLowerCase().includes(query) ||
            s.ubicacion.toLowerCase().includes(query)
        );

        if (!query) {
          return {
            ...item,
            sucursales: sucursalesVisibles,
          };
        }

        if (coincideCliente) {
          return {
            ...item,
            sucursales: sucursalesVisibles,
          };
        }

        if (coincideSucursal) {
          return {
            ...item,
            sucursales: sucursalesVisibles.filter(
              (s) =>
                s.nombre.toLowerCase().includes(query) ||
                s.descripcion.toLowerCase().includes(query) ||
                s.ubicacion.toLowerCase().includes(query)
            ),
          };
        }

        return null;
      })
      .filter((item): item is ClienteAgrupado => item !== null);
  }, [clientesAgrupados, busqueda, filtroEstado]);

  // Handlers para formularios y modales
  const abrirCrearSucursal = (idClientePredeterminado?: number) => {
    setIdClienteForm(
      idClientePredeterminado
        ? String(idClientePredeterminado)
        : clientes.length > 0
          ? String(clientes[0].id)
          : ""
    );
    setNombreForm("");
    setDescripcionForm("");
    setUbicacionForm("-17.783300, -63.182100");
    setModal("crear");
  };

  const abrirEditarSucursal = (sucursal: Sucursal) => {
    setSucursalSeleccionada(sucursal);
    setIdClienteForm(String(sucursal.idCliente));
    setNombreForm(sucursal.nombre);
    setDescripcionForm(sucursal.descripcion || "");
    setUbicacionForm(sucursal.ubicacion || "-17.783300, -63.182100");
    setModal("editar");
  };

  const abrirDetalleSucursal = async (sucursal: Sucursal) => {
    try {
      setProcesando(true);
      const detalle = await obtenerSucursalPorId(sucursal.id).catch(
        () => sucursal
      );
      setSucursalSeleccionada(detalle);
      setModal("detalle");
    } finally {
      setProcesando(false);
    }
  };

  const abrirCambiarEstado = (sucursal: Sucursal) => {
    setSucursalSeleccionada(sucursal);
    setModal("estado");
  };

  const guardarSucursal = async () => {
    const idClienteNum = Number(idClienteForm);
    const nombre = nombreForm.trim();
    const descripcion = descripcionForm.trim();
    const ubicacion = ubicacionForm.trim();

    if (!idClienteNum || Number.isNaN(idClienteNum)) {
      abrirMensaje("Por favor, selecciona un cliente para la sucursal.", true);
      return;
    }

    if (!nombre) {
      abrirMensaje("El nombre de la sucursal es obligatorio.", true);
      return;
    }

    if (!ubicacion) {
      abrirMensaje(
        "La dirección o ubicación de la sucursal es obligatoria.",
        true
      );
      return;
    }

    try {
      setProcesando(true);

      if (modal === "crear") {
        const respuesta = await agregarSucursal(idClienteNum, {
          nombre,
          descripcion,
          ubicacion,
        });

        await cargarDatos();
        setModal("ninguno");
        abrirMensaje(respuesta?.message || "Sucursal registrada exitosamente.");
      } else if (modal === "editar" && sucursalSeleccionada) {
        const respuesta = await modificarSucursal(
          sucursalSeleccionada.id,
          idClienteNum,
          {
            nombre,
            descripcion,
            ubicacion,
          }
        );

        await cargarDatos();
        setModal("ninguno");
        abrirMensaje(
          respuesta?.message || "Sucursal actualizada exitosamente."
        );
      }
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la sucursal.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const confirmarCambioEstado = async () => {
    if (!sucursalSeleccionada) return;

    try {
      setProcesando(true);
      const estaActivo =
        sucursalSeleccionada.estado.toLowerCase() === "activo" ||
        sucursalSeleccionada.estado.toLowerCase() === "activa";
      const nuevoEstado = estaActivo ? "Inactivo" : "Activo";

      const respuesta = await cambiarEstadoSucursal(
        sucursalSeleccionada.id,
        nuevoEstado
      );

      await cargarDatos();
      setModal("ninguno");
      abrirMensaje(
        respuesta?.message ||
          `Sucursal ${estaActivo ? "desactivada" : "activada"} correctamente.`
      );
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado de la sucursal.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const cerrarModal = () => {
    if (procesando) return;
    setModal("ninguno");
    setSucursalSeleccionada(null);
  };

  return (
    <ScrollView
      style={[styles.pagina, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.contenidoPagina}
    >
      {/* Encabezado */}
      <View style={styles.encabezado}>
        <View>
          <Text style={[styles.titulo, isDark && { color: colors.text }]}>
            Gestión de Sucursales
          </Text>
          <Text
            style={[
              styles.subtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Administra los puntos de entrega y tiendas de cada cliente.
          </Text>
        </View>

        <Pressable
          onPress={() => abrirCrearSucursal()}
          style={({ pressed }) => [
            styles.botonAgregar,
            { backgroundColor: colors.primary },
            pressed && styles.botonPresionado,
          ]}
        >
          <Ionicons name="add" size={20} color="#ffffff" />
          <Text style={styles.botonAgregarTexto}>Nueva Sucursal</Text>
        </Pressable>
      </View>

      {/* Resumen KPI */}
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
              isDark && { backgroundColor: "rgba(59, 130, 246, 0.15)" },
            ]}
          >
            <Ionicons name="people-outline" size={24} color="#2563eb" />
          </View>
          <View>
            <Text
              style={[styles.valorResumen, isDark && { color: colors.text }]}
            >
              {clientesConSucursal}
            </Text>
            <Text
              style={[
                styles.etiquetaResumen,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Clientes con tiendas
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
              styles.iconoResumen,
              isDark && { backgroundColor: "rgba(147, 51, 234, 0.15)" },
            ]}
          >
            <Ionicons name="business-outline" size={24} color="#9333ea" />
          </View>
          <View>
            <Text
              style={[styles.valorResumen, isDark && { color: colors.text }]}
            >
              {totalSucursales}
            </Text>
            <Text
              style={[
                styles.etiquetaResumen,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Total sucursales
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
              isDark && { backgroundColor: "rgba(22, 163, 74, 0.15)" },
            ]}
          >
            <Ionicons
              name="checkmark-circle-outline"
              size={24}
              color="#16a34a"
            />
          </View>
          <View>
            <Text
              style={[styles.valorResumen, isDark && { color: colors.text }]}
            >
              {sucursalesActivas}
            </Text>
            <Text
              style={[
                styles.etiquetaResumen,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Sucursales activas
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
              isDark && { backgroundColor: "rgba(220, 38, 38, 0.15)" },
            ]}
          >
            <Ionicons name="close-circle-outline" size={24} color="#dc2626" />
          </View>
          <View>
            <Text
              style={[styles.valorResumen, isDark && { color: colors.text }]}
            >
              {sucursalesInactivas}
            </Text>
            <Text
              style={[
                styles.etiquetaResumen,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Sucursales inactivas
            </Text>
          </View>
        </View>
      </View>

      {/* Tarjeta con Barra de Herramientas y Tabla Agrupada */}
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
            isDark && { borderBottomColor: colors.borderLight },
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
              placeholder="Buscar por cliente, tienda o ubicación..."
              placeholderTextColor={colors.inputPlaceholder}
              style={[styles.inputBusqueda, isDark && { color: colors.text }]}
            />
            {busqueda.length > 0 && (
              <Pressable onPress={() => setBusqueda("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.inputPlaceholder}
                />
              </Pressable>
            )}
          </View>

          <View style={styles.contenedorBotonesHerramientas}>
            <View style={styles.contenedorFiltro}>
              <Pressable
                onPress={() => setMostrarFiltros((prev) => !prev)}
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
                  {filtroEstado === "Todos"
                    ? "Filtrar"
                    : filtroEstado === "Activo"
                      ? "Activas"
                      : "Inactivas"}
                </Text>
                <Ionicons
                  name={
                    mostrarFiltros
                      ? "chevron-up-outline"
                      : "chevron-down-outline"
                  }
                  size={15}
                  color={colors.textSecondary}
                />
              </Pressable>

              {mostrarFiltros && (
                <View
                  style={[
                    styles.menuFiltros,
                    isDark && {
                      backgroundColor: colors.modalBg,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Pressable
                    onPress={() => {
                      setFiltroEstado("Todos");
                      setMostrarFiltros(false);
                    }}
                    style={styles.opcionFiltro}
                  >
                    <Ionicons name="layers-outline" size={17} color="#2563eb" />
                    <Text
                      style={[
                        styles.opcionFiltroTexto,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Todas
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setFiltroEstado("Activo");
                      setMostrarFiltros(false);
                    }}
                    style={styles.opcionFiltro}
                  >
                    <View style={styles.puntoActivo} />
                    <Text
                      style={[
                        styles.opcionFiltroTexto,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Activas
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => {
                      setFiltroEstado("Inactivo");
                      setMostrarFiltros(false);
                    }}
                    style={styles.opcionFiltro}
                  >
                    <View style={styles.puntoInactivo} />
                    <Text
                      style={[
                        styles.opcionFiltroTexto,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Inactivas
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            <Pressable
              onPress={cargarDatos}
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
              Cargando sucursales de clientes...
            </Text>
          </View>
        ) : clientesFiltrados.length === 0 ? (
          <View style={styles.estadoCentro}>
            <Ionicons
              name="business-outline"
              size={50}
              color={colors.textMuted}
            />
            <Text
              style={[
                styles.estadoTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              No se encontraron sucursales registradas con ese criterio.
            </Text>
          </View>
        ) : (
          <View style={styles.tabla}>
            {/* Cabecera */}
            <View
              style={[
                styles.tablaCabecera,
                isDark && {
                  backgroundColor: colors.headerBg,
                  borderBottomColor: colors.border,
                },
              ]}
            >
              <Text style={[styles.columnaCabecera, styles.colCliente]}>
                Cliente
              </Text>
              <Text
                style={[styles.columnaCabecera, styles.colSucursalesCount]}
              >
                Sucursales
              </Text>
              <Text style={[styles.columnaCabecera, styles.colEstado]}>
                Estado Cliente
              </Text>
              <Text style={[styles.columnaCabecera, styles.colAcciones]}>
                Acciones
              </Text>
            </View>

            {/* Listado Agrupado de Clientes con sus Sucursales */}
            {clientesFiltrados.map((item) => {
              const expandido = Boolean(clientesExpandidos[item.id]);
              const tieneSucursales = item.sucursales.length > 0;
              const inicial = item.nombre.charAt(0).toUpperCase() || "C";

              return (
                <View key={item.id}>
                  {/* Fila del Cliente */}
                  <View
                    style={[
                      styles.filaCliente,
                      isDark && {
                        borderBottomColor: colors.borderLight,
                        backgroundColor: expandido
                          ? colors.surfaceElevated
                          : "transparent",
                      },
                    ]}
                  >
                    {/* Celda Cliente */}
                    <View style={[styles.clienteCelda, styles.colCliente]}>
                      <View
                        style={[
                          styles.avatar,
                          isDark && {
                            backgroundColor: "rgba(200, 35, 27, 0.2)",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.avatarTexto,
                            isDark && { color: colors.primary },
                          ]}
                        >
                          {inicial}
                        </Text>
                      </View>

                      <View style={styles.clienteInfo}>
                        <Text
                          style={[
                            styles.clienteNombre,
                            isDark && { color: colors.text },
                          ]}
                        >
                          {item.nombre}
                        </Text>
                        <Text
                          style={[
                            styles.clienteSecundario,
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          {item.email || "Sin correo"}{" "}
                          {item.numero ? `· ${item.numero}` : ""}
                        </Text>
                      </View>
                    </View>

                    {/* Celda Cantidad de Sucursales */}
                    <View style={styles.colSucursalesCount}>
                      <View
                        style={[
                          styles.badgeCantidad,
                          isDark && {
                            backgroundColor: "rgba(59, 130, 246, 0.15)",
                            borderColor: "rgba(59, 130, 246, 0.3)",
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.badgeCantidadTexto,
                            isDark && { color: "#60a5fa" },
                          ]}
                        >
                          {item.sucursales.length}{" "}
                          {item.sucursales.length === 1
                            ? "sucursal"
                            : "sucursales"}
                        </Text>
                      </View>
                    </View>

                    {/* Celda Estado Cliente */}
                    <View style={styles.colEstado}>
                      <View
                        style={[
                          styles.badge,
                          item.estadoCliente.toLowerCase() === "activo"
                            ? styles.badgeActivo
                            : styles.badgeInactivo,
                          isDark &&
                            (item.estadoCliente.toLowerCase() === "activo"
                              ? { backgroundColor: "rgba(22, 163, 74, 0.15)" }
                              : { backgroundColor: "rgba(220, 38, 38, 0.15)" }),
                        ]}
                      >
                        <Text
                          style={
                            item.estadoCliente.toLowerCase() === "activo"
                              ? styles.badgeTextoActivo
                              : styles.badgeTextoInactivo
                          }
                        >
                          {item.estadoCliente}
                        </Text>
                      </View>
                    </View>

                    {/* Acciones de la Fila */}
                    <View style={[styles.accionesFila, styles.colAcciones]}>
                      {tieneSucursales && (
                        <Pressable
                          onPress={() => toggleExpandirCliente(item.id)}
                          style={[
                            styles.botonDesplegar,
                            isDark && {
                              backgroundColor: colors.surfaceElevated,
                              borderColor: colors.border,
                            },
                          ]}
                        >
                          <Text
                            style={[
                              styles.botonDesplegarTexto,
                              isDark && { color: colors.text },
                            ]}
                          >
                            {expandido ? "Ocultar" : "Ver sucursales"}
                          </Text>
                          <Ionicons
                            name={
                              expandido
                                ? "chevron-up-outline"
                                : "chevron-down-outline"
                            }
                            size={14}
                            color={isDark ? colors.text : "#334155"}
                          />
                        </Pressable>
                      )}

                      <Pressable
                        onPress={() => abrirCrearSucursal(item.id)}
                        style={[
                          styles.botonAgregarMini,
                          isDark && {
                            backgroundColor: "rgba(200, 35, 27, 0.15)",
                            borderColor: "rgba(200, 35, 27, 0.3)",
                          },
                        ]}
                      >
                        <Ionicons
                          name="add"
                          size={18}
                          color={colors.primary}
                        />
                      </Pressable>
                    </View>
                  </View>

                  {/* Contenedor Desplegable de Sucursales del Cliente */}
                  {expandido && (
                    <View
                      style={[
                        styles.contenedorDesplegable,
                        isDark && {
                          backgroundColor: "#0d0f12",
                          borderBottomColor: colors.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.tituloDesplegable,
                          isDark && { color: colors.textMuted },
                        ]}
                      >
                        Sucursales / Tiendas de {item.nombre} (
                        {item.sucursales.length})
                      </Text>

                      {!tieneSucursales ? (
                        <Text
                          style={[
                            styles.estadoTexto,
                            { marginVertical: 8 },
                            isDark && { color: colors.textSecondary },
                          ]}
                        >
                          Este cliente no tiene sucursales registradas aún.
                          Presiona el botón (+) para añadir su primera
                          sucursal.
                        </Text>
                      ) : (
                        <View style={styles.gridSucursales}>
                          {item.sucursales.map((suc) => {
                            const estaActiva =
                              suc.estado.toLowerCase() === "activo" ||
                              suc.estado.toLowerCase() === "activa";

                            return (
                              <View
                                key={suc.id}
                                style={[
                                  styles.tarjetaSucursal,
                                  isDark && {
                                    backgroundColor: colors.card,
                                    borderColor: colors.border,
                                  },
                                ]}
                              >
                                <View style={styles.sucursalInfo}>
                                  <View style={styles.sucursalCabeceraInfo}>
                                    <Text
                                      style={[
                                        styles.sucursalNombre,
                                        isDark && { color: colors.text },
                                      ]}
                                    >
                                      {suc.nombre}
                                    </Text>
                                    <View
                                      style={[
                                        styles.badge,
                                        estaActiva
                                          ? styles.badgeActivo
                                          : styles.badgeInactivo,
                                        isDark &&
                                          (estaActiva
                                            ? {
                                                backgroundColor:
                                                  "rgba(22, 163, 74, 0.15)",
                                              }
                                            : {
                                                backgroundColor:
                                                  "rgba(220, 38, 38, 0.15)",
                                              }),
                                      ]}
                                    >
                                      <Text
                                        style={
                                          estaActiva
                                            ? styles.badgeTextoActivo
                                            : styles.badgeTextoInactivo
                                        }
                                      >
                                        {suc.estado}
                                      </Text>
                                    </View>
                                  </View>

                                  {!!suc.descripcion && (
                                    <Text
                                      style={[
                                        styles.sucursalDescripcion,
                                        isDark && {
                                          color: colors.textSecondary,
                                        },
                                      ]}
                                    >
                                      {suc.descripcion}
                                    </Text>
                                  )}

                                  <Pressable
                                    onPress={() =>
                                      abrirEnGoogleMaps(suc.ubicacion)
                                    }
                                    style={styles.sucursalUbicacionFila}
                                  >
                                    <Ionicons
                                      name="location-outline"
                                      size={15}
                                      color={isDark ? "#38bdf8" : "#0284c7"}
                                    />
                                    <Text
                                      style={[
                                        styles.sucursalUbicacionTexto,
                                        isDark && { color: "#38bdf8" },
                                      ]}
                                      numberOfLines={1}
                                    >
                                      {suc.ubicacion ||
                                        "Sin dirección especificada"}
                                    </Text>
                                    <Ionicons
                                      name="open-outline"
                                      size={13}
                                      color={isDark ? "#38bdf8" : "#0284c7"}
                                    />
                                  </Pressable>
                                </View>

                                <View style={styles.accionesSucursal}>
                                  <Pressable
                                    onPress={() => abrirDetalleSucursal(suc)}
                                    style={[
                                      styles.botonAccionSucursal,
                                      styles.botonVer,
                                      isDark && {
                                        backgroundColor:
                                          "rgba(56, 189, 248, 0.15)",
                                        borderColor:
                                          "rgba(56, 189, 248, 0.3)",
                                      },
                                    ]}
                                  >
                                    <Ionicons
                                      name="eye-outline"
                                      size={16}
                                      color={isDark ? "#38bdf8" : "#0284c7"}
                                    />
                                  </Pressable>

                                  <Pressable
                                    onPress={() => abrirEditarSucursal(suc)}
                                    style={[
                                      styles.botonAccionSucursal,
                                      styles.botonEditar,
                                      isDark && {
                                        backgroundColor:
                                          "rgba(29, 78, 216, 0.18)",
                                        borderColor:
                                          "rgba(29, 78, 216, 0.35)",
                                      },
                                    ]}
                                  >
                                    <Ionicons
                                      name="create-outline"
                                      size={16}
                                      color={isDark ? "#60a5fa" : "#1d4ed8"}
                                    />
                                  </Pressable>

                                  <Pressable
                                    onPress={() => abrirCambiarEstado(suc)}
                                    style={[
                                      styles.botonAccionSucursal,
                                      estaActiva
                                        ? styles.botonEstadoDesactivar
                                        : styles.botonEstadoActivar,
                                      isDark &&
                                        (estaActiva
                                          ? {
                                              backgroundColor:
                                                "rgba(220, 38, 38, 0.18)",
                                              borderColor:
                                                "rgba(220, 38, 38, 0.35)",
                                            }
                                          : {
                                              backgroundColor:
                                                "rgba(22, 163, 74, 0.18)",
                                              borderColor:
                                                "rgba(22, 163, 74, 0.35)",
                                            }),
                                    ]}
                                  >
                                    <Ionicons
                                      name={
                                        estaActiva
                                          ? "trash-outline"
                                          : "refresh-outline"
                                      }
                                      size={16}
                                      color={
                                        estaActiva
                                          ? isDark
                                            ? "#f87171"
                                            : "#dc2626"
                                          : isDark
                                            ? "#4ade80"
                                            : "#16a34a"
                                      }
                                    />
                                  </Pressable>
                                </View>
                              </View>
                            );
                          })}
                        </View>
                      )}
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        )}
      </View>

      {/* Modal Crear / Editar Sucursal */}
      <Modal
        visible={modal === "crear" || modal === "editar"}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modal,
              { maxWidth: 640 },
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                isDark && { borderBottomColor: colors.border },
              ]}
            >
              <Text
                style={[styles.modalTitulo, isDark && { color: colors.text }]}
              >
                {modal === "crear"
                  ? "Registrar Nueva Sucursal"
                  : "Editar Sucursal"}
              </Text>
              <Pressable onPress={cerrarModal}>
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? colors.text : "#333"}
                />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              {/* Selector de Cliente con Alto Contraste */}
              <View style={styles.campo}>
                <Text
                  style={[
                    styles.etiqueta,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cliente Propietario *
                </Text>
                <View
                  style={[
                    styles.selectorModal,
                    isDark && {
                      backgroundColor: "#1f2329",
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Picker
                    selectedValue={idClienteForm}
                    onValueChange={(val) => setIdClienteForm(String(val))}
                    style={
                      {
                        color: isDark ? "#ffffff" : "#2d333a",
                        backgroundColor: isDark ? "#1f2329" : "#ffffff",
                        borderRadius: 11,
                        borderWidth: 0,
                        outline: "none",
                      } as any
                    }
                    dropdownIconColor={isDark ? "#ffffff" : "#2d333a"}
                  >
                    <Picker.Item
                      label="Selecciona un cliente..."
                      value=""
                      style={{
                        backgroundColor: isDark ? "#1f2329" : "#ffffff",
                        color: isDark ? "#9ca3af" : "#8a9199",
                      }}
                    />
                    {clientes.map((c) => (
                      <Picker.Item
                        key={c.id}
                        label={`${c.nombre} (${c.email || "ID #" + c.id})`}
                        value={String(c.id)}
                        style={{
                          backgroundColor: isDark ? "#1f2329" : "#ffffff",
                          color: isDark ? "#ffffff" : "#252b31",
                        }}
                      />
                    ))}
                  </Picker>
                </View>
              </View>

              {/* Nombre de Sucursal */}
              <View style={styles.campo}>
                <Text
                  style={[
                    styles.etiqueta,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Nombre de la Tienda / Sucursal *
                </Text>
                <TextInput
                  value={nombreForm}
                  onChangeText={setNombreForm}
                  placeholder="Ej: Tienda Central, Sucursal Norte..."
                  placeholderTextColor={colors.inputPlaceholder}
                  style={[
                    styles.input,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                />
              </View>

              {/* Descripción */}
              <View style={styles.campo}>
                <Text
                  style={[
                    styles.etiqueta,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Descripción (Opcional)
                </Text>
                <TextInput
                  value={descripcionForm}
                  onChangeText={setDescripcionForm}
                  placeholder="Ej: Frente a la plaza principal, portón verde..."
                  placeholderTextColor={colors.inputPlaceholder}
                  multiline
                  numberOfLines={2}
                  style={[
                    styles.input,
                    styles.textArea,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                />
              </View>

              {/* Ubicación / Dirección */}
              <View style={styles.campo}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={[
                      styles.etiqueta,
                      { marginBottom: 0 },
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Dirección o Coordenadas *
                  </Text>
                  {!!ubicacionForm && (
                    <Pressable
                      onPress={() => abrirEnGoogleMaps(ubicacionForm)}
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name="open-outline"
                        size={14}
                        color={isDark ? "#38bdf8" : "#0284c7"}
                      />
                      <Text
                        style={{
                          fontSize: 12,
                          color: isDark ? "#38bdf8" : "#0284c7",
                          fontWeight: "700",
                        }}
                      >
                        Abrir en Google Maps
                      </Text>
                    </Pressable>
                  )}
                </View>

                <TextInput
                  value={ubicacionForm}
                  onChangeText={setUbicacionForm}
                  placeholder="Ej: -17.783300, -63.182100 ó Av. Banzer #123"
                  placeholderTextColor={colors.inputPlaceholder}
                  style={[
                    styles.input,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                      color: colors.text,
                    },
                  ]}
                />
              </View>

              {/* Mapa Interactivo con Marcador */}
              <View style={{ marginBottom: 16 }}>
                <Text
                  style={[
                    styles.etiqueta,
                    { marginBottom: 8 },
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  🗺️ Marcar ubicación en el mapa (Haz clic o arrastra el
                  marcador)
                </Text>
                <MapaSucursal
                  coordenada={extraerCoordenadas(ubicacionForm)}
                  onSeleccionar={(lat: number, lng: number) => {
                    setUbicacionForm(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
                  }}
                  altura={220}
                />
              </View>
            </ScrollView>

            <View
              style={[
                styles.modalAcciones,
                isDark && { borderTopColor: colors.border },
              ]}
            >
              <Pressable
                onPress={cerrarModal}
                style={[
                  styles.botonModal,
                  styles.botonCancelar,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelarTexto,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cancelar
                </Text>
              </Pressable>

              <Pressable
                disabled={procesando}
                onPress={guardarSucursal}
                style={[
                  styles.botonModal,
                  styles.botonConfirmar,
                  { backgroundColor: colors.primary },
                ]}
              >
                {procesando ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.confirmarTexto}>
                    {modal === "crear" ? "Registrar" : "Guardar cambios"}
                  </Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Ver Detalle de Sucursal con Mapa */}
      <Modal
        visible={modal === "detalle"}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modal,
              { maxWidth: 620 },
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.modalHeader,
                isDark && { borderBottomColor: colors.border },
              ]}
            >
              <Text
                style={[styles.modalTitulo, isDark && { color: colors.text }]}
              >
                Detalle de Sucursal #{sucursalSeleccionada?.id}
              </Text>
              <Pressable onPress={cerrarModal}>
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? colors.text : "#333"}
                />
              </Pressable>
            </View>

            <ScrollView style={styles.modalBody}>
              {sucursalSeleccionada && (
                <>
                  <View
                    style={[
                      styles.bannerInfo,
                      isDark && {
                        backgroundColor: "rgba(56, 189, 248, 0.15)",
                        borderColor: "rgba(56, 189, 248, 0.35)",
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bannerInfoTexto,
                        isDark && { color: "#38bdf8" },
                      ]}
                    >
                      {sucursalSeleccionada.nombre}
                    </Text>
                    <Text
                      style={[
                        styles.clienteSecundario,
                        { marginTop: 4 },
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Cliente:{" "}
                      {sucursalSeleccionada.cliente ||
                        "Cliente #" + sucursalSeleccionada.idCliente}
                    </Text>
                  </View>

                  <View style={styles.campo}>
                    <Text
                      style={[
                        styles.etiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Estado
                    </Text>
                    <View
                      style={[
                        styles.badge,
                        sucursalSeleccionada.estado.toLowerCase() ===
                          "activo" ||
                        sucursalSeleccionada.estado.toLowerCase() === "activa"
                          ? styles.badgeActivo
                          : styles.badgeInactivo,
                      ]}
                    >
                      <Text
                        style={
                          sucursalSeleccionada.estado.toLowerCase() ===
                            "activo" ||
                          sucursalSeleccionada.estado.toLowerCase() === "activa"
                            ? styles.badgeTextoActivo
                            : styles.badgeTextoInactivo
                        }
                      >
                        {sucursalSeleccionada.estado}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.campo}>
                    <Text
                      style={[
                        styles.etiqueta,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      Descripción
                    </Text>
                    <Text
                      style={[
                        styles.clienteNombre,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {sucursalSeleccionada.descripcion ||
                        "Sin descripción registrada"}
                    </Text>
                  </View>

                  <View style={styles.campo}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 6,
                      }}
                    >
                      <Text
                        style={[
                          styles.etiqueta,
                          { marginBottom: 0 },
                          isDark && { color: colors.textSecondary },
                        ]}
                      >
                        Ubicación
                      </Text>
                      <Pressable
                        onPress={() =>
                          abrirEnGoogleMaps(sucursalSeleccionada.ubicacion)
                        }
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Ionicons
                          name="map-outline"
                          size={14}
                          color={isDark ? "#38bdf8" : "#0284c7"}
                        />
                        <Text
                          style={{
                            fontSize: 12,
                            color: isDark ? "#38bdf8" : "#0284c7",
                            fontWeight: "700",
                          }}
                        >
                          Ver en Google Maps
                        </Text>
                      </Pressable>
                    </View>

                    <View style={styles.sucursalUbicacionFila}>
                      <Ionicons
                        name="location-outline"
                        size={17}
                        color={isDark ? "#38bdf8" : "#0284c7"}
                      />
                      <Text
                        style={[
                          styles.sucursalUbicacionTexto,
                          isDark && { color: "#38bdf8" },
                        ]}
                      >
                        {sucursalSeleccionada.ubicacion || "Sin ubicación"}
                      </Text>
                    </View>
                  </View>

                  {/* Vista en Mapa Leaflet / Google Maps */}
                  <View style={{ marginTop: 10, marginBottom: 10 }}>
                    <Text
                      style={[
                        styles.etiqueta,
                        { marginBottom: 8 },
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      📍 Ubicación Geográfica
                    </Text>
                    <MapaSucursal
                      coordenada={extraerCoordenadas(
                        sucursalSeleccionada.ubicacion
                      )}
                      soloLectura={true}
                      altura={220}
                    />
                  </View>
                </>
              )}
            </ScrollView>

            <View
              style={[
                styles.modalAcciones,
                isDark && { borderTopColor: colors.border },
              ]}
            >
              <Pressable
                onPress={cerrarModal}
                style={[
                  styles.botonModal,
                  styles.botonCancelar,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.cancelarTexto,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cerrar
                </Text>
              </Pressable>

              {sucursalSeleccionada && (
                <Pressable
                  onPress={() => {
                    const s = sucursalSeleccionada;
                    cerrarModal();
                    abrirEditarSucursal(s);
                  }}
                  style={[
                    styles.botonModal,
                    styles.botonConfirmar,
                    { backgroundColor: colors.primary },
                  ]}
                >
                  <Text style={styles.confirmarTexto}>Editar</Text>
                </Pressable>
              )}
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Confirmar Cambio de Estado */}
      <Modal
        visible={modal === "estado"}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modal,
              { maxWidth: 440 },
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <View style={{ padding: 24, alignItems: "center" }}>
              <Ionicons
                name="alert-circle-outline"
                size={50}
                color={colors.dangerText}
              />
              <Text
                style={[
                  styles.modalTitulo,
                  { marginTop: 12, textAlign: "center" },
                  isDark && { color: colors.text },
                ]}
              >
                {sucursalSeleccionada?.estado.toLowerCase() === "activo" ||
                sucursalSeleccionada?.estado.toLowerCase() === "activa"
                  ? "¿Desactivar esta sucursal?"
                  : "¿Activar esta sucursal?"}
              </Text>
              <Text
                style={[
                  styles.estadoTexto,
                  { marginTop: 8, textAlign: "center" },
                  isDark && { color: colors.textSecondary },
                ]}
              >
                {sucursalSeleccionada?.estado.toLowerCase() === "activo" ||
                sucursalSeleccionada?.estado.toLowerCase() === "activa"
                  ? `La sucursal "${sucursalSeleccionada?.nombre}" pasará a estado Inactivo y no estará disponible para nuevos pedidos.`
                  : `La sucursal "${sucursalSeleccionada?.nombre}" pasará a estado Activo.`}
              </Text>

              <View
                style={{
                  flexDirection: "row",
                  gap: 12,
                  marginTop: 22,
                  width: "100%",
                }}
              >
                <Pressable
                  onPress={cerrarModal}
                  style={[
                    styles.botonModal,
                    styles.botonCancelar,
                    { flex: 1 },
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.cancelarTexto,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  disabled={procesando}
                  onPress={confirmarCambioEstado}
                  style={[
                    styles.botonModal,
                    styles.botonConfirmar,
                    { flex: 1, backgroundColor: colors.primary },
                  ]}
                >
                  {procesando ? (
                    <ActivityIndicator size="small" color="#ffffff" />
                  ) : (
                    <Text style={styles.confirmarTexto}>Confirmar</Text>
                  )}
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal Mensaje */}
      <Modal
        visible={modal === "mensaje"}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modal,
              { maxWidth: 420 },
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <View style={{ padding: 24, alignItems: "center" }}>
              <Ionicons
                name={
                  esError
                    ? "alert-circle-outline"
                    : "checkmark-circle-outline"
                }
                size={50}
                color={
                  esError
                    ? colors.dangerText
                    : isDark
                      ? "#4ade80"
                      : "#15803d"
                }
              />
              <Text
                style={[
                  styles.modalTitulo,
                  { marginTop: 12 },
                  isDark && { color: colors.text },
                ]}
              >
                {esError ? "Ocurrió un problema" : "Operación Exitosa"}
              </Text>
              <Text
                style={[
                  styles.estadoTexto,
                  { marginTop: 8, textAlign: "center" },
                  isDark && { color: colors.textSecondary },
                ]}
              >
                {mensaje}
              </Text>

              <Pressable
                onPress={cerrarModal}
                style={[
                  styles.botonModal,
                  styles.botonConfirmar,
                  {
                    marginTop: 20,
                    width: "100%",
                    backgroundColor: colors.primary,
                  },
                ]}
              >
                <Text style={styles.confirmarTexto}>Entendido</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
