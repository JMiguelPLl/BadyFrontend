import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  RefreshControl,
  SafeAreaView,
  ScrollView,
  Text,
  View,
} from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";
import { obtenerUsuario } from "../../services/authService";
import {
  listarMisPedidos,
  listarPedidosCliente,
} from "../../services/PedidosService";
import { styles } from "../../styles/cliente/inicio.styles";

type Usuario = {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  tipoCuenta: string;
};

type Pedido = {
  id: number;
  fechaPedido: string;
  total: number;
  estado: string;
  sucursal?: string;
  idSucursal?: number;
  saldoPendiente?: number | null;
  motivoEdicion?: string | null;
  motivoDevolucion?: string | null;
  fechaDevolucion?: string | null;
};

export default function ClienteHome() {
  const router = useRouter();
  const { isDark, colors } = useAppTheme();

  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [menuPerfilVisible, setMenuPerfilVisible] = useState(false);

  const [ultimosPedidos, setUltimosPedidos] = useState<Pedido[]>([]);

  const cargarDatos = async () => {
    try {
      const usuarioStorage = await obtenerUsuario();
      setUsuario(usuarioStorage);

      if (usuarioStorage?.id) {
        let pedidos = await listarPedidosCliente(usuarioStorage.id);

        if (!Array.isArray(pedidos) || pedidos.length === 0) {
          try {
            pedidos = await listarMisPedidos();
          } catch {
            // ignore
          }
        }

        if (Array.isArray(pedidos)) {
          const pedidosOrdenados = [...pedidos].sort(
            (a, b) =>
              new Date(b.fechaPedido).getTime() -
              new Date(a.fechaPedido).getTime()
          );

          setUltimosPedidos(pedidosOrdenados.slice(0, 5));
        } else {
          setUltimosPedidos([]);
        }
      } else {
        setUltimosPedidos([]);
      }
    } catch (error) {
      console.error("Error al cargar datos del cliente:", error);
    } finally {
      setCargando(false);
      setActualizando(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, []);

  const actualizar = () => {
    setActualizando(true);
    cargarDatos();
  };

  const irAMiPerfil = () => {
    setMenuPerfilVisible(false);
    router.push("/cliente/perfil");
  };

  const cerrarSesion = () => {
    setMenuPerfilVisible(false);

    Alert.alert(
      "Cerrar sesión",
      "¿Estás seguro de que deseas salir de tu cuenta?",
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
            } catch (error) {
              console.error("Error al cerrar sesión:", error);
            }
          },
        },
      ]
    );
  };

  const obtenerSaludo = () => {
    const hora = new Date().getHours();

    if (hora >= 6 && hora < 12) {
      return "Buenos días";
    }

    if (hora >= 12 && hora < 19) {
      return "Buenas tardes";
    }

    return "Buenas noches";
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado.toLowerCase()) {
      case "entregado":
        return {
          fondo: isDark ? "rgba(21, 128, 61, 0.22)" : "#e9f8ef",
          texto: isDark ? "#4ade80" : "#1e874b",
        };

      case "pendiente":
        return {
          fondo: isDark ? "rgba(194, 65, 12, 0.22)" : "#fff5dd",
          texto: isDark ? "#fb923c" : "#a86c00",
        };

      case "cancelado":
        return {
          fondo: isDark ? "rgba(184, 32, 24, 0.22)" : "#ffeded",
          texto: colors.dangerText,
        };

      default:
        return {
          fondo: isDark ? colors.surfaceElevated : "#eef2f6",
          texto: isDark ? colors.textSecondary : "#59636e",
        };
    }
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
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: colors.background }]}
    >
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={actualizando}
            onRefresh={actualizar}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* ENCABEZADO */}
        <View style={styles.header}>
          <View>
            <Text
              style={[
                styles.greeting,
                isDark && { color: colors.textSecondary },
              ]}
            >
              {obtenerSaludo()}
            </Text>

            <Text
              style={[
                styles.userName,
                isDark && { color: colors.text },
              ]}
            >
              {usuario?.nombre || "Cliente"} 👋
            </Text>
          </View>

          <View style={styles.profileMenuContainer}>
            <Pressable
              style={[
                styles.profileButton,
                isDark && {
                  backgroundColor: "rgba(200, 35, 27, 0.22)",
                  borderColor: colors.border,
                },
                menuPerfilVisible && styles.profileButtonActive,
              ]}
              onPress={() => setMenuPerfilVisible((visible) => !visible)}
            >
              <Ionicons
                name="person-outline"
                size={23}
                color={colors.primary}
              />

              <Ionicons
                name={menuPerfilVisible ? "chevron-up" : "chevron-down"}
                size={14}
                color={colors.primary}
              />
            </Pressable>

            {menuPerfilVisible && (
              <View
                style={[
                  styles.profileDropdown,
                  isDark && {
                    backgroundColor: colors.card,
                    borderColor: colors.border,
                  },
                ]}
              >
                <View style={styles.profileDropdownHeader}>
                  <View
                    style={[
                      styles.profileAvatarSmall,
                      isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                    ]}
                  >
                    <Ionicons
                      name="person"
                      size={18}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.profileDropdownUserInfo}>
                    <Text
                      style={[
                        styles.profileDropdownName,
                        isDark && { color: colors.text },
                      ]}
                      numberOfLines={1}
                    >
                      {usuario?.nombre || "Cliente"}
                    </Text>

                    <Text
                      style={[
                        styles.profileDropdownEmail,
                        isDark && { color: colors.textSecondary },
                      ]}
                      numberOfLines={1}
                    >
                      {usuario?.email || "Mi cuenta"}
                    </Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.profileDropdownDivider,
                    isDark && { backgroundColor: colors.border },
                  ]}
                />

                <Pressable
                  style={({ pressed }) => [
                    styles.profileMenuOption,
                    pressed && (isDark ? { backgroundColor: colors.surfaceElevated } : styles.profileMenuOptionPressed),
                  ]}
                  onPress={irAMiPerfil}
                >
                  <View
                    style={[
                      styles.profileMenuOptionIcon,
                      isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                    ]}
                  >
                    <Ionicons
                      name="person-circle-outline"
                      size={21}
                      color={colors.primary}
                    />
                  </View>

                  <Text
                    style={[
                      styles.profileMenuOptionText,
                      isDark && { color: colors.text },
                    ]}
                  >
                    Mi perfil
                  </Text>

                  <Ionicons
                    name="chevron-forward"
                    size={17}
                    color={isDark ? colors.textMuted : "#a0a5ab"}
                  />
                </Pressable>

                <Pressable
                  style={({ pressed }) => [
                    styles.profileMenuOption,
                    pressed && (isDark ? { backgroundColor: colors.surfaceElevated } : styles.profileMenuOptionPressed),
                  ]}
                  onPress={cerrarSesion}
                >
                  <View
                    style={[
                      styles.profileMenuOptionIcon,
                      styles.logoutIconContainer,
                      isDark && { backgroundColor: colors.dangerBg },
                    ]}
                  >
                    <Ionicons
                      name="log-out-outline"
                      size={21}
                      color={colors.dangerText}
                    />
                  </View>

                  <Text
                    style={[
                      styles.profileMenuOptionText,
                      styles.logoutText,
                      { color: colors.dangerText },
                    ]}
                  >
                    Cerrar sesión
                  </Text>
                </Pressable>
              </View>
            )}
          </View>
        </View>

        {/* TARJETA PRINCIPAL */}
        <View style={styles.mainCard}>
          <View style={styles.circleOne} />
          <View style={styles.circleTwo} />

          <View style={styles.mainCardContent}>
            <View style={styles.mainCardIcon}>
              <Ionicons name="cart-outline" size={25} color="#ffffff" />
            </View>

            <Text style={styles.mainCardTitle}>Realiza tu pedido</Text>

            <Text style={styles.mainCardDescription}>
              Selecciona una sucursal, agrega productos y confirma tu pedido.
            </Text>

            <Pressable
              style={styles.newOrderButton}
              onPress={() => router.push("/cliente/crear-pedido")}
            >
              <Ionicons
                name="add-circle-outline"
                size={20}
                color={colors.primary}
              />

              <Text
                style={[
                  styles.newOrderButtonText,
                  { color: colors.primary },
                ]}
              >
                Crear nuevo pedido
              </Text>
            </Pressable>
          </View>
        </View>

        {/* ACCESOS RÁPIDOS */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              isDark && { color: colors.text },
            ]}
          >
            Accesos rápidos
          </Text>
        </View>

        <View style={styles.quickActions}>
          <Pressable
            style={[
              styles.quickAction,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/cliente/sucursales")}
          >
            <View
              style={[
                styles.quickActionIcon,
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Ionicons
                name="storefront-outline"
                size={25}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.quickActionTitle,
                isDark && { color: colors.text },
              ]}
            >
              Sucursales
            </Text>

            <Text
              style={[
                styles.quickActionDescription,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Ver mis sucursales
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.quickAction,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/cliente/pedidos")}
          >
            <View
              style={[
                styles.quickActionIcon,
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Ionicons
                name="receipt-outline"
                size={25}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.quickActionTitle,
                isDark && { color: colors.text },
              ]}
            >
              Mis pedidos
            </Text>

            <Text
              style={[
                styles.quickActionDescription,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Consultar historial
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.quickAction,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
            onPress={() => router.push("/cliente/pagos")}
          >
            <View
              style={[
                styles.quickActionIcon,
                isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
              ]}
            >
              <Ionicons
                name="wallet-outline"
                size={25}
                color={colors.primary}
              />
            </View>

            <Text
              style={[
                styles.quickActionTitle,
                isDark && { color: colors.text },
              ]}
            >
              Mis Deudas
            </Text>

            <Text
              style={[
                styles.quickActionDescription,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Consultar deudas
            </Text>
          </Pressable>
        </View>

        {/* ÚLTIMOS PEDIDOS */}
        <View style={styles.sectionHeader}>
          <Text
            style={[
              styles.sectionTitle,
              isDark && { color: colors.text },
            ]}
          >
            Últimos pedidos
          </Text>

          <Pressable onPress={() => router.push("/cliente/pedidos")}>
            <Text
              style={[
                styles.seeAllText,
                { color: colors.primary },
              ]}
            >
              Ver todos
            </Text>
          </Pressable>
        </View>

        {ultimosPedidos.length === 0 ? (
          <View
            style={[
              styles.emptyContainer,
              isDark && {
                backgroundColor: colors.card,
                borderColor: colors.border,
              },
            ]}
          >
            <Ionicons
              name="receipt-outline"
              size={46}
              color={colors.inputPlaceholder}
            />

            <Text
              style={[
                styles.emptyTitle,
                isDark && { color: colors.text },
              ]}
            >
              Todavía no tienes pedidos
            </Text>

            <Text
              style={[
                styles.emptyDescription,
                isDark && { color: colors.textSecondary },
              ]}
            >
              Crea tu primer pedido para verlo aquí.
            </Text>
          </View>
        ) : (
          <View style={styles.ordersContainer}>
            {ultimosPedidos.map((pedido) => {
              const colorEstado = obtenerColorEstado(pedido.estado);

              return (
                <Pressable
                  key={pedido.id}
                  style={[
                    styles.orderCard,
                    isDark && {
                      backgroundColor: colors.card,
                      borderColor: colors.border,
                    },
                  ]}
                  onPress={() => router.push("/cliente/pedidos")}
                >
                  <View
                    style={[
                      styles.orderIcon,
                      isDark && { backgroundColor: "rgba(200, 35, 27, 0.22)" },
                    ]}
                  >
                    <Ionicons
                      name="bag-handle-outline"
                      size={24}
                      color={colors.primary}
                    />
                  </View>

                  <View style={styles.orderInformation}>
                    <View style={styles.orderTop}>
                      <Text
                        style={[
                          styles.orderNumber,
                          isDark && { color: colors.text },
                        ]}
                      >
                        Pedido #{pedido.id}
                      </Text>

                      <View
                        style={[
                          styles.statusBadge,
                          {
                            backgroundColor: colorEstado.fondo,
                          },
                        ]}
                      >
                        <Text
                          style={[
                            styles.statusText,
                            {
                              color: colorEstado.texto,
                            },
                          ]}
                        >
                          {pedido.estado}
                        </Text>
                      </View>
                    </View>

                    <Text
                      style={[
                        styles.branchName,
                        isDark && { color: colors.textSecondary },
                      ]}
                    >
                      {pedido.sucursal ||
                        `Sucursal #${pedido.idSucursal ?? "-"}`}
                    </Text>

                    {!!pedido.motivoEdicion && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          marginTop: 4,
                          marginBottom: 4,
                          backgroundColor: isDark
                            ? "rgba(245, 158, 11, 0.15)"
                            : "#fffbeb",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: isDark
                            ? "rgba(245, 158, 11, 0.3)"
                            : "#fde68a",
                        }}
                      >
                        <Ionicons
                          name="notifications"
                          size={12}
                          color="#d97706"
                        />
                        <Text
                          style={{
                            fontSize: 11,
                            color: isDark ? "#fbbf24" : "#b45309",
                            fontWeight: "700",
                            flexShrink: 1,
                          }}
                          numberOfLines={1}
                        >
                          Modificado: {pedido.motivoEdicion}
                        </Text>
                      </View>
                    )}

                    {(pedido.estado === "Devuelto" ||
                      !!pedido.motivoDevolucion) && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 5,
                          marginTop: 4,
                          marginBottom: 4,
                          backgroundColor: isDark
                            ? "rgba(220, 38, 38, 0.16)"
                            : "#fef2f2",
                          paddingHorizontal: 8,
                          paddingVertical: 3,
                          borderRadius: 6,
                          borderWidth: 1,
                          borderColor: isDark
                            ? "rgba(220, 38, 38, 0.35)"
                            : "#fca5a5",
                        }}
                      >
                        <Ionicons
                          name="alert-circle"
                          size={12}
                          color="#dc2626"
                        />
                        <Text
                          style={{
                            fontSize: 11,
                            color: isDark ? "#f87171" : "#b91c1c",
                            fontWeight: "700",
                            flexShrink: 1,
                          }}
                          numberOfLines={1}
                        >
                          Devuelto:{" "}
                          {pedido.motivoDevolucion || "Reportado como no recibido"}
                        </Text>
                      </View>
                    )}

                    <View style={styles.orderBottom}>
                      <Text
                        style={[
                          styles.orderDate,
                          isDark && { color: colors.textMuted },
                        ]}
                      >
                        {formatearFecha(pedido.fechaPedido)}
                      </Text>

                      {pedido.estado.toLowerCase() === "entregado" &&
                        (Number(pedido.saldoPendiente ?? 0) > 0 ? (
                          <View
                            style={[
                              styles.balanceContainer,
                              isDark && {
                                backgroundColor: colors.dangerBg,
                                borderColor: colors.dangerBorder,
                              },
                            ]}
                          >
                            <Text
                              style={[
                                styles.balanceLabel,
                                isDark && { color: colors.textSecondary },
                              ]}
                            >
                              Saldo pendiente
                            </Text>
                            <Text
                              style={[
                                styles.balancePending,
                                isDark && { color: colors.dangerText },
                              ]}
                            >
                              Bs {formatearPrecio(pedido.saldoPendiente)}
                            </Text>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.balancePaidContainer,
                              isDark && {
                                backgroundColor: colors.successBg,
                                borderColor: colors.successBorder,
                              },
                            ]}
                          >
                            <Ionicons
                              name="checkmark-circle-outline"
                              size={16}
                              color={isDark ? "#4ade80" : "#15803d"}
                            />
                            <Text
                              style={[
                                styles.balancePaid,
                                isDark && { color: colors.successText },
                              ]}
                            >
                              Saldo pagado
                            </Text>
                          </View>
                        ))}
                    </View>
                  </View>
                </Pressable>
              );
            })}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function formatearPrecio(valor: number | string | null | undefined) {
  const numero = Number(valor ?? 0);

  return Number.isFinite(numero) ? numero.toFixed(2) : "0.00";
}

function formatearFecha(fecha: string) {
  if (!fecha) return "Fecha no disponible";

  const fechaConvertida = new Date(fecha);

  if (Number.isNaN(fechaConvertida.getTime())) {
    return fecha;
  }

  return fechaConvertida.toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
