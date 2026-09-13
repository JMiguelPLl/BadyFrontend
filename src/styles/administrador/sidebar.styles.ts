import { StyleSheet } from "react-native";

const ROJO = "#b82018";
const ROJO_OSCURO = "#8d1711";

export const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    zIndex: 999,
  },

  sidebar: {
    width: 265,
    minHeight: "100%",
    height: "100%",
    paddingHorizontal: 16,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#1f2329",
  },

  sidebarMovil: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    width: 280,
    maxWidth: "85%",
    zIndex: 1000,
    shadowColor: "#000000",
    shadowOffset: { width: 4, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 20,
  },

  logoContainer: {
    alignItems: "center",
    paddingBottom: 18,
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#343941",
    position: "relative",
  },

  botonCerrarMovil: {
    position: "absolute",
    top: 0,
    right: 0,
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
  },

  logo: {
    width: 80,
    height: 80,
  },

  logoTexto: {
    marginTop: 6,
    color: "#ffffff",
    fontSize: 19,
    fontWeight: "900",
    letterSpacing: 1,
  },

  logoSubtitulo: {
    marginTop: 2,
    color: "#9da4ad",
    fontSize: 11,
  },

  menuScroll: {
    flex: 1,
  },

  menu: {
    paddingVertical: 4,
    gap: 6,
  },

  menuItem: {
    minHeight: 46,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderRadius: 11,
  },

  menuItemActivo: {
    backgroundColor: ROJO,
    shadowColor: ROJO_OSCURO,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },

  menuItemPresionado: {
    opacity: 0.8,
  },

  menuItemTexto: {
    color: "#d5d9df",
    fontSize: 13,
    fontWeight: "600",
  },

  menuItemTextoActivo: {
    color: "#ffffff",
    fontWeight: "800",
  },

  footer: {
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#343941",
    alignItems: "center",
  },

  footerTexto: {
    color: "#737b85",
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.7,
  },
});