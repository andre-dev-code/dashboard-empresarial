"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import { TotpCodeForm } from "@/components/totp-code-form";
import { authErrorMessage } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

export function MfaVerify() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  async function verify(code: string) {
    setError(null);
    const supabase = createClient();

    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) {
      setError(authErrorMessage(listError));
      return;
    }

    const factor = factors.totp[0];
    if (!factor) {
      router.replace("/mfa/setup");
      return;
    }

    const { error: verifyError } = await supabase.auth.mfa.challengeAndVerify({
      factorId: factor.id,
      code,
    });
    if (verifyError) {
      setError(authErrorMessage(verifyError));
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  return <TotpCodeForm submitLabel="Verificar" error={error} onSubmit={verify} />;
}
