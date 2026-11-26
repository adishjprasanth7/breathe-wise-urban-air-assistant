export default async function handler(): Promise<Response> {
  const apiKey = (process.env.GEMINI_API_KEY ?? '').trim();
  return Response.json({
    status: 'ok',
    aiConfigured: apiKey.length > 0,
    timestamp: new Date().toISOString(),
  });
}
