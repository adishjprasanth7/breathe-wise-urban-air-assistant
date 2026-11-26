import { useState, type FormEvent } from 'react';
import {
  Sparkles,
  Send,
  ShieldAlert,
  Home,
  Footprints,
  Leaf,
  HelpCircle,
  Loader2,
  Cpu,
  AlertCircle,
} from 'lucide-react';
import type { AirQualityData } from '../types/aqi';
import type {
  AgeCategory,
  AssistantResponseData,
  CommuteType,
  FamilyProfile,
} from '../types/assistant';
import { askFamilyAssistant } from '../services/assistantApi';

interface AssistantViewProps {
  airQuality: AirQualityData | null;
  profile: FamilyProfile;
  onUpdateProfile: (next: FamilyProfile) => void;
}

const SUGGESTED_QUESTIONS = [
  'Is it safe to take my children outside today?',
  'How should I protect my elderly parents?',
  'How can I reduce indoor PM2.5?',
  'Should I exercise outdoors today?',
  'What should I do during severe smog?',
  'What can I do today to reduce pollution?',
];

const AGE_OPTIONS: Array<{ id: AgeCategory; label: string }> = [
  { id: 'children', label: 'Children' },
  { id: 'adults', label: 'Adults' },
  { id: 'elderly', label: 'Elderly (65+)' },
  { id: 'sensitive', label: 'Asthma / Sensitive' },
];

