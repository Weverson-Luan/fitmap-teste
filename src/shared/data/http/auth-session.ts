import axios from 'axios';

import { API_BASE_URL, HTTP_TIMEOUT_MS } from '../../config/env';
import {
  clearStoredTokenData,
  getStoredTokenData,
  saveTokenData,
} from '../infra/repositories/token-storage-repository';

const REFRESH_PATH = '/auth/refresh';

interface RefreshResponseBody {
  accessToken: string;
  refreshToken?: string;
}

/**
 * Instância isolada, sem os interceptors do `ApiService.client`
 * (`axios-interceptors.ts`) — se o refresh usasse o cliente principal, um
 * 401 na própria chamada de refresh entraria em loop tentando se renovar de
 * novo.
 *
 * Contrato do endpoint assumido (backend real ainda não existe — ver
 * `.specs/shared-http-client/design.md` → Riscos):
 *   POST /auth/refresh { refreshToken } -> { accessToken, refreshToken? }
 */
const bareHttpClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: HTTP_TIMEOUT_MS,
  headers: { Accept: 'application/json' },
});

let refreshPromise: Promise<string | null> | null = null;

/**
 * Renova o token de acesso. Se várias requisições chamarem isso ao mesmo
 * tempo (várias caindo em 401 juntas), todas compartilham a mesma renovação
 * em andamento (single-flight) — evita múltiplas chamadas simultâneas ao
 * endpoint de refresh.
 *
 * @returns o novo access token, ou `null` se a renovação não foi possível
 * (sem refresh token salvo, ou o refresh falhou — nesses casos os tokens já
 * ficam limpos do storage).
 */
export function refreshAuthToken(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = performRefresh().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function performRefresh(): Promise<string | null> {
  const stored = await getStoredTokenData();
  if (!stored?.refreshToken) {
    await clearStoredTokenData();
    return null;
  }

  try {
    const { data } = await bareHttpClient.post<RefreshResponseBody>(REFRESH_PATH, {
      refreshToken: stored.refreshToken,
    });

    if (!data.accessToken) {
      await clearStoredTokenData();
      return null;
    }

    await saveTokenData({
      accessToken: data.accessToken,
      refreshToken: data.refreshToken ?? stored.refreshToken,
    });

    return data.accessToken;
  } catch {
    await clearStoredTokenData();
    return null;
  }
}

/** Salva o token de acesso (e o refresh token, se vier) — ex.: depois de um login. */
export async function setAuthTokens(accessToken: string, refreshToken?: string): Promise<void> {
  const existing = await getStoredTokenData();
  const nextRefreshToken = refreshToken ?? existing?.refreshToken;
  if (!nextRefreshToken) {
    // sem refresh token não há o que persistir de forma útil (não dá pra
    // renovar depois que o access token expirar).
    return;
  }
  await saveTokenData({ accessToken, refreshToken: nextRefreshToken });
}
