import "server-only";

import { createClient } from "@/lib/supabase/server";

const THIRTY_DAYS_MS = 30 * 24 * 60 * 60 * 1000;

export async function getCompaniesOverview() {
  const supabase = await createClient();
  const since = new Date(Date.now() - THIRTY_DAYS_MS).toISOString();

  const [list, total, recent] = await Promise.all([
    supabase
      .from("companies")
      .select("id, cnpj, razao_social, nome_fantasia, situacao_cadastral, municipio, uf, created_at")
      .order("created_at", { ascending: false }),
    supabase.from("companies").select("id", { count: "exact", head: true }),
    supabase
      .from("companies")
      .select("id", { count: "exact", head: true })
      .gte("created_at", since),
  ]);

  if (list.error || total.error || recent.error) {
    throw new Error("Não foi possível carregar as empresas.");
  }

  return {
    companies: list.data,
    total: total.count ?? 0,
    lastThirtyDays: recent.count ?? 0,
  };
}
