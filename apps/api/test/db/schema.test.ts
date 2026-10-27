import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { createTestUser, deleteTestUser, type TestUser } from './helpers';

// Regras do esquema que o banco garante sozinho, independentemente da API.

let user: TestUser;
let accountId: string;

beforeAll(async () => {
  user = await createTestUser('esquema');
  const { data, error } = await user.client
    .from('accounts')
    .insert({ user_id: user.id, name: 'Conta mista', type: 'MISTA' })
    .select('id')
    .single();
  if (error) throw error;
  accountId = data.id as string;
});

afterAll(async () => {
  if (user) await deleteTestUser(user);
});

function insertTransaction(fields: Record<string, unknown>) {
  return user.client.from('transactions').insert({
    user_id: user.id,
    account_id: accountId,
    occurred_on: '2026-10-05',
    amount_cents: 1_000,
    direction: 'out',
    description: 'Teste',
    ...fields,
  });
}

describe('transactions', () => {
  it.each([0, -500])('rejeita amount_cents = %i (valores são sempre positivos)', async (amount) => {
    const { error } = await insertTransaction({ amount_cents: amount });

    expect(error?.code).toBe('23514'); // violação de check
  });

  it('rejeita centavos fracionados', async () => {
    const { error } = await insertTransaction({ amount_cents: 10.5 });

    expect(error?.code).toBe('22P02'); // valor inválido para bigint
  });

  it('aceita valores acima do limite de um inteiro de 32 bits', async () => {
    const { error } = await insertTransaction({ amount_cents: 5_000_000_000 });

    expect(error).toBeNull();
  });

  it('aceita contexto nulo (pendente de marcação) e usa os padrões de kind e source', async () => {
    const { data, error } = await insertTransaction({ context: null })
      .select('context, kind, source')
      .single();

    expect(error).toBeNull();
    expect(data).toEqual({ context: null, kind: 'normal', source: 'manual' });
  });

  it.each([
    ['direction', 'entrada'],
    ['context', 'MISTA'],
    ['kind', 'transfer'],
    ['source', 'pix'],
  ])('rejeita %s = %s', async (column, value) => {
    const { error } = await insertTransaction({ [column]: value });

    expect(error?.code).toBe('23514');
  });

  it('não repete o mesmo FITID na mesma conta', async () => {
    await insertTransaction({ external_id: 'FITID-1', source: 'ofx' });
    const { error } = await insertTransaction({ external_id: 'FITID-1', source: 'ofx' });

    expect(error?.code).toBe('23505'); // violação de unicidade
  });
});

describe('accounts', () => {
  it('rejeita tipo desconhecido', async () => {
    const { error } = await user.client
      .from('accounts')
      .insert({ user_id: user.id, name: 'Poupança', type: 'POUPANCA' });

    expect(error?.code).toBe('23514');
  });

  it('atualiza updated_at a cada alteração', async () => {
    const { data: before } = await user.client
      .from('accounts')
      .select('updated_at')
      .eq('id', accountId)
      .single();
    const { data: after } = await user.client
      .from('accounts')
      .update({ bank_name: 'Banco Teste' })
      .eq('id', accountId)
      .select('updated_at')
      .single();

    expect(new Date(after?.updated_at as string).getTime()).toBeGreaterThan(
      new Date(before?.updated_at as string).getTime(),
    );
  });
});
