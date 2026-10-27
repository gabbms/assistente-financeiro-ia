# Especificação do produto: assistente financeiro com IA para MEI (MVP)

> Versão 1.0, 27/10/2026. Gerada a partir da entrevista de requisitos com Gabriel.
> Nome do produto: **a definir** (placeholder neste documento: "o app").

## Como ler este documento

Cada decisão está marcada com uma das etiquetas abaixo:

| Etiqueta | Significado |
|---|---|
| ✅ **Confirmado** | Decidido por Gabriel na entrevista ou no `Contexto.txt` |
| 💡 **Recomendação** | Escolha técnica minha, com justificativa; pode ser revista sem impacto no escopo |
| ❓ **Hipótese** | Precisa ser validada com usuários reais ou com dados |

---

## 1. Visão do produto e problema

✅ O app é um **assistente financeiro para MEI e autônomos** que resolve duas dores específicas desse público:

1. **"Misturo o dinheiro da empresa com o meu."** O app separa o que é pessoal (PF) do que é do negócio (PJ), mostra quanto o negócio realmente lucrou e quanto o dono já retirou e ainda pode retirar.
2. **"Tenho medo de estourar o limite do MEI."** O app acompanha o faturamento acumulado no ano contra o teto do MEI, projeta quando ele será atingido, alerta com antecedência e lembra do vencimento do DAS.

Tudo isso vem acompanhado de um **chat com IA** que responde perguntas sobre os próprios dados do usuário, por exemplo "quanto lucrei em setembro?" ou "quanto falta para o limite?". Os números saem sempre de cálculos feitos no backend, nunca do modelo.

**Frase de venda (rascunho):** *"Separe o dinheiro do seu MEI do seu, saiba quanto você realmente lucra e nunca estoure o limite. Importe seu extrato e pergunte para a IA."*

### Por que isso e não um app de finanças genérico

- 💡 Apps como Pierre, Mobills e Organizze, além dos próprios bancos, atendem a pessoa física. Os apps de bancos PJ mostram só a conta PJ. **Ninguém junta as duas contas e responde "quanto meu negócio lucrou e quanto eu tirei pra mim"** de forma simples.
- 💡 O controle do limite do MEI é um assunto pequeno, mas ansiogênico e fácil de comunicar. Ele funciona bem em conteúdo de redes sociais (canal de aquisição B).
- ❓ A hipótese central a validar é que **MEIs pagam R$ 25–35/mês** para ter essa clareza sem planilha.

---

## 2. Perfil dos usuários e proposta de valor

✅ **Público inicial:** MEI e autônomos. O plano para jovens adultos CLT fica para depois, mas o modelo de dados já nasce preparado para ele.

**Persona principal (❓ a validar no beta):**
- MEI de serviços ou comércio, com 25 a 45 anos e faturamento de R$ 2 a 7 mil/mês.
- Tem conta PJ num banco digital (❓ Nubank PJ, Inter PJ, C6, Mercado Pago, PagBank) e conta PF em outro, mas mistura as duas na prática: recebe cliente na PF, paga mercado pela PJ.
- Também existe quem usa uma conta só para tudo, a "conta mista" (✅ ambos os perfis são suportados).
- Usa o celular para quase tudo e o computador ocasionalmente.
- Não tem contador, ou tem um contador barato que só emite a DASN.

**Proposta de valor:** clareza do lucro real e do limite do MEI em minutos por mês, sem planilha, com uma IA que explica os números.

---

## 3. Escopo do MVP

### 3.1 Dentro do MVP (✅ confirmado)

| # | Funcionalidade | Observações |
|---|---|---|
| 1 | Cadastro, login, logout e recuperação de senha | Supabase Auth (e-mail + senha). Aceite de termos e da política registrado |
| 2 | Contas financeiras do tipo **PF, PJ ou Mista** | Transações de contas PF/PJ herdam o contexto; contas mistas exigem marcação por transação |
| 3 | Transações: criar, editar, listar, excluir, categorizar | Valores em centavos (inteiros). Contexto PF/PJ por transação |
| 4 | **Marcação em lote** (contexto e categoria) | Essencial para contas mistas |
| 5 | **Importação OFX** (principal) e **CSV** (alternativa com mapeamento de colunas) | Pré-visualização, validação e prevenção de duplicatas |
| 6 | **Regras de categorização sem IA** | Por palavra-chave e pelo histórico do usuário ("aprende" quando ele confirma) |
| 7 | **Retiradas** (transferência PJ → PF) | Viram pró-labore ou distribuição de lucro, não despesa |
| 8 | Dashboard mobile-first | Receitas, despesas e saldo por contexto; lucro PJ; retiradas; categorias; gráficos |
| 9 | **Painel do limite do MEI** | Acumulado do ano, % do teto, projeção, alertas |
| 10 | **Alertas determinísticos** | % do limite (70/90/100%), DAS próximo do vencimento, conta sem importação recente |
| 11 | **Chat com IA** com ferramentas controladas | Vê apenas dados agregados. Histórico de conversas |
| 12 | **Resumo mensal escrito pela IA** | Do mês anterior fechado, gerado na primeira abertura do dashboard no mês e salvo |
| 13 | **Limite de 100 perguntas/mês** com contador visível | Configurável por plano no banco |
| 14 | Plano pago único com **teste de 14 dias**; cobrança **manual** (Pix/link) | Acesso liberado por um campo no banco |
| 15 | LGPD: exclusão de conta, exportação CSV, retenção do chat por 12 meses | |
| 16 | PWA instalável, interface em pt-BR, modo claro/escuro | |

### 3.2 Explicitamente adiado (✅ confirmado como "depois")

