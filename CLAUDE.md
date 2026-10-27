# CLAUDE.md

Instruções para o Claude Code neste repositório. Leia também `docs/product-spec.md`, que é a fonte da verdade sobre escopo e decisões.

## Sobre o projeto

SaaS de finanças para **MEI e autônomos** (mercado brasileiro). Ele separa o dinheiro pessoal (PF) do dinheiro do negócio (PJ), mostra o lucro real e as retiradas, acompanha o limite anual do MEI e tem um chat de IA que responde sobre os dados do próprio usuário.

O dono do projeto é um desenvolvedor em aprendizado: **explique decisões importantes de forma clara e em português**, e trabalhe em etapas pequenas e verificáveis.

## Stack

- `apps/web`: React 19, Vite, TypeScript, Tailwind v4, shadcn/ui (PWA, mobile-first, pt-BR)
- `apps/api`: Node 22, Fastify, TypeScript, Zod
- `packages/shared`: schemas Zod e tipos usados pela web e pela API (exportado como TS, sem build)
- Banco e autenticação: Supabase (Postgres + Auth + RLS), com migrations em `supabase/migrations`
- IA: OpenAI, **somente no backend**
- Testes: Vitest. Monorepo com pnpm workspaces
- TypeScript fixado em `~6.0` (o `typescript-eslint` ainda não suporta a 7.x). No TS 6, cada `tsconfig` precisa declarar `types` explicitamente.

## Comandos

```bash
pnpm install
pnpm dev            # API (localhost:3333) + web (localhost:5173)
pnpm test           # Vitest em todos os pacotes
pnpm lint           # ESLint
pnpm typecheck      # tsc --noEmit em todos os pacotes
pnpm format         # Prettier
pnpm build
```

Antes de considerar uma tarefa pronta, rode `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test`, os mesmos passos do CI.

## Regras de arquitetura e segurança (obrigatórias)

- Frontend e backend separados, com módulos claros (`apps/api/src/modules/<domínio>`, `apps/web/src/features/<domínio>`).
- **Um usuário nunca pode acessar dados de outro.** Use duas camadas: a API filtra tudo pelo `user_id` do JWT verificado, e o Postgres tem RLS em todas as tabelas com `user_id`. A API usa o JWT do usuário no cliente Supabase; a service role só serve para exclusão de conta e ativação de assinatura.
- Recurso de outro usuário retorna **404** (não 403), para não revelar que ele existe.
- **Dinheiro sempre em centavos inteiros** (`bigint` no banco, `number` inteiro no TS). Nunca use float para valores. Cálculos financeiros ficam só no backend ou no `packages/shared`.
- Valide toda entrada e saída com Zod, com os schemas em `packages/shared`.
- Nunca exponha chaves secretas no frontend nem no Git. Variáveis públicas do frontend usam o prefixo `VITE_`. Mantenha os arquivos `.env.example` atualizados.
- Migrations versionadas. Nunca altere o banco manualmente sem uma migration.
- **IA:** o modelo só acessa dados por ferramentas fixas do backend, que recebem `user_id` da sessão (nunca do modelo) e retornam **apenas dados agregados**. Nunca execute SQL gerado pelo modelo. Descrições de transações não são enviadas à OpenAI.
- Não implemente integração bancária real (Open Finance) no MVP.
- Logs nunca contêm dados financeiros nem descrições de transações.
- Toda funcionalidade tem testes; cálculos, permissões e isolamento de dados são obrigatórios.

## Forma de trabalho

- Antes de alterar arquivos, inspecione o projeto e explique o plano.
- Implemente **uma funcionalidade por vez**, seguindo as etapas da seção 14 de `docs/product-spec.md`.
- Rode os testes e valide os resultados após cada etapa. Nunca invente resultados de testes nem funcionalidades que ainda não existem.
- Evite dependências desnecessárias e complexidade prematura.
- Mantenha `docs/product-spec.md` e o README atualizados quando uma decisão mudar.
- **Peça confirmação** antes de ações destrutivas, gastos com serviços pagos, alterações irreversíveis, push na `main` ou merge.
- Trabalhe em branches e abra PRs; commits em português, no formato `tipo: descrição` (por exemplo `feat:`, `fix:`, `chore:`, `docs:`, `test:`).
