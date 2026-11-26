import {
  Wind,
  Droplets,
  Flame,
  Ban,
  Fan,
  Sparkles,
  DoorOpen,
  ShieldAlert,
  Filter,
} from 'lucide-react';
import type { AirQualityData } from '../types/aqi';

interface IndoorProtectionViewProps {
  airQuality: AirQualityData | null;
}

interface IndoorCard {
  title: string;
  badge: string;
  description: string;
  whyItHelps: string;
  icon: typeof Filter;
}

const INDOOR_CARDS: IndoorCard[] = [
  {
    title: 'Use True HEPA Filtration',
    badge: 'High Impact',
    description:
      'Run a portable True HEPA air purifier (or a DIY MERV-13 box fan filter) in the room where your family spends the most time.',
    whyItHelps:
      'HEPA media physically traps 99.97% of 0.3 µm particles, steadily lowering indoor PM2.5.',
    icon: Filter,
  },
  {
    title: 'Time Window Opening by Outdoor AQI',
    badge: 'Smart Timing',
    description:
      'Keep exterior windows closed during peak smog or rush-hour spikes; open them briefly when outdoor AQI drops into Good or Moderate ranges.',
    whyItHelps:
      'Prevents outdoor PM2.5 infiltration during pollution peaks while preserving essential fresh-air exchange when air clears.',
    icon: DoorOpen,
  },
  {
    title: 'Wet Cleaning Instead of Dry Sweeping',
    badge: 'Daily Habit',
    description:
      'Damp-mop floors and wipe surfaces with a wet microfiber cloth rather than dry sweeping or feather dusting.',
    whyItHelps:
      'Dry sweeping kicks settled fine dust back into breathing height; wet cleaning captures particles permanently.',
    icon: Droplets,
  },
  {
    title: 'Ventilate While Cooking',
    badge: 'Essential',
    description:
      'Turn on a vented range hood or kitchen exhaust fan before and during frying, grilling, or high-heat cooking.',
    whyItHelps:
      'Cooking aerosols and gas-stove NO₂ can spike indoor air pollution higher than outdoor smog.',
    icon: Fan,
  },
  {
    title: 'Zero Indoor Smoking or Vaping',
    badge: 'Critical',
    description:
      'Maintain a strictly smoke-free home and ask guests to smoke well away from open windows and doorways.',
    whyItHelps:
      'Tobacco smoke produces dense, persistent PM2.5 and toxic gases that linger for hours.',
    icon: Ban,
  },
  {
    title: 'Avoid Incense, Candles & Indoor Burning',
    badge: 'Low-Cost',
    description:
      'Skip incense sticks, scented candles, and unvented wood or coal heaters during high-pollution days.',
    whyItHelps:
      'Eliminating unnecessary indoor combustion prevents sharp spikes in indoor fine particles and carbon monoxide.',
    icon: Flame,
  },
  {
    title: 'Reduce Tracked-In Dust',
    badge: 'Easy Win',
    description:
      'Leave shoes at the entryway, use washable doormats, and vacuum carpets with a HEPA-equipped vacuum.',
    whyItHelps:
      'Prevents outdoor road dust and heavy metals from accumulating in indoor living spaces.',
    icon: Sparkles,
  },
  {
    title: 'Maintain Safe Ventilation',
    badge: 'Balance',
    description:
      'Never permanently seal your home or block bathroom/kitchen vents or combustion appliance flues.',
    whyItHelps:
      'Essential ventilation prevents dangerous CO₂, moisture, mold, and carbon monoxide buildup indoors.',
    icon: Wind,
  },
];

export function IndoorProtectionView({ airQuality }: IndoorProtectionViewProps) {
  const aqi = airQuality?.aqi ?? null;
  const shouldCloseWindows = aqi !== null && aqi > 100;

  return (
    <div className="space-y-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h1 className="text-xl font-bold text-slate-900">Indoor Air Quality Protection</h1>
        <p className="text-sm text-slate-600 mt-1">
          Evidence-based steps to keep indoor PM2.5 low during winter smog and urban pollution episodes.
        </p>

        <div
          className={`mt-4 rounded-xl p-4 border text-sm ${
            shouldCloseWindows
              ? 'bg-orange-50 border-orange-200 text-orange-950'
              : 'bg-forest-50 border-forest-200 text-forest-950'
          }`}
        >
          <strong>Current Window Guidance ({airQuality?.location.name ?? 'Your Area'}):</strong>{' '}
          {aqi === null
            ? 'Live AQI is unavailable. Keep windows closed if visible haze or smoke odor is present, and use kitchen/bath exhaust fans as needed.'
            : shouldCloseWindows
              ? `Outdoor US EPA AQI is ${aqi}. Keep exterior windows closed for now, run HEPA filtration if available, and wait for cleaner hours to cross-ventilate.`
              : `Outdoor US EPA AQI is ${aqi}. Conditions are favorable for brief cross-ventilation to refresh indoor air.`}
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {INDOOR_CARDS.map((card) => {
          const Icon = card.icon;
          return (
            <article
              key={card.title}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <div className="p-2 rounded-xl bg-forest-50 text-forest-800">
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
                    {card.badge}
                  </span>
                </div>
                <h2 className="text-base font-semibold text-slate-900 mt-3">{card.title}</h2>
                <p className="text-sm text-slate-600 mt-1.5 leading-relaxed">{card.description}</p>
              </div>
              <p className="text-xs text-slate-700 bg-slate-50 border border-slate-200 rounded-xl p-2.5 mt-4">
                <strong>Why:</strong> {card.whyItHelps}
              </p>
            </article>
          );
        })}
      </div>

      {/* Evidence-based safety guardrails */}
      <section
        aria-labelledby="avoid-section-heading"
        className="bg-red-50 border border-red-200 rounded-2xl p-6"
      >
        <div className="flex items-center gap-2 text-red-900">
          <ShieldAlert className="w-5 h-5" aria-hidden="true" />
          <h2 id="avoid-section-heading" className="text-base font-bold">
            What to Avoid (Evidence-Based Safety Notice)
          </h2>
        </div>
        <ul className="mt-3 space-y-2 text-sm text-red-950 list-disc pl-5">
          <li>
            <strong>Do not rely on indoor houseplants as air purifiers:</strong> Controlled studies
            show potted plants do not remove indoor PM2.5 or gases fast enough to protect health.
          </li>
          <li>
            <strong>Never use ozone generators or ozone-emitting ionizers:</strong> Ozone is a lung
            irritant that worsens asthma and respiratory inflammation.
          </li>
          <li>
            <strong>Never permanently seal your home:</strong> Blocking essential air vents or
            appliance flues creates carbon monoxide and CO₂ hazards.
          </li>
        </ul>
      </section>
    </div>
  );
}
