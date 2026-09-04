module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // o preset só transforma react-native/@react-native(-community); o build
  // ESM do @react-native-async-storage/async-storage também precisa passar
  // pelo babel-jest, senão o `export`/`import` dele quebra o Jest (CJS).
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage)/)',
  ],
};
