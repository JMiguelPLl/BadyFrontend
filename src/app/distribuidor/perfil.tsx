import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";
import {
  actualizarPerfil,
  obtenerPerfil,
} from "../../services/distribuidorService";
import { BLANCO, ROJO, styles } from "../../styles/distribuidorStyles";
import { PerfilDistribuidor } from "../../types/distribuidor";

export default function PerfilDistribuidorScreen() {
  const router = useRouter();
  const { isDark, colors, toggleTheme } = useAppTheme();

  const [perfil, setPerfil] = useState<PerfilDistribuidor | null>(null);

  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setCargando(true);
      const datos = await obtenerPerfil();
      setPerfil(datos);
      setNombre(datos.nombre || "");
      setTelefono(datos.numero || datos.telefono || "");
      setEmail(datos.email || "");
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al cargar el perfil.";
      Alert.alert("Error", mensaje);
    } finally {
      setCargando(false);
    }
  };

  const validarFormulario = () => {
    if (!nombre.trim()) {
      Alert.alert("Campo requerido", "Ingresa tu nombre completo.");
      return false;
    }

    if (!telefono.trim()) {
      Alert.alert("Campo requerido", "Ingresa tu número de teléfono.");
      return false;
    }

    if (contrasena && contrasena.length < 6) {
      Alert.alert(
        "Contraseña inválida",
        "La nueva contraseña debe tener al menos 6 caracteres."
      );
      return false;
    }

    if (contrasena !== confirmarContrasena) {
      Alert.alert(
        "Contraseñas diferentes",
        "La nueva contraseña y su confirmación no coinciden."
      );
      return false;
    }

    return true;
  };

  const guardarCambios = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setGuardando(true);

      const respuesta = await actualizarPerfil({
        id: perfil?.id,
        nombre: nombre.trim(),
        email: email.trim(),
        telefono: telefono.trim(),
        numero: telefono.trim(),
        idRol: perfil?.idRol,
        contrasena: contrasena.trim() || undefined,
      });

      setPerfil((actual) =>
        actual
          ? {
              ...actual,
              nombre: nombre.trim(),
              telefono: telefono.trim(),
              numero: telefono.trim(),
            }
          : null
      );

      setContrasena("");
      setConfirmarContrasena("");
      setEditando(false);

      Alert.alert(
        "Perfil actualizado",
        respuesta?.message ?? "Tus datos fueron actualizados correctamente."
      );
    } catch (error) {
      const mensaje =
        error instanceof Error
          ? error.message
          : "Ocurrió un error al actualizar el perfil.";
      Alert.alert("Error", mensaje);
    } finally {
      setGuardando(false);
    }
  };

  const cancelarEdicion = () => {
    if (!perfil) return;
    setNombre(perfil.nombre || "");
    setTelefono(perfil.numero || perfil.telefono || "");
    setEmail(perfil.email || "");
    setContrasena("");
    setConfirmarContrasena("");
    setEditando(false);
  };

  const cerrarSesion = () => {
    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas cerrar sesión en este dispositivo?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar sesión",
          style: "destructive",
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(["token", "usuario"]);
              router.replace("/");
            } catch {
              Alert.alert(
                "Error",
                "No se pudo cerrar la sesión. Inténtalo nuevamente."
              );
            }
          },
        },
      ]
    );
  };

  if (cargando) {
    return (
      <View
        style={[
          styles.loadingContainer,
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
          Cargando perfil...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.screen,
        { backgroundColor: colors.background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Encabezado */}
        <View style={styles.perfilHeader}>
          <View>
            <Text
              style={[
                styles.perfilTitulo,
                isDark && { color: colors.text },
              ]}
            >
              Mi perfil
            </Text>
            <Text
              style={[
                styles.perfilSubtitulo,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Administra tus datos y credenciales
            </Text>
          </View>

          {!editando && (
            <Pressable
              style={[
                styles.botonEditar,
                { backgroundColor: colors.primary },
              ]}
              onPress={() => setEditando(true)}
            >
              <Ionicons name="create-outline" size={22} color={BLANCO} />
            </Pressable>
          )}
        </View>

        {/* Sección de Avatar y Estado */}
        <View
          style={[
            styles.avatarContainer,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <View
            style={[
              styles.avatar,
              isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
            ]}
          >
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>

          <Text
            style={[
              styles.nombrePrincipal,
              isDark && { color: colors.text },
            ]}
          >
            {perfil?.nombre || "Distribuidor"}
          </Text>

          <View style={styles.badgeEstadoRolRow}>
            <View
              style={[
                styles.rolBadge,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
            >
              <Text
                style={[
                  styles.rolBadgeTexto,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                {perfil?.rol || "Distribuidor"}
              </Text>
            </View>

            <View
              style={[
                styles.estado,
                perfil?.estado === "Activo" || !perfil?.estado
                  ? isDark
                    ? { backgroundColor: colors.successBg }
                    : styles.estadoActivo
                  : isDark
                  ? { backgroundColor: colors.dangerBg }
                  : styles.estadoInactivo,
              ]}
            >
              <Text
                style={[
                  styles.estadoTexto,
                  perfil?.estado === "Activo" || !perfil?.estado
                    ? { color: colors.successText }
                    : { color: colors.dangerText },
                ]}
              >
                {perfil?.estado || "Activo"}
              </Text>
            </View>
          </View>
        </View>

        {/* Tarjeta de Preferencias de Tema */}
        <View
          style={[
            styles.tarjeta,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
            {
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
              paddingVertical: 14,
            },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
            <View
              style={{
                width: 40,
                height: 40,
                borderRadius: 20,
                backgroundColor: isDark
                  ? "rgba(255, 215, 0, 0.15)"
                  : "rgba(200, 35, 27, 0.12)",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Ionicons
                name={isDark ? "moon" : "sunny"}
                size={22}
                color={isDark ? "#fbbf24" : colors.primary}
              />
            </View>
            <View>
              <Text
                style={{
                  fontSize: 15,
                  fontWeight: "800",
                  color: colors.text,
                }}
              >
                Modo Oscuro
              </Text>
              <Text
                style={{
                  fontSize: 12,
                  color: colors.textSecondary,
                  marginTop: 2,
                }}
              >
                {isDark ? "Tema oscuro activado" : "Tema claro diurno activado"}
              </Text>
            </View>
          </View>

          <Switch
            value={isDark}
            onValueChange={toggleTheme}
            trackColor={{
              false: colors.border,
              true: colors.primary,
            }}
            thumbColor="#ffffff"
          />
        </View>

        {/* Tarjeta de Información Personal */}
        <View
          style={[
            styles.tarjeta,
            isDark && {
              backgroundColor: colors.card,
              borderColor: colors.border,
            },
          ]}
        >
          <CampoFormulario
            etiqueta="Nombre completo"
            icono="person-outline"
            valor={nombre}
            editable={editando}
            onChangeText={setNombre}
            placeholder="Ingresa tu nombre completo"
          />

          <CampoFormulario
            etiqueta="Número de teléfono"
            icono="call-outline"
            valor={telefono}
            editable={editando}
            onChangeText={setTelefono}
            placeholder="Ingresa tu número de teléfono"
            keyboardType="phone-pad"
          />

          <CampoFormulario
            etiqueta="Correo electrónico"
            icono="mail-outline"
            valor={email}
            editable={false}
            onChangeText={() => {}}
            placeholder="Correo electrónico"
            keyboardType="email-address"
          />

          <View
            style={[
              styles.correoAviso,
              isDark && {
                backgroundColor: colors.surfaceElevated,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="lock-closed-outline"
              size={14}
              color={colors.textMuted}
            />
            <Text
              style={[
                styles.correoAvisoTexto,
                isDark && { color: colors.textSecondary },
              ]}
            >
              El correo electrónico no puede modificarse.
            </Text>
          </View>
        </View>

        {/* Tarjeta de Cambio de Contraseña (Visible en Edición) */}
        {editando && (
          <View
            style={[
              styles.tarjeta,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <View style={styles.seccionTituloContainer}>
              <Ionicons name="key-outline" size={21} color={colors.primary} />
              <Text
                style={[
                  styles.seccionTitulo,
                  isDark && { color: colors.text },
                ]}
              >
                Cambiar contraseña
              </Text>
            </View>

            <Text
              style={[
                styles.seccionDescripcion,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Déjala vacía si deseas mantener tu contraseña actual.
            </Text>

            <CampoContrasena
              etiqueta="Nueva contraseña"
              valor={contrasena}
              mostrar={mostrarContrasena}
              onMostrar={() => setMostrarContrasena((v) => !v)}
              onChangeText={setContrasena}
            />

            <CampoContrasena
              etiqueta="Confirmar contraseña"
              valor={confirmarContrasena}
              mostrar={mostrarConfirmacion}
              onMostrar={() => setMostrarConfirmacion((v) => !v)}
              onChangeText={setConfirmarContrasena}
            />
          </View>
        )}

        {/* Acciones de Edición */}
        {editando && (
          <View style={styles.acciones}>
            <Pressable
              style={[
                styles.botonCancelar,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
              ]}
              onPress={cancelarEdicion}
              disabled={guardando}
            >
              <Text
                style={[
                  styles.botonCancelarTexto,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                Cancelar
              </Text>
            </Pressable>

            <Pressable
              style={[
                styles.botonGuardar,
                { backgroundColor: colors.primary },
                guardando && styles.botonDeshabilitado,
              ]}
              onPress={guardarCambios}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color={BLANCO} />
              ) : (
                <>
                  <Ionicons name="save-outline" size={20} color={BLANCO} />
                  <Text style={styles.botonGuardarTexto}>
                    Guardar cambios
                  </Text>
                </>
              )}
            </Pressable>
          </View>
        )}

        {/* Cerrar Sesión */}
        {!editando && (
          <Pressable
            style={[
              styles.botonCerrarSesion,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={cerrarSesion}
          >
            <Ionicons name="log-out-outline" size={20} color={colors.primary} />
            <Text
              style={[
                styles.botonCerrarSesionTexto,
                { color: colors.primary },
              ]}
            >
              Cerrar sesión
            </Text>
          </Pressable>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

type CampoFormularioProps = {
  etiqueta: string;
  icono: keyof typeof Ionicons.glyphMap;
  valor: string;
  editable: boolean;
  onChangeText: (texto: string) => void;
  placeholder: string;
  keyboardType?: "default" | "phone-pad" | "email-address";
};

function CampoFormulario({
  etiqueta,
  icono,
  valor,
  editable,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: CampoFormularioProps) {
  const { isDark, colors } = useAppTheme();

  return (
    <View style={styles.campoContainer}>
      <Text
        style={[
          styles.etiqueta,
          isDark && { color: colors.textSecondary },
        ]}
      >
        {etiqueta}
      </Text>

      <View
        style={[
          styles.inputContainer,
          isDark && {
            backgroundColor: colors.inputBg,
            borderColor: colors.inputBorder,
          },
          !editable && (isDark ? { opacity: 0.6 } : styles.inputDeshabilitado),
        ]}
      >
        <Ionicons
          name={icono}
          size={20}
          color={editable ? colors.primary : colors.textMuted}
        />

        <TextInput
          style={[
            styles.input,
            isDark && { color: colors.text },
          ]}
          value={valor}
          editable={editable}
          onChangeText={onChangeText}
          placeholder={placeholder}
          keyboardType={keyboardType}
          autoCapitalize={
            keyboardType === "email-address" ? "none" : "sentences"
          }
          placeholderTextColor={colors.inputPlaceholder}
        />

        {!editable && (
          <Ionicons name="lock-closed" size={16} color={colors.textMuted} />
        )}
      </View>
    </View>
  );
}

type CampoContrasenaProps = {
  etiqueta: string;
  valor: string;
  mostrar: boolean;
  onMostrar: () => void;
  onChangeText: (texto: string) => void;
};

function CampoContrasena({
  etiqueta,
  valor,
  mostrar,
  onMostrar,
  onChangeText,
}: CampoContrasenaProps) {
  const { isDark, colors } = useAppTheme();

  return (
    <View style={styles.campoContainer}>
      <Text
        style={[
          styles.etiqueta,
          isDark && { color: colors.textSecondary },
        ]}
      >
        {etiqueta}
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
          name="lock-closed-outline"
          size={20}
          color={colors.primary}
        />

        <TextInput
          style={[
            styles.input,
            isDark && { color: colors.text },
          ]}
          value={valor}
          onChangeText={onChangeText}
          secureTextEntry={!mostrar}
          placeholder="Ingresa la contraseña"
          autoCapitalize="none"
          placeholderTextColor={colors.inputPlaceholder}
        />

        <Pressable onPress={onMostrar} hitSlop={10}>
          <Ionicons
            name={mostrar ? "eye-off-outline" : "eye-outline"}
            size={21}
            color={colors.textMuted}
          />
        </Pressable>
      </View>
    </View>
  );
}
