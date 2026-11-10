import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";

import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar | Dashboard Empresarial" };

export default function LoginPage() {
  return (
    <AuthShell
      title="Entrar"
      description="Acesse o painel com seu e-mail e senha."
    >
      <LoginForm />
    </AuthShell>
  );
}
