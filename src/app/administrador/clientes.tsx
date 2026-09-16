import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  actualizarCliente,
  cambiarEstadoCliente,
  crearCliente,
  listarClientes,
  listarClientesActivos,
  listarClientesInactivos,
} from "../../services/clienteService";
import {
  Cliente,
  ClienteFormulario,
} from "../../types/cliente";
import { styles } from "../../styles/administrador/clientes.styles";

const formularioInicial: ClienteFormulario = {
  nombre: "",
  numero: "",
  email: "",
  contrasena: "",
};

type TipoModalActivo =
  | "ninguno"
  | "formulario"
  | "estado"
  | "mensaje";

type TipoMensaje = "exito" | "error";
type FiltroEstado = "Todos" | "Activo" | "Inactivo";

export default function ClientesAdministrador() {
  const { colors, isDark } = useAppTheme();

  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [modalActivo, setModalActivo] = useState<TipoModalActivo>("ninguno");
  const [clienteSeleccionado, setClienteSeleccionado] = useState<Cliente | null>(null);

  const [formulario, setFormulario] = useState<ClienteFormulario>(formularioInicial);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<TipoMensaje>("exito");

  useEffect(() => {
    cargarClientes();
  }, []);

  const cargarClientes = async (filtro: FiltroEstado = filtroEstado) => {
    try {
      setCargando(true);
      let respuesta: Cliente[] = [];

      if (filtro === "Activo") {
        respuesta = await listarClientesActivos();
      } else if (filtro === "Inactivo") {
        respuesta = await listarClientesInactivos();
      } else {
        respuesta = await listarClientes();
      }

      setClientes(respuesta);
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los clientes.",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  const seleccionarFiltro = (filtro: FiltroEstado) => {
    setFiltroEstado(filtro);
    setMostrarFiltros(false);
    cargarClientes(filtro);
  };

  const clientesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    if (!texto) {
      return clientes;
    }

    return clientes.filter((cliente) => {
      const nombre = cliente.nombre?.toLowerCase() ?? "";
      const email = cliente.email?.toLowerCase() ?? "";
      const numero = cliente.numero?.toLowerCase() ?? "";
      const estado = cliente.estado?.toLowerCase() ?? "";

      return (
        nombre.includes(texto) ||
        email.includes(texto) ||
        numero.includes(texto) ||
        estado.includes(texto)
      );
    });
  }, [clientes, busqueda]);

  const {
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    setRegistrosPorPagina,
    totalPaginas,
    totalRegistros,
    datosPaginados: clientesPaginados,
  } = usePaginacion(clientesFiltrados);

  const abrirAgregar = () => {
    setClienteSeleccionado(null);
    setFormulario(formularioInicial);
    setErrores({});
    setModalActivo("formulario");
  };

  const abrirEditar = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setFormulario({
      nombre: cliente.nombre,
      numero: cliente.numero,
      email: cliente.email,
      contrasena: "",
    });
    setErrores({});
    setModalActivo("formulario");
  };

  const abrirCambiarEstado = (cliente: Cliente) => {
    setClienteSeleccionado(cliente);
    setModalActivo("estado");
  };

  const cerrarModal = () => {
    if (procesando) return;
    setModalActivo("ninguno");
    setClienteSeleccionado(null);
    setFormulario(formularioInicial);
    setErrores({});
  };

  const actualizarCampo = (
    campo: keyof ClienteFormulario,
    valor: string
  ) => {
    setFormulario((prev) => ({
      ...prev,
      [campo]: valor,
    }));

    if (errores[campo]) {
      setErrores((prev) => {
        const copia = { ...prev };
        delete copia[campo];
        return copia;
      });
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    if (!formulario.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es obligatorio.";
    }

    if (!formulario.numero.trim()) {
      nuevosErrores.numero = "El número es obligatorio.";
    } else if (!/^[0-9+ -]{7,15}$/.test(formulario.numero.trim())) {
      nuevosErrores.numero = "Ingresa un número de teléfono válido.";
    }

    if (!formulario.email.trim()) {
      nuevosErrores.email = "El correo es obligatorio.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email.trim())
    ) {
      nuevosErrores.email = "Ingresa un correo electrónico válido.";
    }

    if (!clienteSeleccionado) {
      if (!formulario.contrasena.trim()) {
        nuevosErrores.contrasena = "La contraseña es obligatoria.";
      } else if (formulario.contrasena.trim().length < 6) {
        nuevosErrores.contrasena = "Debe tener al menos 6 caracteres.";
      }
    } else if (
      formulario.contrasena.trim().length > 0 &&
      formulario.contrasena.trim().length < 6
    ) {
      nuevosErrores.contrasena = "Debe tener al menos 6 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarCliente = async () => {
    if (!validarFormulario()) return;

    try {
      setProcesando(true);

      const payload: ClienteFormulario = {
        nombre: formulario.nombre.trim(),
        numero: formulario.numero.trim(),
        email: formulario.email.trim(),
        contrasena: formulario.contrasena.trim(),
      };

      if (clienteSeleccionado) {
        await actualizarCliente(clienteSeleccionado.id, payload);
        await cargarClientes();
        cerrarModal();
        mostrarMensaje("Cliente actualizado correctamente.", "exito");
      } else {
        await crearCliente(payload);
        await cargarClientes();
        cerrarModal();
        mostrarMensaje("Cliente registrado correctamente.", "exito");
      }
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el cliente.",
        "error"
      );
    } finally {
      setProcesando(false);
    }
  };

  const confirmarCambioEstado = async () => {
    if (!clienteSeleccionado) return;

    try {
      setProcesando(true);
      const nuevoEstado =
        clienteSeleccionado.estado === "Activo" ? "Inactivo" : "Activo";
      await cambiarEstadoCliente(clienteSeleccionado.id, nuevoEstado);
      await cargarClientes();
      cerrarModal();
      mostrarMensaje(
        `Estado del cliente cambiado correctamente.`,
        "exito"
      );
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado del cliente.",
        "error"
      );
    } finally {
      setProcesando(false);
    }
  };

  const mostrarMensaje = (
    texto: string,
    tipo: TipoMensaje
  ) => {
    setMensaje(texto);
    setTipoMensaje(tipo);
    setModalActivo("mensaje");
  };

  const totalActivos = clientes.filter(
    (cliente) => cliente.estado === "Activo"
  ).length;

  const totalInactivos = clientes.filter(
    (cliente) => cliente.estado === "Inactivo"
  ).length;

  return (
    <ScrollView
      style={[
        styles.pagina,
        { backgroundColor: colors.background },
      ]}
      contentContainerStyle={styles.contenidoPagina}
    >
      <View style={styles.encabezado}>
        <View>
          <Text
            style={[
              styles.titulo,
              isDark && { color: colors.text },
            ]}
          >
            Clientes
          </Text>
          <Text
            style={[
              styles.subtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Administra los clientes registrados en el sistema.
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
          <Ionicons name="add-outline" size={21} color="#ffffff" />
          <Text style={styles.botonAgregarTexto}>Agregar cliente</Text>
        </Pressable>
      </View>

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
              name="people-outline"
              size={23}
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
              {clientes.length}
            </Text>
            <Text
              style={[
                styles.etiquetaResumen,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Total de clientes
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
              size={23}
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
              Clientes activos
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
              isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
            ]}
          >
            <Ionicons
              name="close-circle-outline"
              size={23}
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
              {totalInactivos}
            </Text>
            <Text
              style={[
                styles.etiquetaResumen,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Clientes inactivos
            </Text>
          </View>
        </View>
      </View>

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
              size={19}
              color={colors.inputPlaceholder}
            />
            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar cliente por nombre, correo o teléfono..."
              placeholderTextColor={colors.inputPlaceholder}
              style={[
                styles.inputBusqueda,
                isDark && { color: colors.text },
              ]}
            />
            {busqueda ? (
              <Pressable onPress={() => setBusqueda("")}>
                <Ionicons
                  name="close-circle"
                  size={18}
                  color={colors.inputPlaceholder}
                />
              </Pressable>
            ) : null}
          </View>

          <View style={styles.contenedorBotonesHerramientas}>
            <View style={styles.contenedorFiltro}>
              <Pressable
                onPress={() => setMostrarFiltros((actual) => !actual)}
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
                  size={19}
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
                      ? "Activos"
                      : "Inactivos"}
                </Text>
                <Ionicons
                  name={mostrarFiltros ? "chevron-up-outline" : "chevron-down-outline"}
                  size={16}
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
                  pointerEvents="auto"
                >
                  <Pressable
                    onPress={() => seleccionarFiltro("Todos")}
                    style={styles.opcionFiltro}
                  >
                    <Ionicons name="people-outline" size={18} color="#2563eb" />
                    <Text
                      style={[
                        styles.opcionFiltroTexto,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Todos
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => seleccionarFiltro("Activo")}
                    style={styles.opcionFiltro}
                  >
                    <View style={styles.puntoActivo} />
                    <Text
                      style={[
                        styles.opcionFiltroTexto,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Activos
                    </Text>
                  </Pressable>

                  <Pressable
                    onPress={() => seleccionarFiltro("Inactivo")}
                    style={styles.opcionFiltro}
                  >
                    <View style={styles.puntoInactivo} />
                    <Text
                      style={[
                        styles.opcionFiltroTexto,
                        isDark && { color: colors.text },
                      ]}
                    >
                      Inactivos
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>

            <Pressable
              onPress={() => cargarClientes(filtroEstado)}
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
                size={19}
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
              Cargando clientes...
            </Text>
          </View>
        ) : clientesFiltrados.length === 0 ? (
          <View style={styles.estadoCentro}>
            <Ionicons
              name="people-outline"
              size={52}
              color={colors.textMuted}
            />
            <Text
              style={[
                styles.estadoTitulo,
                isDark && { color: colors.text },
              ]}
            >
              No se encontraron clientes
            </Text>
            <Text
              style={[
                styles.estadoTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Prueba con otro nombre, correo o teléfono.
            </Text>
          </View>
        ) : (
          <View style={styles.tabla}>
            <View
              style={[
                styles.filaEncabezado,
                isDark && { backgroundColor: colors.surfaceElevated },
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
                  styles.columnaNombre,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Nombre
              </Text>
              <Text
                style={[
                  styles.celdaEncabezado,
                  styles.columnaCorreo,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Correo
              </Text>
              <Text
                style={[
                  styles.celdaEncabezado,
                  styles.columnaTelefono,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Teléfono
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
                  { textAlign: "right" },
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Acciones
              </Text>
            </View>

              {clientesPaginados.map((cliente) => (
                <View
                  key={cliente.id}
                  style={[
                    styles.fila,
                    isDark && {
                      backgroundColor: colors.card,
                      borderTopColor: colors.borderLight,
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
                    #{cliente.id}
                  </Text>

                  <View
                    style={[
                      styles.celdaConAvatar,
                      styles.columnaNombre,
                    ]}
                  >
                    <View
                      style={[
                        styles.avatarCliente,
                        isDark && { backgroundColor: colors.surfaceElevated },
                      ]}
                    >
                      <Text
                        style={[
                          styles.avatarClienteTexto,
                          isDark && { color: colors.text },
                        ]}
                      >
                        {cliente.nombre.charAt(0).toUpperCase()}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.nombreCliente,
                        isDark && { color: colors.text },
                      ]}
                      numberOfLines={1}
                    >
                      {cliente.nombre}
                    </Text>
                  </View>

                  <Text
                    style={[
                      styles.celda,
                      styles.columnaCorreo,
                      isDark && { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {cliente.email}
                  </Text>

                  <Text
                    style={[
                      styles.celda,
                      styles.columnaTelefono,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    {cliente.numero}
                  </Text>

                  <View
                    style={[
                      styles.celdaEstado,
                      styles.columnaEstado,
                    ]}
                  >
                    <View
                      style={[
                        styles.estadoBadge,
                        cliente.estado === "Activo"
                          ? isDark
                            ? { backgroundColor: "rgba(21, 128, 61, 0.22)" }
                            : styles.estadoActivo
                          : isDark
                            ? { backgroundColor: "rgba(200, 35, 27, 0.22)" }
                            : styles.estadoInactivo,
                      ]}
                    >
                      <View
                        style={[
                          styles.estadoPunto,
                          cliente.estado === "Activo"
                            ? styles.puntoActivo
                            : styles.puntoInactivo,
                        ]}
                      />
                      <Text
                        style={[
                          styles.estadoBadgeTexto,
                          cliente.estado === "Activo"
                            ? isDark
                              ? { color: "#4ade80" }
                              : styles.estadoActivoTexto
                            : isDark
                              ? { color: colors.dangerText }
                              : styles.estadoInactivoTexto,
                        ]}
                      >
                        {cliente.estado}
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.celdaAcciones,
                      styles.columnaAcciones,
                    ]}
                  >
                    <Pressable
                      onPress={() => abrirEditar(cliente)}
                      style={({ pressed }) => [
                        styles.botonAccion,
                        styles.botonEditar,
                        isDark && {
                          backgroundColor: "rgba(29, 78, 216, 0.18)",
                          borderColor: "rgba(29, 78, 216, 0.35)",
                        },
                        pressed && styles.botonPresionado,
                      ]}
                    >
                      <Ionicons
                        name="create-outline"
                        size={18}
                        color={isDark ? "#60a5fa" : "#1d4ed8"}
                      />
                    </Pressable>

                    <Pressable
                      onPress={() => abrirCambiarEstado(cliente)}
                      style={({ pressed }) => [
                        styles.botonAccion,
                        cliente.estado === "Activo"
                          ? isDark
                            ? { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }
                            : styles.botonEliminar
                          : isDark
                            ? { backgroundColor: "rgba(21, 128, 61, 0.18)", borderColor: "rgba(21, 128, 61, 0.35)" }
                            : styles.botonActivar,
                        pressed && styles.botonPresionado,
                      ]}
                    >
                      <Ionicons
                        name={
                          cliente.estado === "Activo"
                            ? "trash-outline"
                            : "refresh-outline"
                        }
                        size={18}
                        color={
                          cliente.estado === "Activo"
                            ? colors.dangerText
                            : isDark
                              ? "#4ade80"
                              : "#15803d"
                        }
                      />
                    </Pressable>
                  </View>
                </View>
              ))}

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

      <ModalSistema
        visible={modalActivo === "formulario"}
        titulo={
          clienteSeleccionado
            ? "Editar cliente"
            : "Agregar cliente"
        }
        descripcion={
          clienteSeleccionado
            ? "Modifica la información del cliente seleccionado."
            : "Completa los datos para registrar un nuevo cliente."
        }
        tipo="formulario"
        textoConfirmar={
          clienteSeleccionado
            ? "Guardar cambios"
            : "Registrar cliente"
        }
        cargando={procesando}
        onCerrar={cerrarModal}
        onConfirmar={guardarCliente}
      >
        <View style={styles.formulario}>
          <View style={styles.grupoCampo}>
            <Text
              style={[
                styles.etiquetaCampo,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Nombre completo
            </Text>
            <TextInput
              value={formulario.nombre}
              onChangeText={(valor) => actualizarCampo("nombre", valor)}
              placeholder="Ejemplo: Juan Pérez"
              placeholderTextColor={colors.inputPlaceholder}
              style={[
                styles.input,
                isDark && {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
                errores.nombre && styles.inputError,
              ]}
            />
            {errores.nombre ? (
              <Text style={styles.textoError}>{errores.nombre}</Text>
            ) : null}
          </View>

          <View style={styles.grupoCampo}>
            <Text
              style={[
                styles.etiquetaCampo,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Número de teléfono
            </Text>
            <TextInput
              value={formulario.numero}
              onChangeText={(valor) => actualizarCampo("numero", valor)}
              placeholder="Ejemplo: 72900000"
              placeholderTextColor={colors.inputPlaceholder}
              keyboardType="phone-pad"
              style={[
                styles.input,
                isDark && {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
                errores.numero && styles.inputError,
              ]}
            />
            {errores.numero ? (
              <Text style={styles.textoError}>{errores.numero}</Text>
            ) : null}
          </View>

          <View style={styles.grupoCampo}>
            <Text
              style={[
                styles.etiquetaCampo,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Correo electrónico
            </Text>
            <TextInput
              value={formulario.email}
              onChangeText={(valor) => actualizarCampo("email", valor)}
              placeholder="cliente@correo.com"
              placeholderTextColor={colors.inputPlaceholder}
              keyboardType="email-address"
              autoCapitalize="none"
              style={[
                styles.input,
                isDark && {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
                errores.email && styles.inputError,
              ]}
            />
            {errores.email ? (
              <Text style={styles.textoError}>{errores.email}</Text>
            ) : null}
          </View>

          <View style={styles.grupoCampo}>
            <Text
              style={[
                styles.etiquetaCampo,
                isDark && { color: colors.textSecondary },
              ]}
            >
              {clienteSeleccionado ? "Nueva contraseña" : "Contraseña"}
            </Text>
            <TextInput
              value={formulario.contrasena}
              onChangeText={(valor) => actualizarCampo("contrasena", valor)}
              placeholder={
                clienteSeleccionado
                  ? "Déjala vacía para mantener la actual"
                  : "Mínimo 6 caracteres"
              }
              placeholderTextColor={colors.inputPlaceholder}
              secureTextEntry
              style={[
                styles.input,
                isDark && {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
                errores.contrasena && styles.inputError,
              ]}
            />
            {errores.contrasena ? (
              <Text style={styles.textoError}>{errores.contrasena}</Text>
            ) : null}
          </View>
        </View>
      </ModalSistema>

      <ModalSistema
        visible={modalActivo === "estado"}
        titulo={
          clienteSeleccionado?.estado === "Activo"
            ? "Desactivar cliente"
            : "Reactivar cliente"
        }
        descripcion={
          clienteSeleccionado?.estado === "Activo"
            ? `¿Deseas desactivar a ${clienteSeleccionado?.nombre}? No podrá iniciar sesión mientras esté inactivo.`
            : `¿Deseas reactivar a ${clienteSeleccionado?.nombre}? Volverá a tener acceso al sistema.`
        }
        tipo="confirmacion"
        textoConfirmar={
          clienteSeleccionado?.estado === "Activo"
            ? "Desactivar"
            : "Reactivar"
        }
        cargando={procesando}
        onCerrar={cerrarModal}
        onConfirmar={confirmarCambioEstado}
      />

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