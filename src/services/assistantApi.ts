import type { AssistantRequestPayload, AssistantResponseData } from '../types/assistant';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function askFamilyAssistant(
  payload: AssistantRequestPayload,
  signal?: AbortSignal
): Promise<AssistantResponseData> {
  const response = await fetchWithTimeout(`${API_BASE}/api/assistant`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
    signal,
    timeoutMs: 15000,
  });

  if (!response.ok) {
    const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
    throw new Error(errorBody?.error ?? `Assistant request failed (${response.status})`);
  }

  return (await response.json()) as AssistantResponseData;
}
