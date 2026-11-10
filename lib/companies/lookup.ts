import { z } from "zod";

export const brasilApiCnpjSchema = z.object({
  cnpj: z.string(),
  razao_social: z.string(),
  nome_fantasia: z.string().nullish(),
  descricao_situacao_cadastral: z.string().nullish(),
  municipio: z.string().nullish(),
  uf: z.string().nullish(),
});

export type CnpjLookup = {
  cnpj: string;
  razaoSocial: string;
  nomeFantasia: string;
  situacaoCadastral: string;
  municipio: string;
  uf: string;
};

export type CnpjLookupResponse = { data: CnpjLookup } | { error: string };

export function toCnpjLookup(raw: z.infer<typeof brasilApiCnpjSchema>): CnpjLookup {
  return {
    cnpj: raw.cnpj,
    razaoSocial: raw.razao_social,
    nomeFantasia: raw.nome_fantasia ?? "",
    situacaoCadastral: raw.descricao_situacao_cadastral ?? "",
    municipio: raw.municipio ?? "",
    uf: raw.uf ?? "",
  };
}
