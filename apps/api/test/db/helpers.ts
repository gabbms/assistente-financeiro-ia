import { execSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const repoRoot = fileURLToPath(new URL('../../../../', import.meta.url));

interface LocalSupabase {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
}

// Lê a URL e as chaves do Supabase local (as chaves locais são fixas e públicas, só servem para dev).
// SUPABASE_URL, SUPABASE_ANON_KEY e SUPABASE_SERVICE_ROLE_KEY no ambiente têm prioridade.
function readLocalSupabase(): LocalSupabase {
  const { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY } = process.env;
  if (SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY) {
    return {
      url: SUPABASE_URL,
      anonKey: SUPABASE_ANON_KEY,
      serviceRoleKey: SUPABASE_SERVICE_ROLE_KEY,
    };
  }

  let output: string;
  try {
    output = execSync('pnpm exec supabase status -o json', {
      cwd: repoRoot,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'pipe'],
    });
  } catch {
    throw new Error(
      'Supabase local não está rodando. Abra o Docker e rode `pnpm db:start` na raiz.',
    );
  }

  const status = JSON.parse(output.slice(output.indexOf('{'))) as Record<
    string,
    string | undefined
  >;
  const url = status.API_URL;
  const anonKey = status.ANON_KEY ?? status.PUBLISHABLE_KEY;
  const serviceRoleKey = status.SERVICE_ROLE_KEY ?? status.SECRET_KEY;
  if (!url || !anonKey || !serviceRoleKey) {
    throw new Error('Não foi possível ler a URL e as chaves de `supabase status`.');
  }
  return { url, anonKey, serviceRoleKey };
}

const local = readLocalSupabase();
const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };

/** Cliente sem login (papel `anon`). */
export function anonClient(): SupabaseClient {
  return createClient(local.url, local.anonKey, clientOptions);
}

/** Cliente com a service role, que ignora o RLS. Só para preparar e conferir dados nos testes. */
export function adminClient(): SupabaseClient {
  return createClient(local.url, local.serviceRoleKey, clientOptions);
}

export interface TestUser {
  id: string;
  /** Cliente logado como este usuário (papel `authenticated`, sujeito ao RLS). */
  client: SupabaseClient;
}

/** Cria um usuário confirmado e devolve um cliente já logado como ele. */
export async function createTestUser(label: string): Promise<TestUser> {
  const email = `${label}-${randomUUID()}@teste.local`;
  const password = `senha-${randomUUID()}`;

  const { data, error } = await adminClient().auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });
  if (error) throw error;

  const client = anonClient();
  const { error: signInError } = await client.auth.signInWithPassword({ email, password });
  if (signInError) throw signInError;

  return { id: data.user.id, client };
}

/** Apaga o usuário; os dados dele somem em cascata. */
export async function deleteTestUser(user: TestUser): Promise<void> {
  const { error } = await adminClient().auth.admin.deleteUser(user.id);
  if (error) throw error;
}
