import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Persistência do token de sessão em disco via `AsyncStorage`.
 *
 * ATENÇÃO — decisão registrada em `.specs/shared-http-client/design.md` →
 * Riscos: isso é `AsyncStorage` puro, não storage seguro (Keychain/Keystore).
 * A spec `auth-signin` (requisito não-funcional de segurança) pede storage
 * seguro para o token de sessão; usar `AsyncStorage` aqui foi uma decisão
 * consciente e temporária para destravar a integração agora. Trocar por
 * `react-native-keychain` (ou equivalente) antes de ir para produção — a
 * troca fica isolada neste arquivo, sem afetar quem o consome.
 *
 * Nunca logar `accessToken`/`refreshToken` (nem aqui, nem em quem chama).
 */

const ACCESS_TOKEN_KEY = '@fitmap:access_token';
const REFRESH_TOKEN_KEY = '@fitmap:refresh_token';

export interface StoredTokenData {
  accessToken: string;
  refreshToken: string;
}

/**
 * @returns o par de tokens salvo, ou `null` se não houver os dois (um
 * access token sem refresh token não serve pra reidratar sessão — sem
 * refresh token não dá pra renovar quando ele expirar).
 */
export async function getStoredTokenData(): Promise<StoredTokenData | null> {
  const stored = await AsyncStorage.getMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  const accessToken = stored[ACCESS_TOKEN_KEY];
  const refreshToken = stored[REFRESH_TOKEN_KEY];

  if (!accessToken || !refreshToken) {
    return null;
  }

  return { accessToken, refreshToken };
}

export async function saveTokenData(tokenData: StoredTokenData): Promise<void> {
  try {
    await AsyncStorage.setMany({
      [ACCESS_TOKEN_KEY]: tokenData.accessToken,
      [REFRESH_TOKEN_KEY]: tokenData.refreshToken,
    });
  } catch (error) {
    console.warn('[token-storage-repository] Falha ao persistir o token de sessão.', error);
  }
}

export async function clearStoredTokenData(): Promise<void> {
  try {
    await AsyncStorage.removeMany([ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY]);
  } catch (error) {
    console.warn(
      '[token-storage-repository] Falha ao limpar o token de sessão persistido.',
      error,
    );
  }
}
