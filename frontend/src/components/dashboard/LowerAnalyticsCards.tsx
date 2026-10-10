'use client';

import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';
import { DEMO_MONTHLY_BARS, DEMO_THREAT_CATEGORIES } from '@/lib/mockData';
import { Atom, MoreHorizontal, ChevronRight } from 'lucide-react';

interface LowerAnalyticsCardsProps {
  onOpenQuantumAnalysis: () => void;
  onFilterCategory?: (category: string) => void;
}

export function LowerAnalyticsCards({ onOpenQuantumAnalysis, onFilterCategory }: LowerAnalyticsCardsProps) {
  const [selectedDateIndex, setSelectedDateIndex] = React.useState(0);
  const dateOptions = ['6 Oct', '5 Oct', '4 Oct'];

  // Donut chart data for Card A (8% anomaly rate)
  const donutData = [
    { name: 'Anomalies', value: 8, color: '#00E6C3' },
    { name: 'Benign', value: 92, color: '#193543' },
  ];

  const handleExportDistribution = () => {
    const data = {
      compilerNodes: 'Dense Packet Off Stage',
      anomalyRate: '8%',
      accuracy: '99.2%',
      delta: '3.5%',
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compiler_distribution_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {/* Card A: Detection Distribution Donut Chart */}
      <div className="bg-[#0A1C26] rounded-2xl p-4 border border-[#193543] shadow-lg shadow-[#020A10]/40 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs">
          <span className="font-bold text-[#F4F8FC]">Compiler Networks</span>
          <button
            onClick={handleExportDistribution}
            aria-label="Export distribution data"
            title="Export distribution JSON"
            className="p-1 rounded-md hover:bg-[#07141D] transition-colors cursor-pointer text-[#A8BBC8] hover:text-[#00E6C3]"
          >
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center gap-3 my-2">
          {/* Donut chart */}
          <div className="w-20 h-20 relative shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={donutData}
                  innerRadius={24}
                  outerRadius={36}
                  startAngle={90}
                  endAngle={-270}
                  dataKey="value"
                  strokeWidth={0}
                >
                  {donutData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center font-black text-xs text-[#00E6C3]">
              8%
            </div>
          </div>

          {/* Breakdown legend */}
          <div className="text-xs space-y-1">
            <div className="text-[#A8BBC8] font-medium">Dense Packet Off Stage</div>
            <div className="font-bold text-[#00E6C3]">3.5% Delta</div>
            <div className="text-[11px] text-[#5A7382]">Kernel evaluated</div>
          </div>
        </div>

        <div className="text-xs text-[#A8BBC8] border-t border-[#193543] pt-2 flex justify-between font-medium">
          <span>Accuracy rate</span>
          <span className="font-bold text-[#F4F8FC]">99.2%</span>
        </div>
      </div>

      {/* Card B: Threat Categories Horizontal Progress Bars */}
      <div className="bg-[#0A1C26] rounded-2xl p-4 border border-[#193543] shadow-lg shadow-[#020A10]/40 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs mb-2">
          <span className="font-bold text-[#F4F8FC]">Total threats</span>
          <span className="text-xs font-bold text-[#FF626B]">23.27%</span>
        </div>

        {/* Progress bars with drilldown click */}
        <div className="space-y-2.5">
          {DEMO_THREAT_CATEGORIES.slice(0, 2).map((item) => (
            <div
              key={item.name}
              role="button"
              tabIndex={0}
              onClick={() => onFilterCategory?.(item.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onFilterCategory?.(item.name);
                }
              }}
              className="space-y-1 cursor-pointer hover:bg-[#07141D] p-1 rounded-lg transition-colors group"
              title={`Click to filter table by ${item.name}`}
            >
              <div className="flex justify-between text-xs text-[#A8BBC8]">
                <span className="truncate pr-2 font-medium group-hover:text-[#00E6C3] transition-colors">{item.name}</span>
                <span className="font-bold text-[#F4F8FC]">{item.percentage}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#07141D] border border-[#193543] overflow-hidden">
                <div
                  className={`h-full rounded-full ${
                    item.riskLevel === 'high'
                      ? 'bg-gradient-to-r from-[#FF626B]/60 to-[#FF626B]'
                      : 'bg-gradient-to-r from-[#00E6C3]/60 to-[#00E6C3]'
                  }`}
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="text-xs text-[#A8BBC8] border-t border-[#193543] pt-2 flex justify-between mt-2 font-medium">
          <span>Resolved</span>
          <span className="font-bold text-[#00E6C3]">80% (2% delta)</span>
        </div>
      </div>

      {/* Card C: Dual-Color Vertical Bar Chart */}
      <div className="bg-[#0A1C26] rounded-2xl p-4 border border-[#193543] shadow-lg shadow-[#020A10]/40 flex flex-col justify-between">
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-bold text-[#F4F8FC]">Facil Tage</span>
          <button
            onClick={() => setSelectedDateIndex((prev) => (prev + 1) % dateOptions.length)}
            aria-label="Cycle date range"
            className="text-[11px] font-semibold text-[#00E6C3] hover:underline cursor-pointer flex items-center gap-0.5"
            title="Click to cycle dates"
          >
            <span>{dateOptions[selectedDateIndex]}</span>
            <span>▾</span>
          </button>
        </div>

        <div className="h-20 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={DEMO_MONTHLY_BARS} margin={{ top: 2, right: 0, left: -25, bottom: 0 }}>
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#A8BBC8', fontSize: 10, fontWeight: 500 }}
              />
              <YAxis hide domain={[0, 100]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-[#07141D] p-2 rounded-xl border border-[#193543] shadow-xl text-xs">
                        <div className="font-medium text-[#00E6C3]">Normal: {payload[0]?.value}</div>
                        <div className="font-bold text-[#FF626B]">Anomaly: {payload[1]?.value}</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="normal" fill="#00E6C3" radius={[2, 2, 0, 0]} />
              <Bar dataKey="anomaly" fill="#FF626B" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="text-xs text-[#A8BBC8] border-t border-[#193543] pt-2 flex justify-between font-medium">
          <span>Telemetry Stream</span>
          <span className="font-bold text-[#00E6C3]">100% Online</span>
        </div>
      </div>

      {/* Card D: Quantum Analysis Action Card */}
      <div className="bg-[#0A1C26] rounded-2xl p-4 border border-[#193543] shadow-lg shadow-[#020A10]/40 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5">
            <Atom className="w-4 h-4 text-[#00E6C3]" />
            <span className="font-bold text-[#F4F8FC]">Quantum Analysis</span>
          </div>
          <span className="text-[11px] font-mono font-bold text-[#38D9FF]">613.78K</span>
        </div>

        <div className="my-1.5 space-y-1">
          <div className="text-xs text-[#F4F8FC] font-semibold">Qiskit ZZFeatureMap</div>
          <div className="text-xs text-[#A8BBC8]">
            State Fidelity: <span className="font-bold text-[#00E6C3]">0.984</span>
          </div>
        </div>

        {/* Large green/teal action button matching reference */}
        <button
          onClick={onOpenQuantumAnalysis}
          className="w-full py-2.5 rounded-xl bg-[#00E6C3] hover:bg-[#38D9FF] text-[#020A10] text-xs font-bold shadow-md shadow-[#00E6C3]/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98 focus-visible:ring-2 focus-visible:ring-[#00E6C3]"
        >
          <span>View Analysis</span>
          <ChevronRight className="w-3.5 h-3.5 stroke-[3]" />
        </button>
      </div>
    </div>
  );
}
