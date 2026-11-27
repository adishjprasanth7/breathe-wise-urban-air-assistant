import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { AirQualityView } from './AirQualityView';
import { createDemoAirQualityData } from '../services/openMeteo';

describe('AirQualityView', () => {
  it('renders pollutant details and methodology when data is present', () => {
    const demo = createDemoAirQualityData();
    render(<AirQualityView data={demo} loading={false} />);

    expect(
      screen.getByRole('heading', { name: /Air Quality Details — New Delhi/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Fine Particulate Matter \(PM2\.5\)/i)).toBeInTheDocument();
    expect(screen.getByText(/Methodology & Transparency/i)).toBeInTheDocument();
  });

  it('renders empty state when data is null and not loading', () => {
    render(<AirQualityView data={null} loading={false} />);
    expect(screen.getByText(/No air quality data loaded yet/i)).toBeInTheDocument();
  });
});
