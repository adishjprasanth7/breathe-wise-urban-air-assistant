import type { AqiCategory } from '../types/aqi';
import type { CommuteType } from '../types/assistant';
import type { DailyTask, RoutineAlternative } from '../types/planner';

export function generateDefaultDailyTasks(
  category: AqiCategory,
  hasHepaPurifier: boolean
): DailyTask[] {
  const isPolluted =
    category === 'Unhealthy for Sensitive Groups' ||
    category === 'Unhealthy' ||
    category === 'Very Unhealthy' ||
    category === 'Hazardous';

  return [
    {
      id: 'morning-aqi-check',
      period: 'morning',
      title: 'Check AQI before outdoor exercise or school commute',
      description: isPolluted
        ? 'Outdoor air is elevated today. Shift vigorous workouts indoors and prepare masks for sensitive family members.'
        : 'Review morning PM2.5 and hourly forecast to pick the cleanest window for outdoor time.',
      category: 'monitoring',
      completed: false,
    },
    {
      id: 'morning-commute',
      period: 'morning',
      title: 'Use public transit, carpool, or walk on low-traffic streets if feasible',
      description:
        'Combining errands or choosing transit reduces tailpipe NO₂ and PM2.5 along neighborhood roads.',
      category: 'low-emission',
      completed: false,
    },
    {
      id: 'afternoon-windows',
      period: 'afternoon',
      title: isPolluted
        ? 'Keep exterior windows closed while outdoor PM2.5 is high'
        : 'Open windows briefly for cross-ventilation if outdoor AQI is low',
      description: isPolluted
        ? hasHepaPurifier
          ? 'Run your HEPA purifier on medium/high in the main living space.'
          : 'Use wet mopping instead of dry sweeping to keep indoor dust settled.'
        : 'Refreshing indoor air helps clear cooking fumes and CO₂ buildup.',
      category: 'protection',
      completed: false,
    },
    {
      id: 'afternoon-no-idling',
      period: 'afternoon',
      title: 'Turn off vehicle engine when parked or waiting at pickups',
      description: 'Avoiding even 5–10 minutes of idling prevents concentrated exhaust near schools and homes.',
      category: 'low-emission',
      completed: false,
    },
    {
      id: 'evening-cooking',
      period: 'evening',
      title: 'Use kitchen exhaust fan while cooking and avoid incense/smoke',
      description:
        'Cooking aerosols and indoor burning are major sources of indoor PM2.5. Avoid candles, incense, and indoor smoking.',
      category: 'protection',
      completed: false,
    },
    {
      id: 'night-forecast',
      period: 'night',
      title: 'Review tomorrow’s AQI forecast and prepare clean-air sleeping room',
      description: hasHepaPurifier
        ? 'Set HEPA purifier to quiet/night mode in the bedroom.'
        : 'Close bedroom windows if overnight winter smog inversion is expected.',
      category: 'monitoring',
      completed: false,
    },
  ];
}

export function generateLowEmissionRoutines(commuteType: CommuteType): RoutineAlternative[] {
  const allRoutines: RoutineAlternative[] = [
    {
      id: 'walk-short-trips',
      title: 'Walk or cycle for short neighborhood trips under 2 km',
      category: 'transport',
      description: 'Cold-start car trips under 2 km produce disproportionately high exhaust per kilometer.',
      practicalTip: 'When AQI is Good or Moderate, walk on side streets away from arterial traffic.',
      feasibility: 'Easy',
    },
    {
      id: 'public-transit',
      title: 'Swap one solo car commute for bus or metro',
      category: 'transport',
      description: 'Public transit moves more people with lower per-passenger tailpipe emissions.',
      practicalTip: 'If a full transit route is inconvenient, try park-and-ride for the congested urban leg.',
      feasibility: 'Moderate',
    },
    {
      id: 'carpool-school-work',
      title: 'Share school runs or work commutes with neighbors',
      category: 'transport',
      description: 'Carpooling even twice a week cuts vehicle trips and eases morning congestion.',
      practicalTip: 'Coordinate a rotating 2-family pickup schedule for after-school activities.',
      feasibility: 'Moderate',
    },
    {
      id: 'batch-errands',
      title: 'Combine errands into one planned loop',
      category: 'errands',
      description: 'Chaining grocery, pharmacy, and pickup stops keeps the engine warm and reduces total mileage.',
      practicalTip: 'Keep a shared household shopping list to avoid extra last-minute car trips.',
      feasibility: 'Easy',
    },
    {
      id: 'stop-idling',
      title: 'Switch off engine when waiting more than 30 seconds',
      category: 'transport',
      description: 'Modern engines use less fuel restarting than idling for 30+ seconds.',
      practicalTip: 'Especially helpful in school pickup lanes and drive-through queues.',
      feasibility: 'Easy',
    },
    {
      id: 'efficient-electricity',
      title: 'Reduce peak electricity & heating waste',
      category: 'energy',
      description: 'Lower electricity demand reduces emissions from fossil-fuel power plants.',
      practicalTip: 'Use LED bulbs, unplug standby chargers, and seal window drafts with removable weatherstripping.',
      feasibility: 'Easy',
    },
    {
      id: 'no-waste-burning',
      title: 'Compost or bag yard leaves instead of burning',
      category: 'waste',
      description: 'Open burning of leaves or trash releases dense PM2.5 and toxic smoke directly into neighborhood air.',
      practicalTip: 'Use municipal green-waste collection or backyard mulching.',
      feasibility: 'Easy',
    },
    {
      id: 'reusable-containers',
      title: 'Carry reusable bags, bottles, and food containers',
      category: 'waste',
      description: 'Reduces single-use packaging waste that often ends up incinerated or landfilled.',
      practicalTip: 'Keep two folded tote bags near your front door or in your backpack.',
      feasibility: 'Easy',
    },
  ];

  // Prioritize transport options relevant to user's commute without shaming
  if (commuteType === 'car') {
    return allRoutines;
  }
  if (commuteType === 'remote') {
    return allRoutines.filter((r) => r.id !== 'public-transit');
  }
  return allRoutines;
}
