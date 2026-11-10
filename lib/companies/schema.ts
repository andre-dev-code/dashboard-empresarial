import { z } from "zod";

import { isValidCnpj } from "@/lib/cnpj";

export const companySchema = z.object({
  cnpj: z.string().refine(isValidCnpj, "CNPJ inválido. Confira os números digitados."),
  razaoSocial: z.string().trim().min(1, "Informe a razão social.").max(200),
  nomeFantasia: z.string().trim().max(200),
  situacaoCadastral: z.string().trim().max(60),
  municipio: z.string().trim().max(100),
  uf: z
    .string()
    .trim()
    .refine((value) => value === "" || /^[A-Za-z]{2}$/.test(value), "UF tem 2 letras."),
});

export type CompanyInput = z.infer<typeof companySchema>;
