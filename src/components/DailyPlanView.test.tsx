import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DailyPlanView } from './DailyPlanView';
import { generateDefaultDailyTasks } from '../utils/dailyPlan';

describe('DailyPlanView', () => {
  it('renders progressbar, toggles tasks, adds custom task, and resets', async () => {
    const user = userEvent.setup();
    const tasks = generateDefaultDailyTasks('Unhealthy', false);
    tasks[0].completed = true;

    const onToggleTask = vi.fn();
    const onAddTask = vi.fn();
    const onResetTasks = vi.fn();

    render(
      <DailyPlanView
        tasks={tasks}
        commuteType="car"
        onToggleTask={onToggleTask}
        onAddTask={onAddTask}
        onResetTasks={onResetTasks}
      />
    );

    const progress = screen.getByRole('progressbar', { name: /Daily action plan completion/i });
    expect(progress).toHaveAttribute('aria-valuenow', '17');

    await user.click(screen.getByRole('button', { name: new RegExp(tasks[1].title, 'i') }));
    expect(onToggleTask).toHaveBeenCalledWith(tasks[1].id);

    await user.type(screen.getByLabelText(/Add custom daily action/i), 'Check filter indicator');
    await user.click(screen.getByRole('button', { name: /Add Task/i }));
    expect(onAddTask).toHaveBeenCalledWith('Check filter indicator', 'morning');

    await user.click(screen.getByRole('button', { name: /Reset Today/i }));
    expect(onResetTasks).toHaveBeenCalledTimes(1);
  });
});
