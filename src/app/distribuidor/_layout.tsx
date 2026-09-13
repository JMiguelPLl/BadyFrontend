import { Ionicons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { View } from "react-native";

import NotificacionesDistribuidorModal from "../../components/distribuidor/NotificacionesDistribuidorModal";
import { useAppTheme } from "../../hooks/useAppTheme";

export default function DistribuidorLayout() {
  const { colors, isDark } = useAppTheme();

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarActiveTintColor: colors.tabBarActive,
          tabBarInactiveTintColor: colors.tabBarInactive,
          tabBarStyle: {
            height: 68,
            paddingTop: 7,
            paddingBottom: 8,
            backgroundColor: colors.tabBarBg,
            borderTopColor: colors.tabBarBorder,
            elevation: 10,
            shadowColor: "#000000",
            shadowOpacity: isDark ? 0.3 : 0.08,
            shadowRadius: 10,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: "600",
          },
        }}
      >
        {/* INICIO */}
        <Tabs.Screen
          name="index"
          options={{
            title: "Inicio",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "home" : "home-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* COBROS */}
        <Tabs.Screen
          name="pagos"
          options={{
            title: "Cobros",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "wallet" : "wallet-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* CAJA */}
        <Tabs.Screen
          name="caja"
          options={{
            title: "Caja",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "cash" : "cash-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />

        {/* PERFIL */}
        <Tabs.Screen
          name="perfil"
          options={{
            title: "Mi perfil",
            tabBarIcon: ({ color, focused }) => (
              <Ionicons
                name={focused ? "person" : "person-outline"}
                size={24}
                color={color}
              />
            ),
          }}
        />
      </Tabs>

      {/* Modal interactivo de notificación de nuevo pedido asignado */}
      <NotificacionesDistribuidorModal />
    </View>
  );
}