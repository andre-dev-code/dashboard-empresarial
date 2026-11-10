import { Building2 } from "lucide-react";
import Link from "next/link";
import { Suspense, type ReactNode } from "react";

import { LogoutButton } from "@/components/logout-button";
import { Skeleton } from "@/components/ui/skeleton";
import { createClient } from "@/lib/supabase/server";

async function UserEmail() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getClaims();
  const email = data?.claims.email ?? "";

  return (
    <p className="truncate text-sm" title={email}>
      {email}
    </p>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col md:flex-row">
      <aside className="flex flex-col gap-4 bg-sidebar p-4 text-sidebar-foreground md:fixed md:inset-y-0 md:w-64">
        <div className="flex items-center justify-between gap-4 md:flex-col md:items-stretch">
          <Link href="/dashboard" className="flex items-center gap-2 font-semibold">
            <span className="flex size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
              <Building2 className="size-4" aria-hidden />
            </span>
            Dashboard Empresarial
          </Link>

          <nav className="hidden md:block" aria-label="Navegação principal">
            <Link
              href="/dashboard"
              aria-current="page"
              className="flex rounded-lg bg-sidebar-accent px-3 py-2 text-sm text-sidebar-accent-foreground"
            >
              Empresas
            </Link>
          </nav>
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-sidebar-border pt-4 md:mt-auto md:flex-col md:items-stretch">
          <div className="min-w-0">
            <p className="text-sm text-sidebar-foreground">Conectado como</p>
            <Suspense fallback={<Skeleton className="h-4 w-40 bg-sidebar-accent" />}>
              <UserEmail />
            </Suspense>
          </div>
          <LogoutButton className="text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground md:justify-start" />
        </div>
      </aside>

      <main className="flex-1 p-4 md:ml-64 md:p-8">{children}</main>
    </div>
  );
}
