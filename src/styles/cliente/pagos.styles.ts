import { StyleSheet } from "react-native";

export const ROJO = "#c8231b";
export const ROJO_OSCURO = "#971711";
export const ROJO_CLARO = "#fff0ef";
export const VERDE = "#15803d";
export const VERDE_CLARO = "#ecfdf3";
export const GRIS_FONDO = "#f5f6f8";
export const BLANCO = "#ffffff";
export const TEXTO_PRINCIPAL = "#20242a";
export const TEXTO_SECUNDARIO = "#707780";
export const BORDE_TARJETA = "#eceef1";

export const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: GRIS_FONDO,
  },
  safeArea: {
    flex: 1,
    backgroundColor: GRIS_FONDO,
  },
  contenido: {
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 110,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: GRIS_FONDO,
  },
  loadingText: {
    marginTop: 12,
    color: TEXTO_SECUNDARIO,
    fontSize: 14,
    fontWeight: "600",
  },

  // Encabezado
  encabezado: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 18,
    marginTop: 4,
  },
  titulo: {
    color: TEXTO_PRINCIPAL,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: -0.3,
  },
  subtitulo: {
    marginTop: 3,
    color: TEXTO_SECUNDARIO,
    fontSize: 13,
  },

  // Hero Banner Financiero
  heroBanner: {
    backgroundColor: ROJO,
    borderRadius: 22,
    padding: 20,
    marginBottom: 18,
    shadowColor: ROJO_OSCURO,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
    position: "relative",
    overflow: "hidden",
  },
  heroDecorCircle1: {
    position: "absolute",
    top: -60,
    right: -40,
    width: 160,
    height: 160,
    borderRadius: 80,
    backgroundColor: "rgba(255, 255, 255, 0.09)",
  },
  heroDecorCircle2: {
    position: "absolute",
    bottom: -60,
    left: -40,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "rgba(0, 0, 0, 0.07)",
  },
  heroHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  heroIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: "rgba(255, 255, 255, 0.18)",
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: BLANCO,
  },
  heroSubtitle: {
    fontSize: 12,
    color: "rgba(255, 255, 255, 0.85)",
    marginTop: 2,
  },
  statsContainer: {
    flexDirection: "row",
    gap: 10,
    marginTop: 14,
  },
  statBox: {
    flex: 1,
    backgroundColor: ROJO_CLARO,
    borderRadius: 16,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#f5d0cd",
  },
  statValue: {
    color: ROJO,
    fontSize: 18,
    fontWeight: "900",
  },
  statLabel: {
    color: TEXTO_SECUNDARIO,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
    textAlign: "center",
  },

  // Buscador y Filtros
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: BLANCO,
    borderRadius: 16,
    paddingHorizontal: 14,
    height: 50,
    borderWidth: 1,
    borderColor: BORDE_TARJETA,
    marginBottom: 14,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: TEXTO_PRINCIPAL,
  },
  filterContainer: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: BLANCO,
    borderWidth: 1,
    borderColor: BORDE_TARJETA,
  },
  filterChipActive: {
    backgroundColor: ROJO,
    borderColor: ROJO,
  },
  filterChipText: {
    fontSize: 12,
    fontWeight: "700",
    color: TEXTO_SECUNDARIO,
  },
  filterChipTextActive: {
    color: BLANCO,
  },

  // Tarjeta de Deuda / Pedido
  pedidoCard: {
    backgroundColor: BLANCO,
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDE_TARJETA,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  pedidoCabecera: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pedidoNumero: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXTO_PRINCIPAL,
  },
  pedidoSucursal: {
    fontSize: 12,
    color: TEXTO_SECUNDARIO,
    marginTop: 2,
    fontWeight: "600",
  },
  estadoBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  estadoBadgeTexto: {
    fontSize: 11,
    fontWeight: "800",
  },

  // Grilla de 3 Columnas Financieras
  montosGrid: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12,
  },
  montoCard: {
    flex: 1,
    backgroundColor: "#f8f9fb",
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: "#edf0f3",
    alignItems: "center",
  },
  montoEtiqueta: {
    fontSize: 10,
    fontWeight: "700",
    color: "#8a9098",
    textTransform: "uppercase",
    textAlign: "center",
  },
  montoValor: {
    fontSize: 14,
    fontWeight: "900",
    color: TEXTO_PRINCIPAL,
    marginTop: 3,
  },

  // Info del último pago
  pagoInfoFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  pagoInfoTexto: {
    fontSize: 12,
    color: "#858b92",
    fontWeight: "600",
    flex: 1,
  },

  // Botón Acción
  pedidoAccion: {
    marginTop: 12,
    minHeight: 44,
    borderRadius: 14,
    backgroundColor: ROJO_CLARO,
    borderWidth: 1,
    borderColor: "#f2c4c1",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 6,
  },
  pedidoAccionTexto: {
    fontSize: 12,
    fontWeight: "800",
    color: ROJO,
  },

  // Estados Vacíos
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 45,
    paddingHorizontal: 20,
    backgroundColor: BLANCO,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: BORDE_TARJETA,
    marginTop: 10,
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: ROJO_CLARO,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: TEXTO_PRINCIPAL,
    textAlign: "center",
  },
  emptyDescription: {
    color: TEXTO_SECUNDARIO,
    fontSize: 13,
    textAlign: "center",
    marginTop: 6,
    lineHeight: 18,
  },

  // Modal Detalle
  modalBg: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: BLANCO,
    maxHeight: "88%",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 32,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 10,
  },
  modalHandle: {
    width: 42,
    height: 5,
    borderRadius: 3,
    backgroundColor: "#d5d8dc",
    alignSelf: "center",
    marginBottom: 14,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f2f5",
    marginBottom: 14,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: TEXTO_PRINCIPAL,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#f2f4f7",
    alignItems: "center",
    justifyContent: "center",
  },

  // Barra de progreso
  progresoContainer: {
    backgroundColor: "#f8f9fb",
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: BORDE_TARJETA,
  },
  progresoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  progresoTitulo: {
    fontSize: 12,
    fontWeight: "800",
    color: TEXTO_SECUNDARIO,
    textTransform: "uppercase",
  },
  progresoValor: {
    fontSize: 13,
    fontWeight: "900",
    color: VERDE,
  },
  progresoFondo: {
    height: 10,
    backgroundColor: "#e2e6ea",
    borderRadius: 5,
    overflow: "hidden",
  },
  progresoRelleno: {
    height: "100%",
    backgroundColor: VERDE,
    borderRadius: 5,
  },

  // Items de abonos individuales
  abonoCard: {
    backgroundColor: "#f9fafb",
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: BORDE_TARJETA,
  },
  abonoTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  abonoMonto: {
    fontSize: 15,
    fontWeight: "900",
    color: VERDE,
  },
  abonoMetodoBadge: {
    backgroundColor: "#eff6ff",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  abonoMetodoTexto: {
    fontSize: 11,
    fontWeight: "800",
    color: "#1d4ed8",
  },
  abonoFecha: {
    fontSize: 11,
    color: "#8a9098",
    marginTop: 4,
  },
});