export function AssistantView({ airQuality, profile, onUpdateProfile }: AssistantViewProps) {
  const [question, setQuestion] = useState(SUGGESTED_QUESTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AssistantResponseData | null>(null);

  const toggleAgeCategory = (cat: AgeCategory) => {
    const exists = profile.ageCategories.includes(cat);
    const next = exists
      ? profile.ageCategories.filter((c) => c !== cat)
      : [...profile.ageCategories, cat];
    if (next.length > 0) {
      onUpdateProfile({ ...profile, ageCategories: next });
    }
  };

  const submitQuestion = async (promptText: string) => {
    const trimmed = promptText.trim();
    if (trimmed.length < 3) {
      setError('Please enter a question of at least 3 characters.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const result = await askFamilyAssistant({
        question: trimmed,
        profile,
        airQuality: {
          locationName: airQuality?.location.name ?? 'Your Area',
          aqi: airQuality?.aqi ?? null,
          category: airQuality?.category ?? 'Unavailable',
          pollutants: airQuality?.pollutants ?? {
            pm25: null,
            pm10: null,
            ozone: null,
            no2: null,
            co: null,
          },
          isDemoData: airQuality?.isDemoData ?? true,
        },
      });
      setResponse(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to reach assistant service.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    submitQuestion(question);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <h1 className="text-xl font-bold text-slate-900">AI Family Safety Assistant</h1>
            <p className="text-sm text-slate-600 mt-1">
              Tailored guidance using live AQI ({airQuality?.aqi ?? 'N/A'} ·{' '}
              {airQuality?.location.name ?? 'Default'}) and your household context.
            </p>
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-forest-50 text-forest-900 border border-forest-200">
            <Sparkles className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Gemini AI + Safe Rule Fallback</span>
          </span>
        </div>

        {/* Household Context Form */}
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
            <label htmlFor="outdoor-activities" className="block text-xs font-semibold text-slate-700 mb-1">
              Outdoor Activities
            </label>
            <input
              id="outdoor-activities"
              type="text"
              maxLength={200}
              value={profile.outdoorActivities}
              onChange={(e) =>
                onUpdateProfile({ ...profile, outdoorActivities: e.target.value })
              }
              placeholder="e.g. School walk, morning jog"
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
            />
          </div>

          <div>
            <label htmlFor="preferred-language" className="block text-xs font-semibold text-slate-700 mb-1">
              Preferred Language
            </label>
            <select
              id="preferred-language"
              value={profile.preferredLanguage}
              onChange={(e) =>
                onUpdateProfile({ ...profile, preferredLanguage: e.target.value })
              }
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
            <div className="flex flex-wrap gap-2">
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
                onChange={(e) =>
                  onUpdateProfile({ ...profile, hasHepaPurifier: e.target.checked })
                }
                className="w-4 h-4 accent-forest-800 rounded"
              />
              <span>HEPA Purifier Available</span>
            </label>

            <label className="inline-flex items-center gap-2 text-sm text-slate-800 cursor-pointer">
              <input
                type="checkbox"
                checked={profile.hasOutdoorJob}
                onChange={(e) =>
                  onUpdateProfile({ ...profile, hasOutdoorJob: e.target.checked })
                }
                className="w-4 h-4 accent-forest-800 rounded"
              />
              <span>Outdoor Job in Household</span>
            </label>
          </div>
        </div>

        {/* Question Form */}
        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label htmlFor="assistant-question" className="block text-sm font-semibold text-slate-800 mb-1.5">
              Ask a question
            </label>
            <div className="flex flex-col sm:flex-row gap-2.5">
              <input
                id="assistant-question"
                type="text"
                maxLength={500}
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask about outdoor safety, elderly care, indoor PM2.5, or low-emission swaps..."
                className="flex-1 px-4 py-2.5 text-sm border border-slate-300 rounded-xl bg-white"
              />
              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-forest-800 text-white text-sm font-semibold hover:bg-forest-900 disabled:opacity-60 min-h-[42px]"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Send className="w-4 h-4" aria-hidden="true" />
                )}
                <span>Get Guidance</span>
              </button>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {SUGGESTED_QUESTIONS.map((q) => (
              <button
                key={q}
                type="button"
                onClick={() => {
                  setQuestion(q);
                  submitQuestion(q);
                }}
                className="text-xs px-3 py-1.5 rounded-full bg-slate-100 hover:bg-forest-50 text-slate-700 hover:text-forest-900 border border-slate-200 transition-colors"
              >
                {q}
              </button>
            ))}
          </div>
        </form>

        {error && (
          <div
            role="alert"
            className="mt-4 flex items-start gap-2 text-sm text-red-900 bg-red-50 border border-red-200 rounded-xl p-3"
          >
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Response Section */}
      {loading && (
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 animate-pulse">
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
        </div>
      )}

      {!loading && response && (
        <article className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-forest-800" aria-hidden="true" />
              <h2 className="text-lg font-bold text-slate-900">Recommended Action Plan</h2>
            </div>
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                response.source === 'gemini'
                  ? 'bg-forest-50 text-forest-900 border-forest-200'
                  : 'bg-amber-50 text-amber-900 border-amber-200'
              }`}
            >
              {response.source === 'gemini'
                ? `Generated by Gemini (${response.modelUsed ?? 'AI'})`
                : 'Rule-Based Safety Fallback (Non-AI)'}
            </span>
          </div>

          <section className="bg-slate-50 border border-slate-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-orange-600" aria-hidden="true" />
              <span>1. Risk Summary</span>
            </h3>
            <p className="text-sm text-slate-700 mt-1.5 leading-relaxed">{response.riskSummary}</p>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <section className="border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-900">2. Actions to Take Today</h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700 list-disc pl-5">
                {response.actionsToday.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Home className="w-4 h-4 text-forest-700" aria-hidden="true" />
                <span>3. Indoor Protection</span>
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700 list-disc pl-5">
                {response.indoorProtection.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Footprints className="w-4 h-4 text-forest-700" aria-hidden="true" />
                <span>4. Outdoor Recommendations</span>
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700 list-disc pl-5">
                {response.outdoorRecommendations.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="border border-slate-200 rounded-xl p-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5">
                <Leaf className="w-4 h-4 text-forest-700" aria-hidden="true" />
                <span>5. Low-Emission Alternatives</span>
              </h3>
              <ul className="mt-2 space-y-1.5 text-sm text-slate-700 list-disc pl-5">
                {response.lowEmissionAlternatives.map((item, idx) => (
                  <li key={idx}>{item}</li>
                ))}
              </ul>
            </section>
          </div>

          <section className="bg-forest-50 border border-forest-200 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-forest-950">6. Estimated Environmental Impact</h3>
            <p className="text-sm text-forest-900 mt-1">{response.estimatedImpact}</p>
          </section>

          <section>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-1.5 mb-2">
              <HelpCircle className="w-4 h-4 text-forest-700" aria-hidden="true" />
              <span>7. Why Each Recommendation Is Useful</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {response.explanations.map((exp, idx) => (
                <div key={idx} className="bg-slate-50 border border-slate-200 rounded-xl p-3.5">
                  <p className="text-xs font-semibold text-slate-900">{exp.action}</p>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{exp.whyUseful}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="text-xs text-slate-500 border-t border-slate-100 pt-3">
            {response.disclaimer}
          </p>
        </article>
      )}
    </div>
  );
}
