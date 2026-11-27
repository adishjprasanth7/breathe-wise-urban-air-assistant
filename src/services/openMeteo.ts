import type {
  AirQualityData,
  GeocodingResult,
  HourlyForecastPoint,
  LocationInfo,
  PollutantReadings,
} from '../types/aqi';
import { computeUsEpaAqi, getAqiCategory } from '../utils/aqi';
import { fetchWithTimeout } from '../utils/fetchWithTimeout';

const AIR_QUALITY_ENDPOINT = 'https://air-quality-api.open-meteo.com/v1/air-quality';
const GEOCODING_ENDPOINT = 'https://geocoding-api.open-meteo.com/v1/search';
const CACHE_TTL_MS = 5 * 60 * 1000;
const REQUEST_TIMEOUT_MS = 8000;

interface CacheEntry {
  data: AirQualityData;
  expiresAt: number;
}

const airQualityCache = new Map<string, CacheEntry>();

export const DEFAULT_LOCATION: LocationInfo = {
  name: 'New Delhi',
  region: 'Delhi',
  country: 'India',
  latitude: 28.6139,
  longitude: 77.209,
  source: 'default',
};

export const PRESET_CITIES: LocationInfo[] = [
  DEFAULT_LOCATION,
  { name: 'London', region: 'Greater London', country: 'UK', latitude: 51.5072, longitude: -0.1276, source: 'search' },
  { name: 'Los Angeles', region: 'California', country: 'USA', latitude: 34.0522, longitude: -118.2437, source: 'search' },
  { name: 'Beijing', region: 'Beijing', country: 'China', latitude: 39.9042, longitude: 116.4074, source: 'search' },
  { name: 'Mexico City', region: 'CDMX', country: 'Mexico', latitude: 19.4326, longitude: -99.1332, source: 'search' },
];

function getCacheKey(lat: number, lon: number): string {
  return `${lat.toFixed(2)},${lon.toFixed(2)}`;
}

function toFiniteNumber(val: unknown): number | null {
  return typeof val === 'number' && Number.isFinite(val) ? Math.round(val * 10) / 10 : null;
}

function formatHourLabel(isoTime: string): string {
  const date = new Date(isoTime);
  if (Number.isNaN(date.getTime())) return isoTime;
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

interface OpenMeteoAirQualityResponse {
  current?: {
    time?: string;
    pm2_5?: number | null;
    pm10?: number | null;
    ozone?: number | null;
    nitrogen_dioxide?: number | null;
    carbon_monoxide?: number | null;
  };
  hourly?: {
    time?: string[];
    pm2_5?: Array<number | null>;
    pm10?: Array<number | null>;
    ozone?: Array<number | null>;
    nitrogen_dioxide?: Array<number | null>;
  };
}

export async function fetchAirQuality(
  location: LocationInfo,
  options?: { signal?: AbortSignal; forceRefresh?: boolean }
): Promise<AirQualityData> {
  const cacheKey = getCacheKey(location.latitude, location.longitude);
  const now = Date.now();

  if (!options?.forceRefresh) {
    const cached = airQualityCache.get(cacheKey);
    if (cached && cached.expiresAt > now) {
      return { ...cached.data, location };
    }
  }

  const params = new URLSearchParams({
    latitude: location.latitude.toFixed(4),
    longitude: location.longitude.toFixed(4),
    current: 'pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,ozone',
    hourly: 'pm10,pm2_5,nitrogen_dioxide,ozone',
    forecast_days: '1',
    timezone: 'auto',
  });

  const url = `${AIR_QUALITY_ENDPOINT}?${params.toString()}`;

  let lastError: unknown;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const response = await fetchWithTimeout(url, {
        signal: options?.signal,
        timeoutMs: REQUEST_TIMEOUT_MS,
      });
      if (!response.ok) {
        if (response.status >= 400 && response.status < 500) {
          throw new Error(`Air quality request rejected (${response.status})`);
        }
        throw new Error(`Air quality service error (${response.status})`);
      }

      const raw = (await response.json()) as OpenMeteoAirQualityResponse;
      if (!raw || typeof raw !== 'object' || !raw.current) {
        throw new Error('Invalid air quality payload received from provider.');
      }

      const pollutants: PollutantReadings = {
        pm25: toFiniteNumber(raw.current.pm2_5),
        pm10: toFiniteNumber(raw.current.pm10),
        ozone: toFiniteNumber(raw.current.ozone),
        no2: toFiniteNumber(raw.current.nitrogen_dioxide),
        co: toFiniteNumber(raw.current.carbon_monoxide),
      };

      const { aqi, dominantPollutant } = computeUsEpaAqi(pollutants);
      const category = getAqiCategory(aqi);

      const times = Array.isArray(raw.hourly?.time) ? raw.hourly.time : [];
      const pm25Arr = Array.isArray(raw.hourly?.pm2_5) ? raw.hourly.pm2_5 : [];
      const pm10Arr = Array.isArray(raw.hourly?.pm10) ? raw.hourly.pm10 : [];
      const ozoneArr = Array.isArray(raw.hourly?.ozone) ? raw.hourly.ozone : [];
      const no2Arr = Array.isArray(raw.hourly?.nitrogen_dioxide) ? raw.hourly.nitrogen_dioxide : [];

      const hourlyForecast: HourlyForecastPoint[] = times.slice(0, 24).map((time, idx) => {
        const hPm25 = toFiniteNumber(pm25Arr[idx]);
        const hPm10 = toFiniteNumber(pm10Arr[idx]);
        const hAqi = computeUsEpaAqi({ pm25: hPm25, pm10: hPm10 }).aqi;
        return {
          time,
          label: formatHourLabel(time),
          aqi: hAqi,
          pm25: hPm25,
          pm10: hPm10,
          ozone: toFiniteNumber(ozoneArr[idx]),
          no2: toFiniteNumber(no2Arr[idx]),
        };
      });

      const result: AirQualityData = {
        location,
        aqi,
        aqiStandard: aqi !== null ? 'US EPA AQI' : 'Concentration Only',
        dominantPollutant,
        category,
        pollutants,
        hourlyForecast,
        lastUpdated: raw.current.time ?? new Date().toISOString(),
        isDemoData: false,
      };

      airQualityCache.set(cacheKey, {
        data: result,
        expiresAt: Date.now() + CACHE_TTL_MS,
      });

      return result;
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        throw err;
      }
      lastError = err;
      if (attempt === 0 && err instanceof Error && !err.message.includes('rejected')) {
        continue;
      }
      break;
    }
  }

  throw lastError instanceof Error ? lastError : new Error('Failed to fetch air quality data.');
}

