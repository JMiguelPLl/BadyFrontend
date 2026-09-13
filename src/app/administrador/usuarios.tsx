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
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  actualizarUsuario,
  cambiarEstadoUsuario,
  crearUsuario,
  listarRolesActivos,
  listarUsuarios,
} from "../../services/usuarioService";
import {
  RolSelector,
  Usuario,
  UsuarioActualizar,
  UsuarioCrear,
  UsuarioFormulario,
} from "../../types/usuario";
import { styles } from "../../styles/administrador/usuarios.styles";

type FiltroUsuario =
  | "Todos"
  | "Activo"
  | "Inactivo";

type TipoModal =
  | "ninguno"
  | "formulario"
  | "estado"
  | "mensaje";

type TipoMensaje = "exito" | "error";

const formularioInicial: UsuarioFormulario = {
  nombre: "",
  numero: "",
  email: "",
  contrasena: "",
  idRol: "",
};

export default function UsuariosAdministrador() {
  const { colors, isDark } = useAppTheme();

  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [roles, setRoles] = useState<RolSelector[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroUsuario>("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [cargandoRoles, setCargandoRoles] = useState(false);
  const [procesando, setProcesando] = useState(false);

  const [modalActivo, setModalActivo] = useState<TipoModal>("ninguno");
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState<Usuario | null>(null);

  const [formulario, setFormulario] = useState<UsuarioFormulario>(formularioInicial);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<TipoMensaje>("exito");

  useEffect(() => {
    cargarUsuarios();
  }, []);

  const cargarUsuarios = async () => {
    try {
      setCargando(true);
      const data = await listarUsuarios();
      setUsuarios(data);
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los usuarios.",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  const cargarRoles = async () => {
    try {
      setCargandoRoles(true);
      const data = await listarRolesActivos();
      setRoles(data);
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los roles.",
        "error"
      );
    } finally {
      setCargandoRoles(false);
    }
  };

  const seleccionarFiltro = (nuevoFiltro: FiltroUsuario) => {
    setFiltro(nuevoFiltro);
    setMostrarFiltros(false);
  };

  const usuariosFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return usuarios.filter((usuario) => {
      const cumpleFiltro =
        filtro === "Todos"
          ? true
          : usuario.estado.toLowerCase() === filtro.toLowerCase();

      if (!cumpleFiltro) return false;
      if (!texto) return true;

      return (
        usuario.nombre.toLowerCase().includes(texto) ||
        usuario.email.toLowerCase().includes(texto) ||
        usuario.numero.toLowerCase().includes(texto) ||
        usuario.rol.toLowerCase().includes(texto)
      );
    });
  }, [usuarios, busqueda, filtro]);

  const totalActivos = useMemo(
    () =>
      usuarios.filter(
        (u) => u.estado.toLowerCase() === "activo"
      ).length,
    [usuarios]
  );

  const totalInactivos = useMemo(
    () =>
      usuarios.filter(
        (u) => u.estado.toLowerCase() === "inactivo"
      ).length,
    [usuarios]
  );

  const abrirAgregar = async () => {
    setUsuarioSeleccionado(null);
    setFormulario(formularioInicial);
    setErrores({});
    setModalActivo("formulario");
    await cargarRoles();
  };

  const abrirEditar = async (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setFormulario({
      nombre: usuario.nombre,
      numero: usuario.numero,
      email: usuario.email,
      contrasena: "",
      idRol: usuario.idRol.toString(),
    });
    setErrores({});
    setModalActivo("formulario");
    await cargarRoles();
  };

  const abrirCambiarEstado = (usuario: Usuario) => {
    setUsuarioSeleccionado(usuario);
    setModalActivo("estado");
  };

  const cerrarModal = () => {
    if (procesando) return;
    setModalActivo("ninguno");
    setUsuarioSeleccionado(null);
    setFormulario(formularioInicial);
    setErrores({});
  };

  const actualizarCampo = (
    campo: keyof UsuarioFormulario,
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
      nuevosErrores.numero = "El teléfono es obligatorio.";
    } else if (!/^[0-9]{7,12}$/.test(formulario.numero.trim())) {
      nuevosErrores.numero = "Debe tener entre 7 y 12 números.";
    }

    if (!formulario.email.trim()) {
      nuevosErrores.email = "El correo es obligatorio.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formulario.email.trim())
    ) {
      nuevosErrores.email = "Ingresa un correo electrónico válido.";
    }

    if (!usuarioSeleccionado) {
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

    if (!formulario.idRol) {
      nuevosErrores.idRol = "Debes seleccionar un rol.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarUsuario = async () => {
    if (!validarFormulario()) return;

    try {
      setProcesando(true);

      if (usuarioSeleccionado) {
        const payload: UsuarioActualizar = {
          nombre: formulario.nombre.trim(),
          telefono: formulario.numero.trim(),
          email: formulario.email.trim(),
          idRol: Number(formulario.idRol),
          contrasena: formulario.contrasena.trim() || undefined,
        };

        await actualizarUsuario(usuarioSeleccionado.id, payload);
        await cargarUsuarios();
        cerrarModal();
        mostrarMensaje("Usuario actualizado correctamente.", "exito");
      } else {
        const payload: UsuarioCrear = {
          nombre: formulario.nombre.trim(),
          numero: formulario.numero.trim(),
          email: formulario.email.trim(),
          contrasena: formulario.contrasena.trim(),
          idRol: Number(formulario.idRol),
        };

        await crearUsuario(payload);
        await cargarUsuarios();
        cerrarModal();
        mostrarMensaje("Usuario registrado correctamente.", "exito");
      }
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el usuario.",
        "error"
      );
    } finally {
      setProcesando(false);
    }
  };

  const confirmarCambioEstado = async () => {
    if (!usuarioSeleccionado) return;

    try {
      setProcesando(true);
      const nuevoEstado =
        usuarioSeleccionado.estado === "Activo" ? "Inactivo" : "Activo";
      await cambiarEstadoUsuario(usuarioSeleccionado.id, nuevoEstado);
      await cargarUsuarios();
      cerrarModal();
      mostrarMensaje(
        `Estado del usuario cambiado correctamente.`,
        "exito"
      );
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado.",
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
            Usuarios
          </Text>
          <Text
            style={[
              styles.subtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Administra los usuarios y asigna sus roles en el sistema.
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
          <Ionicons name="add-outline" size={20} color="#ffffff" />
          <Text style={styles.botonAgregarTexto}>Agregar usuario</Text>
        </Pressable>
      </View>

      <View style={styles.resumen}>
        <TarjetaResumen
          icono="people-outline"
          valor={usuarios.length}
          etiqueta="Total de usuarios"
          tipo="normal"
        />
        <TarjetaResumen
          icono="checkmark-circle-outline"
          valor={totalActivos}
          etiqueta="Usuarios activos"
          tipo="activo"
        />
        <TarjetaResumen
          icono="close-circle-outline"
          valor={totalInactivos}
          etiqueta="Usuarios inactivos"
          tipo="inactivo"
        />
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
              placeholder="Buscar usuario por nombre, correo o rol..."
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

          <View style={styles.contenedorBotones}>
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
                  {filtro === "Todos"
                    ? "Filtrar"
                    : filtro === "Activo"
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
                </View>
              )}
            </View>

            <Pressable
              onPress={cargarUsuarios}
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
              Cargando usuarios...
            </Text>
          </View>
        ) : usuariosFiltrados.length === 0 ? (
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
              No se encontraron usuarios
            </Text>
            <Text
              style={[
                styles.estadoTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Prueba con otra búsqueda o selecciona otro filtro.
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
                  styles.columnaRol,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Rol
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

            {usuariosFiltrados.map((usuario) => (
              <View
                key={usuario.id}
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
                  #{usuario.id}
                </Text>

                <View
                  style={[
                    styles.celdaUsuario,
                    styles.columnaNombre,
                  ]}
                >
                  <View
                    style={[
                      styles.avatarUsuario,
                      isDark && { backgroundColor: colors.surfaceElevated },
                    ]}
                  >
                    <Text
                      style={[
                        styles.avatarTexto,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {usuario.nombre.charAt(0).toUpperCase()}
                    </Text>
                  </View>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.nombreUsuario,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {usuario.nombre}
                  </Text>
                </View>

                <Text
                  numberOfLines={1}
                  style={[
                    styles.celda,
                    styles.columnaCorreo,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  {usuario.email}
                </Text>

                <Text
                  style={[
                    styles.celda,
                    styles.columnaTelefono,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  {usuario.numero}
                </Text>

                <View
                  style={[
                    styles.celdaRol,
                    styles.columnaRol,
                  ]}
                >
                  <View
                    style={[
                      styles.rolBadge,
                      isDark && {
                        backgroundColor: "rgba(67, 56, 202, 0.22)",
                      },
                    ]}
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={14}
                      color={isDark ? "#818cf8" : "#4338ca"}
                    />
                    <Text
                      style={[
                        styles.rolTexto,
                        isDark && { color: "#818cf8" },
                      ]}
                    >
                      {usuario.rol}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.celdaEstado,
                    styles.columnaEstado,
                  ]}
                >
                  <View
                    style={[
                      styles.estadoBadge,
                      usuario.estado === "Activo"
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
                        usuario.estado === "Activo"
                          ? styles.puntoActivo
                          : styles.puntoInactivo,
                      ]}
                    />
                    <Text
                      style={[
                        styles.estadoTextoBadge,
                        usuario.estado === "Activo"
                          ? isDark
                            ? { color: "#4ade80" }
                            : styles.estadoActivoTexto
                          : isDark
                            ? { color: colors.dangerText }
                            : styles.estadoInactivoTexto,
                      ]}
                    >
                      {usuario.estado}
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
                    onPress={() => abrirEditar(usuario)}
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
                      size={17}
                      color={isDark ? "#60a5fa" : "#1d4ed8"}
                    />
                  </Pressable>

                  <Pressable
                    onPress={() => abrirCambiarEstado(usuario)}
                    style={({ pressed }) => [
                      styles.botonAccion,
                      usuario.estado === "Activo"
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
                        usuario.estado === "Activo"
                          ? "trash-outline"
                          : "refresh-outline"
                      }
                      size={17}
                      color={
                        usuario.estado === "Activo"
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
          </View>
        )}

        <View
          style={[
            styles.pieTabla,
            isDark && { borderTopColor: colors.borderLight },
          ]}
        >
          <Text
            style={[
              styles.pieTablaTexto,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Mostrando {usuariosFiltrados.length} de {usuarios.length} usuarios
          </Text>
        </View>
      </View>

      <ModalSistema
        visible={modalActivo === "formulario"}
        titulo={
          usuarioSeleccionado
            ? "Editar usuario"
            : "Agregar usuario"
        }
        descripcion={
          usuarioSeleccionado
            ? "Modifica los datos y el rol del usuario seleccionado."
            : "Completa los datos y selecciona un rol activo."
        }
        tipo="formulario"
        textoConfirmar={
          usuarioSeleccionado
            ? "Guardar cambios"
            : "Registrar usuario"
        }
        cargando={procesando}
        onCerrar={cerrarModal}
        onConfirmar={guardarUsuario}
      >
        <View style={styles.formulario}>
          <Campo
            etiqueta="Nombre completo"
            error={errores.nombre}
          >
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
          </Campo>

          <View style={styles.gridCampos}>
            <View style={styles.columnaCampo}>
              <Campo
                etiqueta="Número de teléfono"
                error={errores.numero}
              >
                <TextInput
                  value={formulario.numero}
                  onChangeText={(valor) =>
                    actualizarCampo("numero", valor.replace(/[^0-9]/g, ""))
                  }
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
              </Campo>
            </View>

            <View style={styles.columnaCampo}>
              <Campo
                etiqueta="Correo electrónico"
                error={errores.email}
              >
                <TextInput
                  value={formulario.email}
                  onChangeText={(valor) => actualizarCampo("email", valor)}
                  placeholder="usuario@correo.com"
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
              </Campo>
            </View>
          </View>

          <Campo
            etiqueta={usuarioSeleccionado ? "Nueva contraseña" : "Contraseña"}
            error={errores.contrasena}
          >
            <TextInput
              value={formulario.contrasena}
              onChangeText={(valor) => actualizarCampo("contrasena", valor)}
              placeholder={
                usuarioSeleccionado
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
          </Campo>

          <Campo
            etiqueta="Seleccionar Rol"
            error={errores.idRol}
          >
            {cargandoRoles ? (
              <View style={styles.selectorCargando}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text
                  style={[
                    styles.selectorCargandoTexto,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Cargando roles...
                </Text>
              </View>
            ) : roles.length === 0 ? (
              <Text
                style={[
                  styles.selectorCargandoTexto,
                  isDark && { color: colors.textMuted },
                ]}
              >
                No hay roles disponibles.
              </Text>
            ) : (
              <View style={styles.rolesGrid}>
                {roles.map((rol) => {
                  const seleccionado =
                    formulario.idRol === rol.id.toString();

                  return (
                    <Pressable
                      key={rol.id}
                      onPress={() =>
                        actualizarCampo("idRol", rol.id.toString())
                      }
                      style={[
                        styles.rolCard,
                        isDark && {
                          backgroundColor: colors.surfaceElevated,
                          borderColor: colors.border,
                        },
                        seleccionado && [
                          styles.rolCardSeleccionado,
                          { borderColor: colors.primary },
                          isDark && {
                            backgroundColor: "rgba(200, 35, 27, 0.18)",
                          },
                        ],
                      ]}
                    >
                      <View
                        style={[
                          styles.rolCardIcono,
                          isDark && {
                            backgroundColor: seleccionado
                              ? "rgba(200, 35, 27, 0.25)"
                              : colors.card,
                          },
                        ]}
                      >
                        <Ionicons
                          name="shield-checkmark-outline"
                          size={19}
                          color={
                            seleccionado
                              ? colors.primary
                              : isDark
                                ? colors.textSecondary
                                : "#4b5563"
                          }
                        />
                      </View>

                      <View style={styles.rolCardInfo}>
                        <Text
                          style={[
                            styles.rolCardNombre,
                            isDark && { color: colors.text },
                            seleccionado && {
                              color: isDark ? "#ffffff" : colors.primary,
                              fontWeight: "900",
                            },
                          ]}
                        >
                          {rol.descripcion}
                        </Text>
                      </View>

                      <Ionicons
                        name={
                          seleccionado
                            ? "checkmark-circle"
                            : "ellipse-outline"
                        }
                        size={20}
                        color={
                          seleccionado
                            ? colors.primary
                            : colors.inputPlaceholder
                        }
                      />
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Campo>
        </View>
      </ModalSistema>

      <ModalSistema
        visible={modalActivo === "estado"}
        titulo={
          usuarioSeleccionado?.estado === "Activo"
            ? "Desactivar usuario"
            : "Reactivar usuario"
        }
        descripcion={
          usuarioSeleccionado?.estado === "Activo"
            ? `¿Deseas desactivar a ${usuarioSeleccionado?.nombre}? No podrá iniciar sesión mientras esté inactivo.`
            : `¿Deseas reactivar a ${usuarioSeleccionado?.nombre}? Volverá a tener acceso al sistema.`
        }
        tipo="confirmacion"
        textoConfirmar={
          usuarioSeleccionado?.estado === "Activo"
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

type TarjetaResumenProps = {
  icono: keyof typeof Ionicons.glyphMap;
  valor: number;
  etiqueta: string;
  tipo: "normal" | "activo" | "inactivo";
};

function TarjetaResumen({
  icono,
  valor,
  etiqueta,
  tipo,
}: TarjetaResumenProps) {
  const { colors, isDark } = useAppTheme();

  const estiloIcono =
    tipo === "activo"
      ? isDark
        ? { backgroundColor: "rgba(21, 128, 61, 0.22)" }
        : styles.iconoActivo
      : tipo === "inactivo"
        ? isDark
          ? { backgroundColor: "rgba(200, 35, 27, 0.22)" }
          : styles.iconoInactivo
        : isDark
          ? { backgroundColor: colors.surfaceElevated }
          : styles.iconoResumen;

  const color =
    tipo === "activo"
      ? isDark
        ? "#4ade80"
        : "#15803d"
      : tipo === "inactivo"
        ? colors.primary
        : isDark
          ? colors.text
          : "#1f2329";

  return (
    <View
      style={[
        styles.tarjetaResumen,
        isDark && {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <View style={estiloIcono}>
        <Ionicons name={icono} size={23} color={color} />
      </View>

      <View>
        <Text
          style={[
            styles.valorResumen,
            isDark && { color: colors.text },
          ]}
        >
          {valor}
        </Text>
        <Text
          style={[
            styles.etiquetaResumen,
            isDark && { color: colors.textSecondary },
          ]}
        >
          {etiqueta}
        </Text>
      </View>
    </View>
  );
}

type CampoProps = {
  etiqueta: string;
  error?: string;
  children: React.ReactNode;
};

function Campo({
  etiqueta,
  error,
  children,
}: CampoProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.grupoCampo}>
      <Text
        style={[
          styles.etiquetaCampo,
          isDark && { color: colors.textSecondary },
        ]}
      >
        {etiqueta}
      </Text>
      {children}
      {error && (
        <Text style={styles.textoError}>
          {error}
        </Text>
      )}
    </View>
  );
}

type OpcionFiltroProps = {
  texto: string;
  icono: keyof typeof Ionicons.glyphMap;
  seleccionado: boolean;
  onPress: () => void;
};

function OpcionFiltro({
  texto,
  icono,
  seleccionado,
  onPress,
}: OpcionFiltroProps) {
  const { colors, isDark } = useAppTheme();

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.opcionFiltro,
        isDark && {
          backgroundColor: seleccionado ? "rgba(37, 99, 235, 0.2)" : "transparent",
        },
        seleccionado && styles.opcionFiltroSeleccionada,
        pressed && styles.opcionPresionada,
      ]}
    >
      <Ionicons
        name={icono}
        size={17}
        color={seleccionado ? (isDark ? "#60a5fa" : "#2563eb") : colors.textSecondary}
      />
      <Text
        style={[
          styles.opcionFiltroTexto,
          isDark && { color: colors.text },
          seleccionado && styles.opcionFiltroTextoSeleccionado,
        ]}
      >
        {texto}
      </Text>
    </Pressable>
  );
}