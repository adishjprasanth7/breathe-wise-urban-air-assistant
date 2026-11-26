import { assistantRequestSchema } from '../../server/validation.js';
import { buildFallbackAssistantResponse } from '../../server/fallback.js';
import { callGeminiAssistant } from '../../server/gemini.js';

export default async function handler(req: Request): Promise<Response> {
  if (req.method !== 'POST') {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload.' }, { status: 400 });
  }

  const parsed = assistantRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      {
        error: 'Invalid request payload.',
        details: parsed.error.issues.map((issue) => issue.message),
      },
      { status: 400 }
    );
  }

  const apiKey = (process.env.GEMINI_API_KEY ?? '').trim();
  if (!apiKey) {
    return Response.json(buildFallbackAssistantResponse(parsed.data));
  }

  try {
    const aiResult = await callGeminiAssistant(parsed.data, apiKey);
    return Response.json(aiResult);
  } catch {
    return Response.json(buildFallbackAssistantResponse(parsed.data));
  }
}
