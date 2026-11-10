import "server-only";

import { createClient } from "@/lib/supabase/server";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getCompaniesOverview() {
  const supabase = await createClient();

  const { data: companies, error } = await supabase
    .from("companies")
    .select("id, cnpj, razao_social, nome_fantasia, situacao_cadastral, municipio, uf, created_at")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error("Não foi possível carregar as empresas.");
  }

  const since = Date.now() - THIRTY_DAYS_MS;
  const lastThirtyDays = companies.filter(
    (company) => new Date(company.created_at).getTime() >= since,
  ).length;

  return {
    companies,
    total: companies.length,
    lastThirtyDays,
  };
}
