import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LocationSelector } from './LocationSelector';
import { DEFAULT_LOCATION } from '../services/openMeteo';

describe('LocationSelector', () => {
  it('selects preset city and triggers geolocation/refresh callbacks', async () => {
    const user = userEvent.setup();
    const onSelectLocation = vi.fn();
    const onRequestGeolocation = vi.fn();
    const onRefresh = vi.fn();

    render(
      <LocationSelector
        location={DEFAULT_LOCATION}
        loading={false}
        geoLoading={false}
        geoError="Location permission was denied."
        onSelectLocation={onSelectLocation}
        onRequestGeolocation={onRequestGeolocation}
        onRefresh={onRefresh}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent(/Location permission was denied/i);

    await user.click(screen.getByRole('button', { name: 'London' }));
    expect(onSelectLocation).toHaveBeenCalledWith(expect.objectContaining({ name: 'London' }));

    await user.click(screen.getByRole('button', { name: /Use My Location/i }));
    expect(onRequestGeolocation).toHaveBeenCalledTimes(1);

    await user.click(screen.getByRole('button', { name: /Refresh air quality data/i }));
    expect(onRefresh).toHaveBeenCalledTimes(1);
  });
});
