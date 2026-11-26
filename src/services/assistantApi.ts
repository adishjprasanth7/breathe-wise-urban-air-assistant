import type { AssistantRequestPayload, AssistantResponseData } from '../types/assistant';

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? '';

export async function askFamilyAssistant(
  payload: AssistantRequestPayload,
  signal?: AbortSignal
): Promise<AssistantResponseData> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000);

  const onAbort = () => controller.abort();
  if (signal) {
    if (signal.aborted) {
      clearTimeout(timeoutId);
      throw new DOMException('Aborted', 'AbortError');
    }
    signal.addEventListener('abort', onAbort, { once: true });
  }

  try {
    const response = await fetch(`${API_BASE}/api/assistant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
      throw new Error(errorBody?.error ?? `Assistant request failed (${response.status})`);
    }

    return (await response.json()) as AssistantResponseData;
  } finally {
    clearTimeout(timeoutId);
    if (signal) {
      signal.removeEventListener('abort', onAbort);
    }
  }
}
