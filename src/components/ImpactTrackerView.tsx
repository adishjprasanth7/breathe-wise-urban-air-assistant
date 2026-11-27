import { useState, type FormEvent } from 'react';
import { Leaf, Plus, Trash2, SlidersHorizontal, Info } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import type { EmissionFactors, ImpactActionType, ImpactLogEntry } from '../types/impact';
import {
  IMPACT_ACTION_DEFINITIONS,
  buildWeeklyChartData,
  calculateCo2eSavedKg,
  getTodayIsoDate,
  summarizeImpact,
} from '../utils/impact';
import { EmissionAssumptionsPanel } from './impact/EmissionAssumptionsPanel';
import { CommunityInsightsSection } from './impact/CommunityInsightsSection';

interface ImpactTrackerViewProps {
  entries: ImpactLogEntry[];
  factors: EmissionFactors;
  onAddEntry: (entry: ImpactLogEntry) => void;
  onDeleteEntry: (id: string) => void;
  onUpdateFactors: (next: EmissionFactors) => void;
}

export function ImpactTrackerView({
  entries,
  factors,
  onAddEntry,
  onDeleteEntry,
  onUpdateFactors,
}: ImpactTrackerViewProps) {
  const [selectedType, setSelectedType] = useState<ImpactActionType>('walk_cycle');
  const [amount, setAmount] = useState<number>(3);
  const [tripsAvoided, setTripsAvoided] = useState<number>(1);
  const [showAssumptions, setShowAssumptions] = useState(false);

  const selectedDef =
    IMPACT_ACTION_DEFINITIONS.find((d) => d.type === selectedType) ??
    IMPACT_ACTION_DEFINITIONS[0];

  const previewCo2e = calculateCo2eSavedKg(selectedType, amount, factors);
  const summary = summarizeImpact(entries);

  const handleTypeChange = (type: ImpactActionType) => {
    setSelectedType(type);
    const def = IMPACT_ACTION_DEFINITIONS.find((d) => d.type === type);
    if (def) {
      setAmount(def.defaultAmount);
      setTripsAvoided(type === 'no_idling' || type === 'energy_saving' ? 0 : 1);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!Number.isFinite(amount) || amount <= 0) return;

    const entry: ImpactLogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      date: getTodayIsoDate(),
      type: selectedType,
      label: selectedDef.label,
      amount: Math.round(amount * 10) / 10,
      unit: selectedDef.unit,
      tripsAvoided: Math.max(0, Math.round(tripsAvoided)),
      co2eSavedKg: previewCo2e,
      createdAt: new Date().toISOString(),
    };
    onAddEntry(entry);
  };

  const chartData = buildWeeklyChartData(entries);

  return (
    <div className="space-y-6">
      <h1 className="sr-only">Environmental Impact Tracker</h1>
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-600">CO₂e Avoided Today</p>
          <p className="text-2xl font-bold text-forest-800 mt-1">{summary.todayCo2eKg} kg</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-600">7-Day CO₂e Avoided</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.weeklyCo2eKg} kg</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-600">Car Trips Avoided (7d)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.totalTripsAvoided}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm">
          <p className="text-xs font-medium text-slate-600">Sustainable Travel (7d)</p>
          <p className="text-2xl font-bold text-slate-900 mt-1">{summary.sustainableDistanceKm} km</p>
        </div>
      </div>

      {/* Logger + Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Leaf className="w-5 h-5 text-forest-700" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-900">Log Low-Emission Action</h2>
            </div>
            <button
              type="button"
              onClick={() => setShowAssumptions((s) => !s)}
              aria-expanded={showAssumptions}
              aria-controls="emission-assumptions-panel"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-800 bg-forest-50 px-2.5 py-1.5 rounded-lg border border-forest-200"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Assumptions</span>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="impact-action-type" className="block text-xs font-semibold text-slate-700 mb-1">
                Action Type
              </label>
              <select
                id="impact-action-type"
                value={selectedType}
                onChange={(e) => handleTypeChange(e.target.value as ImpactActionType)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
              >
                {IMPACT_ACTION_DEFINITIONS.map((def) => (
                  <option key={def.type} value={def.type}>
                    {def.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="impact-amount" className="block text-xs font-semibold text-slate-700 mb-1">
                  Amount ({selectedDef.unit})
                </label>
                <input
                  id="impact-amount"
                  type="number"
                  min={0.1}
                  max={1000}
                  step="any"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
                />
              </div>

              <div>
                <label htmlFor="impact-trips" className="block text-xs font-semibold text-slate-700 mb-1">
                  Car Trips Avoided
                </label>
                <input
                  id="impact-trips"
                  type="number"
                  min={0}
                  max={20}
                  value={tripsAvoided}
                  onChange={(e) => setTripsAvoided(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
                />
              </div>
            </div>

            <div className="bg-forest-50 border border-forest-200 rounded-xl p-3 text-xs text-forest-950">
              <p>
                <strong>Formula:</strong> {selectedDef.formulaDescription}
              </p>
              <p className="mt-1">
                <strong>Estimated CO₂e avoided:</strong> {previewCo2e} kg CO₂e
              </p>
            </div>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-forest-800 text-white text-sm font-semibold hover:bg-forest-900"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>Save Action Locally</span>
            </button>
          </form>

          {showAssumptions && (
            <EmissionAssumptionsPanel factors={factors} onUpdateFactors={onUpdateFactors} />
          )}
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 mb-3">7-Day CO₂e Avoided (kg)</h2>
            <div
              className="h-56 w-full"
              role="img"
              aria-label="Bar chart showing estimated kilograms of CO2e avoided over the last 7 days."
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#475569' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
                  <Tooltip />
                  <Bar dataKey="co2eKg" fill="#27664f" radius={[6, 6, 0, 0]} name="kg CO₂e avoided" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-2 text-xs text-slate-600">
            <Info className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              This tracker estimates avoided greenhouse gas emissions (kg CO₂e). Individual actions
              help reduce local tailpipe exhaust, but do not directly produce a measurable change in
              ambient city AQI.
            </span>
          </div>
        </section>
      </div>

      {/* Logged Entries */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 mb-3">Recent Logged Actions</h2>
        {entries.length === 0 ? (
          <p className="text-sm text-slate-600">
            No actions logged yet. Log a walk, transit trip, or no-idling habit above to start tracking.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {entries.slice(0, 8).map((entry) => (
              <li key={entry.id} className="py-3 flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm font-medium text-slate-900">{entry.label}</p>
                  <p className="text-xs text-slate-500">
                    {entry.date} · {entry.amount} {entry.unit}
                    {entry.tripsAvoided > 0 ? ` · ${entry.tripsAvoided} trip(s) avoided` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-forest-800">
                    {entry.co2eSavedKg} kg CO₂e
                  </span>
                  <button
                    type="button"
                    onClick={() => onDeleteEntry(entry.id)}
                    aria-label={`Delete ${entry.label}`}
                    className="p-1.5 text-slate-400 hover:text-red-600 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" aria-hidden="true" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <CommunityInsightsSection />
    </div>
  );
}
