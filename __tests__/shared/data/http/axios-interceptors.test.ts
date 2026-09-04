/**
 * @format
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { AxiosHeaders } from 'axios';
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { ApiService } from '../../../../src/shared/data/http/axios-interceptors';
import { getStoredTokenData, saveTokenData } from '../../../../src/shared/data/infra/repositories/token-storage-repository';

jest.mock('../../../../src/shared/data/http/auth-session');

import { refreshAuthToken, setAuthTokens } from '../../../../src/shared/data/http/auth-session';

const mockedRefreshAuthToken = refreshAuthToken as jest.MockedFunction<typeof refreshAuthToken>;
const mockedSetAuthTokens = setAuthTokens as jest.MockedFunction<typeof setAuthTokens>;

const apiService = ApiService.getInstance();

// Interceptors são registrados uma única vez no construtor (singleton) — os
// testes chamam os handlers direto, em vez de disparar requisições de verdade.
const requestInterceptor = apiService.client.interceptors.request.handlers![0];
const responseInterceptor = apiService.client.interceptors.response.handlers![0];

function buildConfig(
  overrides: Partial<InternalAxiosRequestConfig> = {},
): InternalAxiosRequestConfig {
  return { headers: new AxiosHeaders(), ...overrides };
}

function buildResponse<T>(data: T, config: InternalAxiosRequestConfig): AxiosResponse<T> {
  return { data, status: 200, statusText: 'OK', headers: {}, config };
}

function buildErrorFor(config: InternalAxiosRequestConfig, status: number): AxiosError {
  return {
    isAxiosError: true,
    name: 'AxiosError',
    message: 'Request failed',
    toJSON: () => ({}),
    config,
    response: { status, data: {}, headers: {}, statusText: '', config },
  } as AxiosError;
}

afterEach(async () => {
  await AsyncStorage.clear();
  apiService.setUnauthorizedHandler(() => {});
  jest.clearAllMocks();
});

describe('request interceptor', () => {
  test('injeta Authorization quando há token salvo e a rota não é skipAuth', async () => {
    await saveTokenData({ accessToken: 'token-123', refreshToken: 'refresh-123' });
    const config = buildConfig();

    const result = await requestInterceptor.fulfilled(config);

    expect(result.headers.get('Authorization')).toBe('Bearer token-123');
  });

  test('não injeta Authorization quando a rota é skipAuth', async () => {
    await saveTokenData({ accessToken: 'token-123', refreshToken: 'refresh-123' });
    const config = buildConfig({ skipAuth: true });

    const result = await requestInterceptor.fulfilled(config);

    expect(result.headers.get('Authorization')).toBeFalsy();
  });

  test('não injeta Authorization quando não há token salvo', async () => {
    const config = buildConfig();

    const result = await requestInterceptor.fulfilled(config);

    expect(result.headers.get('Authorization')).toBeFalsy();
  });
});

describe('response interceptor', () => {
  test('erro que não é 401 é só normalizado, sem tentar refresh', async () => {
    const config = buildConfig();
    const error = buildErrorFor(config, 500);

    await expect(responseInterceptor.rejected!(error)).rejects.toMatchObject({ code: 'server' });
    expect(mockedRefreshAuthToken).not.toHaveBeenCalled();
  });

  test('401 numa rota skipAuth não tenta refresh (ex.: credenciais inválidas no signin)', async () => {
    const config = buildConfig({ skipAuth: true });
    const error = buildErrorFor(config, 401);

    await expect(responseInterceptor.rejected!(error)).rejects.toMatchObject({
      code: 'unauthorized',
    });
    expect(mockedRefreshAuthToken).not.toHaveBeenCalled();
  });

  test('401 renova o token e reexecuta a requisição original de forma transparente', async () => {
    mockedRefreshAuthToken.mockResolvedValue('access-novo');
    const config = buildConfig();
    const requestSpy = jest
      .spyOn(apiService.client, 'request')
      .mockResolvedValue(buildResponse('ok', config));

    const error = buildErrorFor(config, 401);
    const result = await responseInterceptor.rejected!(error);

    expect(mockedRefreshAuthToken).toHaveBeenCalledTimes(1);
    expect(config.headers.get('Authorization')).toBe('Bearer access-novo');
    expect(requestSpy).toHaveBeenCalledWith(config);
    expect(result.data).toBe('ok');
  });

  test('401 com renovação malsucedida rejeita como unauthorized e chama o callback de sessão expirada', async () => {
    mockedRefreshAuthToken.mockResolvedValue(null);
    const onUnauthorized = jest.fn();
    apiService.setUnauthorizedHandler(onUnauthorized);
    const config = buildConfig();
    const error = buildErrorFor(config, 401);

    await expect(responseInterceptor.rejected!(error)).rejects.toMatchObject({
      code: 'unauthorized',
    });
    expect(onUnauthorized).toHaveBeenCalledTimes(1);
  });

  test('401 numa requisição já reexecutada não tenta refresh de novo (evita loop)', async () => {
    const config = buildConfig({ _retry: true });
    const error = buildErrorFor(config, 401);

    await expect(responseInterceptor.rejected!(error)).rejects.toMatchObject({
      code: 'unauthorized',
    });
    expect(mockedRefreshAuthToken).not.toHaveBeenCalled();
  });
});

describe('setAuthTokens / clearAuthTokens', () => {
  test('setAuthTokens delega pra função de auth-session.ts', async () => {
    await apiService.setAuthTokens('access-1', 'refresh-1');

    expect(mockedSetAuthTokens).toHaveBeenCalledWith('access-1', 'refresh-1');
  });

  test('clearAuthTokens remove a sessão salva', async () => {
    await saveTokenData({ accessToken: 'access-1', refreshToken: 'refresh-1' });

    await apiService.clearAuthTokens();

    await expect(getStoredTokenData()).resolves.toBeNull();
  });
});

describe('normalizeError', () => {
  test('normaliza um AxiosError', () => {
    const config = buildConfig();
    const error = buildErrorFor(config, 404);

    expect(apiService.normalizeError(error)).toMatchObject({ code: 'not-found' });
  });

  test('normaliza um erro que não é do axios', () => {
    expect(apiService.normalizeError(new Error('boom'))).toMatchObject({
      code: 'unknown',
      message: 'boom',
    });
  });
});
