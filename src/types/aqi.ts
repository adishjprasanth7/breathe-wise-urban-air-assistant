export type AqiCategory =
  | 'Good'
  | 'Moderate'
  | 'Unhealthy for Sensitive Groups'
  | 'Unhealthy'
  | 'Very Unhealthy'
  | 'Hazardous'
  | 'Unavailable';

export type AqiStandard = 'US EPA AQI' | 'Concentration Only';

export interface PollutantReadings {
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
  no2: number | null;
  co: number | null;
}

export interface HourlyForecastPoint {
  time: string;
  label: string;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  ozone: number | null;
  no2: number | null;
}

export interface LocationInfo {
  name: string;
  region?: string;
  country?: string;
  latitude: number;
  longitude: number;
  source: 'geolocation' | 'search' | 'default';
}

export interface AirQualityData {
  location: LocationInfo;
  aqi: number | null;
  aqiStandard: AqiStandard;
  dominantPollutant: 'PM2.5' | 'PM10' | 'Unknown';
  category: AqiCategory;
  pollutants: PollutantReadings;
  hourlyForecast: HourlyForecastPoint[];
  lastUpdated: string;
  isDemoData: boolean;
  demoReason?: string;
}

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
}
