/* eslint-env jest */
/**
 * Setup global do Jest.
 *
 * Mock oficial do `@react-native-async-storage/async-storage` (a lib não
 * roda fora de um runtime nativo) — recomendado pela própria biblioteca.
 */
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest').default,
);
