"use client";

import { CircleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardError({ retry }: { error: Error; retry: () => void }) {
  return (
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <CircleAlert className="mb-2 size-8 text-destructive" aria-hidden />
        <CardTitle>Não foi possível carregar suas empresas</CardTitle>
        <CardDescription>
          A conexão com o banco de dados falhou. Verifique sua internet e tente de novo.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button onClick={() => retry()}>Tentar de novo</Button>
      </CardContent>
    </Card>
  );
}
