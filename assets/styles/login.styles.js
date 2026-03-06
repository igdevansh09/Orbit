import { StyleSheet, Platform } from "react-native";

export const getLoginStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: 24,
      paddingTop: Platform.OS === "ios" ? 100 : 80,
      paddingBottom: 40,
    },
    header: {
      alignItems: "flex-start",
      marginBottom: 48,
    },
    title: {
      fontSize: 46,
      fontWeight: "900",
      color: COLORS.textPrimary, // Changed to textPrimary to fit GitHub aesthetic better
      marginBottom: 8,
      letterSpacing: -1.5,
    },
    subtitle: {
      fontSize: 18,
      color: COLORS.textSecondary,
      fontWeight: "500",
      letterSpacing: 0.5,
    },
    formContainer: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 13,
      marginBottom: 10,
      color: COLORS.textSecondary,
      fontWeight: "700",
      marginLeft: 4,
      textTransform: "uppercase",
      letterSpacing: 1,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.inputBackground,
      borderRadius: 16, // Softer curves
      paddingHorizontal: 16,
      height: 64,
      borderWidth: 1,
      borderColor: COLORS.border, // Utilize your GitHub border color
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
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 32,
    },
    forgotPasswordText: {
      color: COLORS.textSecondary,
      fontSize: 14,
      fontWeight: "700",
    },
    button: {
      borderRadius: 16,
      height: 64,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: COLORS.black,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.2,
      shadowRadius: 10,
      elevation: 6,
    },
    buttonText: {
      color: COLORS.white, // Inverts perfectly based on your GITHUB_DARK fix
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 1,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: "auto",
      paddingTop: 40,
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
