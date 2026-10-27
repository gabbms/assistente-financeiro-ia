import { describe, expect, it } from 'vitest';
import { healthResponseSchema } from './health';

describe('healthResponseSchema', () => {
  it('aceita uma resposta válida', () => {
    const result = healthResponseSchema.safeParse({
      status: 'ok',
      service: 'api',
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(true);
  });

  it('rejeita status diferente de "ok"', () => {
    const result = healthResponseSchema.safeParse({
      status: 'down',
      service: 'api',
      timestamp: new Date().toISOString(),
    });
    expect(result.success).toBe(false);
  });
});
