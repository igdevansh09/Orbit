import { StyleSheet, Platform } from "react-native";

export const getProfileStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    headerContainer: {
      alignItems: "center",
      paddingTop: 24,
      paddingBottom: 32,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border,
      marginBottom: 20,
    },
    avatarContainer: {
      marginBottom: 24,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 6,
    },
    profileImage: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: COLORS.inputBackground,
      borderWidth: 4,
      borderColor: COLORS.background, // Cutout effect
    },
    editBadge: {
      position: "absolute",
      bottom: 0,
      right: 4,
      backgroundColor: COLORS.primary,
      borderRadius: 20,
      width: 36,
      height: 36,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 3,
      borderColor: COLORS.background,
    },
    profileInfo: {
      alignItems: "center",
      marginBottom: 28,
    },
    username: {
      fontSize: 28,
      fontWeight: "900",
      color: COLORS.textPrimary,
      marginBottom: 6,
      letterSpacing: -0.5,
    },
    email: {
      fontSize: 16,
      color: COLORS.textSecondary,
      marginBottom: 16,
      fontWeight: "500",
    },
    metaBadge: {
      backgroundColor: COLORS.primary + "15", // 15% opacity primary
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 100,
    },
    metaText: {
      fontSize: 13,
      color: COLORS.primary,
      fontWeight: "800",
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    buttonRow: {
      flexDirection: "row",
      justifyContent: "center",
      gap: 16,
      width: "100%",
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      paddingVertical: 16,
      borderRadius: 16, // Matched with auth buttons
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    logoutButton: {
      backgroundColor: COLORS.cardBackground,
      borderColor: COLORS.border,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 8,
      elevation: 2,
    },
    deleteButton: {
      // Using rgba so it works on both dark and light mode backgrounds dynamically
      backgroundColor: "rgba(255, 68, 68, 0.1)",
      borderColor: "rgba(255, 68, 68, 0.2)",
    },
    logoutText: {
      color: COLORS.textPrimary,
      marginLeft: 8,
      fontWeight: "800",
      fontSize: 16,
    },
    deleteText: {
      color: "#FF4444",
      marginLeft: 8,
      fontWeight: "800",
      fontSize: 16,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 40,
    },
    emptyIconWrapper: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: COLORS.inputBackground,
      justifyContent: "center",
      alignItems: "center",
      marginBottom: 20,
      borderWidth: 1,
      borderColor: COLORS.border,
    },
    emptyText: {
      fontSize: 20,
      fontWeight: "800",
      color: COLORS.textPrimary,
      marginTop: 12,
      letterSpacing: -0.5,
    },
    emptySubtext: {
      color: COLORS.textSecondary,
      marginTop: 8,
      fontSize: 15,
      fontWeight: "500",
    },
  });
