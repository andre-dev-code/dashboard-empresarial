import { NextResponse } from "next/server";

import { isValidCnpj, onlyDigits } from "@/lib/cnpj";
import {
  brasilApiCnpjSchema,
  toCnpjLookup,
  type CnpjLookupResponse,
} from "@/lib/companies/lookup";
import { getVerifiedClaims } from "@/lib/supabase/server";

const TIMEOUT_MS = 8000;
const ONE_DAY = 86400;

function fail(error: string, status: number) {
  return NextResponse.json<CnpjLookupResponse>({ error }, { status });
}

export async function GET(_request: Request, context: RouteContext<"/api/cnpj/[cnpj]">) {
  const { claims } = await getVerifiedClaims();
  if (!claims) {
    return fail("Sessão sem verificação em duas etapas. Entre novamente.", 401);
  }

  const { cnpj: param } = await context.params;
  const cnpj = onlyDigits(param);
  if (!isValidCnpj(cnpj)) {
    return fail("CNPJ inválido. Confira os números digitados.", 400);
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      signal: controller.signal,
      headers: { Accept: "application/json", "User-Agent": "dashboard-empresarial/1.0" },
      cache: "force-cache",
      next: { revalidate: ONE_DAY },
    });
  } catch (error) {
    const timedOut = error instanceof Error && error.name === "AbortError";
    return timedOut
      ? fail("A consulta demorou demais para responder. Tente de novo.", 504)
      : fail("Não foi possível falar com o serviço de CNPJ. Tente de novo.", 502);
  } finally {
    clearTimeout(timeout);
  }

  if (response.status === 404 || response.status === 400) {
    return fail("CNPJ não encontrado na Receita Federal.", 404);
  }
  if (response.status === 429) {
    return fail("Muitas consultas em pouco tempo. Tente de novo em alguns instantes.", 429);
  }
  if (!response.ok) {
    return fail("O serviço de consulta de CNPJ está fora do ar. Tente de novo em alguns minutos.", 502);
  }

  const parsed = brasilApiCnpjSchema.safeParse(await response.json());
  if (!parsed.success) {
    return fail("O serviço de CNPJ respondeu num formato inesperado. Preencha os dados manualmente.", 502);
  }

  return NextResponse.json<CnpjLookupResponse>({ data: toCnpjLookup(parsed.data) });
}
