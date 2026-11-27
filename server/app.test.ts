// @vitest-environment node
import { describe, it, expect, vi, afterEach } from 'vitest';
import request from 'supertest';
import { createApp } from './app.js';

const validPayload = {
  question: 'Is it safe to take my children outside today?',
  profile: {
    familySize: 3,
    ageCategories: ['adults', 'children'],
    outdoorActivities: 'School walk',
    commuteType: 'mixed',
    hasHepaPurifier: false,
    hasOutdoorJob: false,
    preferredLanguage: 'English',
  },
  airQuality: {
    locationName: 'New Delhi',
    aqi: 175,
    category: 'Unhealthy',
    pollutants: {
      pm25: 90,
      pm10: 140,
      ozone: 40,
      no2: 50,
      co: 900,
    },
    isDemoData: false,
  },
};

describe('Express API (/api/health & /api/assistant)', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('returns health status and security CSP header without exposing secrets', async () => {
    const app = createApp({ geminiApiKey: '' });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.aiConfigured).toBe(false);
    expect(res.headers['content-security-policy']).toContain("default-src 'self'");
  });

  it('rejects invalid input with 400 status', async () => {
    const app = createApp({ geminiApiKey: '' });
    const res = await request(app)
      .post('/api/assistant')
      .send({ ...validPayload, question: 'Hi' });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe('Invalid request payload.');
  });

  it('returns structured deterministic fallback when GEMINI_API_KEY is not configured', async () => {
    const app = createApp({ geminiApiKey: '' });
    const res = await request(app).post('/api/assistant').send(validPayload);

    expect(res.status).toBe(200);
    expect(res.body.source).toBe('fallback');
    expect(res.body.riskSummary).toContain('New Delhi');
    expect(Array.isArray(res.body.actionsToday)).toBe(true);
    expect(Array.isArray(res.body.indoorProtection)).toBe(true);
    expect(Array.isArray(res.body.outdoorRecommendations)).toBe(true);
    expect(Array.isArray(res.body.lowEmissionAlternatives)).toBe(true);
    expect(typeof res.body.estimatedImpact).toBe('string');
    expect(Array.isArray(res.body.explanations)).toBe(true);
  });

  it('enforces rate limiting on /api/assistant', async () => {
    const app = createApp({ geminiApiKey: '', rateLimitMax: 2 });

    const r1 = await request(app).post('/api/assistant').send(validPayload);
    const r2 = await request(app).post('/api/assistant').send(validPayload);
    const r3 = await request(app).post('/api/assistant').send(validPayload);

    expect(r1.status).toBe(200);
    expect(r2.status).toBe(200);
    expect(r3.status).toBe(429);
    expect(r3.body.error).toMatch(/Too many assistant requests/i);
  });

  it('allows same-host Origin and blocks untrusted cross-origin on /api', async () => {
    const app = createApp({ geminiApiKey: '', frontendUrl: 'http://localhost:5173' });

    const sameHost = await request(app)
      .get('/api/health')
      .set('Host', 'breathewise-urban-air-quality.onrender.com')
      .set('Origin', 'https://breathewise-urban-air-quality.onrender.com');
    expect(sameHost.status).toBe(200);

    const untrusted = await request(app)
      .get('/api/health')
      .set('Host', 'breathewise-urban-air-quality.onrender.com')
      .set('Origin', 'https://untrusted.example.com');
    expect(untrusted.status).toBe(403);
  });

  it('uses Gemini response when configured and falls back gracefully on upstream error', async () => {
    const app = createApp({ geminiApiKey: 'test-key-never-logged' });

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          candidates: [
            {
              content: {
                parts: [
                  {
                    text: JSON.stringify({
                      riskSummary: 'Gemini risk summary',
                      actionsToday: ['Action 1'],
                      indoorProtection: ['Indoor 1'],
                      outdoorRecommendations: ['Outdoor 1'],
                      lowEmissionAlternatives: ['Alt 1'],
                      estimatedImpact: '1.2 kg CO2e avoided',
                      explanations: [{ action: 'Action 1', whyUseful: 'Reason 1' }],
                    }),
                  },
                ],
              },
            },
          ],
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const aiRes = await request(app).post('/api/assistant').send(validPayload);
    expect(aiRes.status).toBe(200);
    expect(aiRes.body.source).toBe('gemini');
    expect(aiRes.body.riskSummary).toBe('Gemini risk summary');

    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response('Upstream error', { status: 503 }));
    const fallbackRes = await request(app).post('/api/assistant').send(validPayload);
    expect(fallbackRes.status).toBe(200);
    expect(fallbackRes.body.source).toBe('fallback');
  });
});
