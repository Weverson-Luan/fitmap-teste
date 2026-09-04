module.exports = {
  preset: '@react-native/jest-preset',
  setupFiles: ['<rootDir>/jest.setup.js'],
  // o preset só transforma react-native/@react-native(-community); o build
  // ESM do @react-native-async-storage/async-storage e o JSX não-compilado
  // do react-native-css-interop (dependência do NativeWind) também precisam
  // passar pelo babel-jest, senão o `export`/`import`/JSX deles quebra o
  // Jest (CJS puro, sem transform).
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?|@react-native-async-storage|react-native-css-interop)/)',
  ],
  // `App.tsx` importa `global.css` (NativeWind) — Jest não sabe transformar
  // CSS (isso é papel do Metro no build real), então o import vira um mock.
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest/css-mock.js',
  },
};
