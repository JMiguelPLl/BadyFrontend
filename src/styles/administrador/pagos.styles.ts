import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },

  contenido: {
    padding: 24,
  },

  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },

  titulo: {
    color: "#1f2329",
    fontSize: 29,
    fontWeight: "900",
  },

  subtitulo: {
    marginTop: 5,
    color: "#7b828a",
    fontSize: 14,
  },

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

  resumenValor: {
    color: "#1f2329",
    fontSize: 22,
    fontWeight: "900",
  },

  resumenTexto: {
    marginTop: 3,
    color: "#7e858d",
    fontSize: 12,
  },

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

  grupoFiltro: {
    minWidth: 145,
  },

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
    justifyContent: "center",
  },

  selector: {
    minHeight: 42,
    minWidth: 145,
    color: "#1f2329",
    borderWidth: 0,
    backgroundColor: "transparent",
    outlineStyle: "none",
  } as any,

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
    color: "#1f2329",
    fontSize: 12,
    fontWeight: "700",
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

  tabla: {
    width: "100%",
  },

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
    paddingHorizontal: 5,
    color: "#5e6670",
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  celda: {
    paddingHorizontal: 5,
    color: "#4f565e",
    fontSize: 12,
  },

  colId: { width: 45 },
  colCliente: { flex: 2, minWidth: 120 },
  colSucursal: { flex: 1.6, minWidth: 100 },
  colFecha: { flex: 1.3, minWidth: 95 },
  colTotal: { flex: 1, minWidth: 80 },
  colPagado: { flex: 1, minWidth: 80 },
  colSaldo: { flex: 1, minWidth: 80 },
  colEstado: { flex: 1, minWidth: 80 },
  colAcciones: { width: 125, alignItems: "flex-end" },

  clienteCelda: {
    paddingHorizontal: 5,
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

  avatarTexto: {
    color: "#ffffff",
    fontWeight: "900",
  },

  clienteInfo: {
    flex: 1,
  },

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

  badgePendiente: {
    backgroundColor: "#fff7ed",
  },

  badgePagado: {
    backgroundColor: "#ecfdf3",
  },

  textoPendiente: {
    color: "#c2410c",
    fontSize: 11,
    fontWeight: "800",
  },

  textoPagado: {
    color: "#15803d",
    fontSize: 11,
    fontWeight: "800",
  },

  saldoPagadoTexto: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "900",
  },

  saldoPendienteTexto: {
    color: "#b82018",
    fontSize: 12,
    fontWeight: "900",
  },

  accionesCelda: {
    paddingHorizontal: 8,
    flexDirection: "row",
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

  botonHistorial: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },

  botonPago: {
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
  },

  botonEditar: {
    borderColor: "#ddd6fe",
    backgroundColor: "#f5f3ff",
  },

  botonAnular: {
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
  },

  vacio: {
    minHeight: 260,
    alignItems: "center",
    justifyContent: "center",
  },

  vacioTexto: {
    marginTop: 10,
    color: "#858b92",
  },

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

  modalAmplio: {
    maxWidth: 920,
  },

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

  modalBody: {
    padding: 17,
  },

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

  productoInfo: {
    flex: 1,
  },

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

  entregaCard: {
    padding: 14,
    borderWidth: 1,
    borderColor: "#e4e7ea",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  entregaTitulo: {
    color: "#25282c",
    fontSize: 14,
    fontWeight: "900",
  },

  entregaTexto: {
    marginTop: 5,
    color: "#6f7780",
    fontSize: 12,
  },

  personalChipWrap: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  personalChip: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
  },

  personalChipTexto: {
    color: "#4b5563",
    fontSize: 11,
    fontWeight: "700",
  },

  pagoCard: {
    padding: 13,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#e4e7ea",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  pagoIcono: {
    width: 42,
    height: 42,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#f0fdf4",
  },

  pagoInfo: {
    flex: 1,
  },

  pagoUsuario: {
    color: "#25282c",
    fontSize: 13,
    fontWeight: "900",
  },

  pagoSecundario: {
    marginTop: 3,
    color: "#858b92",
    fontSize: 11,
  },

  pagoMonto: {
    color: "#15803d",
    fontSize: 14,
    fontWeight: "900",
  },

  resumenSaldo: {
    marginTop: 14,
    padding: 15,
    borderRadius: 12,
    backgroundColor: "#f7f8f9",
  },

  resumenSaldoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },

  resumenSaldoEtiqueta: {
    color: "#747b83",
    fontSize: 12,
    fontWeight: "700",
  },

  resumenSaldoValor: {
    color: "#25282c",
    fontSize: 13,
    fontWeight: "900",
  },

  saldoCeroGrande: {
    marginTop: 8,
    color: "#15803d",
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center",
  },

  formulario: {
    gap: 15,
  },

  campo: {
    width: "100%",
  },

  etiqueta: {
    marginBottom: 7,
    color: "#343a40",
    fontSize: 12,
    fontWeight: "800",
  },

  input: {
    minHeight: 45,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 9,
    color: "#1f2329",
    backgroundColor: "#ffffff",
    outlineStyle: "none",
  } as any,

  ayuda: {
    marginTop: 5,
    color: "#858b92",
    fontSize: 11,
  },

  saldoPagoCaja: {
    padding: 14,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: "#fff7ed",
  },

  saldoPagoEtiqueta: {
    color: "#9a3412",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  saldoPagoMonto: {
    marginTop: 4,
    color: "#c2410c",
    fontSize: 22,
    fontWeight: "900",
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

  botonConfirmar: {
    backgroundColor: "#b82018",
  },

  cancelarTexto: {
    color: "#555c64",
    fontWeight: "800",
  },

  confirmarTexto: {
    color: "#ffffff",
    fontWeight: "900",
  },

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
});