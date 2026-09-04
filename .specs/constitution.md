# Constituição do projeto FitMap

Regras não-negociáveis. Toda spec (`specs/*/design.md`) e toda implementação devem respeitar isto; se um requisito conflitar com uma regra abaixo, a regra vence — e o conflito deve ser explicitado na spec, não resolvido silenciosamente no código.

## 1. Fronteiras de arquitetura

- Um módulo em `src/modules` nunca importa de outro módulo em `src/modules`; apenas de `src/shared`.
- `views` não fala com rede diretamente — toda chamada de API passa por `data/infra/repositories`, que usa `data/http`.
- Regra de negócio e estado de tela vivem na `view-model`, não na view.

Detalhes e diagramas: [README.md](../README.md).

## 2. Privacidade e dados sensíveis

- O app lida com **localização** (mapa) e **dados pessoais de alunos e personal trainers** — trate como dados sensíveis por padrão.
- Localização só é coletada/exibida com consentimento explícito do usuário; nunca compartilhe localização exata de um usuário com outro sem uma ação explícita dele autorizando isso.
- Não logue (`console.log`, crash reporter, analytics) dados pessoais identificáveis (nome completo, e-mail, telefone, localização) em texto plano.

## 3. Segredos e configuração

- Chaves de API (Maps SDK, backend, etc.) nunca são commitadas no repositório. Ficam em variável de ambiente / config nativa, acessadas via `src/shared/config`.
- Nenhuma credencial hardcoded em código-fonte, em nenhuma branch.

## 4. Qualidade

- `npm run lint` e `npm test` passam sem erros antes de qualquer merge na `main`.
- Lógica de negócio (`view-model`, `infra/repositories`) tem teste automatizado; UI pura (`views`) é opcional, mas recomendado pelo menos smoke test.
- Sem `any` em TypeScript sem justificativa comentada no código.

## 5. Acessibilidade

- Toda tela nova tem `accessibilityLabel`/`accessibilityRole` nos elementos interativos (botões, campos de formulário, mapa).
- Contraste mínimo de texto segue as diretrizes WCAG AA.

## 6. Processo

- Feature nova = spec primeiro (`requirements.md` → `design.md` → `tasks.md`), código depois. Ver [specs/README.md](README.md).
- Mudança que quebra uma regra desta constituição precisa ser justificada explicitamente na spec (seção "Riscos" do `design.md`) e aprovada por quem revisa, não decidida unilateralmente por quem implementa (humano ou agente de IA).
