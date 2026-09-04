import type { AxiosError } from 'axios';

/**
 * Erro de rede/HTTP já normalizado pelo `ApiService` (ver `axios-interceptors.ts`).
 * Repositórios de qualquer módulo recebem esse formato em vez do erro cru do
 * axios — o mapeamento para um erro de domínio específico (ex.: `AuthError`
 * com `kind: 'invalid-credentials'`) continua sendo responsabilidade de cada
 * `repository`, não deste arquivo.
 */
export type HttpErrorCode =
  | 'bad-request' // 400
  | 'unauthorized' // 401 (sem sessão válida, refresh falhou ou não existe)
  | 'forbidden' // 403
  | 'not-found' // 404
  | 'validation' // 422
  | 'rate-limited' // 429
  | 'server' // 500+
  | 'network' // sem resposta do servidor (timeout, sem conexão)
  | 'unknown'; // qualquer outro status não mapeado

interface HttpErrorParams {
  code: HttpErrorCode;
  status: number | null;
  message: string;
  fields?: Record<string, string[]>;
  retryAfter?: number;
  cause: unknown;
}

/**
 * Estende `Error` (em vez de ser só um objeto solto) para se comportar como
 * qualquer erro JS — `instanceof HttpError`, stack trace, funciona com
 * `throw`/`try/catch` — mesmo sendo entregue via rejeição de Promise pelo
 * interceptor de resposta do `httpClient`.
 */
export class HttpError extends Error {
  readonly code: HttpErrorCode;
  readonly status: number | null;
  /** Erros de validação por campo, quando o backend os retorna (422). */
  readonly fields?: Record<string, string[]>;
  /** Segundos sugeridos de espera antes de tentar de novo (429). */
  readonly retryAfter?: number;
  /** Erro original (axios), para debug — nunca deve ser logado com dados sensíveis. */
  readonly cause: unknown;

  constructor(params: HttpErrorParams) {
    super(params.message);
    this.name = 'HttpError';
    this.code = params.code;
    this.status = params.status;
    this.fields = params.fields;
    this.retryAfter = params.retryAfter;
    this.cause = params.cause;
  }
}

const STATUS_TO_CODE: Record<number, HttpErrorCode> = {
  400: 'bad-request',
  401: 'unauthorized',
  403: 'forbidden',
  404: 'not-found',
  422: 'validation',
  429: 'rate-limited',
};

export function mapStatusToErrorCode(status: number | undefined): HttpErrorCode {
  if (!status) {
    return 'network';
  }
  if (STATUS_TO_CODE[status]) {
    return STATUS_TO_CODE[status];
  }
  if (status >= 500) {
    return 'server';
  }
  return 'unknown';
}

function extractValidationFields(data: unknown): Record<string, string[]> | undefined {
  if (typeof data !== 'object' || data === null || !('errors' in data)) {
    return undefined;
  }

  const { errors } = data as { errors: unknown };
  if (typeof errors !== 'object' || errors === null) {
    return undefined;
  }

  return errors as Record<string, string[]>;
}

function extractRetryAfter(error: AxiosError): number | undefined {
  const headerValue = error.response?.headers?.['retry-after'];
  const retryAfter = Number(headerValue);
  return Number.isFinite(retryAfter) ? retryAfter : undefined;
}

function extractMessage(error: AxiosError, code: HttpErrorCode): string {
  const data = error.response?.data as { message?: unknown } | undefined;
  if (data && typeof data.message === 'string') {
    return data.message;
  }
  return error.message || code;
}

export function toHttpError(error: AxiosError): HttpError {
  const status = error.response?.status;
  const code = mapStatusToErrorCode(status);

  return new HttpError({
    code,
    status: status ?? null,
    message: extractMessage(error, code),
    cause: error,
    fields: code === 'validation' ? extractValidationFields(error.response?.data) : undefined,
    retryAfter: code === 'rate-limited' ? extractRetryAfter(error) : undefined,
  });
}
