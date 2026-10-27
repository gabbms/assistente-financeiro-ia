# Assistente financeiro com IA para MEI

SaaS de finanças para MEI e autônomos: separa o dinheiro pessoal (PF) do dinheiro do negócio (PJ), acompanha o limite anual do MEI e responde perguntas sobre os seus próprios dados com um chat de IA.

> Projeto em desenvolvimento (MVP). Nome do produto ainda a definir.

## Documentação

- [Especificação do produto (MVP)](docs/product-spec.md)

## Stack

- **Frontend:** React, Vite, TypeScript, Tailwind CSS, shadcn/ui (PWA)
- **Backend:** Node.js, Fastify, TypeScript, Zod
- **Banco e autenticação:** Supabase (PostgreSQL + Auth + RLS)
- **IA:** OpenAI, acessada somente pelo backend
- **Testes:** Vitest

## Estrutura

```
apps/web         # frontend React + Vite (PWA)
apps/api         # API Fastify
packages/shared  # schemas Zod e tipos compartilhados entre web e API
supabase/        # migrations, RLS e configuração do Supabase local
docs/            # especificação e decisões
```

## Como rodar localmente

Pré-requisitos: Node.js 22 (veja `.nvmrc`), pnpm 10 (`corepack enable` instala a versão certa) e Docker Desktop (para o Supabase local).

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm db:start       # sobe o Supabase local no Docker e aplica as migrations
pnpm dev            # API em http://localhost:3333 e web em http://localhost:5173
```

O `pnpm db:start` mostra a URL e as chaves locais. O Supabase Studio (painel do banco) fica em http://localhost:54323.

## Comandos

| Comando          | O que faz                                                 |
| ---------------- | --------------------------------------------------------- |
| `pnpm dev`       | Sobe API e frontend em modo desenvolvimento               |
| `pnpm test`      | Roda os testes (Vitest) de todos os pacotes               |
| `pnpm test:db`   | Testes de banco e isolamento (precisa do `pnpm db:start`) |
| `pnpm db:start`  | Sobe o Supabase local                                     |
| `pnpm db:stop`   | Para o Supabase local                                     |
| `pnpm db:reset`  | Recria o banco local do zero (migrations + seed)          |
| `pnpm lint`      | ESLint                                                    |
| `pnpm typecheck` | Checagem de tipos do TypeScript                           |
| `pnpm format`    | Formata o código com Prettier                             |
| `pnpm build`     | Gera os builds de produção                                |

O CI (GitHub Actions) roda formatação, lint, typecheck, testes, testes de banco e build em cada PR.

Para mudar o banco, crie uma migration com `pnpm exec supabase migration new <nome>` e rode `pnpm db:reset`. Nunca altere o banco manualmente.
