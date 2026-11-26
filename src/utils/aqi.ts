import type { AqiCategory, PollutantReadings } from '../types/aqi';

interface Breakpoint {
  cLow: number;
  cHigh: number;
  iLow: number;
  iHigh: number;
}

/**
 * Official US EPA AQI Breakpoints for PM2.5 (ug/m3, 2024 revised standard)
 * Concentration is truncated to 1 decimal place per EPA guidance.
 */
const PM25_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0.0, cHigh: 9.0, iLow: 0, iHigh: 50 },
  { cLow: 9.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
  { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
  { cLow: 55.5, cHigh: 125.4, iLow: 151, iHigh: 200 },
  { cLow: 125.5, cHigh: 225.4, iLow: 201, iHigh: 300 },
  { cLow: 225.5, cHigh: 500.4, iLow: 301, iHigh: 500 },
];

/**
 * Official US EPA AQI Breakpoints for PM10 (ug/m3)
 * Concentration is truncated to integer per EPA guidance.
 */
const PM10_BREAKPOINTS: Breakpoint[] = [
  { cLow: 0, cHigh: 54, iLow: 0, iHigh: 50 },
  { cLow: 55, cHigh: 154, iLow: 51, iHigh: 100 },
  { cLow: 155, cHigh: 254, iLow: 101, iHigh: 150 },
  { cLow: 255, cHigh: 354, iLow: 151, iHigh: 200 },
  { cLow: 355, cHigh: 424, iLow: 201, iHigh: 300 },
  { cLow: 425, cHigh: 604, iLow: 301, iHigh: 500 },
];

function interpolateBreakpoints(concentration: number, breakpoints: Breakpoint[]): number | null {
  if (!Number.isFinite(concentration) || concentration < 0) {
    return null;
  }

  for (const bp of breakpoints) {
    if (concentration >= bp.cLow && concentration <= bp.cHigh) {
      const aqi = ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (concentration - bp.cLow) + bp.iLow;
      return Math.round(aqi);
    }
  }

  // Above highest documented breakpoint
  const last = breakpoints[breakpoints.length - 1];
  if (concentration > last.cHigh) {
    return 500;
  }

  return null;
}

export function calculatePm25Aqi(pm25: number | null | undefined): number | null {
  if (pm25 === null || pm25 === undefined || !Number.isFinite(pm25) || pm25 < 0) {
    return null;
  }
  const truncated = Math.floor(pm25 * 10) / 10;
  return interpolateBreakpoints(truncated, PM25_BREAKPOINTS);
}

export function calculatePm10Aqi(pm10: number | null | undefined): number | null {
  if (pm10 === null || pm10 === undefined || !Number.isFinite(pm10) || pm10 < 0) {
    return null;
  }
  const truncated = Math.floor(pm10);
  return interpolateBreakpoints(truncated, PM10_BREAKPOINTS);
}

export function computeUsEpaAqi(pollutants: Pick<PollutantReadings, 'pm25' | 'pm10'>): {
  aqi: number | null;
  dominantPollutant: 'PM2.5' | 'PM10' | 'Unknown';
} {
  const pm25Aqi = calculatePm25Aqi(pollutants.pm25);
  const pm10Aqi = calculatePm10Aqi(pollutants.pm10);

  if (pm25Aqi === null && pm10Aqi === null) {
    return { aqi: null, dominantPollutant: 'Unknown' };
  }
  if (pm25Aqi !== null && pm10Aqi !== null) {
    if (pm25Aqi >= pm10Aqi) {
      return { aqi: pm25Aqi, dominantPollutant: 'PM2.5' };
    }
    return { aqi: pm10Aqi, dominantPollutant: 'PM10' };
  }
  if (pm25Aqi !== null) {
    return { aqi: pm25Aqi, dominantPollutant: 'PM2.5' };
  }
  return { aqi: pm10Aqi, dominantPollutant: 'PM10' };
}

export function getAqiCategory(aqi: number | null | undefined): AqiCategory {
  if (aqi === null || aqi === undefined || !Number.isFinite(aqi) || aqi < 0) {
    return 'Unavailable';
  }
  if (aqi <= 50) return 'Good';
  if (aqi <= 100) return 'Moderate';
  if (aqi <= 150) return 'Unhealthy for Sensitive Groups';
  if (aqi <= 200) return 'Unhealthy';
  if (aqi <= 300) return 'Very Unhealthy';
  return 'Hazardous';
}

export interface AqiStyleMeta {
  category: AqiCategory;
  shortLabel: string;
  badgeClasses: string;
  cardAccentClasses: string;
  textColorClass: string;
  chartColor: string;
  guidanceSummary: string;
  sensitiveGroupAdvice: string;
  generalPublicAdvice: string;
}

export function getAqiMeta(category: AqiCategory): AqiStyleMeta {
  switch (category) {
    case 'Good':
      return {
        category,
        shortLabel: 'Level 1 · Good',
        badgeClasses: 'bg-forest-100 text-forest-900 border-forest-300',
        cardAccentClasses: 'border-l-4 border-l-forest-600',
        textColorClass: 'text-forest-800',
        chartColor: '#27664f',
        guidanceSummary:
          'Air quality is satisfactory, and air pollution poses little or no risk.',
        sensitiveGroupAdvice:
          'Normal outdoor activities are generally safe. Keep rescue inhalers handy if prescribed.',
        generalPublicAdvice:
          'Great conditions for walking, cycling, and opening windows for natural ventilation.',
      };
    case 'Moderate':
      return {
        category,
        shortLabel: 'Level 2 · Moderate',
        badgeClasses: 'bg-amber-50 text-amber-900 border-amber-300',
        cardAccentClasses: 'border-l-4 border-l-amber-500',
        textColorClass: 'text-amber-800',
        chartColor: '#d97706',
        guidanceSummary:
          'Air quality is acceptable; however, some pollutants may pose a moderate health concern for a very small number of unusually sensitive people.',
        sensitiveGroupAdvice:
          'People with respiratory or heart conditions, children, and older adults should consider reducing prolonged outdoor exertion.',
        generalPublicAdvice:
          'Most people can continue outdoor activities; consider low-emission transit to keep levels from rising.',
      };
    case 'Unhealthy for Sensitive Groups':
      return {
        category,
        shortLabel: 'Level 3 · Sensitive Alert',
        badgeClasses: 'bg-orange-100 text-orange-950 border-orange-300',
        cardAccentClasses: 'border-l-4 border-l-orange-500',
        textColorClass: 'text-orange-900',
        chartColor: '#ea580c',
        guidanceSummary:
          'Members of sensitive groups may experience health effects. The general public is less likely to be affected.',
        sensitiveGroupAdvice:
          'Children, older adults, and people with asthma or heart disease should reduce prolonged or heavy outdoor exertion and take more breaks.',
        generalPublicAdvice:
          'Move intense workouts indoors or reschedule to lower-AQI hours. Keep windows closed during peak traffic.',
      };
    case 'Unhealthy':
      return {
        category,
        shortLabel: 'Level 4 · Unhealthy',
        badgeClasses: 'bg-red-100 text-red-950 border-red-300',
        cardAccentClasses: 'border-l-4 border-l-red-600',
        textColorClass: 'text-red-900',
        chartColor: '#dc2626',
        guidanceSummary:
          'Some members of the general public may experience health effects; members of sensitive groups may experience more serious health effects.',
        sensitiveGroupAdvice:
          'Avoid prolonged or heavy outdoor exertion. Stay indoors with filtered air (HEPA) if available.',
        generalPublicAdvice:
          'Limit outdoor exertion, wear a well-fitting N95/KN95 respirator if spending time outside, and keep indoor air clean.',
      };
    case 'Very Unhealthy':
      return {
        category,
        shortLabel: 'Level 5 · Very Unhealthy',
        badgeClasses: 'bg-rose-100 text-rose-950 border-rose-400',
        cardAccentClasses: 'border-l-4 border-l-rose-700',
        textColorClass: 'text-rose-950',
        chartColor: '#be123c',
        guidanceSummary:
          'Health alert: the risk of health effects is increased for everyone.',
        sensitiveGroupAdvice:
          'Avoid all physical activity outdoors. Move activities indoors and run HEPA filtration continuously.',
        generalPublicAdvice:
          'Avoid outdoor exertion. Keep windows closed, use wet cleaning indoors, and wear a well-fitting N95/FFP2 mask for essential trips.',
      };
    case 'Hazardous':
      return {
        category,
        shortLabel: 'Level 6 · Hazardous',
        badgeClasses: 'bg-red-900 text-white border-red-950',
        cardAccentClasses: 'border-l-4 border-l-red-900',
        textColorClass: 'text-red-950',
        chartColor: '#7f1d1d',
        guidanceSummary:
          'Health warning of emergency conditions: everyone is more likely to be affected.',
        sensitiveGroupAdvice:
          'Remain indoors and keep activity levels low. Follow medical action plans and contact a clinician if symptoms occur.',
        generalPublicAdvice:
          'Avoid all outdoor physical activity. Use HEPA filtration, avoid indoor combustion, and wear a well-fitting N95 respirator if going outside is unavoidable.',
      };
    default:
      return {
        category: 'Unavailable',
        shortLabel: 'Data Unavailable',
        badgeClasses: 'bg-slate-100 text-slate-800 border-slate-300',
        cardAccentClasses: 'border-l-4 border-l-slate-400',
        textColorClass: 'text-slate-700',
        chartColor: '#64748b',
        guidanceSummary:
          'AQI could not be calculated from available sensor readings. Review individual pollutant concentrations below.',
        sensitiveGroupAdvice:
          'When live AQI is unavailable during winter smog, take conservative precautions and check local advisories.',
        generalPublicAdvice:
          'Retry fetching live data or use the manual location search.',
      };
  }
}

export interface PollutantMeta {
  key: keyof PollutantReadings;
  name: string;
  formula: string;
  unit: string;
  description: string;
}

export const POLLUTANT_METADATA: PollutantMeta[] = [
  {
    key: 'pm25',
    name: 'Fine Particulate Matter',
    formula: 'PM2.5',
    unit: 'µg/m³',
    description:
      'Inhalable particles ≤2.5 µm from vehicle exhaust, wood/waste burning, and winter smog that can penetrate deep into the lungs.',
  },
  {
    key: 'pm10',
    name: 'Coarse Particulate Matter',
    formula: 'PM10',
    unit: 'µg/m³',
    description:
      'Particles ≤10 µm including road dust, construction dust, and pollen that irritate airways.',
  },
  {
    key: 'ozone',
    name: 'Ground-Level Ozone',
    formula: 'O₃',
    unit: 'µg/m³',
    description:
      'Secondary pollutant formed when sunlight reacts with vehicle and industrial emissions; irritates throat and lungs.',
  },
  {
    key: 'no2',
    name: 'Nitrogen Dioxide',
    formula: 'NO₂',
    unit: 'µg/m³',
    description:
      'Gas primarily from traffic and fuel combustion; worsens asthma and airway inflammation.',
  },
  {
    key: 'co',
    name: 'Carbon Monoxide',
    formula: 'CO',
    unit: 'µg/m³',
    description:
      'Colorless gas from incomplete fuel combustion and idling vehicles; reduces oxygen delivery in the body.',
  },
];
