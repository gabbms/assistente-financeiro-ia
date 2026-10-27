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
docs/            # especificação e decisões
```

## Como rodar localmente

Pré-requisitos: Node.js 22 (veja `.nvmrc`) e pnpm 10 (`corepack enable` instala a versão certa).

```bash
pnpm install
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
pnpm dev            # API em http://localhost:3333 e web em http://localhost:5173
```

## Comandos

| Comando          | O que faz                                   |
| ---------------- | ------------------------------------------- |
| `pnpm dev`       | Sobe API e frontend em modo desenvolvimento |
| `pnpm test`      | Roda os testes (Vitest) de todos os pacotes |
| `pnpm lint`      | ESLint                                      |
| `pnpm typecheck` | Checagem de tipos do TypeScript             |
| `pnpm format`    | Formata o código com Prettier               |
| `pnpm build`     | Gera os builds de produção                  |

O CI (GitHub Actions) roda formatação, lint, typecheck, testes e build em cada PR.
