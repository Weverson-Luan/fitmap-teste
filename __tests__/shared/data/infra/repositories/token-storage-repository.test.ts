/**
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';

import {
  clearStoredTokenData,
  getStoredTokenData,
  saveTokenData,
} from '../../../../../src/shared/data/infra/repositories/token-storage-repository';

afterEach(async () => {
  await AsyncStorage.clear();
});

test('getStoredTokenData retorna null quando nada foi salvo', async () => {
  await expect(getStoredTokenData()).resolves.toBeNull();
});

test('saveTokenData persiste o par de tokens e getStoredTokenData os lê de volta', async () => {
  await saveTokenData({ accessToken: 'access-1', refreshToken: 'refresh-1' });

  await expect(getStoredTokenData()).resolves.toEqual({
    accessToken: 'access-1',
    refreshToken: 'refresh-1',
  });
});

test('getStoredTokenData retorna null se só um dos dois tokens existir', async () => {
  await AsyncStorage.setItem('@fitmap:access_token', 'access-orfao');

  await expect(getStoredTokenData()).resolves.toBeNull();
});

test('clearStoredTokenData remove os dois tokens', async () => {
  await saveTokenData({ accessToken: 'access-1', refreshToken: 'refresh-1' });

  await clearStoredTokenData();

  await expect(getStoredTokenData()).resolves.toBeNull();
});
