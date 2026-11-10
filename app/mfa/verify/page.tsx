import type { Metadata } from "next";

import { AuthShell } from "@/components/auth-shell";

import { MfaVerify } from "./mfa-verify";

export const metadata: Metadata = { title: "Verificar 2FA | Dashboard Empresarial" };

export default function MfaVerifyPage() {
  return (
    <AuthShell
      title="Verificação em duas etapas"
      description="Abra seu app autenticador e digite o código de 6 dígitos."
    >
      <MfaVerify />
    </AuthShell>
  );
}
