import type { AgeCategory, CommuteType, FamilyProfile } from '../../types/assistant';

interface FamilyProfileFormProps {
  profile: FamilyProfile;
  onUpdateProfile: (next: FamilyProfile) => void;
}

const AGE_OPTIONS: Array<{ id: AgeCategory; label: string }> = [
  { id: 'children', label: 'Children' },
  { id: 'adults', label: 'Adults' },
  { id: 'elderly', label: 'Elderly (65+)' },
  { id: 'sensitive', label: 'Asthma / Sensitive' },
];

export function FamilyProfileForm({ profile, onUpdateProfile }: FamilyProfileFormProps) {
  const toggleAgeCategory = (cat: AgeCategory) => {
    const exists = profile.ageCategories.includes(cat);
    const next = exists
      ? profile.ageCategories.filter((c) => c !== cat)
      : [...profile.ageCategories, cat];
    if (next.length > 0) {
      onUpdateProfile({ ...profile, ageCategories: next });
    }
  };

  return (
    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-slate-50 border border-slate-200 rounded-xl p-4">
      <div>
        <label htmlFor="family-size" className="block text-xs font-semibold text-slate-700 mb-1">
          Family Size
        </label>
        <input
          id="family-size"
          type="number"
          min={1}
          max={20}
          value={profile.familySize}
          onChange={(e) =>
            onUpdateProfile({
              ...profile,
              familySize: Math.max(1, Math.min(20, Number(e.target.value) || 1)),
            })
          }
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
        />
      </div>

      <div>
        <label htmlFor="commute-type" className="block text-xs font-semibold text-slate-700 mb-1">
          Primary Commute
        </label>
        <select
          id="commute-type"
          value={profile.commuteType}
          onChange={(e) =>
            onUpdateProfile({ ...profile, commuteType: e.target.value as CommuteType })
          }
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
        >
          <option value="car">Private Car</option>
          <option value="public_transit">Public Transit</option>
          <option value="walking_cycling">Walking / Cycling</option>
          <option value="mixed">Mixed</option>
          <option value="remote">Work / Study from Home</option>
        </select>
      </div>

      <div>
        <label
          htmlFor="outdoor-activities"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Outdoor Activities
        </label>
        <input
          id="outdoor-activities"
          type="text"
          maxLength={200}
          value={profile.outdoorActivities}
          onChange={(e) => onUpdateProfile({ ...profile, outdoorActivities: e.target.value })}
          placeholder="e.g. School walk, morning jog"
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
        />
      </div>

      <div>
        <label
          htmlFor="preferred-language"
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          Preferred Language
        </label>
        <select
          id="preferred-language"
          value={profile.preferredLanguage}
          onChange={(e) => onUpdateProfile({ ...profile, preferredLanguage: e.target.value })}
          className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
        >
          <option value="English">English</option>
          <option value="Hindi">Hindi</option>
          <option value="Spanish">Spanish</option>
          <option value="French">French</option>
          <option value="Mandarin">Mandarin</option>
        </select>
      </div>

      <div className="sm:col-span-2">
        <span className="block text-xs font-semibold text-slate-700 mb-1.5">
          Household Age & Sensitivity Groups
        </span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Household age and sensitivity groups">
          {AGE_OPTIONS.map((opt) => {
            const selected = profile.ageCategories.includes(opt.id);
            return (
              <button
                key={opt.id}
                type="button"
                aria-pressed={selected}
                onClick={() => toggleAgeCategory(opt.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  selected
                    ? 'bg-forest-800 text-white border-forest-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {opt.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="sm:col-span-2 flex flex-wrap items-center gap-4 pt-2">
        <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.hasHepaPurifier}
            onChange={(e) => onUpdateProfile({ ...profile, hasHepaPurifier: e.target.checked })}
            className="w-4 h-4 accent-forest-800 rounded"
          />
          <span>HEPA Purifier Available</span>
        </label>

        <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
          <input
            type="checkbox"
            checked={profile.hasOutdoorJob}
            onChange={(e) => onUpdateProfile({ ...profile, hasOutdoorJob: e.target.checked })}
            className="w-4 h-4 accent-forest-800 rounded"
          />
          <span>Outdoor Job in Household</span>
        </label>
      </div>
    </div>
  );
}