| Item | Quando reconsiderar |
|---|---|
| Plano para jovem adulto CLT | Após validar o público MEI |
| Previsão de fluxo de caixa (contas a pagar/receber, recorrências) | Primeira melhoria pós-MVP |
| Categorização por IA | Quando as regras não forem suficientes |
| Resumo/alertas por e-mail ou push | Depois do MVP (exige agendador + serviço de e-mail) |
| Gateway de pagamento com assinatura recorrente (Asaas, Stripe ou Mercado Pago) | Ao passar de ~10–20 clientes pagantes |
| Plano grátis / freemium | Só se o modelo pago com teste não converter |
| Chat ilimitado | Rever com base no feedback |
| IA vendo descrições de transações (mascaradas) | Exige atualização da política de privacidade |
| Importação de PDF | Frágil, exigiria IA |
| Open Finance / conexão bancária real | Fora do MVP (regra do Contexto.txt) |
| WhatsApp | Fora do MVP |
| App nativo (React Native/Expo) | Depois de ter clientes pagantes |
| Parceria e acesso para contadores | Futuro (Gabriel tem interesse) |
| Emissão de nota fiscal, DASN, cálculo do valor do DAS | Fora do escopo |

---

## 4. Requisitos funcionais

### RF-01 Autenticação e conta
- RF-01.1 Cadastro com nome, e-mail e senha; confirmação de e-mail obrigatória.
- RF-01.2 Login, logout e recuperação de senha por e-mail.
- RF-01.3 Aceite dos Termos de Uso e da Política de Privacidade no cadastro, com a versão e a data registradas.
- RF-01.4 Onboarding: (a) data de abertura do MEI (para o limite proporcional), (b) cadastrar pelo menos uma conta, (c) importar o primeiro extrato ou lançar manualmente.
- RF-01.5 Exclusão da conta pelo próprio usuário, que apaga **todos** os dados imediatamente (hard delete).
- RF-01.6 Exportação de todos os dados do usuário em CSV.

### RF-02 Contas financeiras
- RF-02.1 CRUD de contas com nome, banco (opcional) e tipo **PF / PJ / MISTA**.
- RF-02.2 Arquivar uma conta sem apagar o histórico.

### RF-03 Transações
- RF-03.1 CRUD de transações: data, valor (centavos), direção (entrada/saída), descrição, categoria, contexto (PF/PJ), tipo (normal / retirada / transferência interna).
- RF-03.2 Contexto padrão = tipo da conta. Em conta MISTA, o padrão é "não definido" e a transação aparece como pendente de marcação.
- RF-03.3 Listagem com filtros por mês, conta, contexto, categoria, pendentes de marcação e busca por texto; paginação.
- RF-03.4 Seleção múltipla com ações em lote: definir contexto, definir categoria, excluir.
- RF-03.5 Uma transferência entre uma conta PJ e uma conta PF do mesmo usuário pode ser marcada como **retirada**. Retiradas não contam como despesa PJ nem como receita PF tributável no dashboard.
- RF-03.6 Ao corrigir manualmente a categoria ou o contexto, o app oferece "aplicar a transações parecidas e lembrar", o que cria uma regra.

### RF-04 Importação
- RF-04.1 Upload de arquivo **OFX** (até 2 MB) associado a uma conta.
- RF-04.2 Upload de **CSV** com mapeamento de colunas (data, descrição, valor ou crédito/débito), formato de data e separador decimal. O mapeamento fica salvo por conta para a próxima importação.
- RF-04.3 Pré-visualização antes de gravar: cada linha marcada como **nova**, **duplicada** ou **inválida** (com o motivo). O usuário pode desmarcar linhas.
- RF-04.4 Prevenção de duplicatas:
  - OFX: o identificador `FITID` é único por conta.
  - CSV: um hash de (conta, data, valor, descrição normalizada); se o mesmo hash já existir, a linha é marcada como "possível duplicata" e vem desmarcada por padrão.
- RF-04.5 Na confirmação, as regras de categorização e o contexto padrão da conta são aplicados.
- RF-04.6 Histórico de importações com a opção de **desfazer uma importação**, que apaga as transações daquele lote.

### RF-05 Dashboard
- RF-05.1 Seletor de mês (padrão: mês atual).
- RF-05.2 Cartões: **Receita PJ**, **Despesa PJ**, **Lucro PJ** (receita − despesa), **Retiradas**, **Saldo PF** do mês.
- RF-05.3 Gráfico de despesas por categoria (PF e PJ separados) e evolução dos últimos 6 meses (receita × despesa PJ).
- RF-05.4 Indicador de transações pendentes de marcação.
- RF-05.5 Card do resumo mensal da IA (ver RF-08).

### RF-06 Limite do MEI e alertas
- RF-06.1 Faturamento acumulado no ano = soma das receitas PJ marcadas como faturamento (categorias com `counts_as_mei_revenue = true`).
- RF-06.2 Teto anual **configurável** (hoje R$ 81.000). No ano de abertura, o teto é proporcional: R$ 6.750 × meses desde a abertura, contando o mês de abertura.
- RF-06.3 Projeção linear: com a média mensal do ano, informa o mês estimado em que o teto será atingido.
- RF-06.4 Alertas determinísticos exibidos no dashboard:
  - limite em 70%, 90% e 100%;
  - excesso de até 20% (paga a diferença) × acima de 20% (desenquadramento retroativo), com texto explicativo e recomendação de procurar um contador;
  - DAS vence dia 20, com o alerta mostrado a partir do dia 15 (lembrete, sem calcular valor);
  - conta sem transações importadas há mais de 15 dias.
- RF-06.5 Os alertas não dependem da IA e funcionam mesmo se ela estiver indisponível.

### RF-07 Chat com IA
- RF-07.1 Conversas com título, histórico e opção de excluir uma conversa.
- RF-07.2 A IA responde em pt-BR usando **apenas ferramentas do backend** (ver seção 10) que retornam dados agregados.
- RF-07.3 Limite de **100 perguntas por mês** por usuário (configurável por plano); contador "37/100" visível; mensagem clara ao atingir o limite.
- RF-07.4 Sugestões de perguntas iniciais ("Quanto lucrei mês passado?", "Quanto falta para o limite do MEI?", "Quanto já retirei este ano?").
- RF-07.5 A IA recusa assuntos fora das finanças do usuário e não dá recomendação de investimento.

### RF-08 Resumo mensal
- RF-08.1 Na primeira abertura do dashboard em um mês, o backend gera o resumo do **mês anterior** (se ainda não existir) e o salva.
- RF-08.2 O texto é escrito pela IA a partir de um objeto de fatos calculado no backend. O backend valida que todo número citado no texto existe nos fatos; se a validação falhar, mostra um resumo em formato de template, sem IA.
- RF-08.3 O resumo avisa quando alguma conta não tem dados de parte do mês.
- RF-08.4 O resumo não consome a cota de 100 perguntas.

