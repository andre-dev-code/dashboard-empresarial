"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CircleCheck, Search } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";

import { FormError } from "@/components/form-error";
import { FormField } from "@/components/form-field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatCnpj, isValidCnpj, onlyDigits } from "@/lib/cnpj";
import type { CnpjLookupResponse } from "@/lib/companies/lookup";
import { companySchema, type CompanyInput } from "@/lib/companies/schema";

import { createCompany } from "./actions";

type LookupState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "found" };

const EMPTY: CompanyInput = {
  cnpj: "",
  razaoSocial: "",
  nomeFantasia: "",
  situacaoCadastral: "",
  municipio: "",
  uf: "",
};

const DETAIL_FIELDS = [
  { name: "razaoSocial", label: "Razão social" },
  { name: "nomeFantasia", label: "Nome fantasia" },
  { name: "situacaoCadastral", label: "Situação cadastral" },
  { name: "municipio", label: "Município" },
  { name: "uf", label: "UF" },
] as const;

export function CompanyForm() {
  const [lookup, setLookup] = useState<LookupState>({ status: "idle" });
  const [saveError, setSaveError] = useState<string | null>(null);
  const [savedName, setSavedName] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    getValues,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CompanyInput>({
    resolver: zodResolver(companySchema),
    defaultValues: EMPTY,
  });

  const cnpjField = register("cnpj", {
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      setValue("cnpj", formatCnpj(event.target.value));
      setLookup({ status: "idle" });
      setSavedName(null);
      setSaveError(null);
    },
  });

  async function searchCnpj() {
    const cnpj = onlyDigits(getValues("cnpj"));
    setSavedName(null);
    setSaveError(null);

    if (!isValidCnpj(cnpj)) {
      setError("cnpj", { message: "CNPJ inválido. Confira os números digitados." });
      return;
    }

    setLookup({ status: "loading" });
    try {
      const response = await fetch(`/api/cnpj/${cnpj}`);
      const body = (await response.json()) as CnpjLookupResponse;

      if ("error" in body) {
        setLookup({ status: "error", message: body.error });
        return;
      }

      reset({ ...body.data, cnpj: formatCnpj(body.data.cnpj) });
      setLookup({ status: "found" });
    } catch {
      setLookup({
        status: "error",
        message: "Sem conexão com o servidor. Verifique sua internet e tente de novo.",
      });
    }
  }

  async function onSubmit(values: CompanyInput) {
    setSaveError(null);
    const result = await createCompany(values);

    if (!result.ok) {
      setSaveError(result.error);
      return;
    }

    setSavedName(values.razaoSocial);
    reset(EMPTY);
    setLookup({ status: "idle" });
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nova empresa</CardTitle>
        <CardDescription>
          A busca preenche os dados automaticamente. Você pode corrigir antes de salvar.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form method="post" onSubmit={handleSubmit(onSubmit)} className="grid gap-4" noValidate>
          <FormField id="cnpj" label="CNPJ" error={errors.cnpj?.message}>
            <div className="flex flex-col gap-2 sm:flex-row">
              <Input
                id="cnpj"
                inputMode="numeric"
                placeholder="00.000.000/0000-00"
                maxLength={18}
                className="h-10 text-base sm:max-w-xs"
                aria-invalid={!!errors.cnpj}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && lookup.status !== "found") {
                    event.preventDefault();
                    void searchCnpj();
                  }
                }}
                {...cnpjField}
              />
              <Button
                type="button"
                size="lg"
                className="h-10"
                onClick={() => void searchCnpj()}
                disabled={lookup.status === "loading"}
              >
                <Search aria-hidden />
                {lookup.status === "loading" ? "Buscando..." : "Buscar"}
              </Button>
            </div>
          </FormField>

          {lookup.status === "loading" ? (
            <div className="grid gap-4 sm:grid-cols-2" aria-busy="true" aria-label="Buscando CNPJ">
              {DETAIL_FIELDS.map((field) => (
                <Skeleton key={field.name} className="h-14" />
              ))}
            </div>
          ) : null}

          {lookup.status === "error" ? (
            <div className="grid gap-2">
              <FormError message={lookup.message} />
              <div>
                <Button type="button" variant="outline" onClick={() => void searchCnpj()}>
                  Tentar de novo
                </Button>
              </div>
            </div>
          ) : null}

          {lookup.status === "found" ? (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {DETAIL_FIELDS.map((field) => (
                  <FormField
                    key={field.name}
                    id={field.name}
                    label={field.label}
                    error={errors[field.name]?.message}
                  >
                    <Input
                      id={field.name}
                      maxLength={field.name === "uf" ? 2 : undefined}
                      aria-invalid={!!errors[field.name]}
                      {...register(field.name)}
                    />
                  </FormField>
                ))}
              </div>

              <FormError message={saveError} />

              <div>
                <Button type="submit" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? "Salvando..." : "Salvar empresa"}
                </Button>
              </div>
            </>
          ) : null}

          {savedName ? (
            <Alert>
              <CircleCheck aria-hidden />
              <AlertDescription>{savedName} foi cadastrada.</AlertDescription>
            </Alert>
          ) : null}
        </form>
      </CardContent>
    </Card>
  );
}
