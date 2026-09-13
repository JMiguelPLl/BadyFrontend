import { Ionicons } from "@expo/vector-icons";
import * as Location from "expo-location";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Platform,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import MapaSucursal from "../../components/MapaSucursal";
import { useAppTheme } from "../../hooks/useAppTheme";
import { obtenerUsuario } from "../../services/authService";
import {
  agregarSucursal,
  listarSucursalesCliente,
  modificarSucursal,
  Sucursal,
  SucursalFormulario,
} from "../../services/sucursalService";

type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const ROJO = "#c8231b";

const UBICACION_TUPIZA: Region = {
  latitude: -21.4434,
  longitude: -65.7188,
  latitudeDelta: 0.02,
  longitudeDelta: 0.02,
};

const formularioInicial: SucursalFormulario = {
  nombre: "",
  descripcion: "",
  ubicacion: "",
};

export default function SucursalesCliente() {
  const { colors, isDark } = useAppTheme();

  const [idCliente, setIdCliente] = useState<number | null>(null);
  const [sucursales, setSucursales] = useState<Sucursal[]>([]);
  const [formulario, setFormulario] =
    useState<SucursalFormulario>(formularioInicial);
  const [sucursalEditar, setSucursalEditar] =
    useState<Sucursal | null>(null);
  const [region, setRegion] =
    useState<Region>(UBICACION_TUPIZA);
  const [coordenada, setCoordenada] = useState({
    latitude: UBICACION_TUPIZA.latitude,
    longitude: UBICACION_TUPIZA.longitude,
  });

  const [modalVisible, setModalVisible] = useState(false);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [buscandoUbicacion, setBuscandoUbicacion] = useState(false);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    cargarSucursales();
  }, []);

  const cargarSucursales = async (mostrarCargaPrincipal = true) => {
    try {
      if (mostrarCargaPrincipal) {
        setCargando(true);
      }

      setError("");
      const usuario = await obtenerUsuario();

      if (!usuario?.id) {
        throw new Error(
          "No se pudo identificar al cliente de la sesión."
        );
      }

      setIdCliente(usuario.id);
      const lista = await listarSucursalesCliente(usuario.id);
      setSucursales(lista);
    } catch (errorPeticion) {
      setError(
        errorPeticion instanceof Error
          ? errorPeticion.message
          : "No se pudieron cargar tus sucursales."
      );
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  const seleccionarUbicacion = async (coordenadasSeleccionadas: {
    latitude: number;
    longitude: number;
  }) => {
    try {
      setCoordenada(coordenadasSeleccionadas);
      setRegion({
        latitude: coordenadasSeleccionadas.latitude,
        longitude: coordenadasSeleccionadas.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      const direcciones = await Location.reverseGeocodeAsync({
        latitude: coordenadasSeleccionadas.latitude,
        longitude: coordenadasSeleccionadas.longitude,
      });

      if (direcciones.length > 0) {
        const d = direcciones[0];
        const partes = [
          d.street,
          d.streetNumber,
          d.district,
          d.city || d.subregion,
          d.region,
        ].filter(Boolean);

        const direccionTexto = partes.join(", ");
        if (direccionTexto) {
          setFormulario((anterior) => ({
            ...anterior,
            ubicacion: direccionTexto,
          }));
        }
      }
    } catch {
      setFormulario((anterior) => ({
        ...anterior,
        ubicacion: `Ubicación seleccionada (${coordenadasSeleccionadas.latitude.toFixed(
          5
        )}, ${coordenadasSeleccionadas.longitude.toFixed(5)})`,
      }));
    }
  };

  const obtenerUbicacionActual = async () => {
    try {
      setBuscandoUbicacion(true);
      setError("");

      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError(
          "Se necesitan permisos de ubicación para detectar tu posición actual."
        );
        return;
      }

      const ubicacion = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const nuevaCoordenada = {
        latitude: ubicacion.coords.latitude,
        longitude: ubicacion.coords.longitude,
      };

      setCoordenada(nuevaCoordenada);
      setRegion({
        latitude: nuevaCoordenada.latitude,
        longitude: nuevaCoordenada.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });

      await seleccionarUbicacion(nuevaCoordenada);
    } catch (errorUbicacion) {
      setError(
        errorUbicacion instanceof Error
          ? errorUbicacion.message
          : "No se pudo obtener tu ubicación."
      );
    } finally {
      setBuscandoUbicacion(false);
    }
  };

  const buscarDireccionExistente = async (direccion: string) => {
    try {
      setBuscandoUbicacion(true);
      const resultados = await Location.geocodeAsync(direccion);

      if (resultados.length === 0) {
        return;
      }

      const primeraUbicacion = resultados[0];
      setCoordenada({
        latitude: primeraUbicacion.latitude,
        longitude: primeraUbicacion.longitude,
      });

      setRegion({
        latitude: primeraUbicacion.latitude,
        longitude: primeraUbicacion.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    } catch {
      setRegion(UBICACION_TUPIZA);
      setCoordenada({
        latitude: UBICACION_TUPIZA.latitude,
        longitude: UBICACION_TUPIZA.longitude,
      });
    } finally {
      setBuscandoUbicacion(false);
    }
  };

  const abrirAgregar = async () => {
    setSucursalEditar(null);
    setFormulario(formularioInicial);
    setError("");
    setRegion(UBICACION_TUPIZA);
    setCoordenada({
      latitude: UBICACION_TUPIZA.latitude,
      longitude: UBICACION_TUPIZA.longitude,
    });

    setModalVisible(true);

    if (Platform.OS !== "web") {
      await obtenerUbicacionActual();
    }
  };

  const abrirEditar = async (sucursal: Sucursal) => {
    setSucursalEditar(sucursal);
    setFormulario({
      nombre: sucursal.nombre,
      descripcion: sucursal.descripcion,
      ubicacion: sucursal.ubicacion,
    });

    setError("");
    setModalVisible(true);

    if (Platform.OS !== "web" && sucursal.ubicacion) {
      await buscarDireccionExistente(sucursal.ubicacion);
    }
  };

  const cerrarModal = () => {
    if (guardando) {
      return;
    }

    setModalVisible(false);
    setSucursalEditar(null);
    setFormulario(formularioInicial);
    setError("");
    setRegion(UBICACION_TUPIZA);
    setCoordenada({
      latitude: UBICACION_TUPIZA.latitude,
      longitude: UBICACION_TUPIZA.longitude,
    });
  };

  const cambiarCampo = (
    campo: keyof SucursalFormulario,
    valor: string
  ) => {
    setFormulario((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
    setError("");
  };

  const guardarSucursal = async () => {
    if (!idCliente) {
      setError("No se encontró el cliente de la sesión.");
      return;
    }

    if (!formulario.nombre.trim()) {
      setError("El nombre de la sucursal es obligatorio.");
      return;
    }

    if (!formulario.descripcion.trim()) {
      setError("La descripción de la sucursal es obligatoria.");
      return;
    }

    if (!formulario.ubicacion.trim()) {
      setError(
        Platform.OS === "web"
          ? "Escribe la dirección de la sucursal."
          : "Selecciona la ubicación de la sucursal en el mapa."
      );
      return;
    }

    const editando = Boolean(sucursalEditar);

    try {
      setGuardando(true);
      setError("");

      const datos: SucursalFormulario = {
        nombre: formulario.nombre.trim(),
        descripcion: formulario.descripcion.trim(),
        ubicacion: formulario.ubicacion.trim(),
      };

      if (sucursalEditar) {
        await modificarSucursal(sucursalEditar.id, idCliente, datos);
      } else {
        await agregarSucursal(idCliente, datos);
      }

      setModalVisible(false);
      setSucursalEditar(null);
      setFormulario(formularioInicial);

      await cargarSucursales(false);

      Alert.alert(
        "Correcto",
        editando
          ? "Sucursal modificada correctamente."
          : "Sucursal registrada correctamente."
      );
    } catch (errorPeticion) {
      setError(
        errorPeticion instanceof Error
          ? errorPeticion.message
          : "No se pudo guardar la sucursal."
      );
    } finally {
      setGuardando(false);
    }
  };

  const refrescar = () => {
    setActualizando(true);
    cargarSucursales(false);
  };

  if (cargando) {
    return (
      <View
        style={[
          styles.loading,
          { backgroundColor: colors.background },
        ]}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text
          style={[
            styles.loadingText,
            isDark && { color: colors.textSecondary },
          ]}
        >
          Cargando sucursales...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={refrescar}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <View style={styles.headerInformation}>
            <Text
              style={[
                styles.title,
                isDark && { color: colors.text },
              ]}
            >
              Mis sucursales
            </Text>
            <Text
              style={[
                styles.subtitle,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Administra tus sucursales registradas
            </Text>
          </View>

          <Pressable
            style={[
              styles.addHeaderButton,
              { backgroundColor: colors.primary },
            ]}
            onPress={abrirAgregar}
          >
            <Ionicons name="add" size={25} color="#ffffff" />
          </Pressable>
        </View>

        <Pressable
          style={[
            styles.newBranchButton,
            { backgroundColor: colors.primary },
          ]}
          onPress={abrirAgregar}
        >
          <View style={styles.newBranchIcon}>
            <Ionicons
              name="storefront-outline"
              size={25}
              color={colors.primary}
            />
          </View>

          <View style={styles.newBranchInformation}>
            <Text style={styles.newBranchTitle}>
              Agregar nueva sucursal
            </Text>
            <Text style={styles.newBranchDescription}>
              Registra una nueva sucursal
            </Text>
          </View>

          <Ionicons
            name="chevron-forward"
            size={22}
            color="#ffffff"
          />
        </Pressable>

        {error && !modalVisible ? (
          <View
            style={[
              styles.errorContainer,
              isDark && {
                backgroundColor: colors.dangerBg,
                borderColor: colors.dangerBorder,
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
                styles.errorText,
                { color: colors.dangerText },
              ]}
            >
              {error}
            </Text>
          </View>
        ) : null}

        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              isDark && { color: colors.text },
            ]}
          >
            Sucursales registradas
          </Text>

          <View
            style={[
              styles.counter,
              isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
            ]}
          >
            <Text
              style={[
                styles.counterText,
                { color: colors.primary },
              ]}
            >
              {sucursales.length}
            </Text>
          </View>
        </View>

        {sucursales.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={[
                styles.emptyIcon,
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Ionicons
                name="storefront-outline"
                size={42}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.emptyTitle,
                isDark && { color: colors.text },
              ]}
            >
              No tienes sucursales
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Registra tu primera sucursal para realizar pedidos.
            </Text>

            <Pressable
              style={[
                styles.emptyButton,
                { backgroundColor: colors.primary },
              ]}
              onPress={abrirAgregar}
            >
              <Text style={styles.emptyButtonText}>
                Agregar sucursal
              </Text>
            </Pressable>
          </View>
        ) : (
          <View style={styles.list}>
            {sucursales.map((sucursal) => (
              <View
                key={sucursal.id}
                style={[
                  styles.card,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.cardTop}>
                  <View
                    style={[
                      styles.branchIcon,
                      isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                    ]}
                  >
                    <Ionicons
                      name="business-outline"
                      size={25}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.branchInformation}>
                    <View style={styles.nameRow}>
                      <Text
                        style={[
                          styles.branchName,
                          isDark && { color: colors.text },
                        ]}
                        numberOfLines={1}
                      >
                        {sucursal.nombre}
                      </Text>

                      <View
                        style={[
                          styles.activeBadge,
                          isDark && { backgroundColor: "rgba(21, 128, 61, 0.22)" },
                        ]}
                      >
                        <Text
                          style={[
                            styles.activeBadgeText,
                            isDark && { color: "#4ade80" },
                          ]}
                        >
                          {sucursal.estado}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.description,
                        isDark && { color: colors.textSecondary },
                      ]}
                      numberOfLines={3}
                    >
                      {sucursal.descripcion}
                    </Text>
                  </View>
                </View>

                <Pressable
                  style={[
                    styles.editButton,
                    isDark && {
                      backgroundColor: "rgba(200, 35, 27, 0.18)",
                      borderColor: "rgba(200, 35, 27, 0.35)",
                    },
                  ]}
                  onPress={() => abrirEditar(sucursal)}
                >
                  <Ionicons
                    name="create-outline"
                    size={19}
                    color={colors.primary}
                  />
                  <Text
                    style={[
                      styles.editButtonText,
                      { color: colors.primary },
                    ]}
                  >
                    Editar sucursal
                  </Text>
                </Pressable>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={cerrarModal}
      >
        <View
          style={[
            styles.modalOverlay,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <View
            style={[
              styles.modalCard,
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
              contentContainerStyle={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderInformation}>
                  <Text
                    style={[
                      styles.modalTitle,
                      isDark && { color: colors.text },
                    ]}
                  >
                    {sucursalEditar
                      ? "Editar sucursal"
                      : "Nueva sucursal"}
                  </Text>
                  <Text
                    style={[
                      styles.modalSubtitle,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Completa los datos y selecciona la ubicación
                  </Text>
                </View>

                <Pressable
                  style={[
                    styles.closeButton,
                    isDark && { backgroundColor: colors.surfaceElevated },
                  ]}
                  onPress={cerrarModal}
                >
                  <Ionicons
                    name="close"
                    size={23}
                    color={isDark ? colors.textSecondary : "#555c65"}
                  />
                </Pressable>
              </View>

              {error ? (
                <View
                  style={[
                    styles.modalError,
                    isDark && {
                      backgroundColor: colors.dangerBg,
                      borderColor: colors.dangerBorder,
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
                      styles.errorText,
                      { color: colors.dangerText },
                    ]}
                  >
                    {error}
                  </Text>
                </View>
              ) : null}

              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.label,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Nombre de la sucursal
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    isDark && {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <Ionicons
                    name="business-outline"
                    size={20}
                    color={colors.inputPlaceholder}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      isDark && { color: colors.text },
                    ]}
                    placeholder="Sucursal Central"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={formulario.nombre}
                    onChangeText={(texto) =>
                      cambiarCampo("nombre", texto)
                    }
                    editable={!guardando}
                    maxLength={150}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.label,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Descripción
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    styles.textAreaContainer,
                    isDark && {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <Ionicons
                    name="document-text-outline"
                    size={20}
                    color={colors.inputPlaceholder}
                    style={styles.textAreaIcon}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      styles.textArea,
                      isDark && { color: colors.text },
                    ]}
                    placeholder="Descripción de la sucursal"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={formulario.descripcion}
                    onChangeText={(texto) =>
                      cambiarCampo("descripcion", texto)
                    }
                    multiline
                    textAlignVertical="top"
                    editable={!guardando}
                    maxLength={300}
                  />
                </View>

                <Text
                  style={[
                    styles.characterCounter,
                    isDark && { color: colors.textMuted },
                  ]}
                >
                  {formulario.descripcion.length}/300
                </Text>
              </View>

              <View style={styles.locationHeader}>
                <View>
                  <Text
                    style={[
                      styles.label,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Ubicación
                  </Text>
                  <Text
                    style={[
                      styles.locationSubtitle,
                      isDark && { color: colors.textMuted },
                    ]}
                  >
                    {Platform.OS === "web"
                      ? "Escribe la dirección manualmente."
                      : "Selecciona el punto exacto en el mapa."}
                  </Text>
                </View>

                {Platform.OS !== "web" ? (
                  <Pressable
                    style={[
                      styles.currentLocationButton,
                      isDark && {
                        backgroundColor: "rgba(200, 35, 27, 0.18)",
                        borderColor: "rgba(200, 35, 27, 0.35)",
                      },
                    ]}
                    onPress={obtenerUbicacionActual}
                    disabled={buscandoUbicacion}
                  >
                    {buscandoUbicacion ? (
                      <ActivityIndicator
                        color={colors.primary}
                        size="small"
                      />
                    ) : (
                      <>
                        <Ionicons
                          name="locate"
                          size={18}
                          color={colors.primary}
                        />
                        <Text
                          style={[
                            styles.currentLocationText,
                            { color: colors.primary },
                          ]}
                        >
                          Mi ubicación
                        </Text>
                      </>
                    )}
                  </Pressable>
                ) : null}
              </View>

              <View
                style={[
                  styles.mapContainer,
                  isDark && {
                    borderColor: colors.border,
                    backgroundColor: colors.surfaceElevated,
                  },
                ]}
              >
                <MapaSucursal
                  region={region}
                  coordenada={coordenada}
                  onRegionChange={setRegion}
                  onSeleccionar={(lat, lng) =>
                    seleccionarUbicacion({ latitude: lat, longitude: lng })
                  }
                />
              </View>

              <Text
                style={[
                  styles.mapHelp,
                  isDark && { color: colors.textMuted },
                ]}
              >
                {Platform.OS === "web"
                  ? "El mapa interactivo está disponible en Android."
                  : "Toca el mapa o arrastra el marcador para cambiar la ubicación."}
              </Text>

              <View style={styles.formGroup}>
                <Text
                  style={[
                    styles.label,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  Dirección seleccionada
                </Text>

                <View
                  style={[
                    styles.inputContainer,
                    styles.locationInput,
                    isDark && {
                      backgroundColor: colors.inputBg,
                      borderColor: colors.inputBorder,
                    },
                  ]}
                >
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color={colors.inputPlaceholder}
                  />
                  <TextInput
                    style={[
                      styles.input,
                      styles.locationTextInput,
                      isDark && { color: colors.text },
                    ]}
                    placeholder="Dirección de la sucursal"
                    placeholderTextColor={colors.inputPlaceholder}
                    value={formulario.ubicacion}
                    onChangeText={(texto) =>
                      cambiarCampo("ubicacion", texto)
                    }
                    editable={!guardando}
                    multiline
                    textAlignVertical="center"
                    maxLength={300}
                  />
                </View>
              </View>

              <View style={styles.modalActions}>
                <Pressable
                  style={[
                    styles.cancelButton,
                    isDark && {
                      backgroundColor: colors.surfaceElevated,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={cerrarModal}
                  disabled={guardando}
                >
                  <Text
                    style={[
                      styles.cancelButtonText,
                      isDark && { color: colors.textSecondary },
                    ]}
                  >
                    Cancelar
                  </Text>
                </Pressable>

                <Pressable
                  style={[
                    styles.saveButton,
                    { backgroundColor: colors.primary },
                    guardando && styles.disabledButton,
                  ]}
                  onPress={guardarSucursal}
                  disabled={guardando}
                >
                  {guardando ? (
                    <ActivityIndicator color="#ffffff" />
                  ) : (
                    <>
                      <Ionicons
                        name="save-outline"
                        size={19}
                        color="#ffffff"
                      />
                      <Text style={styles.saveButtonText}>
                        {sucursalEditar
                          ? "Guardar cambios"
                          : "Registrar"}
                      </Text>
                    </>
                  )}
                </Pressable>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },
  content: {
    width: "100%",
    maxWidth: 760,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 35,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f5f6f8",
  },
  loadingText: {
    marginTop: 12,
    color: "#737a83",
    fontSize: 13,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },
  headerInformation: {
    flex: 1,
    marginRight: 15,
  },
  title: {
    color: "#20242a",
    fontSize: 27,
    fontWeight: "800",
  },
  subtitle: {
    marginTop: 4,
    color: "#7e858e",
    fontSize: 12,
  },
  addHeaderButton: {
    width: 47,
    height: 47,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ROJO,
  },
  newBranchButton: {
    minHeight: 90,
    padding: 15,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 19,
    backgroundColor: ROJO,
  },
  newBranchIcon: {
    width: 51,
    height: 51,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  newBranchInformation: {
    flex: 1,
    marginHorizontal: 13,
  },
  newBranchTitle: {
    color: "#ffffff",
    fontSize: 15,
    fontWeight: "800",
  },
  newBranchDescription: {
    marginTop: 4,
    color: "rgba(255,255,255,0.78)",
    fontSize: 11,
  },
  errorContainer: {
    marginTop: 17,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: "#f3c4c0",
    borderRadius: 13,
    backgroundColor: "#fff1f0",
  },
  errorText: {
    flex: 1,
    color: "#ad2018",
    fontSize: 12,
    lineHeight: 17,
  },
  sectionHeader: {
    marginTop: 27,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    color: "#292e34",
    fontSize: 18,
    fontWeight: "800",
  },
  counter: {
    minWidth: 27,
    height: 27,
    marginLeft: 9,
    paddingHorizontal: 8,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0ef",
  },
  counterText: {
    color: ROJO,
    fontSize: 12,
    fontWeight: "800",
  },
  list: {
    gap: 13,
  },
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#e8eaed",
    borderRadius: 19,
    backgroundColor: "#ffffff",
  },
  cardTop: {
    flexDirection: "row",
  },
  branchIcon: {
    width: 50,
    height: 50,
    marginRight: 13,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0ef",
  },
  branchInformation: {
    flex: 1,
  },
  nameRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  branchName: {
    flex: 1,
    color: "#292e34",
    fontSize: 15,
    fontWeight: "800",
  },
  activeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 9,
    backgroundColor: "#e8f8ee",
  },
  activeBadgeText: {
    color: "#21834a",
    fontSize: 9,
    fontWeight: "800",
  },
  description: {
    marginTop: 6,
    color: "#7d848d",
    fontSize: 12,
    lineHeight: 17,
  },
  editButton: {
    height: 42,
    marginTop: 15,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#f0c2be",
    borderRadius: 12,
    backgroundColor: "#fff7f6",
  },
  editButtonText: {
    color: ROJO,
    fontSize: 12,
    fontWeight: "800",
  },
  emptyContainer: {
    alignItems: "center",
    paddingHorizontal: 25,
    paddingVertical: 40,
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },
  emptyIcon: {
    width: 76,
    height: 76,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0ef",
  },
  emptyTitle: {
    marginTop: 16,
    color: "#2e3339",
    fontSize: 17,
    fontWeight: "800",
  },
  emptyDescription: {
    marginTop: 7,
    color: "#858c94",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
  },
  emptyButton: {
    minHeight: 43,
    marginTop: 18,
    paddingHorizontal: 20,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: ROJO,
  },
  emptyButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  modalOverlay: {
    flex: 1,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(18,21,25,0.55)",
  },
  modalCard: {
    width: "100%",
    maxWidth: 550,
    maxHeight: "94%",
    borderRadius: 24,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },
  modalContent: {
    padding: 22,
    paddingBottom: 28,
  },
  modalHeader: {
    marginBottom: 22,
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  modalHeaderInformation: {
    flex: 1,
    marginRight: 12,
  },
  modalTitle: {
    color: "#24292f",
    fontSize: 22,
    fontWeight: "800",
  },
  modalSubtitle: {
    marginTop: 5,
    color: "#838a92",
    fontSize: 12,
    lineHeight: 17,
  },
  closeButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f2f3f5",
  },
  modalError: {
    marginBottom: 17,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 12,
    backgroundColor: "#fff1f0",
  },
  formGroup: {
    marginBottom: 17,
  },
  label: {
    marginBottom: 8,
    color: "#454c54",
    fontSize: 12,
    fontWeight: "700",
  },
  inputContainer: {
    minHeight: 52,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#dfe2e6",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },
  input: {
    flex: 1,
    minHeight: 50,
    color: "#282d33",
    fontSize: 13,
  },
  textAreaContainer: {
    minHeight: 105,
    alignItems: "flex-start",
  },
  textAreaIcon: {
    marginTop: 15,
  },
  textArea: {
    minHeight: 100,
    paddingTop: 14,
    paddingBottom: 12,
  },
  characterCounter: {
    marginTop: 5,
    color: "#9a9fa6",
    fontSize: 10,
    textAlign: "right",
  },
  locationHeader: {
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },
  locationSubtitle: {
    marginTop: -3,
    color: "#8a9199",
    fontSize: 10,
  },
  currentLocationButton: {
    minHeight: 39,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#efc3bf",
    borderRadius: 12,
    backgroundColor: "#fff7f6",
  },
  currentLocationText: {
    color: ROJO,
    fontSize: 11,
    fontWeight: "800",
  },
  mapContainer: {
    height: 240,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#e1e3e6",
    borderRadius: 17,
    backgroundColor: "#fff7f6",
  },
  mapHelp: {
    marginTop: 8,
    marginBottom: 15,
    color: "#838a92",
    fontSize: 11,
    lineHeight: 16,
  },
  locationInput: {
    minHeight: 62,
    alignItems: "flex-start",
  },
  locationTextInput: {
    minHeight: 58,
    paddingTop: 10,
    paddingBottom: 10,
  },
  modalActions: {
    marginTop: 8,
    flexDirection: "row",
    gap: 11,
  },
  cancelButton: {
    flex: 1,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dfe2e6",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },
  cancelButtonText: {
    color: "#59616a",
    fontSize: 12,
    fontWeight: "700",
  },
  saveButton: {
    flex: 1.5,
    height: 49,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 14,
    backgroundColor: ROJO,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },
  disabledButton: {
    opacity: 0.65,
  },
});