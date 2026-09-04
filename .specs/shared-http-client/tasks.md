# Tasks — shared-http-client

## Implementação

- [x] `package.json`: adicionar `axios` e `@react-native-async-storage/async-storage` como dependências (R1, R10) — decisão de usar `AsyncStorage` (não storage seguro) confirmada nesta conversa, ver `design.md` → Riscos
- [x] `shared/config/env.ts`: `API_BASE_URL`, `HTTP_TIMEOUT_MS` (R1)
- [x] `shared/@types/axios.d.ts`: module augmentation de `AxiosRequestConfig` (`skipAuth`, `_retry`) — precisa de `export {}` no topo (ver `design.md` → Riscos, pegadinha de TS)
- [x] `shared/data/http/http-error.ts`: `HttpErrorCode`, classe `HttpError`, `mapStatusToErrorCode`, `toHttpError` — mapeamento de 400/401/403/404/422/429/500+/network/unknown (R7, R8, R9)
- [x] `shared/data/infra/repositories/token-storage-repository.ts`: `getStoredTokenData`/`saveTokenData`/`clearStoredTokenData` sobre `AsyncStorage` (R10)
- [x] `shared/data/http/auth-session.ts`: `refreshAuthToken` (single-flight, `bareHttpClient` próprio, sem os interceptors do cliente principal) e `setAuthTokens` (R4, R6, R10)
- [x] `shared/data/http/axios-interceptors.ts`: classe `ApiService` (singleton) — `client`, interceptors de request (`skipAuth`) e response (401 → `refreshAuthToken` → retry único; demais status → `HttpError`), `setAuthTokens` (delega pra `auth-session.ts`), `clearAuthTokens`, `setUnauthorizedHandler`, `normalizeError` (R1, R2, R3, R5, R7, R11, R12)
- [x] `jest.config.js`/`jest.setup.js`: mock oficial do `AsyncStorage` + `transformIgnorePatterns` ampliado para o build ESM da lib
- [x] Sem `index.ts`/barrel em `data/http` nem em `data/infra/repositories` — decisão explícita de quem pediu a feature; cada consumidor importa direto do arquivo (ex.: `from '.../token-storage-repository'`)

## Refatoração (durante a sessão, a pedido de quem implementa)

- [x] Trocado o desenho inicial (módulos funcionais `auth-token-store.ts`/`refresh-session.ts` + cache em memória + pub/sub de persistência) pela classe singleton `ApiService`, sem cache em memória — leitura direta do `AsyncStorage` a cada requisição
- [x] Arquivo do cliente HTTP renomeado de `http-client.ts` para `axios-interceptors.ts`
- [x] Removidos `auth-token-store.ts`, `refresh-session.ts`, `auth-token-persistence-repository.ts` e os `index.ts` de barrel (lógica absorvida por `ApiService`/já coberta por `token-storage-repository.ts`)
- [x] Extraídos `refreshAuthToken`/`setAuthTokens` de dentro de `ApiService` para `auth-session.ts` (arquivo próprio); `ApiService` importa e usa
- [x] Movida a module augmentation `skipAuth`/`_retry` de dentro de `axios-interceptors.ts` para `shared/@types/axios.d.ts` (tipos TS globais ficam em `@types`, por convenção do projeto)

## Testes

- [x] `http-error`: `mapStatusToErrorCode` para 400/401/403/404/422/429/500/502/network/status desconhecido; `toHttpError` populando `fields` (422) e `retryAfter` (429)
- [x] `token-storage-repository`: `getStoredTokenData` sem dado salvo, com par completo, com apenas um dos dois tokens (retorna `null`); `clearStoredTokenData` remove os dois
- [x] `auth-session`: `setAuthTokens` salva/mantém refresh token anterior/não persiste sem refresh token nenhum; `refreshAuthToken` sem refresh token salvo, sucesso (persiste e retorna novo access token), mantém refresh token anterior se a resposta não trouxer um novo, endpoint falhando limpa a sessão, chamadas concorrentes compartilham a mesma renovação (single-flight)
- [x] `axios-interceptors` (`ApiService`): injeta `Authorization` quando há token salvo e a rota não é `skipAuth`; não injeta quando `skipAuth` ou sem token; 401 dispara `refreshAuthToken` (mockado) e reexecuta a requisição original; 401 com renovação malsucedida rejeita como `unauthorized` e chama `setUnauthorizedHandler`; 401 numa requisição já reexecutada não tenta refresh de novo; 401 em rota `skipAuth` não tenta refresh; `setAuthTokens` delega pra `auth-session.ts`; `clearAuthTokens` limpa a sessão salva; `normalizeError` cobre erro do axios e erro genérico

## Qualidade

- [x] `npm run lint` sem erros
- [x] `npm test` sem erros
- [x] Nenhum `any` sem justificativa comentada
- [ ] `bundle exec pod install --project-directory=ios` — pendente (dependência nativa nova, `@react-native-async-storage/async-storage`; não rodado nesta sessão, precisa ser feito antes de buildar iOS)

## Revisão

- [x] Implementação confere com `requirements.md`
- [x] Riscos do `design.md` (contrato de refresh, formato de 422, env vars, `AsyncStorage` vs storage seguro, `AsyncStorage` por requisição, `http → infra/repositories`, pegadinha do `export {}` em `@types/axios.d.ts`) permanecem documentados e não bloqueiam o restante do time
- [x] Nenhuma regra de `specs/constitution.md` violada sem justificativa registrada em `design.md` — a única tensão real (storage seguro do token) foi discutida e a decisão de usar `AsyncStorage` por ora foi confirmada explicitamente por quem pediu a feature, não decidida unilateralmente
