import { useState, useMemo } from 'react';
import type { FamilyProfile } from './types/assistant';
import type { DailyTask, DayPeriod } from './types/planner';
import type { EmissionFactors, ImpactLogEntry } from './types/impact';
import { useAirQuality } from './hooks/useAirQuality';
import { useLocalStorage } from './hooks/useLocalStorage';
import { DEFAULT_EMISSION_FACTORS, getTodayIsoDate, summarizeImpact } from './utils/impact';
import { generateDefaultDailyTasks } from './utils/dailyPlan';
import { SidebarNav } from './components/SidebarNav';
import { LocationSelector } from './components/LocationSelector';
import { DashboardView, type NavTab } from './components/DashboardView';
import { AirQualityView } from './components/AirQualityView';
import { AssistantView } from './components/AssistantView';
import { DailyPlanView } from './components/DailyPlanView';
import { IndoorProtectionView } from './components/IndoorProtectionView';
import { ImpactTrackerView } from './components/ImpactTrackerView';

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

      <SidebarNav
        activeTab={activeTab}
        mobileMenuOpen={mobileMenuOpen}
        onToggleMobileMenu={() => setMobileMenuOpen((open) => !open)}
        onNavigate={handleNavigate}
      />

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
