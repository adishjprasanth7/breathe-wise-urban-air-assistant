import type { EmissionFactors, ImpactActionType, ImpactLogEntry } from '../types/impact';

/**
 * Default emission factors based on widely cited transport/grid averages:
 * - Average passenger car: ~0.192 kg CO2e/km (DEFRA/EPA typical mid-size petrol car)
 * - Urban public transit (bus/metro blend): ~0.041 kg CO2e/km per passenger
 * - Carpooling (2+ occupants): ~50% of solo car emissions saved = 0.096 kg CO2e/km
 * - Idling passenger vehicle: ~0.036 kg CO2e/min (~2.16 kg CO2e/hour)
 * - Grid electricity average: ~0.417 kg CO2e/kWh (configurable by user)
 */
export const DEFAULT_EMISSION_FACTORS: EmissionFactors = {
  carKgPerKm: 0.192,
  transitKgPerKm: 0.041,
  carpoolKgSavedPerKm: 0.096,
  idlingKgPerMin: 0.036,
  electricityKgPerKwh: 0.417,
};

export interface ActionDefinition {
  type: ImpactActionType;
  label: string;
  unit: 'km' | 'minutes' | 'kWh';
  defaultAmount: number;
  formulaDescription: string;
}

export const IMPACT_ACTION_DEFINITIONS: ActionDefinition[] = [
  {
    type: 'walk_cycle',
    label: 'Walked or cycled instead of driving',
    unit: 'km',
    defaultAmount: 3,
    formulaDescription: 'Distance (km) × Car Factor (kg CO₂e/km)',
  },
  {
    type: 'public_transit',
    label: 'Took public transit instead of solo car',
    unit: 'km',
    defaultAmount: 8,
    formulaDescription: 'Distance (km) × (Car Factor − Transit Factor)',
  },
  {
    type: 'carpool',
    label: 'Carpooled instead of separate car trips',
    unit: 'km',
    defaultAmount: 10,
    formulaDescription: 'Distance (km) × Carpool Savings Factor',
  },
  {
    type: 'no_idling',
    label: 'Turned off engine instead of idling',
    unit: 'minutes',
    defaultAmount: 10,
    formulaDescription: 'Minutes × Idling Factor (kg CO₂e/min)',
  },
  {
    type: 'energy_saving',
    label: 'Reduced home electricity usage',
    unit: 'kWh',
    defaultAmount: 2,
    formulaDescription: 'Energy Saved (kWh) × Grid Factor (kg CO₂e/kWh)',
  },
];

export function calculateCo2eSavedKg(
  type: ImpactActionType,
  amount: number,
  factors: EmissionFactors = DEFAULT_EMISSION_FACTORS
): number {
  if (!Number.isFinite(amount) || amount <= 0) {
    return 0;
  }

  let saved = 0;
  switch (type) {
    case 'walk_cycle':
      saved = amount * Math.max(0, factors.carKgPerKm);
      break;
    case 'public_transit': {
      const netPerKm = Math.max(0, factors.carKgPerKm - factors.transitKgPerKm);
      saved = amount * netPerKm;
      break;
    }
    case 'carpool':
      saved = amount * Math.max(0, factors.carpoolKgSavedPerKm);
      break;
    case 'no_idling':
      saved = amount * Math.max(0, factors.idlingKgPerMin);
      break;
    case 'energy_saving':
      saved = amount * Math.max(0, factors.electricityKgPerKwh);
      break;
  }

  return Math.round(saved * 1000) / 1000;
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function summarizeImpact(entries: ImpactLogEntry[], referenceDate = getTodayIsoDate()) {
  const ref = new Date(`${referenceDate}T00:00:00`);
  const sevenDaysAgo = new Date(ref);
  sevenDaysAgo.setDate(ref.getDate() - 6);

  let todayCo2eKg = 0;
  let weeklyCo2eKg = 0;
  let totalTripsAvoided = 0;
  let sustainableDistanceKm = 0;
  let idlingAvoidedMinutes = 0;
  let energySavedKwh = 0;

  for (const entry of entries) {
    const entryDate = new Date(`${entry.date}T00:00:00`);
    const isToday = entry.date === referenceDate;
    const isThisWeek = entryDate >= sevenDaysAgo && entryDate <= ref;

    if (isToday) {
      todayCo2eKg += entry.co2eSavedKg;
    }
    if (isThisWeek) {
      weeklyCo2eKg += entry.co2eSavedKg;
      totalTripsAvoided += entry.tripsAvoided;
      if (entry.unit === 'km') {
        sustainableDistanceKm += entry.amount;
      } else if (entry.unit === 'minutes') {
        idlingAvoidedMinutes += entry.amount;
      } else if (entry.unit === 'kWh') {
        energySavedKwh += entry.amount;
      }
    }
  }

  return {
    todayCo2eKg: Math.round(todayCo2eKg * 100) / 100,
    weeklyCo2eKg: Math.round(weeklyCo2eKg * 100) / 100,
    totalTripsAvoided,
    sustainableDistanceKm: Math.round(sustainableDistanceKm * 10) / 10,
    idlingAvoidedMinutes: Math.round(idlingAvoidedMinutes),
    energySavedKwh: Math.round(energySavedKwh * 10) / 10,
  };
}
