const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const [email, password] = process.argv.slice(2);

function print(line = "") {
  process.stdout.write(`${line}\n`);
}

if (!url || !anonKey || !email || !password) {
  print("Uso: pnpm prova-2fa <email> <senha>");
  print("Precisa do .env.local com NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}

const login = await fetch(`${url}/auth/v1/token?grant_type=password`, {
  method: "POST",
  headers: { apikey: anonKey, "Content-Type": "application/json" },
  body: JSON.stringify({ email, password }),
});
const session = await login.json();

if (!login.ok) {
  print(`Login falhou: ${JSON.stringify(session)}`);
  process.exit(1);
}

const claims = JSON.parse(Buffer.from(session.access_token.split(".")[1], "base64url").toString());
print(`1) Login só com senha: OK. Nível da sessão (aal) = ${claims.aal}`);

const headers = {
  apikey: anonKey,
  Authorization: `Bearer ${session.access_token}`,
  "Content-Type": "application/json",
};

const read = await fetch(`${url}/rest/v1/companies?select=id,razao_social`, { headers });
print(`2) Leitura (SELECT) -> HTTP ${read.status}: ${await read.text()}`);
print("   A policy filtra tudo: a lista volta vazia mesmo que existam empresas.");

const write = await fetch(`${url}/rest/v1/companies`, {
  method: "POST",
  headers,
  body: JSON.stringify({
    owner_id: session.user.id,
    cnpj: "19131243000197",
    razao_social: "Tentativa sem 2FA",
  }),
});
print(`3) Gravação (INSERT) -> HTTP ${write.status}: ${await write.text()}`);
print("   O Postgres recusa a linha: a sessão não passou pelo segundo fator.");
