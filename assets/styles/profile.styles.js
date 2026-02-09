import { StyleSheet } from "react-native";

export const getProfileStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      paddingTop: 50,
    },
    // --- HEADER STYLES ---
    headerContainer: {
      marginBottom: 20,
      paddingHorizontal: 20,
    },
    profileHeader: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 20,
    },
    profileImage: {
      width: 80,
      height: 80,
      borderRadius: 40,
      borderWidth: 2,
      borderColor: COLORS.primary,
      backgroundColor: COLORS.inputBackground,
    },
    profileInfo: {
      marginLeft: 16,
      flex: 1,
    },
    username: {
      fontSize: 22,
      fontWeight: "bold",
      color: COLORS.textPrimary,
      marginBottom: 4,
    },
    email: {
      fontSize: 14,
      color: COLORS.textSecondary,
      marginBottom: 4,
    },
    metaText: {
      fontSize: 12,
      color: COLORS.primary,
      fontWeight: "600",
    },
    logoutButton: {
      flexDirection: "row",
      backgroundColor: COLORS.primary, // Or a warning color like red? Keeping primary for consistency.
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: 8,
      alignItems: "center",
      justifyContent: "center",
      alignSelf: "flex-start",
    },
    logoutText: {
      color: COLORS.white,
      marginLeft: 8,
      fontWeight: "600",
      fontSize: 14,
    },
    sectionTitleContainer: {
      marginTop: 24,
      marginBottom: 8,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      paddingBottom: 8,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: "bold",
      color: COLORS.textDark,
    },

    // --- CARD STYLES ---
    bookCard: {
      backgroundColor: COLORS.cardBackground,
      borderRadius: 16,
      marginBottom: 24,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 12,
      elevation: 3,
      borderWidth: 1,
      borderColor: COLORS.border,
      overflow: "hidden",
      width: "100%",
    },
    bookHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
    },
    userInfo: {
      flexDirection: "row",
      alignItems: "center",
    },
    cardAvatar: {
      width: 32,
      height: 32,
      borderRadius: 16,
      marginRight: 10,
      borderWidth: 1,
      borderColor: COLORS.border,
      backgroundColor: COLORS.inputBackground,
    },
    cardUsername: {
      fontSize: 14,
      fontWeight: "700",
      color: COLORS.textPrimary,
    },
    bookImageContainer: {
      width: "100%",
      height: 200,
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
      fontSize: 18,
      fontWeight: "800",
      color: COLORS.textDark,
      marginBottom: 6,
    },
    ratingContainer: {
      flexDirection: "row",
      marginBottom: 8,
    },
    caption: {
      fontSize: 14,
      color: COLORS.textPrimary,
      lineHeight: 22,
      marginBottom: 8,
    },
    readMore: {
      color: COLORS.primary,
      fontWeight: "600",
      fontSize: 14,
      marginBottom: 12,
    },
    date: {
      fontSize: 12,
      color: COLORS.textSecondary,
      fontWeight: "500",
    },
  });
