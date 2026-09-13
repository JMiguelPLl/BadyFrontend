import { Slot } from "expo-router";
import { useState } from "react";
import { useWindowDimensions, View } from "react-native";

import Header from "../../components/administrador/Header";
import NotificacionesAdminModal from "../../components/administrador/NotificacionesAdminModal";
import Sidebar from "../../components/administrador/Sidebar";
import { useAppTheme } from "../../hooks/useAppTheme";
import { styles } from "../../styles/administrador/layout.styles";

export default function AdministradorLayout() {
  const { colors } = useAppTheme();
  const { width } = useWindowDimensions();
  const esMovil = width < 1024;
  const [sidebarAbierto, setSidebarAbierto] = useState(false);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Sidebar
        esMovil={esMovil}
        abierto={sidebarAbierto}
        onCerrar={() => setSidebarAbierto(false)}
      />

      <View style={[styles.contenido, { backgroundColor: colors.background }]}>
        <Header
          esMovil={esMovil}
          onToggleSidebar={() => setSidebarAbierto((prev) => !prev)}
        />

        <View
          style={[
            styles.contenidoPagina,
            { backgroundColor: colors.background },
          ]}
        >
          <Slot />
        </View>
      </View>

      {/* Modal interactivo de notificaciones en tiempo real para el administrador */}
      <NotificacionesAdminModal />
    </View>
  );
}