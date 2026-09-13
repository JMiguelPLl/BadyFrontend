import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  View,
} from "react-native";

import ThemeToggle from "../comun/ThemeToggle";
import { useAppTheme } from "../../hooks/useAppTheme";
import {
  cerrarSesion as cerrarSesionServicio,
  obtenerUsuario,
} from "../../services/authService";
import { styles } from "../../styles/administrador/header.styles";

type Usuario = {
  id?: number;
  nombre?: string;
  apellido?: string;
  email?: string;
  rol?: string;
  tipoCuenta?: string;
};

type Props = {
  esMovil?: boolean;
  onToggleSidebar?: () => void;
};

export default function Header({ esMovil = false, onToggleSidebar }: Props) {
  const router = useRouter();
  const { isDark, colors } = useAppTheme();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [cerrandoSesion, setCerrandoSesion] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    cargarUsuario();
  }, []);

  const cargarUsuario = async () => {
    try {
      const datosUsuario = await obtenerUsuario();
      setUsuario(datosUsuario);
    } catch (error) {
      console.error("Error al obtener el usuario:", error);
    } finally {
      setCargando(false);
    }
  };

  const ejecutarCerrarSesion = async () => {
    if (cerrandoSesion) return;

    try {
      setCerrandoSesion(true);
      await cerrarSesionServicio();
      setModalVisible(false);
      router.replace("/");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    } finally {
      setCerrandoSesion(false);
    }
  };

  const obtenerNombreCompleto = () => {
    const nombreCompleto = `${usuario?.nombre ?? ""} ${
      usuario?.apellido ?? ""
    }`.trim();

    return nombreCompleto || usuario?.email || "Administrador";
  };

  const obtenerCargo = () => {
    return usuario?.rol || usuario?.tipoCuenta || "Administrador";
  };

  return (
    <>
      <View
        style={[
          styles.header,
          isDark && {
            backgroundColor: colors.headerBg,
            borderBottomColor: colors.border,
          },
          esMovil && { paddingHorizontal: 14, minHeight: 68 },
        ]}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1, minWidth: 0 }}>
          {esMovil && (
            <Pressable
              onPress={onToggleSidebar}
              style={({ pressed }) => [
                styles.botonMenuMovil,
                isDark && {
                  backgroundColor: colors.surfaceElevated,
                  borderColor: colors.border,
                },
                pressed && { opacity: 0.75 },
              ]}
            >
              <Ionicons
                name="menu-outline"
                size={24}
                color={isDark ? colors.text : "#ffffff"}
              />
            </Pressable>
          )}

          <View style={styles.tituloContainer}>
            <Text
              style={[
                styles.titulo,
                isDark && { color: colors.text },
                esMovil && { fontSize: 16 },
              ]}
              numberOfLines={1}
            >
              {esMovil ? "BADY'S" : "Sistema de administración"}
            </Text>

            {!esMovil && (
              <Text
                style={[
                  styles.subtitulo,
                  isDark && { color: colors.textSecondary },
                ]}
                numberOfLines={1}
              >
                Gestión integral de BADY&apos;S
              </Text>
            )}
          </View>
        </View>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            gap: 10,
          }}
        >
          {/* Botón de alternancia de Modo Oscuro / Diurno */}
          <ThemeToggle />

          <View
            style={[
              styles.usuarioContainer,
              isDark && {
                backgroundColor: colors.surfaceElevated,
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
                name="person-outline"
                size={23}
                color={colors.primary}
              />
            </View>

            <View style={styles.usuarioInformacion}>
              {cargando ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <>
                  <Text
                    style={[
                      styles.usuarioNombre,
                      isDark && { color: colors.text },
                    ]}
                    numberOfLines={1}
                  >
                    {obtenerNombreCompleto()}
                  </Text>

                  <Text
                    style={[
                      styles.usuarioCargo,
                      isDark && { color: colors.textSecondary },
                    ]}
                    numberOfLines={1}
                  >
                    {obtenerCargo()}
                  </Text>
                </>
              )}
            </View>

            <View
              style={[
                styles.separador,
                isDark && { backgroundColor: colors.border },
              ]}
            />

            <Pressable
              disabled={cerrandoSesion}
              onPress={() => setModalVisible(true)}
              style={({ pressed }) => [
                styles.botonCerrarSesion,
                pressed && styles.botonCerrarSesionPresionado,
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={19}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.botonCerrarSesionTexto,
                  { color: colors.primary },
                ]}
              >
                Cerrar sesión
              </Text>
            </Pressable>
          </View>
        </View>
      </View>

      <Modal
        visible={modalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setModalVisible(false)}
      >
        <View
          style={[
            styles.modalFondo,
            isDark && { backgroundColor: colors.modalBackdrop },
          ]}
        >
          <Pressable
            style={styles.modalFondoPresionable}
            onPress={() => {
              if (!cerrandoSesion) {
                setModalVisible(false);
              }
            }}
          />

          <View
            style={[
              styles.modalContenido,
              isDark && {
                backgroundColor: colors.modalBg,
                borderColor: colors.border,
                borderWidth: 1,
              },
            ]}
          >
            <View
              style={[
                styles.modalIcono,
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Ionicons
                name="log-out-outline"
                size={34}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.modalTitulo,
                isDark && { color: colors.text },
              ]}
            >
              ¿Cerrar sesión?
            </Text>

            <Text
              style={[
                styles.modalDescripcion,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Se cerrará la sesión actual del panel de administración.
            </Text>

            <View style={styles.modalBotones}>
              <Pressable
                disabled={cerrandoSesion}
                onPress={() => setModalVisible(false)}
                style={({ pressed }) => [
                  styles.botonCancelar,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                  pressed && styles.botonModalPresionado,
                ]}
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
                disabled={cerrandoSesion}
                onPress={ejecutarCerrarSesion}
                style={({ pressed }) => [
                  styles.botonConfirmar,
                  { backgroundColor: colors.primary },
                  pressed && styles.botonModalPresionado,
                  cerrandoSesion && styles.botonDeshabilitado,
                ]}
              >
                {cerrandoSesion ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : null}

                <Text style={styles.botonConfirmarTexto}>
                  {cerrandoSesion ? "Cerrando..." : "Sí, salir"}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}