import type { Metadata } from "next";
import { Suspense } from "react";

import { CompaniesOverview, CompaniesOverviewSkeleton } from "./companies-overview";
import { CompanyForm } from "./company-form";

export const metadata: Metadata = { title: "Empresas | Dashboard Empresarial" };

export default function DashboardPage() {
  return (
    <div className="mx-auto grid max-w-5xl gap-8">
      <header className="grid gap-1">
        <h1 className="text-2xl font-semibold">Empresas</h1>
        <p className="text-sm text-muted-foreground">
          Digite um CNPJ para buscar os dados na Receita Federal e cadastrar a empresa.
        </p>
      </header>

      <CompanyForm />

      <Suspense fallback={<CompaniesOverviewSkeleton />}>
        <CompaniesOverview />
      </Suspense>
    </div>
  );
}
