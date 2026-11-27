import { useState, type FormEvent } from 'react';
import { Sparkles, Send, Loader2, AlertCircle } from 'lucide-react';
import type { AirQualityData } from '../types/aqi';
import type { AssistantResponseData, FamilyProfile } from '../types/assistant';
import { askFamilyAssistant } from '../services/assistantApi';
import { FamilyProfileForm } from './assistant/FamilyProfileForm';
import { AssistantResponseCard } from './assistant/AssistantResponseCard';

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

export function AssistantView({ airQuality, profile, onUpdateProfile }: AssistantViewProps) {
  const [question, setQuestion] = useState(SUGGESTED_QUESTIONS[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<AssistantResponseData | null>(null);

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

        <FamilyProfileForm profile={profile} onUpdateProfile={onUpdateProfile} />

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          <div>
            <label
              htmlFor="assistant-question"
              className="block text-sm font-semibold text-slate-800 mb-1.5"
            >
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

      {loading && (
        <div
          aria-busy="true"
          aria-label="Generating family safety guidance"
          className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3 animate-pulse"
        >
          <div className="h-5 bg-slate-200 rounded w-1/3" />
          <div className="h-4 bg-slate-200 rounded w-full" />
          <div className="h-4 bg-slate-200 rounded w-5/6" />
        </div>
      )}

      {!loading && response && <AssistantResponseCard response={response} />}
    </div>
  );
}