### RF-09 Assinatura
- RF-09.1 Novo usuário começa em `trialing` com `trial_ends_at = cadastro + 14 dias`.
- RF-09.2 Ao fim do teste sem pagamento, o acesso fica em **somente leitura** (vê os dados e exporta, mas não importa nem usa o chat), e uma tela explica como assinar.
- RF-09.3 Ativação manual pelo administrador (Gabriel), por script ou pelo painel do Supabase, que muda o status para `active` e define `current_period_end`.
- RF-09.4 Estrutura pronta para um gateway futuro: tabela `subscriptions` com `provider` e `provider_subscription_id` nulos no MVP.

---

## 5. Requisitos não funcionais

| ID | Requisito |
|---|---|
| RNF-01 | **Isolamento:** um usuário nunca acessa dados de outro. Há duas camadas: verificação na API + RLS no Postgres. Coberto por testes automatizados |
| RNF-02 | **Dinheiro em centavos** (`bigint`), cálculos só no backend, sem `float` |
| RNF-03 | Datas armazenadas como `date` (transações) ou `timestamptz` (eventos); fuso de referência `America/Sao_Paulo` |
| RNF-04 | Interface em pt-BR, mobile-first, responsiva de 360 px até desktop; acessível (contraste AA, navegável por teclado) |
| RNF-05 | PWA instalável (manifest + service worker para os arquivos estáticos; sem modo offline de dados no MVP) |
| RNF-06 | Desempenho: dashboard em menos de 1,5 s com a API "acordada" e até 5 mil transações por usuário |
| RNF-07 | Chaves secretas só no backend e em variáveis de ambiente; nunca no frontend nem no Git |
| RNF-08 | Migrations versionadas (Supabase CLI) |
| RNF-09 | Custo de infraestrutura **R$ 0** até o primeiro cliente pagante |
| RNF-10 | Toda funcionalidade com testes; CI roda lint, typecheck e testes em cada push |
| RNF-11 | Logs sem dados financeiros nem descrições de transações |

---

## 6. Fluxos principais do usuário

**F1. Primeiro acesso (meta: "aha" em menos de 10 minutos)**
1. Landing page → "Testar 14 dias grátis".
2. Cadastro → confirmação de e-mail → aceite dos termos.
3. Onboarding: data de abertura do MEI → cadastrar "Conta PJ" (tipo PJ) e "Conta pessoal" (tipo PF ou Mista).
4. "Importe seu extrato": um tutorial curto de como baixar OFX no banco (começando pelos bancos-hipótese) → upload → pré-visualização → confirmar.
5. Dashboard: lucro PJ do mês, % do limite do MEI e pendentes de marcação.
6. Sugestão: "Pergunte à IA: quanto lucrei mês passado?".

**F2. Rotina mensal**
1. Abre o app (no celular) → vê o resumo do mês anterior e os alertas.
2. Importa os extratos do mês (provavelmente no computador).
3. Marca em lote as pendentes da conta mista; o app sugere criar regras.
4. Confere o lucro, as retiradas e o limite; faz perguntas no chat.

**F3. Importação**
Escolher conta → enviar arquivo → (CSV: mapear colunas) → pré-visualização com novas, duplicadas e inválidas → desmarcar o que quiser → confirmar → resumo "52 importadas, 3 duplicadas ignoradas".

**F4. Chat**
Abrir chat → digitar pergunta → backend checa a cota → modelo chama ferramentas → backend executa com o `user_id` da sessão → modelo responde → resposta e uso salvos → contador atualizado.

**F5. Fim do teste**
No dia 14, a tela de assinatura mostra os dados do Pix ou o link → Gabriel confirma o pagamento e ativa → o usuário volta ao acesso completo.

**F6. Exclusão de conta**
Configurações → "Excluir minha conta" → confirmação digitando "EXCLUIR" → apagar dados e usuário do Auth → logout.

---

## 7. Arquitetura recomendada

```
 [Navegador / PWA]  React + Vite + TS + Tailwind + shadcn/ui
        │  (1) login direto no Supabase Auth → recebe JWT
        │  (2) chamadas REST com "Authorization: Bearer <JWT>"
        ▼
 [API Fastify + TS]  (Render)
   ├─ verifica o JWT (chave do Supabase)
   ├─ módulos: accounts, transactions, imports, dashboard, mei, chat, summaries, me
   ├─ cálculos financeiros (centavos) — pacote compartilhado
   ├─ cliente Supabase "como o usuário" (JWT repassado → RLS ativa)
   └─ chamadas à OpenAI (tool calling) — só aqui ficam as chaves
        ▼
 [Supabase]  Postgres + Auth + RLS   (sem Storage no MVP)
```

| Decisão | Status | Justificativa |
|---|---|---|
| React, Vite, TS, Tailwind, shadcn/ui | ✅ | Stack do Contexto.txt; ótima para mobile-first |
| Fastify + TS + Zod | ✅ | Stack do Contexto.txt |
| Supabase (Postgres + Auth) com RLS | ✅ | Stack do Contexto.txt |
| OpenAI, acessada só pelo backend | ✅ | Contexto.txt |
| Frontend **não** acessa tabelas do Supabase diretamente, só Auth | 💡 | Um único caminho de acesso a dados (a API) é mais fácil de testar e auditar. A RLS fica como segunda camada caso algo vaze |
| API usa o **JWT do usuário** no cliente Supabase (não a service role) | 💡 | Assim a RLS também protege contra bugs na API. A service role fica restrita a exclusão de conta e ativação de assinatura |
| Monorepo com **pnpm workspaces** | 💡 | Compartilha schemas Zod e tipos entre web e API sem publicar pacotes; mais simples que Turborepo/Nx |
| Frontend na **Cloudflare Pages** (grátis, uso comercial permitido) | ✅ | Decidido na entrevista |
| API no **Render** (grátis → US$ 7 no primeiro pagante) | ✅ | Mantém o Fastify; aceita o *cold start* durante o desenvolvimento |
| TanStack Query no frontend + React Router | 💡 | Cache e estados de carregamento padrão, pouca configuração |
| Recharts para gráficos | 💡 | Bem integrado ao shadcn/ui (componente Chart) |
| Parser de OFX próprio e pequeno (SGML/XML), com testes por banco | 💡 | Bibliotecas OFX em JS são pouco mantidas; o formato que precisamos é simples |
| Papa Parse para CSV | 💡 | Robusto com separadores e aspas, sem dependências |
| Sentry (plano grátis) para erros; logs do Render | 💡 | Custo zero |
| Sem filas, cron, Redis ou Storage no MVP | 💡 | Evita complexidade prematura; o resumo mensal é gerado sob demanda |

