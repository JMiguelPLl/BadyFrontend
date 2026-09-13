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
    flexWrap: "wrap",
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
    flexWrap: "wrap",
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

  contenedorBotonesHerramientas: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    zIndex: 100,
  },

  contenedorFiltro: {
    position: "relative",
    zIndex: 100,
  },

  botonFiltrar: {
    minHeight: 43,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },

  botonFiltrarTexto: {
    color: "#1f2329",
    fontSize: 13,
    fontWeight: "700",
  },

  menuFiltros: {
    position: "absolute",
    top: 50,
    right: 0,
    width: 170,
    padding: 8,
    borderWidth: 1,
    borderColor: "#e1e4e8",
    borderRadius: 12,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 20,
    zIndex: 9999,
  },

  opcionFiltro: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderRadius: 8,
  },

  opcionFiltroTexto: {
    color: "#24292f",
    fontSize: 13,
    fontWeight: "600",
  },

  puntoActivo: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#16a34a",
  },

  puntoInactivo: {
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: "#dc2626",
  },

  botonActualizar: {
    minHeight: 43,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 10,
    backgroundColor: "#ffffff",
  },

  botonActualizarTexto: {
    color: "#1f2329",
    fontSize: 13,
    fontWeight: "700",
  },

  botonPresionado: {
    opacity: 0.8,
  },

  tabla: {
    width: "100%",
  },

  tablaCabecera: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    backgroundColor: "#f9fafb",
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaec",
  },

  columnaCabecera: {
    color: "#6b7280",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  colCliente: {
    flex: 3,
    minWidth: 200,
  },

  colSucursalesCount: {
    flex: 1.5,
    minWidth: 120,
  },

  colEstado: {
    flex: 1.5,
    minWidth: 110,
  },

  colAcciones: {
    width: 170,
    textAlign: "right",
  },

  filaCliente: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f3f5",
  },

  clienteCelda: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#1e293b",
    alignItems: "center",
    justifyContent: "center",
  },

  avatarTexto: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "900",
  },

  clienteInfo: {
    flex: 1,
  },

  clienteNombre: {
    color: "#1f2329",
    fontSize: 14,
    fontWeight: "800",
  },

  clienteSecundario: {
    marginTop: 2,
    color: "#6b7280",
    fontSize: 12,
  },

  badgeCantidad: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 99,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    alignSelf: "flex-start",
  },

  badgeCantidadTexto: {
    color: "#1d4ed8",
    fontSize: 11,
    fontWeight: "800",
  },

  badge: {
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 99,
    alignSelf: "flex-start",
  },

  badgeActivo: {
    backgroundColor: "#ecfdf3",
  },

  badgeInactivo: {
    backgroundColor: "#fef2f2",
  },

  badgeTextoActivo: {
    color: "#15803d",
    fontSize: 11,
    fontWeight: "800",
  },

  badgeTextoInactivo: {
    color: "#b91c1c",
    fontSize: 11,
    fontWeight: "800",
  },

  accionesFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },

  botonDesplegar: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: 8,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },

  botonDesplegarTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },

  botonAgregarMini: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
  },

  // Área desplegable de sucursales
  contenedorDesplegable: {
    padding: 16,
    backgroundColor: "#f8fafc",
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },

  tituloDesplegable: {
    fontSize: 12,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    marginBottom: 12,
  },

  gridSucursales: {
    gap: 10,
  },

  tarjetaSucursal: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
  },

  sucursalInfo: {
    flex: 1,
    minWidth: 200,
  },

  sucursalCabeceraInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  sucursalNombre: {
    fontSize: 14,
    fontWeight: "800",
    color: "#1e293b",
  },

  sucursalDescripcion: {
    marginTop: 3,
    fontSize: 12,
    color: "#64748b",
  },

  sucursalUbicacionFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    marginTop: 6,
  },

  sucursalUbicacionTexto: {
    fontSize: 12,
    color: "#0284c7",
    fontWeight: "600",
  },

  accionesSucursal: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  botonAccionSucursal: {
    width: 34,
    height: 34,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
  },

  botonVer: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
  },

  botonEditar: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
  },

  botonEstadoActivar: {
    backgroundColor: "#ecfdf3",
    borderColor: "#bbf7d0",
  },

  botonEstadoDesactivar: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
  },

  // Modales
  modalFondo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,.46)",
  },

  modal: {
    width: "100%",
    maxWidth: 580,
    maxHeight: "90%",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  modalHeader: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaec",
  },

  modalTitulo: {
    fontSize: 17,
    fontWeight: "900",
    color: "#1f2329",
  },

  modalBody: {
    padding: 20,
  },

  modalAcciones: {
    padding: 18,
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#eceff2",
  },

  botonModal: {
    minWidth: 120,
    minHeight: 44,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  botonCancelar: {
    borderWidth: 1,
    borderColor: "#dfe3e8",
    backgroundColor: "#ffffff",
  },

  botonConfirmar: {
    backgroundColor: "#b82018",
  },

  cancelarTexto: {
    color: "#5f6770",
    fontSize: 13,
    fontWeight: "800",
  },

  confirmarTexto: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "900",
  },

  campo: {
    marginBottom: 16,
  },

  etiqueta: {
    marginBottom: 6,
    color: "#555d66",
    fontSize: 12,
    fontWeight: "800",
  },

  input: {
    minHeight: 46,
    paddingHorizontal: 14,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#dfe3e8",
    backgroundColor: "#fafbfc",
    color: "#1f2329",
    fontSize: 13,
  },

  textArea: {
    minHeight: 80,
    paddingVertical: 12,
    textAlignVertical: "top",
  },

  selectorModal: {
    minHeight: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#dfe3e8",
    backgroundColor: "#fafbfc",
    justifyContent: "center",
  },

  bannerInfo: {
    padding: 12,
    borderRadius: 11,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 16,
  },

  bannerInfoTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#166534",
  },

  // Estado vacio / cargando
  estadoCentro: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },

  estadoTexto: {
    marginTop: 12,
    fontSize: 13,
    color: "#8a9199",
    textAlign: "center",
  },
});
