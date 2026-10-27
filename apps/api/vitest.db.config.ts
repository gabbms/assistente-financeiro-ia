import { defineConfig } from 'vitest/config';

// Testes contra o Supabase local. Antes, rode `pnpm db:start` na raiz.
export default defineConfig({
  test: {
    include: ['test/db/**/*.test.ts'],
    testTimeout: 20_000,
    hookTimeout: 60_000,
  },
});
