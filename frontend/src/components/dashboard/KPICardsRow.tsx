'use client';

import React from 'react';
import {
  ShieldAlert,
  Activity,
  Atom,
  ShieldCheck,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { KPIMetrics } from '@/types';

interface KPICardsRowProps {
  metrics: KPIMetrics;
  isBackendConnected?: boolean;
  onSelectMetric?: (metric: 'threats' | 'high-risk' | 'quantum' | 'protected') => void;
}

export function KPICardsRow({
  metrics,
  isBackendConnected = false,
  onSelectMetric,
}: KPICardsRowProps) {
  // Mini SVG sparkline for Card 1
  const sparklinePoints = '0,18 8,14 16,16 24,10 32,13 40,8 48,11 56,5 64,8 72,3 80,6';

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
      {/* ========================================================= */}
      {/* CARD 1: Threat Events                                     */}
      {/* ========================================================= */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectMetric?.('threats')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric?.('threats');
          }
        }}
        aria-label="Threat Events metric. Click to filter security events."
        className="bg-[#0B1D29] rounded-2xl p-4 border border-[#1A2E3D] shadow-lg shadow-[#030B12]/40 hover:border-[#00E5FF]/60 hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                <ShieldAlert className="w-4 h-4 text-[#00E5FF]" />
              </div>
              <span className="font-bold text-[#A8BBC8] text-xs">Threat Events</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#00E5FF] bg-[#00E5FF]/10 px-2 py-0.5 rounded-full border border-[#00E5FF]/20">
              <ArrowUpRight className="w-3 h-3" />
              <span>{metrics.threatsGrowth || '+1.30%'}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-black tracking-tight text-[#F4F8FC]">
              {metrics.threatsDetected.toLocaleString()}
            </span>

            {/* Small Cyan Sparkline */}
            <div className="w-20 h-7 flex items-center justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 80 20">
                <polyline
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparklinePoints}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1A2E3D] text-[11px] text-[#A8BBC8] flex items-center justify-between">
          <span className="truncate">
            Comparison vs prev period: <strong className="text-[#F4F8FC]">+12.4%</strong>
          </span>
          <span className="text-[10px] text-[#00E5FF] font-semibold group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
            Filter →
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 2: High-Risk Sessions                                */}
      {/* ========================================================= */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectMetric?.('high-risk')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric?.('high-risk');
          }
        }}
        aria-label="High-Risk Sessions metric. Click to view risk details."
        className="bg-[#0B1D29] rounded-2xl p-4 border border-[#1A2E3D] shadow-lg shadow-[#030B12]/40 hover:border-[#EF4444]/60 hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#EF4444] group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#EF4444]/15 border border-[#EF4444]/30 flex items-center justify-center text-[#EF4444]">
                <Activity className="w-4 h-4 text-[#EF4444]" />
              </div>
              <span className="font-bold text-[#A8BBC8] text-xs">High-Risk Sessions</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#EF4444] bg-[#EF4444]/10 px-2 py-0.5 rounded-full border border-[#EF4444]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] animate-pulse" />
              <span>Critical</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black tracking-tight text-[#EF4444]">
              {metrics.highRiskCount ?? 18}
            </span>
            <span className="text-xs font-semibold text-[#A8BBC8]">
              Flagged active
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1A2E3D] text-[11px] text-[#A8BBC8] flex items-center justify-between">
          <span className="truncate">
            Zero-trust score &gt; 0.75: <strong className="text-[#EF4444]">Immediate Action</strong>
          </span>
          <span className="text-[10px] text-[#EF4444] font-semibold group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
            Inspect →
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 3: Quantum Analysis                                  */}
      {/* ========================================================= */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectMetric?.('quantum')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric?.('quantum');
          }
        }}
        aria-label="Quantum Analysis metric. Click to view Qiskit kernel pipeline."
        className="bg-[#0B1D29] rounded-2xl p-4 border border-[#1A2E3D] shadow-lg shadow-[#030B12]/40 hover:border-[#73CFFF]/60 hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73CFFF] group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#73CFFF]/15 border border-[#73CFFF]/30 flex items-center justify-center text-[#73CFFF]">
                <Atom className="w-4 h-4 text-[#73CFFF]" />
              </div>
              <span className="font-bold text-[#A8BBC8] text-xs">Quantum Analysis</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#73CFFF] bg-[#73CFFF]/10 px-2 py-0.5 rounded-full border border-[#73CFFF]/20">
              <Sparkles className="w-3 h-3" />
              <span>Qiskit 2.5</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black tracking-tight text-[#73CFFF]">
              {metrics.quantumProcessedCount ?? 84}
            </span>
            <span className="text-xs font-semibold text-[#A8BBC8]">
              Evaluated
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1A2E3D] text-[11px] text-[#A8BBC8] flex items-center justify-between">
          <span className="truncate">
            State: <strong className="text-[#F4F8FC]">{isBackendConnected ? 'AerSimulator Active' : 'Simulator Mode'}</strong>
          </span>
          <span className="text-[10px] text-[#73CFFF] font-semibold group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
            Kernel →
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 4: Protected Sessions                                */}
      {/* ========================================================= */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectMetric?.('protected')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric?.('protected');
          }
        }}
        aria-label="Protected Sessions metric. Click to view defense policies."
        className="bg-[#0B1D29] rounded-2xl p-4 border border-[#1A2E3D] shadow-lg shadow-[#030B12]/40 hover:border-[#10B981]/60 hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#10B981] group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#10B981]/15 border border-[#10B981]/30 flex items-center justify-center text-[#10B981]">
                <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              </div>
              <span className="font-bold text-[#A8BBC8] text-xs">Protected Sessions</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded-full border border-[#10B981]/20">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]" />
              <span>Safe</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black tracking-tight text-[#10B981]">
              {(metrics.protectedSessionsCount ?? 3840).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-[#A8BBC8]">
              Verified
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1A2E3D] text-[11px] text-[#A8BBC8] flex items-center justify-between">
          <span className="truncate">
            Defense enforcement: <strong className="text-[#10B981]">Verified Active</strong>
          </span>
          <span className="text-[10px] text-[#10B981] font-semibold group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
            Policies →
          </span>
        </div>
      </div>
    </div>
  );
}
