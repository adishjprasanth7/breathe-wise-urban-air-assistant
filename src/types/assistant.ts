import type { AqiCategory, PollutantReadings } from './aqi';

export type AgeCategory = 'children' | 'adults' | 'elderly' | 'sensitive';
export type CommuteType = 'car' | 'public_transit' | 'walking_cycling' | 'mixed' | 'remote';

export interface FamilyProfile {
  familySize: number;
  ageCategories: AgeCategory[];
  outdoorActivities: string;
  commuteType: CommuteType;
  hasHepaPurifier: boolean;
  hasOutdoorJob: boolean;
  preferredLanguage: string;
}

export interface AssistantRequestPayload {
  question: string;
  profile: FamilyProfile;
  airQuality: {
    locationName: string;
    aqi: number | null;
    category: AqiCategory;
    pollutants: PollutantReadings;
    isDemoData: boolean;
  };
}

export interface RecommendationReason {
  action: string;
  whyUseful: string;
}

export interface AssistantResponseData {
  source: 'gemini' | 'fallback';
  modelUsed?: string;
  riskSummary: string;
  actionsToday: string[];
  indoorProtection: string[];
  outdoorRecommendations: string[];
  lowEmissionAlternatives: string[];
  estimatedImpact: string;
  explanations: RecommendationReason[];
  disclaimer: string;
  generatedAt: string;
}
