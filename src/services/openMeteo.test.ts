import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  DEFAULT_LOCATION,
  clearAirQualityCache,
  fetchAirQuality,
} from './openMeteo';

describe('Open-Meteo Air Quality service', () => {
  beforeEach(() => {
    clearAirQualityCache();
    vi.restoreAllMocks();
  });

  it('parses valid Open-Meteo response and computes US EPA AQI', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          current: {
            time: '2026-11-26T10:00',
            pm2_5: 55.4,
            pm10: 80,
            ozone: 40,
            nitrogen_dioxide: 30,
            carbon_monoxide: 500,
          },
          hourly: {
            time: ['2026-11-26T00:00', '2026-11-26T01:00'],
            pm2_5: [40, 55.4],
            pm10: [60, 80],
            ozone: [30, 40],
            nitrogen_dioxide: [20, 30],
          },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    const data = await fetchAirQuality(DEFAULT_LOCATION);
    expect(data.isDemoData).toBe(false);
    expect(data.aqi).toBe(150);
    expect(data.category).toBe('Unhealthy for Sensitive Groups');
    expect(data.pollutants.pm25).toBe(55.4);
    expect(data.hourlyForecast).toHaveLength(2);
  });

  it('throws on 4xx client errors without retrying', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response('Bad Request', { status: 400 })
    );

    await expect(fetchAirQuality(DEFAULT_LOCATION)).rejects.toThrow(/rejected \(400\)/);
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });

  it('throws on invalid payload structure', async () => {
    vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      Promise.resolve(new Response(JSON.stringify({ unexpected: true }), { status: 200 }))
    );

    await expect(fetchAirQuality(DEFAULT_LOCATION)).rejects.toThrow(/Invalid air quality payload/);
  });
});
