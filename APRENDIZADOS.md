# Aprendizados

> **Aviso:** as respostas abaixo foram escritas pelo Claude (IA), a pedido do André, a partir do código deste repositório. Elas não foram respondidas "sem olhar o código". Servem de material de estudo até o André reescrever com as próprias palavras.

## Diário

Registro do que aconteceu durante o desenvolvimento.

### Dia 1 — setup

- Travou: o Next 16 veio com Cache Components ligado, e ler cookies fora de um `<Suspense>` vira erro de build.
- Resolveu: toda leitura de sessão ficou dentro de `<Suspense>` com skeleton, o que já atende o requisito de loading.
- Aprendido: no Next 16 o `middleware.ts` se chama `proxy.ts`. A IA sugeria o nome antigo; a doc em `node_modules/next/dist/docs` mostrou o novo.

### Dias 2 a 7 — épicos

- Travou: o `count` com `head: true` do Supabase devolvia vazio, e os cards mostravam 0 com 3 empresas na tabela.
- Resolveu: os dois números passaram a ser calculados da mesma lista que a tabela mostra (sem paginação, ela tem todas as empresas do usuário).
- Travou: a BrasilAPI respondia 403 para o servidor, mas funcionava no curl. O motivo era que ela bloqueia requisições sem `User-Agent`, que é o padrão do `fetch` do Node. Resolvido enviando o header.

### Dia 8 — teste de ponta a ponta

- Travou: se o formulário fosse enviado antes de o JavaScript carregar, o navegador fazia um GET e a senha ia para a URL. Resolvido com `method="post"` em todos os formulários.
- Travou: o QR code do 2FA quebrava o `next/image`, porque vem como SVG em data URL. Resolvido com `<img>`.
- Ainda vale estudar: o que exatamente o `connection()` muda na renderização com Cache Components.

## Checkpoint E1 — Autenticação

1. **O que o `proxy.ts` faz quando alguém deslogado digita `/dashboard`? Por que a tela não pisca antes do redirecionamento?**
   - O proxy roda no servidor antes de qualquer página ser renderizada. Ele chama `supabase.auth.getClaims()`; sem sessão, responde direto com um redirecionamento 307 para `/login`. Como a resposta é o redirecionamento e não a página, nenhum HTML do dashboard chega ao navegador. Por isso não pisca. Se a checagem fosse feita num `useEffect` no cliente, a página apareceria primeiro e só depois redirecionaria.

2. **Por que existem dois clientes do Supabase (`client.ts` e `server.ts`)? Onde a sessão fica guardada?**
   - A sessão fica em cookies (access token e refresh token). O `client.ts` usa `createBrowserClient`, que lê e grava esses cookies pelo `document.cookie`, e roda nos componentes `"use client"` (login, 2FA, logout). O `server.ts` usa `createServerClient`, que lê os cookies da requisição pelo `cookies()` do Next, e roda em Server Components, Server Actions e Route Handlers. O navegador e o servidor acessam cookies de formas diferentes, por isso são dois clientes. Existe ainda um terceiro uso, no `proxy.ts`, que lê os cookies da `request` e grava na `response`, e é lá que o token é renovado.

3. **Como o erro `invalid_credentials` vira "E-mail ou senha incorretos."?**
   - O Supabase devolve um erro com o campo `code`. A função `authErrorMessage` em `lib/auth/errors.ts` tem um mapa de `code` para mensagem em português. Se o código não estiver no mapa, ela devolve uma mensagem genérica, "Algo deu errado...". O formulário guarda essa mensagem num estado e mostra num `Alert`.

4. **Onde a regra "senha com no mínimo 8 caracteres" é validada, e o que acontece se o usuário mandar 7?**
   - Em dois lugares. No front, o `signupSchema` em `lib/auth/schemas.ts` tem `z.string().min(8, ...)`. O `zodResolver` roda isso antes do `onSubmit`, então com 7 caracteres a requisição nem sai e aparece "A senha precisa ter pelo menos 8 caracteres.". No Supabase, `minimum_password_length = 8` no `supabase/config.toml`, então mesmo quem chamar a API direto, sem passar pelo front, recebe erro `weak_password`.

5. **O que aconteceria se eu removesse o `matcher` do `proxy.ts`?**
   - O proxy passaria a rodar em toda requisição, inclusive para arquivos estáticos (`_next/static`, imagens, favicon), `/api` e `/auth/callback`. Cada CSS, JS e imagem faria uma checagem de sessão no Supabase antes de ser entregue, o que deixa o site bem mais lento. A segurança não muda, porque as regras de redirecionamento só valem para `/`, `/dashboard` e `/mfa`; o problema é desempenho.

## Checkpoint E2 — 2FA

1. **Qual a diferença entre `aal1` e `aal2`? Em que momento a sessão muda de um para o outro?**
   - AAL é o *Authenticator Assurance Level*, o nível de garantia de quem está logado. `aal1` significa que a pessoa provou só um fator, a senha. `aal2` significa que provou dois, senha e código TOTP. O `signInWithPassword` cria a sessão em `aal1`, mesmo para quem tem 2FA. A sessão só sobe para `aal2` quando o `mfa.challengeAndVerify` (challenge + verify) dá certo: o Supabase emite um JWT novo com `"aal": "aal2"`.

2. **O que `nextLevel` e `currentLevel` dizem ao proxy? Qual combinação manda para `/mfa/setup` e qual manda para `/mfa/verify`?**
   - `currentLevel` é o nível da sessão agora. `nextLevel` é o nível que o usuário consegue alcançar, que é `aal2` se ele tem um fator verificado e `aal1` se não tem.
   - `nextLevel = aal1` significa sem fator cadastrado, então vai para `/mfa/setup`.
   - `nextLevel = aal2` e `currentLevel = aal1` significa que tem fator mas ainda não digitou o código, então vai para `/mfa/verify`.
   - Os dois em `aal2` significa acesso liberado ao dashboard.

3. **Por que a tela de setup remove fatores "unverified" antes de chamar `enroll`?**
   - Cada `enroll` cria um fator novo com status `unverified` até o usuário confirmar o código. Se a pessoa recarregar a página ou sair no meio, o fator antigo fica pendurado. O Supabase limita a quantidade de fatores e recusa nomes repetidos, então o próximo `enroll` poderia falhar. Remover os não verificados antes garante que cada visita à tela gera um QR code novo e limpo. Um fator **verificado** nunca é removido aqui.

4. **Se alguém pegar a `anon key` e o token de uma sessão `aal1`, o que consegue fazer na tabela `companies`?**
   - Nada. As policies exigem `(auth.jwt() ->> 'aal') = 'aal2'`. No `select`, a policy filtra todas as linhas e a resposta é `[]`, mesmo com empresas cadastradas. No `insert`, o Postgres recusa a linha. Saída real do `pnpm prova-2fa`:
     ```text
     1) Login só com senha: OK. Nível da sessão (aal) = aal1
     2) Leitura (SELECT) -> HTTP 200: []
     3) Gravação (INSERT) -> HTTP 403: {"code":"42501", ... "new row violates row-level security policy for table \"companies\""}
     ```

5. **O que aconteceria se eu removesse `and (auth.jwt() ->> 'aal') = 'aal2'` das policies, mas mantivesse a checagem no proxy?**
   - O 2FA viraria decoração. O proxy só protege as **páginas** do Next. A `anon key` é pública (está no JavaScript do navegador) e a URL do Supabase também, então qualquer pessoa com a senha de alguém faria `signInWithPassword` direto na API do Supabase, pegaria um token `aal1` e leria ou gravaria as empresas sem passar pelo proxy. A policy no banco é a única barreira que vale fora do front.

## Checkpoint E3 — Empresas

1. **Como funciona o cálculo dos dois dígitos verificadores em `lib/cnpj.ts`?**
   - O CNPJ tem 14 dígitos: 12 de base e 2 verificadores.
   - Para o 1º dígito, multiplica cada um dos 12 primeiros pelos pesos `5,4,3,2,9,8,7,6,5,4,3,2`, soma tudo e tira o resto da divisão por 11. Se o resto for menor que 2, o dígito é 0; se não, é `11 - resto`.
   - Para o 2º dígito, faz o mesmo com os 13 primeiros (incluindo o 1º verificador) e os pesos `6,5,4,3,2,9,8,7,6,5,4,3,2`.
   - O CNPJ é válido se os dois calculados forem iguais aos dígitos 13 e 14. Antes disso a função rejeita o que não tiver 14 dígitos e os 14 dígitos iguais (`11111111111111`), que passariam no cálculo mas não existem.

2. **Por que a chamada à BrasilAPI sai de `app/api/cnpj/[cnpj]/route.ts` e não direto do navegador?**
   - Por quatro motivos.
   - **CORS:** o navegador pode bloquear a chamada para outro domínio.
   - **Cache:** no servidor dá para guardar a resposta por 24h (`revalidate: 86400`) e reaproveitar entre usuários.
   - **Proteção:** a rota só responde para sessão `aal2`, então ninguém usa o servidor como proxy aberto.
   - **Troca de provedor:** se a BrasilAPI sair do ar, dá para trocar de API sem mudar o front.

3. **Por que a resposta da API passa por um schema zod antes de virar os 6 campos?**
   - A API é externa: pode mudar o nome de um campo, mandar `null` onde se espera texto ou devolver uma página de erro em vez de JSON. O `brasilApiCnpjSchema` confere o formato; se não bater, a rota responde 502 com uma mensagem clara em vez de quebrar a tela. Depois, `toCnpjLookup` transforma `null` em texto vazio e renomeia os campos, por exemplo `descricao_situacao_cadastral` para `situacaoCadastral`.

4. **Como o sistema impede CNPJ duplicado para o mesmo usuário, e onde a mensagem amigável é montada?**
   - Quem impede é o banco: a constraint `unique (owner_id, cnpj)` na migration. Ao tentar inserir de novo, o Postgres devolve o erro `23505`. A Server Action `createCompany` em `app/dashboard/actions.ts` reconhece esse código e devolve "Você já cadastrou o CNPJ 19.131.243/0001-97.". Não há consulta antes de inserir, porque duas abas abertas poderiam passar juntas pela consulta; a constraint não deixa isso acontecer.

5. **O que aconteceria se eu removesse o `AbortController` e a BrasilAPI ficasse 2 minutos sem responder?**
   - A rota ficaria esperando até o limite da plataforma (na Vercel, a função seria encerrada por tempo e o usuário receberia um erro genérico). Durante esse tempo, o botão ficaria em "Buscando..." sem explicação. Com o `AbortController`, depois de 8 segundos a requisição é cancelada e a rota responde 504 com "A consulta demorou demais para responder. Tente de novo.", e o botão "Tentar de novo" aparece.
