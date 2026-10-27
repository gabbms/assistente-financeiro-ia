import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { adminClient, anonClient, createTestUser, deleteTestUser, type TestUser } from './helpers';

// Testes de isolamento (docs/product-spec.md, seção 9, "RLS"): um usuário nunca
// pode ler, criar, alterar ou apagar dados de outro, nem mexer na própria assinatura.

interface UserData {
  user: TestUser;
  accountId: string;
  categoryId: string;
  transactionId: string;
  subscriptionId: string;
}

const admin = adminClient();

async function systemCategoryId(name: string, context: 'PF' | 'PJ'): Promise<string> {
  const { data, error } = await admin
    .from('categories')
    .select('id')
    .is('user_id', null)
    .eq('name', name)
    .eq('context', context)
    .single();
  if (error) throw error;
  return data.id as string;
}

/** Cria um usuário com perfil, assinatura, uma conta, uma categoria e uma transação. */
async function createUserWithData(label: string): Promise<UserData> {
  const user = await createTestUser(label);

  // Perfil e assinatura são criados pela service role (no app, isso acontece no cadastro).
  const { data: plan, error: planError } = await admin
    .from('plans')
    .select('id')
    .eq('code', 'mei_pro')
    .single();
  if (planError) throw planError;

  const { error: profileError } = await admin
    .from('profiles')
    .insert({ id: user.id, full_name: `Usuário ${label}` });
  if (profileError) throw profileError;

  const { data: subscription, error: subscriptionError } = await admin
    .from('subscriptions')
    .insert({ user_id: user.id, plan_id: plan.id, status: 'trialing' })
    .select('id')
    .single();
  if (subscriptionError) throw subscriptionError;

  // Os dados financeiros são criados pelo próprio usuário, passando pelo RLS.
  const { data: account, error: accountError } = await user.client
    .from('accounts')
    .insert({ user_id: user.id, name: `Conta ${label}`, type: 'PJ' })
    .select('id')
    .single();
  if (accountError) throw accountError;

  const { data: category, error: categoryError } = await user.client
    .from('categories')
    .insert({ user_id: user.id, name: `Categoria ${label}`, direction: 'out', context: 'PJ' })
    .select('id')
    .single();
  if (categoryError) throw categoryError;

  const { data: transaction, error: transactionError } = await user.client
    .from('transactions')
    .insert({
      user_id: user.id,
      account_id: account.id,
      occurred_on: '2026-10-01',
      amount_cents: 15_000,
      direction: 'out',
      description: `Compra ${label}`,
      category_id: category.id,
      context: 'PJ',
    })
    .select('id')
    .single();
  if (transactionError) throw transactionError;

  return {
    user,
    accountId: account.id as string,
    categoryId: category.id as string,
    transactionId: transaction.id as string,
    subscriptionId: subscription.id as string,
  };
}

const userTables = ['profiles', 'subscriptions', 'accounts', 'transactions'] as const;

let a: UserData;
let b: UserData;

beforeAll(async () => {
  [a, b] = await Promise.all([createUserWithData('a'), createUserWithData('b')]);
});

afterAll(async () => {
  await Promise.all([a, b].filter(Boolean).map((data) => deleteTestUser(data.user)));
});

