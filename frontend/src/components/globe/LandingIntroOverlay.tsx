'use client';

import React, { useState, useEffect } from 'react';
import { Radar, Cpu, Atom, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';

interface LandingIntroOverlayProps {
  onEnterLogin: () => void;
  onEnterDashboard: () => void;
}

export function LandingIntroOverlay({
  onEnterLogin,
}: LandingIntroOverlayProps) {
  const [progress, setProgress] = useState(18);
  const [isInitialized, setIsInitialized] = useState(false);

  // Finite initialization sequence: advances to 100% once, then stabilizes
  useEffect(() => {
    const steps = [
      { target: 45, delay: 300 },
      { target: 78, delay: 800 },
      { target: 94, delay: 1300 },
      { target: 100, delay: 1700 },
    ];

    const timeouts = steps.map(({ target, delay }) =>
      setTimeout(() => {
        setProgress(target);
        if (target === 100) {
          setTimeout(() => setIsInitialized(true), 350);
        }
      }, delay)
    );

    return () => timeouts.forEach(clearTimeout);
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none z-30 flex flex-col justify-between p-6 sm:p-10 select-none">
      {/* 4 Callout Cards around the globe matching Reference Image Scene 1 */}
      <div className="relative w-full h-full flex flex-col justify-between">
        {/* Top Callouts Row */}
        <div className="w-full flex items-start justify-between mt-16 sm:mt-20">
          {/* Top-Left: Scanning Global Threats */}
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0A1C26]/85 backdrop-blur-md border border-[#193543] shadow-lg shadow-[#020A10]/60 hover:border-[#00E6C3]/60 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-[#07141D] border border-[#193543] flex items-center justify-center text-[#00E6C3] group-hover:scale-105 transition-transform">
              <Radar className="w-5 h-5 text-[#00E6C3]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F8FC] tracking-wide">
                Scanning
              </span>
              <span className="text-[11px] text-[#A8BBC8]">
                Global Threats
              </span>
            </div>
          </div>

          {/* Top-Right: Analyzing Anomalies */}
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0A1C26]/85 backdrop-blur-md border border-[#193543] shadow-lg shadow-[#020A10]/60 hover:border-[#38D9FF]/60 transition-all group">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-[#F4F8FC] tracking-wide">
                Analyzing
              </span>
              <span className="text-[11px] text-[#A8BBC8]">
                Anomalies
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#07141D] border border-[#193543] flex items-center justify-center text-[#38D9FF] group-hover:scale-105 transition-transform">
              <Cpu className="w-5 h-5 text-[#38D9FF]" />
            </div>
          </div>
        </div>

        {/* Bottom Callouts Row */}
        <div className="w-full flex items-end justify-between mb-28 sm:mb-24">
          {/* Bottom-Left: Quantum Processing */}
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0A1C26]/85 backdrop-blur-md border border-[#193543] shadow-lg shadow-[#020A10]/60 hover:border-[#00E6C3]/60 transition-all group">
            <div className="w-9 h-9 rounded-xl bg-[#07141D] border border-[#193543] flex items-center justify-center text-[#00E6C3] group-hover:scale-105 transition-transform">
              <Atom className="w-5 h-5 text-[#00E6C3]" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#F4F8FC] tracking-wide">
                Quantum
              </span>
              <span className="text-[11px] text-[#A8BBC8]">
                Processing
              </span>
            </div>
          </div>

          {/* Bottom-Right: Activating Defense Layer */}
          <div className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-2xl bg-[#0A1C26]/85 backdrop-blur-md border border-[#193543] shadow-lg shadow-[#020A10]/60 hover:border-[#00E6C3]/60 transition-all group">
            <div className="flex flex-col text-right">
              <span className="text-xs font-bold text-[#F4F8FC] tracking-wide">
                Activating
              </span>
              <span className="text-[11px] text-[#A8BBC8]">
                Defense Layer
              </span>
            </div>
            <div className="w-9 h-9 rounded-xl bg-[#07141D] border border-[#193543] flex items-center justify-center text-[#00E6C3] group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-[#00E6C3]" />
            </div>
          </div>
        </div>

        {/* Bottom Center: Finite Initialization -> Stable Defense Grid Status Display */}
        <div className="pointer-events-auto absolute bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2.5 w-full max-w-sm px-4">
          <span className="text-xs font-semibold tracking-wider text-[#A8BBC8]">
            Building a Safer Digital World
          </span>

          {!isInitialized ? (
            /* Genuine, finite progress initialization (runs once, stops at 100%) */
            <div className="w-full flex items-center gap-3 transition-all duration-300">
              <div className="relative flex-1 h-2 rounded-full bg-[#0A1C26] border border-[#193543] overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-[#00E6C3] to-[#38D9FF] shadow-[0_0_12px_#00E6C3] transition-all duration-500 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-mono font-bold text-[#00E6C3] min-w-8 text-right">
                {progress}%
              </span>
            </div>
          ) : (
            /* Stable, permanent status display once initialized (never loops or runs indefinitely) */
            <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#0A1C26]/90 border border-[#00E6C3]/40 shadow-lg shadow-[#020A10]/60 backdrop-blur-md transition-all duration-500 animate-in fade-in">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#00E6C3]" />
              <span className="text-[11px] font-mono font-bold text-[#F4F8FC] tracking-wider">
                DEFENSE GRID ACTIVE // 16 NODES ONLINE
              </span>
              <span className="text-[10px] font-mono text-[#00E6C3] bg-[#00E6C3]/15 px-1.5 py-0.5 rounded border border-[#00E6C3]/30">
                100%
              </span>
            </div>
          )}

          {/* Quick Action Button: Transition to Login */}
          <div className="flex items-center gap-3 mt-1">
            <button
              onClick={onEnterLogin}
              className="px-6 py-2 rounded-full bg-gradient-to-r from-[#00E6C3] to-[#0F766E] text-xs font-bold text-[#020A10] hover:shadow-lg hover:shadow-[#00E6C3]/40 transition-all cursor-pointer flex items-center gap-2 group"
            >
              <span>Continue to Login</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
