export type DayPeriod = 'morning' | 'afternoon' | 'evening' | 'night';

export interface DailyTask {
  id: string;
  period: DayPeriod;
  title: string;
  description: string;
  category: 'protection' | 'low-emission' | 'monitoring';
  completed: boolean;
  isCustom?: boolean;
}

export interface RoutineAlternative {
  id: string;
  title: string;
  category: 'transport' | 'energy' | 'waste' | 'errands';
  description: string;
  practicalTip: string;
  feasibility: 'Easy' | 'Moderate';
}
