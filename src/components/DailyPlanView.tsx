import { useState, type FormEvent } from 'react';
import {
  Plus,
  RotateCcw,
  Sun,
  Sunset,
  Moon,
  Sunrise,
  Leaf,
} from 'lucide-react';
import type { CommuteType } from '../types/assistant';
import type { DailyTask, DayPeriod } from '../types/planner';
import { generateLowEmissionRoutines } from '../utils/dailyPlan';
import { ChecklistItem } from './ChecklistItem';

interface DailyPlanViewProps {
  tasks: DailyTask[];
  commuteType: CommuteType;
  onToggleTask: (id: string) => void;
  onAddTask: (title: string, period: DayPeriod) => void;
  onResetTasks: () => void;
}

const PERIOD_META: Array<{ id: DayPeriod; label: string; icon: typeof Sunrise }> = [
  { id: 'morning', label: 'Morning', icon: Sunrise },
  { id: 'afternoon', label: 'Afternoon', icon: Sun },
  { id: 'evening', label: 'Evening', icon: Sunset },
  { id: 'night', label: 'Night', icon: Moon },
];

export function DailyPlanView({
  tasks,
  commuteType,
  onToggleTask,
  onAddTask,
  onResetTasks,
}: DailyPlanViewProps) {
  const [newTitle, setNewTitle] = useState('');
  const [newPeriod, setNewPeriod] = useState<DayPeriod>('morning');

  const completed = tasks.filter((t) => t.completed).length;
  const progressPct = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;
  const routines = generateLowEmissionRoutines(commuteType);

  const handleAdd = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = newTitle.trim();
    if (trimmed.length < 3) return;
    onAddTask(trimmed, newPeriod);
    setNewTitle('');
  };

  return (
    <div className="space-y-6">
      {/* Daily Schedule */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900">My Daily Action Plan</h1>
            <p className="text-sm text-slate-600 mt-1">
              {completed} of {tasks.length} tasks completed ({progressPct}%) — saved locally in your browser.
            </p>
          </div>
          <button
            type="button"
            onClick={onResetTasks}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Reset Today</span>
          </button>
        </div>

        <div
          className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden mt-4"
          role="progressbar"
          aria-valuenow={progressPct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Daily action plan completion"
        >
          <div
            className="h-full bg-forest-700 transition-all"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <form onSubmit={handleAdd} className="mt-5 flex flex-col sm:flex-row gap-2.5">
          <label htmlFor="custom-task-title" className="sr-only">
            Add custom daily action
          </label>
          <input
            id="custom-task-title"
            type="text"
            maxLength={120}
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Add a custom action for today..."
            className="flex-1 px-3.5 py-2 text-sm border border-slate-300 rounded-xl bg-slate-50 focus:bg-white"
          />
          <label htmlFor="custom-task-period" className="sr-only">
            Time of day
          </label>
          <select
            id="custom-task-period"
            value={newPeriod}
            onChange={(e) => setNewPeriod(e.target.value as DayPeriod)}
            className="px-3 py-2 text-sm border border-slate-300 rounded-xl bg-white"
          >
            <option value="morning">Morning</option>
            <option value="afternoon">Afternoon</option>
            <option value="evening">Evening</option>
            <option value="night">Night</option>
          </select>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-forest-800 text-white text-sm font-medium hover:bg-forest-900"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        </form>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          {PERIOD_META.map(({ id, label, icon: Icon }) => {
            const periodTasks = tasks.filter((t) => t.period === id);
            return (
              <div key={id} className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-3">
                  <Icon className="w-4 h-4 text-forest-700" aria-hidden="true" />
                  <span>{label}</span>
                </h2>
                {periodTasks.length === 0 ? (
                  <p className="text-xs text-slate-500">No tasks scheduled for {label.toLowerCase()}.</p>
                ) : (
                  <ul className="space-y-2">
                    {periodTasks.map((task) => (
                      <li key={task.id}>
                        <ChecklistItem task={task} onToggle={onToggleTask} showDescription />
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Low-Emission Routine Generator */}
      <section className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2">
          <Leaf className="w-5 h-5 text-forest-700" aria-hidden="true" />
          <h2 className="text-lg font-bold text-slate-900">Low-Emission Routine Alternatives</h2>
        </div>
        <p className="text-sm text-slate-600 mt-1">
          Practical, affordable everyday swaps—choose what fits your budget, neighborhood, and schedule.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {routines.map((routine) => (
            <article
              key={routine.id}
              className="border border-slate-200 rounded-xl p-4 flex flex-col justify-between bg-slate-50/40"
            >
              <div>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold uppercase tracking-wide text-forest-800 bg-forest-50 px-2 py-0.5 rounded">
                    {routine.category}
                  </span>
                  <span className="text-[11px] font-medium text-slate-600">
                    {routine.feasibility}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-slate-900 mt-2">{routine.title}</h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  {routine.description}
                </p>
              </div>
              <p className="text-xs text-forest-900 bg-forest-50 border border-forest-100 rounded-lg p-2 mt-3">
                <strong>Tip:</strong> {routine.practicalTip}
              </p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
