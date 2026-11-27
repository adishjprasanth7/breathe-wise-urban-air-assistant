import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AssistantView } from './AssistantView';
import { createDemoAirQualityData } from '../services/openMeteo';
import type { FamilyProfile } from '../types/assistant';

const baseProfile: FamilyProfile = {
  familySize: 3,
  ageCategories: ['adults', 'children'],
  outdoorActivities: 'School walk',
  commuteType: 'mixed',
  hasHepaPurifier: false,
  hasOutdoorJob: false,
  preferredLanguage: 'English',
};

describe('AssistantView', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('validates short questions before calling the API', async () => {
    const user = userEvent.setup();
    const fetchSpy = vi.spyOn(globalThis, 'fetch');

    render(
      <AssistantView
        airQuality={createDemoAirQualityData()}
        profile={baseProfile}
        onUpdateProfile={vi.fn()}
      />
    );

    const input = screen.getByLabelText(/Ask a question/i);
    await user.clear(input);
    await user.type(input, 'Hi');
    await user.click(screen.getByRole('button', { name: /Get Guidance/i }));

    expect(screen.getByRole('alert')).toHaveTextContent(/at least 3 characters/i);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('submits question and renders structured 7-part guidance', async () => {
    const user = userEvent.setup();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(
      new Response(
        JSON.stringify({
          source: 'fallback',
          riskSummary: 'Air quality is Unhealthy for sensitive groups.',
          actionsToday: ['Shift workouts indoors.'],
          indoorProtection: ['Use kitchen exhaust while cooking.'],
          outdoorRecommendations: ['Wear an N95 mask near traffic.'],
          lowEmissionAlternatives: ['Combine errands into one trip.'],
          estimatedImpact: 'Saves ~1.5 kg CO2e per 10 km transit swap.',
          explanations: [{ action: 'Exhaust fan', whyUseful: 'Captures cooking PM2.5.' }],
          disclaimer: 'Informational only.',
          generatedAt: '2026-11-28T00:00:00Z',
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      )
    );

    render(
      <AssistantView
        airQuality={createDemoAirQualityData()}
        profile={baseProfile}
        onUpdateProfile={vi.fn()}
      />
    );

    await user.click(screen.getByRole('button', { name: /Get Guidance/i }));

    expect(await screen.findByText(/Recommended Action Plan/i)).toBeInTheDocument();
    expect(screen.getByText(/1\. Risk Summary/i)).toBeInTheDocument();
    expect(screen.getByText(/7\. Why Each Recommendation Is Useful/i)).toBeInTheDocument();
    expect(screen.getByText(/Rule-Based Safety Fallback/i)).toBeInTheDocument();
  });
});
