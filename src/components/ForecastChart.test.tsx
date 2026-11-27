import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ForecastChart } from './ForecastChart';
import { createDemoAirQualityData } from '../services/openMeteo';

describe('ForecastChart', () => {
  it('toggles between chart view and accessible hourly data table', async () => {
    const user = userEvent.setup();
    const demo = createDemoAirQualityData();

    render(<ForecastChart hourlyForecast={demo.hourlyForecast} accentColor="#27664f" />);

    expect(screen.getByRole('img', { name: /hourly US EPA AQI forecast/i })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Accessible Data Table/i }));
    expect(screen.getByRole('table')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Show Chart/i }));
    expect(screen.getByRole('img', { name: /hourly US EPA AQI forecast/i })).toBeInTheDocument();
  });

  it('renders fallback message when no valid hourly points exist', () => {
    render(<ForecastChart hourlyForecast={[]} accentColor="#27664f" />);
    expect(screen.getByText(/Hourly forecast data is currently unavailable/i)).toBeInTheDocument();
  });
});
