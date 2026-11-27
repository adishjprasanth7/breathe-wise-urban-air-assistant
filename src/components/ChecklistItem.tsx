import { CheckCircle2, Circle } from 'lucide-react';
import type { DailyTask } from '../types/planner';

interface ChecklistItemProps {
  task: DailyTask;
  onToggle: (id: string) => void;
  showPeriod?: boolean;
  showDescription?: boolean;
}

export function ChecklistItem({
  task,
  onToggle,
  showPeriod = false,
  showDescription = false,
}: ChecklistItemProps) {
  return (
    <button
      type="button"
      onClick={() => onToggle(task.id)}
      aria-pressed={task.completed}
      className="w-full text-left flex items-start gap-2.5 p-3 rounded-xl bg-white border border-slate-200 hover:border-forest-300 hover:bg-slate-50 transition-colors"
    >
      {task.completed ? (
        <CheckCircle2 className="w-4 h-4 text-forest-700 shrink-0 mt-0.5" aria-hidden="true" />
      ) : (
        <Circle className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
      )}
      <div>
        <span
          className={`text-sm font-medium ${
            task.completed ? 'line-through text-slate-500' : 'text-slate-900'
          }`}
        >
          {task.title}
        </span>
        {showPeriod && (
          <span className="block text-xs text-slate-500 capitalize mt-0.5">{task.period}</span>
        )}
        {showDescription && task.description && (
          <p className="text-xs text-slate-600 mt-0.5">{task.description}</p>
        )}
      </div>
    </button>
  );
}
