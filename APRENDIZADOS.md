# Aprendizados

## Diário

Três linhas por dia: o que travou, como resolvi e o que ainda não entendi.

### Dia 1

- Travou:
- Resolvi:
- Ainda não entendi:

## Checkpoint E1 — Autenticação

Responda sem olhar o código.

1. O que o `proxy.ts` faz quando alguém deslogado digita `/dashboard`? Por que a tela não pisca antes do redirecionamento?
   - Resposta:
2. Por que existem dois clientes do Supabase (`lib/supabase/client.ts` e `lib/supabase/server.ts`)? Onde a sessão fica guardada?
   - Resposta:
3. Como o erro `invalid_credentials` do Supabase vira "E-mail ou senha incorretos."?
   - Resposta:
4. Onde a regra "senha com no mínimo 8 caracteres" é validada, e o que acontece se o usuário mandar 7?
   - Resposta:
5. O que aconteceria se eu removesse o `matcher` do `proxy.ts`?
   - Resposta:

## Checkpoint E2 — 2FA

1. Qual a diferença entre `aal1` e `aal2`? Em que momento a sessão muda de um para o outro?
   - Resposta:
2. O que `nextLevel` e `currentLevel` dizem ao proxy? Qual combinação manda para `/mfa/setup` e qual manda para `/mfa/verify`?
   - Resposta:
3. Por que a tela de setup remove fatores "unverified" antes de chamar `enroll`?
   - Resposta:
4. Se alguém pegar a `anon key` e o token de uma sessão `aal1`, o que consegue fazer na tabela `companies`? Mostre a saída do `pnpm prova-2fa`.
   - Resposta:
5. O que aconteceria se eu removesse `and (auth.jwt() ->> 'aal') = 'aal2'` das policies, mas mantivesse a checagem no proxy?
   - Resposta:

## Checkpoint E3 — Empresas

1. Explique, com suas palavras, como o cálculo dos dois dígitos verificadores funciona em `lib/cnpj.ts`.
   - Resposta:
2. Por que a chamada à BrasilAPI sai de `app/api/cnpj/[cnpj]/route.ts` e não direto do navegador?
   - Resposta:
3. Por que a resposta da API passa por um schema zod antes de virar os 6 campos?
   - Resposta:
4. Como o sistema impede CNPJ duplicado para o mesmo usuário, e onde a mensagem amigável é montada?
   - Resposta:
5. O que aconteceria se eu removesse o `AbortController` e a BrasilAPI ficasse 2 minutos sem responder?
   - Resposta:
