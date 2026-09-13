import { Ionicons } from "@expo/vector-icons";
import { ReactNode } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";
import { styles } from "../../styles/components/modalSistema.styles";

type TipoModal =
  | "formulario"
  | "confirmacion"
  | "exito"
  | "error";

type Props = {
  visible: boolean;
  titulo: string;
  descripcion?: string;
  tipo?: TipoModal;
  children?: ReactNode;

  textoCancelar?: string;
  textoConfirmar?: string;

  mostrarCancelar?: boolean;
  cargando?: boolean;

  onCerrar: () => void;
  onConfirmar?: () => void;
};

export default function ModalSistema({
  visible,
  titulo,
  descripcion,
  tipo = "formulario",
  children,
  textoCancelar = "Cancelar",
  textoConfirmar = "Aceptar",
  mostrarCancelar = true,
  cargando = false,
  onCerrar,
  onConfirmar,
}: Props) {
  const { isDark, colors } = useAppTheme();

  const obtenerIcono = (): React.ComponentProps<
    typeof Ionicons
  >["name"] => {
    switch (tipo) {
      case "confirmacion":
        return "warning-outline";

      case "exito":
        return "checkmark-circle-outline";

      case "error":
        return "close-circle-outline";

      default:
        return "person-outline";
    }
  };

  const obtenerEstiloIcono = () => {
    switch (tipo) {
      case "exito":
        return isDark
          ? { backgroundColor: colors.successBg }
          : styles.iconoExito;

      case "error":
        return isDark
          ? { backgroundColor: colors.dangerBg }
          : styles.iconoError;

      case "confirmacion":
        return isDark
          ? { backgroundColor: colors.warningBg }
          : styles.iconoAdvertencia;

      default:
        return isDark
          ? { backgroundColor: colors.surfaceElevated }
          : styles.iconoFormulario;
    }
  };

  const obtenerColorIcono = () => {
    switch (tipo) {
      case "exito":
        return colors.successText;

      case "error":
        return colors.dangerText;

      case "confirmacion":
        return colors.warningText;

      default:
        return colors.text;
    }
  };

  const cerrarModal = () => {
    if (!cargando) {
      onCerrar();
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={cerrarModal}
    >
      <KeyboardAvoidingView
        style={[
          styles.fondo,
          isDark && { backgroundColor: colors.modalBackdrop },
        ]}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <Pressable
          style={styles.fondoPresionable}
          onPress={cerrarModal}
        />

        <View
          style={[
            styles.contenido,
            isDark && {
              backgroundColor: colors.modalBg,
              borderColor: colors.border,
              borderWidth: 1,
            },
          ]}
        >
          <ScrollView
            style={styles.scrollContainer}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={[styles.icono, obtenerEstiloIcono()]}>
              <Ionicons
                name={obtenerIcono()}
                size={28}
                color={obtenerColorIcono()}
              />
            </View>

            <Text
              style={[
                styles.titulo,
                isDark && { color: colors.text },
              ]}
            >
              {titulo}
            </Text>

            {descripcion ? (
              <Text
                style={[
                  styles.descripcion,
                  isDark && { color: colors.textSecondary },
                ]}
              >
                {descripcion}
              </Text>
            ) : null}

            {children ? (
              <View style={styles.cuerpo}>{children}</View>
            ) : null}
          </ScrollView>

          <View
            style={[
              styles.botones,
              isDark && { borderTopColor: colors.borderLight },
            ]}
          >
            {mostrarCancelar ? (
              <Pressable
                disabled={cargando}
                onPress={onCerrar}
                style={({ pressed }) => [
                  styles.botonCancelar,
                  isDark && {
                    backgroundColor: colors.surfaceElevated,
                    borderColor: colors.border,
                  },
                  pressed && styles.botonPresionado,
                ]}
              >
                <Text
                  style={[
                    styles.textoCancelar,
                    isDark && { color: colors.textSecondary },
                  ]}
                >
                  {textoCancelar}
                </Text>
              </Pressable>
            ) : null}

            {onConfirmar ? (
              <Pressable
                disabled={cargando}
                onPress={onConfirmar}
                style={({ pressed }) => [
                  styles.botonConfirmar,
                  { backgroundColor: colors.primary },
                  tipo === "confirmacion" && styles.botonPeligro,
                  cargando && styles.botonDeshabilitado,
                  pressed && styles.botonPresionado,
                ]}
              >
                {cargando ? (
                  <ActivityIndicator
                    size="small"
                    color="#ffffff"
                  />
                ) : (
                  <>
                    <Text style={styles.textoConfirmar}>
                      {textoConfirmar}
                    </Text>
                    <Ionicons
                      name="arrow-forward-outline"
                      size={17}
                      color="#ffffff"
                    />
                  </>
                )}
              </Pressable>
            ) : null}
          </View>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}