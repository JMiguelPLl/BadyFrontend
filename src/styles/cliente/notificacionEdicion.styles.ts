import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 18,
    paddingVertical: 35,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
  },
  modalCard: {
    width: "100%",
    maxHeight: "92%",
    padding: 22,
    alignSelf: "center",
    borderRadius: 24,
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 16,
  },
  iconContainer: {
    width: 68,
    height: 68,
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 34,
    backgroundColor: "#fef3c7",
    marginBottom: 6,
  },
  badgeAviso: {
    alignSelf: "center",
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#fde68a",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: 8,
  },
  badgeAvisoTexto: {
    fontSize: 11,
    fontWeight: "800",
    color: "#b45309",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  title: {
    color: "#1f2329",
    fontSize: 22,
    fontWeight: "900",
    textAlign: "center",
  },
  description: {
    marginTop: 6,
    color: "#6b7280",
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
  },

  // Caja de motivo
  motivoCard: {
    marginTop: 18,
    padding: 16,
    borderRadius: 16,
    backgroundColor: "#fffbeb",
    borderWidth: 1.5,
    borderColor: "#fde68a",
  },
  motivoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  motivoLabel: {
    color: "#b45309",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  motivoTexto: {
    color: "#78350f",
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },

  // Resumen del pedido
  summaryCard: {
    marginTop: 14,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  summaryRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  lastSummaryRow: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    color: "#6b7280",
    fontSize: 13,
    fontWeight: "600",
  },
  summaryValue: {
    flexShrink: 1,
    color: "#1f2329",
    fontSize: 13,
    fontWeight: "800",
    textAlign: "right",
  },
  total: {
    color: "#c8231b",
    fontSize: 17,
    fontWeight: "900",
  },

  // Productos
  productsSection: {
    marginTop: 16,
  },
  productsTitle: {
    marginBottom: 6,
    color: "#4b5563",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  productRow: {
    minHeight: 44,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  productName: {
    color: "#1f2329",
    fontSize: 13,
    fontWeight: "700",
  },
  productPrice: {
    color: "#6b7280",
    fontSize: 11,
  },
  productQuantity: {
    color: "#c8231b",
    fontSize: 13,
    fontWeight: "800",
  },

  // Botones
  actions: {
    marginTop: 20,
    gap: 10,
  },
  primaryButton: {
    minHeight: 48,
    borderRadius: 14,
    backgroundColor: "#c8231b",
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
  },
  primaryButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "800",
  },
  secondaryButton: {
    minHeight: 44,
    borderRadius: 12,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryButtonText: {
    color: "#4b5563",
    fontSize: 13,
    fontWeight: "700",
  },
});
