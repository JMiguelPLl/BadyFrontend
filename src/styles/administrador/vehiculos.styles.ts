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

  botonRojo: {
    minHeight: 44,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 7,
    borderRadius: 10,
    backgroundColor: "#b82018",
  },

  botonRojoTexto: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },

  tabs: {
    marginTop: 20,
    padding: 5,
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 5,
    borderWidth: 1,
    borderColor: "#e2e5e9",
    borderRadius: 11,
    backgroundColor: "#ffffff",
  },

  tab: {
    minHeight: 40,
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    borderRadius: 8,
  },

  tabActivo: {
    backgroundColor: "#fff0ef",
  },

  tabTexto: {
    color: "#68707a",
    fontSize: 13,
    fontWeight: "700",
  },

  tabTextoActivo: {
    color: "#b82018",
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

  tablaCard: {
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
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e8eaec",
  },

  buscador: {
    flex: 1,
    maxWidth: 520,
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

  botonSecundario: {
    minHeight: 42,
    paddingHorizontal: 13,
    flexDirection: "row",
    alignItems: "center",
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

  tabla: {
    width: "100%",
  },

  filaHead: {
    minHeight: 49,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f6f8",
    width: "100%",
  },

  fila: {
    minHeight: 68,
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

  id: { width: 50 },
  marca: { flex: 2.2, minWidth: 140 },
  placa: { flex: 1.1, minWidth: 95 },
  carga: { flex: 1.1, minWidth: 95 },
  usuarios: { flex: 0.9, minWidth: 75 },
  usuario: { flex: 2, minWidth: 140 },
  vehiculo: { flex: 1.8, minWidth: 130 },
  fecha: { flex: 1.1, minWidth: 95 },
  estado: { flex: 1, minWidth: 85 },
  acciones: { width: 175, alignItems: "flex-end" },

  marcaCelda: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  iconoAuto: {
    width: 36,
    height: 36,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 9,
    backgroundColor: "#1f2329",
  },

  marcaTexto: {
    flex: 1,
    color: "#24292f",
    fontWeight: "800",
  },

  usuarioCelda: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },

  avatar: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 18,
    backgroundColor: "#1f2329",
  },

  avatarTexto: {
    color: "#ffffff",
    fontWeight: "900",
  },

  usuarioInfo: {
    flex: 1,
  },

  usuarioNombre: {
    color: "#24292f",
    fontSize: 12,
    fontWeight: "800",
  },

  usuarioCorreo: {
    marginTop: 2,
    color: "#8a9199",
    fontSize: 10,
  },

  estadoBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 18,
  },

  activo: {
    backgroundColor: "#ecfdf3",
  },

  inactivo: {
    backgroundColor: "#fff0ef",
  },

  estadoActivoTexto: {
    color: "#15803d",
    fontSize: 11,
    fontWeight: "800",
  },

  estadoInactivoTexto: {
    color: "#b82018",
    fontSize: 11,
    fontWeight: "800",
  },

  accionesCelda: {
    paddingHorizontal: 6,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 7,
  },

  botonIcono: {
    width: 35,
    height: 35,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderRadius: 9,
  },

  editar: {
    borderColor: "#bfdbfe",
    backgroundColor: "#eff6ff",
  },

  eliminar: {
    borderColor: "#fecaca",
    backgroundColor: "#fff1f2",
  },

  activar: {
    borderColor: "#bbf7d0",
    backgroundColor: "#f0fdf4",
  },

  asignar: {
    borderColor: "#ddd6fe",
    backgroundColor: "#f5f3ff",
  },

  detalle: {
    borderColor: "#fde68a",
    backgroundColor: "#fffbeb",
  },

  vacio: {
    minHeight: 240,
    alignItems: "center",
    justifyContent: "center",
  },

  vacioTexto: {
    marginTop: 9,
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
    maxWidth: 560,
    maxHeight: "92%",
    overflow: "hidden",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },

  modalAmplio: {
    maxWidth: 760,
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

  campo: {
    marginBottom: 15,
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
    outlineStyle: "none",
  } as any,

  selectorCaja: {
    minHeight: 45,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 9,
  },

  selector: {
    width: "100%",
    minHeight: 45,
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

  detalleVehiculoCabecera: {
    padding: 14,
    marginBottom: 14,
    borderRadius: 12,
    backgroundColor: "#f7f8f9",
  },

  detalleVehiculoTitulo: {
    color: "#25282c",
    fontSize: 16,
    fontWeight: "900",
  },

  detalleVehiculoTexto: {
    marginTop: 4,
    color: "#747b83",
    fontSize: 12,
  },

  usuarioAsignadoCard: {
    padding: 13,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 11,
    borderWidth: 1,
    borderColor: "#e4e7ea",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  usuarioAsignadoInfo: {
    flex: 1,
  },

  usuarioAsignadoNombre: {
    color: "#2d3237",
    fontSize: 13,
    fontWeight: "900",
  },

  usuarioAsignadoCorreo: {
    marginTop: 2,
    color: "#858b92",
    fontSize: 11,
  },

  usuarioAsignadoFecha: {
    marginTop: 5,
    color: "#747b83",
    fontSize: 10,
  },

  botonQuitar: {
    minHeight: 36,
    paddingHorizontal: 11,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 9,
    backgroundColor: "#fff1f2",
  },

  botonQuitarTexto: {
    color: "#b82018",
    fontSize: 11,
    fontWeight: "800",
  },

  contadorUsuarios: {
    alignSelf: "flex-start",
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 14,
    backgroundColor: "#f3f4f6",
  },

  contadorUsuariosTexto: {
    color: "#4b5563",
    fontSize: 11,
    fontWeight: "800",
  },
});