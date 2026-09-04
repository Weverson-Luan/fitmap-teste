# Requirements — shared-http-client

## Contexto

O projeto ainda não tem um cliente HTTP configurado — `src/shared/data/http` existe como pasta, mas está vazio. A spec `auth-signin` já assume um "cliente HTTP existente, reaproveitado"; esta spec entrega essa peça de infraestrutura compartilhada: um axios configurado com autenticação automática, renovação de token e tratamento padronizado de erro, para que nenhum `repository` de nenhum módulo precise reimplementar essa lógica.

## User stories

- Como **desenvolvedor de um módulo de negócio** (auth, students, personals, map), eu quero que o cliente HTTP compartilhado envie o token de autenticação automaticamente, para não precisar montar o header `Authorization` em cada repositório.
- Como **usuário autenticado**, eu quero que uma expiração de token de acesso seja renovada de forma transparente (quando possível), para não ser deslogado no meio do uso por um 401 de token expirado.
- Como **desenvolvedor de um `repository`**, eu quero receber erros de API já normalizados por tipo (não só o status HTTP cru), para escrever menos tratamento de erro repetido em cada módulo.

## Requisitos funcionais

1. O sistema DEVE expor um cliente HTTP único e configurado (`src/shared/data/http`), reaproveitável por todos os módulos via `data/infra/repositories`.
2. O sistema DEVE permitir setar o token de acesso (e opcionalmente o refresh token) uma única vez (ex.: após login) e aplicá-lo automaticamente em todas as requisições seguintes, sem repassá-lo manualmente por chamada.
3. O sistema DEVE permitir marcar uma requisição específica para não receber o header de autenticação (ex.: `signin`, `refresh`), quando a rota é pública.
4. O sistema DEVE, ao receber um erro HTTP 401 numa requisição autenticada (não marcada como pública), tentar renovar o token de acesso via refresh token e reexecutar a requisição original uma única vez.
5. O sistema DEVE, se a renovação falhar (refresh token ausente, expirado ou inválido), limpar os tokens armazenados e notificar o restante da aplicação de que a sessão expirou (via callback/evento) — sem decidir sozinho para onde navegar.
6. O sistema DEVE evitar múltiplas chamadas de refresh simultâneas quando várias requisições falham com 401 ao mesmo tempo (uma única renovação em andamento é compartilhada pelas demais).
7. O sistema DEVE normalizar todo erro de resposta HTTP em um formato único (`HttpError`), mapeando os status 400, 401, 403, 404, 422, 429 e 500(+) para um código de erro de domínio (`bad-request`, `unauthorized`, `forbidden`, `not-found`, `validation`, `rate-limited`, `server`), além de `network` (sem resposta) e `unknown` (qualquer outro status).
8. O sistema DEVE, para erro 422, expor os erros de validação por campo quando o backend os retornar (`fields`).
9. O sistema DEVE, para erro 429, expor o tempo de espera sugerido (`retryAfter`) quando o backend o retornar (header `Retry-After`).
10. O sistema DEVE persistir o token de acesso/refresh em disco, para que o usuário não precise logar de novo a cada abertura do app — e ler sempre dessa persistência (sem cache próprio em memória), para que "persistir" e "estar disponível pro cliente HTTP" sejam a mesma coisa, sem passo extra de reidratação no boot do app.
11. O sistema DEVE manter uma única forma de gerenciar sessão/token: a classe `ApiService` (`ApiService.getInstance()`), que concentra cliente HTTP, autenticação automática, refresh e acesso à persistência — sem um módulo de estado em memória separado.
12. O sistema DEVE permitir registrar um único callback para o evento de "sessão expirou" (`setUnauthorizedHandler`) — quem decide o que fazer com isso (ex. navegar pro login) fica fora de `shared/data/http`.

## Requisitos não-funcionais

