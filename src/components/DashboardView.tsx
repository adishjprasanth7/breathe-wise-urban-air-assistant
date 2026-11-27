import {
  ShieldAlert,
  ShieldCheck,
  Wind,
  Sparkles,
  Leaf,
  AlertTriangle,
  Clock,
  ArrowRight,
  Info,
} from 'lucide-react';
import type { AirQualityData } from '../types/aqi';
import type { DailyTask } from '../types/planner';
import { POLLUTANT_METADATA, getAqiMeta } from '../utils/aqi';
import { ForecastChart } from './ForecastChart';
import { ChecklistItem } from './ChecklistItem';

export type NavTab =
  | 'dashboard'
  | 'air-quality'
  | 'assistant'
  | 'daily-plan'
  | 'indoor'
  | 'impact';

interface DashboardViewProps {
  data: AirQualityData | null;
  loading: boolean;
  error: string | null;
  tasks: DailyTask[];
  onToggleTask: (taskId: string) => void;
  onNavigate: (tab: NavTab) => void;
  onRetry: () => void;
  todayCo2eKg: number;
  weeklyCo2eKg: number;
}

export function DashboardView({
  data,
  loading,
  error,
  tasks,
  onToggleTask,
  onNavigate,
  onRetry,
  todayCo2eKg,
  weeklyCo2eKg,
}: DashboardViewProps) {
  if (loading && !data) {
    return (
      <div className="space-y-6" aria-busy="true" aria-label="Loading dashboard">
        <div className="h-44 bg-white border border-slate-200 rounded-2xl p-6 animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-28 bg-white border border-slate-200 rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="h-72 bg-white border border-slate-200 rounded-2xl animate-pulse" />
      </div>
    );
  }

  if (!data) {
    return (
      <div
        role="alert"
        className="bg-white border border-red-200 rounded-2xl p-8 text-center shadow-sm"
      >
        <AlertTriangle className="w-10 h-10 text-red-600 mx-auto mb-3" aria-hidden="true" />
        <h2 className="text-lg font-semibold text-slate-900">Unable to load air quality data</h2>
        <p className="text-sm text-slate-600 mt-1 max-w-md mx-auto">
          {error ?? 'Please check your connection or try searching for another city.'}
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 px-4 py-2 bg-forest-800 text-white text-sm font-medium rounded-xl hover:bg-forest-900"
        >
          Retry
        </button>
      </div>
    );
  }

  const meta = getAqiMeta(data.category);
  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Air Quality Dashboard</h1>
      {data.isDemoData && (
        <div
          role="status"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-amber-50 border border-amber-300 rounded-2xl px-4 py-3 text-sm text-amber-950"
        >
          <div className="flex items-start gap-2.5">
            <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <span className="font-semibold">Demo / Sample Data Mode:</span>{' '}
              <span>{data.demoReason}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRetry}
            className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-amber-900 text-white text-xs font-medium hover:bg-amber-950 shrink-0"
          >
            Retry Live API
          </button>
        </div>
      )}

      {/* Hero AQI & Health Guidance */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section
          aria-labelledby="aqi-card-heading"
          className={`bg-white border border-slate-200 rounded-2xl p-6 shadow-sm ${meta.cardAccentClasses}`}
        >
          <div className="flex items-center justify-between gap-2">
            <h2 id="aqi-card-heading" className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
              Current Air Quality
            </h2>
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${meta.badgeClasses}`}
            >
              {data.category === 'Good' ? (
                <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
              ) : (
                <ShieldAlert className="w-3.5 h-3.5" aria-hidden="true" />
              )}
              <span>{meta.shortLabel}</span>
            </span>
          </div>

          <div className="mt-4 flex items-baseline gap-3">
            <span className={`text-5xl font-bold tracking-tight ${meta.textColorClass}`}>
              {data.aqi !== null ? data.aqi : 'N/A'}
            </span>
            <div className="text-xs text-slate-600">
              <p className="font-semibold text-slate-800">{data.aqiStandard}</p>
              <p>Dominant: {data.dominantPollutant}</p>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" aria-hidden="true" />
              Updated: {new Date(data.lastUpdated).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="font-medium text-slate-700">
              {data.isDemoData ? 'Sample Data' : 'Open-Meteo Live'}
            </span>
          </div>
        </section>

        <section
          aria-labelledby="health-guidance-heading"
          className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between gap-2">
              <h2 id="health-guidance-heading" className="text-base font-semibold text-slate-900">
                Health Risk Guidance
              </h2>
              <button
                type="button"
                onClick={() => onNavigate('air-quality')}
                className="text-xs font-medium text-forest-800 hover:underline inline-flex items-center gap-1"
              >
                <span>Full breakdown</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>
            <p className="text-sm text-slate-700 mt-2">{meta.guidanceSummary}</p>

            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                <h3 className="text-xs font-semibold text-slate-800 uppercase tracking-wide">
                  Sensitive Groups (Children, Elderly, Asthma)
                </h3>
                <p className="text-xs text-slate-700 mt-1.5 leading-relaxed">
                  {meta.sensitiveGroupAdvice}
                </p>
              </div>
              <div className="bg-forest-50/70 border border-forest-200 rounded-xl p-3.5">
                <h3 className="text-xs font-semibold text-forest-900 uppercase tracking-wide">
                  General Public
                </h3>
                <p className="text-xs text-forest-900 mt-1.5 leading-relaxed">
                  {meta.generalPublicAdvice}
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* Pollutant Cards */}
      <section aria-labelledby="pollutants-heading">
        <div className="flex items-center justify-between mb-3">
          <h2 id="pollutants-heading" className="text-base font-semibold text-slate-900">
            Key Pollutants
          </h2>
          <span className="text-xs text-slate-500">Concentrations in µg/m³</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
          {POLLUTANT_METADATA.map((item) => {
            const value = data.pollutants[item.key];
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
                  <span className="text-xs text-slate-500 ml-1">{value !== null ? item.unit : 'N/A'}</span>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Forecast + AI Recommendation Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section
          aria-labelledby="forecast-heading"
          className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <Wind className="w-5 h-5 text-forest-700" aria-hidden="true" />
            <h2 id="forecast-heading" className="text-base font-semibold text-slate-900">
              Today’s Air Quality Forecast
            </h2>
          </div>
          <ForecastChart hourlyForecast={data.hourlyForecast} accentColor={meta.chartColor} />
        </section>

        <section
          aria-labelledby="ai-card-heading"
          className="bg-forest-900 text-white rounded-2xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-forest-800 text-forest-100 text-xs font-medium">
              <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
              <span>AI Family Safety Assistant</span>
            </div>
            <h2 id="ai-card-heading" className="text-lg font-semibold mt-4">
              Personalized guidance for your household
            </h2>
            <p className="text-sm text-forest-100 mt-2 leading-relaxed">
              Ask about outdoor play for children, protecting elderly parents, indoor PM2.5 reduction,
              or low-emission commute swaps tailored to {data.location.name}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigate('assistant')}
            className="mt-6 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white text-forest-950 font-semibold text-sm hover:bg-forest-50 transition-colors"
          >
            <span>Ask BreatheWise Assistant</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </section>
      </div>

      {/* Today's Checklist + Impact Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section
          aria-labelledby="checklist-heading"
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 id="checklist-heading" className="text-base font-semibold text-slate-900">
                Today’s Action Checklist
              </h2>
              <p className="text-xs text-slate-600 mt-0.5">
                {completedCount} of {tasks.length} actions completed
              </p>
            </div>
            <button
              type="button"
              onClick={() => onNavigate('daily-plan')}
              className="text-xs font-medium text-forest-800 hover:underline inline-flex items-center gap-1"
            >
              <span>Open full plan</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <ul className="space-y-2.5">
            {tasks.slice(0, 4).map((task) => (
              <li key={task.id}>
                <ChecklistItem task={task} onToggle={onToggleTask} showPeriod />
              </li>
            ))}
          </ul>
        </section>

        <section
          aria-labelledby="impact-summary-heading"
          className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Leaf className="w-5 h-5 text-forest-700" aria-hidden="true" />
                <h2 id="impact-summary-heading" className="text-base font-semibold text-slate-900">
                  Environmental Impact Summary
                </h2>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('impact')}
                className="text-xs font-medium text-forest-800 hover:underline inline-flex items-center gap-1"
              >
                <span>Log action</span>
                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
              </button>
            </div>

            <div className="mt-5 grid grid-cols-2 gap-4">
              <div className="bg-forest-50 border border-forest-200 rounded-xl p-4">
                <p className="text-xs font-medium text-forest-900">CO₂e Avoided Today</p>
                <p className="text-2xl font-bold text-forest-950 mt-1">{todayCo2eKg} kg</p>
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <p className="text-xs font-medium text-slate-700">7-Day Total Avoided</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{weeklyCo2eKg} kg</p>
              </div>
            </div>
          </div>

          <p className="text-xs text-slate-500 mt-4 leading-relaxed">
            Estimates use transparent emission factors stored locally in your browser. Individual
            choices reduce tailpipe and energy emissions, though they do not measurably alter
            city-wide ambient AQI on their own.
          </p>
        </section>
      </div>
    </div>
  );
}