**Por que não Supabase Edge Functions no lugar do Fastify?** Elas rodam em Deno, exigem uma stack diferente e são mais difíceis de testar localmente para quem está aprendendo. O Fastify mantém o backend portátil, com opção de migrar para Hono/Workers depois.

---

## 8. Estrutura de pastas (💡)

```
/
├─ apps/
│  ├─ web/                      # React + Vite (PWA)
│  │  ├─ src/
│  │  │  ├─ app/                # rotas, layout, providers
│  │  │  ├─ features/
│  │  │  │  ├─ auth/
│  │  │  │  ├─ onboarding/
│  │  │  │  ├─ accounts/
│  │  │  │  ├─ transactions/
│  │  │  │  ├─ imports/
│  │  │  │  ├─ dashboard/
│  │  │  │  ├─ mei-limit/
│  │  │  │  ├─ chat/
│  │  │  │  └─ settings/
│  │  │  ├─ components/ui/      # shadcn/ui
│  │  │  ├─ lib/                # api client, supabase auth client, format (R$)
│  │  │  └─ styles/             # tokens de tema (cores trocáveis)
│  │  └─ public/                # manifest, ícones
│  └─ api/                      # Fastify
│     ├─ src/
│     │  ├─ server.ts
│     │  ├─ plugins/            # auth (JWT), supabase, errors, rate-limit
│     │  ├─ modules/
│     │  │  ├─ me/
│     │  │  ├─ accounts/
│     │  │  ├─ categories/
│     │  │  ├─ transactions/
│     │  │  ├─ imports/         # parsers/ofx.ts, parsers/csv.ts, dedupe.ts
│     │  │  ├─ rules/
│     │  │  ├─ dashboard/
│     │  │  ├─ mei/
│     │  │  ├─ chat/            # tools.ts, prompt.ts, openai.ts
│     │  │  ├─ summaries/
│     │  │  └─ subscriptions/
│     │  └─ config/env.ts       # validação das variáveis com Zod
│     └─ test/
│        ├─ integration/        # contra Supabase local
│        └─ fixtures/ofx/       # extratos anonimizados por banco
├─ packages/
│  └─ shared/                   # schemas Zod, tipos, money.ts, mei.ts
├─ supabase/
│  ├─ migrations/               # inclui os dados de referência (planos, categorias padrão)
│  ├─ seed.sql                  # só dados de desenvolvimento local
│  └─ config.toml
├─ docs/
│  ├─ product-spec.md
│  └─ decisions/                # registros curtos de decisões (ADR)
├─ .github/workflows/ci.yml
├─ .env.example
└─ pnpm-workspace.yaml
```

---

## 9. Modelo do banco de dados (💡)

Convenções: chaves `uuid`; toda tabela de dados do usuário tem `user_id uuid not null references auth.users on delete cascade`; `created_at`/`updated_at timestamptz`; dinheiro em `bigint` (centavos, sempre **positivo**) com a direção em uma coluna separada.

### Tabelas

**profiles**: 1:1 com `auth.users`
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | = auth.users.id |
| full_name | text | |
| segment | text | `'mei'` (futuro: `'personal'`), prepara o plano CLT |
| mei_opened_on | date null | para o teto proporcional |
| terms_version / terms_accepted_at | text / timestamptz | LGPD |
| privacy_version / privacy_accepted_at | text / timestamptz | LGPD |

**plans**: catálogo (sem `user_id`, leitura pública)
| id | code (`'mei_pro'`) | name | price_cents | ai_questions_per_month (100) | max_accounts (null = ilimitado) | is_active |

**subscriptions**
| id | user_id | plan_id | status (`trialing`/`active`/`past_due`/`canceled`/`expired`) | trial_ends_at | current_period_end | provider (null/`'manual'`) | provider_subscription_id null | notes |

**accounts**
| id | user_id | name | bank_name null | type (`PF`/`PJ`/`MISTA`) | csv_mapping jsonb null | archived_at null |

**categories**
| id | user_id **null** (null = categoria padrão do sistema) | name | direction (`in`/`out`) | context (`PF`/`PJ`/`ANY`) | counts_as_mei_revenue bool | is_active |

Categorias padrão (criadas por migration, e não pelo `seed.sql`, que só roda no banco local), por exemplo: PJ entrada "Vendas/Serviços" (conta como faturamento), "Outras entradas PJ" (não conta); PJ saída "DAS", "Fornecedores", "Ferramentas/Software", "Transporte", "Taxas de maquininha"; PF "Mercado", "Moradia", "Saúde", "Lazer", entre outras.

**transactions**
| coluna | tipo | notas |
|---|---|---|
| id | uuid PK | |
| user_id | uuid | |
| account_id | uuid FK accounts | mesmo `user_id`, garantido pela chave estrangeira composta `(account_id, user_id)` → `accounts(id, user_id)` |
| occurred_on | date | |
| amount_cents | bigint > 0 | |
| direction | `in`/`out` | |
| description | text | descrição original do banco |
| category_id | uuid null | do sistema ou do mesmo `user_id` (verificado por trigger) |
| context | `PF`/`PJ`/null | null = pendente (conta mista) |
| kind | `normal`/`withdrawal`/`internal_transfer` | retiradas e transferências fora dos totais de despesa |
| source | `manual`/`ofx`/`csv` | |
| import_batch_id | uuid null | permite desfazer a importação |
| external_id | text null | `FITID` do OFX |
| dedupe_hash | text null | calculado pela API na importação: sha256(account_id, data, valor, direção, descrição normalizada) |
| Índices | | `unique(account_id, external_id) where external_id is not null`; `(user_id, occurred_on)`; `(account_id, dedupe_hash)` |

