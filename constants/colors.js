const GITHUB_LIGHT = {
  primary: "#24292f",
  textPrimary: "#24292f",
  textSecondary: "#57606a",
  textDark: "#000000",
  placeholderText: "#6e7781",
  background: "#ffffff",
  cardBackground: "#f6f8fa",
  inputBackground: "#f6f8fa",
  border: "#d0d7de",
  white: "#ffffff",
  black: "#000000",
};

const GITHUB_DARK = {
  primary: "#e6edf3", // Light shade so icons are visible on black inputs
  textPrimary: "#c9d1d9",
  textSecondary: "#8b949e",
  textDark: "#ffffff",
  placeholderText: "#6e7681",
  background: "#0d1117",
  cardBackground: "#161b22",
  inputBackground: "#010409",
  border: "#30363d",
  // THE FIX: Invert 'white' so text on light primary buttons becomes dark
  white: "#0d1117",
  black: "#ffffff",
};

export const Colors = {
  light: GITHUB_LIGHT,
  dark: GITHUB_DARK,
};
