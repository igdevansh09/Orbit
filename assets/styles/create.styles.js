import { StyleSheet, Platform } from "react-native";

export const getCreateStyles = (COLORS) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: 12, // Reduced from 24 for maximum width
      paddingTop: Platform.OS === "ios" ? 60 : 40,
      paddingBottom: 40,
    },
    scrollViewStyle: {
      flex: 1,
      backgroundColor: COLORS.background,
    },
    header: {
      alignItems: "flex-start",
      marginBottom: 40,
      paddingHorizontal: 4, // Keeps text aligned beautifully with the rounded inputs
    },
    title: {
      fontSize: 42,
      fontWeight: "900",
      color: COLORS.primary,
      marginBottom: 8,
      letterSpacing: -1.5,
    },
    subtitle: {
      fontSize: 16,
      color: COLORS.textSecondary,
      fontWeight: "600",
      letterSpacing: -0.2,
    },
    form: {
      flex: 1,
    },
    formGroup: {
      marginBottom: 28,
    },
    label: {
      fontSize: 14,
      marginBottom: 12,
      color: COLORS.textPrimary,
      fontWeight: "800",
      letterSpacing: -0.3,
      marginLeft: 12, // Adjusted to align visually with the curve of the input below
    },
    inputContainer: {
      flexDirection: "row",
      alignItems: "center",
      backgroundColor: COLORS.inputBackground,
      borderRadius: 100,
      paddingHorizontal: 16, // Slightly tighter internal padding
      height: 64,
    },
    inputIcon: {
      marginRight: 10,
    },
    input: {
      flex: 1,
      height: "100%",
      color: COLORS.textDark,
      fontSize: 16,
      fontWeight: "600",
    },
    textArea: {
      backgroundColor: COLORS.inputBackground,
      borderRadius: 24,
      padding: 20,
      minHeight: 160,
      color: COLORS.textDark,
      fontSize: 16,
      textAlignVertical: "top",
      fontWeight: "500",
      lineHeight: 24,
    },
    chipContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: 10, // Tighter gap for wider layout
    },
    chip: {
      paddingVertical: 14,
      paddingHorizontal: 20,
      borderRadius: 100,
      backgroundColor: COLORS.inputBackground,
    },
    chipActive: {
      backgroundColor: COLORS.primary,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    chipText: {
      fontSize: 15,
      color: COLORS.textSecondary,
      fontWeight: "800",
    },
    chipTextActive: {
      color: COLORS.white,
    },
    ratingContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      backgroundColor: COLORS.inputBackground,
      borderRadius: 100,
      paddingVertical: 12,
      paddingHorizontal: 16, // Adjusted for wider stretch
    },
    starButton: {
      padding: 4,
    },
    imagePicker: {
      width: "100%",
      height: 240,
      backgroundColor: COLORS.inputBackground,
      borderRadius: 28, // Matches the wider look slightly better
      overflow: "hidden",
      justifyContent: "center",
      alignItems: "center",
    },
    previewImage: {
      width: "100%",
      height: "100%",
    },
    placeholderContainer: {
      alignItems: "center",
      justifyContent: "center",
    },
    placeholderText: {
      color: COLORS.textSecondary,
      marginTop: 12,
      fontSize: 16,
      fontWeight: "700",
    },
    button: {
      backgroundColor: COLORS.primary,
      borderRadius: 100,
      height: 64,
      flexDirection: "row",
      justifyContent: "center",
      alignItems: "center",
      marginTop: 24,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.25,
      shadowRadius: 16,
      elevation: 6,
    },
    buttonText: {
      color: COLORS.white,
      fontSize: 18,
      fontWeight: "800",
      letterSpacing: 0.5,
    },
    buttonIcon: {
      marginRight: 10,
    },
  });
