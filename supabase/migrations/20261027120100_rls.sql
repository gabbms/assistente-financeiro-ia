-- Etapa 1: Row Level Security (docs/product-spec.md, seção 9, "RLS").
-- Segunda camada de isolamento entre usuários: mesmo que a API erre um filtro,
-- o Postgres só devolve e só aceita linhas do próprio usuário.
-- Sem política = acesso negado. O papel anon não recebe nenhuma política.
-- (select auth.uid()) é avaliado uma vez por consulta, e não uma vez por linha.

alter table public.profiles enable row level security;
alter table public.plans enable row level security;
alter table public.subscriptions enable row level security;
alter table public.accounts enable row level security;
alter table public.categories enable row level security;
alter table public.transactions enable row level security;

-- profiles: lê e edita só o próprio. A criação acontece no cadastro (etapa 2),
-- e a exclusão vem em cascata ao apagar o usuário.
create policy "profiles: ler o próprio" on public.profiles
  for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: editar o próprio" on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- plans: somente leitura para usuários autenticados.
create policy "plans: leitura" on public.plans
  for select to authenticated
  using (true);

-- subscriptions: o usuário só lê a própria; a escrita é feita pela service role.
create policy "subscriptions: ler a própria" on public.subscriptions
  for select to authenticated
  using (user_id = (select auth.uid()));

-- accounts: acesso total às próprias.
create policy "accounts: ler as próprias" on public.accounts
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "accounts: criar as próprias" on public.accounts
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "accounts: editar as próprias" on public.accounts
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "accounts: apagar as próprias" on public.accounts
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- categories: lê as do sistema e as próprias; escreve só nas próprias.
create policy "categories: ler as do sistema e as próprias" on public.categories
  for select to authenticated
  using (user_id is null or user_id = (select auth.uid()));

create policy "categories: criar as próprias" on public.categories
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "categories: editar as próprias" on public.categories
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "categories: apagar as próprias" on public.categories
  for delete to authenticated
  using (user_id = (select auth.uid()));

-- transactions: acesso total às próprias.
create policy "transactions: ler as próprias" on public.transactions
  for select to authenticated
  using (user_id = (select auth.uid()));

create policy "transactions: criar as próprias" on public.transactions
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy "transactions: editar as próprias" on public.transactions
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy "transactions: apagar as próprias" on public.transactions
  for delete to authenticated
  using (user_id = (select auth.uid()));
