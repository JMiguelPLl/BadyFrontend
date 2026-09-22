import { Platform, StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  pagina: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },
  contenidoPagina: {
    padding: 20,
    paddingBottom: 60,
  },

  // Encabezado Principal
  encabezado: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 16,
    marginBottom: 20,
  },
  bloqueTitulos: {
    flex: 1,
    minWidth: 280,
  },
  titulo: {
    fontSize: 26,
    fontWeight: "900",
    color: "#0f172a",
    letterSpacing: -0.5,
  },
  subtitulo: {
    fontSize: 13,
    color: "#64748b",
    marginTop: 4,
    lineHeight: 18,
  },
  accionesEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },

  // Botones de acción principales
  botonPrimario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#c8231b",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
      default: {},
    }),
  },
  botonPrimarioTexto: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  botonExcel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#107c41",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
      default: {},
    }),
  },
  botonExcelTexto: {
    color: "#ffffff",
    fontSize: 13,
    fontWeight: "800",
  },
  botonSecundario: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
      default: {},
    }),
  },
  botonSecundarioTexto: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "700",
  },

  // Barra de pestañas principales (HU-47, HU-48, HU-49)
  pestanasContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#e2e8f0",
    padding: 6,
    borderRadius: 16,
    marginBottom: 20,
    flexWrap: "wrap",
  },
  pestanaBoton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
      default: {},
    }),
  },
  pestanaBotonActivo: {
    backgroundColor: "#ffffff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  pestanaTexto: {
    fontSize: 13,
    fontWeight: "700",
    color: "#64748b",
  },
  pestanaTextoActivo: {
    color: "#c8231b",
    fontWeight: "800",
  },

  // Barra de Filtros y Rango de Fechas
  tarjetaFiltros: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  filaFiltros: {
    flexDirection: "row",
    alignItems: "flex-end",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 12,
  },
  grupoFiltro: {
    minWidth: 140,
    flex: 1,
  },
  etiquetaFiltro: {
    fontSize: 11,
    fontWeight: "800",
    color: "#475569",
    textTransform: "uppercase",
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  inputFecha: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: "#0f172a",
    minHeight: 40,
  },
  pickerContainer: {
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    overflow: "hidden",
    minHeight: 40,
  },
  picker: {
    minHeight: 40,
    color: "#0f172a",
  },

  // Chips de Presets de Fecha
  chipsContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flexWrap: "wrap",
    marginTop: 4,
  },
  chipPreset: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
      default: {},
    }),
  },
  chipPresetActivo: {
    backgroundColor: "rgba(200, 35, 27, 0.12)",
    borderColor: "rgba(200, 35, 27, 0.3)",
  },
  chipPresetTexto: {
    fontSize: 11,
    fontWeight: "700",
    color: "#64748b",
  },
  chipPresetTextoActivo: {
    color: "#c8231b",
    fontWeight: "800",
  },

  // Grid de Tarjetas KPI
  kpiGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 14,
    marginBottom: 20,
  },
  kpiCard: {
    flex: 1,
    minWidth: 200,
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  kpiCabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  kpiIconoContenedor: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  kpiTitulo: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.4,
  },
  kpiValor: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0f172a",
    marginBottom: 4,
  },
  kpiSubtexto: {
    fontSize: 11,
    color: "#94a3b8",
    fontWeight: "600",
  },

  // Sección Gráfica y Analítica
  seccionGrafica: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  graficaTitulo: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 14,
  },
  barrasContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 12,
    minHeight: 140,
    paddingTop: 20,
    paddingBottom: 6,
    overflow: "hidden",
  },
  columnaBarra: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    height: 120,
  },
  barraPilar: {
    width: "70%",
    maxWidth: 36,
    backgroundColor: "#c8231b",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    minHeight: 4,
  },
  barraMonto: {
    fontSize: 10,
    fontWeight: "700",
    color: "#475569",
    marginBottom: 4,
  },
  barraEtiqueta: {
    fontSize: 10,
    color: "#94a3b8",
    marginTop: 6,
    fontWeight: "600",
  },

  // Barras de progreso de distribución
  barraProgresoContainer: {
    height: 8,
    backgroundColor: "#f1f5f9",
    borderRadius: 6,
    overflow: "hidden",
    marginVertical: 8,
  },
  barraProgresoFill: {
    height: "100%",
    borderRadius: 6,
  },

  // Sub-pestañas para Cobranzas
  subPestanasContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 16,
    flexWrap: "wrap",
  },
  subPestanaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: "#f1f5f9",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    ...Platform.select({
      web: { cursor: "pointer", userSelect: "none" },
      default: {},
    }),
  },
  subPestanaItemActivo: {
    backgroundColor: "#0f172a",
    borderColor: "#0f172a",
  },
  subPestanaTexto: {
    fontSize: 12,
    fontWeight: "700",
    color: "#64748b",
  },
  subPestanaTextoActivo: {
    color: "#ffffff",
  },

  // Tarjeta de Tabla y Resultados
  tarjetaTabla: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  tablaEncabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 14,
  },
  tablaTitulo: {
    fontSize: 16,
    fontWeight: "800",
    color: "#0f172a",
  },
  buscadorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    borderWidth: 1,
    borderColor: "#cbd5e1",
    borderRadius: 10,
    paddingHorizontal: 10,
    minWidth: 220,
    height: 38,
    gap: 6,
  },
  buscadorInput: {
    flex: 1,
    fontSize: 12,
    color: "#0f172a",
    height: 36,
  },

  // Filas y Celdas de Tabla
  filaTablaHeader: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#e2e8f0",
  },
  celdaHeaderTexto: {
    fontSize: 11,
    fontWeight: "800",
    color: "#64748b",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  filaTabla: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f5f9",
  },
  celdaTexto: {
    fontSize: 12,
    color: "#334155",
    fontWeight: "500",
  },
  celdaTextoBold: {
    fontSize: 12,
    color: "#0f172a",
    fontWeight: "700",
  },

  // Badges y Semáforos
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: "800",
  },

  // Semáforo de Producción / Stock
  semaforoPildora: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  semaforoTexto: {
    fontSize: 11,
    fontWeight: "800",
  },

  // Paginación o estado vacío
  estadoVacio: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 40,
    gap: 8,
  },
  estadoVacioTexto: {
    fontSize: 14,
    fontWeight: "700",
    color: "#64748b",
  },
  estadoVacioSubtexto: {
    fontSize: 12,
    color: "#94a3b8",
    textAlign: "center",
    maxWidth: 320,
  },

  // Estilos de Reporte de Métodos de Pago (Efectivo vs QR)
  barraComparativaContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 18,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  barraComparativaTitulo: {
    fontSize: 14,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 10,
  },
  barraComparativaTrack: {
    height: 18,
    borderRadius: 9,
    backgroundColor: "#e2e8f0",
    flexDirection: "row",
    overflow: "hidden",
  },
  segmentoEfectivo: {
    height: "100%",
    backgroundColor: "#16a34a",
  },
  segmentoQR: {
    height: "100%",
    backgroundColor: "#2563eb",
  },
  leyendaComparativa: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 10,
    flexWrap: "wrap",
    gap: 12,
  },
  itemLeyenda: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  indicadorColor: {
    width: 12,
    height: 12,
    borderRadius: 3,
  },
  textoLeyenda: {
    fontSize: 12,
    fontWeight: "700",
    color: "#334155",
  },
  badgeMetodoEfectivo: {
    backgroundColor: "#ecfdf3",
    borderColor: "#bbf7d0",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeMetodoTextoEfectivo: {
    color: "#16a34a",
    fontSize: 11,
    fontWeight: "800",
  },
  badgeMetodoQR: {
    backgroundColor: "#eff6ff",
    borderColor: "#bfdbfe",
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: "flex-start",
  },
  badgeMetodoTextoQR: {
    color: "#2563eb",
    fontSize: 11,
    fontWeight: "800",
  },
});
