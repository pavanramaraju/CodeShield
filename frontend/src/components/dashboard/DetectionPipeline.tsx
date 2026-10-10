'use client';

import React from 'react';
import {
  FileText,
  Cpu,
  Atom,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';

interface DetectionPipelineProps {
  onOpenEvent?: () => void;
  onOpenQuantum?: () => void;
  onTriggerDefense?: () => void;
}

export function DetectionPipeline({
  onOpenEvent,
  onOpenQuantum,
  onTriggerDefense,
}: DetectionPipelineProps) {
  const stages = [
    {
      id: 'event',
      step: '1',
      title: 'Event',
      subtitle: 'User activity or system event',
      icon: <FileText className="w-5 h-5 text-[#38D9FF]" />,
      color: '#38D9FF',
      onClick: onOpenEvent,
    },
    {
      id: 'ml',
      step: '2',
      title: 'Classical ML',
      subtitle: 'Anomaly screening',
      icon: <Cpu className="w-5 h-5 text-[#00E6C3]" />,
      color: '#00E6C3',
      onClick: onOpenEvent,
    },
    {
      id: 'quantum',
      step: '3',
      title: 'Quantum Analysis',
      subtitle: 'Advanced pattern recognition',
      icon: <Atom className="w-5 h-5 text-[#38D9FF]" />,
      color: '#38D9FF',
      onClick: onOpenQuantum,
    },
    {
      id: 'defense',
      step: '4',
      title: 'Defense',
      subtitle: 'Simulated response actions',
      icon: <ShieldCheck className="w-5 h-5 text-[#00E6C3]" />,
      color: '#00E6C3',
      onClick: onTriggerDefense,
    },
  ];

  return (
    <div className="bg-[#0A1C26] rounded-2xl p-5 border border-[#193543] shadow-lg shadow-[#020A10]/40">
      {/* Header with Live View badge */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <h3 className="text-sm font-bold text-[#F4F8FC] tracking-wide">
            Detection Pipeline
          </h3>
          <span className="text-[10px] text-[#A8BBC8] hidden sm:inline">
            End-to-end zero-trust anomaly processing
          </span>
        </div>

        <div className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#07141D] border border-[#193543] text-xs font-semibold text-[#00E6C3]">
          <span className="w-2 h-2 rounded-full bg-[#00E6C3] animate-ping" />
          <span className="text-[11px] font-bold">● Live View</span>
        </div>
      </div>

      {/* 4 Connected Stages with Animated Connectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
        {stages.map((stage, idx) => (
          <div key={stage.id} className="relative flex items-center">
            {/* Stage Card */}
            <div
              onClick={stage.onClick}
              role="button"
              tabIndex={0}
              className="w-full p-4 rounded-xl bg-[#07141D] border border-[#193543] hover:border-[#00E6C3]/60 transition-all cursor-pointer group flex flex-col justify-between min-h-[105px] shadow-sm relative overflow-hidden"
            >
              {/* Subtle top indicator bar */}
              <div
                className="absolute top-0 left-0 right-0 h-0.5"
                style={{ backgroundColor: stage.color }}
              />

              <div className="flex items-center justify-between mb-2">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
                  style={{
                    backgroundColor: `${stage.color}15`,
                    borderColor: `${stage.color}30`,
                    borderWidth: 1,
                  }}
                >
                  {stage.icon}
                </div>
                <span className="text-[10px] font-mono font-bold text-[#5A7382]">
                  STAGE 0{stage.step}
                </span>
              </div>

              <div>
                <h4 className="text-xs font-bold text-[#F4F8FC] group-hover:text-[#00E6C3] transition-colors">
                  {stage.title}
                </h4>
                <p className="text-[10px] text-[#A8BBC8] leading-tight mt-0.5">
                  {stage.subtitle}
                </p>
              </div>
            </div>

            {/* Connecting Arrow (between items on desktop) */}
            {idx < stages.length - 1 && (
              <div className="hidden lg:flex absolute -right-3.5 z-10 w-6 h-6 rounded-full bg-[#0A1C26] border border-[#193543] items-center justify-center text-[#00E6C3]">
                <ChevronRight className="w-3.5 h-3.5" />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
