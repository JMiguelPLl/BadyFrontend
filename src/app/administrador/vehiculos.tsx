import { Ionicons } from "@expo/vector-icons";
import { Picker } from "@react-native-picker/picker";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import Paginacion from "../../components/comun/Paginacion";
import { useAppTheme } from "../../hooks/useAppTheme";
import { usePaginacion } from "../../hooks/usePaginacion";
import {
  cambiarEstadoAsignacion,
  crearAsignacion,
  editarAsignacion,
  listarAsignaciones,
  obtenerDetalleVehiculo,
  quitarUsuarioVehiculo,
} from "../../services/asignacionVehiculoService";
import {
  cambiarEstadoVehiculo,
  crearVehiculo,
  editarVehiculo,
  listarVehiculos,
  listarVehiculosActivos,
} from "../../services/vehiculoService";
import { listarUsuarios } from "../../services/usuarioService";

import {
  AsignacionForm,
  AsignacionVehiculo,
  DetalleVehiculoAsignado,
  Estado,
  Vehiculo,
  VehiculoForm,
} from "../../types/vehiculo";
import { Usuario } from "../../types/usuario";
import { styles } from "../../styles/administrador/vehiculos.styles";

type Seccion = "vehiculos" | "asignaciones";

type ModalTipo =
  | "ninguno"
  | "vehiculo"
  | "asignacion"
  | "estadoVehiculo"
  | "estadoAsignacion"
  | "detalleVehiculo"
  | "quitarUsuario"
  | "mensaje";

const formVehiculoInicial: VehiculoForm = {
  marca: "",
  placa: "",
  cantidadCarga: "",
};

const formAsignacionInicial: AsignacionForm = {
  idVehiculo: "",
  idUsuario: "",
};

