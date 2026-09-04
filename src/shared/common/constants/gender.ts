export const GENDER_CODES = ["MASCULINO", "FEMININO", "OUTROS", "NÃO INFORMADO"] as const;

export type GenderCode = (typeof GENDER_CODES)[number];

export type GenderOption = {
  key: GenderCode;
  label: string;
};

export const GENDER_OPTIONS: GenderOption[] = [
  { key: "MASCULINO", label: "Masculino" },
  { key: "FEMININO", label: "Feminino" },
  { key: "OUTROS", label: "Outros" },
  { key: "NÃO INFORMADO", label: "Não informado" },
];