**import_batches**
| id | user_id | account_id | file_name | format (`ofx`/`csv`) | status (`preview`/`committed`/`discarded`) | preview_rows jsonb (apagado após commit ou em 24 h) | rows_total | rows_imported | rows_duplicated | rows_invalid |

**categorization_rules**
| id | user_id | match_text (normalizado) | match_type (`contains`) | account_id null | set_category_id null | set_context null | set_kind null | priority | times_applied |

**conversations**
| id | user_id | title | created_at | updated_at |

**messages**
| id | user_id | conversation_id | role (`user`/`assistant`/`tool`) | content text | tool_name null | tool_payload jsonb null (resultado agregado) | input_tokens | output_tokens | created_at |

**ai_usage_monthly**
| user_id | period (`'2026-10'`) | questions_used | input_tokens | output_tokens | PK (user_id, period) |

**monthly_summaries**
| id | user_id | month (date, dia 1) | facts jsonb | content text | generator (`'ai'`/`'template'`) | model | unique(user_id, month) |

### Relacionamentos

```
auth.users 1─1 profiles
auth.users 1─N subscriptions N─1 plans
auth.users 1─N accounts 1─N transactions N─1 categories
accounts 1─N import_batches 1─N transactions
auth.users 1─N categorization_rules
auth.users 1─N conversations 1─N messages
auth.users 1─N ai_usage_monthly, monthly_summaries
```

### RLS (todas as tabelas com `user_id`)
- `select/insert/update/delete` permitido somente quando `user_id = auth.uid()`.
- `categories`: leitura de `user_id is null or user_id = auth.uid()`; escrita só nas próprias.
- `plans`: somente leitura para usuários autenticados.
- `subscriptions`: o usuário só **lê** a própria; escrita apenas pela service role.
- `ai_usage_monthly`: o usuário só lê; o incremento é feito por função `security definer` chamada pela API, para evitar que o usuário "zere" a cota.
- Retenção: um job manual/SQL (no MVP, um script rodado mensalmente) apaga `messages` com mais de 12 meses.

### Agregados calculados (no backend, nunca no modelo)
- Receita PJ = Σ `in`, `context=PJ`, `kind=normal`
- Despesa PJ = Σ `out`, `context=PJ`, `kind=normal`
- Lucro PJ = Receita PJ − Despesa PJ
- Retiradas = Σ `kind=withdrawal` (saídas da conta PJ)
- Faturamento MEI do ano = Σ `in`, `context=PJ`, `kind=normal`, categoria com `counts_as_mei_revenue`; **transações sem categoria entram por padrão** (postura conservadora: é melhor alertar a mais), e isso é mostrado ao usuário

---

## 10. Contratos das APIs (💡)

Base `/v1`, JSON, `Authorization: Bearer <JWT do Supabase>` em todas as rotas exceto `/health`. Valores monetários em **centavos (inteiros)**. Datas em `YYYY-MM-DD`, meses em `YYYY-MM`. Validação de entrada e saída com Zod (schemas em `packages/shared`).

**Formato de erro**
```json
{ "error": { "code": "VALIDATION_ERROR", "message": "Mensagem em pt-BR", "details": {} } }
```
Códigos: `UNAUTHENTICATED` 401, `FORBIDDEN` 403, `NOT_FOUND` 404 (também para recursos de outro usuário, para não revelar que existem), `VALIDATION_ERROR` 422, `QUOTA_EXCEEDED` 429, `SUBSCRIPTION_REQUIRED` 402, `INTERNAL` 500.

### Conta e usuário
| Método | Rota | Descrição |
|---|---|---|
| GET | `/health` | status (público) |
| GET | `/v1/me` | perfil + assinatura + uso de IA do mês |
| PATCH | `/v1/me` | `{ fullName?, meiOpenedOn? }` |
| POST | `/v1/me/consents` | `{ termsVersion, privacyVersion }` |
| GET | `/v1/me/export` | CSV (zip) com todos os dados |
| DELETE | `/v1/me` | `{ confirm: "EXCLUIR" }` → 204 |

### Contas
| GET `/v1/accounts` | POST `/v1/accounts` `{ name, bankName?, type }` | PATCH `/v1/accounts/:id` | DELETE `/v1/accounts/:id` (arquiva se houver transações) |

### Categorias e regras
| GET `/v1/categories` | POST `/v1/categories` | PATCH `/v1/categories/:id` | DELETE `/v1/categories/:id` |
| GET `/v1/rules` | POST `/v1/rules` `{ matchText, setCategoryId?, setContext?, setKind?, applyToExisting: boolean }` | DELETE `/v1/rules/:id` |

### Transações
| Método | Rota | Corpo / query |
|---|---|---|
| GET | `/v1/transactions` | `?month=2026-10&accountId&context=PF\|PJ\|pending&categoryId&q&page&pageSize` → `{ items, total, page }` |
| POST | `/v1/transactions` | `{ accountId, occurredOn, amountCents, direction, description, categoryId?, context?, kind? }` |
| PATCH | `/v1/transactions/:id` | campos parciais |
| DELETE | `/v1/transactions/:id` | 204 |
| POST | `/v1/transactions/bulk` | `{ ids: uuid[] (≤500), action: "update"\|"delete", set?: { categoryId?, context?, kind? } }` → `{ affected }` |

### Importação
| Método | Rota | Descrição |
|---|---|---|
| POST | `/v1/imports` | multipart `file` + `accountId` + (CSV) `mapping?` → `{ batchId, format, rows: [{ rowId, occurredOn, amountCents, direction, description, status: "new"\|"duplicate"\|"possible_duplicate"\|"invalid", reason?, suggestedCategoryId?, suggestedContext? }], counts }` |
| POST | `/v1/imports/:batchId/commit` | `{ rowIds: string[] }` → `{ imported, skipped }` |
| DELETE | `/v1/imports/:batchId` | descarta a pré-visualização **ou** desfaz uma importação confirmada |
| GET | `/v1/imports` | histórico |

