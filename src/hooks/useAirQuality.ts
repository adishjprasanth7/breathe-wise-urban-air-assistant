import { useState, useEffect, useCallback, useRef } from 'react';
import type { AirQualityData, LocationInfo } from '../types/aqi';
import {
  DEFAULT_LOCATION,
  createDemoAirQualityData,
  fetchAirQuality,
} from '../services/openMeteo';

interface UseAirQualityReturn {
  data: AirQualityData | null;
  location: LocationInfo;
  loading: boolean;
  error: string | null;
  geoError: string | null;
  geoLoading: boolean;
  setLocation: (loc: LocationInfo) => void;
  requestGeolocation: () => void;
  refresh: () => void;
  useDemoFallback: () => void;
}

export function useAirQuality(initialLocation: LocationInfo = DEFAULT_LOCATION): UseAirQualityReturn {
  const [location, setLocationState] = useState<LocationInfo>(initialLocation);
  const [data, setData] = useState<AirQualityData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [refreshTick, setRefreshTick] = useState<number>(0);
  const forceRefreshRef = useRef<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    let isActive = true;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchAirQuality(location, {
          signal: controller.signal,
          forceRefresh: forceRefreshRef.current,
        });
        forceRefreshRef.current = false;
        if (isActive) {
          setData(result);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }
        if (isActive) {
          const message =
            err instanceof Error
              ? err.message
              : 'Unable to reach Open-Meteo Air Quality API.';
          setError(message);
          // Provide clearly labeled demo data only if we don't have data yet, or let user retry
          setData((prev) =>
            prev && prev.location.name === location.name
              ? prev
              : createDemoAirQualityData(location, `${message} Showing clearly labeled sample data.`)
          );
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      isActive = false;
      controller.abort();
    };
  }, [location, refreshTick]);

  const setLocation = useCallback((loc: LocationInfo) => {
    setGeoError(null);
    setLocationState(loc);
  }, []);

  const refresh = useCallback(() => {
    forceRefreshRef.current = true;
    setRefreshTick((t) => t + 1);
  }, []);

  const useDemoFallback = useCallback(() => {
    setError(null);
    setData(
      createDemoAirQualityData(
        location,
        'Demo mode enabled — displaying sample winter smog readings.'
      )
    );
  }, [location]);

  const requestGeolocation = useCallback(() => {
    if (!('geolocation' in navigator)) {
      setGeoError('Browser geolocation is not supported on this device. Please search for a city.');
      return;
    }

    setGeoLoading(true);
    setGeoError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGeoLoading(false);
        setLocationState({
          name: 'Current Location',
          region: `${position.coords.latitude.toFixed(2)}°, ${position.coords.longitude.toFixed(2)}°`,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          source: 'geolocation',
        });
      },
      (err) => {
        setGeoLoading(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setGeoError('Location permission was denied. You can search for your city manually.');
            break;
          case err.POSITION_UNAVAILABLE:
            setGeoError('Location information is currently unavailable. Please select a city.');
            break;
          case err.TIMEOUT:
            setGeoError('Location request timed out. Please try again or search manually.');
            break;
          default:
            setGeoError('Could not determine your location. Using selected city instead.');
        }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 300000 }
    );
  }, []);

  return {
    data,
    location,
    loading,
    error,
    geoError,
    geoLoading,
    setLocation,
    requestGeolocation,
    refresh,
    useDemoFallback,
  };
}
