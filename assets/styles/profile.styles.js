import { StyleSheet, Platform } from "react-native";

export const getProfileStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: COLORS.background,
      paddingTop: Platform.OS === "ios" ? 60 : 40,
      paddingHorizontal: 16,
    },
    headerContainer: {
      alignItems: "center",
      paddingTop: 10,
      paddingBottom: 32,
      borderBottomWidth: 1,
      borderBottomColor: COLORS.border, // Soft separator for the feed
      marginBottom: 20,
      paddingHorizontal: 24,
    },
    avatarContainer: {
      marginBottom: 20,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15, // Gives the avatar a subtle glow
      shadowRadius: 16,
      elevation: 4,
    },
    profileImage: {
      width: 120, // Massive, confident scale
      height: 120,
      borderRadius: 60,
      backgroundColor: COLORS.inputBackground,
      borderWidth: 4,
      borderColor: COLORS.background, // Creates a clean cutout effect
    },
    editBadge: {
      position: "absolute",
      bottom: 0,
      right: 0,
      backgroundColor: COLORS.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 4,
      borderColor: COLORS.background,
    },
    profileInfo: {
      alignItems: "center",
      marginBottom: 24,
    },
    username: {
      fontSize: 28,
      fontWeight: "900",
      color: COLORS.textPrimary,
      marginBottom: 4,
      letterSpacing: -0.5,
    },
    email: {
      fontSize: 15,
      color: COLORS.textSecondary,
      marginBottom: 12,
      fontWeight: "500",
    },
    metaBadge: {
      backgroundColor: COLORS.inputBackground,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 100, // Pill shape for metadata
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
      gap: 12,
      width: "100%",
    },
    actionButton: {
      flex: 1,
      flexDirection: "row",
      paddingVertical: 14,
      borderRadius: 100, // Pill shaped buttons
      alignItems: "center",
      justifyContent: "center",
      borderWidth: 1,
    },
    logoutButton: {
      backgroundColor: "transparent",
      borderColor: COLORS.border,
    },
    deleteButton: {
      backgroundColor: "#FFF0F0",
      borderColor: "#FFD6D6",
    },
    logoutText: {
      color: COLORS.textPrimary,
      marginLeft: 8,
      fontWeight: "700",
      fontSize: 15,
    },
    deleteText: {
      color: "#FF4444",
      marginLeft: 8,
      fontWeight: "700",
      fontSize: 15,
    },
    sectionTitleContainer: {
      paddingHorizontal: 24,
      marginBottom: 16,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: "900",
      color: COLORS.textPrimary,
      letterSpacing: -0.5,
    },
    emptyState: {
      alignItems: "center",
      justifyContent: "center",
      marginTop: 60,
    },
    emptyText: {
      fontSize: 18,
      fontWeight: "700",
      color: COLORS.textPrimary,
      marginTop: 16,
    },
    emptySubtext: {
      color: COLORS.textSecondary,
      marginTop: 8,
      fontSize: 15,
      fontWeight: "500",
    },
  });
