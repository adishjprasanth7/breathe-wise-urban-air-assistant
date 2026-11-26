import type { ValidatedAssistantRequest } from './validation.js';

export interface StructuredAssistantResponse {
  source: 'gemini' | 'fallback';
  modelUsed?: string;
  riskSummary: string;
  actionsToday: string[];
  indoorProtection: string[];
  outdoorRecommendations: string[];
  lowEmissionAlternatives: string[];
  estimatedImpact: string;
  explanations: Array<{ action: string; whyUseful: string }>;
  disclaimer: string;
  generatedAt: string;
}

export function buildFallbackAssistantResponse(
  input: ValidatedAssistantRequest
): StructuredAssistantResponse {
  const { airQuality, profile } = input;
  const aqi = airQuality.aqi;
  const isSevere = aqi !== null && aqi > 150;
  const isModerateOrSensitive = aqi !== null && aqi > 50 && aqi <= 150;
  const hasChildrenOrElderly =
    profile.ageCategories.includes('children') ||
    profile.ageCategories.includes('elderly') ||
    profile.ageCategories.includes('sensitive');

  let riskSummary: string;
  if (aqi === null) {
    riskSummary = `Live AQI is currently unavailable for ${airQuality.locationName}. Because urban winter smog can change rapidly, these conservative precautions focus on reducing indoor PM2.5 and limiting unnecessary exposure.`;
  } else if (aqi > 200) {
    riskSummary = `Air quality in ${airQuality.locationName} is ${airQuality.category} (US EPA AQI ${aqi}). Exposure poses elevated risk to everyone, especially ${hasChildrenOrElderly ? 'children, older adults, and sensitive household members' : 'active individuals and outdoor workers'}.`;
  } else if (isSevere) {
    riskSummary = `Air quality in ${airQuality.locationName} is ${airQuality.category} (US EPA AQI ${aqi}). Prolonged outdoor exertion increases fine particle inhalation, requiring indoor protection and reduced outdoor intensity.`;
  } else if (isModerateOrSensitive) {
    riskSummary = `Air quality in ${airQuality.locationName} is ${airQuality.category} (US EPA AQI ${aqi}). Sensitive groups—including children, older adults, and people with respiratory conditions—should take extra care during peak traffic hours.`;
  } else {
    riskSummary = `Air quality in ${airQuality.locationName} is ${airQuality.category} (US EPA AQI ${aqi}). Conditions are generally favorable, making it a good day for natural ventilation and low-emission travel.`;
  }

  const actionsToday: string[] = [
    isSevere || aqi === null
      ? 'Shift high-effort outdoor errands or exercise indoors and monitor hourly AQI updates.'
      : 'Plan outdoor activities during lower-pollution hours away from busy roadways.',
    profile.hasOutdoorJob
      ? 'Wear a well-fitting N95/KN95 respirator during outdoor shifts and take breaks in filtered indoor spaces when possible.'
      : 'Keep a well-fitting N95/KN95 mask ready if air quality worsens or when walking near heavy traffic.',
    'Combine necessary errands into a single trip and avoid vehicle idling.',
  ];

  const indoorProtection: string[] = [
    profile.hasHepaPurifier
      ? 'Run your HEPA air purifier continuously in the main living or sleeping room, keeping doors closed to that zone.'
      : 'Use a clean-air room strategy: close exterior windows during high outdoor PM2.5, run exhaust fans while cooking, and wet-mop floors instead of dry sweeping.',
    'Avoid indoor combustion sources including tobacco smoke, incense, candles, and unvented heating.',
    isSevere
      ? 'Keep windows closed while outdoor PM2.5 is elevated, and ventilate briefly only when outdoor AQI drops.'
      : 'Open windows for cross-ventilation during cleaner hours to refresh indoor air without trapping cooking fumes.',
  ];

  const outdoorRecommendations: string[] = [
    hasChildrenOrElderly && (isSevere || isModerateOrSensitive || aqi === null)
      ? 'Keep children and older adults indoors during peak smog hours; choose calm indoor play or gentle movement.'
      : 'Prefer parks and side streets set back from major roads to reduce exposure to traffic-related NO2 and PM2.5.',
    isSevere
      ? 'Postpone vigorous outdoor exercise; heavy breathing draws fine particles deeper into the lungs.'
      : 'Moderate outdoor exercise is reasonable; pause if anyone notices coughing, throat irritation, or shortness of breath.',
  ];

  const lowEmissionAlternatives: string[] = [
    profile.commuteType === 'car' || profile.commuteType === 'mixed'
      ? 'Use public transit, carpool, or batch errands into one trip when practical to cut tailpipe emissions.'
      : 'Continue using public transit, walking, or cycling on low-traffic routes.',
    'Turn off vehicle engines while waiting or dropping off family members instead of idling.',
    'Lower unnecessary electricity and heating demand at home and never burn leaves or household waste.',
  ];

  const estimatedImpact =
    'Replacing a 10 km solo car trip with public transit avoids roughly 1.5 kg CO2e, and avoiding 10 minutes of idling saves ~0.36 kg CO2e. Individual actions do not measurably change city-wide AQI alone, but collective shifts reduce local traffic exhaust.';

  const explanations = [
    {
      action: 'Wet cleaning & cooking exhaust',
      whyUseful:
        'Dry sweeping resuspends settled PM2.5/PM10 dust into breathing zones, while cooking without ventilation spikes indoor fine particles.',
    },
    {
      action: 'HEPA filtration without ozone',
      whyUseful:
        'True HEPA filters physically capture fine PM2.5 particles without emitting ozone, unlike ozone-generating devices or houseplants.',
    },
    {
      action: 'No-idling & trip chaining',
      whyUseful:
        'Cold starts and idling near schools or homes concentrate NO2, CO, and ultrafine particles right where families breathe.',
    },
  ];

  return {
    source: 'fallback',
    riskSummary,
    actionsToday,
    indoorProtection,
    outdoorRecommendations,
    lowEmissionAlternatives,
    estimatedImpact,
    explanations,
    disclaimer:
      'Generated by BreatheWise deterministic safety rules (AI service unavailable or unconfigured). This guidance is informational only and does not replace medical advice.',
    generatedAt: new Date().toISOString(),
  };
}
