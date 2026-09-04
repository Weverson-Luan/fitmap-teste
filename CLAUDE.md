# CLAUDE.md

Contexto para o Claude Code trabalhar neste repositório. Leia também o [README.md](README.md) (arquitetura completa, com diagramas) e [specs/constitution.md](specs/constitution.md) (regras não-negociáveis do projeto).

## Visão geral do projeto

**FitMap** é um app React Native que conecta **personal trainers** e **alunos**, com descoberta geográfica via mapa. Módulos de negócio: `auth` (signin, recover-password), `students`, `personals`, `map`.

O projeto está em estágio inicial: a estrutura de pastas de `src/` já existe (arquitetura definida), mas a maior parte dos módulos ainda não tem código.

## Comandos

```sh
npm install        # instalar dependências
npm start           # subir o Metro bundler
npm run android      # build + run Android
npm run ios          # build + run iOS (rodar `bundle exec pod install --project-directory=ios` antes, se deps nativas mudaram)
npm run lint          # ESLint
npm test              # Jest
```

Rode `npm run lint` e `npm test` antes de considerar uma tarefa concluída.

## Arquitetura — resumo (ver README.md para os diagramas completos)

Arquitetura **modular em camadas**: cada módulo de negócio vive em `src/modules/<modulo>` e é autocontido; código reaproveitável entre módulos vive em `src/shared`.

Dentro de cada módulo (e em `src/shared`), o padrão de camadas é:

```
<módulo>/
├── data/
│   ├── http/                # cliente HTTP
│   └── infra/repositories/   # implementação de acesso a dados
├── presentation/
│   ├── components/           # UI reutilizável do módulo
│   ├── view-model/            # estado da tela + regra de apresentação
│   └── views/                 # telas (UI declarativa, sem regra de negócio)
└── store/                    # estado local/global do módulo
```

Fluxo de dependência dentro do módulo: `views → view-model → (store | infra/repositories) → http`.

### Regras de fronteira (obrigatórias)

1. **Módulo nunca importa de outro módulo.** `src/modules/personals` não importa nada de `src/modules/students`, e vice-versa. Ambos podem importar de `src/shared`.
2. Se dois módulos precisam se comunicar (ex.: `map` mostrando `students` e `personals`), resolva via `shared/store`, `shared/presentation/routes` (parâmetros de navegação) ou um contrato explícito em `shared/@types` — nunca com import direto entre módulos.
3. **`views` não fala com rede.** Toda chamada de API passa por `data/infra/repositories`, que usa `data/http`. Não faça `fetch`/`axios` direto dentro de uma view ou componente.
4. Regra de negócio e estado de tela ficam na `view-model`, não na view. A view apenas renderiza o que a view-model expõe.
5. Antes de criar algo novo em um módulo, verifique se já existe equivalente em `src/shared` (evita duplicar utilitário, componente, formatação, etc.).

Se uma tarefa exigir violar alguma dessas regras, pare e sinalize o motivo em vez de contornar silenciosamente.

## Convenções de código

- TypeScript em tudo (`.ts`/`.tsx`); evite `any` — prefira tipar via `src/shared/@types` quando o tipo for cross-module.
- Formatação via Prettier (`.prettierrc.js`: aspas simples, `trailingComma: all`, `arrowParens: avoid`) e lint via ESLint (`@react-native/eslint-config`). Não reformate arquivos fora do escopo da tarefa.
- **Arquivos e pastas**: `kebab-case` com a extensão correta, ex. `signin-view.tsx`, `use-signin-view-model.ts`, `auth-repository.ts`. Mesmo um arquivo que exporta um componente React segue esse padrão de nome de arquivo — só o identificador exportado é que vira `PascalCase` (ex. arquivo `signin-view.tsx` exporta `function SigninView()`).
- **Variáveis e funções**: `camelCase`. Funções que buscam/agem sobre dados começam com o verbo: `getAllUser`, `getUserById`, `updateUser`, `deleteUser`. Variáveis que guardam dados de uma entidade usam o sufixo `Data`: `userData`, `studentData`, `personalData`.
- **Hooks**: `camelCase` prefixado com `use` (ex. `useSigninViewModel`).
- Não introduza uma nova biblioteca de estado/HTTP/navegação sem checar o que já está em `package.json` e em `src/shared` — o objetivo é ter uma única forma de fazer cada coisa.
- Ainda não há alias de import configurado em `tsconfig.json` — use imports relativos até que isso seja decidido/configurado; não invente um alias unilateralmente.

## Testes

- Framework: Jest (`@react-native/jest-preset`) + `react-test-renderer`.
- Testes existentes ficam em `__tests__/` na raiz; ao criar teste para um módulo novo, pode colocar em `__tests__/` espelhando o caminho do módulo ou colocalizado (`*.test.tsx` ao lado do arquivo) — mantenha consistência com o que já existir no módulo.
- Priorize testar `view-model` e `infra/repositories` (lógica pura, fácil de mockar) antes de testar `views`.

## Fluxo de Spec-Driven Development (obrigatório para features novas)

Antes de implementar uma feature nova, ou uma mudança relevante em uma existente:

1. Verifique se já existe uma spec em `specs/<nome-da-feature>/`. Se não existir, crie a partir de `specs/_template/` (`requirements.md` → `design.md` → `tasks.md`).
2. Não pule direto para código sem `requirements.md` e `design.md` aprovados/alinhados com quem pediu a feature.
3. Implemente seguindo o `tasks.md` da spec, marcando o progresso.
4. Regras não-negociáveis do projeto (segurança, privacidade de localização, etc.) estão em `specs/constitution.md` — toda spec e toda implementação devem respeitá-las.

Detalhes completos do processo: [specs/README.md](specs/README.md).

## O que evitar

- Não commite chaves de API (Maps SDK, backend) — usar variáveis de ambiente / config nativa (`src/shared/config`), nunca hardcode.
- Não crie um módulo novo em `src/modules` sem antes ter (ou pelo menos esboçar) a spec correspondente em `specs/`.
- Não misture texto em português e inglês de forma inconsistente no mesmo tipo de arquivo — o projeto documenta em PT-BR (README, specs, CLAUDE.md); nomes de código (variáveis, funções, arquivos) em inglês, como é convenção no ecossistema RN/JS.
