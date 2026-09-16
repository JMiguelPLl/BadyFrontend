import { Ionicons } from "@expo/vector-icons";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
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
  actualizarRol,
  cambiarEstadoRol,
  crearRol,
  listarRoles,
} from "../../services/rolService";
import { styles } from "../../styles/administrador/roles.styles";
import {
  Rol,
  RolFormulario,
} from "../../types/rol";

type FiltroRol =
  | "Todos"
  | "Activo"
  | "Inactivo";

type TipoModal =
  | "ninguno"
  | "formulario"
  | "estado"
  | "mensaje";

type TipoMensaje = "exito" | "error";

const formularioInicial: RolFormulario = {
  descripcion: "",
};

export default function RolesAdministrador() {
  const { colors, isDark } = useAppTheme();

  const [roles, setRoles] = useState<Rol[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<FiltroRol>("Todos");
  const [mostrarFiltros, setMostrarFiltros] = useState(false);

  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [modalActivo, setModalActivo] = useState<TipoModal>("ninguno");
  const [rolSeleccionado, setRolSeleccionado] = useState<Rol | null>(null);

  const [formulario, setFormulario] = useState<RolFormulario>(formularioInicial);
  const [errores, setErrores] = useState<Record<string, string>>({});

  const [mensaje, setMensaje] = useState("");
  const [tipoMensaje, setTipoMensaje] = useState<TipoMensaje>("exito");

  useEffect(() => {
    cargarRoles();
  }, []);

  const cargarRoles = async () => {
    try {
      setCargando(true);
      const data = await listarRoles();
      setRoles(data);
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los roles.",
        "error"
      );
    } finally {
      setCargando(false);
    }
  };

  const seleccionarFiltro = (nuevoFiltro: FiltroRol) => {
    setFiltro(nuevoFiltro);
    setMostrarFiltros(false);
  };

  const rolesFiltrados = useMemo(() => {
    const texto = busqueda.trim().toLowerCase();

    return roles.filter((rol) => {
      const cumpleFiltro =
        filtro === "Todos"
          ? true
          : rol.estado.toLowerCase() === filtro.toLowerCase();

      if (!cumpleFiltro) return false;
      if (!texto) return true;

      return (
        rol.descripcion.toLowerCase().includes(texto) ||
        rol.estado.toLowerCase().includes(texto)
      );
    });
  }, [roles, busqueda, filtro]);

  const totalActivos = useMemo(
    () =>
      roles.filter(
        (r) => r.estado.toLowerCase() === "activo"
      ).length,
    [roles]
  );

  const totalInactivos = useMemo(
    () =>
      roles.filter(
        (r) => r.estado.toLowerCase() === "inactivo"
      ).length,
    [roles]
  );

  const {
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    setRegistrosPorPagina,
    totalPaginas,
    totalRegistros,
    datosPaginados: rolesPaginados,
  } = usePaginacion(rolesFiltrados);

  const abrirAgregar = () => {
    setRolSeleccionado(null);
    setFormulario(formularioInicial);
    setErrores({});
    setModalActivo("formulario");
  };

  const abrirEditar = (rol: Rol) => {
    setRolSeleccionado(rol);
    setFormulario({
      descripcion: rol.descripcion,
    });
    setErrores({});
    setModalActivo("formulario");
  };

  const abrirCambiarEstado = (rol: Rol) => {
    setRolSeleccionado(rol);
    setModalActivo("estado");
  };

  const cerrarModal = () => {
    if (procesando) return;
    setModalActivo("ninguno");
    setRolSeleccionado(null);
    setFormulario(formularioInicial);
    setErrores({});
  };

  const actualizarCampo = (
    campo: keyof RolFormulario,
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

    if (!formulario.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción del rol es obligatoria.";
    } else if (formulario.descripcion.trim().length < 3) {
      nuevosErrores.descripcion = "Debe tener al menos 3 caracteres.";
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const guardarRol = async () => {
    if (!validarFormulario()) return;

    try {
      setProcesando(true);

      const payload: RolFormulario = {
        descripcion: formulario.descripcion.trim(),
      };

      if (rolSeleccionado) {
        await actualizarRol(rolSeleccionado.id, payload);
        await cargarRoles();
        cerrarModal();
        mostrarMensaje("Rol actualizado correctamente.", "exito");
      } else {
        await crearRol(payload);
        await cargarRoles();
        cerrarModal();
        mostrarMensaje("Rol registrado correctamente.", "exito");
      }
    } catch (error) {
      mostrarMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el rol.",
        "error"
      );
    } finally {
      setProcesando(false);
    }
  };

  const confirmarCambioEstado = async () => {
    if (!rolSeleccionado) return;

    try {
      setProcesando(true);
      await cambiarEstadoRol(rolSeleccionado.id);
      await cargarRoles();
      cerrarModal();
      mostrarMensaje(
        `Estado del rol cambiado correctamente.`,
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
            Roles
          </Text>
          <Text
            style={[
              styles.subtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Administra los roles y permisos de acceso al sistema.
          </Text>
        </View>

       
      </View>

      <View style={styles.resumen}>
        <TarjetaResumen
          icono="shield-outline"
          valor={roles.length}
          etiqueta="Total de roles"
          tipo="normal"
        />
        <TarjetaResumen
          icono="checkmark-circle-outline"
          valor={totalActivos}
          etiqueta="Roles activos"
          tipo="activo"
        />
        <TarjetaResumen
          icono="close-circle-outline"
          valor={totalInactivos}
          etiqueta="Roles inactivos"
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
              placeholder="Buscar rol..."
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
              onPress={cargarRoles}
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
              Cargando roles...
            </Text>
          </View>
        ) : rolesFiltrados.length === 0 ? (
          <View style={styles.estadoCentro}>
            <Ionicons
              name="shield-outline"
              size={52}
              color={colors.textMuted}
            />
            <Text
              style={[
                styles.estadoTitulo,
                isDark && { color: colors.text },
              ]}
            >
              No se encontraron roles
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
                  styles.columnaDescripcion,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Descripción
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

              {rolesPaginados.map((rol) => (
                <View
                  key={rol.id}
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
                    #{rol.id}
                  </Text>

                  <View
                    style={[
                      styles.celdaRol,
                      styles.columnaDescripcion,
                    ]}
                  >
                    <View
                      style={[
                        styles.iconoRol,
                        isDark && { backgroundColor: colors.primary },
                      ]}
                    >
                      <Ionicons
                        name="shield-checkmark-outline"
                        size={18}
                        color="#ffffff"
                      />
                    </View>

                    <Text
                      numberOfLines={1}
                      style={[
                        styles.nombreRol,
                        isDark && { color: colors.text },
                      ]}
                    >
                      {rol.descripcion}
                    </Text>
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
                        rol.estado === "Activo"
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
                          rol.estado === "Activo"
                            ? styles.puntoActivo
                            : styles.puntoInactivo,
                        ]}
                      />
                      <Text
                        style={[
                          styles.estadoTextoBadge,
                          rol.estado === "Activo"
                            ? isDark
                              ? { color: "#4ade80" }
                              : styles.estadoActivoTexto
                            : isDark
                              ? { color: colors.dangerText }
                              : styles.estadoInactivoTexto,
                        ]}
                      >
                        {rol.estado}
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
                      onPress={() => abrirEditar(rol)}
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
                      onPress={() => abrirCambiarEstado(rol)}
                      style={({ pressed }) => [
                        styles.botonAccion,
                        rol.estado === "Activo"
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
                          rol.estado === "Activo"
                            ? "trash-outline"
                            : "refresh-outline"
                        }
                        size={18}
                        color={
                          rol.estado === "Activo"
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

        {Platform.OS !== "web" && (
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
              Mostrando {rolesFiltrados.length} de {roles.length} roles
            </Text>
          </View>
        )}
      </View>

      <ModalSistema
        visible={modalActivo === "formulario"}
        titulo={
          rolSeleccionado
            ? "Editar rol"
            : "Agregar rol"
        }
        descripcion={
          rolSeleccionado
            ? "Modifica la descripción del rol seleccionado."
            : "Ingresa el nombre del nuevo rol para el sistema."
        }
        tipo="formulario"
        textoConfirmar={
          rolSeleccionado
            ? "Guardar cambios"
            : "Registrar rol"
        }
        cargando={procesando}
        onCerrar={cerrarModal}
        onConfirmar={guardarRol}
      >
        <View style={styles.formulario}>
          <Campo
            etiqueta="Descripción del rol"
            error={errores.descripcion}
          >
            <TextInput
              value={formulario.descripcion}
              onChangeText={(valor) =>
                actualizarCampo("descripcion", valor)
              }
              placeholder="Ejemplo: Vendedor"
              placeholderTextColor={colors.inputPlaceholder}
              style={[
                styles.input,
                isDark && {
                  backgroundColor: colors.inputBg,
                  borderColor: colors.inputBorder,
                  color: colors.text,
                },
                errores.descripcion && styles.inputError,
              ]}
            />
          </Campo>
        </View>
      </ModalSistema>

      <ModalSistema
        visible={modalActivo === "estado"}
        titulo={
          rolSeleccionado?.estado === "Activo"
            ? "Desactivar rol"
            : "Reactivar rol"
        }
        descripcion={
          rolSeleccionado?.estado === "Activo"
            ? `¿Deseas desactivar el rol "${rolSeleccionado?.descripcion}"? Los usuarios asociados perderán estos permisos.`
            : `¿Deseas reactivar el rol "${rolSeleccionado?.descripcion}"? Volverá a estar disponible para asignaciones.`
        }
        tipo="confirmacion"
        textoConfirmar={
          rolSeleccionado?.estado === "Activo"
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