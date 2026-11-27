import { useEffect } from 'react';
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
import type { NavTab } from './DashboardView';

interface SidebarNavProps {
  activeTab: NavTab;
  mobileMenuOpen: boolean;
  onToggleMobileMenu: () => void;
  onNavigate: (tab: NavTab) => void;
}

const NAV_ITEMS: Array<{ id: NavTab; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'air-quality', label: 'Air Quality', icon: Wind },
  { id: 'assistant', label: 'AI Assistant', icon: Sparkles },
  { id: 'daily-plan', label: 'My Daily Plan', icon: CheckSquare },
  { id: 'indoor', label: 'Indoor Protection', icon: Home },
  { id: 'impact', label: 'Impact Tracker', icon: Leaf },
];

export function SidebarNav({
  activeTab,
  mobileMenuOpen,
  onToggleMobileMenu,
  onNavigate,
}: SidebarNavProps) {
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onToggleMobileMenu();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileMenuOpen, onToggleMobileMenu]);

  return (
    <>
      <aside
        aria-label="Sidebar"
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

          <nav aria-label="Primary navigation" className="mt-5 space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onNavigate(item.id)}
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

      <header className="lg:hidden bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-forest-800 text-white flex items-center justify-center font-bold">
            B
          </div>
          <span className="font-bold text-slate-900">BreatheWise</span>
        </div>

        <button
          type="button"
          onClick={onToggleMobileMenu}
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
                onClick={() => onNavigate(item.id)}
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
    </>
  );
}
