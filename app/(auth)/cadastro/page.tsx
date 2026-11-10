import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";

import { SignupForm } from "./signup-form";

export const metadata: Metadata = { title: "Criar conta | Dashboard Empresarial" };

export default function SignupPage() {
  return (
    <AuthShell
      title="Criar conta"
      description="Depois do cadastro você vai configurar o 2FA."
    >
      <SignupForm />
    </AuthShell>
  );
}
