// @vitest-environment node
import { describe, it, expect } from 'vitest';
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
  it('returns health status without exposing secrets', async () => {
    const app = createApp({ geminiApiKey: '' });
    const res = await request(app).get('/api/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.aiConfigured).toBe(false);
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
});
