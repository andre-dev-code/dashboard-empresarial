import { Building2 } from "lucide-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCnpj } from "@/lib/cnpj";
import { getCompaniesOverview } from "@/lib/companies/queries";

import { DeleteCompanyButton } from "./delete-company-button";

const dateFormatter = new Intl.DateTimeFormat("pt-BR", {
  dateStyle: "short",
  timeZone: "America/Sao_Paulo",
});

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardTitle className="text-3xl font-semibold">{value}</CardTitle>
      </CardHeader>
    </Card>
  );
}

export async function CompaniesOverview() {
  const { companies, total, lastThirtyDays } = await getCompaniesOverview();

  return (
    <section className="grid gap-4" aria-label="Empresas cadastradas">
      <div className="grid gap-4 sm:grid-cols-2">
        <StatCard label="Total de empresas" value={total} />
        <StatCard label="Cadastradas nos últimos 30 dias" value={lastThirtyDays} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Empresas cadastradas</CardTitle>
          <CardDescription>Mais recentes primeiro.</CardDescription>
        </CardHeader>
        <CardContent>
          {companies.length === 0 ? (
            <div className="flex flex-col items-center gap-2 py-8 text-center">
              <Building2 className="size-8 text-muted-foreground" aria-hidden />
              <p className="font-medium">Nenhuma empresa cadastrada ainda</p>
              <p className="text-sm text-muted-foreground">
                Busque um CNPJ no formulário acima para cadastrar a primeira.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CNPJ</TableHead>
                  <TableHead>Razão social</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead>Cidade/UF</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {companies.map((company) => (
                  <TableRow key={company.id}>
                    <TableCell className="whitespace-nowrap">{formatCnpj(company.cnpj)}</TableCell>
                    <TableCell className="min-w-48 whitespace-normal">
                      <p className="font-medium">{company.razao_social}</p>
                      {company.nome_fantasia ? (
                        <p className="text-sm text-muted-foreground">{company.nome_fantasia}</p>
                      ) : null}
                    </TableCell>
                    <TableCell>{company.situacao_cadastral ?? "—"}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {[company.municipio, company.uf].filter(Boolean).join("/") || "—"}
                    </TableCell>
                    <TableCell>{dateFormatter.format(new Date(company.created_at))}</TableCell>
                    <TableCell className="text-right">
                      <DeleteCompanyButton id={company.id} name={company.razao_social} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export function CompaniesOverviewSkeleton() {
  return (
    <section className="grid gap-4" aria-busy="true" aria-label="Carregando empresas">
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
      <Skeleton className="h-64" />
    </section>
  );
}
