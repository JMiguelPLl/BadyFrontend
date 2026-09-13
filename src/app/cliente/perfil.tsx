import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";

const ROJO = "#C62828";
const BLANCO = "#FFFFFF";

const API_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:5127"
    : "https://localhost:7228";

type ClientePerfil = {
  id: number;
  nombre: string;
  numero: string;
  email: string;
  estado: string;
};

export default function PerfilClienteScreen() {
  const { isDark, colors, toggleTheme } = useAppTheme();
  const [perfil, setPerfil] = useState<ClientePerfil | null>(null);

  const [nombre, setNombre] = useState("");
  const [numero, setNumero] = useState("");
  const [email, setEmail] = useState("");
  const [contrasena, setContrasena] = useState("");
  const [confirmarContrasena, setConfirmarContrasena] = useState("");

  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);

  const [mostrarContrasena, setMostrarContrasena] = useState(false);
  const [mostrarConfirmacion, setMostrarConfirmacion] = useState(false);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const obtenerToken = async () => {
    return await AsyncStorage.getItem("token");
  };

  const cargarPerfil = async () => {
    try {
      setCargando(true);

      const token = await obtenerToken();

      if (!token) {
        Alert.alert(
          "Sesión no encontrada",
          "No se encontró el token del usuario."
        );
        return;
      }

      const respuesta = await fetch(
        `${API_URL}/api/Cliente/MiPerfil`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos?.message ?? "No se pudo obtener el perfil."
        );
      }

      setPerfil(datos);
      setNombre(datos.nombre ?? "");
      setNumero(datos.numero ?? "");
      setEmail(datos.email ?? "");
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
      Alert.alert("Campo requerido", "Ingresa tu nombre.");
      return false;
    }

    if (!numero.trim()) {
      Alert.alert(
        "Campo requerido",
        "Ingresa tu número de teléfono."
      );
      return false;
    }

    if (contrasena && contrasena.length < 6) {
      Alert.alert(
        "Contraseña inválida",
        "La contraseña debe tener al menos 6 caracteres."
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

  const actualizarPerfil = async () => {
    if (!validarFormulario()) {
      return;
    }

    try {
      setGuardando(true);

      const token = await obtenerToken();

      if (!token) {
        Alert.alert(
          "Sesión no encontrada",
          "No se encontró el token del usuario."
        );
        return;
      }

      const cuerpo = {
        nombre: nombre.trim(),
        numero: numero.trim(),
        email,
        contrasena: contrasena.trim() || null,
      };

      const respuesta = await fetch(
        `${API_URL}/api/Cliente/MiPerfil`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(cuerpo),
        }
      );

      const datos = await respuesta.json();

      if (!respuesta.ok) {
        throw new Error(
          datos?.message ?? "No se pudo actualizar el perfil."
        );
      }

      const clienteActualizado = datos.cliente;

      setPerfil(clienteActualizado);
      setNombre(clienteActualizado.nombre ?? "");
      setNumero(clienteActualizado.numero ?? "");
      setEmail(clienteActualizado.email ?? "");

      setContrasena("");
      setConfirmarContrasena("");
      setEditando(false);

      Alert.alert(
        "Perfil actualizado",
        datos?.message ?? "Tus datos fueron actualizados correctamente."
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
    if (!perfil) {
      return;
    }

    setNombre(perfil.nombre);
    setNumero(perfil.numero);
    setEmail(perfil.email);
    setContrasena("");
    setConfirmarContrasena("");
    setEditando(false);
  };

  if (cargando) {
    return (
      <View
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
          Cargando perfil...
        </Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={[
        styles.pantalla,
        { backgroundColor: colors.background },
      ]}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.contenido}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.encabezado}>
          <View>
            <Text
              style={[
                styles.titulo,
                isDark && { color: colors.text },
              ]}
            >
              Mi perfil
            </Text>
            <Text
              style={[
                styles.subtitulo,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Administra tus datos personales
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
              <Ionicons
                name="create-outline"
                size={20}
                color={BLANCO}
              />
            </Pressable>
          )}
        </View>

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
            <Ionicons
              name="person"
              size={48}
              color={colors.primary}
            />
          </View>

          <Text
            style={[
              styles.nombrePrincipal,
              isDark && { color: colors.text },
            ]}
          >
            {perfil?.nombre}
          </Text>

          <View
            style={[
              styles.estado,
              perfil?.estado === "Activo"
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
                perfil?.estado === "Activo"
                  ? { color: colors.successText }
                  : { color: colors.dangerText },
              ]}
            >
              {perfil?.estado}
            </Text>
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
            placeholder="Ingresa tu nombre"
          />

          <CampoFormulario
            etiqueta="Número de teléfono"
            icono="call-outline"
            valor={numero}
            editable={editando}
            onChangeText={setNumero}
            placeholder="Ingresa tu número"
            keyboardType="phone-pad"
          />

          <CampoFormulario
            etiqueta="Correo electrónico"
            icono="mail-outline"
            valor={email}
            editable={false}
            onChangeText={() => {}}
            placeholder="Correo electrónico"
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
              <Ionicons
                name="key-outline"
                size={21}
                color={colors.primary}
              />
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
              Déjala vacía para mantener tu contraseña actual.
            </Text>

            <CampoContrasena
              etiqueta="Nueva contraseña"
              valor={contrasena}
              mostrar={mostrarContrasena}
              onMostrar={() =>
                setMostrarContrasena((valor) => !valor)
              }
              onChangeText={setContrasena}
            />

            <CampoContrasena
              etiqueta="Confirmar contraseña"
              valor={confirmarContrasena}
              mostrar={mostrarConfirmacion}
              onMostrar={() =>
                setMostrarConfirmacion((valor) => !valor)
              }
              onChangeText={setConfirmarContrasena}
            />
          </View>
        )}

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
              onPress={actualizarPerfil}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator color={BLANCO} />
              ) : (
                <>
                  <Ionicons
                    name="save-outline"
                    size={20}
                    color={BLANCO}
                  />
                  <Text style={styles.botonGuardarTexto}>
                    Guardar cambios
                  </Text>
                </>
              )}
            </Pressable>
          </View>
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
            keyboardType === "email-address"
              ? "none"
              : "sentences"
          }
          placeholderTextColor={colors.inputPlaceholder}
        />

        {!editable && (
          <Ionicons
            name="lock-closed"
            size={16}
            color={colors.textMuted}
          />
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

        <Pressable onPress={onMostrar}>
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

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: "#F5F6F8",
  },

  contenido: {
    padding: 20,
    paddingBottom: 120,
  },

  cargandoContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F5F6F8",
  },

  cargandoTexto: {
    marginTop: 12,
    color: "#6B6B6B",
    fontSize: 15,
  },

  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
  },

  titulo: {
    fontSize: 27,
    fontWeight: "800",
    color: "#202020",
  },

  subtitulo: {
    marginTop: 3,
    fontSize: 14,
    color: "#777",
  },

  botonEditar: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: ROJO,
    alignItems: "center",
    justifyContent: "center",
  },

  avatarContainer: {
    alignItems: "center",
    marginBottom: 24,
  },

  avatar: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: "#FBE9E9",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    borderColor: BLANCO,
  },

  nombrePrincipal: {
    marginTop: 12,
    fontSize: 21,
    fontWeight: "800",
    color: "#242424",
  },

  estado: {
    marginTop: 8,
    paddingHorizontal: 13,
    paddingVertical: 5,
    borderRadius: 20,
  },

  estadoActivo: {
    backgroundColor: "#DDF5E5",
  },

  estadoInactivo: {
    backgroundColor: "#F8DADA",
  },

  estadoTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#3F3F3F",
  },

  tarjeta: {
    backgroundColor: BLANCO,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },

  campoContainer: {
    marginBottom: 17,
  },

  etiqueta: {
    marginBottom: 7,
    fontSize: 13,
    fontWeight: "700",
    color: "#484848",
  },

  inputContainer: {
    minHeight: 53,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E2E2E2",
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  inputDeshabilitado: {
    backgroundColor: "#EEEEEE",
    borderColor: "#E5E5E5",
  },

  input: {
    flex: 1,
    fontSize: 15,
    color: "#272727",
  },

  correoAviso: {
    marginTop: -7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  correoAvisoTexto: {
    flex: 1,
    fontSize: 12,
    color: "#777",
  },

  seccionTituloContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  seccionTitulo: {
    fontSize: 17,
    fontWeight: "800",
    color: "#282828",
  },

  seccionDescripcion: {
    marginTop: 5,
    marginBottom: 17,
    fontSize: 13,
    color: "#777",
  },

  acciones: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },

  botonCancelar: {
    flex: 1,
    minHeight: 53,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#D4D4D4",
    backgroundColor: BLANCO,
    alignItems: "center",
    justifyContent: "center",
  },

  botonCancelarTexto: {
    color: "#555",
    fontSize: 15,
    fontWeight: "700",
  },

  botonGuardar: {
    flex: 2,
    minHeight: 53,
    borderRadius: 15,
    backgroundColor: ROJO,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },

  botonGuardarTexto: {
    color: BLANCO,
    fontSize: 15,
    fontWeight: "800",
  },

  botonDeshabilitado: {
    opacity: 0.65,
  },
});