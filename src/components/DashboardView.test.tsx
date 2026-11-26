import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { DashboardView } from './DashboardView';
import { createDemoAirQualityData } from '../services/openMeteo';
import { generateDefaultDailyTasks } from '../utils/dailyPlan';

describe('DashboardView', () => {
  it('renders AQI card, pollutants, health guidance, and toggles checklist tasks', async () => {
    const user = userEvent.setup();
    const demoData = createDemoAirQualityData();
    const tasks = generateDefaultDailyTasks(demoData.category, false);
    const onToggleTask = vi.fn();
    const onNavigate = vi.fn();
    const onRetry = vi.fn();

    render(
      <DashboardView
        data={demoData}
        loading={false}
        error={null}
        tasks={tasks}
        onToggleTask={onToggleTask}
        onNavigate={onNavigate}
        onRetry={onRetry}
        todayCo2eKg={1.25}
        weeklyCo2eKg={4.5}
      />
    );

    expect(screen.getByText(/Current Air Quality/i)).toBeInTheDocument();
    expect(screen.getByText(/Demo \/ Sample Data Mode/i)).toBeInTheDocument();
    expect(screen.getByText('PM2.5')).toBeInTheDocument();
    expect(screen.getByText('PM10')).toBeInTheDocument();
    expect(screen.getByText('1.25 kg')).toBeInTheDocument();

    const firstTaskButton = screen.getByRole('button', {
      name: new RegExp(tasks[0].title, 'i'),
    });
    await user.click(firstTaskButton);
    expect(onToggleTask).toHaveBeenCalledWith(tasks[0].id);
  });

  it('renders error state with retry action when data is null', async () => {
    const user = userEvent.setup();
    const onRetry = vi.fn();

    render(
      <DashboardView
        data={null}
        loading={false}
        error="Network timeout"
        tasks={[]}
        onToggleTask={vi.fn()}
        onNavigate={vi.fn()}
        onRetry={onRetry}
        todayCo2eKg={0}
        weeklyCo2eKg={0}
      />
    );

    expect(screen.getByRole('alert')).toHaveTextContent('Network timeout');
    await user.click(screen.getByRole('button', { name: /Retry/i }));
    expect(onRetry).toHaveBeenCalledTimes(1);
  });
});
