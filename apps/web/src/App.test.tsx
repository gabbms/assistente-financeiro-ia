import { render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('mostra "API online" quando o health check responde', async () => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ status: 'ok', service: 'api', timestamp: new Date().toISOString() }),
            { status: 200 },
          ),
        ),
    );

    render(<App />);

    expect(screen.getByRole('heading', { name: 'Olá, MEI!' })).toBeInTheDocument();
    expect(await screen.findByText('API online')).toBeInTheDocument();
  });

  it('mostra "API offline" quando a requisição falha', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('rede')));

    render(<App />);

    expect(await screen.findByText('API offline')).toBeInTheDocument();
  });
});
