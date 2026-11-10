"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/form-error";
import { FormField } from "@/components/form-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { totpCodeSchema, type TotpCodeInput } from "@/lib/auth/schemas";

type TotpCodeFormProps = {
  submitLabel: string;
  error: string | null;
  onSubmit: (code: string) => Promise<void>;
};

export function TotpCodeForm({ submitLabel, error, onSubmit }: TotpCodeFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<TotpCodeInput>({ resolver: zodResolver(totpCodeSchema) });

  return (
    <form
      onSubmit={handleSubmit(({ code }) => onSubmit(code))}
      className="grid gap-4"
      noValidate
    >
      <FormField id="code" label="Código de 6 dígitos" error={errors.code?.message}>
        <Input
          id="code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={6}
          placeholder="000000"
          className="text-center text-2xl tracking-widest md:text-2xl"
          aria-invalid={!!errors.code}
          {...register("code")}
        />
      </FormField>

      <FormError message={error} />

      <Button type="submit" size="lg" disabled={isSubmitting}>
        {isSubmitting ? "Verificando..." : submitLabel}
      </Button>
    </form>
  );
}
