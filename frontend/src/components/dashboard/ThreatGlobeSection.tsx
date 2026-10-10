'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Globe,
  Maximize2,
  Minimize2,
  Radar,
  Cpu,
  Atom,
  ShieldCheck,
} from 'lucide-react';

// Dynamic import for 3D Globe with SSR disabled
const QShieldGlobe = dynamic(
  () =>
    import('@/components/globe/QShieldGlobe').then(
      (mod) => mod.QShieldGlobe
    ),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#030B12]">
        <div className="w-16 h-16 rounded-full border-4 border-[#00E5FF]/20 border-t-[#00E5FF] animate-spin" />
      </div>
    ),
  }
);

interface ThreatGlobeSectionProps {
  onFullscreenToggle?: () => void;
  isBackendConnected?: boolean;
}

export function ThreatGlobeSection({
  onFullscreenToggle,
  isBackendConnected = false,
}: ThreatGlobeSectionProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const toggleFullscreen = () => {
    setIsFullscreen((prev) => !prev);
    onFullscreenToggle?.();
  };

  return (
    <div
      className={`relative w-full rounded-2xl bg-[#030B12] border border-[#1A2E3D] shadow-2xl overflow-hidden select-none transition-all duration-300 ${
        isFullscreen ? 'h-[85vh]' : 'h-[440px] sm:h-[500px]'
      }`}
    >
      {/* Background radial gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at 50% 50%, #081722 0%, #051019 55%, #030B12 100%)',
        }}
      />

      {/* 3D WebGL Three.js Globe Canvas */}
      <div className="absolute inset-0 w-full h-full">
        <QShieldGlobe />
      </div>

      {/* Top Header Bar inside Globe Section */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2 pointer-events-auto bg-[#081722]/85 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-[#1A2E3D] shadow-lg">
          <Globe className="w-4 h-4 text-[#00E5FF]" />
          <span className="text-xs font-bold text-[#F4F8FC]">
            Live Global Threat Grid
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          <span className="text-[10px] text-[#10B981] font-semibold">
            {isBackendConnected ? 'FastAPI Grid' : '16 Nodes Active'}
          </span>
        </div>

        <div className="flex items-center gap-2 pointer-events-auto">
          <button
            onClick={toggleFullscreen}
            aria-label={isFullscreen ? 'Exit fullscreen' : 'Expand globe view'}
            title={isFullscreen ? 'Exit fullscreen' : 'Expand globe view'}
            className="w-8 h-8 rounded-full bg-[#081722]/85 hover:bg-[#0B1D29] border border-[#1A2E3D] text-[#A8BBC8] hover:text-[#00E5FF] flex items-center justify-center transition-colors cursor-pointer backdrop-blur-md shadow-lg"
          >
            {isFullscreen ? (
              <Minimize2 className="w-4 h-4" />
            ) : (
              <Maximize2 className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 4 Floating Status Indicator Cards matching specification */}
      {/* Card 1: Top-Left — Threat Monitoring */}
      <div className="absolute top-16 left-4 z-20 pointer-events-auto hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#081722]/85 backdrop-blur-md border border-[#1A2E3D] shadow-lg">
        <div className="w-7 h-7 rounded-lg bg-[#0B1D29] border border-[#1A2E3D] flex items-center justify-center text-[#00E5FF]">
          <Radar className="w-3.5 h-3.5 text-[#00E5FF]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#A8BBC8] uppercase font-bold tracking-wider">
            Threat Monitoring
          </span>
          <span className="text-xs font-bold text-[#F4F8FC]">
            Active · Ingress Filtered
          </span>
        </div>
      </div>

      {/* Card 2: Top-Right — Analyzing Anomalies */}
      <div className="absolute top-16 right-4 z-20 pointer-events-auto hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#081722]/85 backdrop-blur-md border border-[#1A2E3D] shadow-lg">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-[#A8BBC8] uppercase font-bold tracking-wider">
            Analyzing Anomalies
          </span>
          <span className="text-xs font-bold text-[#00E5FF]">
            Sliding Window Engine
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-[#0B1D29] border border-[#1A2E3D] flex items-center justify-center text-[#00E5FF]">
          <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" />
        </div>
      </div>

      {/* Card 3: Bottom-Left — Quantum Analysis */}
      <div className="absolute bottom-5 left-4 z-20 pointer-events-auto hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#081722]/85 backdrop-blur-md border border-[#1A2E3D] shadow-lg">
        <div className="w-7 h-7 rounded-lg bg-[#0B1D29] border border-[#1A2E3D] flex items-center justify-center text-[#73CFFF]">
          <Atom className="w-3.5 h-3.5 text-[#73CFFF]" />
        </div>
        <div className="flex flex-col">
          <span className="text-[10px] text-[#A8BBC8] uppercase font-bold tracking-wider">
            Quantum Analysis
          </span>
          <span className="text-xs font-bold text-[#73CFFF]">
            {isBackendConnected ? 'Qiskit Aer (Ready)' : 'Simulator Active'}
          </span>
        </div>
      </div>

      {/* Card 4: Bottom-Right — Defense Status */}
      <div className="absolute bottom-5 right-4 z-20 pointer-events-auto hidden sm:flex items-center gap-2.5 px-3 py-2 rounded-xl bg-[#081722]/85 backdrop-blur-md border border-[#1A2E3D] shadow-lg">
        <div className="flex flex-col text-right">
          <span className="text-[10px] text-[#A8BBC8] uppercase font-bold tracking-wider">
            Defense Status
          </span>
          <span className="text-xs font-bold text-[#10B981]">
            Adaptive Mesh Online
          </span>
        </div>
        <div className="w-7 h-7 rounded-lg bg-[#0B1D29] border border-[#1A2E3D] flex items-center justify-center text-[#10B981]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
        </div>
      </div>
    </div>
  );
}
