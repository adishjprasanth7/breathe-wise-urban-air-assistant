import { describe, it, expect } from 'vitest';
import {
  calculatePm25Aqi,
  calculatePm10Aqi,
  computeUsEpaAqi,
  getAqiCategory,
} from './aqi';

describe('US EPA AQI calculations & categorization', () => {
  it('calculates PM2.5 AQI using 2024 EPA breakpoints', () => {
    expect(calculatePm25Aqi(0)).toBe(0);
    expect(calculatePm25Aqi(9.0)).toBe(50);
    expect(calculatePm25Aqi(35.4)).toBe(100);
    expect(calculatePm25Aqi(55.4)).toBe(150);
    expect(calculatePm25Aqi(125.4)).toBe(200);
    expect(calculatePm25Aqi(225.4)).toBe(300);
    expect(calculatePm25Aqi(600)).toBe(500);
  });

  it('calculates PM10 AQI using EPA breakpoints', () => {
    expect(calculatePm10Aqi(54)).toBe(50);
    expect(calculatePm10Aqi(154)).toBe(100);
    expect(calculatePm10Aqi(254)).toBe(150);
  });

  it('returns null for missing or negative pollutant readings', () => {
    expect(calculatePm25Aqi(null)).toBeNull();
    expect(calculatePm25Aqi(undefined)).toBeNull();
    expect(calculatePm25Aqi(-5)).toBeNull();
    expect(computeUsEpaAqi({ pm25: null, pm10: null })).toEqual({
      aqi: null,
      dominantPollutant: 'Unknown',
    });
  });

  it('selects dominant pollutant between PM2.5 and PM10', () => {
    const res = computeUsEpaAqi({ pm25: 10.0, pm10: 200 });
    expect(res.dominantPollutant).toBe('PM10');
    expect(res.aqi).toBeGreaterThan(100);
  });

  it('categorizes AQI values accurately', () => {
    expect(getAqiCategory(25)).toBe('Good');
    expect(getAqiCategory(75)).toBe('Moderate');
    expect(getAqiCategory(125)).toBe('Unhealthy for Sensitive Groups');
    expect(getAqiCategory(175)).toBe('Unhealthy');
    expect(getAqiCategory(250)).toBe('Very Unhealthy');
    expect(getAqiCategory(350)).toBe('Hazardous');
    expect(getAqiCategory(null)).toBe('Unavailable');
  });
});
