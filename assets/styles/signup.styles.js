import { StyleSheet, Platform } from "react-native";

export const getSignupStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: Platform.OS === "ios" ? 100 : 80,
      paddingBottom: 40,
    },
    header: {
      alignItems: "flex-start",
      marginBottom: 40,
    },
    title: {
      fontSize: 38,
      fontWeight: "900",
      color: COLORS.textPrimary, // Matching Login header
      marginBottom: 8,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.textSecondary,
      fontWeight: "500",
      lineHeight: 22,
    },
    formContainer: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: 20,
    },
    label: {
      fontSize: 13,
      marginBottom: 10,
      color: COLORS.textSecondary,
      fontWeight: "700",
      marginLeft: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.inputBackground,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 64,
      borderWidth: 1, // Adding the border for Glassmorphism
      borderColor: COLORS.border,
    },
    inputIcon: {
      marginRight: 12,
      opacity: 0.8,
    },
    input: {
      flex: 1,
      height: "100%",
      color: COLORS.textDark,
      fontSize: 16,
      fontWeight: "600",
    },
    eyeIcon: {
      padding: 8,
    },
    button: {
      borderRadius: 16,
      height: 64,
      justifyContent: "center",
      alignItems: "center",
      marginTop: 20,
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    },
    buttonText: {
      color: COLORS.white,
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 1,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: 32,
    },
    footerText: {
      color: COLORS.textSecondary,
      marginRight: 6,
      fontSize: 15,
      fontWeight: "500",
    },
    link: {
      color: COLORS.textPrimary,
      fontWeight: "800",
      fontSize: 15,
      textDecorationLine: "underline",
    },
  });
