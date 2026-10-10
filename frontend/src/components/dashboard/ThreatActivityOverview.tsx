'use client';

import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { Info } from 'lucide-react';
import { TimeRange } from '@/types';

interface ThreatActivityOverviewProps {
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
}

export function ThreatActivityOverview({
  timeRange = '24h',
  onTimeRangeChange,
}: ThreatActivityOverviewProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>(timeRange);

  const handleRange = (range: TimeRange) => {
    setActiveRange(range);
    onTimeRangeChange?.(range);
  };

  // Generate multi-severity series based on timeRange
  const chartData = React.useMemo(() => {
    if (activeRange === '15m') {
      return [
        { time: '12:00', low: 45, medium: 12, high: 3, critical: 1 },
        { time: '12:03', low: 52, medium: 18, high: 6, critical: 2 },
        { time: '12:06', low: 60, medium: 24, high: 9, critical: 4 },
        { time: '12:09', low: 48, medium: 15, high: 4, critical: 1 },
        { time: '12:12', low: 55, medium: 19, high: 5, critical: 2 },
        { time: '12:15', low: 62, medium: 21, high: 7, critical: 3 },
      ];
    }
    if (activeRange === '1h') {
      return [
        { time: '11:15', low: 180, medium: 60, high: 24, critical: 6 },
        { time: '11:30', low: 220, medium: 75, high: 32, critical: 9 },
        { time: '11:45', low: 260, medium: 90, high: 40, critical: 14 },
        { time: '12:00', low: 210, medium: 65, high: 28, critical: 8 },
        { time: '12:15', low: 245, medium: 82, high: 35, critical: 11 },
      ];
    }
    if (activeRange === '7d' || activeRange === 'all') {
      return [
        { time: 'Mon', low: 1200, medium: 420, high: 140, critical: 42 },
        { time: 'Tue', low: 1450, medium: 510, high: 195, critical: 64 },
        { time: 'Wed', low: 1320, medium: 460, high: 160, critical: 38 },
        { time: 'Thu', low: 1850, medium: 680, high: 280, critical: 95 },
        { time: 'Fri', low: 1600, medium: 590, high: 210, critical: 72 },
        { time: 'Sat', low: 950, medium: 280, high: 90, critical: 25 },
        { time: 'Sun', low: 1050, medium: 320, high: 115, critical: 30 },
      ];
    }
    // Default 24h
    return [
      { time: '00:00', low: 240, medium: 65, high: 18, critical: 4 },
      { time: '04:00', low: 180, medium: 45, high: 12, critical: 2 },
      { time: '08:00', low: 480, medium: 140, high: 45, critical: 12 },
      { time: '10:00', low: 620, medium: 210, high: 78, critical: 26 },
      { time: '12:00', low: 780, medium: 290, high: 112, critical: 41 },
      { time: '14:00', low: 710, medium: 240, high: 88, critical: 29 },
      { time: '16:00', low: 650, medium: 215, high: 72, critical: 21 },
      { time: '18:00', low: 580, medium: 180, high: 64, critical: 18 },
      { time: '20:00', low: 490, medium: 150, high: 48, critical: 14 },
      { time: '22:00', low: 360, medium: 95, high: 31, critical: 8 },
    ];
  }, [activeRange]);

  const totalEventsInPeriod = React.useMemo(() => {
    return chartData.reduce(
      (sum, p) => sum + p.low + p.medium + p.high + p.critical,
      0
    );
  }, [chartData]);

  const severityTotals = React.useMemo(() => {
    return chartData.reduce(
      (acc, p) => ({
        low: acc.low + p.low,
        medium: acc.medium + p.medium,
        high: acc.high + p.high,
        critical: acc.critical + p.critical,
      }),
      { low: 0, medium: 0, high: 0, critical: 0 }
    );
  }, [chartData]);

  return (
    <div className="bg-[#0B1D29] rounded-2xl p-5 border border-[#1A2E3D] shadow-lg shadow-[#030B12]/40 relative select-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#F4F8FC] tracking-wide">
              Threat Activity Overview
            </h2>
            <span
              title="Multi-severity timeline telemetry assessed across classical heuristics and quantum verification"
              className="text-[#5A7382] hover:text-[#00E5FF] cursor-pointer"
            >
              <Info className="w-3.5 h-3.5" />
            </span>
          </div>
          <p className="text-[11px] text-[#A8BBC8] mt-0.5">
            Total observed: <strong className="text-[#F4F8FC]">{totalEventsInPeriod.toLocaleString()}</strong> events in {activeRange}
          </p>
        </div>

        {/* Severity Legend & Range Selector */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 text-[10px] font-semibold">
            <span className="flex items-center gap-1 text-[#10B981]">
              <span className="w-2 h-2 rounded-full bg-[#10B981]" /> Low
            </span>
            <span className="flex items-center gap-1 text-[#F59E0B]">
              <span className="w-2 h-2 rounded-full bg-[#F59E0B]" /> Medium
            </span>
            <span className="flex items-center gap-1 text-[#F97316]">
              <span className="w-2 h-2 rounded-full bg-[#F97316]" /> High
            </span>
            <span className="flex items-center gap-1 text-[#EF4444]">
              <span className="w-2 h-2 rounded-full bg-[#EF4444]" /> Critical
            </span>
          </div>

          <div className="flex items-center bg-[#081722] rounded-full p-0.5 border border-[#1A2E3D] text-xs">
            {(['15m', '1h', '24h', '7d'] as TimeRange[]).map((r) => (
              <button
                key={r}
                onClick={() => handleRange(r)}
                className={`px-2.5 py-0.5 rounded-full font-semibold transition-all cursor-pointer ${
                  activeRange === r
                    ? 'bg-[#00E5FF] text-[#030B12] shadow-xs'
                    : 'text-[#A8BBC8] hover:text-[#F4F8FC]'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Interactive Chart */}
      <div className="w-full h-56 mt-1">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorLow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F97316" stopOpacity={0.45} />
                <stop offset="95%" stopColor="#F97316" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorCrit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.55} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#1A2E3D"
              vertical={false}
            />

            <XAxis
              dataKey="time"
              stroke="#5A7382"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1A2E3D' }}
            />
            <YAxis
              stroke="#5A7382"
              fontSize={10}
              tickLine={false}
              axisLine={{ stroke: '#1A2E3D' }}
            />

            <Tooltip
              contentStyle={{
                backgroundColor: '#081722',
                borderColor: '#1A2E3D',
                borderRadius: '12px',
                fontSize: '11px',
                color: '#F4F8FC',
                boxShadow: '0 8px 24px rgba(3, 11, 18, 0.8)',
              }}
              formatter={(value, name) => {
                const label =
                  name === 'low'
                    ? 'Low'
                    : name === 'medium'
                    ? 'Medium'
                    : name === 'high'
                    ? 'High'
                    : 'Critical';
                return [Number(value), label];
              }}
            />

            <Area
              type="monotone"
              dataKey="low"
              stroke="#10B981"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorLow)"
            />
            <Area
              type="monotone"
              dataKey="medium"
              stroke="#F59E0B"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorMed)"
            />
            <Area
              type="monotone"
              dataKey="high"
              stroke="#F97316"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#colorHigh)"
            />
            <Area
              type="monotone"
              dataKey="critical"
              stroke="#EF4444"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorCrit)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Severity Breakdown Bar */}
      <div className="mt-4 pt-3 border-t border-[#1A2E3D] grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-[#081722] p-2 rounded-xl border border-[#1A2E3D]">
          <span className="text-[10px] text-[#A8BBC8] block">Low-Risk</span>
          <span className="font-bold text-[#10B981]">{severityTotals.low.toLocaleString()}</span>
        </div>
        <div className="bg-[#081722] p-2 rounded-xl border border-[#1A2E3D]">
          <span className="text-[10px] text-[#A8BBC8] block">Medium-Risk</span>
          <span className="font-bold text-[#F59E0B]">{severityTotals.medium.toLocaleString()}</span>
        </div>
        <div className="bg-[#081722] p-2 rounded-xl border border-[#1A2E3D]">
          <span className="text-[10px] text-[#A8BBC8] block">High-Risk</span>
          <span className="font-bold text-[#F97316]">{severityTotals.high.toLocaleString()}</span>
        </div>
        <div className="bg-[#081722] p-2 rounded-xl border border-[#1A2E3D]">
          <span className="text-[10px] text-[#A8BBC8] block">Critical</span>
          <span className="font-bold text-[#EF4444]">{severityTotals.critical.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
