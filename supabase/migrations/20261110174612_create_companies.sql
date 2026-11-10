create table public.companies (
  id                 uuid primary key default gen_random_uuid(),
  owner_id           uuid not null references auth.users(id) on delete cascade,
  cnpj               char(14) not null,
  razao_social       text not null,
  nome_fantasia      text,
  situacao_cadastral text,
  municipio          text,
  uf                 char(2),
  created_at         timestamptz not null default now(),
  constraint companies_owner_cnpj_unique unique (owner_id, cnpj)
);

create index companies_owner_created_idx
  on public.companies (owner_id, created_at desc);

alter table public.companies enable row level security;

create policy "companies_select_own"
  on public.companies for select to authenticated
  using (owner_id = auth.uid() and (auth.jwt() ->> 'aal') = 'aal2');

create policy "companies_insert_own"
  on public.companies for insert to authenticated
  with check (owner_id = auth.uid() and (auth.jwt() ->> 'aal') = 'aal2');

create policy "companies_delete_own"
  on public.companies for delete to authenticated
  using (owner_id = auth.uid() and (auth.jwt() ->> 'aal') = 'aal2');
