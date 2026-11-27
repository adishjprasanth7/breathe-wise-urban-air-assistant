import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { IndoorProtectionView } from './IndoorProtectionView';
import { createDemoAirQualityData } from '../services/openMeteo';

describe('IndoorProtectionView', () => {
  it('renders window guidance for high AQI and safety notices against ozone/plants', () => {
    const demo = createDemoAirQualityData();
    render(<IndoorProtectionView airQuality={demo} />);

    expect(
      screen.getByRole('heading', { name: /Indoor Air Quality Protection/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Keep exterior windows closed for now/i)).toBeInTheDocument();
    expect(screen.getByText(/Do not rely on indoor houseplants as air purifiers/i)).toBeInTheDocument();
    expect(screen.getByText(/Never use ozone generators/i)).toBeInTheDocument();
  });
});
