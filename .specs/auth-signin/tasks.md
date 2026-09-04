# Tasks — auth-signin

## Implementação

- [ ] `shared/@types`: definir `UserRole`, `AuthenticatedUser`, `AuthSession` (R4, R7)
- [ ] `modules/auth/data/infra/repositories`: `AuthRepository.signin`, com mapeamento de erro (`invalid-credentials` | `network` | `unknown`) (R1, R3)
- [ ] `modules/auth/presentation/view-model`: `useSigninViewModel` — validação de e-mail client-side, estados idle/loading/error/success (R1, R2, R3, R6)
- [ ] `modules/auth/presentation/views`: `SigninView` — campos e-mail/senha, botão "Entrar" (desabilitado durante loading), link "Esqueci minha senha" (R1, R5, R6)
- [ ] `shared/store`: slice de sessão (`setSession`/`clearSession`) (R7)
- [ ] Avaliar e adicionar lib de storage seguro (ex. `react-native-keychain`) para persistir o token (R7) — depende de alinhamento do time (ver `design.md` → Riscos)
- [ ] `shared/presentation/routes`: redirecionar para stack `student` ou `personal` conforme `session.user.role` (R4)

## Testes

- [ ] `useSigninViewModel`: credenciais válidas (student e personal), credenciais inválidas, e-mail mal formatado, erro de rede (mock do `AuthRepository`)
- [ ] `AuthRepository.signin`: mapeamento de 401 → `invalid-credentials`, timeout/sem rede → `network` (mock do `http`)

## Qualidade

- [ ] `npm run lint` sem erros
- [ ] `npm test` sem erros
- [ ] Todos os estados de UI do `design.md` implementados
- [ ] Acessibilidade: `accessibilityLabel` nos campos, `accessibilityState` no botão desabilitado

## Revisão

- [ ] Implementação confere com `requirements.md` (todos os cenários de aceite cobertos)
- [ ] Nenhuma regra de `specs/constitution.md` violada sem justificativa registrada em `design.md`
- [ ] Confirmado com backend que a mensagem de erro de credenciais não distingue "e-mail inexistente" de "senha errada" (ver `design.md` → Riscos)
