import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { fetchHealth } from '@/lib/api';

type ApiStatus = 'checking' | 'online' | 'offline';

const statusLabel: Record<ApiStatus, string> = {
  checking: 'Verificando API…',
  online: 'API online',
  offline: 'API offline',
};

export function App() {
  const [status, setStatus] = useState<ApiStatus>('checking');
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    fetchHealth(controller.signal)
      .then(() => setStatus('online'))
      .catch(() => {
        if (!controller.signal.aborted) setStatus('offline');
      });
    return () => controller.abort();
  }, [attempt]);

  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col justify-center gap-6 px-4 py-10">
      <div className="space-y-2">
        <p className="text-sm font-medium text-primary">MVP em construção</p>
        <h1 className="text-3xl font-bold tracking-tight">Olá, MEI!</h1>
        <p className="text-muted-foreground">
          Separe o dinheiro do seu negócio do seu, saiba quanto você realmente lucra e nunca estoure
          o limite do MEI.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-lg border bg-card p-4">
        <span className="flex items-center gap-2 text-sm" role="status">
          <span
            aria-hidden
            className={
              status === 'online'
                ? 'size-2 rounded-full bg-income'
                : status === 'offline'
                  ? 'size-2 rounded-full bg-expense'
                  : 'size-2 animate-pulse rounded-full bg-muted-foreground'
            }
          />
          {statusLabel[status]}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setStatus('checking');
            setAttempt((n) => n + 1);
          }}
        >
          Verificar de novo
        </Button>
      </div>
    </main>
  );
}
