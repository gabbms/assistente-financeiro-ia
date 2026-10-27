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
