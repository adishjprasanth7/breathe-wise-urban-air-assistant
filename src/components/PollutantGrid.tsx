import { Info } from 'lucide-react';
import type { PollutantReadings } from '../types/aqi';
import { POLLUTANT_METADATA } from '../utils/aqi';

interface PollutantGridProps {
  pollutants: PollutantReadings;
}

export function PollutantGrid({ pollutants }: PollutantGridProps) {
  return (
    <section aria-labelledby="pollutants-heading">
      <div className="flex items-center justify-between mb-3">
        <h2 id="pollutants-heading" className="text-base font-semibold text-slate-900">
          Key Pollutants
        </h2>
        <span className="text-xs text-slate-500">Concentrations in µg/m³</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {POLLUTANT_METADATA.map((item) => {
          const value = pollutants[item.key];
          return (
            <article
              key={item.key}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-forest-800 bg-forest-50 px-2 py-0.5 rounded-md">
                    {item.formula}
                  </span>
                  <button
                    type="button"
                    title={item.description}
                    aria-label={`${item.name} (${item.formula}): ${item.description}`}
                    className="text-slate-500 hover:text-forest-800 rounded p-0.5"
                  >
                    <Info className="w-3.5 h-3.5" aria-hidden="true" />
                  </button>
                </div>
                <p className="text-xs text-slate-600 mt-2 font-medium">{item.name}</p>
              </div>
              <div className="mt-3">
                <span className="text-2xl font-bold text-slate-900">
                  {value !== null ? value : '—'}
                </span>
                <span className="text-xs text-slate-500 ml-1">
                  {value !== null ? item.unit : 'N/A'}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
