import { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, RefreshCw, AlertCircle, Loader2 } from 'lucide-react';
import type { GeocodingResult, LocationInfo } from '../types/aqi';
import { PRESET_CITIES, searchCities } from '../services/openMeteo';

interface LocationSelectorProps {
  location: LocationInfo;
  loading: boolean;
  geoLoading: boolean;
  geoError: string | null;
  onSelectLocation: (loc: LocationInfo) => void;
  onRequestGeolocation: () => void;
  onRefresh: () => void;
}

export function LocationSelector({
  location,
  loading,
  geoLoading,
  geoError,
  onSelectLocation,
  onRequestGeolocation,
  onRefresh,
}: LocationSelectorProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setResults([]);
      setSearchError(null);
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      setSearchError(null);
      try {
        const cities = await searchCities(trimmed, controller.signal);
        setResults(cities);
        setIsOpen(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setSearchError('City search unavailable right now. Try a preset city below.');
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: GeocodingResult) => {
    onSelectLocation({
      name: city.name,
      region: city.admin1,
      country: city.country,
      latitude: city.latitude,
      longitude: city.longitude,
      source: 'search',
    });
    setQuery('');
    setResults([]);
    setIsOpen(false);
  };

  return (
    <section
      aria-label="Location controls"
      className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm"
    >
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2.5 rounded-xl bg-forest-50 text-forest-800 shrink-0">
            <MapPin className="w-5 h-5" aria-hidden="true" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-slate-900">
                {location.name}
                {location.region ? `, ${location.region}` : ''}
                {location.country ? ` (${location.country})` : ''}
              </h2>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {location.source === 'geolocation'
                  ? 'Browser GPS'
                  : location.source === 'search'
                    ? 'Selected City'
                    : 'Default City'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Coordinates: {location.latitude.toFixed(2)}°, {location.longitude.toFixed(2)}°
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
          <div ref={containerRef} className="relative flex-1 sm:w-64">
            <label htmlFor="city-search-input" className="sr-only">
              Search city
            </label>
            <div className="relative">
              <Search
                className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
                aria-hidden="true"
              />
              <input
                id="city-search-input"
                type="text"
                role="combobox"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => results.length > 0 && setIsOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsOpen(false);
                  }
                }}
                placeholder="Search city (e.g. Delhi, London)"
                className="w-full pl-9 pr-8 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white text-slate-900 placeholder:text-slate-500"
                aria-autocomplete="list"
                aria-expanded={isOpen}
                aria-controls="city-search-listbox"
              />
              {searching && (
                <Loader2
                  className="w-4 h-4 text-forest-700 animate-spin absolute right-3 top-1/2 -translate-y-1/2"
                  aria-label="Searching cities"
                />
              )}
            </div>

            {isOpen && results.length > 0 && (
              <ul
                id="city-search-listbox"
                role="listbox"
                aria-label="Matching cities"
                className="absolute z-30 mt-1 w-full bg-white border border-slate-200 rounded-xl shadow-lg max-h-60 overflow-auto py-1"
              >
                {results.map((city) => (
                  <li key={city.id} role="option" aria-selected={false}>
                    <button
                      type="button"
                      onClick={() => handleSelectCity(city)}
                      className="w-full text-left px-3 py-2 text-sm hover:bg-forest-50 text-slate-800 flex flex-col"
                    >
                      <span className="font-medium">{city.name}</span>
                      <span className="text-xs text-slate-500">
                        {[city.admin1, city.country].filter(Boolean).join(', ')}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            onClick={onRequestGeolocation}
            disabled={geoLoading}
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl border border-forest-700 text-forest-800 bg-forest-50 hover:bg-forest-100 disabled:opacity-60 transition-colors min-h-[40px]"
          >
            {geoLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
            ) : (
              <Navigation className="w-4 h-4" aria-hidden="true" />
            )}
            <span>Use My Location</span>
          </button>

          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            aria-label="Refresh air quality data"
            className="inline-flex items-center justify-center gap-2 px-3.5 py-2 text-sm font-medium rounded-xl bg-forest-800 text-white hover:bg-forest-900 disabled:opacity-60 transition-colors min-h-[40px]"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} aria-hidden="true" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 flex flex-wrap items-center gap-2">
        <span className="text-xs font-medium text-slate-600">Quick cities:</span>
        {PRESET_CITIES.map((city) => {
          const active = city.name === location.name;
          return (
            <button
              key={city.name}
              type="button"
              onClick={() => onSelectLocation(city)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                active
                  ? 'bg-forest-800 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {city.name}
            </button>
          );
        })}
      </div>

      {(geoError || searchError) && (
        <div
          role="alert"
          className="mt-3 flex items-start gap-2 text-xs text-amber-900 bg-amber-50 border border-amber-200 rounded-xl p-2.5"
        >
          <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <span>{geoError ?? searchError}</span>
        </div>
      )}
    </section>
  );
}
