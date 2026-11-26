import { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Table2, BarChart3 } from 'lucide-react';
import type { HourlyForecastPoint } from '../types/aqi';

interface ForecastChartProps {
  hourlyForecast: HourlyForecastPoint[];
  accentColor: string;
}

export function ForecastChart({ hourlyForecast, accentColor }: ForecastChartProps) {
  const [showTable, setShowTable] = useState(false);

  const validPoints = hourlyForecast.filter((p) => p.aqi !== null || p.pm25 !== null);

  if (validPoints.length === 0) {
    return (
      <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-600">
        Hourly forecast data is currently unavailable for this location.
      </div>
    );
  }

  const peakAqi = validPoints.reduce(
    (max, pt) => (pt.aqi !== null && pt.aqi > max ? pt.aqi : max),
    0
  );
  const minAqi = validPoints.reduce(
    (min, pt) => (pt.aqi !== null && pt.aqi < min ? pt.aqi : min),
    peakAqi
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <p className="text-xs text-slate-600">
          Today’s range: <span className="font-semibold text-slate-900">{minAqi}</span> to{' '}
          <span className="font-semibold text-slate-900">{peakAqi}</span> US EPA AQI
        </p>
        <button
          type="button"
          onClick={() => setShowTable((prev) => !prev)}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-forest-800 hover:text-forest-950 bg-forest-50 px-2.5 py-1.5 rounded-lg border border-forest-200"
        >
          {showTable ? (
            <>
              <BarChart3 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Show Chart</span>
            </>
          ) : (
            <>
              <Table2 className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Accessible Data Table</span>
            </>
          )}
        </button>
      </div>

      {!showTable ? (
        <div
          className="h-64 w-full"
          role="img"
          aria-label={`Today's hourly US EPA AQI forecast ranging from ${minAqi} to ${peakAqi}.`}
        >
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={validPoints} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis
                dataKey="label"
                tick={{ fontSize: 11, fill: '#475569' }}
                interval={3}
              />
              <YAxis tick={{ fontSize: 11, fill: '#475569' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  borderColor: '#cbd5e1',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
                formatter={(value: unknown, name: string) => {
                  if (name === 'aqi') return [`${value} US AQI`, 'US EPA AQI'];
                  if (name === 'pm25') return [`${value} µg/m³`, 'PM2.5'];
                  return [String(value), name];
                }}
              />
              <Area
                type="monotone"
                dataKey="aqi"
                stroke={accentColor}
                strokeWidth={2.5}
                fill={accentColor}
                fillOpacity={0.14}
                name="aqi"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      ) : (
        <div className="max-h-64 overflow-auto border border-slate-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-700 sticky top-0">
              <tr>
                <th className="px-3 py-2 font-semibold">Time</th>
                <th className="px-3 py-2 font-semibold">US EPA AQI</th>
                <th className="px-3 py-2 font-semibold">PM2.5 (µg/m³)</th>
                <th className="px-3 py-2 font-semibold">PM10 (µg/m³)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {validPoints.map((pt) => (
                <tr key={pt.time} className="hover:bg-slate-50">
                  <td className="px-3 py-1.5 font-medium text-slate-900">{pt.label}</td>
                  <td className="px-3 py-1.5 text-slate-700">{pt.aqi ?? 'N/A'}</td>
                  <td className="px-3 py-1.5 text-slate-700">{pt.pm25 ?? 'N/A'}</td>
                  <td className="px-3 py-1.5 text-slate-700">{pt.pm10 ?? 'N/A'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
