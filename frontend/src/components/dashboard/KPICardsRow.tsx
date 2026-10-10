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
      {/* CARD 1: Threat Events (White + Electric Blue)             */}
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
        className="bg-[#0B1D29] rounded-2xl p-4 border border-[#1E3A52] shadow-lg shadow-[#030B12]/60 hover:border-[#00E5FF] hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E5FF] group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF]">
                <ShieldAlert className="w-4 h-4 text-[#00E5FF]" />
              </div>
              <span className="font-bold text-[#FFFFFF] text-xs">Threat Events</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#00E5FF] bg-[#00E5FF]/15 px-2 py-0.5 rounded-full border border-[#00E5FF]/40">
              <ArrowUpRight className="w-3 h-3 text-[#00E5FF]" />
              <span>{metrics.threatsGrowth || '+1.30%'}</span>
            </div>
          </div>

          <div className="flex items-baseline justify-between mt-1">
            <span className="text-3xl font-black tracking-tight text-[#FFFFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {metrics.threatsDetected.toLocaleString()}
            </span>

            {/* Cyan Sparkline */}
            <div className="w-20 h-7 flex items-center justify-end">
              <svg className="w-full h-full overflow-visible" viewBox="0 0 80 20">
                <polyline
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points={sparklinePoints}
                />
              </svg>
            </div>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1E3A52] text-[11px] text-[#CBD5E1] flex items-center justify-between">
          <span className="truncate">
            Comparison vs prev period: <strong className="text-[#FFFFFF]">+12.4%</strong>
          </span>
          <span className="text-[10px] text-[#00E5FF] font-bold group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
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
        className="bg-[#0B1D29] rounded-2xl p-4 border border-[#1E3A52] shadow-lg shadow-[#030B12]/60 hover:border-[#FF4D4D] hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF4D4D] group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#FF4D4D]/20 border border-[#FF4D4D]/40 flex items-center justify-center text-[#FF4D4D]">
                <Activity className="w-4 h-4 text-[#FF4D4D]" />
              </div>
              <span className="font-bold text-[#FFFFFF] text-xs">High-Risk Sessions</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#FF4D4D] bg-[#FF4D4D]/15 px-2 py-0.5 rounded-full border border-[#FF4D4D]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#FF4D4D] animate-pulse" />
              <span>Critical</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black tracking-tight text-[#FF4D4D] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {metrics.highRiskCount ?? 18}
            </span>
            <span className="text-xs font-semibold text-[#CBD5E1]">
              Flagged active
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1E3A52] text-[11px] text-[#CBD5E1] flex items-center justify-between">
          <span className="truncate">
            Zero-trust score &gt; 0.75: <strong className="text-[#FF4D4D]">Immediate Action</strong>
          </span>
          <span className="text-[10px] text-[#FF4D4D] font-bold group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
            Inspect →
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 3: Quantum Analysis (White + Electric Blue)          */}
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
        className="bg-[#0B1D29] rounded-2xl p-4 border border-[#1E3A52] shadow-lg shadow-[#030B12]/60 hover:border-[#73CFFF] hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#73CFFF] group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#73CFFF]/20 border border-[#73CFFF]/40 flex items-center justify-center text-[#73CFFF]">
                <Atom className="w-4 h-4 text-[#73CFFF]" />
              </div>
              <span className="font-bold text-[#FFFFFF] text-xs">Quantum Analysis</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#73CFFF] bg-[#73CFFF]/15 px-2 py-0.5 rounded-full border border-[#73CFFF]/40">
              <Sparkles className="w-3 h-3 text-[#73CFFF]" />
              <span>Qiskit 2.5</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black tracking-tight text-[#73CFFF] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {metrics.quantumProcessedCount ?? 84}
            </span>
            <span className="text-xs font-semibold text-[#CBD5E1]">
              Evaluated
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1E3A52] text-[11px] text-[#CBD5E1] flex items-center justify-between">
          <span className="truncate">
            State: <strong className="text-[#FFFFFF]">{isBackendConnected ? 'AerSimulator Active' : 'Simulator Mode'}</strong>
          </span>
          <span className="text-[10px] text-[#73CFFF] font-bold group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
            Kernel →
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* CARD 4: Protected Sessions (White + High-Contrast Green)  */}
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
        className="bg-[#0B1D29] rounded-2xl p-4 border border-[#1E3A52] shadow-lg shadow-[#030B12]/60 hover:border-[#00F5A0] hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00F5A0] group relative overflow-hidden flex flex-col justify-between min-h-[140px]"
      >
        <div>
          <div className="flex items-center justify-between text-xs mb-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#00F5A0]/20 border border-[#00F5A0]/40 flex items-center justify-center text-[#00F5A0]">
                <ShieldCheck className="w-4 h-4 text-[#00F5A0]" />
              </div>
              <span className="font-bold text-[#FFFFFF] text-xs">Protected Sessions</span>
            </div>

            <div className="flex items-center gap-1 text-[11px] font-bold text-[#00F5A0] bg-[#00F5A0]/15 px-2 py-0.5 rounded-full border border-[#00F5A0]/40">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00F5A0]" />
              <span>Safe</span>
            </div>
          </div>

          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black tracking-tight text-[#00F5A0] drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
              {(metrics.protectedSessionsCount ?? 3840).toLocaleString()}
            </span>
            <span className="text-xs font-semibold text-[#CBD5E1]">
              Verified
            </span>
          </div>
        </div>

        <div className="mt-3 pt-2 border-t border-[#1E3A52] text-[11px] text-[#CBD5E1] flex items-center justify-between">
          <span className="truncate">
            Defense enforcement: <strong className="text-[#00F5A0]">Verified Active</strong>
          </span>
          <span className="text-[10px] text-[#00F5A0] font-bold group-hover:translate-x-0.5 transition-transform shrink-0 ml-1">
            Policies →
          </span>
        </div>
      </div>
    </div>
  );
}
