import { configDefaults, defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // Os testes de banco precisam do Supabase local (Docker) e rodam com `pnpm test:db`.
    exclude: [...configDefaults.exclude, 'test/db/**'],
  },
});
