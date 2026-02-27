import { StyleSheet, Platform } from "react-native";

export const getLoginStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: COLORS.background,
      paddingHorizontal: 24,
      paddingTop: Platform.OS === "ios" ? 80 : 60,
      paddingBottom: 40,
    },
    header: {
      alignItems: "flex-start",
      marginBottom: 48,
    },
    title: {
      fontSize: 42,
      fontWeight: "800",
      color: COLORS.primary,
      marginBottom: 8,
      letterSpacing: -1,
    },
    subtitle: {
      fontSize: 18,
      color: COLORS.textSecondary,
      fontWeight: "500",
    },
    formContainer: {
      flex: 1,
    },
    inputGroup: {
      marginBottom: 24,
    },
    label: {
      fontSize: 14,
      marginBottom: 10,
      color: COLORS.textPrimary,
      fontWeight: "700",
      marginLeft: 4,
      textTransform: "uppercase",
      letterSpacing: 0.5,
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.glassBackgroundDark,
      borderRadius: 16,
      paddingHorizontal: 16,
      height: 60,
      borderWidth: 1,
      borderColor: COLORS.border,
      shadowColor: COLORS.shadowColorLight,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 2,
    },
    inputIcon: {
      marginRight: 12,
    },
    input: {
      flex: 1,
      height: "100%",
      color: COLORS.textDark,
      fontSize: 16,
      fontWeight: "500",
    },
    eyeIcon: {
      padding: 8,
    },
    forgotPassword: {
      alignSelf: "flex-end",
      marginBottom: 32,
    },
    forgotPasswordText: {
      color: COLORS.primary,
      fontSize: 15,
      fontWeight: "700",
    },
    button: {
      backgroundColor: COLORS.primary,
      borderRadius: 16,
      height: 60,
      justifyContent: "center",
      alignItems: "center",
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    buttonText: {
      color: COLORS.white,
      fontSize: 18,
      fontWeight: "700",
      letterSpacing: 0.5,
    },
    footer: {
      flexDirection: "row",
      justifyContent: "center",
      marginTop: "auto",
      paddingTop: 32,
    },
    footerText: {
      color: COLORS.textSecondary,
      marginRight: 6,
      fontSize: 15,
    },
    link: {
      color: COLORS.primary,
      fontWeight: "800",
      fontSize: 15,
    },
  });
