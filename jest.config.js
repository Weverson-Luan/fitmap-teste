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
  //
  // As entradas `@alias/` abaixo replicam, para o resolver do Jest, os
  // aliases configurados em `babel.config.js` (babel-plugin-module-resolver)
  // e `tsconfig.json` (`compilerOptions.paths`) — mantenha os três em sincronia.
  moduleNameMapper: {
    '\\.css$': '<rootDir>/jest/css-mock.js',
    '^@modules/(.*)$': '<rootDir>/src/modules/$1',
    '^@shared/(.*)$': '<rootDir>/src/shared/$1',
    '^@assets/(.*)$': '<rootDir>/src/assets/$1',
    '^@presentation/(.*)$': '<rootDir>/src/shared/presentation/$1',
    '^@store/(.*)$': '<rootDir>/src/shared/store/$1',
    '^@data/(.*)$': '<rootDir>/src/shared/data/$1',
    '^@libs/(.*)$': '<rootDir>/src/shared/libs/$1',
    '^@styles/(.*)$': '<rootDir>/src/shared/styles/$1',
    '^@utils/(.*)$': '<rootDir>/src/shared/utils/$1',
    '^@config/(.*)$': '<rootDir>/src/shared/config/$1',
    '^@types/(.*)$': '<rootDir>/src/shared/@types/$1',
    '^@common/(.*)$': '<rootDir>/src/shared/common/$1',
  },
};
