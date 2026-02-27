const FOREST_LIGHT = {
  // Core colors
  primary: "#4CAF50",
  textPrimary: "#2e5a2e",
  textSecondary: "#688f68",
  textDark: "#1b361b",
  placeholderText: "#767676",
  background: "#e8f5e9",
  cardBackground: "#f1f8f2",
  inputBackground: "#f4faf5",
  border: "#c8e6c9",
  white: "#ffffff",
  black: "#000000",
  
  // Glassmorphism & accent colors
  accent: "#66BB6A",
  accentLight: "#81C784",
  accentDark: "#388E3C",
  glassBackground: "rgba(255, 255, 255, 0.5)",
  glassBackgroundDark: "rgba(241, 248, 242, 0.7)",
  glassBlur: "rgba(225, 235, 225, 0.3)",
  
  // State colors
  success: "#4CAF50",
  error: "#E57373",
  warning: "#FFB74D",
  info: "#64B5F6",
  
  // Shadows for glassmorphic surfaces
  shadowColor: "rgba(0, 0, 0, 0.08)",
  shadowColorLight: "rgba(0, 0, 0, 0.04)",
  
  // Additional semantic colors
  disabled: "#BDBDBD",
  skeleton: "#E0E0E0",
};

const FOREST_DARK = {
  // Core colors
  primary: "#66BB6A", // Lighter green for dark mode contrast
  textPrimary: "#E8F5E9", // Light greenish white
  textSecondary: "#A5D6A7", // Soft green
  textDark: "#FFFFFF", // White for headers
  placeholderText: "#999999",
  background: "#051005", // Very deep dark green (almost black)
  cardBackground: "#1B2E1B", // Dark forest green
  inputBackground: "#233823", // Slightly lighter for inputs
  border: "#2E4D2E",
  white: "#ffffff",
  black: "#000000",
  
  // Glassmorphism & accent colors
  accent: "#81C784",
  accentLight: "#A5D6A7",
  accentDark: "#4CAF50",
  glassBackground: "rgba(27, 46, 27, 0.5)",
  glassBackgroundDark: "rgba(5, 16, 5, 0.7)",
  glassBlur: "rgba(35, 56, 35, 0.3)",
  
  // State colors
  success: "#66BB6A",
  error: "#EF5350",
  warning: "#FFA726",
  info: "#42A5F5",
  
  // Shadows for glassmorphic surfaces
  shadowColor: "rgba(0, 0, 0, 0.3)",
  shadowColorLight: "rgba(0, 0, 0, 0.15)",
  
  // Additional semantic colors
  disabled: "#616161",
  skeleton: "#37474F",
};

export const Colors = {
  light: FOREST_LIGHT,
  dark: FOREST_DARK,
};
