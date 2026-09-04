/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./App.tsx', './src/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      // Mesmo nome de string usado em `src/shared/styles/theme/theme.ts` (fonts) —
      // arquivo .ttf correspondente vive em `src/assets/fonts`. Ao adicionar/remover
      // um peso de fonte, atualize os dois arquivos juntos.
      fontFamily: {
        'montserrat-thin': ['Montserrat_100Thin'],
        'montserrat-regular': ['Montserrat_400Regular'],
        'montserrat-medium': ['Montserrat_500Medium'],
        'montserrat-semibold': ['Montserrat_600SemiBold'],
        'montserrat-bold': ['Montserrat_700Bold'],

        'nunito-regular': ['NunitoSans_400Regular'],
        'nunito-semibold': ['NunitoSans_600SemiBold'],
        'nunito-bold': ['NunitoSans_700Bold'],

        'open-sans-light': ['OpenSans_300Light'],
        'open-sans-regular': ['OpenSans_400Regular'],
        'open-sans-medium': ['OpenSans_500Medium'],
        'open-sans-semibold': ['OpenSans_600SemiBold'],
        'open-sans-bold': ['OpenSans_700Bold'],

        'roboto-regular': ['Roboto_400Regular'],
        'roboto-medium': ['Roboto_500Medium'],
        'roboto-bold': ['Roboto_700Bold'],
      },
    },
  },
  plugins: [],
};
