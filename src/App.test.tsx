import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { App } from './App';

describe('App root mount', () => {
  it('renders BreatheWise navigation and location controls without crashing', () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(
        JSON.stringify({
          current: { time: '2026-11-26T10:00', pm2_5: 42, pm10: 70 },
          hourly: { time: [], pm2_5: [], pm10: [] },
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    render(<App />);
    expect(screen.getAllByText('BreatheWise').length).toBeGreaterThan(0);
    expect(screen.getByRole('region', { name: /Location controls/i })).toBeInTheDocument();
  });
});
