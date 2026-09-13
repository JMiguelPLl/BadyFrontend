import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pagina: { flex: 1, backgroundColor: "#f4f5f7" },
  contenido: { padding: 24 },

  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  titulo: { color: "#1f2329", fontSize: 29, fontWeight: "900" },
  subtitulo: { marginTop: 5, color: "#7b828a", fontSize: 14 },

  resumen: {
    marginTop: 20,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  resumenCard: {
    minWidth: 210,
    flex: 1,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e3e6e9",
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },
  resumenValor: { color: "#1f2329", fontSize: 22, fontWeight: "900" },
  resumenTexto: { marginTop: 3, color: "#7e858d", fontSize: 12 },

  tarjeta: {
    marginTop: 20,
    overflow: "visible",
    borderWidth: 1,
    borderColor: "#e3e6e9",
    borderRadius: 14,
    backgroundColor: "#ffffff",
  },

  herramientas: {
    padding: 14,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    gap: 12,
    flexWrap: "wrap",
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaec",
  },

  buscador: {
    flex: 1,
    minWidth: 280,
    maxWidth: 480,
    minHeight: 43,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 9,
    backgroundColor: "#fafbfc",
  },
  inputBusqueda: {
    flex: 1,
    color: "#1f2329",
    outlineStyle: "none",
  } as any,

  filtros: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 9,
    flexWrap: "wrap",
  },
  grupoFiltro: { minWidth: 145 },
  filtroEtiqueta: {
    marginBottom: 5,
    color: "#606770",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  selectorCaja: {
    minHeight: 42,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 9,
    backgroundColor: "#ffffff",
  },
  selector: {
    minHeight: 42,
    minWidth: 145,
    color: "#1f2329",
  },

  botonSecundario: {
    minHeight: 42,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 9,
    backgroundColor: "#ffffff",
  },
  botonSecundarioTexto: {
    color: "#1f2329",
    fontSize: 12,
    fontWeight: "700",
  },

  botonLimpiar: {
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 9,
    backgroundColor: "#fff1f2",
  },
  botonLimpiarTexto: {
    color: "#b82018",
    fontSize: 12,
    fontWeight: "800",
  },

  tabla: { width: "100%" },

  filaHead: {
    minHeight: 50,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
    width: "100%",
  },
  fila: {
    minHeight: 72,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: "#eceef0",
    backgroundColor: "#ffffff",
    width: "100%",
  },

  head: {
    paddingHorizontal: 6,
    color: "#5e6670",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  celda: {
    paddingHorizontal: 6,
    color: "#4f565e",
    fontSize: 12,
  },

  colId: { width: 50 },
  colCliente: { flex: 2, minWidth: 130 },
  colSucursal: { flex: 1.8, minWidth: 120 },
  colFecha: { flex: 1.2, minWidth: 100 },
  colCantidad: { flex: 0.9, minWidth: 75 },
  colTotal: { flex: 1, minWidth: 85 },
  colEstado: { flex: 1.1, minWidth: 90 },
  colAcciones: { width: 130, alignItems: "flex-end" },

  clienteCelda: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  avatar: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#1f2329",
  },
  avatarTexto: { color: "#ffffff", fontWeight: "900" },
  clienteInfo: { flex: 1 },
  clienteNombre: {
    color: "#24292f",
    fontSize: 12,
    fontWeight: "800",
  },
  clienteSecundario: {
    marginTop: 2,
    color: "#8a9199",
    fontSize: 10,
  },

  badge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 18,
  },
  badgePendiente: { backgroundColor: "#fff7ed" },
  badgeAsignado: { backgroundColor: "#eff6ff" },
  badgeConfirmacion: { backgroundColor: "#faf5ff" },
  badgeEntregado: { backgroundColor: "#ecfdf3" },
  badgeOtro: { backgroundColor: "#f3f4f6" },

  textoPendiente: { color: "#c2410c", fontSize: 11, fontWeight: "800" },
  textoAsignado: { color: "#1d4ed8", fontSize: 11, fontWeight: "800" },
  textoConfirmacion: { color: "#7e22ce", fontSize: 11, fontWeight: "800" },
  textoEntregado: { color: "#15803d", fontSize: 11, fontWeight: "800" },
  textoOtro: { color: "#4b5563", fontSize: 11, fontWeight: "800" },

  accionesCelda: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 7,
  },
  botonIcono: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 9,
  },
  botonDetalle: {
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },
  botonAsignar: {
    borderColor: "#ddd6fe",
    backgroundColor: "#f5f3ff",
  },
  botonAsignacion: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },

  vacio: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
  },
  vacioTexto: { marginTop: 10, color: "#858b92" },

  modalFondo: {
    flex: 1,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.48)",
  },
  modal: {
    width: "100%",
    maxWidth: 650,
    maxHeight: "92%",
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  modalAmplio: { maxWidth: 860 },

  modalHead: {
    padding: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderBottomWidth: 1,
    borderBottomColor: "#eceef0",
  },
  modalTitulo: {
    color: "#25282c",
    fontSize: 19,
    fontWeight: "900",
  },
  cerrar: {
    width: 37,
    height: 37,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    backgroundColor: "#f1f3f4",
  },
  modalBody: { padding: 17 },

  detalleGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  datoCard: {
    minWidth: 190,
    flex: 1,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f7f8f9",
  },
  datoEtiqueta: {
    color: "#81878e",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  datoValor: {
    marginTop: 4,
    color: "#2d3237",
    fontSize: 13,
    fontWeight: "800",
  },

  seccionTitulo: {
    marginTop: 18,
    marginBottom: 10,
    color: "#2d3237",
    fontSize: 15,
    fontWeight: "900",
  },

  productoCard: {
    padding: 12,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 11,
    backgroundColor: "#ffffff",
  },
  productoInfo: { flex: 1 },
  productoNombre: {
    color: "#25282c",
    fontSize: 13,
    fontWeight: "800",
  },
  productoSecundario: {
    marginTop: 3,
    color: "#858b92",
    fontSize: 11,
  },
  productoSubtotal: {
    color: "#1f2329",
    fontSize: 13,
    fontWeight: "900",
  },

  asignacionInfo: { flex: 1 },
  asignacionNombre: {
    color: "#25282c",
    fontSize: 13,
    fontWeight: "900",
  },
  asignacionSecundario: {
    marginTop: 3,
    color: "#858b92",
    fontSize: 11,
  },

  selectorAsignacionCard: {
    padding: 13,
    marginBottom: 9,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#e4e7ea",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  selectorAsignacionSeleccionada: {
    borderColor: "#b82018",
    backgroundColor: "#fff7f7",
  },
  radio: {
    width: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#c5cbd1",
    borderRadius: 10,
  },
  radioSeleccionado: { borderColor: "#b82018" },
  radioPunto: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#b82018",
  },

  modalAcciones: {
    padding: 15,
    flexDirection: "row",
    gap: 10,
    borderTopWidth: 1,
    borderTopColor: "#eceef0",
  },
  botonModal: {
    minHeight: 45,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
  botonCancelar: {
    borderWidth: 1,
    borderColor: "#d9dee3",
    backgroundColor: "#ffffff",
  },
  botonConfirmar: { backgroundColor: "#b82018" },
  cancelarTexto: { color: "#555c64", fontWeight: "800" },
  confirmarTexto: { color: "#ffffff", fontWeight: "900" },

  mensajeModal: {
    width: "100%",
    maxWidth: 430,
    padding: 24,
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },
  mensajeTitulo: {
    marginTop: 10,
    color: "#2d3237",
    fontSize: 18,
    fontWeight: "900",
  },
  mensajeTexto: {
    marginTop: 7,
    color: "#747b83",
    lineHeight: 19,
    textAlign: "center",
  },

  botonFecha: {
    minWidth: 145,
    minHeight: 42,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 9,
    backgroundColor: "#ffffff",
  },
  botonFechaTexto: {
    color: "#343a40",
    fontSize: 12,
    fontWeight: "700",
  },

  calendarioModal: {
    width: "100%",
    maxWidth: 390,
    padding: 18,
    borderRadius: 16,
    backgroundColor: "#ffffff",
  },
  calendarioCabecera: {
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  calendarioTitulo: {
    flex: 1,
    color: "#1f2329",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
    textTransform: "capitalize",
  },
  calendarioNavegacion: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e4e7ea",
    borderRadius: 10,
    backgroundColor: "#f8f9fa",
  },
  calendarioSemana: {
    flexDirection: "row",
    marginBottom: 5,
  },
  calendarioDiaSemana: {
    width: "14.285714%",
    height: 32,
    color: "#858c94",
    fontSize: 11,
    fontWeight: "900",
    textAlign: "center",
    lineHeight: 32,
  },
  calendarioGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  calendarioDiaCaja: {
    width: "14.285714%",
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  calendarioDia: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
  },
  calendarioDiaSeleccionado: {
    backgroundColor: "#b82018",
  },
  calendarioDiaTexto: {
    color: "#343a40",
    fontSize: 12,
    fontWeight: "700",
  },
  calendarioDiaTextoSeleccionado: {
    color: "#ffffff",
    fontWeight: "900",
  },

  botonEditar: {
    borderColor: "#99f6e4",
    backgroundColor: "#f0fdfa",
  },

  iconoVehiculoModal: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#1f2329",
  },

  personalVehiculo: {
    marginTop: 7,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  personalVehiculoTexto: {
    flex: 1,
    color: "#555f69",
    fontSize: 11,
    fontWeight: "700",
  },

  contadorPersonal: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
  },

  contadorPersonalTexto: {
    color: "#4b5563",
    fontSize: 10,
    fontWeight: "800",
  },

  botonEditarPedido: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },

  bannerMotivoEdicion: {
    padding: 14,
    borderRadius: 12,
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    marginVertical: 12,
  },

  bannerMotivoEdicionHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 4,
  },

  bannerMotivoEdicionTitulo: {
    fontSize: 13,
    fontWeight: "800",
    color: "#b45309",
  },

  bannerMotivoEdicionTexto: {
    fontSize: 13,
    color: "#92400e",
    lineHeight: 18,
    fontWeight: "500",
  },

  itemEdicionProducto: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    marginBottom: 8,
    gap: 12,
  },

  controlCantidad: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  botonCantidad: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f3f4f6",
  },

  cantidadTexto: {
    fontSize: 15,
    fontWeight: "800",
    color: "#1f2329",
    minWidth: 24,
    textAlign: "center",
  },

  campoLabel: {
    fontSize: 13,
    fontWeight: "700",
    color: "#374151",
    marginBottom: 6,
  },

  inputObservacion: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: "#1f2329",
    backgroundColor: "#f9fafb",
  },

  inputMotivoEdicion: {
    borderWidth: 1.5,
    borderColor: "#f59e0b",
    borderRadius: 10,
    padding: 12,
    fontSize: 13,
    color: "#1f2329",
    backgroundColor: "#fffbeb",
    minHeight: 70,
    textAlignVertical: "top",
  },

  resumenTotalEdicion: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    marginTop: 10,
  },

  totalEdicionTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: "#4b5563",
  },

  totalEdicionValor: {
    fontSize: 18,
    fontWeight: "900",
    color: "#b82018",
  },
});
