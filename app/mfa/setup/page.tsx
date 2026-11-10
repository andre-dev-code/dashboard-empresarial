import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";

import { MfaSetup } from "./mfa-setup";

export const metadata: Metadata = { title: "Configurar 2FA | Dashboard Empresarial" };

export default function MfaSetupPage() {
  return (
    <AuthShell
      title="Configure o 2FA"
      description="Escaneie o QR code com um app autenticador (Google Authenticator, Authy, 1Password) e digite o código gerado."
    >
      <MfaSetup />
    </AuthShell>
  );
}