### Dashboard, MEI e resumo
| Método | Rota | Resposta |
|---|---|---|
| GET | `/v1/dashboard?month=2026-10` | `{ pj: { revenueCents, expenseCents, profitCents }, withdrawalsCents, pf: { incomeCents, expenseCents, balanceCents }, byCategory: [...], last6Months: [...], pendingCount, alerts: [{ code, severity, message }] }` |
| GET | `/v1/mei/limit?year=2026` | `{ capCents, revenueYtdCents, percent, projectedMonthToCap, uncategorizedIncludedCents, monthly: [...] }` |
| GET | `/v1/summaries/2026-09` | gera, se não existir, e retorna `{ month, content, generator, facts }` |

### Chat
| Método | Rota | Descrição |
|---|---|---|
| GET | `/v1/conversations` | lista |
| POST | `/v1/conversations` | `{ title? }` → conversa |
| GET | `/v1/conversations/:id/messages` | mensagens (sem `tool_payload` bruto) |
| POST | `/v1/conversations/:id/messages` | `{ content (≤1000 caracteres) }` → `{ message, usage: { used, limit } }`; 429 `QUOTA_EXCEEDED` |
| DELETE | `/v1/conversations/:id` | 204 |

💡 Streaming da resposta (SSE) fica como melhoria. No MVP, a resposta vem completa, com indicador de "digitando".

---

## 11. Estratégia de integração com a IA

✅ OpenAI, **somente no backend**, com **tool calling**. ✅ A IA vê **somente dados agregados**; descrições de transações nunca saem do servidor.

### Modelo
- 💡 Usar o modelo pequeno/barato mais recente da OpenAI com suporte a tool calling (família "mini"). O nome do modelo fica numa variável de ambiente (`OPENAI_MODEL`) para trocar sem deploy de código.
- 💡 Temperatura baixa; no máximo **5 chamadas de ferramenta por pergunta** e **8 mensagens anteriores** de contexto.

### Ferramentas (todas recebem `user_id` da **sessão**, nunca do modelo)
| Ferramenta | Parâmetros (validados com Zod) | Retorna |
|---|---|---|
| `get_month_overview` | `month` | receita/despesa/lucro PJ, retiradas, entradas/saídas PF |
| `get_category_breakdown` | `month`, `context`, `direction` | top categorias com totais |
| `compare_months` | `monthA`, `monthB`, `context` | totais e variação % |
| `get_trend` | `fromMonth`, `toMonth` (≤12 meses), `context` | série mensal |
| `get_mei_limit_status` | `year` | teto, acumulado, %, projeção |
| `get_withdrawals` | `fromMonth`, `toMonth` | retiradas por mês |
| `get_data_coverage` | — | contas, período com dados e dias sem importação |

- Nunca SQL gerado pelo modelo (✅ Contexto.txt); cada ferramenta é uma função TypeScript com consulta fixa.
- Os resultados chegam em reais **já formatados** ("R$ 4.230,15") **e** em centavos, para o modelo não precisar converter.

### Prompt de sistema (resumo)
- Papel: assistente financeiro de MEI, em pt-BR, tom simples e direto.
- Usar **somente** números retornados pelas ferramentas; se faltar dado, dizer isso e sugerir importar o extrato.
- Não dar recomendação de investimento nem orientação tributária definitiva; para desenquadramento e impostos, sugerir um contador.
- Recusar assuntos fora das finanças do usuário.
- Data atual e mês corrente injetados pelo backend.

### Resumo mensal
- O backend monta `facts` (lucro, variação, maiores categorias, % do limite, cobertura de dados) → o modelo escreve de 3 a 5 frases → o backend extrai todos os números do texto e confere com `facts` → se falhar, usa o template.

### Controles de custo e abuso
- A cota de 100 perguntas/mês é checada **antes** de chamar a OpenAI e incrementada de forma atômica.
- Limite de 1.000 caracteres por pergunta; rate-limit de 10 perguntas/minuto por usuário.
- Limite de gasto mensal configurado no painel da OpenAI (✅ US$ 5 durante o desenvolvimento).
- Registro de tokens por mensagem para medir o custo real por usuário.

### Privacidade
- 💡 Com o mascaramento adiado, a IA não recebe nome, e-mail, CPF/CNPJ nem descrições. Mudar isso no futuro = criar uma nova ferramenta + atualizar a política + avisar os usuários (✅ confirmado como possível).

---

## 12. Segurança e privacidade (LGPD)

### Segurança
- Duas camadas de isolamento: (1) a API extrai `user_id` do JWT verificado e filtra tudo por ele; (2) RLS no Postgres com o JWT do usuário.
- Testes automatizados de isolamento: usuário B não lê, edita, exclui nem importa em recurso do usuário A, nem via chat (ferramentas).
- A service role do Supabase existe **só** no backend, usada apenas para exclusão de conta e ativação de assinatura.
- Validação Zod em todas as entradas; limite de tamanho de upload (2 MB) e de linhas (5 mil por arquivo).
- CORS restrito ao domínio do frontend; `@fastify/helmet`; `@fastify/rate-limit`.
- Defesa contra *prompt injection* via descrição de transação: neutralizada, porque descrições não chegam ao modelo.
- Dependências: Dependabot + `pnpm audit` no CI.
- Segredos: `.env` fora do Git, `.env.example` versionado, variáveis no Render e na Cloudflare.

### LGPD
- Bases legais: execução de contrato (dados financeiros para prestar o serviço) e consentimento registrado para os termos.
- **Política de Privacidade** e **Termos de Uso** em linguagem simples, citando a OpenAI como operadora (dados agregados, retenção de até 30 dias pela OpenAI, sem uso para treino) e Supabase, Render e Cloudflare como provedores. ❓ Revisão por um advogado antes de cobrar é recomendada.
- Direitos do titular: acesso/exportação (CSV), correção (edição), exclusão (imediata), informação (página de privacidade).
- Retenção: dados financeiros enquanto a conta existir; chat por 12 meses; prévias de importação por 24 h; os arquivos enviados **não são armazenados** (processados em memória).
- Minimização: sem coleta de CPF/CNPJ no MVP (desnecessários).
- 💡 Região do banco: escolher São Paulo (`sa-east-1`) no Supabase, se estiver disponível no plano grátis; caso contrário, registrar a transferência internacional na política.
- Incidentes: canal de contato (e-mail) e procedimento simples documentado em `docs/`.

