"use server";

import { refresh } from "next/cache";
import { z } from "zod";

import { formatCnpj, onlyDigits } from "@/lib/cnpj";
import { companySchema, type CompanyInput } from "@/lib/companies/schema";
import { createClient } from "@/lib/supabase/server";

export type ActionResult = { ok: true } | { ok: false; error: string };

const UNIQUE_VIOLATION = "23505";
const RLS_VIOLATION = "42501";

function emptyToNull(value: string) {
  return value === "" ? null : value;
}

export async function createCompany(input: CompanyInput): Promise<ActionResult> {
  const parsed = companySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: "Confira os campos destacados e tente de novo." };
  }

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getClaims();
  if (!auth?.claims) {
    return { ok: false, error: "Sua sessão expirou. Entre novamente." };
  }

  const company = parsed.data;
  const cnpj = onlyDigits(company.cnpj);

  const { error } = await supabase.from("companies").insert({
    owner_id: auth.claims.sub,
    cnpj,
    razao_social: company.razaoSocial,
    nome_fantasia: emptyToNull(company.nomeFantasia),
    situacao_cadastral: emptyToNull(company.situacaoCadastral),
    municipio: emptyToNull(company.municipio),
    uf: emptyToNull(company.uf.toUpperCase()),
  });

  if (error?.code === UNIQUE_VIOLATION) {
    return { ok: false, error: `Você já cadastrou o CNPJ ${formatCnpj(cnpj)}.` };
  }
  if (error?.code === RLS_VIOLATION) {
    return {
      ok: false,
      error: "Permissão negada: confirme o código do autenticador para gravar dados.",
    };
  }
  if (error) {
    return { ok: false, error: "Não foi possível salvar a empresa. Tente de novo." };
  }

  refresh();
  return { ok: true };
}

export async function deleteCompany(id: string): Promise<ActionResult> {
  if (!z.uuid().safeParse(id).success) {
    return { ok: false, error: "Empresa inválida." };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("companies")
    .delete()
    .eq("id", id)
    .select("id");

  if (error) {
    return { ok: false, error: "Não foi possível excluir a empresa. Tente de novo." };
  }
  if (data.length === 0) {
    return { ok: false, error: "Empresa não encontrada ou sem permissão para excluir." };
  }

  refresh();
  return { ok: true };
}
