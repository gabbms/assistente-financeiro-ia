import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/server.ts'],
  format: ['esm'],
  target: 'node22',
  platform: 'node',
  clean: true,
  // O pacote compartilhado é publicado como TypeScript; embutimos no bundle.
  noExternal: ['@app/shared'],
});