---

## 13. Estimativa de custos e operação

### Custos de infraestrutura (valores aproximados, US$ 1 ≈ R$ 5,50)
| Fase | Itens | Custo/mês |
|---|---|---|
| **0. Desenvolvimento e beta grátis** | Supabase Free, Render Free, Cloudflare Pages, Sentry Free, OpenAI com limite de US$ 5 | **R$ 0–30** |
| **1. Primeiro cliente pagante** | Render Starter US$ 7 + Supabase Pro US$ 25 (backups diários, sem pausa) + domínio (~R$ 40/ano) | **≈ R$ 180–190** |
| **Escala até ~200 clientes** | O mesmo, mais OpenAI proporcional | ≈ R$ 190 + IA |

⚠️ O plano grátis do Supabase **pausa após 7 dias sem uso** e **não tem backup**. Ele serve para desenvolvimento e beta com amigos avisados, mas não para clientes pagantes.

### Custo de IA por usuário (❓ estimativa a medir)
- Pergunta típica: ~3–4 mil tokens de entrada + ~300 de saída com modelo "mini" → **≈ R$ 0,01–0,05** por pergunta.
- Pior caso (100 perguntas): **≈ R$ 5/usuário/mês**; uso típico esperado de 10 a 20 perguntas: **≈ R$ 0,50–1,00**.
- Resumo mensal: **< R$ 0,05**/usuário/mês.

### Preço proposto (💡, ❓ validar no beta)
- **R$ 29,90/mês**, com teste de 14 dias. Preço de fundador no beta: **R$ 19,90/mês vitalício** para os primeiros 20 clientes.
- Ponto de equilíbrio da fase 1 (≈ R$ 190/mês): **~7–10 clientes** pagando R$ 19,90–29,90.
- Margem por cliente no pior caso de IA: R$ 29,90 − R$ 5 − taxa de pagamento (~R$ 1) ≈ R$ 24.

### Operação (estimativa para Gabriel)
- Ativar assinaturas manualmente: ~5 min por cliente/mês.
- Suporte por e-mail ou WhatsApp pessoal no beta.
- Rotina mensal: rodar o script de retenção do chat, conferir o Sentry e o custo da OpenAI.

---

## 14. Plano de implementação por etapas

✅ Ritmo de 2 a 3 h/dia; ✅ uma funcionalidade por vez; cada etapa termina com testes passando e um resultado demonstrável. **Total estimado: 8 a 10 semanas.**

| Etapa | Entrega | Estimativa |
|---|---|---|
| **0. Ambiente e monorepo** | Repositório GitHub, pnpm workspaces, `apps/web` e `apps/api` "olá mundo", `packages/shared`, TS strict, ESLint/Prettier, Vitest, CI no GitHub Actions, `.env.example` | 2–3 dias |
| **1. Banco e isolamento** | Supabase local (CLI) + projeto cloud; migrations de `profiles`, `plans`, `subscriptions`, `accounts`, `categories`, `transactions`; RLS; seed; **testes de isolamento** | 3–4 dias |
| **2. Autenticação** | Telas de cadastro, login, logout e recuperação; aceite de termos; plugin de JWT na API; `GET/PATCH /v1/me`; rotas protegidas; trial criado no cadastro | 3–4 dias |
| **3. Contas e transações** | `money.ts` (centavos, formatação BRL) com testes; CRUD de contas e transações; listagem com filtros; layout mobile-first + tema | 4–5 dias |
| **4. Dashboard PF/PJ** | Agregados (lucro, retiradas) com testes; cartões e gráficos; seletor de mês | 3–4 dias |
| **5. Limite do MEI e alertas** | `mei.ts` (teto proporcional, projeção, faixas de excesso) com testes; painel e alertas | 2–3 dias |
| **6. Importação OFX** | Parser + fixtures dos bancos-hipótese; pré-visualização; dedupe por FITID; commit; desfazer | 4–5 dias |
| **7. CSV + regras + lote** | Mapeamento de colunas; hash de dedupe; regras de categorização; marcação em lote; pendentes | 4–5 dias |
| **8. Chat com IA** | Ferramentas + testes (inclusive de isolamento); prompt; cota e contador; histórico; UI do chat | 5–6 dias |
| **9. Resumo mensal** | `facts` + geração sob demanda + validação de números + fallback em template | 2 dias |
| **10. Assinatura, LGPD e PWA** | Modo somente leitura pós-teste; script de ativação; exportação; exclusão de conta; páginas de termos e privacidade; manifest + service worker | 3–4 dias |
| **11. Deploy e beta** | Cloudflare Pages + Render + Supabase cloud; Sentry; domínio; landing page com lista de espera; onboarding com tutorial de OFX | 3–4 dias |

**Marcos:**
- **M1 (fim da etapa 5):** Gabriel já usa o app com lançamentos manuais.
- **M2 (fim da etapa 7):** dá para usar com extratos reais. Início do convite dos primeiros betas próximos.
- **M3 (fim da etapa 11):** beta aberto para a rede.

---

## 15. Critérios de aceitação e testes

### Estratégia de testes
| Tipo | Ferramenta | Foco |
|---|---|---|
| Unitário | Vitest | `money.ts`, `mei.ts`, agregados, parsers OFX/CSV, dedupe, regras, validador de números do resumo |
| Integração (API + banco) | Vitest + Fastify `inject` + Supabase local | Rotas, RLS, isolamento entre dois usuários, cota de IA |
| IA | Vitest com cliente OpenAI **mockado** | Executor de ferramentas, limites, recusa de parâmetros inválidos; um conjunto pequeno de perguntas reais rodado manualmente antes de cada release |
| Frontend | Vitest + Testing Library | Formulários críticos (importação, transação) |
| E2E | 💡 Playwright, 2–3 fluxos (cadastro → importação → dashboard), a partir da etapa 11 | |

