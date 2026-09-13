import { StyleSheet } from "react-native";

const ROJO = "#c8231b";
const ROJO_OSCURO = "#971711";

export const styles = StyleSheet.create({

  safeArea: {
    flex: 1,
    backgroundColor: "#f6f7f9",
  },

  content: {
    width: "100%",
    maxWidth: 750,
    alignSelf: "center",
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 30,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ffffff",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 22,
    zIndex: 20,
  },

  greeting: {
    color: "#7c838c",
    fontSize: 14,
    marginBottom: 3,
  },

  userName: {
    color: "#20242a",
    fontSize: 25,
    fontWeight: "800",
  },

  profileMenuContainer: {
    position: "relative",
    alignItems: "flex-end",
    zIndex: 30,
  },

  profileButton: {
    minWidth: 62,
    height: 48,
    paddingHorizontal: 11,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
    backgroundColor: "#fff0ef",
    borderWidth: 1,
    borderColor: "transparent",
  },

  profileButtonActive: {
    borderColor: "#f0c4c1",
    backgroundColor: "#ffe8e6",
  },

  profileDropdown: {
    position: "absolute",
    top: 57,
    right: 0,
    width: 245,
    padding: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eceef1",
    backgroundColor: "#ffffff",
    shadowColor: "#000000",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.14,
    shadowRadius: 16,
    elevation: 12,
    zIndex: 40,
  },

  profileDropdownHeader: {
    padding: 9,
    flexDirection: "row",
    alignItems: "center",
  },

  profileAvatarSmall: {
    width: 38,
    height: 38,
    marginRight: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0ef",
  },

  profileDropdownUserInfo: {
    flex: 1,
  },

  profileDropdownName: {
    color: "#292e34",
    fontSize: 13,
    fontWeight: "800",
  },

  profileDropdownEmail: {
    marginTop: 2,
    color: "#8a9098",
    fontSize: 10,
  },

  profileDropdownDivider: {
    height: 1,
    marginVertical: 6,
    backgroundColor: "#eef0f2",
  },

  profileMenuOption: {
    minHeight: 48,
    paddingHorizontal: 9,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },

  profileMenuOptionPressed: {
    backgroundColor: "#f7f8fa",
  },

  profileMenuOptionIcon: {
    width: 34,
    height: 34,
    marginRight: 10,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0ef",
  },

  profileMenuOptionText: {
    flex: 1,
    color: "#343940",
    fontSize: 13,
    fontWeight: "700",
  },

  logoutIconContainer: {
    backgroundColor: "#ffeded",
  },

  logoutText: {
    color: "#b42318",
  },

  mainCard: {
    position: "relative",
    overflow: "hidden",
    minHeight: 210,
    padding: 22,
    borderRadius: 24,
    backgroundColor: ROJO,
    shadowColor: ROJO_OSCURO,
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.22,
    shadowRadius: 14,
    elevation: 7,
  },

  circleOne: {
    position: "absolute",
    top: -90,
    right: -80,
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: "rgba(255,255,255,0.09)",
  },

  circleTwo: {
    position: "absolute",
    bottom: -100,
    left: -80,
    width: 210,
    height: 210,
    borderRadius: 105,
    backgroundColor: "rgba(0,0,0,0.07)",
  },

  mainCardContent: {
    zIndex: 2,
  },

  mainCardIcon: {
    width: 46,
    height: 46,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.18)",
  },

  mainCardTitle: {
    marginTop: 15,
    color: "#ffffff",
    fontSize: 23,
    fontWeight: "800",
  },

  mainCardDescription: {
    maxWidth: 410,
    marginTop: 7,
    color: "rgba(255,255,255,0.82)",
    fontSize: 13,
    lineHeight: 20,
  },

  newOrderButton: {
    alignSelf: "flex-start",
    minHeight: 43,
    marginTop: 18,
    paddingHorizontal: 17,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: 13,
    backgroundColor: "#ffffff",
  },

  newOrderButtonText: {
    color: ROJO,
    fontSize: 13,
    fontWeight: "800",
  },

  sectionHeader: {
    marginTop: 28,
    marginBottom: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  sectionTitle: {
    color: "#252a30",
    fontSize: 18,
    fontWeight: "800",
  },

  seeAllText: {
    color: ROJO,
    fontSize: 13,
    fontWeight: "700",
  },

  quickActions: {
    flexDirection: "row",
    gap: 13,
  },

  quickAction: {
    flex: 1,
    minHeight: 145,
    padding: 16,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#eceef1",
    backgroundColor: "#ffffff",
  },

  quickActionIcon: {
    width: 47,
    height: 47,
    marginBottom: 14,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0ef",
  },

  quickActionTitle: {
    color: "#2c3137",
    fontSize: 15,
    fontWeight: "800",
  },

  quickActionDescription: {
    marginTop: 4,
    color: "#8b9199",
    fontSize: 11,
  },

  ordersContainer: {
    gap: 12,
  },

  orderCard: {
    minHeight: 105,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#eceef1",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },

  orderIcon: {
    width: 52,
    height: 52,
    marginRight: 13,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff0ef",
  },

  orderInformation: {
    flex: 1,
  },

  orderTop: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  orderNumber: {
    color: "#272c32",
    fontSize: 14,
    fontWeight: "800",
  },

  statusBadge: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },

  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },

  branchName: {
    marginTop: 5,
    color: "#777f88",
    fontSize: 12,
  },

  orderBottom: {
    marginTop: 9,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  orderDate: {
    color: "#9a9fa6",
    fontSize: 11,
  },

  orderTotal: {
    color: ROJO,
    fontSize: 14,
    fontWeight: "800",
  },

  emptyContainer: {
    paddingVertical: 38,
    alignItems: "center",
    borderRadius: 18,
    backgroundColor: "#ffffff",
  },

  emptyTitle: {
    marginTop: 12,
    color: "#363c43",
    fontSize: 15,
    fontWeight: "700",
  },

  emptyDescription: {
    marginTop: 5,
    color: "#8c9299",
    fontSize: 12,
  },

  balanceContainer: {
    alignItems: "flex-end",
  },

  balanceLabel: {
    marginBottom: 2,
    color: "#8a4b47",
    fontSize: 9,
    fontWeight: "700",
  },

  balancePending: {
    color: "#c8231b",
    fontSize: 14,
    fontWeight: "800",
  },

  balancePaidContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },

  balancePaid: {
    color: "#15803d",
    fontSize: 12,
    fontWeight: "800",
  },

});
