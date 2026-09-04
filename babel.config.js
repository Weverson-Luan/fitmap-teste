module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  // `react-native-worklets/plugin` tem que ser o último item desta lista
  // (exigência do próprio Reanimated/Worklets).
  plugins: ['react-native-worklets/plugin'],
};
