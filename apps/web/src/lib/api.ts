import { healthResponseSchema, type HealthResponse } from '@app/shared';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333';

export async function fetchHealth(signal?: AbortSignal): Promise<HealthResponse> {
  const response = await fetch(`${API_URL}/health`, { signal });
  if (!response.ok) {
    throw new Error(`API respondeu ${response.status}`);
  }
  return healthResponseSchema.parse(await response.json());
}
