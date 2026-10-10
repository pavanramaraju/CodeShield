'use client';

import React from 'react';
import { ShieldCheck, AlertTriangle, Atom, Clock, ArrowUpRight } from 'lucide-react';
import { KPIMetrics } from '@/types';

interface KPICardsRowProps {
  metrics: KPIMetrics;
  onSelectMetric?: (metric: 'threats' | 'networks' | 'streams' | 'quantum') => void;
}

export function KPICardsRow({ metrics, onSelectMetric }: KPICardsRowProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Card 1: Events Detected matching reference image */}
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
        aria-label="Threats detected metric. Click to filter high-risk threats."
        className="bg-[#0A1C26] rounded-2xl p-4 border border-[#193543] shadow-lg shadow-[#020A10]/40 hover:border-[#00E6C3]/60 hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E6C3] group"
      >
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#00E6C3]/15 border border-[#00E6C3]/30 flex items-center justify-center text-[#00E6C3]">
            <ShieldCheck className="w-4 h-4 text-[#00E6C3]" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#00E6C3] bg-[#00E6C3]/10 px-2 py-0.5 rounded-full border border-[#00E6C3]/20">
            <ArrowUpRight className="w-3 h-3" />
            <span>12%</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-[#F4F8FC]">
            124
          </span>
          <span className="text-xs font-semibold text-[#A8BBC8]">
            Events
          </span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#193543] text-[11px] text-[#A8BBC8] flex items-center justify-between">
          <span>
            Total scanned: <strong className="text-[#F4F8FC]">{metrics.threatsDetected.toLocaleString()}</strong>
          </span>
          <span className="text-[10px] text-[#00E6C3] font-semibold group-hover:translate-x-0.5 transition-transform">
            Filter →
          </span>
        </div>
      </div>

      {/* Card 2: High Risk Events matching reference image */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectMetric?.('networks')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric?.('networks');
          }
        }}
        aria-label="Accessible networks metric. Click to view perimeter radar scanner."
        className="bg-[#0A1C26] rounded-2xl p-4 border border-[#193543] shadow-lg shadow-[#020A10]/40 hover:border-[#FF626B]/60 hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF626B] group"
      >
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#FF626B]/15 border border-[#FF626B]/30 flex items-center justify-center text-[#FF626B]">
            <AlertTriangle className="w-4 h-4 text-[#FF626B]" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#FF626B] bg-[#FF626B]/10 px-2 py-0.5 rounded-full border border-[#FF626B]/20">
            <ArrowUpRight className="w-3 h-3" />
            <span>5%</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-[#FF626B]">
            18
          </span>
          <span className="text-xs font-semibold text-[#A8BBC8]">
            High Risk
          </span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#193543] text-[11px] text-[#A8BBC8] flex items-center justify-between">
          <span>
            Error margin: <strong className="text-[#F4F8FC]">{metrics.accessibleNetworksError}</strong>
          </span>
          <span className="text-[10px] text-[#FF626B] font-semibold group-hover:translate-x-0.5 transition-transform">
            Radar →
          </span>
        </div>
      </div>

      {/* Card 3: Quantum Analyzed matching reference image */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => onSelectMetric?.('streams')}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onSelectMetric?.('streams');
          }
        }}
        aria-label="Cyber traffics metric. Click to reset and show all ingestion streams."
        className="bg-[#0A1C26] rounded-2xl p-4 border border-[#193543] shadow-lg shadow-[#020A10]/40 hover:border-[#38D9FF]/60 hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#38D9FF] group"
      >
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#38D9FF]/15 border border-[#38D9FF]/30 flex items-center justify-center text-[#38D9FF]">
            <Atom className="w-4 h-4 text-[#38D9FF]" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#38D9FF] bg-[#38D9FF]/10 px-2 py-0.5 rounded-full border border-[#38D9FF]/20">
            <ArrowUpRight className="w-3 h-3" />
            <span>28%</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-[#38D9FF]">
            32
          </span>
          <span className="text-xs font-semibold text-[#A8BBC8]">
            Quantum Analyzed
          </span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#193543] text-[11px] text-[#A8BBC8] flex items-center justify-between">
          <span>
            Active streams: <span className="text-[#F4F8FC] font-bold">{metrics.eventsAnalyzed}</span>
          </span>
          <span className="text-[10px] text-[#38D9FF] font-semibold group-hover:translate-x-0.5 transition-transform">
            Streams →
          </span>
        </div>
      </div>

      {/* Card 4: System Uptime matching reference image */}
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
        aria-label="Anom traffic quantum rate. Click to launch Qiskit Quantum Engine."
        className="bg-[#0A1C26] rounded-2xl p-4 border border-[#193543] shadow-lg shadow-[#020A10]/40 hover:border-[#00E6C3]/60 hover:-translate-y-0.5 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E6C3] group"
      >
        <div className="flex items-center justify-between text-xs mb-2">
          <div className="w-8 h-8 rounded-xl bg-[#00E6C3]/15 border border-[#00E6C3]/30 flex items-center justify-center text-[#00E6C3]">
            <Clock className="w-4 h-4 text-[#00E6C3]" />
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#00E6C3] bg-[#00E6C3]/10 px-2 py-0.5 rounded-full border border-[#00E6C3]/20">
            <ArrowUpRight className="w-3 h-3" />
            <span>2.1%</span>
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black tracking-tight text-[#F4F8FC]">
            97.5%
          </span>
          <span className="text-xs font-semibold text-[#A8BBC8]">
            System Uptime
          </span>
        </div>

        <div className="mt-2.5 pt-2 border-t border-[#193543] text-[11px] text-[#A8BBC8] flex items-center justify-between">
          <span>
            Quantum anomaly: <strong className="text-[#00E6C3]">{metrics.anomalyRate}</strong>
          </span>
          <span className="text-[10px] text-[#00E6C3] font-semibold group-hover:translate-x-0.5 transition-transform">
            Status →
          </span>
        </div>
      </div>
    </div>
  );
}
