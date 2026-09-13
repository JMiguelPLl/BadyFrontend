import { Ionicons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { Image, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { useAppTheme } from "../../hooks/useAppTheme";
import { styles } from "../../styles/administrador/sidebar.styles";

type NombreIcono = React.ComponentProps<typeof Ionicons>["name"];

type OpcionMenu = {
  titulo: string;
  ruta: string;
  icono: NombreIcono;
};

const opcionesMenu: OpcionMenu[] = [
  {
    titulo: "Inicio",
    ruta: "/administrador/dashboard",
    icono: "home-outline",
  },
  {
    titulo: "Clientes",
    ruta: "/administrador/clientes",
    icono: "people-outline",
  },
  {
    titulo: "Sucursales",
    ruta: "/administrador/sucursales",
    icono: "business-outline",
  },
  {
    titulo: "Usuarios",
    ruta: "/administrador/usuarios",
    icono: "person-outline",
  },
  {
    titulo: "Roles",
    ruta: "/administrador/roles",
    icono: "shield-checkmark-outline",
  },
  {
    titulo: "Productos",
    ruta: "/administrador/productos",
    icono: "cube-outline",
  },
  {
    titulo: "Vehículos",
    ruta: "/administrador/vehiculos",
    icono: "car-outline",
  },
  {
    titulo: "Pedidos",
    ruta: "/administrador/asignacion-pedidos",
    icono: "cart-outline",
  },
  {
    titulo: "Deudas",
    ruta: "/administrador/pagos",
    icono: "wallet-outline",
  },
  {
    titulo: "Cierres de caja",
    ruta: "/administrador/cierres-caja",
    icono: "cash-outline",
  },
  {
    titulo: "Reportes",
    ruta: "/administrador/reportes",
    icono: "bar-chart-outline",
  },
];

type Props = {
  esMovil?: boolean;
  abierto?: boolean;
  onCerrar?: () => void;
};

export default function Sidebar({ esMovil = false, abierto = false, onCerrar }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { isDark, colors } = useAppTheme();

  const estaActivo = (ruta: string) => {
    return pathname === ruta;
  };

  const handleNavegar = (ruta: string) => {
    if (esMovil && onCerrar) {
      onCerrar();
    }
    router.push(ruta as never);
  };

  if (esMovil && !abierto) {
    return null;
  }

  const contenidoSidebar = (
    <View
      style={[
        styles.sidebar,
        esMovil && styles.sidebarMovil,
        isDark && {
          backgroundColor: "#121417",
          borderRightWidth: 1,
          borderRightColor: colors.borderLight,
        },
      ]}
    >
      <View
        style={[
          styles.logoContainer,
          isDark && { borderBottomColor: colors.borderLight },
        ]}
      >
        {esMovil && (
          <Pressable
            onPress={onCerrar}
            style={styles.botonCerrarMovil}
          >
            <Ionicons name="close-outline" size={22} color="#ffffff" />
          </Pressable>
        )}

        <Image
          source={require("../../../assets/images/logobady2.png")}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.logoTexto}>BADY&apos;S</Text>

        <Text
          style={[
            styles.logoSubtitulo,
            isDark && { color: colors.textSecondary },
          ]}
        >
          Panel administrativo
        </Text>
      </View>

      <ScrollView
        style={styles.menuScroll}
        contentContainerStyle={styles.menu}
        showsVerticalScrollIndicator={false}
      >
        {opcionesMenu.map((opcion) => {
          const activo = estaActivo(opcion.ruta);

          return (
            <Pressable
              key={opcion.ruta}
              style={({ pressed }) => [
                styles.menuItem,
                activo && [
                  styles.menuItemActivo,
                  { backgroundColor: colors.primary },
                ],
                pressed && styles.menuItemPresionado,
              ]}
              onPress={() => handleNavegar(opcion.ruta)}
            >
              <Ionicons
                name={opcion.icono}
                size={21}
                color={
                  activo
                    ? "#ffffff"
                    : isDark
                      ? colors.textSecondary
                      : "#d5d9df"
                }
              />

              <Text
                style={[
                  styles.menuItemTexto,
                  isDark && !activo && { color: colors.textSecondary },
                  activo && styles.menuItemTextoActivo,
                ]}
              >
                {opcion.titulo}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View
        style={[
          styles.footer,
          isDark && { borderTopColor: colors.borderLight },
        ]}
      >
        <Text
          style={[
            styles.footerTexto,
            isDark && { color: colors.textMuted },
          ]}
        >
          BADY&apos;S - TUPIZA
        </Text>
      </View>
    </View>
  );

  if (esMovil) {
    return (
      <View style={styles.overlay}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onCerrar} />
        {contenidoSidebar}
      </View>
    );
  }

  return contenidoSidebar;
}