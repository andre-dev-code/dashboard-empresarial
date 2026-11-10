import { Building2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
            <Building2 className="size-5" aria-hidden />
          </div>
          <CardTitle className="text-2xl font-semibold">
            Dashboard Empresarial
          </CardTitle>
          <CardDescription>
            Cadastre empresas pelo CNPJ e acompanhe tudo em um só lugar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Login com verificação em duas etapas chega em breve.
          </p>
        </CardContent>
        <CardFooter className="gap-2">
          <Button>Entrar</Button>
          <Button variant="outline">Criar conta</Button>
        </CardFooter>
      </Card>
    </main>
  );
}
