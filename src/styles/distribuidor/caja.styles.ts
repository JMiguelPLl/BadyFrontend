import { StyleSheet } from "react-native";

export const CAJA_ROJO = "#c8231b";

export const cajaStyles = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: "#f5f6f8",
  },

  contenido: {
    paddingBottom: 110,
  },

  header: {
    paddingTop: 20,
    paddingHorizontal: 20,
    paddingBottom: 30,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    backgroundColor: CAJA_ROJO,
  },

  headerFila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  headerEtiqueta: {
    color: "rgba(255,255,255,.82)",
    fontSize: 12,
    fontWeight: "600",
  },

  headerTitulo: {
    marginTop: 4,
    color: "#fff",
    fontSize: 24,
    fontWeight: "900",
  },

  headerIcono: {
    width: 46,
    height: 46,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 23,
    backgroundColor: "rgba(255,255,255,.17)",
  },

  cuerpo: {
    paddingHorizontal: 18,
  },

  card: {
    marginTop: 16,
    padding: 17,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#eceef1",
    backgroundColor: "#fff",
  },

  cardPrincipal: {
    marginTop: -12,
    shadowColor: "#000",
    shadowOpacity: 0.07,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
  },

  filaEntre: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
  },

  tituloCard: {
    color: "#242a31",
    fontSize: 17,
    fontWeight: "900",
  },

  textoSuave: {
    marginTop: 4,
    color: "#7a8189",
    fontSize: 12,
    lineHeight: 18,
  },

  badge: {
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: 99,
  },

  badgeAbierta: {
    backgroundColor: "#e9f8ef",
  },

  badgeCerrada: {
    backgroundColor: "#eef2f6",
  },

  badgeTextoAbierta: {
    color: "#15803d",
    fontSize: 11,
    fontWeight: "900",
  },

  badgeTextoCerrada: {
    color: "#5b6470",
    fontSize: 11,
    fontWeight: "900",
  },

  total: {
    marginTop: 17,
    color: CAJA_ROJO,
    fontSize: 32,
    fontWeight: "900",
  },

  totalLabel: {
    marginTop: 2,
    color: "#8a9199",
    fontSize: 11,
    fontWeight: "700",
  },

  resumenFila: {
    marginTop: 15,
    flexDirection: "row",
    gap: 10,
  },

  miniCard: {
    flex: 1,
    padding: 13,
    borderRadius: 15,
    backgroundColor: "#f7f8fa",
  },

  miniValor: {
    marginTop: 7,
    color: "#2e343b",
    fontSize: 16,
    fontWeight: "900",
  },

  miniTexto: {
    marginTop: 3,
    color: "#8a9199",
    fontSize: 10,
    fontWeight: "700",
  },

  seccionFila: {
    marginTop: 24,
    marginBottom: 11,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  seccionTitulo: {
    color: "#292f36",
    fontSize: 17,
    fontWeight: "900",
  },

  contador: {
    color: CAJA_ROJO,
    fontSize: 12,
    fontWeight: "800",
  },

  pagoCard: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eceef1",
    backgroundColor: "#fff",
  },

  pagoFila: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },

  pagoPedido: {
    color: "#343a40",
    fontSize: 13,
    fontWeight: "900",
  },

  pagoMonto: {
    color: CAJA_ROJO,
    fontSize: 15,
    fontWeight: "900",
  },

  pagoCliente: {
    marginTop: 5,
    color: "#555d66",
    fontSize: 12,
    fontWeight: "700",
  },

  pagoMeta: {
    marginTop: 4,
    color: "#8a9199",
    fontSize: 11,
  },

  botonPrincipal: {
    height: 52,
    marginTop: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 14,
    backgroundColor: CAJA_ROJO,
  },

  botonPrincipalTexto: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },

  botonSecundario: {
    height: 48,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e8c4c1",
    borderRadius: 14,
    backgroundColor: "#fff",
  },

  botonSecundarioTexto: {
    color: CAJA_ROJO,
    fontSize: 12,
    fontWeight: "800",
  },

  vacio: {
    alignItems: "center",
    paddingVertical: 34,
  },

  vacioTitulo: {
    marginTop: 9,
    color: "#4a5159",
    fontSize: 14,
    fontWeight: "800",
  },

  vacioTexto: {
    marginTop: 4,
    color: "#8a9199",
    fontSize: 12,
    textAlign: "center",
  },

  error: {
    marginTop: 15,
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#fff0ef",
  },

  errorTexto: {
    color: "#a51d16",
    fontSize: 12,
    textAlign: "center",
  },

  historialCard: {
    marginBottom: 10,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#eceef1",
    backgroundColor: "#fff",
  },

  historialFecha: {
    color: "#343a40",
    fontSize: 13,
    fontWeight: "800",
  },

  historialMonto: {
    color: "#242a31",
    fontSize: 15,
    fontWeight: "900",
  },

  historialMeta: {
    marginTop: 4,
    color: "#8a9199",
    fontSize: 11,
  },

  modalFondo: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,.46)",
  },

  modal: {
    maxHeight: "90%",
    padding: 20,
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    backgroundColor: "#fff",
  },

  modalHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 14,
  },

  modalTitulo: {
    color: "#242a31",
    fontSize: 19,
    fontWeight: "900",
  },

  modalTexto: {
    color: "#737b84",
    fontSize: 12,
    lineHeight: 18,
  },

  label: {
    marginTop: 15,
    color: "#555d66",
    fontSize: 11,
    fontWeight: "800",
  },

  input: {
    minHeight: 82,
    marginTop: 7,
    padding: 12,
    borderWidth: 1,
    borderColor: "#dfe3e8",
    borderRadius: 13,
    backgroundColor: "#fff",
    color: "#30363d",
    textAlignVertical: "top",
  },

  resumenModal: {
    marginTop: 17,
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#f7f8fa",
  },

  resumenModalFila: {
    minHeight: 36,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  resumenModalLabel: {
    color: "#7d858e",
    fontSize: 12,
  },

  resumenModalValor: {
    color: "#2f353c",
    fontSize: 13,
    fontWeight: "800",
  },

  resumenModalTotal: {
    color: CAJA_ROJO,
    fontSize: 17,
    fontWeight: "900",
  },

  accionesModal: {
    marginTop: 18,
    flexDirection: "row",
    gap: 10,
  },

  botonModal: {
    flex: 1,
    height: 49,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },

  cancelar: {
    borderWidth: 1,
    borderColor: "#dfe3e8",
    backgroundColor: "#fff",
  },

  confirmar: {
    backgroundColor: CAJA_ROJO,
  },

  cancelarTexto: {
    color: "#626a73",
    fontSize: 12,
    fontWeight: "800",
  },

  confirmarTexto: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "900",
  },
});
