-- Etapa 1: dados de referência que precisam existir em todos os ambientes.
-- Ficam numa migration (e não no seed.sql) porque o seed.sql só roda no banco local.

insert into public.plans (code, name, price_cents, ai_questions_per_month, max_accounts)
values ('mei_pro', 'MEI Pro', 2990, 100, null);

-- Categorias padrão do sistema (user_id null).
-- Só "Vendas/Serviços" conta como faturamento do MEI.
insert into public.categories (name, direction, context, counts_as_mei_revenue)
values
  -- PJ: entradas
  ('Vendas/Serviços', 'in', 'PJ', true),
  ('Outras entradas PJ', 'in', 'PJ', false),
  -- PJ: saídas
  ('DAS', 'out', 'PJ', false),
  ('Fornecedores', 'out', 'PJ', false),
  ('Ferramentas/Software', 'out', 'PJ', false),
  ('Transporte', 'out', 'PJ', false),
  ('Taxas de maquininha', 'out', 'PJ', false),
  ('Marketing', 'out', 'PJ', false),
  ('Outras despesas PJ', 'out', 'PJ', false),
  -- PF: entradas
  ('Outras entradas PF', 'in', 'PF', false),
  -- PF: saídas
  ('Mercado', 'out', 'PF', false),
  ('Moradia', 'out', 'PF', false),
  ('Contas da casa', 'out', 'PF', false),
  ('Saúde', 'out', 'PF', false),
  ('Educação', 'out', 'PF', false),
  ('Transporte', 'out', 'PF', false),
  ('Lazer', 'out', 'PF', false),
  ('Outras despesas PF', 'out', 'PF', false);
