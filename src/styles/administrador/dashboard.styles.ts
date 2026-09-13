import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: "#f4f5f7",
  },

  contenido: {
    padding: 24,
    paddingBottom: 60,
  },

  encabezado: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    flexWrap: "wrap",
    marginBottom: 8,
  },

  titulo: {
    color: "#1f2329",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: -0.3,
  },

  subtitulo: {
    marginTop: 4,
    color: "#7b828a",
    fontSize: 13,
  },

  filtrosPeriodo: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    flexWrap: "wrap",
  },

  grupoFiltro: {
    minWidth: 140,
  },

  filtroEtiqueta: {
    marginBottom: 5,
    color: "#606770",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  selectorCaja: {
    minHeight: 42,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#dce0e4",
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  selector: {
    minHeight: 42,
    minWidth: 140,
    color: "#1f2329",
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
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },

  botonActualizarTexto: {
    color: "#1f2329",
    fontSize: 12,
    fontWeight: "800",
  },

  kpis: {
    marginTop: 18,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
  },

  kpiCard: {
    minWidth: 220,
    flex: 1,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e3e6e9",
    borderRadius: 16,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  kpiTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },

  kpiIcono: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    backgroundColor: "#fce9e7",
  },

  kpiEtiqueta: {
    color: "#7b828a",
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },

  kpiValor: {
    marginTop: 12,
    color: "#1f2329",
    fontSize: 24,
    fontWeight: "900",
  },

  kpiAyuda: {
    marginTop: 6,
    color: "#858c94",
    fontSize: 11,
  },

  variacionPositiva: {
    color: "#15803d",
    fontWeight: "900",
  },

  variacionNegativa: {
    color: "#b82018",
    fontWeight: "900",
  },

  // ============================================
  // SECCIÓN CIERRES DE CAJA EN DASHBOARD
  // ============================================
  seccionCajas: {
    marginTop: 24,
    backgroundColor: "#ffffff",
    borderRadius: 18,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e3e6e9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },

  seccionCajasHead: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
    flexWrap: "wrap",
    gap: 10,
  },

  seccionCajasTituloRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },

  seccionCajasIcono: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "#fce9e7",
    alignItems: "center",
    justifyContent: "center",
  },

  seccionCajasTitulo: {
    color: "#1f2329",
    fontSize: 18,
    fontWeight: "900",
  },

  seccionCajasSubtitulo: {
    color: "#7b828a",
    fontSize: 12,
    marginTop: 2,
  },

  botonIrCierres: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#b82018",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 12,
  },

  botonIrCierresTexto: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "800",
  },

  cajasGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },

  cajaMiniCard: {
    flex: 1,
    minWidth: 165,
    backgroundColor: "#f8f9fb",
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: "#edf0f3",
  },

  cajaMiniEtiqueta: {
    fontSize: 11,
    fontWeight: "800",
    color: "#7b828a",
    textTransform: "uppercase",
  },

  cajaMiniValor: {
    fontSize: 18,
    fontWeight: "900",
    color: "#1f2329",
    marginTop: 6,
  },

  cajaMiniDetalle: {
    fontSize: 11,
    color: "#8a9199",
    marginTop: 3,
  },

  // ============================================
  // GRÁFICOS Y PANELES
  // ============================================
  filaPrincipal: {
    marginTop: 24,
    flexDirection: "row",
    alignItems: "stretch",
    gap: 16,
    flexWrap: "wrap",
  },

  panelGrande: {
    flex: 2,
    minWidth: 580,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e3e6e9",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  panelMedio: {
    flex: 1,
    minWidth: 300,
    padding: 20,
    borderWidth: 1,
    borderColor: "#e3e6e9",
    borderRadius: 18,
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },

  panelTitulo: {
    color: "#25282c",
    fontSize: 16,
    fontWeight: "900",
  },

  panelSubtitulo: {
    marginTop: 4,
    color: "#8a9199",
    fontSize: 12,
  },

  graficoColumnas: {
    marginTop: 20,
    minHeight: 250,
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 8,
    paddingBottom: 4,
  },

  columnaMes: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    minWidth: 32,
  },

  valorColumna: {
    marginBottom: 7,
    color: "#50565d",
    fontSize: 9,
    fontWeight: "800",
  },

  barraFondo: {
    width: "68%",
    height: 180,
    justifyContent: "flex-end",
    borderRadius: 9,
    backgroundColor: "#f0f2f4",
    overflow: "hidden",
  },

  barraIngreso: {
    width: "100%",
    borderRadius: 9,
    backgroundColor: "#b82018",
    minHeight: 4,
  },

  etiquetaMes: {
    marginTop: 8,
    color: "#737a82",
    fontSize: 10,
    fontWeight: "800",
  },

  progresoContenedor: {
    marginTop: 18,
  },

  progresoCabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  progresoEtiqueta: {
    color: "#50565d",
    fontSize: 12,
    fontWeight: "800",
  },

  progresoValor: {
    color: "#1f2329",
    fontSize: 12,
    fontWeight: "900",
  },

  progresoFondo: {
    marginTop: 7,
    height: 9,
    overflow: "hidden",
    borderRadius: 10,
    backgroundColor: "#eceef0",
  },

  progresoBarra: {
    height: "100%",
    borderRadius: 10,
    backgroundColor: "#1f2329",
  },

  porcentajeGrande: {
    marginTop: 18,
    color: "#b82018",
    fontSize: 34,
    fontWeight: "900",
  },

  filaSecundaria: {
    marginTop: 18,
    flexDirection: "row",
    gap: 16,
    flexWrap: "wrap",
  },

  listaItem: {
    paddingVertical: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eef0f2",
  },

  listaIcono: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 11,
    backgroundColor: "#f4f5f7",
  },

  listaInfo: {
    flex: 1,
  },

  listaTitulo: {
    color: "#2a2f34",
    fontSize: 13,
    fontWeight: "800",
  },

  listaSubtitulo: {
    marginTop: 3,
    color: "#858c94",
    fontSize: 11,
  },

  listaValor: {
    color: "#1f2329",
    fontSize: 13,
    fontWeight: "900",
  },

  estadoBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 18,
    backgroundColor: "#f3f4f6",
  },

  estadoBadgeTexto: {
    color: "#4b5563",
    fontSize: 10,
    fontWeight: "800",
  },

  stockBajo: {
    color: "#b82018",
    fontWeight: "900",
  },

  stockCritico: {
    color: "#991b1b",
    fontWeight: "900",
  },

  estadoCentro: {
    minHeight: 320,
    alignItems: "center",
    justifyContent: "center",
  },

  estadoTexto: {
    marginTop: 12,
    color: "#858c94",
    fontSize: 13,
    fontWeight: "600",
  },

  errorCaja: {
    marginTop: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 14,
    backgroundColor: "#fff1f2",
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  errorTexto: {
    color: "#b82018",
    fontSize: 13,
    fontWeight: "700",
    flex: 1,
  },

  graficoLeyenda: {
    marginTop: 14,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },

  leyendaChip: {
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#f4f5f7",
  },

  leyendaTexto: {
    color: "#606770",
    fontSize: 10,
    fontWeight: "700",
  },
});