export default function VehiculosAdministrador() {
  const { colors, isDark } = useAppTheme();

  const [seccion, setSeccion] = useState<Seccion>("vehiculos");
  const [cargando, setCargando] = useState(true);
  const [procesando, setProcesando] = useState(false);

  const [vehiculos, setVehiculos] = useState<Vehiculo[]>([]);
  const [asignaciones, setAsignaciones] = useState<AsignacionVehiculo[]>([]);
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [vehiculosActivos, setVehiculosActivos] = useState<Vehiculo[]>([]);

  const [buscarVehiculo, setBuscarVehiculo] = useState("");
  const [buscarAsignacion, setBuscarAsignacion] = useState("");

  const [modal, setModal] = useState<ModalTipo>("ninguno");
  const [vehiculoActual, setVehiculoActual] = useState<Vehiculo | null>(null);
  const [asignacionActual, setAsignacionActual] =
    useState<AsignacionVehiculo | null>(null);
  const [detalleVehiculo, setDetalleVehiculo] =
    useState<DetalleVehiculoAsignado | null>(null);

  const [formVehiculo, setFormVehiculo] =
    useState<VehiculoForm>(formVehiculoInicial);
  const [formAsignacion, setFormAsignacion] =
    useState<AsignacionForm>(formAsignacionInicial);

  const [mensaje, setMensaje] = useState("");
  const [esError, setEsError] = useState(false);

  useEffect(() => {
    cargar();
  }, []);

  const cargar = async () => {
    try {
      setCargando(true);

      const [dataVehiculos, dataAsignaciones, dataUsuarios, dataActivos] =
        await Promise.all([
          listarVehiculos(),
          listarAsignaciones(),
          listarUsuarios(),
          listarVehiculosActivos(),
        ]);

      setVehiculos(dataVehiculos);
      setAsignaciones(dataAsignaciones);
      setUsuarios(dataUsuarios.filter((u) => u.estado === "Activo"));
      setVehiculosActivos(dataActivos);
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudieron cargar los datos.",
        true
      );
    } finally {
      setCargando(false);
    }
  };

  const cantidadUsuariosPorVehiculo = useMemo(() => {
    const mapa = new Map<number, number>();

    asignaciones
      .filter((a) => a.estado === "Activo")
      .forEach((a) => {
        mapa.set(a.idVehiculo, (mapa.get(a.idVehiculo) ?? 0) + 1);
      });

    return mapa;
  }, [asignaciones]);

  const vehiculosFiltrados = useMemo(() => {
    const t = buscarVehiculo.trim().toLowerCase();
    if (!t) return vehiculos;

    return vehiculos.filter((v) => {
      const cantidad = String(
        cantidadUsuariosPorVehiculo.get(v.id) ?? 0
      );

      return (
        v.marca.toLowerCase().includes(t) ||
        (v.placa ?? "").toLowerCase().includes(t) ||
        String(v.cantidadCarga).includes(t) ||
        v.estado.toLowerCase().includes(t) ||
        cantidad.includes(t)
      );
    });
  }, [vehiculos, buscarVehiculo, cantidadUsuariosPorVehiculo]);

  const asignacionesFiltradas = useMemo(() => {
    const t = buscarAsignacion.trim().toLowerCase();
    if (!t) return asignaciones;

    return asignaciones.filter(
      (a) =>
        a.usuario.toLowerCase().includes(t) ||
        (a.correoUsuario ?? "").toLowerCase().includes(t) ||
        a.vehiculo.toLowerCase().includes(t) ||
        (a.placa ?? "").toLowerCase().includes(t) ||
        a.estado.toLowerCase().includes(t)
    );
  }, [asignaciones, buscarAsignacion]);

  const abrirMensaje = (texto: string, error = false) => {
    setMensaje(texto);
    setEsError(error);
    setModal("mensaje");
  };

  const abrirNuevoVehiculo = () => {
    setVehiculoActual(null);
    setFormVehiculo(formVehiculoInicial);
    setModal("vehiculo");
  };

  const abrirEditarVehiculo = (vehiculo: Vehiculo) => {
    setVehiculoActual(vehiculo);
    setFormVehiculo({
      marca: vehiculo.marca,
      placa: vehiculo.placa ?? "",
      cantidadCarga: String(vehiculo.cantidadCarga),
    });
    setModal("vehiculo");
  };

  const abrirNuevaAsignacion = (vehiculo?: Vehiculo) => {
    setAsignacionActual(null);
    setFormAsignacion({
      idVehiculo: String(
        vehiculo?.id ??
        (vehiculosActivos.length ? vehiculosActivos[0].id : "")
      ),
      idUsuario: String(usuarios.length ? usuarios[0].id : ""),
    });
    setModal("asignacion");
  };

  const abrirEditarAsignacion = (asignacion: AsignacionVehiculo) => {
    setAsignacionActual(asignacion);
    setFormAsignacion({
      idVehiculo: String(asignacion.idVehiculo),
      idUsuario: String(asignacion.idUsuario),
    });
    setModal("asignacion");
  };

  const abrirDetalle = async (vehiculo: Vehiculo) => {
    try {
      setProcesando(true);
      setVehiculoActual(vehiculo);

      const detalle = await obtenerDetalleVehiculo(vehiculo.id);
      setDetalleVehiculo(detalle);
      setModal("detalleVehiculo");
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cargar el detalle.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const guardarVehiculo = async () => {
    const { marca, cantidadCarga } = formVehiculo;

    if (!marca.trim()) {
      abrirMensaje("La marca es obligatoria.", true);
      return;
    }

    if (!cantidadCarga.trim()) {
      abrirMensaje("La capacidad de carga es obligatoria.", true);
      return;
    }

    try {
      setProcesando(true);

      const datos = {
        marca: marca.trim(),
        placa: formVehiculo.placa.trim() || undefined,
        cantidadCarga: formVehiculo.cantidadCarga.trim(),
      };

      if (vehiculoActual) {
        await editarVehiculo(vehiculoActual.id, datos as any);
        abrirMensaje("Vehículo modificado correctamente.");
      } else {
        await crearVehiculo(datos as any);
        abrirMensaje("Vehículo registrado correctamente.");
      }

      await cargar();
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el vehículo.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const guardarAsignacion = async () => {
    const { idVehiculo, idUsuario } = formAsignacion;

    if (!idVehiculo || !idUsuario) {
      abrirMensaje("Selecciona un vehículo y un usuario.", true);
      return;
    }

    try {
      setProcesando(true);

      if (asignacionActual) {
        await editarAsignacion(asignacionActual.id, {
          idVehiculo: Number(idVehiculo),
          idUsuario: Number(idUsuario),
        });
        abrirMensaje("Asignación modificada correctamente.");
      } else {
        await crearAsignacion({
          idVehiculo: Number(idVehiculo),
          idUsuario: Number(idUsuario),
        });
        abrirMensaje("Usuario asignado correctamente.");
      }

      await cargar();
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo guardar la asignación.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const confirmarEstadoVehiculo = async () => {
    if (!vehiculoActual) return;

    try {
      setProcesando(true);
      const nuevoEstado =
        vehiculoActual.estado === "Activo" ? "Inactivo" : "Activo";
      await cambiarEstadoVehiculo(vehiculoActual.id, nuevoEstado);
      abrirMensaje("Estado del vehículo actualizado.");
      await cargar();
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const confirmarEstadoAsignacion = async () => {
    if (!asignacionActual) return;

    try {
      setProcesando(true);
      const nuevoEstado =
        asignacionActual.estado === "Activo" ? "Inactivo" : "Activo";
      await cambiarEstadoAsignacion(asignacionActual.id, nuevoEstado);
      abrirMensaje("Estado de la asignación actualizado.");
      await cargar();
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo cambiar el estado.",
        true
      );
    } finally {
      setProcesando(false);
    }
  };

  const confirmarQuitarUsuario = async () => {
    if (!asignacionActual) return;

    try {
      setProcesando(true);

      const respuesta = await quitarUsuarioVehiculo(asignacionActual.id);
      const idVehiculo = asignacionActual.idVehiculo;

      setModal("ninguno");
      await cargar();

      const detalle = await obtenerDetalleVehiculo(idVehiculo);
      setDetalleVehiculo(detalle);
      setVehiculoActual(
        vehiculos.find((vehiculo) => vehiculo.id === idVehiculo) ?? null
      );
      setModal("detalleVehiculo");

      if (respuesta.message) {
        setMensaje(respuesta.message);
      }
    } catch (error) {
      abrirMensaje(
        error instanceof Error
          ? error.message
          : "No se pudo quitar el usuario.",
        true
      );
    } finally {
      setProcesando(false);
      setAsignacionActual(null);
    }
  };

  const cerrar = () => {
    if (procesando) return;

    setModal("ninguno");
    setVehiculoActual(null);
    setAsignacionActual(null);
    setDetalleVehiculo(null);
  };

  return (
    <ScrollView
      style={[
        styles.pagina,
        { backgroundColor: colors.background },
      ]}
      contentContainerStyle={styles.contenido}
    >
      <View style={styles.encabezado}>
        <View>
          <Text
            style={[
              styles.titulo,
              isDark && { color: colors.text },
            ]}
          >
            Vehículos
          </Text>
          <Text
            style={[
              styles.subtitulo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            Gestiona vehículos y usuarios asignados.
          </Text>
        </View>

        <Pressable
          onPress={
            seccion === "vehiculos"
              ? abrirNuevoVehiculo
              : () => abrirNuevaAsignacion()
          }
          style={[
            styles.botonRojo,
            { backgroundColor: colors.primary },
          ]}
        >
          <Ionicons name="add-outline" size={20} color="#ffffff" />
          <Text style={styles.botonRojoTexto}>
            {seccion === "vehiculos"
              ? "Agregar vehículo"
              : "Asignar usuario"}
          </Text>
        </Pressable>
      </View>

      <View style={styles.tabs}>
        <Pressable
          onPress={() => setSeccion("vehiculos")}
          style={[
            styles.tab,
            isDark && {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
            seccion === "vehiculos" && [
              styles.tabActivo,
              { borderColor: colors.primary },
              isDark && { backgroundColor: "rgba(200, 35, 27, 0.15)" },
            ],
          ]}
        >
          <Ionicons
            name="car-outline"
            size={18}
            color={
              seccion === "vehiculos"
                ? colors.primary
                : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabTexto,
              isDark && { color: colors.textSecondary },
              seccion === "vehiculos" && [
                styles.tabTextoActivo,
                { color: colors.primary },
              ],
            ]}
          >
            Vehículos
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setSeccion("asignaciones")}
          style={[
            styles.tab,
            isDark && {
              backgroundColor: colors.surfaceElevated,
              borderColor: colors.border,
            },
            seccion === "asignaciones" && [
              styles.tabActivo,
              { borderColor: colors.primary },
              isDark && { backgroundColor: "rgba(200, 35, 27, 0.15)" },
            ],
          ]}
        >
          <Ionicons
            name="people-outline"
            size={18}
            color={
              seccion === "asignaciones"
                ? colors.primary
                : colors.textSecondary
            }
          />
          <Text
            style={[
              styles.tabTexto,
              isDark && { color: colors.textSecondary },
              seccion === "asignaciones" && [
                styles.tabTextoActivo,
                { color: colors.primary },
              ],
            ]}
          >
            Asignaciones
          </Text>
        </Pressable>
      </View>

      <View style={styles.resumen}>
        <Resumen
          valor={
            seccion === "vehiculos"
              ? vehiculos.length
              : asignaciones.length
          }
          texto={
            seccion === "vehiculos"
              ? "Total vehículos"
              : "Total asignaciones"
          }
        />

        <Resumen
          valor={
            seccion === "vehiculos"
              ? vehiculos.filter((v) => v.estado === "Activo").length
              : asignaciones.filter((a) => a.estado === "Activo").length
          }
          texto="Activos"
        />

        <Resumen
          valor={
            seccion === "vehiculos"
              ? vehiculos.filter((v) => v.estado === "Inactivo").length
              : asignaciones.filter((a) => a.estado === "Inactivo").length
          }
          texto="Inactivos"
        />
      </View>

      <View
        style={[
          styles.tablaCard,
          isDark && {
            backgroundColor: colors.card,
            borderColor: colors.border,
          },
        ]}
      >
        <View
          style={[
            styles.herramientas,
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
              value={
                seccion === "vehiculos"
                  ? buscarVehiculo
                  : buscarAsignacion
              }
              onChangeText={
                seccion === "vehiculos"
                  ? setBuscarVehiculo
                  : setBuscarAsignacion
              }
              placeholder={
                seccion === "vehiculos"
                  ? "Buscar por marca, placa o capacidad..."
                  : "Buscar por usuario, correo, vehículo o placa..."
              }
              placeholderTextColor={colors.inputPlaceholder}
              style={[
                styles.inputBusqueda,
                isDark && { color: colors.text },
              ]}
            />
          </View>

          <Pressable
            onPress={cargar}
            style={[
              styles.botonSecundario,
              isDark && {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="refresh-outline"
              size={18}
              color={isDark ? colors.text : "#1f2329"}
            />
            <Text
              style={[
                styles.botonSecundarioTexto,
                isDark && { color: colors.text },
              ]}
            >
              Actualizar
            </Text>
          </Pressable>
        </View>

        {cargando ? (
          <View style={styles.vacio}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text
              style={[
                styles.vacioTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Cargando información...
            </Text>
          </View>
        ) : seccion === "vehiculos" ? (
          <TablaVehiculos
            datos={vehiculosFiltrados}
            cantidadUsuarios={cantidadUsuariosPorVehiculo}
            editar={abrirEditarVehiculo}
            estado={(v) => {
              setVehiculoActual(v);
              setModal("estadoVehiculo");
            }}
            asignar={(v) => abrirNuevaAsignacion(v)}
            detalle={abrirDetalle}
          />
        ) : (
          <TablaAsignaciones
            datos={asignacionesFiltradas}
            editar={abrirEditarAsignacion}
            estado={(a) => {
              setAsignacionActual(a);
              setModal("estadoAsignacion");
            }}
            quitar={(a) => {
              setAsignacionActual(a);
              setModal("quitarUsuario");
            }}
          />
        )}
      </View>

      {/* Modal Vehículo */}
      <ModalFormulario
        visible={modal === "vehiculo"}
        titulo={
          vehiculoActual
            ? "Editar vehículo"
            : "Nuevo vehículo"
        }
        procesando={procesando}
        onCerrar={cerrar}
        onGuardar={guardarVehiculo}
      >
        <Campo etiqueta="Marca">
          <TextInput
            value={formVehiculo.marca}
            onChangeText={(texto) =>
              setFormVehiculo((f) => ({
                ...f,
                marca: texto,
              }))
            }
            placeholder="Ejemplo: Toyota Hilux"
            placeholderTextColor={colors.inputPlaceholder}
            style={[
              styles.input,
              isDark && {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
          />
        </Campo>

        <Campo etiqueta="Placa (opcional)">
          <TextInput
            value={formVehiculo.placa}
            onChangeText={(texto) =>
              setFormVehiculo((f) => ({
                ...f,
                placa: texto,
              }))
            }
            placeholder="Ejemplo: 4589-ABC"
            placeholderTextColor={colors.inputPlaceholder}
            autoCapitalize="characters"
            style={[
              styles.input,
              isDark && {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
          />
        </Campo>

        <Campo etiqueta="Capacidad de carga">
          <TextInput
            value={formVehiculo.cantidadCarga}
            onChangeText={(texto) =>
              setFormVehiculo((f) => ({
                ...f,
                cantidadCarga: texto,
              }))
            }
            placeholder="Ejemplo: 1500 kg"
            placeholderTextColor={colors.inputPlaceholder}
            style={[
              styles.input,
              isDark && {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
                color: colors.text,
              },
            ]}
          />
        </Campo>
      </ModalFormulario>

      {/* Modal Asignación */}
      <ModalFormulario
        visible={modal === "asignacion"}
        titulo={
          asignacionActual
            ? "Editar asignación"
            : "Asignar usuario a vehículo"
        }
        procesando={procesando}
        onCerrar={cerrar}
        onGuardar={guardarAsignacion}
      >
        <Campo etiqueta="Vehículo">
          <View
            style={[
              styles.selectorCaja,
              isDark && {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <Picker
              selectedValue={formAsignacion.idVehiculo}
              onValueChange={(valor) =>
                setFormAsignacion((f) => ({
                  ...f,
                  idVehiculo: String(valor),
                }))
              }
              style={[
                styles.selector,
                {
                  backgroundColor: isDark ? colors.inputBg : "#ffffff",
                  color: isDark ? colors.text : "#1f2329",
                },
              ]}
              dropdownIconColor={colors.textSecondary}
            >
              {vehiculosActivos.map((v) => (
                <Picker.Item
                  key={v.id}
                  label={`${v.marca}${v.placa ? ` - ${v.placa}` : ""}`}
                  value={String(v.id)}
                  color={isDark ? "#f3f4f6" : "#1f2329"}
                  style={{
                    backgroundColor: isDark ? "#1a1d21" : "#ffffff",
                    color: isDark ? "#f3f4f6" : "#1f2329",
                  }}
                />
              ))}
            </Picker>
          </View>
        </Campo>

        <Campo etiqueta="Usuario">
          <View
            style={[
              styles.selectorCaja,
              isDark && {
                backgroundColor: colors.inputBg,
                borderColor: colors.inputBorder,
              },
            ]}
          >
            <Picker
              selectedValue={formAsignacion.idUsuario}
              onValueChange={(valor) =>
                setFormAsignacion((f) => ({
                  ...f,
                  idUsuario: String(valor),
                }))
              }
              style={[
                styles.selector,
                {
                  backgroundColor: isDark ? colors.inputBg : "#ffffff",
                  color: isDark ? colors.text : "#1f2329",
                },
              ]}
              dropdownIconColor={colors.textSecondary}
            >
              {usuarios.map((u) => (
                <Picker.Item
                  key={u.id}
                  label={`${u.nombre} (${u.email})`}
                  value={String(u.id)}
                  color={isDark ? "#f3f4f6" : "#1f2329"}
                  style={{
                    backgroundColor: isDark ? "#1a1d21" : "#ffffff",
                    color: isDark ? "#f3f4f6" : "#1f2329",
                  }}
                />
              ))}
            </Picker>
          </View>
        </Campo>
      </ModalFormulario>

      {/* Modal Confirmar Estado Vehículo */}
      <ModalConfirmar
        visible={modal === "estadoVehiculo"}
        titulo={
          vehiculoActual?.estado === "Activo"
            ? "Desactivar vehículo"
            : "Reactivar vehículo"
        }
        texto={`¿Deseas ${
          vehiculoActual?.estado === "Activo"
            ? "desactivar"
            : "reactivar"
        } el vehículo ${vehiculoActual?.marca}?`}
        procesando={procesando}
        onCerrar={cerrar}
        onConfirmar={confirmarEstadoVehiculo}
      />

      {/* Modal Confirmar Estado Asignación */}
      <ModalConfirmar
        visible={modal === "estadoAsignacion"}
        titulo={
          asignacionActual?.estado === "Activo"
            ? "Desactivar asignación"
            : "Reactivar asignación"
        }
        texto={`¿Deseas ${
          asignacionActual?.estado === "Activo"
            ? "desactivar"
            : "reactivar"
        } la asignación de ${asignacionActual?.usuario}?`}
        procesando={procesando}
        onCerrar={cerrar}
        onConfirmar={confirmarEstadoAsignacion}
      />

      {/* Modal Quitar Usuario */}
      <ModalConfirmar
        visible={modal === "quitarUsuario"}
        titulo="Quitar usuario del vehículo"
        texto={`¿Deseas quitar a ${asignacionActual?.usuario} del vehículo ${asignacionActual?.vehiculo}?`}
        procesando={procesando}
        onCerrar={cerrar}
        onConfirmar={confirmarQuitarUsuario}
      />

      {/* Modal Detalle Vehículo */}
      <Modal
        visible={modal === "detalleVehiculo"}
        transparent
        animationType="fade"
        onRequestClose={cerrar}
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
              styles.modalAmplio,
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.modalHead,
                isDark && { borderBottomColor: colors.borderLight },
              ]}
            >
              <Text
                style={[
                  styles.modalTitulo,
                  isDark && { color: colors.text },
                ]}
              >
                Detalle del vehículo
              </Text>
              <Pressable onPress={cerrar} style={styles.cerrar}>
                <Ionicons
                  name="close"
                  size={22}
                  color={isDark ? colors.textSecondary : "#4b5158"}
                />
              </Pressable>
            </View>

            {detalleVehiculo ? (
              <ScrollView style={styles.modalBody}>
                <View
                  style={[
                    styles.detalleVehiculoCabecera,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.detalleVehiculoTitulo,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {detalleVehiculo.marca}
                  </Text>
                  <Text
                    style={[
                      styles.detalleVehiculoTexto,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Placa: {detalleVehiculo.placa || "Sin placa"} · Capacidad:{" "}
                    {detalleVehiculo.cantidadCarga}
                  </Text>
                  <Text
                    style={[
                      styles.detalleVehiculoTexto,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Estado: {detalleVehiculo.estadoVehiculo}
                  </Text>
                </View>

                <View style={{ marginTop: 10 }}>
                  <Text
                    style={[
                      styles.etiqueta,
                      { fontSize: 14, marginBottom: 10 },
                      isDark && { color: colors.text },
                    ]}
                  >
                    Usuarios asignados ({detalleVehiculo.usuariosAsignados.length})
                  </Text>

                  {!detalleVehiculo.usuariosAsignados.length ? (
                    <Text
                      style={[
                        styles.vacioTexto,
                        isDark && { color: colors.textMuted },
                      ]}
                    >
                      Este vehículo no tiene usuarios activos asignados.
                    </Text>
                  ) : (
                    detalleVehiculo.usuariosAsignados.map((u) => (
                      <View
                        key={u.idAsignacion}
                        style={[
                          styles.usuarioAsignadoCard,
                          isDark && {
                            backgroundColor: colors.surfaceElevated,
                            borderColor: colors.border,
                          },
                        ]}
                      >
                        <View style={styles.usuarioAsignadoInfo}>
                          <Text
                            style={[
                              styles.usuarioAsignadoNombre,
                              isDark && { color: colors.text },
                            ]}
                          >
                            {u.usuario}
                          </Text>
                          <Text
                            style={[
                              styles.usuarioAsignadoCorreo,
                              isDark && { color: colors.textSecondary },
                            ]}
                          >
                            {u.correo || "Sin correo"}
                          </Text>
                          <Text
                            style={[
                              styles.usuarioAsignadoFecha,
                              isDark && { color: colors.textMuted },
                            ]}
                          >
                            Asignado: {formatearFecha(u.fechaAsignacion)}
                          </Text>
                        </View>

                        <Pressable
                          onPress={() => {
                            setAsignacionActual({
                              id: u.idAsignacion,
                              idVehiculo: detalleVehiculo.idVehiculo,
                              idUsuario: u.idUsuario,
                              usuario: u.usuario,
                              correoUsuario: u.correo,
                              vehiculo: detalleVehiculo.marca,
                              placa: detalleVehiculo.placa,
                              cantidadCarga: detalleVehiculo.cantidadCarga,
                              fecha: u.fechaAsignacion,
                              estado: "Activo",
                            });
                            setModal("quitarUsuario");
                          }}
                          style={[
                            styles.botonQuitar,
                            isDark && {
                              backgroundColor: colors.dangerBg,
                              borderColor: colors.dangerBorder,
                            },
                          ]}
                        >
                          <Ionicons
                            name="trash-outline"
                            size={15}
                            color={colors.dangerText}
                          />
                          <Text
                            style={[
                              styles.botonQuitarTexto,
                              { color: colors.dangerText },
                            ]}
                          >
                            Quitar
                          </Text>
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            ) : (
              <View style={styles.vacio}>
                <ActivityIndicator size="large" color={colors.primary} />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal Mensaje */}
      <Modal
        visible={modal === "mensaje"}
        transparent
        animationType="fade"
        onRequestClose={() => setModal("ninguno")}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.mensajeModal,
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <Ionicons
              name={
                esError
                  ? "alert-circle-outline"
                  : "checkmark-circle-outline"
              }
              size={48}
              color={esError ? colors.dangerText : (isDark ? "#4ade80" : "#15803d")}
            />
            <Text
              style={[
                styles.mensajeTitulo,
                isDark && { color: colors.text },
              ]}
            >
              {esError ? "Ocurrió un problema" : "Operación exitosa"}
            </Text>
            <Text
              style={[
                styles.mensajeTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              {mensaje}
            </Text>

            <Pressable
              onPress={() => setModal("ninguno")}
              style={[
                styles.botonRojo,
                { backgroundColor: colors.primary, marginTop: 15, minWidth: 140 },
              ]}
            >
              <Text style={styles.botonRojoTexto}>Entendido</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function Resumen({
  valor,
  texto,
}: {
  valor: number;
  texto: string;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <View
      style={[
        styles.resumenCard,
        isDark && {
          backgroundColor: colors.card,
          borderColor: colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.resumenValor,
          isDark && { color: colors.text },
        ]}
      >
        {valor}
      </Text>
      <Text
        style={[
          styles.resumenTexto,
          isDark && { color: colors.textSecondary },
        ]}
      >
        {texto}
      </Text>
    </View>
  );
}

function EstadoBadge({ estado }: { estado: Estado }) {
  const { colors, isDark } = useAppTheme();
  const activo = estado === "Activo";

  return (
    <View
      style={[
        styles.estadoBadge,
        activo
          ? isDark
            ? { backgroundColor: "rgba(21, 128, 61, 0.22)" }
            : styles.activo
          : isDark
            ? { backgroundColor: "rgba(200, 35, 27, 0.22)" }
            : styles.inactivo,
      ]}
    >
      <Text
        style={
          activo
            ? isDark
              ? { color: "#4ade80" }
              : styles.estadoActivoTexto
            : isDark
              ? { color: colors.dangerText }
              : styles.estadoInactivoTexto
        }
      >
        {estado}
      </Text>
    </View>
  );
}

function Accion({
  icono,
  tipo,
  onPress,
}: {
  icono: keyof typeof Ionicons.glyphMap;
  tipo: "editar" | "eliminar" | "activar" | "asignar" | "detalle";
  onPress: () => void;
}) {
  const { colors, isDark } = useAppTheme();

  const estilo =
    tipo === "editar"
      ? isDark
        ? { backgroundColor: "rgba(29, 78, 216, 0.18)", borderColor: "rgba(29, 78, 216, 0.35)" }
        : styles.editar
      : tipo === "activar"
        ? isDark
          ? { backgroundColor: "rgba(21, 128, 61, 0.18)", borderColor: "rgba(21, 128, 61, 0.35)" }
          : styles.activar
        : tipo === "asignar"
          ? isDark
            ? { backgroundColor: "rgba(124, 58, 237, 0.18)", borderColor: "rgba(124, 58, 237, 0.35)" }
            : styles.asignar
          : tipo === "detalle"
            ? isDark
              ? { backgroundColor: "rgba(180, 83, 9, 0.18)", borderColor: "rgba(180, 83, 9, 0.35)" }
              : styles.detalle
            : isDark
              ? { backgroundColor: colors.dangerBg, borderColor: colors.dangerBorder }
              : styles.eliminar;

  const color =
    tipo === "editar"
      ? isDark
        ? "#60a5fa"
        : "#1d4ed8"
      : tipo === "activar"
        ? isDark
          ? "#4ade80"
          : "#15803d"
        : tipo === "asignar"
          ? isDark
            ? "#a78bfa"
            : "#7c3aed"
          : tipo === "detalle"
            ? isDark
              ? "#fbbf24"
              : "#b45309"
            : colors.dangerText;

  return (
    <Pressable
      onPress={onPress}
      style={[styles.botonIcono, estilo]}
    >
      <Ionicons name={icono} size={18} color={color} />
    </Pressable>
  );
}

function TablaVehiculos({
  datos,
  cantidadUsuarios,
  editar,
  estado,
  asignar,
  detalle,
}: {
  datos: Vehiculo[];
  cantidadUsuarios: Map<number, number>;
  editar: (vehiculo: Vehiculo) => void;
  estado: (vehiculo: Vehiculo) => void;
  asignar: (vehiculo: Vehiculo) => void;
  detalle: (vehiculo: Vehiculo) => void;
}) {
  const { colors, isDark } = useAppTheme();
  const {
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    setRegistrosPorPagina,
    totalPaginas,
    totalRegistros,
    datosPaginados,
  } = usePaginacion(datos);

  if (!datos.length) {
    return (
      <View style={styles.vacio}>
        <Ionicons
          name="car-outline"
          size={45}
          color={colors.textMuted}
        />
        <Text
          style={[
            styles.vacioTexto,
            isDark && { color: colors.textSecondary },
          ]}
        >
          No se encontraron vehículos.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tabla}>
      <View
        style={[
          styles.filaHead,
          isDark && { backgroundColor: colors.surfaceElevated },
        ]}
      >
        <Text style={[styles.head, styles.id, isDark && { color: colors.textSecondary }]}>
          ID
        </Text>
        <Text style={[styles.head, styles.marca, isDark && { color: colors.textSecondary }]}>
          Marca
        </Text>
        <Text style={[styles.head, styles.placa, isDark && { color: colors.textSecondary }]}>
          Placa
        </Text>
        <Text style={[styles.head, styles.carga, isDark && { color: colors.textSecondary }]}>
          Capacidad
        </Text>
        <Text style={[styles.head, styles.usuarios, isDark && { color: colors.textSecondary }]}>
          Usuarios
        </Text>
        <Text style={[styles.head, styles.estado, isDark && { color: colors.textSecondary }]}>
          Estado
        </Text>
        <Text
          style={[
            styles.head,
            styles.acciones,
            { textAlign: "right" },
            isDark && { color: colors.textSecondary },
          ]}
        >
          Acciones
        </Text>
      </View>

      {datosPaginados.map((vehiculo) => (
        <View
          key={vehiculo.id}
          style={[
            styles.fila,
            isDark && {
              backgroundColor: colors.card,
              borderTopColor: colors.borderLight,
            },
          ]}
        >
          <Text style={[styles.celda, styles.id, isDark && { color: colors.textSecondary }]}>
            #{vehiculo.id}
          </Text>

          <View style={[styles.marcaCelda, styles.marca]}>
            <View
              style={[
                styles.iconoAuto,
                isDark && { backgroundColor: colors.primary },
              ]}
            >
              <Ionicons
                name="car-sport-outline"
                size={19}
                color="#ffffff"
              />
            </View>

            <Text
              numberOfLines={1}
              style={[
                styles.marcaTexto,
                isDark && { color: colors.text },
              ]}
            >
              {vehiculo.marca}
            </Text>
          </View>

          <Text style={[styles.celda, styles.placa, isDark && { color: colors.textSecondary }]}>
            {vehiculo.placa || "Sin placa"}
          </Text>

          <Text style={[styles.celda, styles.carga, isDark && { color: colors.textSecondary }]}>
            {vehiculo.cantidadCarga}
          </Text>

          <View style={styles.usuarios}>
            <View
              style={[
                styles.contadorUsuarios,
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Text
                style={[
                  styles.contadorUsuariosTexto,
                  { color: colors.primary },
                ]}
              >
                {cantidadUsuarios.get(vehiculo.id) ?? 0}
              </Text>
            </View>
          </View>

          <View style={styles.estado}>
            <EstadoBadge estado={vehiculo.estado} />
          </View>

          <View style={[styles.accionesCelda, styles.acciones]}>
            <Accion
              icono="eye-outline"
              tipo="detalle"
              onPress={() => detalle(vehiculo)}
            />
            <Accion
              icono="create-outline"
              tipo="editar"
              onPress={() => editar(vehiculo)}
            />
            <Accion
              icono="person-add-outline"
              tipo="asignar"
              onPress={() => asignar(vehiculo)}
            />
            <Accion
              icono={
                vehiculo.estado === "Activo"
                  ? "trash-outline"
                  : "refresh-outline"
              }
              tipo={
                vehiculo.estado === "Activo"
                  ? "eliminar"
                  : "activar"
              }
              onPress={() => estado(vehiculo)}
            />
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
  );
}

function TablaAsignaciones({
  datos,
  editar,
  estado,
  quitar,
}: {
  datos: AsignacionVehiculo[];
  editar: (asignacion: AsignacionVehiculo) => void;
  estado: (asignacion: AsignacionVehiculo) => void;
  quitar: (asignacion: AsignacionVehiculo) => void;
}) {
  const { colors, isDark } = useAppTheme();
  const {
    paginaActual,
    setPaginaActual,
    registrosPorPagina,
    setRegistrosPorPagina,
    totalPaginas,
    totalRegistros,
    datosPaginados,
  } = usePaginacion(datos);

  if (!datos.length) {
    return (
      <View style={styles.vacio}>
        <Ionicons
          name="people-outline"
          size={45}
          color={colors.textMuted}
        />
        <Text
          style={[
            styles.vacioTexto,
            isDark && { color: colors.textSecondary },
          ]}
        >
          No se encontraron asignaciones.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.tabla}>
      <View
        style={[
          styles.filaHead,
          isDark && { backgroundColor: colors.surfaceElevated },
        ]}
      >
        <Text style={[styles.head, styles.id, isDark && { color: colors.textSecondary }]}>
          ID
        </Text>
        <Text style={[styles.head, styles.usuario, isDark && { color: colors.textSecondary }]}>
          Usuario
        </Text>
        <Text style={[styles.head, styles.vehiculo, isDark && { color: colors.textSecondary }]}>
          Vehículo
        </Text>
        <Text style={[styles.head, styles.placa, isDark && { color: colors.textSecondary }]}>
          Placa
        </Text>
        <Text style={[styles.head, styles.fecha, isDark && { color: colors.textSecondary }]}>
          Fecha
        </Text>
        <Text style={[styles.head, styles.estado, isDark && { color: colors.textSecondary }]}>
          Estado
        </Text>
        <Text
          style={[
            styles.head,
            styles.acciones,
            { textAlign: "right" },
            isDark && { color: colors.textSecondary },
          ]}
        >
          Acciones
        </Text>
      </View>

      {datosPaginados.map((asignacion) => (
        <View
          key={asignacion.id}
          style={[
            styles.fila,
            isDark && {
              backgroundColor: colors.card,
              borderTopColor: colors.borderLight,
            },
          ]}
        >
          <Text style={[styles.celda, styles.id, isDark && { color: colors.textSecondary }]}>
            #{asignacion.id}
          </Text>

          <View style={[styles.usuarioCelda, styles.usuario]}>
            <View
              style={[
                styles.avatar,
                isDark && { backgroundColor: colors.surfaceElevated },
              ]}
            >
              <Text
                style={[
                  styles.avatarTexto,
                  isDark && { color: colors.text },
                ]}
              >
                {asignacion.usuario.charAt(0).toUpperCase()}
              </Text>
            </View>

            <View style={styles.usuarioInfo}>
              <Text
                numberOfLines={1}
                style={[
                  styles.usuarioNombre,
                  isDark && { color: colors.text },
                ]}
              >
                {asignacion.usuario}
              </Text>
              <Text
                numberOfLines={1}
                style={[
                  styles.usuarioCorreo,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                {asignacion.correoUsuario || "Sin correo"}
              </Text>
            </View>
          </View>

          <Text
            numberOfLines={1}
            style={[
              styles.celda,
              styles.vehiculo,
              isDark && { color: colors.textSecondary },
            ]}
          >
            {asignacion.vehiculo}
          </Text>

          <Text style={[styles.celda, styles.placa, isDark && { color: colors.textSecondary }]}>
            {asignacion.placa || "Sin placa"}
          </Text>

          <Text style={[styles.celda, styles.fecha, isDark && { color: colors.textSecondary }]}>
            {formatearFecha(asignacion.fecha)}
          </Text>

          <View style={styles.estado}>
            <EstadoBadge estado={asignacion.estado} />
          </View>

          <View style={[styles.accionesCelda, styles.acciones]}>
            <Accion
              icono="create-outline"
              tipo="editar"
              onPress={() => editar(asignacion)}
            />

            {asignacion.estado === "Activo" && (
              <Accion
                icono="person-remove-outline"
                tipo="eliminar"
                onPress={() => quitar(asignacion)}
              />
            )}

            {asignacion.estado === "Inactivo" && (
              <Accion
                icono="refresh-outline"
                tipo="activar"
                onPress={() => estado(asignacion)}
              />
            )}
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
  );
}

function Campo({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: React.ReactNode;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={styles.campo}>
      <Text
        style={[
          styles.etiqueta,
          isDark && { color: colors.textSecondary },
        ]}
      >
        {etiqueta}
      </Text>
      {children}
    </View>
  );
}

function ModalFormulario({
  visible,
  titulo,
  procesando,
  onCerrar,
  onGuardar,
  children,
}: {
  visible: boolean;
  titulo: string;
  procesando: boolean;
  onCerrar: () => void;
  onGuardar: () => void;
  children: React.ReactNode;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
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
            isDark && {
              backgroundColor: colors.modalBg,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <View
            style={[
              styles.modalHead,
              isDark && { borderBottomColor: colors.borderLight },
            ]}
          >
            <Text
              style={[
                styles.modalTitulo,
                isDark && { color: colors.text },
              ]}
            >
              {titulo}
            </Text>

            <Pressable onPress={onCerrar} style={styles.cerrar}>
              <Ionicons
                name="close"
                size={22}
                color={isDark ? colors.textSecondary : "#4b5158"}
              />
            </Pressable>
          </View>

          <View style={styles.modalBody}>{children}</View>

          <View style={styles.modalAcciones}>
            <Pressable
              onPress={onCerrar}
              disabled={procesando}
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
              onPress={onGuardar}
              disabled={procesando}
              style={[
                styles.botonModal,
                styles.botonConfirmar,
                { backgroundColor: colors.primary },
              ]}
            >
              {procesando ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmarTexto}>Guardar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ModalConfirmar({
  visible,
  titulo,
  texto,
  procesando,
  onCerrar,
  onConfirmar,
}: {
  visible: boolean;
  titulo: string;
  texto: string;
  procesando: boolean;
  onCerrar: () => void;
  onConfirmar: () => void;
}) {
  const { colors, isDark } = useAppTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onCerrar}
    >
      <View
        style={[
          styles.modalFondo,
          isDark && { backgroundColor: colors.modalBackdrop },
        ]}
      >
        <View
          style={[
            styles.mensajeModal,
            isDark && {
              backgroundColor: colors.modalBg,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <Ionicons
            name="alert-circle-outline"
            size={48}
            color={colors.primary}
          />
          <Text
            style={[
              styles.mensajeTitulo,
              isDark && { color: colors.text },
            ]}
          >
            {titulo}
          </Text>
          <Text
            style={[
              styles.mensajeTexto,
              isDark && { color: colors.textSecondary },
            ]}
          >
            {texto}
          </Text>

          <View style={[styles.modalAcciones, { width: "100%" }]}>
            <Pressable
              onPress={onCerrar}
              disabled={procesando}
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
              onPress={onConfirmar}
              disabled={procesando}
              style={[
                styles.botonModal,
                styles.botonConfirmar,
                { backgroundColor: colors.primary },
              ]}
            >
              {procesando ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.confirmarTexto}>Confirmar</Text>
              )}
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function formatearFecha(fecha: string) {
  if (!fecha) return "Sin fecha";

  const valor = new Date(fecha);
  if (Number.isNaN(valor.getTime())) {
    return fecha;
  }

  return valor.toLocaleString("es-BO", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}