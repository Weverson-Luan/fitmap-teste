# Tasks — shared-styling-setup

## Implementação — fontes

- [x] Remover `src/shared/common/fonts/` (único ponto com `@expo-google-fonts/*`) (R1)
- [x] `src/assets/fonts/`: adicionar os 16 `.ttf` estáticos (Montserrat 100/400/500/600/700, NunitoSans 400/600/700, OpenSans 300/400/500/600/700, Roboto 400/500/700), nome de arquivo = `fontFamily` de `theme.ts` (R2)
- [x] `src/assets/fonts/OFL.txt`: licença consolidada (SIL OFL 1.1) das 4 famílias (R4)
- [x] `react-native.config.js` (raiz): `assets: ['./src/assets/fonts']` (R3)
- [x] `package.json`: `react-native-asset` como devDependency (ferramenta de link) (R3)
- [x] Rodar `npx react-native-asset` — copia pra `android/app/src/main/assets/fonts` e atualiza `Info.plist`/Xcode do iOS (R3)

## Implementação — NativeWind

- [x] `package.json`: `nativewind`, `react-native-reanimated`, `react-native-worklets` (dependencies); `tailwindcss` (devDependency) (R5)
- [x] `babel.config.js`: preset `nativewind/babel` + plugin `react-native-worklets/plugin` (último da lista) (R5)
- [x] `metro.config.js`: `withNativeWind(config, { input: './src/shared/styles/global.css' })` (R5)
- [x] `src/shared/styles/global.css`: diretivas `@tailwind base/components/utilities` (R5)
- [x] `tailwind.config.js` (raiz): `content` cobrindo `src/**` + `App.tsx`, preset `nativewind/preset`, `theme.extend.fontFamily` com as 16 fontes (R5, R6, R7)
- [x] `nativewind-env.d.ts` (raiz): `/// <reference types="nativewind/types" />` (R5)
- [x] `App.tsx`: `import './src/shared/styles/global.css'` no topo do arquivo (R5)
- [x] `jest.config.js`: `moduleNameMapper` pra `.css` (mock em `jest/css-mock.js`) + `transformIgnorePatterns` ampliado pra `react-native-css-interop` — descoberto rodando `npm test` depois de importar `global.css` em `App.tsx` (R5)

## Qualidade

- [x] `npm install`
- [x] `bundle exec pod install --project-directory=ios` — rodado nesta sessão (Reanimated/Worklets/AsyncStorage/safe-area-context autolinkados; 90 dependências, 89 pods instalados)
- [x] `npm run lint` sem erros
- [x] `npm test` sem erros
- [x] Nenhum `any` sem justificativa comentada

## Revisão

- [x] Nenhuma ocorrência de `expo`/`@expo-google-fonts` restante em `src/` (R1)
- [x] Implementação confere com `requirements.md`
- [x] Riscos do `design.md` (Tailwind v3 travado, Reanimated exige New Architecture, ordem do `worklets/plugin`, pod install pendente, fontFamily duplicado entre `theme.ts`/`tailwind.config.js`) permanecem documentados e não bloqueiam o restante do time
- [x] Nenhuma regra de `specs/constitution.md` violada sem justificativa registrada em `design.md`
