"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { FormError } from "@/components/form-error";
import { TotpCodeForm } from "@/components/totp-code-form";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authErrorMessage } from "@/lib/auth/errors";
import { createClient } from "@/lib/supabase/client";

type SetupState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; factorId: string; qrCode: string; secret: string };

export function MfaSetup() {
  const router = useRouter();
  const [state, setState] = useState<SetupState>({ status: "loading" });
  const [verifyError, setVerifyError] = useState<string | null>(null);
  const started = useRef(false);

  const enroll = useCallback(async () => {
    setState({ status: "loading" });
    const supabase = createClient();

    const { data: factors, error: listError } = await supabase.auth.mfa.listFactors();
    if (listError) {
      setState({ status: "error", message: authErrorMessage(listError) });
      return;
    }

    const unverified = factors.all.filter(
      (factor) => factor.factor_type === "totp" && factor.status === "unverified",
    );
    for (const factor of unverified) {
      await supabase.auth.mfa.unenroll({ factorId: factor.id });
    }

    const { data, error } = await supabase.auth.mfa.enroll({
      factorType: "totp",
      friendlyName: "Dashboard Empresarial",
    });
    if (error) {
      setState({ status: "error", message: authErrorMessage(error) });
      return;
    }

    setState({
      status: "ready",
      factorId: data.id,
      qrCode: data.totp.qr_code,
      secret: data.totp.secret,
    });
  }, []);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    void enroll();
  }, [enroll]);

  async function verify(code: string) {
    if (state.status !== "ready") return;
    setVerifyError(null);

    const { error } = await createClient().auth.mfa.challengeAndVerify({
      factorId: state.factorId,
      code,
    });
    if (error) {
      setVerifyError(authErrorMessage(error));
      return;
    }

    router.replace("/dashboard");
    router.refresh();
  }

  if (state.status === "loading") {
    return (
      <div className="grid gap-4" aria-busy="true" aria-label="Gerando QR code">
        <Skeleton className="mx-auto size-48" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (state.status === "error") {
    return (
      <div className="grid gap-4">
        <FormError message={`Não foi possível gerar o QR code. ${state.message}`} />
        <Button onClick={() => void enroll()}>Tentar de novo</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      <div className="mx-auto rounded-lg bg-card p-2 ring-1 ring-border">
        <Image
          src={state.qrCode}
          alt="QR code para configurar o app autenticador"
          width={192}
          height={192}
          unoptimized
        />
      </div>

      <div className="grid gap-1">
        <p className="text-sm text-muted-foreground">
          Não consegue escanear? Digite este código no app:
        </p>
        <code className="rounded-md bg-muted p-2 text-center text-sm break-all select-all">
          {state.secret}
        </code>
      </div>

      <TotpCodeForm
        submitLabel="Ativar 2FA"
        error={verifyError}
        onSubmit={verify}
      />
    </div>
  );
}
