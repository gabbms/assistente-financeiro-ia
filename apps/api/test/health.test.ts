import { healthResponseSchema } from '@app/shared';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { buildApp } from '../src/app';
import { loadEnv } from '../src/config/env';

describe('GET /health', () => {
  let app: Awaited<ReturnType<typeof buildApp>>;

  beforeAll(async () => {
    app = await buildApp(loadEnv({ NODE_ENV: 'test' }));
  });

  afterAll(async () => {
    await app.close();
  });

  it('responde 200 com o formato do contrato compartilhado', async () => {
    const response = await app.inject({ method: 'GET', url: '/health' });

    expect(response.statusCode).toBe(200);
    expect(healthResponseSchema.safeParse(response.json()).success).toBe(true);
  });
});

describe('loadEnv', () => {
  it('usa valores padrão quando nada é definido', () => {
    expect(loadEnv({}).PORT).toBe(3333);
  });

  it('falha com PORT inválida', () => {
    expect(() => loadEnv({ PORT: 'abc' })).toThrow(/Variáveis de ambiente inválidas/);
  });
});
