export type ImpactActionType =
  | 'walk_cycle'
  | 'public_transit'
  | 'carpool'
  | 'no_idling'
  | 'energy_saving';

export interface EmissionFactors {
  carKgPerKm: number;
  transitKgPerKm: number;
  carpoolKgSavedPerKm: number;
  idlingKgPerMin: number;
  electricityKgPerKwh: number;
}

export interface ImpactLogEntry {
  id: string;
  date: string; // YYYY-MM-DD
  type: ImpactActionType;
  label: string;
  amount: number; // km, minutes, or kWh
  unit: 'km' | 'minutes' | 'kWh';
  tripsAvoided: number;
  co2eSavedKg: number;
  createdAt: string;
}
