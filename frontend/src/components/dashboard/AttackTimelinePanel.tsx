'use client';

import React from 'react';
import {
  GitCommit,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Shield,
  Cpu,
  Atom,
} from 'lucide-react';
import { SecurityEventItem } from '@/types';

interface AttackTimelinePanelProps {
  event?: SecurityEventItem | null;
  isBackendConnected?: boolean;
}

export function AttackTimelinePanel({
  event,
  isBackendConnected = false,
}: AttackTimelinePanelProps) {
  const activeEventId = event?.id || 'EVT-001';

  const stages = [
    {
      stage: 'Login Event',
      time: '10:22:10 AM',
      icon: <Clock className="w-3.5 h-3.5 text-[#00E5FF]" />,
      status: 'Completed',
      evidence: `Authentication request received from ${event?.ipAddress || '203.0.113.24'} for target ${event?.targetService || 'Auth SSO Portal'}.`,
      color: '#00E5FF',
    },
    {
      stage: 'Risk Assessment',
      time: '10:22:12 AM',
      icon: <Cpu className="w-3.5 h-3.5 text-[#F59E0B]" />,
      status: 'Completed',
      evidence: `Classical heuristic risk evaluated: Score ${event?.riskScore || 92}/100. 14 failed attempts flagged in 60s sliding window.`,
      color: '#F59E0B',
    },
    {
      stage: 'Quantum Analysis',
      time: '10:22:15 AM',
      icon: <Atom className="w-3.5 h-3.5 text-[#73CFFF]" />,
      status: isBackendConnected ? 'Verified (Qiskit)' : 'Simulated (Local)',
      evidence: `4-Qubit ZZFeatureMap executed (1024 shots). State dispersion excited ratio: ${(event?.quantumFidelity || 0.982).toFixed(3)}.`,
      color: '#73CFFF',
    },
    {
      stage: 'User Verification',
      time: '10:22:18 AM',
      icon: <AlertTriangle className="w-3.5 h-3.5 text-[#EF4444]" />,
      status: 'Challenged',
      evidence: 'FIDO2 / TOTP step-up prompt issued to user. Operator alert flagged in SOC queue.',
      color: '#EF4444',
    },
    {
      stage: 'Defense Decision',
      time: '10:22:20 AM',
      icon: <Shield className="w-3.5 h-3.5 text-[#10B981]" />,
      status: 'Enforced',
      evidence: 'Automated perimeter defense: Transient rate limit and IP drop rule enacted at ingress edge.',
      color: '#10B981',
    },
    {
      stage: 'Recovery',
      time: '10:22:45 AM',
      icon: <CheckCircle2 className="w-3.5 h-3.5 text-[#00C9A7]" />,
      status: 'Monitored',
      evidence: 'Session invalidated. Identity audit log persisted with SHA-256 tamper-proof seal.',
      color: '#00C9A7',
    },
  ];

  return (
    <div className="bg-[#0B1D29] rounded-2xl p-5 border border-[#1A2E3D] shadow-lg shadow-[#030B12]/40 select-none flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
            <GitCommit className="w-4 h-4 text-[#00E5FF]" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-[#F4F8FC]">Attack Timeline</h3>
            <p className="text-[10px] text-[#A8BBC8]">
              Lifecycle Progression · Subject: <span className="font-mono text-[#00E5FF]">{activeEventId}</span>
            </p>
          </div>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-[#081722] border border-[#1A2E3D] text-[10px] font-semibold text-[#10B981] flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
          End-to-End Traced
        </span>
      </div>

      {/* Connected Timeline Nodes */}
      <div className="space-y-3 relative before:absolute before:left-3.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-[#1A2E3D]">
        {stages.map((st) => (
          <div key={st.stage} className="relative flex items-start gap-3 pl-1">
            {/* Timeline Node Icon */}
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 border z-10 bg-[#0B1D29]"
              style={{
                borderColor: `${st.color}50`,
                backgroundColor: `${st.color}15`,
              }}
            >
              {st.icon}
            </div>

            {/* Node Content Card */}
            <div className="flex-1 p-2.5 rounded-xl bg-[#081722] border border-[#1A2E3D] hover:border-[#00E5FF]/40 transition-colors">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className="font-bold text-[#F4F8FC]">{st.stage}</span>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono text-[#5A7382]">{st.time}</span>
                  <span
                    className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md border uppercase"
                    style={{
                      borderColor: `${st.color}40`,
                      color: st.color,
                      backgroundColor: `${st.color}10`,
                    }}
                  >
                    {st.status}
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-[#A8BBC8] leading-relaxed">
                {st.evidence}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Footnote */}
      <div className="mt-3 pt-2.5 border-t border-[#1A2E3D] flex items-center justify-between text-[10px] text-[#5A7382]">
        <span>Zero-Trust Forensic Assurance Standard</span>
        <span className="font-mono text-[#A8BBC8]">State: FULLY_RECORDED</span>
      </div>
    </div>
  );
}
