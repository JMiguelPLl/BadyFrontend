import { StyleSheet } from "react-native";

const ROJO = "#b82018";

export const styles = StyleSheet.create({
  header: {
    width: "100%",
    minHeight: 82,
    paddingHorizontal: 28,
    paddingVertical: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e6e8eb",
     backgroundColor: "#1f2329",

    shadowColor: "#ffff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 7,
    elevation: 3,
    zIndex: 10,
  },

  botonMenuMovil: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#343941",
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginRight: 10,
  },

  tituloContainer: {
    flex: 1,
    minWidth: 0,
  },

  titulo: {
    color: "#ffff",
    fontSize: 18,
    fontWeight: "800",
  },

  subtitulo: {
    marginTop: 3,
    color: "#ffff",
    fontSize: 12,
  },

  usuarioContainer: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0ef",
  },

  usuarioInformacion: {
    minWidth: 125,
    maxWidth: 190,
    marginLeft: 11,
  },

  usuarioNombre: {
    color: "#ffff",
    fontSize: 14,
    fontWeight: "800",
  },

  usuarioCargo: {
    marginTop: 3,
    color: "#ffff",
    fontSize: 11,
    fontWeight: "500",
  },

  separador: {
    width: 1,
    height: 34,
    marginHorizontal: 18,
    backgroundColor: "#d11f1f",
  },

  botonCerrarSesion: {
    minHeight: 41,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#f0c2bf",
    borderRadius: 11,
    backgroundColor: "#fff7f6",
  },

  botonCerrarSesionPresionado: {
    opacity: 0.75,
  },

  botonCerrarSesionTexto: {
    color: ROJO,
    fontSize: 12,
    fontWeight: "800",
  },
  modalFondo: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(0, 0, 0, 0.55)",
},

modalFondoPresionable: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
},

modalContenido: {
  width: "90%",
  maxWidth: 420,
  paddingHorizontal: 28,
  paddingTop: 30,
  paddingBottom: 24,
  alignItems: "center",
  borderRadius: 18,
  backgroundColor: "#ffffff",

  shadowColor: "#000000",
  shadowOffset: {
    width: 0,
    height: 8,
  },
  shadowOpacity: 0.2,
  shadowRadius: 20,
  elevation: 10,
},

modalIcono: {
  width: 68,
  height: 68,
  marginBottom: 18,
  alignItems: "center",
  justifyContent: "center",
  borderRadius: 34,
  backgroundColor: "#fff0ef",
},

modalTitulo: {
  color: "#1f2329",
  fontSize: 22,
  fontWeight: "900",
},

modalDescripcion: {
  marginTop: 10,
  color: "#727982",
  fontSize: 14,
  lineHeight: 21,
  textAlign: "center",
},

modalBotones: {
  width: "100%",
  marginTop: 27,
  flexDirection: "row",
  justifyContent: "flex-end",
  gap: 12,
},

botonCancelar: {
  minWidth: 110,
  minHeight: 44,
  paddingHorizontal: 18,
  alignItems: "center",
  justifyContent: "center",
  borderWidth: 1,
  borderColor: "#dfe2e6",
  borderRadius: 11,
  backgroundColor: "#ffffff",
},

botonCancelarTexto: {
  color: "#4f565f",
  fontSize: 13,
  fontWeight: "700",
},

botonConfirmar: {
  minWidth: 145,
  minHeight: 44,
  paddingHorizontal: 18,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  borderRadius: 11,
  backgroundColor: "#b82018",
},

botonConfirmarTexto: {
  color: "#ffffff",
  fontSize: 13,
  fontWeight: "800",
},

botonModalPresionado: {
  opacity: 0.75,
},

botonDeshabilitado: {
  opacity: 0.55,
},
});