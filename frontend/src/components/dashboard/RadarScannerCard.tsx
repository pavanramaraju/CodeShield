'use client';

import React, { useEffect, useState } from 'react';
import { Radio, ListFilter } from 'lucide-react';

export function RadarScannerCard() {
  const [sweepAngle, setSweepAngle] = useState(0);
  const [activeEnclaveIndex, setActiveEnclaveIndex] = useState(3);
  const [selectedPing, setSelectedPing] = useState<string | null>(null);

  const enclaves = ['Enclave 1 (Frankfurt)', 'Enclave 2 (Tokyo)', 'Enclave 3 (Ashburn)', 'Enclave 4 (Singapore)'];

  useEffect(() => {
    const interval = setInterval(() => {
      setSweepAngle((prev) => (prev + 3) % 360);
    }, 30);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="bg-[#0A1C26] rounded-2xl p-4 border border-[#193543] shadow-lg shadow-[#020A10]/40 flex flex-col justify-between h-full select-none">
      <div className="flex items-center justify-between text-xs mb-2">
        <div className="flex items-center gap-1.5 font-bold text-[#F4F8FC]">
          <Radio className="w-3.5 h-3.5 text-[#00E6C3]" />
          <span>Accessible networks</span>
        </div>
        <button
          onClick={() => setActiveEnclaveIndex((i) => (i + 1) % enclaves.length)}
          aria-label="Cycle perimeter enclave"
          title="Click to cycle perimeter enclaves"
          className="p-1 rounded-md hover:bg-[#07141D] text-[#A8BBC8] hover:text-[#00E6C3] transition-colors cursor-pointer"
        >
          <ListFilter className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SVG Animated Radar Canvas */}
      <div className="relative w-full aspect-square max-w-[200px] mx-auto flex items-center justify-center my-2">
        <svg viewBox="0 0 200 200" className="w-full h-full cursor-crosshair">
          {/* Concentric rings */}
          <circle cx="100" cy="100" r="90" fill="#07141D" stroke="#193543" strokeWidth="1" />
          <circle cx="100" cy="100" r="65" fill="none" stroke="#193543" strokeWidth="1" strokeDasharray="3 3" />
          <circle cx="100" cy="100" r="40" fill="none" stroke="#193543" strokeWidth="1" />
          <circle cx="100" cy="100" r="15" fill="#0A1C26" stroke="#00E6C3" strokeWidth="1" />

          {/* Crosshairs */}
          <line x1="10" y1="100" x2="190" y2="100" stroke="#193543" strokeWidth="1" />
          <line x1="100" y1="10" x2="100" y2="190" stroke="#193543" strokeWidth="1" />

          {/* Degree markers */}
          <text x="100" y="8" fontSize="8" fill="#5A7382" textAnchor="middle">0°</text>
          <text x="195" y="103" fontSize="8" fill="#5A7382" textAnchor="start">90°</text>
          <text x="100" y="198" fontSize="8" fill="#5A7382" textAnchor="middle">180°</text>
          <text x="5" y="103" fontSize="8" fill="#5A7382" textAnchor="end">270°</text>

          {/* Radar Sweep Wedge */}
          <g transform={`rotate(${sweepAngle} 100 100)`}>
            <defs>
              <linearGradient id="cyberSweepGrad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#00E6C3" stopOpacity="0.5" />
                <stop offset="100%" stopColor="#38D9FF" stopOpacity="0.0" />
              </linearGradient>
            </defs>
            <path
              d="M 100 100 L 190 100 A 90 90 0 0 0 163.6 36.4 Z"
              fill="url(#cyberSweepGrad)"
            />
            <line x1="100" y1="100" x2="190" y2="100" stroke="#00E6C3" strokeWidth="1.5" />
          </g>

          {/* Detected Anomaly Pings with Click Handlers */}
          <circle
            cx="125"
            cy="70"
            r="5"
            fill="#00E6C3"
            className="animate-pulse cursor-pointer hover:r-6 transition-all"
            onClick={() => setSelectedPing('Node-Alpha: Normal Ingress (125,70)')}
          />
          <circle
            cx="70"
            cy="130"
            r="4.5"
            fill="#00E6C3"
            className="cursor-pointer hover:r-6 transition-all"
            onClick={() => setSelectedPing('Node-Beta: Sensor Mesh Ingestion (70,130)')}
          />
          <circle
            cx="140"
            cy="140"
            r="4"
            fill="#00E6C3"
            className="cursor-pointer hover:r-6 transition-all"
            onClick={() => setSelectedPing('Node-Gamma: Edge Gateway (140,140)')}
          />

          {/* Threat alert cluster */}
          <circle cx="115" cy="120" r="8" fill="#FF626B" opacity="0.35" />
          <circle
            cx="115"
            cy="120"
            r="4.5"
            fill="#FF626B"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            className="cursor-pointer hover:r-6 transition-all"
            onClick={() => setSelectedPing('Target-Delta: High-Risk Infiltration Cluster (115,120)')}
          />
        </svg>
      </div>

      <div className="text-[11px] text-[#A8BBC8] flex items-center justify-between border-t border-[#193543] pt-2">
        <span className="truncate pr-1">
          {selectedPing || `Active: ${enclaves[activeEnclaveIndex]}`}
        </span>
        <span className="font-bold text-[#00E6C3] shrink-0">
          {selectedPing ? 'Inspected' : '3 Pings'}
        </span>
      </div>
    </div>
  );
}
