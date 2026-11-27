import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ImpactTrackerView } from './ImpactTrackerView';
import { DEFAULT_EMISSION_FACTORS, getTodayIsoDate } from '../utils/impact';
import type { ImpactLogEntry } from '../types/impact';

describe('ImpactTrackerView', () => {
  it('logs a new action, toggles assumptions panel, and deletes an entry', async () => {
    const user = userEvent.setup();
    const onAddEntry = vi.fn();
    const onDeleteEntry = vi.fn();
    const onUpdateFactors = vi.fn();

    const entries: ImpactLogEntry[] = [
      {
        id: 'entry-1',
        date: getTodayIsoDate(),
        type: 'walk_cycle',
        label: 'Walked or cycled instead of driving',
        amount: 3,
        unit: 'km',
        tripsAvoided: 1,
        co2eSavedKg: 0.576,
        createdAt: new Date().toISOString(),
      },
    ];

    render(
      <ImpactTrackerView
        entries={entries}
        factors={DEFAULT_EMISSION_FACTORS}
        onAddEntry={onAddEntry}
        onDeleteEntry={onDeleteEntry}
        onUpdateFactors={onUpdateFactors}
      />
    );

    const assumptionsBtn = screen.getByRole('button', { name: /Assumptions/i });
    expect(assumptionsBtn).toHaveAttribute('aria-expanded', 'false');
    await user.click(assumptionsBtn);
    expect(assumptionsBtn).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getByText(/Configurable Emission Factors/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Save Action Locally/i }));
    expect(onAddEntry).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Delete Walked or cycled/i }));
    expect(onDeleteEntry).toHaveBeenCalledWith('entry-1');

    expect(screen.getByText(/Sample Local-Only Content/i)).toBeInTheDocument();
  });
});