describe('sem login (anon)', () => {
  it.each([...userTables, 'categories', 'plans'])('não lê nada de %s', async (table) => {
    const { data, error } = await anonClient().from(table).select('*');

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('não cria contas', async () => {
    const { error } = await anonClient()
      .from('accounts')
      .insert({ user_id: a.user.id, name: 'Invasora', type: 'PF' });

    expect(error?.code).toBe('42501');
  });
});

describe('leitura', () => {
  it.each(['profiles', 'subscriptions', 'accounts', 'transactions'] as const)(
    'A só enxerga as próprias linhas de %s',
    async (table) => {
      const ownerColumn = table === 'profiles' ? 'id' : 'user_id';
      const { data, error } = await a.user.client.from(table).select(ownerColumn);

      expect(error).toBeNull();
      expect(data).not.toHaveLength(0);
      expect(data?.every((row) => (row as Record<string, string>)[ownerColumn] === a.user.id)).toBe(
        true,
      );
    },
  );

  it('A não encontra a conta de B nem buscando pelo id', async () => {
    const { data, error } = await a.user.client.from('accounts').select('id').eq('id', b.accountId);

    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('A não encontra a transação de B nem buscando pelo id', async () => {
    const { data } = await a.user.client
      .from('transactions')
      .select('id')
      .eq('id', b.transactionId);

    expect(data).toEqual([]);
  });

  it('A vê as categorias do sistema e as próprias, mas não as de B', async () => {
    const { data, error } = await a.user.client.from('categories').select('id, user_id');

    expect(error).toBeNull();
    const ids = data?.map((row) => row.id);
    expect(ids).toContain(a.categoryId);
    expect(ids).not.toContain(b.categoryId);
    expect(data?.some((row) => row.user_id === null)).toBe(true);
    expect(data?.every((row) => row.user_id === null || row.user_id === a.user.id)).toBe(true);
  });

  it('usuários logados leem o catálogo de planos', async () => {
    const { data } = await a.user.client.from('plans').select('code');

    expect(data).toEqual([{ code: 'mei_pro' }]);
  });
});

describe('escrita em dados de outro usuário', () => {
  it('A não altera a conta de B', async () => {
    const { data } = await a.user.client
      .from('accounts')
      .update({ name: 'Alterada por A' })
      .eq('id', b.accountId)
      .select();
    expect(data).toEqual([]);

    const { data: account } = await admin
      .from('accounts')
      .select('name')
      .eq('id', b.accountId)
      .single();
    expect(account?.name).toBe('Conta b');
  });

  it('A não apaga a transação de B', async () => {
    const { data } = await a.user.client
      .from('transactions')
      .delete()
      .eq('id', b.transactionId)
      .select();
    expect(data).toEqual([]);

    const { data: transaction } = await admin
      .from('transactions')
      .select('id')
      .eq('id', b.transactionId)
      .single();
    expect(transaction?.id).toBe(b.transactionId);
  });

  it('A não altera o perfil de B', async () => {
    const { data } = await a.user.client
      .from('profiles')
      .update({ full_name: 'Alterado por A' })
      .eq('id', b.user.id)
      .select();

    expect(data).toEqual([]);
  });

  it('A não cria uma conta em nome de B', async () => {
    const { error } = await a.user.client
      .from('accounts')
      .insert({ user_id: b.user.id, name: 'Conta falsa', type: 'PF' });

    expect(error?.code).toBe('42501');
  });

  it('A não transfere a própria conta para B', async () => {
    const { error } = await a.user.client
      .from('accounts')
      .update({ user_id: b.user.id })
      .eq('id', a.accountId);

    expect(error?.code).toBe('42501');
  });

  it('A não lança uma transação na conta de B', async () => {
    const { error } = await a.user.client.from('transactions').insert({
      user_id: a.user.id,
      account_id: b.accountId,
      occurred_on: '2026-10-02',
      amount_cents: 100,
      direction: 'in',
      description: 'Tentativa',
    });

    expect(error?.code).toBe('23503'); // violação de chave estrangeira
  });

  it('A não usa a categoria de B', async () => {
    const { error } = await a.user.client
      .from('transactions')
      .update({ category_id: b.categoryId })
      .eq('id', a.transactionId);

    expect(error?.code).toBe('23503');
  });

  it('A pode usar uma categoria do sistema', async () => {
    const categoryId = await systemCategoryId('Fornecedores', 'PJ');
    const { error } = await a.user.client
      .from('transactions')
      .update({ category_id: categoryId })
      .eq('id', a.transactionId);

    expect(error).toBeNull();
  });

  it('A não altera nem apaga categorias do sistema', async () => {
    const categoryId = await systemCategoryId('DAS', 'PJ');

    const { data: updated } = await a.user.client
      .from('categories')
      .update({ counts_as_mei_revenue: true })
      .eq('id', categoryId)
      .select();
    const { data: deleted } = await a.user.client
      .from('categories')
      .delete()
      .eq('id', categoryId)
      .select();

    expect(updated).toEqual([]);
    expect(deleted).toEqual([]);
  });
});

describe('assinatura e planos', () => {
  it('A não ativa a própria assinatura', async () => {
    const { data } = await a.user.client
      .from('subscriptions')
      .update({ status: 'active' })
      .eq('id', a.subscriptionId)
      .select();
    expect(data).toEqual([]);

    const { data: subscription } = await admin
      .from('subscriptions')
      .select('status')
      .eq('id', a.subscriptionId)
      .single();
    expect(subscription?.status).toBe('trialing');
  });

  it('A não cria uma assinatura para si', async () => {
    const { data: plan } = await admin.from('plans').select('id').eq('code', 'mei_pro').single();
    const { error } = await a.user.client
      .from('subscriptions')
      .insert({ user_id: a.user.id, plan_id: plan?.id, status: 'active' });

    expect(error?.code).toBe('42501');
  });

  it('A não altera o preço do plano', async () => {
    const { data } = await a.user.client
      .from('plans')
      .update({ price_cents: 0 })
      .eq('code', 'mei_pro')
      .select();

    expect(data).toEqual([]);
  });
});

describe('exclusão da conta do usuário', () => {
  it('apagar o usuário apaga todos os dados dele', async () => {
    const c = await createUserWithData('c');
    await deleteTestUser(c.user);

    for (const table of ['subscriptions', 'accounts', 'categories', 'transactions'] as const) {
      const { count } = await admin
        .from(table)
        .select('*', { count: 'exact', head: true })
        .eq('user_id', c.user.id);
      expect(count, table).toBe(0);
    }
    const { count } = await admin
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('id', c.user.id);
    expect(count).toBe(0);
  });
});
