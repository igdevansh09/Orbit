import { StyleSheet } from "react-native";

export const getHomeStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    listContainer: {
      padding: 20,
      paddingBottom: 100,
    },
    header: {
      marginBottom: 24,
      marginTop: 10,
    },
    headerTitle: {
      fontSize: 28,
      fontWeight: "800",
      color: COLORS.primary,
      marginBottom: 4,
    },
    headerSubtitle: {
      fontSize: 16,
      color: COLORS.textSecondary,
      fontWeight: "500",
    },
    bookCard: {
      backgroundColor: COLORS.cardBackground,
      borderRadius: 16,
      marginBottom: 24,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 5,
      borderWidth: 1,
      borderColor: COLORS.border,
      overflow: "hidden",
    },
    bookHeader: {
      flexDirection: "row",
      alignItems: "center",
      padding: 16,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
      flex: 1,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.inputBackground,
    },
    username: {
      fontSize: 16,
      fontWeight: "700",
      color: COLORS.textPrimary,
    },
    bookImageContainer: {
      width: "100%",
      height: 220,
      backgroundColor: COLORS.inputBackground,
    },
    bookImage: {
      width: "100%",
      height: "100%",
    },
    bookDetails: {
      padding: 16,
    },
    bookTitle: {
      fontSize: 20,
      fontWeight: "800",
      color: COLORS.textDark,
      marginBottom: 8,
    },
    ratingContainer: {
      flexDirection: "row",
      marginBottom: 12,
    },
    caption: {
      fontSize: 14,
      lineHeight: 22,
      color: COLORS.textPrimary,
      marginBottom: 12,
    },
    date: {
      fontSize: 12,
      color: COLORS.textSecondary,
      marginTop: 8,
      fontStyle: "italic",
    },
    footerLoader: {
      marginTop: 20,
    },
    emptyContainer: {
      alignItems: "center",
      justifyContent: "center",
      paddingTop: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "700",
      color: COLORS.textDark,
      marginTop: 16,
    },
    emptySubtext: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginTop: 8,
    },
  });
