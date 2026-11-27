import { describe, it, expect, vi, beforeEach } from 'vitest';
import { askFamilyAssistant } from './assistantApi';

const payload = {
  question: 'Is it safe outside?',
  profile: {
    familySize: 2,
    ageCategories: ['adults' as const],
    outdoorActivities: 'Walk',
    commuteType: 'public_transit' as const,
    hasHepaPurifier: true,
    hasOutdoorJob: false,
    preferredLanguage: 'English',
  },
  airQuality: {
    locationName: 'London',
    aqi: 45,
    category: 'Good' as const,
    pollutants: { pm25: 8, pm10: 15, ozone: 30, no2: 20, co: 300 },
    isDemoData: false,
  },
};

describe('assistantApi', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('returns parsed response on 200 OK', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ source: 'fallback', riskSummary: 'Low risk' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    const res = await askFamilyAssistant(payload);
    expect(res.source).toBe('fallback');
    expect(res.riskSummary).toBe('Low risk');
  });

  it('throws server error message on non-OK response', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(JSON.stringify({ error: 'Rate limit exceeded' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      })
    );

    await expect(askFamilyAssistant(payload)).rejects.toThrow('Rate limit exceeded');
  });
});
