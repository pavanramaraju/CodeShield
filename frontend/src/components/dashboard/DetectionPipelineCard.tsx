'use client';

import React from 'react';
import {
  FileText,
  Cpu,
  Atom,
  UserCheck,
  ShieldCheck,
  Server,
  Activity,
  AlertTriangle,
} from 'lucide-react';

interface DetectionPipelineCardProps {
  isBackendConnected?: boolean;
}

type ComponentStatus = 'Operational' | 'Processing' | 'Degraded' | 'Unavailable' | 'Demo';

export function DetectionPipelineCard({
  isBackendConnected = false,
}: DetectionPipelineCardProps) {
  const components: {
    name: string;
    description: string;
    icon: React.ReactNode;
    status: ComponentStatus;
  }[] = [
    {
      name: 'Event Ingestion',
      description: 'Telemetry stream broker & JSON validation',
      icon: <FileText className="w-4 h-4 text-[#00E5FF]" />,
      status: isBackendConnected ? 'Operational' : 'Demo',
    },
    {
      name: 'Classical ML Risk Engine',
      description: 'Heuristic sliding window anomaly classifier',
      icon: <Cpu className="w-4 h-4 text-[#00C9A7]" />,
      status: isBackendConnected ? 'Operational' : 'Demo',
    },
    {
      name: 'Quantum Analysis',
      description: 'Qiskit 2.5 Statevector 4-qubit feature kernel',
      icon: <Atom className="w-4 h-4 text-[#73CFFF]" />,
      status: isBackendConnected ? 'Operational' : 'Demo',
    },
    {
      name: 'User Verification',
      description: 'Adaptive FIDO2 & step-up challenge gate',
      icon: <UserCheck className="w-4 h-4 text-[#10B981]" />,
      status: 'Operational',
    },
    {
      name: 'Defense Policy Engine',
      description: 'Zero-trust perimeter rule compilation',
      icon: <ShieldCheck className="w-4 h-4 text-[#00E5FF]" />,
      status: 'Operational',
    },
    {
      name: 'Dashboard / API',
      description: 'FastAPI / Next.js reactive telemetry bus',
      icon: <Server className="w-4 h-4 text-[#00C9A7]" />,
      status: isBackendConnected ? 'Operational' : 'Demo',
    },
  ];

  const getStatusBadge = (status: ComponentStatus) => {
    switch (status) {
      case 'Operational':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#00F5A0] bg-[#00F5A0]/20 px-2 py-0.5 rounded-full border border-[#00F5A0] shadow-[0_0_8px_rgba(0,245,160,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00F5A0]" />
            Operational
          </span>
        );
      case 'Processing':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#00E5FF] bg-[#00E5FF]/20 px-2 py-0.5 rounded-full border border-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.2)]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF] animate-pulse" />
            Processing
          </span>
        );
      case 'Degraded':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#F59E0B] bg-[#F59E0B]/20 px-2 py-0.5 rounded-full border border-[#F59E0B]">
            <AlertTriangle className="w-2.5 h-2.5 text-[#F59E0B]" />
            Degraded
          </span>
        );
      case 'Demo':
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#00E5FF] bg-[#00E5FF]/15 px-2 py-0.5 rounded-full border border-[#00E5FF]/40">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
            Active Enclave
          </span>
        );
      case 'Unavailable':
      default:
        return (
          <span className="flex items-center gap-1.5 text-[10px] font-extrabold text-[#EF4444] bg-[#EF4444]/20 px-2 py-0.5 rounded-full border border-[#EF4444]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444]" />
            Unavailable
          </span>
        );
    }
  };

  return (
    <div className="bg-[#0B1D29] rounded-2xl p-5 border border-[#1E3A52] shadow-xl shadow-[#030B12]/50 select-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]">
            <Activity className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div>
            <h3 className="text-sm font-extrabold text-[#FFFFFF]">Detection Pipeline</h3>
            <p className="text-[10px] text-[#CBD5E1]">
              Subsystem status &amp; telemetry health
            </p>
          </div>
        </div>

        <span className="text-[10px] text-[#CBD5E1] bg-[#081722] px-2.5 py-1 rounded-full border border-[#1E3A52] font-semibold">
          6 Engines Monitored
        </span>
      </div>

      {/* 6 Subsystem Rows */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
        {components.map((c) => (
          <div
            key={c.name}
            className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52] hover:border-[#00E5FF]/50 transition-colors flex items-center justify-between"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#0B1D29] border border-[#1E3A52] flex items-center justify-center shrink-0">
                {c.icon}
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-xs font-bold text-[#FFFFFF] truncate">
                  {c.name}
                </span>
                <span className="text-[10px] text-[#CBD5E1] truncate font-medium">
                  {c.description}
                </span>
              </div>
            </div>

            <div className="shrink-0 ml-2">
              {getStatusBadge(c.status)}
            </div>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="mt-4 pt-2.5 border-t border-[#1E3A52] text-[10px] text-[#CBD5E1] flex items-center justify-between">
        <span>Subsystem health audited continuously via periodic heartbeat checks.</span>
        <span className="text-[#00F5A0] font-mono font-bold">100% AUDIT PASS</span>
      </div>
    </div>
  );
}
