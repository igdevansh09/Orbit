module.exports = function (api) {
  api.cache(true);
  return {
    presets: ["babel-preset-expo"],
    plugins: [
      // This is required for Reanimated (if you use it)
      "react-native-reanimated/plugin",
    ],
  };
};