- Segurança: token de acesso/refresh nunca é logado (`console.log`) em texto plano; nenhuma URL/base da API fica hardcoded no código — vem de `src/shared/config`.
- Segurança (decisão registrada, ver `design.md` → Riscos): o requisito 10 usa `AsyncStorage` puro, não storage seguro (Keychain/Keystore) — decisão consciente e temporária, aceita explicitamente para destravar a integração agora. A spec `auth-signin` pede storage seguro para o token; migrar para `react-native-keychain` (ou equivalente) antes de produção.
- Arquitetura: o cliente HTTP não conhece `view`/navegação (regra de fronteira do projeto) — expiração de sessão é só um callback; quem decide o que fazer (ex. redirecionar pro login) é código fora de `shared/data/http`.
- Confiabilidade: uma requisição nunca entra em loop infinito de retry por 401 (no máximo uma tentativa de renovação por requisição original).

## Critérios de aceite

### Cenário: requisição autenticada automaticamente

- **Dado** um token de acesso setado via `setAuthTokens`
- **Quando** qualquer repositório faz uma requisição pelo cliente HTTP compartilhado sem passar header manualmente
- **Então** a requisição sai com `Authorization: Bearer <token>`

### Cenário: rota pública não recebe token

- **Dado** uma requisição marcada como pública (`skipAuth`)
- **Quando** ela é disparada, mesmo com um token setado
- **Então** ela sai sem o header `Authorization`

### Cenário: token expirado é renovado de forma transparente

- **Dado** uma requisição autenticada que falha com 401
- **Quando** existe um refresh token válido
- **Então** o sistema renova o token, reenvia a requisição original com o novo token, e quem chamou recebe a resposta normalmente, sem perceber que houve um refresh

### Cenário: renovação falha

- **Dado** uma requisição autenticada que falha com 401
- **Quando** a renovação também falha (ou não há refresh token)
- **Então** o sistema limpa os tokens, notifica "sessão expirada" e rejeita a chamada original com um `HttpError` de código `unauthorized`

### Cenário: erro de validação (422)

- **Dado** uma requisição que falha com 422 e corpo `{ errors: { email: ["já cadastrado"] } }`
- **Quando** o erro é normalizado
- **Então** o `HttpError` resultante tem `code: 'validation'` e `fields.email = ["já cadastrado"]`

### Cenário: limite de requisições (429)

- **Dado** uma requisição que falha com 429 e header `Retry-After: 30`
- **Quando** o erro é normalizado
- **Então** o `HttpError` resultante tem `code: 'rate-limited'` e `retryAfter: 30`

### Cenário: erro de servidor (500)

- **Dado** uma requisição que falha com 500
- **Quando** o erro é normalizado
- **Então** o `HttpError` resultante tem `code: 'server'`, sem tentativa de refresh

### Cenário: sem conexão de rede

- **Dado** uma requisição sem resposta do servidor (timeout, sem rede)
- **Quando** o erro é normalizado
- **Então** o `HttpError` resultante tem `code: 'network'` e `status: null`

### Cenário: sessão persiste entre reinícios do app

- **Dado** um login anterior que salvou tokens em disco
- **Quando** o app reabre e uma requisição autenticada é feita
- **Então** o `ApiService` envia `Authorization` automaticamente (lida direto do disco), sem exigir novo login e sem nenhum passo de restauração à parte

### Cenário: logout limpa a sessão persistida

- **Dado** uma sessão ativa (tokens salvos)
- **Quando** `clearAuthTokens()` é chamado (logout, ou renovação que falhou)
- **Então** o disco é limpo — reabrir o app não restaura mais essa sessão

## Fora de escopo

- Storage seguro (Keychain/Keystore) para o token — ver decisão e trade-off aceito em `design.md` → Riscos; migração fica para quando o time priorizar.
- Persistência de outros dados de sessão (ex.: dados do usuário logado) — o requisito 10 cobre só os tokens; `AuthenticatedUser`/sessão completa continuam pendência da spec `auth-signin`.
- Solução definitiva de variáveis de ambiente para React Native (`react-native-config` ou equivalente) — `src/shared/config` expõe por ora um placeholder; adotar uma lib é decisão separada.
- Retry automático de erros transitórios (5xx, timeout) que não sejam 401 — só normalizamos o erro, não tentamos de novo sozinhos.
- Mapeamento de erro para mensagem de usuário final — fica na `view-model` de cada módulo consumidor, como já estabelecido em `auth-signin`.
- Múltiplos listeners para "sessão expirou" — `setUnauthorizedHandler` guarda um único callback (o mais novo substitui o anterior); vira pub/sub só se surgir um segundo consumidor real.
