# Dashboard Empresarial

Painel web onde o usuário cria conta, protege o acesso com 2FA (app autenticador) e cadastra empresas digitando só o CNPJ. Os dados vêm da BrasilAPI e preenchem o formulário automaticamente.

**Produção:** `https://SEU-PROJETO.vercel.app` _(troque pelo link da Vercel)_

![Tela de empresas](docs/tela-empresas.png)

## Funcionalidades

- Cadastro e login com e-mail e senha (mínimo de 8 caracteres).
- 2FA obrigatório com TOTP: configuração por QR code no primeiro acesso e código de 6 dígitos a cada login.
- Cadastro de empresa por CNPJ: máscara na digitação, validação dos dígitos verificadores antes de chamar a API e 6 campos preenchidos e editáveis.
- Listagem da mais recente para a mais antiga, exclusão com confirmação e 2 indicadores: total e últimos 30 dias.

## Stack

| Camada | Escolha |
|---|---|
| Framework | Next.js 16 (App Router, Cache Components) + TypeScript `strict` |
| Estilo | Tailwind CSS 4 + shadcn/ui + lucide-react |
| Banco e auth | Supabase (Postgres, Auth com MFA, RLS) via `@supabase/ssr` |
| Formulários | react-hook-form + zod |
| Testes | Vitest |
| Deploy e CI | Vercel + GitHub Actions |

## Como rodar localmente do zero

Pré-requisitos: Node 22+ e pnpm (`corepack enable`).

1. **Clone e instale:**
   ```bash
   git clone https://github.com/SEU-USUARIO/dashboard-empresarial.git
   cd dashboard-empresarial
   pnpm install
   ```
