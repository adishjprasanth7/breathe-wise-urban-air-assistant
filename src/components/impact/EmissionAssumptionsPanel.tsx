import type { EmissionFactors } from '../../types/impact';

interface EmissionAssumptionsPanelProps {
  factors: EmissionFactors;
  onUpdateFactors: (next: EmissionFactors) => void;
}

export function EmissionAssumptionsPanel({
  factors,
  onUpdateFactors,
}: EmissionAssumptionsPanelProps) {
  return (
    <div
      id="emission-assumptions-panel"
      className="mt-4 pt-4 border-t border-slate-200 space-y-2.5 text-xs"
    >
      <p className="font-semibold text-slate-800">Configurable Emission Factors</p>
      <div className="grid grid-cols-2 gap-2.5">
        <div>
          <label htmlFor="factor-car" className="block text-slate-600">
            Car (kg CO₂e/km)
          </label>
          <input
            id="factor-car"
            type="number"
            step={0.005}
            min={0.01}
            value={factors.carKgPerKm}
            onChange={(e) =>
              onUpdateFactors({ ...factors, carKgPerKm: Number(e.target.value) || 0.192 })
            }
            className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label htmlFor="factor-transit" className="block text-slate-600">
            Transit (kg CO₂e/km)
          </label>
          <input
            id="factor-transit"
            type="number"
            step={0.005}
            min={0}
            value={factors.transitKgPerKm}
            onChange={(e) =>
              onUpdateFactors({ ...factors, transitKgPerKm: Number(e.target.value) || 0.041 })
            }
            className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label htmlFor="factor-idling" className="block text-slate-600">
            Idling (kg CO₂e/min)
          </label>
          <input
            id="factor-idling"
            type="number"
            step={0.005}
            min={0}
            value={factors.idlingKgPerMin}
            onChange={(e) =>
              onUpdateFactors({ ...factors, idlingKgPerMin: Number(e.target.value) || 0.036 })
            }
            className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
          />
        </div>
        <div>
          <label htmlFor="factor-grid" className="block text-slate-600">
            Grid (kg CO₂e/kWh)
          </label>
          <input
            id="factor-grid"
            type="number"
            step={0.01}
            min={0}
            value={factors.electricityKgPerKwh}
            onChange={(e) =>
              onUpdateFactors({
                ...factors,
                electricityKgPerKwh: Number(e.target.value) || 0.417,
              })
            }
            className="mt-1 w-full px-2.5 py-1.5 border border-slate-300 rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}
