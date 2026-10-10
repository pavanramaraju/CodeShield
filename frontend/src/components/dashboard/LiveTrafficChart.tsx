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
import { TimeRange, TrafficPoint } from '@/types';

interface LiveTrafficChartProps {
  data: TrafficPoint[];
  onRangeChange?: (range: TimeRange) => void;
}

interface CustomDotProps {
  cx?: number;
  cy?: number;
  payload?: TrafficPoint;
}

export function LiveTrafficChart({ data, onRangeChange }: LiveTrafficChartProps) {
  const [activeRange, setActiveRange] = useState<TimeRange>('live');

  const handleRange = (range: TimeRange) => {
    setActiveRange(range);
    onRangeChange?.(range);
  };

  // Filter or scale dataset based on selected range
  const displayData = React.useMemo(() => {
    if (activeRange === 'live') {
      return data;
    }
    if (activeRange === '24h') {
      return data.map((d) => ({
        ...d,
        traffic: Math.round(d.traffic * 1.25),
      }));
    }
    // 7 days view
    return [
      { time: 'Mon', traffic: 1400, baseline: 1200 },
      { time: 'Tue', traffic: 2100, baseline: 1300, anomalyFlag: true, anomalyLabel: 'Surge', anomalyValue: '2,100' },
      { time: 'Wed', traffic: 1650, baseline: 1400 },
      { time: 'Thu', traffic: 2750, baseline: 1500, anomalyFlag: true, anomalyLabel: 'Anomaly peak', anomalyValue: '5,670' },
      { time: 'Fri', traffic: 1800, baseline: 1450 },
      { time: 'Sat', traffic: 920, baseline: 900 },
      { time: 'Sun', traffic: 1100, baseline: 950 },
    ];
  }, [data, activeRange]);

  return (
    <div className="bg-[#0A1C26] rounded-2xl p-5 border border-[#193543] shadow-lg shadow-[#020A10]/40 relative select-none">
      {/* Header with Title and Range Filters */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h2 className="text-sm font-bold text-[#F4F8FC] tracking-wide">
            Live Traffic Anomalies
          </h2>
          <span title="Real-time multi-node ingress flow telemetry">
            <Info className="w-3.5 h-3.5 text-[#5A7382] cursor-pointer hover:text-[#00E6C3]" />
          </span>
        </div>

        {/* Range Pill Tabs */}
        <div className="flex items-center bg-[#07141D] rounded-full p-0.5 border border-[#193543] text-xs">
          {(['live', '24h', '7d'] as TimeRange[]).map((range) => (
            <button
              key={range}
              onClick={() => handleRange(range)}
              className={`px-3 py-1 rounded-full font-bold transition-all cursor-pointer ${
                activeRange === range
                  ? 'bg-[#00E6C3] text-[#020A10] shadow-xs'
                  : 'text-[#A8BBC8] hover:text-[#F4F8FC]'
              }`}
            >
              {range === 'live' ? 'Live' : range === '24h' ? '24h' : '7 Days'}
            </button>
          ))}
        </div>
      </div>

      {/* Floating Anomaly Callout Badges */}
      <div className="relative">
        {activeRange === 'live' && (
          <>
            <div className="absolute top-1 left-[28%] z-10 px-2.5 py-1 rounded-lg bg-[#07141D]/90 border border-[#193543] shadow-md text-[11px] font-medium text-[#F4F8FC] flex flex-col pointer-events-none">
              <span className="text-[10px] text-[#A8BBC8] font-semibold">Direct networks</span>
              <span className="font-bold text-[#FF626B]">1,274</span>
            </div>

            <div className="absolute top-4 left-[58%] z-10 px-2.5 py-1 rounded-lg bg-[#07141D]/90 border border-[#193543] shadow-md text-[11px] font-medium text-[#F4F8FC] flex flex-col pointer-events-none">
              <span className="text-[10px] text-[#A8BBC8] font-semibold">Anomaly detected</span>
              <span className="font-bold text-[#FF626B]">5,670</span>
            </div>
          </>
        )}

        {/* Area Chart Container */}
        <div className="h-56 w-full pt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cyberAreaGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00E6C3" stopOpacity={0.35} />
                  <stop offset="60%" stopColor="#38D9FF" stopOpacity={0.12} />
                  <stop offset="95%" stopColor="#020A10" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#193543" />
              <XAxis
                dataKey="time"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#A8BBC8', fontSize: 11, fontWeight: 500 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#A8BBC8', fontSize: 11, fontWeight: 500 }}
                domain={[0, 3200]}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload as TrafficPoint;
                    return (
                      <div className="bg-[#07141D] p-2.5 rounded-xl border border-[#193543] shadow-xl text-xs">
                        <div className="font-bold text-[#F4F8FC]">{item.time}</div>
                        <div className="text-[#00E6C3] font-semibold">
                          Traffic: {item.traffic.toLocaleString()} flows/sec
                        </div>
                        {item.anomalyFlag && (
                          <div className="text-[#FF626B] font-bold mt-1">
                            ⚠ {item.anomalyLabel}: {item.anomalyValue}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="natural"
                dataKey="traffic"
                stroke="#00E6C3"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#cyberAreaGrad)"
                dot={(dotProps: CustomDotProps) => {
                  const { cx, cy, payload } = dotProps;
                  if (cx === undefined || cy === undefined || !payload) return <></>;
                  if (payload.anomalyFlag) {
                    return (
                      <g key={payload.time}>
                        <circle cx={cx} cy={cy} r={6} fill="#FF626B" opacity={0.3} />
                        <circle cx={cx} cy={cy} r={3.5} fill="#FF626B" stroke="#07141D" strokeWidth={1.5} />
                      </g>
                    );
                  }
                  return <circle key={payload.time} cx={cx} cy={cy} r={2.5} fill="#00E6C3" />;
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