### Critérios de aceitação (MVP pronto para o beta)
- [ ] O usuário B recebe 404 em **qualquer** recurso do usuário A (teste automatizado para cada rota e cada ferramenta de IA).
- [ ] Nenhum cálculo financeiro usa ponto flutuante; os testes cobrem arredondamento e somas grandes.
- [ ] Importar o mesmo OFX duas vezes não cria duplicatas (0 novas na segunda importação).
- [ ] CSV com o mesmo conteúdo marca as linhas como possível duplicata.
- [ ] Desfazer uma importação remove exatamente as transações daquele lote.
- [ ] Lucro PJ e retiradas batem com uma planilha de referência para um conjunto de dados de teste.
- [ ] O teto proporcional do ano de abertura e as faixas de 20% estão corretos nos testes.
- [ ] A IA responde corretamente às 10 perguntas do roteiro de teste usando apenas números das ferramentas.
- [ ] A 101ª pergunta do mês retorna `QUOTA_EXCEEDED` e a interface explica o motivo.
- [ ] O resumo mensal com número inventado (teste com mock) cai no template.
- [ ] Ao fim do teste, o usuário fica em somente leitura e consegue exportar os dados.
- [ ] Excluir a conta remove todas as linhas do usuário em todas as tabelas.
- [ ] O app é instalável como PWA e utilizável numa tela de 360 px.
- [ ] CI verde (lint, typecheck, testes) na branch principal.

### Monitoramento e manutenção
- Sentry (frontend e API) para erros; logs do Render sem dados sensíveis.
- Métricas de produto num painel SQL simples no Supabase: cadastros, % que importou, perguntas por usuário, custo de IA por usuário, conversões.
- Revisão mensal: custo da OpenAI, uso da cota, atualização de dependências.

---

## 16. Estratégia para conseguir os primeiros clientes

✅ **A + B, com foco em A.** Parceria com contadores fica para o futuro.

**A. Rede própria (foco principal)**
1. Listar de 15 a 20 MEIs conhecidos (amigos, família, prestadores de serviço que você já usa).
2. Antes do M2, fazer conversas de 15 minutos para validar a dor: "como você separa PF/PJ hoje?", "já se preocupou com o limite?", "qual banco PJ usa?". Isso também confirma os bancos-hipótese.
3. No M2/M3, convidar de 5 a 10 pessoas para o beta grátis em troca de feedback semanal (WhatsApp).
4. Ao final, oferecer o **preço de fundador** (R$ 19,90 vitalício).

**B. Conteúdo e lista de espera (paralelo, baixo esforço)**
- Landing page simples com a frase de venda + lista de espera (pode ser publicada já na etapa 11, ou antes com uma página estática).
- Posts curtos em Instagram/TikTok e em grupos de MEI: "Quanto você pode faturar como MEI em 2026?", "3 sinais de que você está misturando PF e PJ", "o que acontece se estourar o limite". O tema do limite tem busca e compartilhamento naturais.

**Critérios de sucesso (❓ metas propostas)**
- **Validação:** 10 usuários pagantes **ou** ≥30% dos betas convertendo para pago.
- **Engajamento:** ≥50% dos usuários ativos importando extrato todo mês.
- **Sinal secundário:** ≥3 perguntas à IA por usuário ativo por mês; NPS ≥ 30 no beta.

---

## 17. Riscos, dúvidas restantes e decisões a validar

### Riscos
| Risco | Impacto | Mitigação |
|---|---|---|
| O teto do MEI muda (há projetos de lei para aumentá-lo) | Alertas errados | Teto e regras em configuração, não no código; checar a legislação antes do lançamento |
| OFX varia entre bancos (encoding, datas, FITID ausente ou repetido) | Duplicatas ou falhas de importação | Fixtures reais anonimizadas por banco; fallback para o hash quando o FITID faltar |
| Usuário desiste por ter que importar extrato todo mês | Baixo engajamento | Tutorial por banco, alerta de "conta sem dados", importação rápida; Open Finance no futuro |
| *Cold start* do Render (30–60 s) | Má primeira impressão | Aceitável no beta com amigos; upgrade de US$ 7 antes de clientes pagantes |
| Supabase grátis pausa e não tem backup | Perda de dados ou indisponibilidade | Migrar para o Pro antes do primeiro pagante |
| IA dá resposta errada ou "inventa" | Perda de confiança | Números só via ferramentas; validação no resumo; roteiro de testes |
| Bancos PJ lançam gestão financeira parecida | Concorrência | Diferencial é juntar PF + PJ de bancos diferentes e o foco no limite do MEI |
| Tempo limitado de um desenvolvedor em aprendizado | Atraso | Etapas pequenas, escopo travado, marcos M1–M3 |
| Exposição jurídica (LGPD, orientação tributária) | Multa ou reclamação | Termos claros, IA sem conselho tributário definitivo, revisão jurídica antes de cobrar |

### Dúvidas em aberto
1. **Nome e identidade visual.** Gabriel vai trazer referências; ideias: Separa, Lucro Claro, Caixa Limpo, Teto (checar domínio .com.br e INPI).
2. **Preço final.** Proposta: R$ 29,90 (fundador R$ 19,90), a validar.
3. **Bancos prioritários.** Hipótese: Nubank PJ, Inter PJ, C6, Mercado Pago, PagBank, a confirmar nas conversas com MEIs.
4. **Transferências PF ↔ PJ:** detectar automaticamente pares de transferência entre contas do usuário ou deixar a marcação manual como retirada? 💡 Manual com sugestão no MVP.
5. **Formas de recebimento manual:** Pix direto ou link de pagamento (Mercado Pago/Asaas)?
6. **Revisão jurídica** dos termos e da política: com quem e quando.

### Hipóteses que o beta precisa validar
- MEIs pagam ~R$ 30/mês por clareza de PF/PJ + limite.
- A maioria tem conta PJ separada mas mistura na prática (ou usa conta única).
- Importar OFX mensalmente é aceitável para esse público.
- O chat é usado e valorizado (≥3 perguntas/mês), e 100 perguntas/mês é um limite suficiente.
