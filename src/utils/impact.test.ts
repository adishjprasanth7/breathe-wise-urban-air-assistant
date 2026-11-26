import { describe, it, expect } from 'vitest';
import {
  DEFAULT_EMISSION_FACTORS,
  calculateCo2eSavedKg,
  summarizeImpact,
} from './impact';
import type { ImpactLogEntry } from '../types/impact';

describe('Environmental impact calculations', () => {
  it('calculates CO2e avoided for each action type', () => {
    expect(calculateCo2eSavedKg('walk_cycle', 5, DEFAULT_EMISSION_FACTORS)).toBe(0.96);
    expect(calculateCo2eSavedKg('public_transit', 10, DEFAULT_EMISSION_FACTORS)).toBe(1.51);
    expect(calculateCo2eSavedKg('no_idling', 10, DEFAULT_EMISSION_FACTORS)).toBe(0.36);
    expect(calculateCo2eSavedKg('energy_saving', 2, DEFAULT_EMISSION_FACTORS)).toBe(0.834);
  });

  it('returns 0 for non-positive or invalid amounts', () => {
    expect(calculateCo2eSavedKg('walk_cycle', 0)).toBe(0);
    expect(calculateCo2eSavedKg('walk_cycle', -3)).toBe(0);
    expect(calculateCo2eSavedKg('walk_cycle', Number.NaN)).toBe(0);
  });

  it('summarizes daily and weekly totals correctly', () => {
    const entries: ImpactLogEntry[] = [
      {
        id: '1',
        date: '2026-11-26',
        type: 'walk_cycle',
        label: 'Walked',
        amount: 3,
        unit: 'km',
        tripsAvoided: 1,
        co2eSavedKg: 0.58,
        createdAt: '2026-11-26T08:00:00Z',
      },
      {
        id: '2',
        date: '2026-11-24',
        type: 'public_transit',
        label: 'Transit',
        amount: 10,
        unit: 'km',
        tripsAvoided: 1,
        co2eSavedKg: 1.51,
        createdAt: '2026-11-24T08:00:00Z',
      },
      {
        id: '3',
        date: '2026-11-01',
        type: 'walk_cycle',
        label: 'Old entry',
        amount: 5,
        unit: 'km',
        tripsAvoided: 1,
        co2eSavedKg: 0.96,
        createdAt: '2026-11-01T08:00:00Z',
      },
    ];

    const summary = summarizeImpact(entries, '2026-11-26');
    expect(summary.todayCo2eKg).toBe(0.58);
    expect(summary.weeklyCo2eKg).toBe(2.09);
    expect(summary.totalTripsAvoided).toBe(2);
    expect(summary.sustainableDistanceKm).toBe(13);
  });
});
