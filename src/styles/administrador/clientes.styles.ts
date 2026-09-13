import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },

  contenidoPagina: {
    padding: 28,
  },

  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
  },

  titulo: {
    color: "#1f2329",
    fontSize: 29,
    fontWeight: "900",
  },

  subtitulo: {
    marginTop: 6,
    color: "#7b828a",
    fontSize: 14,
  },

  botonAgregar: {
    minHeight: 45,
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 11,
    backgroundColor: "#b82018",
  },

  botonAgregarTexto: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },

  resumen: {
    marginTop: 25,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 16,
  },

  tarjetaResumen: {
    minWidth: 220,
    flex: 1,
    padding: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    borderWidth: 1,
    borderColor: "#e4e7ea",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },

  iconoResumen: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#eef0f2",
  },

  iconoActivo: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#ecfdf3",
  },

  iconoInactivo: {
    width: 48,
    height: 48,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    backgroundColor: "#fff0ef",
  },

  valorResumen: {
    color: "#1f2329",
    fontSize: 23,
    fontWeight: "900",
  },

  etiquetaResumen: {
    marginTop: 3,
    color: "#7e858d",
    fontSize: 12,
    fontWeight: "600",
  },

tarjetaTabla: {
  marginTop: 22,
  overflow: "visible",
  position: "relative",
  borderWidth: 1,
  borderColor: "#e3e6e9",
  borderRadius: 15,
  backgroundColor: "#ffffff",
},
  barraHerramientas: {
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaec",
  },

  buscador: {
    width: "100%",
    maxWidth: 520,
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 10,
    backgroundColor: "#fafbfc",
  },

  inputBusqueda: {
    flex: 1,
    color: "#1f2329",
    fontSize: 13,
    outlineStyle: "none",
  } as any,

  botonActualizar: {
    minHeight: 43,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },

  botonActualizarTexto: {
    color: "#1f2329",
    fontSize: 12,
    fontWeight: "700",
  },

  scrollTabla: {
    width: "100%",
  },

  tabla: {
    width: "100%",
  },

  filaEncabezado: {
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
    width: "100%",
  },

  fila: {
    minHeight: 66,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eceef0",
    backgroundColor: "#ffffff",
    width: "100%",
  },

  celdaEncabezado: {
    paddingHorizontal: 8,
    color: "#5e6670",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },

  celda: {
    paddingHorizontal: 8,
    color: "#4f565e",
    fontSize: 13,
  },

  columnaId: {
    width: 60,
  },

  columnaNombre: {
    flex: 2,
    minWidth: 130,
  },

  columnaCorreo: {
    flex: 2.2,
    minWidth: 140,
  },

  columnaTelefono: {
    flex: 1.2,
    minWidth: 100,
  },

  columnaEstado: {
    flex: 1.1,
    minWidth: 90,
  },

  columnaAcciones: {
    width: 95,
    alignItems: "flex-end",
  },

  celdaConAvatar: {
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
  },

  avatarCliente: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#1f2329",
  },

  avatarClienteTexto: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },

  nombreCliente: {
    flex: 1,
    color: "#24292f",
    fontSize: 13,
    fontWeight: "700",
  },

  celdaEstado: {
    paddingHorizontal: 14,
    justifyContent: "center",
  },

  estadoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 20,
  },

  estadoActivo: {
    backgroundColor: "#ecfdf3",
  },

  estadoInactivo: {
    backgroundColor: "#fff0ef",
  },

  estadoPunto: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },


  estadoBadgeTexto: {
    fontSize: 11,
    fontWeight: "800",
  },

  estadoActivoTexto: {
    color: "#15803d",
  },

  estadoInactivoTexto: {
    color: "#b82018",
  },

  celdaAcciones: {
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  botonAccion: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 9,
  },

  botonEditar: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },

  botonEliminar: {
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
  },

  botonActivar: {
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
  },

  botonPresionado: {
    opacity: 0.72,
  },

  estadoCentro: {
    minHeight: 290,
    padding: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  estadoTitulo: {
    marginTop: 14,
    color: "#32383f",
    fontSize: 17,
    fontWeight: "800",
  },

  estadoTexto: {
    marginTop: 8,
    color: "#878e96",
    fontSize: 13,
    textAlign: "center",
  },

  pieTabla: {
    minHeight: 48,
    paddingHorizontal: 17,
    alignItems: "flex-end",
    justifyContent: "center",
    borderTopWidth: 1,
    borderTopColor: "#e8eaec",
  },

  pieTablaTexto: {
    color: "#858c94",
    fontSize: 12,
    fontWeight: "600",
  },

  formulario: {
    width: "100%",
    gap: 16,
  },

  grupoCampo: {
    width: "100%",
  },

  etiquetaCampo: {
    marginBottom: 7,
    color: "#343a40",
    fontSize: 12,
    fontWeight: "800",
  },

  input: {
    width: "100%",
    minHeight: 45,
    paddingHorizontal: 13,
    color: "#1f2329",
    fontSize: 13,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 9,
    backgroundColor: "#ffffff",
    outlineStyle: "none",
  } as any,

  inputError: {
    borderColor: "#b82018",
    backgroundColor: "#fffafa",
  },

  textoError: {
    marginTop: 5,
    color: "#b82018",
    fontSize: 11,
    fontWeight: "600",
  },
contenedorBotonesHerramientas: {
  width: "100%",
  paddingHorizontal: 12,
  paddingVertical: 9,
  flexDirection: "row",
  justifyContent: "flex-end",
  alignItems: "center",
  gap: 10,

  position: "relative",
  zIndex: 10000,
  elevation: 20,
},



contenedorFiltro: {
  position: "relative",
  zIndex: 11000,
  elevation: 21,
},

botonFiltrar: {
  minHeight: 42,
  paddingHorizontal: 15,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: "#dce0e4",
  borderRadius: 9,
},

botonFiltrarTexto: {
  fontSize: 13,
  fontWeight: "700",
  color: "#1f2329",
},

menuFiltros: {
  position: "absolute",
  top: 46,
  right: 0,
  width: 165,
  padding: 6,

  backgroundColor: "#ffffff",
  borderWidth: 1,
  borderColor: "#e2e5e9",
  borderRadius: 10,

  zIndex: 12000,
  elevation: 30,

  shadowColor: "#000000",
  shadowOffset: {
    width: 0,
    height: 4,
  },
  shadowOpacity: 0.12,
  shadowRadius: 10,
},

opcionFiltro: {
  minHeight: 40,
  paddingHorizontal: 12,
  flexDirection: "row",
  alignItems: "center",
  gap: 9,
  borderRadius: 7,
},

opcionFiltroSeleccionada: {
  backgroundColor: "#eff6ff",
},

opcionPresionada: {
  opacity: 0.7,
},

opcionFiltroTexto: {
  fontSize: 13,
  fontWeight: "600",
  color: "#68707a",
},

opcionFiltroTextoSeleccionado: {
  color: "#2563eb",
  fontWeight: "700",
},

puntoActivo: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#16a34a",
},

puntoInactivo: {
  width: 8,
  height: 8,
  borderRadius: 4,
  backgroundColor: "#dc2626",
},

});