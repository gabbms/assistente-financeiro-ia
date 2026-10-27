import cors from '@fastify/cors';
import Fastify from 'fastify';
import { type HealthResponse } from '@app/shared';
import type { Env } from './config/env';

export async function buildApp(env: Env) {
  const app = Fastify({
    logger: env.NODE_ENV === 'test' ? false : { level: 'info' },
  });

  await app.register(cors, { origin: env.CORS_ORIGIN.split(',') });

  app.get('/health', async (): Promise<HealthResponse> => {
    return { status: 'ok', service: 'api', timestamp: new Date().toISOString() };
  });

  return app;
}
