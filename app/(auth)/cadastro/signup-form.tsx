"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/form-error";
import { FormField } from "@/components/form-field";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { authErrorMessage } from "@/lib/auth/errors";
import { signupSchema, type SignupInput } from "@/lib/auth/schemas";
import { createClient } from "@/lib/supabase/client";

export function SignupForm() {
  const router = useRouter();
  const [formError, setFormError] = useState<string | null>(null);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupInput>({ resolver: zodResolver(signupSchema) });

  async function onSubmit({ email, password }: SignupInput) {
    setFormError(null);
    const supabase = createClient();

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setFormError(authErrorMessage(error));
      return;
    }

    if (!data.session) {
      setPendingEmail(email);
      return;
    }

    router.replace("/mfa/setup");
    router.refresh();
  }

  if (pendingEmail) {
    return (
      <Alert>
        <MailCheck aria-hidden />
        <AlertTitle>Confirme seu e-mail</AlertTitle>
        <AlertDescription>
          Enviamos um link para {pendingEmail}. Abra o link neste mesmo navegador
          para continuar.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form method="post" onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
      <FormField id="email" label="E-mail" error={errors.email?.message}>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          aria-invalid={!!errors.email}
          {...register("email")}
        />
      </FormField>

      <FormField id="password" label="Senha" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.password}
          {...register("password")}
        />
      </FormField>

      <FormField
        id="confirmPassword"
        label="Confirme a senha"
        error={errors.confirmPassword?.message}
      >
        <Input
          id="confirmPassword"
          type="password"
          autoComplete="new-password"
          aria-invalid={!!errors.confirmPassword}
          {...register("confirmPassword")}
        />
      </FormField>

      <FormError message={formError} />

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Criando conta..." : "Criar conta"}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link href="/login" className="font-medium text-primary underline-offset-4 hover:underline">
          Entrar
        </Link>
      </p>
    </form>
  );
}
