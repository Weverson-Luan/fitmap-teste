/**
 * Configuração de ambiente para o cliente HTTP.
 *
 * TODO: `process.env` não é injetado automaticamente pelo Metro (React
 * Native não é Node — por isso o projeto não tem `@types/node`, de propósito,
 * e este arquivo declara `process` localmente em vez de puxar os tipos de
 * Node inteiros). Isso funciona apenas como placeholder (sempre cai no valor
 * padrão) até o time decidir uma solução de env vars para RN (ex.
 * `react-native-config`, `react-native-dotenv`) — ver riscos em
 * `.specs/shared-http-client/design.md`. Nenhuma chave/segredo deve ser
 * hardcoded aqui (specs/constitution.md, seção 3).
 */
declare const process: { env: Record<string, string | undefined> };

export const API_BASE_URL: string =
  process.env.API_BASE_URL ?? 'https://api.fitmap.dev';

export const HTTP_TIMEOUT_MS = 15000;
