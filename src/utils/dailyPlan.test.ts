import { describe, it, expect } from 'vitest';
import { generateDefaultDailyTasks, generateLowEmissionRoutines } from './dailyPlan';

describe('Daily plan and low-emission routine generators', () => {
  it('adapts daily tasks for polluted AQI and HEPA purifier availability', () => {
    const pollutedWithHepa = generateDefaultDailyTasks('Unhealthy', true);
    const afternoon = pollutedWithHepa.find((t) => t.id === 'afternoon-windows');
    const night = pollutedWithHepa.find((t) => t.id === 'night-forecast');

    expect(pollutedWithHepa).toHaveLength(6);
    expect(afternoon?.title).toMatch(/Keep exterior windows closed/i);
    expect(afternoon?.description).toMatch(/HEPA purifier/i);
    expect(night?.description).toMatch(/HEPA purifier/i);
  });

  it('adapts daily tasks for Good AQI without HEPA purifier', () => {
    const goodNoHepa = generateDefaultDailyTasks('Good', false);
    const afternoon = goodNoHepa.find((t) => t.id === 'afternoon-windows');

    expect(afternoon?.title).toMatch(/Open windows briefly/i);
  });

  it('filters public transit routine for remote workers while keeping all for car commuters', () => {
    const carRoutines = generateLowEmissionRoutines('car');
    const remoteRoutines = generateLowEmissionRoutines('remote');

    expect(carRoutines.some((r) => r.id === 'public-transit')).toBe(true);
    expect(remoteRoutines.some((r) => r.id === 'public-transit')).toBe(false);
    expect(remoteRoutines.length).toBeGreaterThan(0);
  });
});
