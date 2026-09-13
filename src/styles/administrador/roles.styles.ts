import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },

  contenidoPagina: {
    padding: 22,
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

  botonPresionado: {
    opacity: 0.72,
  },

  resumen: {
    marginTop: 22,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 13,
  },

  tarjetaResumen: {
    minWidth: 220,
    flex: 1,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 13,
    borderWidth: 1,
    borderColor: "#e4e7ea",
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },

  iconoResumen: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#eef0f2",
  },

  iconoActivo: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#ecfdf3",
  },

  iconoInactivo: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#fff0ef",
  },

  valorResumen: {
    color: "#1f2329",
    fontSize: 22,
    fontWeight: "900",
  },

  etiquetaResumen: {
    marginTop: 3,
    color: "#7e858d",
    fontSize: 12,
    fontWeight: "600",
  },

  tarjetaTabla: {
    marginTop: 20,
    position: "relative",
    overflow: "visible",
    borderWidth: 1,
    borderColor: "#e3e6e9",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },

  barraHerramientas: {
    minHeight: 67,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaec",
    position: "relative",
    zIndex: 1000,
  },

  buscador: {
    width: "100%",
    maxWidth: 500,
    minHeight: 43,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 9,
    backgroundColor: "#fafbfc",
  },

  inputBusqueda: {
    flex: 1,
    color: "#1f2329",
    fontSize: 13,
    outlineStyle: "none",
  } as any,

  contenedorBotones: {
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    position: "relative",
    zIndex: 2000,
  },

  contenedorFiltro: {
    position: "relative",
    zIndex: 3000,
  },

  botonFiltrar: {
    minHeight: 42,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 9,
    backgroundColor: "#ffffff",
  },

  botonFiltrarTexto: {
    color: "#1f2329",
    fontSize: 12,
    fontWeight: "700",
  },

  botonActualizar: {
    minHeight: 42,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 9,
    backgroundColor: "#ffffff",
  },

  botonActualizarTexto: {
    color: "#1f2329",
    fontSize: 12,
    fontWeight: "700",
  },

  menuFiltros: {
    position: "absolute",
    top: 48,
    right: 0,
    width: 175,
    padding: 6,
    borderWidth: 1,
    borderColor: "#e2e5e9",
    borderRadius: 10,
    backgroundColor: "#ffffff",
    zIndex: 9999,
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
    paddingHorizontal: 11,
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
    color: "#68707a",
    fontSize: 13,
    fontWeight: "600",
  },

  opcionFiltroTextoSeleccionado: {
    color: "#2563eb",
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
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
    width: "100%",
  },

  fila: {
    minHeight: 68,
    paddingHorizontal: 16,
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
    width: 65,
  },

  columnaDescripcion: {
    flex: 1,
    minWidth: 160,
  },

  columnaEstado: {
    width: 140,
    justifyContent: "center",
  },

  columnaAcciones: {
    width: 100,
    alignItems: "flex-end",
  },

  celdaRol: {
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  iconoRol: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#1f2329",
  },

  nombreRol: {
    flex: 1,
    color: "#24292f",
    fontSize: 13,
    fontWeight: "800",
  },

  celdaEstado: {
    paddingHorizontal: 8,
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

  puntoActivo: {
    backgroundColor: "#16a34a",
  },

  puntoInactivo: {
    backgroundColor: "#dc2626",
  },

  estadoTextoBadge: {
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
    paddingHorizontal: 8,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
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
    paddingHorizontal: 16,
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
});