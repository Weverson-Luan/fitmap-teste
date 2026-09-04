import { z } from "zod";

import { GENDER_CODES } from "@common/constants/gender";

export const genderSchema = z.enum(GENDER_CODES, {
  required_error: "Selecione o gênero",
  invalid_type_error: "Selecione o gênero",
});
