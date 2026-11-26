import type { AirQualityData } from '../types/aqi';
import { POLLUTANT_METADATA, getAqiMeta } from '../utils/aqi';
import { ForecastChart } from './ForecastChart';

interface AirQualityViewProps {
  data: AirQualityData | null;
  loading: boolean;
}

export function AirQualityView({ data, loading }: AirQualityViewProps) {
  if (loading && !data) {
    return <div className="h-96 bg-white border border-slate-200 rounded-2xl animate-pulse" />;
  }

  if (!data) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
        No air quality data loaded yet. Use the location bar above to select a city.
      </div>
    );
  }

  const meta = getAqiMeta(data.category);

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">
              Air Quality Details — {data.location.name}
            </h1>
            <p className="text-sm text-slate-600 mt-0.5">
              Standard: {data.aqiStandard} · Dominant Pollutant: {data.dominantPollutant}
            </p>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold border ${meta.badgeClasses}`}
          >
            {meta.shortLabel} ({data.aqi ?? 'N/A'})
          </span>
        </div>

        <ForecastChart hourlyForecast={data.hourlyForecast} accentColor={meta.chartColor} />
      </div>

      <section aria-labelledby="pollutant-details-heading" className="space-y-4">
        <h2 id="pollutant-details-heading" className="text-lg font-semibold text-slate-900">
          Pollutant Concentrations & Health Context
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {POLLUTANT_METADATA.map((item) => {
            const value = data.pollutants[item.key];
            return (
              <article
                key={item.key}
                className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold text-slate-900">
                    {item.name} ({item.formula})
                  </h3>
                  <span className="text-lg font-bold text-forest-800">
                    {value !== null ? `${value} ${item.unit}` : 'Unavailable'}
                  </span>
                </div>
                <p className="text-sm text-slate-600 mt-2 leading-relaxed">{item.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-slate-100 border border-slate-200 rounded-2xl p-5 text-xs text-slate-700 space-y-1.5">
        <h2 className="text-sm font-semibold text-slate-900">Methodology & Transparency</h2>
        <p>
          BreatheWise retrieves live hourly and current pollutant concentrations (µg/m³) from the
          Open-Meteo Air Quality API and computes the <strong>US EPA AQI</strong> using official
          breakpoint linear interpolation for PM2.5 (2024 revised breakpoints) and PM10.
        </p>
        <p>
          If a pollutant sensor reading is missing, BreatheWise displays “Unavailable” rather than
          estimating or fabricating a value.
        </p>
      </section>
    </div>
  );
}