export async function searchCities(
  query: string,
  signal?: AbortSignal
): Promise<GeocodingResult[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    name: trimmed,
    count: '6',
    language: 'en',
    format: 'json',
  });

  const response = await fetchWithTimeout(`${GEOCODING_ENDPOINT}?${params.toString()}`, {
    signal,
    timeoutMs: REQUEST_TIMEOUT_MS,
  });
  if (!response.ok) {
    throw new Error(`City search failed (${response.status})`);
  }

  const data = (await response.json()) as { results?: GeocodingResult[] };
  return Array.isArray(data.results) ? data.results : [];
}

export function createDemoAirQualityData(
  location: LocationInfo = DEFAULT_LOCATION,
  reason = 'Live API unreachable — showing clearly labeled sample winter smog data.'
): AirQualityData {
  const samplePm25 = 92.4;
  const samplePm10 = 148.0;
  const pollutants: PollutantReadings = {
    pm25: samplePm25,
    pm10: samplePm10,
    ozone: 42.5,
    no2: 58.2,
    co: 1120.0,
  };
  const { aqi, dominantPollutant } = computeUsEpaAqi(pollutants);
  const now = new Date();
  const baseDate = now.toISOString().slice(0, 10);

  const hourlyForecast: HourlyForecastPoint[] = Array.from({ length: 24 }, (_, hour) => {
    const wave = Math.sin((hour / 24) * Math.PI * 2);
    const pm25 = Math.round((samplePm25 + wave * 28) * 10) / 10;
    const pm10 = Math.round((samplePm10 + wave * 35) * 10) / 10;
    const hourStr = `${baseDate}T${String(hour).padStart(2, '0')}:00`;
    return {
      time: hourStr,
      label: `${String(hour).padStart(2, '0')}:00`,
      aqi: computeUsEpaAqi({ pm25, pm10 }).aqi,
      pm25,
      pm10,
      ozone: Math.round((35 + Math.cos((hour / 24) * Math.PI * 2) * 15) * 10) / 10,
      no2: Math.round((55 + wave * 12) * 10) / 10,
    };
  });

  return {
    location,
    aqi,
    aqiStandard: 'US EPA AQI',
    dominantPollutant,
    category: getAqiCategory(aqi),
    pollutants,
    hourlyForecast,
    lastUpdated: now.toISOString(),
    isDemoData: true,
    demoReason: reason,
  };
}

export function clearAirQualityCache(): void {
  airQualityCache.clear();
}
