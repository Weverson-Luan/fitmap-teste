/**
 * IMPORTS
 */

const colors = {
  transparent: "transparent",

  // cor branca
  neutral25: "#FFFFFF",
  neutral50: "#E7EEFF",
  neutral75: "#E5E1F9",
  neutral200: "#C6C6C6",
  neutral300: "#F3F3F3",
  neutral400: "#F4F5F6",
  neutral500: "#EDEDEF", // texto principal

  // cor preta
  black25: "#1E1E1E",
  black75: "#2A2A2A",
  black100: "#121214",
  black150: "#151516", // cor de fundo principal

  // cor azul
  blue_500: "#051C3B",
  blue_300: "#3B82F6",

  // cor zinza
  gray_200: "#29292E", // cor de fundo secundária
  gray_300: "#3E3E42", // cor usado para bordas / outlines
  gray_700: "#7A7A7E", // texto desabilitado / inativo
  gray_800: "#B3B3B7", // texto secundário / muted
  gray_900: "#9CA3AF",

  // cor verde
  green_100: "#38563F",
  green_90: "#4C6752",
  green_80: "#607865",
  green_70: "#748979",
  green_60: "#889A8C",
  green_200: "#19A66A", // cor principal de(botões, destaques)
  green_light_200: "#148B58", // variação mais escura
  green_primary_light: "#2BCB89",
  green_300: "#22C55E", // usado para suceso

  // cor laranja
  orange_60: "#FFF4E0",
  orange_70: "#FBE4D6",
  orange_80: "#F0B795",
  orange_90: "#F6955B",
  orange_100: "#E86B2E",

  // vermelho
  red_900: "#9F0000",

  // amarelo
  yellow_500: "#FBBF24",
};

// Nome de cada fonte = arquivo .ttf correspondente em `src/assets/fonts`
// (linkado nativamente via `react-native.config.js` + `react-native-asset`).
// O mesmo mapeamento existe em `tailwind.config.js` (theme.extend.fontFamily),
// pra uso via `className` (NativeWind) — atualize os dois arquivos juntos.
const fonts = {
  // =====================
  // Montserrat (principal)
  // =====================
  montserrat_thin_100: "Montserrat_100Thin",
  montserrat_regular_400: "Montserrat_400Regular",
  montserrat_medium_500: "Montserrat_500Medium",
  montserrat_semi_bold_600: "Montserrat_600SemiBold",
  montserrat_bold_700: "Montserrat_700Bold",

  // =====================
  // Nunito Sans (textos longos)
  // =====================
  nunito_regular_400: "NunitoSans_400Regular",
  nunito_semi_bold_600: "NunitoSans_600SemiBold",
  nunito_bold_700: "NunitoSans_700Bold",

  // =====================
  // Open Sans (fallback / leitura)
  // =====================
  open_sans_light_300: "OpenSans_300Light",
  open_sans_regular_400: "OpenSans_400Regular",
  open_sans_medium_500: "OpenSans_500Medium",
  open_sans_semi_bold_600: "OpenSans_600SemiBold",
  open_sans_bold_700: "OpenSans_700Bold",

  // =====================
  // Roboto (sistema / Android)
  // =====================
  roboto_regular_400: "Roboto_400Regular",
  roboto_medium_500: "Roboto_500Medium",
  roboto_bold_700: "Roboto_700Bold",
};

const fontSizes = {
  "2xs": 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
  "7xl": 72,
  "8xl": 96,
  "9xl": 128,
};

const paddings = {
  "2xs": 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
  "7xl": 72,
  "8xl": 96,
  "9xl": 128,
};

const margins = {
  "2xs": 10,
  xs: 12,
  sm: 14,
  md: 16,
  lg: 18,
  xl: 20,
  "2xl": 24,
  "3xl": 30,
  "4xl": 36,
  "5xl": 48,
  "6xl": 60,
  "7xl": 72,
  "8xl": 96,
  "9xl": 128,
};

const borderWidths = {
  thin: 1,
  thin_medium: 2,
  thin_bold: 6,
  thick: 4,
  thick_medium: 8,
  thick_bold: 12,
  hairline: 999,
};

const opacity = {
  0: 0,
  5: 0.05,
  10: 0.1,
  20: 0.2,
  25: 0.25,
  30: 0.3,
  40: 0.4,
  50: 0.5,
  60: 0.6,
  70: 0.7,
  75: 0.75,
  80: 0.8,
  90: 0.9,
  95: 0.95,
  100: 1,
};

const shadows = {
  z1: "0px 1px 0px rgba(0, 0, 0, 0.3), 0px 1px 0px 1px rgba(0, 0, 0, 0.15)",
  z2: "0px 1px 2px rgba(0, 0, 0, 0.3)",
};

/**
 * EXPORTSS
 */
export const theme = {
  colors,
  fonts,
  fontSizes,
  paddings,
  margins,
  borderWidths,
  opacity,
  shadows,
};
