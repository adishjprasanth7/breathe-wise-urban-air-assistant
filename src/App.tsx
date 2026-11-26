import { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  Wind,
  Sparkles,
  CheckSquare,
  Home,
  Leaf,
  Menu,
  X,
} from 'lucide-react';
import type { FamilyProfile } from './types/assistant';
import type { DailyTask, DayPeriod } from './types/planner';
import type { EmissionFactors, ImpactLogEntry } from './types/impact';
import { useAirQuality } from './hooks/useAirQuality';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_EMISSION_FACTORS, getTodayIsoDate, summarizeImpact } from './utils/impact';
import { generateDefaultDailyTasks } from './utils/dailyPlan';
import { LocationSelector } from './components/LocationSelector';
import { DashboardView, type NavTab } from './components/DashboardView';
import { AirQualityView } from './components/AirQualityView';
import { AssistantView } from './components/AssistantView';
import { DailyPlanView } from './components/DailyPlanView';
import { IndoorProtectionView } from './components/IndoorProtectionView';
import { ImpactTrackerView } from './components/ImpactTrackerView';

const NAV_ITEMS: Array<{ id: NavTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'air-quality', label: 'Air Quality', icon: Wind },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
  { id: 'daily-plan', label: 'My Daily Plan', icon: CheckSquare },
  { id: 'indoor', label: 'Indoor Protection', icon: Home },
  { id: 'impact', label: 'Impact Tracker', icon: Leaf },
];

const DEFAULT_PROFILE: FamilyProfile = {
  familySize: 3,
  ageCategories: ['adults', 'children'],
  outdoorActivities: 'School commute and evening walk',
  commuteType: 'mixed',
  hasHepaPurifier: false,
  hasOutdoorJob: false,
  preferredLanguage: 'English',
};

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    data,
    location,
    loading,
    error,
    geoError,
    geoLoading,
    setLocation,
    requestGeolocation,
    refresh,
  } = useAirQuality();

  const [profile, setProfile] = useLocalStorage<FamilyProfile>(
    'breathewise_profile_v1',
    DEFAULT_PROFILE
  );

  const todayKey = `breathewise_tasks_${getTodayIsoDate()}`;
  const [storedTasks, setStoredTasks] = useLocalStorage<DailyTask[] | null>(todayKey, null);

  const tasks = useMemo(() => {
    if (storedTasks && storedTasks.length > 0) {
      return storedTasks;
    }
    return generateDefaultDailyTasks(
      data?.category ?? 'Unavailable',
      profile.hasHepaPurifier
    );
  }, [storedTasks, data?.category, profile.hasHepaPurifier]);

  const [impactEntries, setImpactEntries] = useLocalStorage<ImpactLogEntry[]>(
    'breathewise_impact_entries_v1',
    []
  );
  const [emissionFactors, setEmissionFactors] = useLocalStorage<EmissionFactors>(
    'breathewise_emission_factors_v1',
    DEFAULT_EMISSION_FACTORS
  );

  const impactSummary = useMemo(() => summarizeImpact(impactEntries), [impactEntries]);

  const handleToggleTask = (id: string) => {
    setStoredTasks(
      tasks.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleAddTask = (title: string, period: DayPeriod) => {
    const newTask: DailyTask = {
      id: `custom-${Date.now()}`,
      period,
      title,
      description: 'Custom household action',
      category: 'protection',
      completed: false,
      isCustom: true,
    };
    setStoredTasks([...tasks, newTask]);
  };

  const handleResetTasks = () => {
    setStoredTasks(
      generateDefaultDailyTasks(data?.category ?? 'Unavailable', profile.hasHepaPurifier)
    );
  };

  const handleNavigate = (tab: NavTab) => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:flex-row">
      <a href="#main-content" className="sr-skip-link">
        Skip to main content
      </a>

      {/* Desktop Sidebar */}
      <aside
        aria-label="Primary navigation"
        className="hidden lg:flex lg:flex-col lg:w-64 lg:shrink-0 bg-white border-r border-slate-200 p-5 justify-between"
      >
        <div>
          <div className="flex items-center gap-2.5 px-2 pb-6 border-b border-slate-100">
            <div className="w-9 h-9 rounded-xl bg-forest-800 text-white flex items-center justify-center font-bold text-lg">
              B
            </div>
            <div>
              <span className="font-bold text-slate-900 block leading-tight">BreatheWise</span>
              <span className="text-xs text-slate-500">Urban Air Assistant</span>
            </div>
          </div>

          <nav className="mt-5 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavigate(item.id)}
                  aria-current={isActive ? 'page' : undefined}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-forest-800 text-white shadow-sm'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="bg-forest-50 border border-forest-200 rounded-xl p-3.5 text-xs text-forest-950">
          <p className="font-semibold">Privacy First</p>
          <p className="mt-1 text-forest-900 leading-relaxed">
            Your checklist, household profile, and impact logs stay locally on your device.
          </p>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center font-bold">
            B
          </div>
          <span className="font-bold text-slate-900">BreatheWise</span>
        </div>

        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          aria-expanded={mobileMenuOpen}
          aria-controls="mobile-nav-drawer"
          aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
          className="p-2 rounded-lg text-slate-700 hover:bg-slate-100"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </header>

      {mobileMenuOpen && (
        <nav
          id="mobile-nav-drawer"
          aria-label="Mobile navigation"
          className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 space-y-1"
        >
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNavigate(item.id)}
                aria-current={isActive ? 'page' : undefined}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                  isActive ? 'bg-forest-800 text-white' : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      )}

      {/* Main Content */}
      <main id="main-content" className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
        <LocationSelector
          location={location}
          loading={loading}
          geoLoading={geoLoading}
          geoError={geoError}
          onSelectLocation={setLocation}
          onRequestGeolocation={requestGeolocation}
          onRefresh={refresh}
        />

        {activeTab === 'dashboard' && (
          <DashboardView
            data={data}
            loading={loading}
            error={error}
            tasks={tasks}
            onToggleTask={handleToggleTask}
            onNavigate={handleNavigate}
            onRetry={refresh}
            todayCo2eKg={impactSummary.todayCo2eKg}
            weeklyCo2eKg={impactSummary.weeklyCo2eKg}
          />
        )}

        {activeTab === 'air-quality' && <AirQualityView data={data} loading={loading} />}

        {activeTab === 'assistant' && (
          <AssistantView airQuality={data} profile={profile} onUpdateProfile={setProfile} />
        )}

        {activeTab === 'daily-plan' && (
          <DailyPlanView
            tasks={tasks}
            commuteType={profile.commuteType}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onResetTasks={handleResetTasks}
          />
        )}

        {activeTab === 'indoor' && <IndoorProtectionView airQuality={data} />}

        {activeTab === 'impact' && (
          <ImpactTrackerView
            entries={impactEntries}
            factors={emissionFactors}
            onAddEntry={(entry) => setImpactEntries([entry, ...impactEntries])}
            onDeleteEntry={(id) =>
              setImpactEntries(impactEntries.filter((e) => e.id !== id))
            }
            onUpdateFactors={setEmissionFactors}
          />
        )}
      </main>
    </div>
  );
}

export default App;
