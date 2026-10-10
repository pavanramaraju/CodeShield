'use client';

import React from 'react';
import {
  Activity,
  Cpu,
  ArrowRight,
  Shield,
} from 'lucide-react';
import { SecurityEventItem } from '@/types';

interface RiskAnalysisPanelProps {
  selectedEvent: SecurityEventItem | null;
  onOpenEventDetail?: (event: SecurityEventItem) => void;
  onTriggerDefenseAction?: () => void;
}

export function RiskAnalysisPanel({
  selectedEvent,
  onOpenEventDetail,
  onTriggerDefenseAction,
}: RiskAnalysisPanelProps) {
  // Use selected event or realistic default
  const event = selectedEvent || {
    id: 'EVT-001',
    username: 'sec_admin_01',
    targetService: 'Auth SSO Portal',
    category: 'Failed Login',
    status: 'high-risk' as const,
    timestamp: '10:22 AM',
    riskScore: 92,
    quantumFidelity: 0.982,
    classicalConfidence: 0.94,
    ipAddress: '203.0.113.24',
    location: 'Singapore, SG',
    mitigationAction: 'Blocked at identity edge firewall',
    device: 'Chrome 122 on macOS (Unrecognized)',
    reasons: [
      'Repeated failed login attempts (14 in 60s)',
      'New or unfamiliar device fingerprint',
      'Unusual location / proxy hop detected',
      'Abnormal login frequency exceeding threshold',
      'Suspicious activity pattern matching brute-force signature',
    ],
  };

  const riskScore = event.riskScore;
  const isCritical = riskScore >= 75;
  const isHigh = riskScore >= 50 && riskScore < 75;
  const isMedium = riskScore >= 25 && riskScore < 50;

  const classification = isCritical
    ? 'CRITICAL'
    : isHigh
    ? 'HIGH'
    : isMedium
    ? 'MEDIUM'
    : 'LOW';

  const classificationColor = isCritical
    ? '#EF4444'
    : isHigh
    ? '#F97316'
    : isMedium
    ? '#F59E0B'
    : '#10B981';

  const defaultFactors = [
    { name: 'Repeated failed login attempts', severity: 'Critical', weight: '+35%' },
    { name: 'New or unfamiliar device signature', severity: 'High', weight: '+25%' },
    { name: 'Unusual geolocation proxy traversal', severity: 'High', weight: '+20%' },
    { name: 'Abnormal authentication frequency', severity: 'Medium', weight: '+12%' },
    { name: 'Payload entropy variance', severity: 'Low', weight: '+8%' },
  ];

  return (
    <div className="bg-[#0B1D29] rounded-2xl p-5 border border-[#1A2E3D] shadow-lg shadow-[#030B12]/40 select-none flex flex-col justify-between">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
              <Activity className="w-4 h-4 text-[#00E5FF]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F4F8FC]">Risk Analysis</h3>
              <span className="text-[10px] text-[#A8BBC8]">
                ID: <span className="font-mono text-[#00E5FF]">{event.id}</span> · {event.timestamp}
              </span>
            </div>
          </div>

          <div
            className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border"
            style={{
              backgroundColor: `${classificationColor}15`,
              borderColor: `${classificationColor}40`,
              color: classificationColor,
            }}
          >
            {classification} RISK
          </div>
        </div>

        {/* Risk Score Visual Gauge / Progress Bar */}
        <div className="p-3.5 rounded-xl bg-[#081722] border border-[#1A2E3D] my-3">
          <div className="flex items-baseline justify-between mb-2">
            <span className="text-xs font-semibold text-[#A8BBC8]">
              Heuristic Composite Score
            </span>
            <span
              className="text-2xl font-black font-mono"
              style={{ color: classificationColor }}
            >
              {riskScore}/100
            </span>
          </div>

          {/* Segmented Progress Bar */}
          <div className="w-full h-2.5 bg-[#0B1D29] rounded-full overflow-hidden border border-[#1A2E3D] flex">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${riskScore}%`,
                backgroundColor: classificationColor,
                boxShadow: `0 0 10px ${classificationColor}`,
              }}
            />
          </div>

          <div className="flex justify-between text-[10px] font-mono text-[#5A7382] mt-1.5">
            <span>0 (Benign)</span>
            <span>50 (Suspicious)</span>
            <span>100 (Critical)</span>
          </div>
        </div>

        {/* Contributing Factors */}
        <div className="space-y-1.5 my-3">
          <span className="text-[11px] font-bold text-[#A8BBC8] block">
            Contributing Risk Factors:
          </span>
          {defaultFactors.map((factor, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#081722]/80 border border-[#1A2E3D] text-[11px]"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00E5FF]" />
                <span className="text-[#F4F8FC] truncate">{factor.name}</span>
              </div>
              <span className="text-[#00E5FF] font-mono font-semibold text-[10px] shrink-0 ml-2">
                {factor.weight}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Model Assessment & Recommendation Footer */}
      <div className="pt-3 border-t border-[#1A2E3D] space-y-2.5">
        <div className="flex items-center justify-between text-[11px]">
          <span className="text-[#A8BBC8] flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-[#00E5FF]" />
            Classical ML Assessment:
          </span>
          <span className="font-semibold text-[#10B981]">
            Random Forest v2.4 (94.2% conf)
          </span>
        </div>

        <div className="p-2.5 rounded-xl bg-[#081722] border border-[#1A2E3D] flex items-center justify-between">
          <div className="flex flex-col overflow-hidden">
            <span className="text-[10px] uppercase font-bold text-[#5A7382]">
              Recommended Next Step
            </span>
            <span className="text-xs font-semibold text-[#00E5FF] truncate">
              {event.mitigationAction || 'Trigger MFA challenge & quarantine session'}
            </span>
          </div>

          <div className="flex items-center gap-2 shrink-0 ml-2">
            {onTriggerDefenseAction && (
              <button
                onClick={onTriggerDefenseAction}
                aria-label="Enact defense policy"
                title="Enact defense policy"
                className="px-2 py-1 rounded-lg bg-[#10B981]/15 hover:bg-[#10B981]/25 border border-[#10B981]/30 text-[11px] font-bold text-[#10B981] flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Shield className="w-3 h-3" />
                <span>Defend</span>
              </button>
            )}

            <button
              onClick={() => onOpenEventDetail?.(event)}
              aria-label="View forensic investigation details"
              className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/30 text-[11px] font-bold text-[#00E5FF] flex items-center gap-1 transition-colors cursor-pointer"
            >
              <span>Evidence</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
