import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  useWindowDimensions,
} from "react-native";

import { login } from "../services/authService";
import { useAppTheme } from "../hooks/useAppTheme";
import ThemeToggle from "../components/comun/ThemeToggle";

type CampoFormulario =
  | "email"
  | "contrasena";

export default function Index() {
  const router = useRouter();
  const { isDark, colors } = useAppTheme();
  const { width } =
    useWindowDimensions();

  const esPantallaGrande =
    width >= 800;

  const [
    formulario,
    setFormulario,
  ] = useState({
    email: "",
    contrasena: "",
  });

  const [
    mostrarContrasena,
    setMostrarContrasena,
  ] = useState(false);

  const [
    cargando,
    setCargando,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const scrollRef = useRef<ScrollView>(null);
  const contrasenaInputRef = useRef<TextInput>(null);
  const [tecladoVisible, setTecladoVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow",
      () => setTecladoVisible(true)
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide",
      () => setTecladoVisible(false)
    );

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const cambiarCampo = (
    campo: CampoFormulario,
    valor: string
  ) => {
    setFormulario(
      (anterior) => ({
        ...anterior,
        [campo]: valor,
      })
    );

    if (error) {
      setError("");
    }
  };

  const manejarSubmit =
    async () => {
      const email =
        formulario.email
          .trim();

      const contrasena =
        formulario.contrasena
          .trim();

      if (
        !email ||
        !contrasena
      ) {
        setError(
          "Completa el correo y la contraseña."
        );

        return;
      }

      setCargando(true);
      setError("");

      try {
        const usuario =
          await login(
            email,
            contrasena
          );

       
        const rol =
          String(
            usuario?.rol ?? ""
          )
            .trim()
            .toLowerCase();

        const tipoCuenta =
          String(
            usuario?.tipoCuenta ??
              ""
          )
            .trim()
            .toLowerCase();

        // ================================================
        // CLIENTE
        // ================================================

        if (
          rol === "cliente" ||
          tipoCuenta ===
            "cliente"
        ) {
          router.replace(
            "/cliente"
          );

          return;
        }

        // ================================================
        // DISTRIBUIDOR
        // ================================================

        if (
          rol ===
          "distribuidor"
        ) {
          router.replace(
            "/distribuidor"
          );

          return;
        }

        // ================================================
        // ADMINISTRADOR
        // ================================================

        if (
          rol ===
          "administrador"
        ) {
          router.replace(
            "/administrador/dashboard"
          );

          return;
        }

        // ================================================
        // ROL NO RECONOCIDO
        // ================================================

        setError(
          "Tu cuenta no tiene un rol válido para ingresar al sistema."
        );
      } catch (
        errorPeticion
      ) {
        setError(
          errorPeticion
            instanceof Error
            ? errorPeticion.message
            : "Correo o contraseña incorrectos."
        );
      } finally {
        setCargando(false);
      }
    };

  return (
    <SafeAreaView
      style={[
        styles.safeArea,
        { backgroundColor: colors.background },
      ]}
    >
      <View
        style={{
          position: "absolute",
          top: Platform.OS === "web" ? 18 : 45,
          right: 18,
          zIndex: 999,
        }}
      >
        <ThemeToggle />
      </View>

      <KeyboardAvoidingView
        style={
          styles.keyboardContainer
        }
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : undefined
        }
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={[
            styles.scrollContent,
            esPantallaGrande &&
              styles.scrollContentDesktop,
            !esPantallaGrande && {
              paddingBottom: tecladoVisible ? 280 : 30,
            },
          ]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={
            false
          }
        >
          <View
            style={[
              styles.card,
              esPantallaGrande
                ? styles.cardDesktop
                : styles.cardMobile,
              {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            {/* PANEL ROJO */}
            <View
              style={[
                styles.brandPanel,
                esPantallaGrande
                  ? styles.brandPanelDesktop
                  : [
                      styles.brandPanelMobile,
                      tecladoVisible && styles.brandPanelMobileCompact,
                    ],
              ]}
            >
              <View
                style={
                  styles.circleTop
                }
              />

              <View
                style={
                  styles.circleBottom
                }
              />

              <View
                style={
                  styles.circleBorder
                }
              />

              <View
                style={
                  styles.logoContainer
                }
              >
                <View
                  style={[
                    styles.logoBackground,
                    !esPantallaGrande &&
                      tecladoVisible &&
                      styles.logoBackgroundCompact,
                  ]}
                >
                  <Image
                    source={require(
                      "../../assets/images/logobady2.png"
                    )}
                    style={[
                      styles.logo,
                      !esPantallaGrande &&
                        tecladoVisible &&
                        styles.logoCompact,
                    ]}
                    resizeMode="contain"
                  />
                </View>
              </View>

              {esPantallaGrande && (
                <View
                  style={
                    styles.desktopDecoration
                  }
                >
                  <View
                    style={
                      styles.decorativeLine
                    }
                  />

                  <View
                    style={
                      styles.featureRow
                    }
                  >
                    <Ionicons
                      name="shield-checkmark-outline"
                      size={21}
                      color="#ffffff"
                    />

                    <Text
                      style={
                        styles.featureText
                      }
                    >
                      Acceso seguro al sistema
                    </Text>
                  </View>

                  <View
                    style={
                      styles.featureRow
                    }
                  >
                    <Ionicons
                      name="cube-outline"
                      size={21}
                      color="#ffffff"
                    />

                    <Text
                      style={
                        styles.featureText
                      }
                    >
                      Gestión centralizada de pedidos
                    </Text>
                  </View>
                </View>
              )}
            </View>

            {/* FORMULARIO */}
            <View
              style={[
                styles.formPanel,
                esPantallaGrande
                  ? styles.formPanelDesktop
                  : styles.formPanelMobile,
                { backgroundColor: colors.card },
              ]}
            >
              <View
                style={
                  styles.formContent
                }
              >
                <View
                  style={[
                    styles.heading,
                    !esPantallaGrande &&
                      tecladoVisible &&
                      styles.headingCompact,
                  ]}
                >
                  {(!tecladoVisible || esPantallaGrande) && (
                    <View
                      style={[
                        styles.headingIcon,
                        isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                      ]}
                    >
                      <Ionicons
                        name="person-outline"
                        size={23}
                        color={colors.primary}
                      />
                    </View>
                  )}

                  <Text
                    style={[
                      styles.welcomeText,
                      !esPantallaGrande &&
                        tecladoVisible &&
                        styles.welcomeTextCompact,
                      { color: colors.text },
                    ]}
                  >
                    Bienvenido
                  </Text>

                  {(!tecladoVisible || esPantallaGrande) && (
                    <Text
                      style={[
                        styles.headingDescription,
                        { color: colors.textSecondary },
                      ]}
                    >
                      Ingresa a tu cuenta para continuar
                    </Text>
                  )}
                </View>

                {error ? (
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

                <View
                  style={
                    styles.formGroup
                  }
                >
                  <Text
                    style={[
                      styles.label,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Correo electrónico
                  </Text>

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <Ionicons
                      name="mail-outline"
                      size={20}
                      color={colors.inputPlaceholder}
                      style={
                        styles.inputIcon
                      }
                    />

                    <TextInput
                      style={[
                        styles.input,
                        { color: colors.text },
                      ]}
                      placeholder="ejemplo@correo.com"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={
                        formulario.email
                      }
                      onChangeText={(
                        texto
                      ) =>
                        cambiarCampo(
                          "email",
                          texto
                        )
                      }
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoCorrect={
                        false
                      }
                      autoComplete="email"
                      editable={
                        !cargando
                      }
                      returnKeyType="next"
                      onSubmitEditing={() =>
                        contrasenaInputRef.current?.focus()
                      }
                      onFocus={() => {
                        if (!esPantallaGrande) {
                          setTimeout(() => {
                            scrollRef.current?.scrollTo({
                              y: 70,
                              animated: true,
                            });
                          }, 150);
                        }
                      }}
                    />
                  </View>
                </View>

                <View
                  style={
                    styles.formGroup
                  }
                >
                  <Text
                    style={[
                      styles.label,
                      { color: colors.textSecondary },
                    ]}
                  >
                    Contraseña
                  </Text>

                  <View
                    style={[
                      styles.inputContainer,
                      {
                        backgroundColor: colors.inputBg,
                        borderColor: colors.inputBorder,
                      },
                    ]}
                  >
                    <Ionicons
                      name="lock-closed-outline"
                      size={20}
                      color={colors.inputPlaceholder}
                      style={
                        styles.inputIcon
                      }
                    />

                    <TextInput
                      ref={contrasenaInputRef}
                      style={[
                        styles.passwordInput,
                        { color: colors.text },
                      ]}
                      placeholder="Ingresa tu contraseña"
                      placeholderTextColor={colors.inputPlaceholder}
                      value={
                        formulario.contrasena
                      }
                      onChangeText={(
                        texto
                      ) =>
                        cambiarCampo(
                          "contrasena",
                          texto
                        )
                      }
                      secureTextEntry={
                        !mostrarContrasena
                      }
                      autoCapitalize="none"
                      autoCorrect={
                        false
                      }
                      autoComplete="current-password"
                      editable={
                        !cargando
                      }
                      returnKeyType="done"
                      onSubmitEditing={
                        manejarSubmit
                      }
                      onFocus={() => {
                        if (!esPantallaGrande) {
                          setTimeout(() => {
                            scrollRef.current?.scrollToEnd({
                              animated: true,
                            });
                          }, 150);
                        }
                      }}
                    />

                    <Pressable
                      style={
                        styles.eyeButton
                      }
                      onPress={() =>
                        setMostrarContrasena(
                          (
                            valor
                          ) =>
                            !valor
                        )
                      }
                      hitSlop={8}
                    >
                      <Ionicons
                        name={
                          mostrarContrasena
                            ? "eye-off-outline"
                            : "eye-outline"
                        }
                        size={21}
                        color={colors.primary}
                      />
                    </Pressable>
                  </View>
                </View>

                <Pressable
                  style={({
                    pressed,
                  }) => [
                    styles.loginButton,
                    pressed &&
                      !cargando &&
                      styles.loginButtonPressed,
                    cargando &&
                      styles.loginButtonDisabled,
                  ]}
                  onPress={
                    manejarSubmit
                  }
                  disabled={
                    cargando
                  }
                >
                  {cargando ? (
                    <ActivityIndicator
                      color="#ffffff"
                    />
                  ) : (
                    <>
                      <Text
                        style={
                          styles.loginButtonText
                        }
                      >
                        INICIAR SESIÓN
                      </Text>

                      <Ionicons
                        name="arrow-forward"
                        size={19}
                        color="#ffffff"
                      />
                    </>
                  )}
                </Pressable>

                <View
                  style={
                    styles.footerContainer
                  }
                >
                  <View
                    style={
                      styles.footerLine
                    }
                  />

                  <Text
                    style={
                      styles.footerText
                    }
                  >
                    BADY’S - TUPIZA
                  </Text>

                  <View
                    style={
                      styles.footerLine
                    }
                  />
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const ROJO =
  "#b82018";

const ROJO_OSCURO =
  "#88150f";

const styles =
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor:
        "#f2f3f5",
    },

    keyboardContainer: {
      flex: 1,
    },

    scrollContent: {
      flexGrow: 1,
      backgroundColor:
        "#f2f3f5",
    },

    scrollContentDesktop: {
      justifyContent:
        "center",
      padding: 32,
    },

    card: {
      width: "100%",
      backgroundColor:
        "#ffffff",
      overflow: "hidden",
    },

    cardDesktop: {
      maxWidth: 1020,
      minHeight: 610,
      alignSelf: "center",
      flexDirection: "row",
      borderRadius: 30,

      shadowColor:
        "#000000",

      shadowOffset: {
        width: 0,
        height: 16,
      },

      shadowOpacity: 0.16,
      shadowRadius: 30,
      elevation: 12,
    },

    cardMobile: {
      flex: 1,
      minHeight: "100%",
    },

    brandPanel: {
      position: "relative",
      overflow: "hidden",
      backgroundColor:
        ROJO,
    },

    brandPanelDesktop: {
      width: "52%",
      minHeight: 610,
      paddingHorizontal: 50,
      paddingVertical: 48,
      justifyContent:
        "space-between",
    },

    brandPanelMobile: {
      minHeight: 220,
      paddingHorizontal: 20,
      paddingTop: 20,
      paddingBottom: 38,
      justifyContent:
        "center",
    },

    brandPanelMobileCompact: {
      minHeight: 110,
      paddingHorizontal: 20,
      paddingTop: 10,
      paddingBottom: 16,
      justifyContent: "center",
    },

    circleTop: {
      position: "absolute",
      top: -180,
      left: -130,
      width: 380,
      height: 380,
      borderRadius: 190,
      backgroundColor:
        "rgba(255,255,255,0.08)",
    },

    circleBottom: {
      position: "absolute",
      right: -130,
      bottom: -190,
      width: 400,
      height: 400,
      borderRadius: 200,
      backgroundColor:
        "rgba(0,0,0,0.07)",
    },

    circleBorder: {
      position: "absolute",
      top: -110,
      right: -150,
      width: 320,
      height: 320,
      borderRadius: 160,
      borderWidth: 45,
      borderColor:
        "rgba(255,255,255,0.06)",
    },

    logoContainer: {
      flex: 1,
      justifyContent:
        "center",
      alignItems: "center",
      zIndex: 2,
    },

    logoBackground: {
      width:
        Platform.OS ===
        "web"
          ? 220
          : 150,

      height:
        Platform.OS ===
        "web"
          ? 220
          : 150,

      borderRadius:
        Platform.OS ===
        "web"
          ? 110
          : 75,

      justifyContent:
        "center",

      alignItems: "center",

      backgroundColor:
        "transparent",
    },

    logo: {
      width:
        Platform.OS ===
        "web"
          ? 300
          : 145,

      height:
        Platform.OS ===
        "web"
          ? 300
          : 145,
    },

    logoBackgroundCompact: {
      width: 80,
      height: 80,
      borderRadius: 40,
    },

    logoCompact: {
      width: 80,
      height: 80,
    },

    brandName: {
      marginTop: 20,
      color: "#ffffff",
      fontSize: 31,
      fontWeight: "900",
      letterSpacing: 1.5,
    },

    brandSubtitle: {
      marginTop: 6,
      color:
        "rgba(255,255,255,0.82)",
      fontSize: 13,
      fontWeight: "500",
      textAlign: "center",
    },

    desktopDecoration: {
      zIndex: 2,
      gap: 17,
    },

    decorativeLine: {
      width: 48,
      height: 4,
      borderRadius: 2,
      backgroundColor:
        "#ffffff",
      marginBottom: 4,
    },

    featureRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 11,
    },

    featureText: {
      color:
        "rgba(255,255,255,0.9)",
      fontSize: 14,
      fontWeight: "500",
    },

    formPanel: {
      backgroundColor:
        "#ffffff",
      justifyContent:
        "center",
    },

    formPanelDesktop: {
      width: "48%",
      minHeight: 610,
      paddingHorizontal: 58,
      paddingVertical: 48,
      marginLeft: -22,
      borderTopLeftRadius: 30,
      borderBottomLeftRadius: 30,
    },

    formPanelMobile: {
      flex: 1,
      marginTop: -18,
      paddingHorizontal: 25,
      paddingTop: 30,
      paddingBottom: 25,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
    },

    formContent: {
      width: "100%",
      maxWidth: 370,
      alignSelf: "center",
    },

    heading: {
      alignItems: "center",
      marginBottom: 31,
    },

    headingCompact: {
      alignItems: "center",
      marginBottom: 14,
    },

    headingIcon: {
      width: 48,
      height: 48,
      marginBottom: 13,
      borderRadius: 24,
      alignItems: "center",
      justifyContent:
        "center",
      backgroundColor:
        "#fff1f0",
    },

    welcomeText: {
      color: "#20242a",
      fontSize: 32,
      fontWeight: "800",
    },

    welcomeTextCompact: {
      fontSize: 24,
    },

    headingDescription: {
      marginTop: 7,
      color: "#7b818a",
      fontSize: 13,
      textAlign: "center",
    },

    errorContainer: {
      flexDirection: "row",
      alignItems: "center",
      gap: 9,
      marginBottom: 20,
      paddingHorizontal: 14,
      paddingVertical: 13,
      borderWidth: 1,
      borderColor:
        "#f6c2be",
      borderRadius: 13,
      backgroundColor:
        "#fff3f2",
    },

    errorText: {
      flex: 1,
      color: "#a51d16",
      fontSize: 13,
      lineHeight: 18,
    },

    formGroup: {
      marginBottom: 20,
    },

    label: {
      marginBottom: 8,
      color: "#414750",
      fontSize: 13,
      fontWeight: "700",
    },

    inputContainer: {
      width: "100%",
      height: 55,
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1,
      borderColor:
        "#dfe2e6",
      borderRadius: 15,
      backgroundColor:
        "#ffffff",
    },

    inputIcon: {
      marginLeft: 16,
    },

    input: {
      flex: 1,
      height: "100%",
      paddingHorizontal: 12,
      color: "#20242a",
      fontSize: 14,
      outlineStyle: "none",
    } as any,

    passwordInput: {
      flex: 1,
      height: "100%",
      paddingHorizontal: 12,
      color: "#20242a",
      fontSize: 14,
      outlineStyle: "none",
    } as any,

    eyeButton: {
      height: "100%",
      paddingHorizontal: 16,
      justifyContent:
        "center",
    },

    loginButton: {
      height: 56,
      marginTop: 7,
      flexDirection: "row",
      alignItems: "center",
      justifyContent:
        "center",
      gap: 10,
      borderRadius: 15,
      backgroundColor:
        ROJO,

      shadowColor:
        ROJO_OSCURO,

      shadowOffset: {
        width: 0,
        height: 7,
      },

      shadowOpacity: 0.25,
      shadowRadius: 11,
      elevation: 6,
    },

    loginButtonPressed: {
      opacity: 0.88,
      transform: [
        {
          scale: 0.99,
        },
      ],
    },

    loginButtonDisabled: {
      opacity: 0.65,
    },

    loginButtonText: {
      color: "#ffffff",
      fontSize: 13,
      fontWeight: "800",
      letterSpacing: 0.7,
    },

    footerContainer: {
      flexDirection: "row",
      alignItems: "center",
      marginTop: 34,
    },

    footerLine: {
      flex: 1,
      height: 1,
      backgroundColor:
        "#e6e8eb",
    },

    footerText: {
      marginHorizontal: 14,
      color: ROJO,
      fontSize: 12,
      fontWeight: "900",
      letterSpacing: 1,
    },
  });