/**
 * @format
 */

import type { AxiosError } from 'axios';

import {
  mapStatusToErrorCode,
  toHttpError,
} from '../../../../src/shared/data/http/http-error';

function buildAxiosError(overrides: {
  status?: number;
  data?: unknown;
  headers?: Record<string, string>;
  message?: string;
}): AxiosError {
  const { status, data, headers = {}, message = 'Request failed' } = overrides;

  return {
    isAxiosError: true,
    message,
    name: 'AxiosError',
    toJSON: () => ({}),
    response:
      status === undefined
        ? undefined
        : {
            status,
            data,
            headers,
            statusText: '',
            config: {} as AxiosError['config'],
          },
  } as AxiosError;
}

describe('mapStatusToErrorCode', () => {
  test.each([
    [400, 'bad-request'],
    [401, 'unauthorized'],
    [403, 'forbidden'],
    [404, 'not-found'],
    [422, 'validation'],
    [429, 'rate-limited'],
    [500, 'server'],
    [502, 'server'],
    [418, 'unknown'],
  ] as const)('mapeia status %i para %s', (status, expectedCode) => {
    expect(mapStatusToErrorCode(status)).toBe(expectedCode);
  });

  test('mapeia ausência de status (sem resposta) para network', () => {
    expect(mapStatusToErrorCode(undefined)).toBe('network');
  });
});

describe('toHttpError', () => {
  test('normaliza erro 400 sem campos/retryAfter', () => {
    const httpError = toHttpError(buildAxiosError({ status: 400 }));

    expect(httpError.code).toBe('bad-request');
    expect(httpError.status).toBe(400);
    expect(httpError.fields).toBeUndefined();
    expect(httpError.retryAfter).toBeUndefined();
  });

  test('normaliza erro 422 extraindo os erros de validação por campo', () => {
    const httpError = toHttpError(
      buildAxiosError({
        status: 422,
        data: { errors: { email: ['já cadastrado'] } },
      }),
    );

    expect(httpError.code).toBe('validation');
    expect(httpError.fields).toEqual({ email: ['já cadastrado'] });
  });

  test('normaliza erro 429 extraindo o retryAfter do header', () => {
    const httpError = toHttpError(
      buildAxiosError({ status: 429, headers: { 'retry-after': '30' } }),
    );

    expect(httpError.code).toBe('rate-limited');
    expect(httpError.retryAfter).toBe(30);
  });

  test('normaliza erro 500 como server', () => {
    const httpError = toHttpError(buildAxiosError({ status: 500 }));

    expect(httpError.code).toBe('server');
  });

  test('usa a mensagem do backend quando disponível', () => {
    const httpError = toHttpError(
      buildAxiosError({ status: 404, data: { message: 'Recurso não encontrado' } }),
    );

    expect(httpError.message).toBe('Recurso não encontrado');
  });

  test('normaliza erro sem resposta (rede/timeout) como network', () => {
    const httpError = toHttpError(buildAxiosError({ message: 'Network Error' }));

    expect(httpError.code).toBe('network');
    expect(httpError.status).toBeNull();
    expect(httpError.message).toBe('Network Error');
  });
});