2. **Crie um projeto no [Supabase](https://supabase.com/dashboard)** (plano free).
3. **Configure as variáveis:** copie `.env.example` para `.env.local` e preencha com os valores de _Project Settings → API_.
   ```bash
   cp .env.example .env.local
   ```
4. **Aplique a migration** (veja a seção abaixo).
5. **No painel do Supabase, em _Authentication → URL Configuration_:**
   - **Site URL:** `http://localhost:3000` no desenvolvimento, ou o domínio da Vercel em produção.
   - **Redirect URLs:** adicione `http://localhost:3000/auth/callback` e `https://SEU-PROJETO.vercel.app/auth/callback`.
6. **Rode:**
   ```bash
   pnpm dev
   ```
   Abra http://localhost:3000.

> O Supabase exige confirmação de e-mail por padrão. Depois do cadastro, abra o link do e-mail **no mesmo navegador**. Para agilizar os testes, dá para desligar em _Authentication → Sign In / Providers → Email → Confirm email_.

## Variáveis de ambiente

| Variável | Onde encontrar |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase → Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API → chave `anon` / publishable |

Configure as mesmas duas variáveis na Vercel, em _Project Settings → Environment Variables_.

## Como aplicar a migration

A tabela e as policies estão em `supabase/migrations/`. Nada é criado pelo painel.

```bash
pnpm exec supabase login
pnpm exec supabase link --project-ref SEU_PROJECT_REF
pnpm exec supabase db push
```

O `project-ref` é o trecho do Project URL antes de `.supabase.co`.

## Scripts

| Comando | O que faz |
|---|---|
| `pnpm dev` | Servidor de desenvolvimento |
| `pnpm typecheck` | Gera os tipos de rota do Next e roda `tsc --noEmit` |
| `pnpm lint` | ESLint |
| `pnpm test` | Testes da validação de CNPJ |
| `pnpm build` | Build de produção |
| `pnpm prova-2fa <email> <senha>` | Tenta ler e gravar empresas com uma sessão sem 2FA (veja abaixo) |

## Como o 2FA é garantido

`signInWithPassword` retorna sucesso mesmo para quem tem 2FA cadastrado. A sessão nasce em nível `aal1` e só sobe para `aal2` depois do `mfa.verify`. Por isso a proteção fica em duas camadas:

1. **Proxy (`proxy.ts`, o antigo middleware):** em toda requisição ele verifica o usuário (`getClaims`) e o nível de garantia (`getAuthenticatorAssuranceLevel`). Quem não tem fator cadastrado só acessa `/mfa/setup`. Quem tem fator mas está em `aal1` só acessa `/mfa/verify`. Quem não está logado vai para `/login`. Como o redirecionamento acontece antes da página renderizar, a tela protegida não chega a piscar.
2. **Banco (RLS):** as policies de `select`, `insert` e `delete` exigem `owner_id = auth.uid()` **e** `auth.jwt() ->> 'aal' = 'aal2'`. Isso vale mesmo para quem chama a API do Supabase direto, sem passar pelo front.

**Prova:** o comando abaixo faz login só com senha e tenta ler e gravar direto na API do Supabase.

```bash
pnpm prova-2fa voce@exemplo.com SuaSenha
```

O resultado esperado é: leitura com HTTP 200 e lista vazia `[]`, e gravação com HTTP 401/403 e `new row violates row-level security policy for table "companies"` (código `42501`).

![Prova do 2FA](docs/prova-2fa.png)

## `anon key` × `service_role key`

A `anon key` só identifica o projeto. Tudo o que ela faz passa pelas policies de RLS, então mesmo exposta no JavaScript do navegador ela só alcança o que as regras do banco permitem para aquele usuário logado. A `service_role key` **ignora o RLS** e tem acesso total ao banco: se ela vazar no bundle, qualquer pessoa lê, altera e apaga os dados de todos os usuários.

## Design

**Paleta "azul-ardósia":** escolhi tons de cinza-azulado com um azul forte só para ações, porque deixa o painel sóbrio e profissional e faz o botão principal ser a primeira coisa que o olho encontra. A sidebar escura separa a navegação do conteúdo.

As cores ficam em tokens no `app/globals.css`, e nenhum componente usa cor fixa. A tipografia usa só a Geist.

**Contrastes (WCAG AA), validados no [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/):**

| Par | Cores | Contraste | Mínimo AA |
|---|---|---|---|
| Texto / fundo | `#0F172A` / `#F8FAFC` | 17.06:1 | 4.5:1 |
| Texto / card | `#0F172A` / `#FFFFFF` | 17.85:1 | 4.5:1 |
| Texto do botão / botão primário | `#FFFFFF` / `#1D4ED8` | 6.70:1 | 4.5:1 |
| Texto secundário / fundo | `#475569` / `#F8FAFC` | 7.24:1 | 4.5:1 |
| Texto secundário / card | `#475569` / `#FFFFFF` | 7.58:1 | 4.5:1 |
| Mensagem de erro / card | `#B91C1C` / `#FFFFFF` | 6.47:1 | 4.5:1 |
| Borda do input / fundo | `#64748B` / `#F8FAFC` | 4.55:1 | 3:1 |
| Texto da sidebar / sidebar | `#E2E8F0` / `#0F172A` | 14.48:1 | 4.5:1 |
| Destaque da sidebar / sidebar | `#60A5FA` / `#0F172A` | 7.02:1 | 3:1 |

## Estrutura

```
app/
  (auth)/login, (auth)/cadastro   telas públicas
  mfa/setup, mfa/verify           configuração e verificação do 2FA
  dashboard/                      layout com sidebar, formulário, listagem e server actions
  api/cnpj/[cnpj]/route.ts        consulta à BrasilAPI (timeout, cache de 24h, erros tratados)
  auth/callback/route.ts          retorno do link de confirmação de e-mail
lib/
  cnpj.ts                         validação dos dígitos verificadores e máscara
  supabase/                       clientes browser/servidor e lógica do proxy
  companies/                      schemas zod, consulta e mapeamento da API
supabase/migrations/              tabela companies + RLS
proxy.ts                          proteção de rotas
```
