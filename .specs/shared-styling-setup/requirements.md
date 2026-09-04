# Requirements — shared-styling-setup

## Contexto

O app é React Native CLI puro (bare, sem Expo) — mas `src/shared/common/fonts/index.ts` importava as fontes do projeto via `@expo-google-fonts/*`, um pacote pensado para o `expo-font`/`useFonts()` do Expo. Esses pacotes nunca chegaram a entrar no `package.json` nem no `node_modules`: o arquivo já nascia quebrado (import que não resolve) e não era usado em lugar nenhum (`fontAssets` não tinha nenhum import). Além disso, o projeto ainda não tem nenhuma forma de estilização além de `StyleSheet` + `theme.ts` manual — sem Tailwind/NativeWind configurado.

Esta spec resolve as duas coisas juntas, como uma única peça de infraestrutura de `shared`: (1) tirar o resquício de Expo de `shared/common` e linkar as fontes do jeito bare-RN (arquivos `.ttf` estáticos + linking nativo), e (2) configurar o NativeWind (Tailwind CSS para RN) no projeto, já preparado para usar essas fontes via `className`.

## User stories

- Como **desenvolvedor de qualquer módulo** (`auth`, `students`, `personals`, `map`), eu quero estilizar componentes com `className` (Tailwind/NativeWind), para escrever menos `StyleSheet.create` repetitivo.
- Como **desenvolvedor de qualquer módulo**, eu quero que as fontes já definidas em `theme.ts` (`Montserrat_400Regular`, `Roboto_500Medium`, etc.) funcionem de verdade no app (Android e iOS), sem depender de um pacote Expo que nunca foi instalado.
- Como **mantenedor do projeto**, eu quero que `src/shared/common` não tenha mais nenhuma referência a Expo, já que o projeto é bare React Native CLI (tem pastas nativas `android/`/`ios/` e usa `@react-native-community/cli`).

## Requisitos funcionais

1. O sistema NÃO DEVE ter nenhum import de pacote `expo`/`@expo-google-fonts/*`/`expo-font` em `src/shared` (nem no restante do projeto).
2. O sistema DEVE expor os arquivos de fonte (`.ttf`) usados hoje por `theme.ts` (`Montserrat` 100/400/500/600/700, `NunitoSans` 400/600/700, `OpenSans` 300/400/500/600/700, `Roboto` 400/500/700) como assets estáticos versionados no repositório, com o nome de arquivo igual ao `fontFamily` já usado em `theme.ts` (ex.: `Montserrat_400Regular.ttf`), para não quebrar nenhum código que já referencia `theme.fonts.*`.
3. O sistema DEVE linkar essas fontes nativamente (Android e iOS), de forma que `fontFamily: theme.fonts.montserrat_regular_400` funcione em qualquer `Text` do app, nas duas plataformas.
4. O sistema DEVE incluir o texto da licença das fontes (SIL Open Font License 1.1) junto dos arquivos, já que são redistribuídas dentro do repositório.
5. O sistema DEVE ter o NativeWind configurado (babel, metro, `tailwind.config.js`, CSS global) de forma que `className` funcione em componentes React Native do app, em qualquer módulo.
6. O sistema DEVE ter um `content` no `tailwind.config.js` que cubra todo `src/**` (e `App.tsx`), para que classes usadas em qualquer módulo/`shared` sejam geradas.
7. O sistema PODE (nice-to-have, não obrigatório nesta spec) expor as fontes customizadas como utilitário Tailwind (`font-montserrat-regular`, etc.) — mapeamento simples de string, sem migrar o restante do design system (`colors`, `spacing`) para dentro do Tailwind.

## Requisitos não-funcionais

- Compatibilidade: a versão do NativeWind/Tailwind escolhida precisa suportar React Native 0.87 com New Architecture (já ativa no projeto) — ver `design.md` para a decisão de versão.
- Licenciamento: fontes redistribuídas respeitam a licença original (SIL OFL 1.1); nenhuma fonte paga/proprietária é adicionada sem licença compatível com redistribuição.
- Qualidade: `npm run lint` e `npm test` continuam passando sem erro depois da mudança (regra da constituição, seção 4).
- Não introduzir uma segunda forma de estilizar concorrente com a atual — `theme.ts`/`StyleSheet` continuam existindo; NativeWind é adicionado como opção, não substitui nada nesta spec (migração de componentes existentes para `className`, se um dia acontecer, é decisão separada).

## Critérios de aceite

### Cenário: nenhum resquício de Expo

- **Dado** o repositório depois desta mudança
- **Quando** se busca por `expo`/`@expo-google-fonts` em `src/`
- **Então** não há nenhuma ocorrência de import ou dependência de pacote Expo

### Cenário: fonte customizada renderiza no Android

- **Dado** o app buildado para Android depois do link nativo das fontes
- **Quando** um `Text` usa `fontFamily: 'Montserrat_700Bold'` (ou `theme.fonts.montserrat_bold_700`)
- **Então** o texto renderiza com a fonte Montserrat Bold, não a fonte padrão do sistema

### Cenário: fonte customizada renderiza no iOS

- **Dado** o app buildado para iOS depois do link nativo das fontes (`pod install` rodado)
- **Quando** um `Text` usa `fontFamily: 'Montserrat_700Bold'`
- **Então** o texto renderiza com a fonte Montserrat Bold, não a fonte padrão do sistema

### Cenário: NativeWind aplica estilo via `className`

- **Dado** o NativeWind configurado (babel + metro + `tailwind.config.js` + `global.css` importado em `App.tsx`)
- **Quando** um componente usa `<View className="flex-1 items-center bg-white" />`
- **Então** o componente renderiza com esses estilos aplicados (equivalente ao `StyleSheet` correspondente)

### Cenário: `className` funciona em qualquer módulo, não só em `shared`

- **Dado** o `content` do `tailwind.config.js` cobrindo `src/**/*.{js,jsx,ts,tsx}`
- **Quando** um componente novo em `src/modules/<qualquer-módulo>` usa `className`
- **Então** as classes usadas nesse arquivo são reconhecidas/geradas pelo Tailwind (não só as usadas dentro de `shared`)

## Fora de escopo

- Migrar `theme.ts` (`colors`, `fontSizes`, `paddings`, etc.) para dentro do `theme.extend` do `tailwind.config.js` — mapeamento de fontFamily fica isolado e simples; unificar todo o design system com o Tailwind é uma decisão maior, separada, para uma spec própria se o time optar por isso.
- Migrar componentes/views já existentes de `StyleSheet` para `className` — nesta spec o NativeWind só fica disponível, não é adotado retroativamente em nenhuma tela.
- `prettier-plugin-tailwindcss` (ordenação automática de classes) — decisão registrada em `design.md` → Riscos (exigiria subir o Prettier de 2.x para 3.x, fora de escopo aqui).
- Pesos de fonte além dos já usados em `theme.ts` hoje (ex.: `Montserrat_800ExtraBold`) — adicionar um peso novo é só repetir o processo desta spec (baixar o `.ttf`, colocar em `src/assets/fonts`, rodar o link), não precisa de spec nova.
- Storage seguro, HTTP, ou qualquer outra camada — esta spec toca só em fontes + NativeWind.
