import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: "#f6f7f9",
  },

  contenido: {
    padding: 24,
    paddingBottom: 50,
  },

  encabezado: {
    marginBottom: 22,
  },

  titulo: {
    color: "#1f2329",
    fontSize: 28,
    fontWeight: "900",
  },

  subtitulo: {
    marginTop: 5,
    color: "#757d86",
    fontSize: 13,
  },

  resumen: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 20,
  },

  resumenCard: {
    minWidth: 185,
    flexGrow: 1,
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eceff2",
    backgroundColor: "#ffffff",
  },

  resumenValor: {
    color: "#1f2329",
    fontSize: 22,
    fontWeight: "900",
  },

  resumenTexto: {
    marginTop: 5,
    color: "#7d858e",
    fontSize: 12,
    fontWeight: "600",
  },

  tarjeta: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eceff2",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  herramientas: {
    padding: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eef0f2",
  },

  buscador: {
    minHeight: 44,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 9,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#dfe3e8",
    backgroundColor: "#ffffff",
  },

  inputBusqueda: {
    flex: 1,
    color: "#1f2329",
    fontSize: 13,
    outlineStyle: "none" as any,
  },

  filtros: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 12,
  },

  grupoFiltro: {
    minWidth: 170,
  },

  filtroEtiqueta: {
    marginBottom: 6,
    color: "#555d66",
    fontSize: 11,
    fontWeight: "800",
  },

  selectorCaja: {
    minHeight: 44,
    justifyContent: "center",
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#dfe3e8",
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  selector: {
    height: 42,
    borderWidth: 0,
    color: "#31373e",
    backgroundColor: "transparent",
    outlineStyle: "none" as any,
  },

  botonFecha: {
    minHeight: 44,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#dfe3e8",
    backgroundColor: "#ffffff",
  },

  botonFechaTexto: {
    color: "#414850",
    fontSize: 12,
    fontWeight: "700",
  },

  botonSecundario: {
    minHeight: 44,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#dfe3e8",
    backgroundColor: "#ffffff",
  },

  botonSecundarioTexto: {
    color: "#1f2329",
    fontSize: 12,
    fontWeight: "800",
  },

  botonLimpiar: {
    minHeight: 44,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 11,
    backgroundColor: "#fff1f0",
  },

  botonLimpiarTexto: {
    color: "#b82018",
    fontSize: 12,
    fontWeight: "800",
  },

  tabla: {
    width: "100%",
  },

  filaHead: {
    minHeight: 48,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fb",
    borderBottomWidth: 1,
    borderBottomColor: "#eceff2",
    width: "100%",
  },

  fila: {
    minHeight: 70,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f1f3",
    width: "100%",
  },

  head: {
    color: "#727a84",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },

  celda: {
    color: "#353b42",
    fontSize: 12,
  },

  colId: { width: 50 },
  colUsuario: { flex: 2, minWidth: 140 },
  colApertura: { flex: 1.25, minWidth: 110 },
  colCierre: { flex: 1.25, minWidth: 110 },
  colEfectivo: { flex: 1, minWidth: 80 },
  colQr: { flex: 0.9, minWidth: 75 },
  colTotal: { flex: 1, minWidth: 80 },
  colEstado: { flex: 1, minWidth: 80 },
  colAcciones: { width: 105, alignItems: "flex-end" },

  accionesCelda: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 8,
  },

  usuarioCelda: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  avatar: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
    backgroundColor: "#fce9e7",
  },

  avatarTexto: {
    color: "#b82018",
    fontSize: 13,
    fontWeight: "900",
  },

  usuarioNombre: {
    color: "#252b31",
    fontSize: 12,
    fontWeight: "800",
  },

  usuarioCorreo: {
    marginTop: 2,
    color: "#9298a0",
    fontSize: 10,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 99,
  },

  badgeAbierta: {
    backgroundColor: "#ecfdf3",
  },

  badgeCerrada: {
    backgroundColor: "#eef2f7",
  },

  badgeAnulada: {
    backgroundColor: "#fff1f0",
  },

  badgeTextoAbierta: {
    color: "#15803d",
    fontSize: 10,
    fontWeight: "900",
  },

  badgeTextoCerrada: {
    color: "#59616b",
    fontSize: 10,
    fontWeight: "900",
  },

  badgeTextoAnulada: {
    color: "#b82018",
    fontSize: 10,
    fontWeight: "900",
  },

  botonIcono: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },

  botonDetalle: {
    backgroundColor: "#fff7ed",
  },

  botonCerrar: {
    backgroundColor: "#ecfdf3",
  },

  vacio: {
    minHeight: 220,
    alignItems: "center",
    justifyContent: "center",
    padding: 28,
  },

  vacioTexto: {
    marginTop: 10,
    color: "#8a9199",
    fontSize: 12,
    textAlign: "center",
  },

  modalFondo: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    backgroundColor: "rgba(0,0,0,.46)",
  },

  modal: {
    width: "100%",
    maxWidth: 760,
    maxHeight: "90%",
    borderRadius: 20,
    backgroundColor: "#ffffff",
    overflow: "hidden",
  },

  modalAmplio: {
    maxWidth: 980,
  },

  modalHead: {
    minHeight: 62,
    paddingHorizontal: 20,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eceff2",
  },

  modalTitulo: {
    color: "#252b31",
    fontSize: 18,
    fontWeight: "900",
  },

  cerrar: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#f5f6f8",
  },

  modalBody: {
    padding: 20,
    paddingBottom: 28,
  },

  detalleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  datoCard: {
    minWidth: 180,
    flexGrow: 1,
    padding: 14,
    borderRadius: 13,
    backgroundColor: "#f8f9fb",
  },

  datoEtiqueta: {
    color: "#7c848d",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  datoValor: {
    marginTop: 5,
    color: "#30363d",
    fontSize: 13,
    fontWeight: "800",
  },

  seccionTitulo: {
    marginTop: 22,
    marginBottom: 10,
    color: "#272d34",
    fontSize: 15,
    fontWeight: "900",
  },

  pagoCard: {
    marginBottom: 9,
    padding: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: "#eceff2",
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },

  pagoIcono: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#ecfdf3",
  },

  pagoInfo: {
    flex: 1,
  },

  pagoCliente: {
    color: "#2d333a",
    fontSize: 12,
    fontWeight: "900",
  },

  pagoSecundario: {
    marginTop: 3,
    color: "#808892",
    fontSize: 10,
  },

  pagoMonto: {
    color: "#15803d",
    fontSize: 14,
    fontWeight: "900",
  },

  pagoAcciones: {
    flexDirection: "row",
    gap: 6,
    alignItems: "center",
  },

  botonEditarPago: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },

  botonAnularPago: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecaca",
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

  selectorModal: {
    minHeight: 46,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: "#dfe3e8",
    backgroundColor: "#fafbfc",
    justifyContent: "center",
  },

  bannerInfoPago: {
    padding: 12,
    borderRadius: 11,
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    marginBottom: 16,
  },

  bannerInfoTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#166534",
  },

  observacionCaja: {
    marginTop: 12,
    padding: 13,
    borderRadius: 12,
    backgroundColor: "#fffaf0",
  },

  observacionTexto: {
    color: "#665d4d",
    fontSize: 12,
    lineHeight: 18,
  },

  mensajeModal: {
    width: "100%",
    maxWidth: 430,
    padding: 28,
    alignItems: "center",
    borderRadius: 20,
    backgroundColor: "#ffffff",
  },

  mensajeTitulo: {
    marginTop: 10,
    color: "#252b31",
    fontSize: 17,
    fontWeight: "900",
  },

  mensajeTexto: {
    marginTop: 8,
    color: "#737b84",
    fontSize: 12,
    lineHeight: 18,
    textAlign: "center",
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
    minWidth: 130,
    minHeight: 46,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
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
    fontSize: 12,
    fontWeight: "800",
  },

  confirmarTexto: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "900",
  },

  calendarioModal: {
    width: 370,
    maxWidth: "100%",
    padding: 18,
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },

  calendarioCabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  calendarioNavegacion: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#f5f6f8",
  },

  calendarioTitulo: {
    color: "#272d34",
    fontSize: 14,
    fontWeight: "900",
    textTransform: "capitalize",
  },

  calendarioSemana: {
    marginTop: 15,
    flexDirection: "row",
  },

  calendarioDiaSemana: {
    width: "14.2857%",
    textAlign: "center",
    color: "#8a9199",
    fontSize: 10,
    fontWeight: "800",
  },

  calendarioGrid: {
    marginTop: 7,
    flexDirection: "row",
    flexWrap: "wrap",
  },

  calendarioDiaCaja: {
    width: "14.2857%",
    alignItems: "center",
    paddingVertical: 3,
  },

  calendarioDia: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 17,
  },

  calendarioDiaSeleccionado: {
    backgroundColor: "#b82018",
  },

  calendarioDiaTexto: {
    color: "#444b53",
    fontSize: 11,
    fontWeight: "700",
  },

  calendarioDiaTextoSeleccionado: {
    color: "#ffffff",
    fontWeight: "900",
  },
});
