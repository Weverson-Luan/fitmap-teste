/**
 * @format
 */

import axios from 'axios';

jest.mock('axios', () => {
  const actualAxios = jest.requireActual('axios');
  return {
    ...actualAxios,
    create: jest.fn(() => ({ post: jest.fn() })),
  };
});

import AsyncStorage from '@react-native-async-storage/async-storage';

import { refreshAuthToken, setAuthTokens } from '../../../../src/shared/data/http/auth-session';
import {
  getStoredTokenData,
  saveTokenData,
} from '../../../../src/shared/data/infra/repositories/token-storage-repository';

const mockedCreate = axios.create as jest.MockedFunction<typeof axios.create>;
// `auth-session.ts` chama `axios.create(...)` uma única vez, na primeira vez
// que o módulo é importado (é uma instância de módulo, tipo singleton) —
// pegamos aqui a instância mockada que ele recebeu, pra poder controlar e
// inspecionar o `post` que ele usa pra chamar o endpoint de refresh.
const bareInstance = mockedCreate.mock.results[0]!.value as { post: jest.Mock };
const mockBarePost = bareInstance.post;

afterEach(async () => {
  await AsyncStorage.clear();
  mockBarePost.mockReset();
});

describe('setAuthTokens', () => {
  test('salva o par de tokens', async () => {
    await setAuthTokens('access-1', 'refresh-1');

    await expect(getStoredTokenData()).resolves.toEqual({
      accessToken: 'access-1',
      refreshToken: 'refresh-1',
    });
  });

  test('sem refreshToken mantém o refresh token salvo anteriormente', async () => {
    await setAuthTokens('access-1', 'refresh-1');
    await setAuthTokens('access-2');

    await expect(getStoredTokenData()).resolves.toEqual({
      accessToken: 'access-2',
      refreshToken: 'refresh-1',
    });
  });

  test('sem refreshToken e sem nada salvo antes não persiste nada', async () => {
    await setAuthTokens('access-1');

    await expect(getStoredTokenData()).resolves.toBeNull();
  });
});

describe('refreshAuthToken', () => {
  test('sem refresh token salvo retorna null e não chama o endpoint', async () => {
    const result = await refreshAuthToken();

    expect(result).toBeNull();
    expect(mockBarePost).not.toHaveBeenCalled();
  });

  test('renova com sucesso, persiste o novo par e retorna o novo access token', async () => {
    await saveTokenData({ accessToken: 'access-velho', refreshToken: 'refresh-1' });
    mockBarePost.mockResolvedValue({
      data: { accessToken: 'access-novo', refreshToken: 'refresh-2' },
    });

    const result = await refreshAuthToken();

    expect(mockBarePost).toHaveBeenCalledWith('/auth/refresh', { refreshToken: 'refresh-1' });
    expect(result).toBe('access-novo');
    await expect(getStoredTokenData()).resolves.toEqual({
      accessToken: 'access-novo',
      refreshToken: 'refresh-2',
    });
  });

  test('mantém o refresh token anterior se a resposta não trouxer um novo', async () => {
    await saveTokenData({ accessToken: 'access-velho', refreshToken: 'refresh-1' });
    mockBarePost.mockResolvedValue({ data: { accessToken: 'access-novo' } });

    await refreshAuthToken();

    await expect(getStoredTokenData()).resolves.toEqual({
      accessToken: 'access-novo',
      refreshToken: 'refresh-1',
    });
  });

  test('endpoint falhando limpa a sessão salva e retorna null', async () => {
    await saveTokenData({ accessToken: 'access-velho', refreshToken: 'refresh-1' });
    mockBarePost.mockRejectedValue(new Error('network down'));

    const result = await refreshAuthToken();

    expect(result).toBeNull();
    await expect(getStoredTokenData()).resolves.toBeNull();
  });

  test('chamadas concorrentes compartilham a mesma renovação (single-flight)', async () => {
    await saveTokenData({ accessToken: 'access-velho', refreshToken: 'refresh-1' });
    mockBarePost.mockResolvedValue({
      data: { accessToken: 'access-novo', refreshToken: 'refresh-1' },
    });

    const [first, second] = await Promise.all([refreshAuthToken(), refreshAuthToken()]);

    expect(mockBarePost).toHaveBeenCalledTimes(1);
    expect(first).toBe('access-novo');
    expect(second).toBe('access-novo');
  });
});
