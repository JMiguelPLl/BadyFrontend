import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  fondo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    backgroundColor: "rgba(0, 0, 0, 0.60)",
  },

  fondoPresionable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },

  contenido: {
    width: "100%",
    maxWidth: 540,
    maxHeight: "90%",
    padding: 22,
    borderRadius: 18,
    backgroundColor: "#ffffff",
    overflow: "hidden",

    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 12,
    },
    shadowOpacity: 0.24,
    shadowRadius: 25,
    elevation: 12,
  },

  scrollContainer: {
    width: "100%",
    maxHeight: "100%",
  },

  scrollContent: {
    alignItems: "center",
    paddingBottom: 6,
  },

  icono: {
    width: 60,
    height: 60,
    marginBottom: 14,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 30,
  },

  iconoFormulario: {
    backgroundColor: "#eef0f2",
  },

  iconoAdvertencia: {
    backgroundColor: "#fff7e6",
  },

  iconoExito: {
    backgroundColor: "#ecfdf3",
  },

  iconoError: {
    backgroundColor: "#fff0ef",
  },

  titulo: {
    color: "#1f2329",
    fontSize: 21,
    fontWeight: "900",
    textAlign: "center",
  },

  descripcion: {
    maxWidth: 420,
    marginTop: 8,
    color: "#737b85",
    fontSize: 13,
    lineHeight: 20,
    textAlign: "center",
  },

  cuerpo: {
    width: "100%",
    marginTop: 20,
  },

  botones: {
    width: "100%",
    marginTop: 20,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#eceef0",
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 12,
  },

  botonCancelar: {
    minWidth: 105,
    minHeight: 42,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },

  botonConfirmar: {
    minWidth: 125,
    minHeight: 42,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 10,
    backgroundColor: "#1f2329",
  },

  botonPeligro: {
    backgroundColor: "#b82018",
  },

  botonPresionado: {
    opacity: 0.75,
  },

  botonDeshabilitado: {
    opacity: 0.55,
  },

  textoCancelar: {
    color: "#555d66",
    fontSize: 13,
    fontWeight: "700",
  },

  textoConfirmar: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
});