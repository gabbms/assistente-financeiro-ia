-- Etapa 1: tabelas principais (docs/product-spec.md, seção 9).
-- Convenções: chaves uuid; dados do usuário com user_id -> auth.users (on delete cascade);
-- dinheiro em centavos (bigint, sempre positivo) com a direção em coluna separada.

-- Mantém updated_at sempre atualizado.
create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- profiles: 1:1 com auth.users -------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  segment text not null default 'mei' check (segment in ('mei')),
  mei_opened_on date,
  terms_version text,
  terms_accepted_at timestamptz,
  privacy_version text,
  privacy_accepted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

-- plans: catálogo de planos (sem user_id) --------------------------------------
create table public.plans (
  id uuid primary key default gen_random_uuid(),
  code text not null unique,
  name text not null,
  price_cents bigint not null check (price_cents >= 0),
  ai_questions_per_month integer not null check (ai_questions_per_month >= 0),
  max_accounts integer check (max_accounts > 0), -- null = ilimitado
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger plans_set_updated_at
before update on public.plans
for each row execute function public.set_updated_at();

-- subscriptions ---------------------------------------------------------------
create table public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  plan_id uuid not null references public.plans (id),
  status text not null check (status in ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  trial_ends_at timestamptz,
  current_period_end timestamptz,
  provider text check (provider in ('manual')), -- null no MVP
  provider_subscription_id text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index subscriptions_user_id_idx on public.subscriptions (user_id);

create trigger subscriptions_set_updated_at
before update on public.subscriptions
for each row execute function public.set_updated_at();

-- accounts: contas financeiras ------------------------------------------------
create table public.accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  bank_name text,
  type text not null check (type in ('PF', 'PJ', 'MISTA')),
  csv_mapping jsonb,
  archived_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Alvo da chave estrangeira composta de transactions (garante conta do mesmo usuário).
  unique (id, user_id)
);

create index accounts_user_id_idx on public.accounts (user_id);

create trigger accounts_set_updated_at
before update on public.accounts
for each row execute function public.set_updated_at();

-- categories: user_id null = categoria padrão do sistema -----------------------
create table public.categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users (id) on delete cascade,
  name text not null check (length(trim(name)) > 0),
  direction text not null check (direction in ('in', 'out')),
  context text not null check (context in ('PF', 'PJ', 'ANY')),
  counts_as_mei_revenue boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- Sem categorias repetidas por usuário (nem no sistema, onde user_id é null).
  unique nulls not distinct (user_id, name, direction, context)
);

create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

-- transactions ----------------------------------------------------------------
create table public.transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  account_id uuid not null,
  occurred_on date not null,
  amount_cents bigint not null check (amount_cents > 0),
  direction text not null check (direction in ('in', 'out')),
  description text not null,
  category_id uuid references public.categories (id) on delete set null,
  context text check (context in ('PF', 'PJ')), -- null = pendente de marcação (conta mista)
  kind text not null default 'normal' check (kind in ('normal', 'withdrawal', 'internal_transfer')),
  source text not null default 'manual' check (source in ('manual', 'ofx', 'csv')),
  import_batch_id uuid, -- a chave estrangeira entra junto com import_batches (etapa 6)
  external_id text, -- FITID do OFX
  dedupe_hash text, -- calculado pela API na importação
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- A conta precisa ser do mesmo usuário da transação.
  foreign key (account_id, user_id) references public.accounts (id, user_id) on delete cascade
);

create unique index transactions_account_external_id_key
  on public.transactions (account_id, external_id)
  where external_id is not null;
create index transactions_user_occurred_on_idx on public.transactions (user_id, occurred_on);
create index transactions_account_dedupe_hash_idx on public.transactions (account_id, dedupe_hash);
create index transactions_category_id_idx on public.transactions (category_id);

create trigger transactions_set_updated_at
before update on public.transactions
for each row execute function public.set_updated_at();

-- A categoria precisa ser do sistema ou do mesmo usuário da transação.
-- Vale também para a service role, que ignora o RLS.
create function public.check_transaction_category()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  if new.category_id is not null and not exists (
    select 1
    from public.categories c
    where c.id = new.category_id
      and (c.user_id is null or c.user_id = new.user_id)
  ) then
    raise exception 'categoria inválida para este usuário'
      using errcode = 'foreign_key_violation';
  end if;
  return new;
end;
$$;

create trigger transactions_check_category
before insert or update of category_id, user_id on public.transactions
for each row execute function public.check_transaction_category();
