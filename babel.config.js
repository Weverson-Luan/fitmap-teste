module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins: [
    // Aliases de import (@modules, @shared, @assets, etc.) — mantidos em
    // sincronia com `compilerOptions.paths` (tsconfig.json) e
    // `moduleNameMapper` (jest.config.js).
    [
      'module-resolver',
      {
        root: ['./src'],
        alias: {
          '@modules': './src/modules',
          '@shared': './src/shared',
          '@assets': './src/assets',
          '@presentation': './src/shared/presentation',
          '@store': './src/shared/store',
          '@data': './src/shared/data',
          '@libs': './src/shared/libs',
          '@styles': './src/shared/styles',
          '@utils': './src/shared/utils',
          '@config': './src/shared/config',
          '@types': './src/shared/@types',
          '@common': './src/shared/common',
        },
        extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
      },
    ],
    // `react-native-worklets/plugin` tem que ser o último item desta lista
    // (exigência do próprio Reanimated/Worklets).
    'react-native-worklets/plugin',
  ],
};
