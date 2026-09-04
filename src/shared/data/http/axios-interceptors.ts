import axios, { AxiosError, AxiosInstance, AxiosResponse, InternalAxiosRequestConfig } from 'axios';

import { API_BASE_URL, HTTP_TIMEOUT_MS } from '../../config/env';
import { clearStoredTokenData, getStoredTokenData } from '../infra/repositories/token-storage-repository';
import { refreshAuthToken, setAuthTokens } from './auth-session';
import { HttpError, toHttpError } from './http-error';

/**
 * Cliente HTTP único do projeto — axios configurado com autenticação
 * automática, renovação de token em 401 (com lock pra evitar corridas, ver
 * `auth-session.ts`) e erro normalizado. Singleton: `ApiService.getInstance()`.
 *
 * Duas escolhas que divergem da referência que veio de outro projeto (vale
 * registrar o porquê, já que o resto do padrão foi seguido à risca):
 * - Rota pública é marcada por requisição (`{ skipAuth: true }`), em vez de
 *   checar a URL (`isAuthRoute`/`url.includes('/auth/signin')`). Checar por
 *   URL faria este arquivo "conhecer" rotas específicas do módulo `auth`, e
 *   quebra se o path mudar; `skipAuth` deixa a decisão explícita em quem
 *   chama.
 * - Erro normalizado é `HttpError` (`./http-error.ts`), não um `AppError`
 *   novo — já cobre os 7 status pedidos (400/401/403/404/422/429/500), com
 *   `fields` (422) e `retryAfter` (429); criar uma segunda classe de erro
 *   ao lado duplicaria o que já existe.
 */
export class ApiService {
  private static instance: ApiService;

  /** Cliente com interceptors — é esse que os `repositories` de cada módulo usam. */
  public readonly client: AxiosInstance;

  /** Callback para sessão inválida (refresh falhou, ou não havia refresh token). Quem decide o que fazer (ex.: navegar pro login) fica fora daqui. */
  private onUnauthorized?: () => void;

  private constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: HTTP_TIMEOUT_MS,
      headers: { Accept: 'application/json' },
    });

    this.setupInterceptors();
  }

  public static getInstance(): ApiService {
    if (!ApiService.instance) {
      ApiService.instance = new ApiService();
    }
    return ApiService.instance;
  }

  /** Registra o callback chamado quando a sessão expira de vez. */
  public setUnauthorizedHandler(cb: () => void): void {
    this.onUnauthorized = cb;
  }

  /** Salva o token de acesso (e o refresh token, se vier) — ex.: depois de um login. */
  public async setAuthTokens(accessToken: string, refreshToken?: string): Promise<void> {
    await setAuthTokens(accessToken, refreshToken);
  }

  /** Limpa a sessão salva (logout). */
  public async clearAuthTokens(): Promise<void> {
    await clearStoredTokenData();
  }

  private setupInterceptors(): void {
    // REQUEST: anexa Authorization
    this.client.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
      if (!config.skipAuth) {
        const stored = await getStoredTokenData();
        if (stored?.accessToken) {
          config.headers.set('Authorization', `Bearer ${stored.accessToken}`);
        }
      }
      return config;
    });

    // RESPONSE: trata erro, refresh e normalização
    this.client.interceptors.response.use(
      (response: AxiosResponse) => response,
      async (error: AxiosError) => {
        const { config } = error;
        const status = error.response?.status;
        const shouldTryRefresh = status === 401 && config && !config.skipAuth && !config._retry;

        if (shouldTryRefresh) {
          config._retry = true;

          const newAccessToken = await refreshAuthToken();
          if (newAccessToken) {
            config.headers.set('Authorization', `Bearer ${newAccessToken}`);
            return this.client.request(config);
          }

          this.onUnauthorized?.();
        }

        return Promise.reject(toHttpError(error));
      },
    );
  }

  /** Normaliza qualquer erro (de dentro ou de fora dos interceptors, ex. num catch manual num repository) para o formato único `HttpError`. */
  public normalizeError(error: unknown): HttpError {
    if (axios.isAxiosError(error)) {
      return toHttpError(error);
    }
    return new HttpError({
      code: 'unknown',
      status: null,
      message: error instanceof Error ? error.message : 'Erro desconhecido',
      cause: error,
    });
  }
}
