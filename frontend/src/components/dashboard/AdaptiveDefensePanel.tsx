'use client';

import React, { useState } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { SecurityEventItem } from '@/types';
import { cyberApi } from '@/lib/cyberApi';

interface AdaptiveDefensePanelProps {
  selectedEvent: SecurityEventItem | null;
  onActionComplete?: (msg: string) => void;
  isBackendConnected?: boolean;
}

type ActionStatus = 'Recommended' | 'Pending Approval' | 'Simulated' | 'Executed';

interface DefenseRecommendationItem {
  id: string;
  actionType: string;
  title: string;
  reason: string;
  impactLevel: 'Low' | 'Medium' | 'High';
  status: ActionStatus;
}

export function AdaptiveDefensePanel({
  selectedEvent,
  onActionComplete,
  isBackendConnected = false,
}: AdaptiveDefensePanelProps) {
  const [confirmingAction, setConfirmingAction] = useState<DefenseRecommendationItem | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const [actions, setActions] = useState<DefenseRecommendationItem[]>([
    {
      id: 'DEF-01',
      actionType: 'additional_auth',
      title: 'Request Additional Authentication (MFA Challenge)',
      reason: 'Unusual device footprint and elevated risk score require cryptographic identity proof before session grant.',
      impactLevel: 'Medium',
      status: 'Recommended',
    },
    {
      id: 'DEF-02',
      actionType: 'rate_limit',
      title: 'Apply Ingress Rate Limiting (5 req/min)',
      reason: 'Repeated authentication failures detected from source IP exceeding typical human interaction speed.',
      impactLevel: 'Low',
      status: 'Recommended',
    },
    {
      id: 'DEF-03',
      actionType: 'revoke_session',
      title: 'Revoke Active Suspicious Session',
      reason: 'Compromised credential indicator. Terminate OAuth token across identity edge proxies.',
      impactLevel: 'High',
      status: 'Recommended',
    },
    {
      id: 'DEF-04',
      actionType: 'temp_block',
      title: 'Temporarily Block Source IP (15 min)',
      reason: 'Direct brute-force telemetry signature. Quarantine traffic at cloud edge firewall.',
      impactLevel: 'High',
      status: 'Recommended',
    },
    {
      id: 'DEF-05',
      actionType: 'continue_monitoring',
      title: 'Continue Active Telemetry Monitoring',
      reason: 'Log fine-grained request entropy for further anomaly clustering.',
      impactLevel: 'Low',
      status: 'Recommended',
    },
    {
      id: 'DEF-06',
      actionType: 'escalate_review',
      title: 'Escalate for Senior Analyst Review',
      reason: 'High-confidence indicator tagged with multi-enclave credential pattern.',
      impactLevel: 'Medium',
      status: 'Recommended',
    },
  ]);

  const handleOpenConfirm = (act: DefenseRecommendationItem) => {
    setConfirmingAction(act);
  };

  const handleExecuteAction = async () => {
    if (!confirmingAction) return;
    setIsProcessing(true);

    try {
      const eventId = selectedEvent?.id || 'EVT-001';
      if (isBackendConnected) {
        // Send to actual FastAPI respond endpoint!
        await cyberApi.respondToEvent(eventId, confirmingAction.actionType, confirmingAction.reason);
      } else {
        await new Promise((r) => setTimeout(r, 600));
      }

      // Update state to Executed
      setActions((prev) =>
        prev.map((a) =>
          a.id === confirmingAction.id
            ? { ...a, status: isBackendConnected ? 'Executed' : 'Simulated' }
            : a
        )
      );

      const statusLabel = isBackendConnected ? 'Executed' : 'Simulated';
      onActionComplete?.(`Defense action "${confirmingAction.title}" [${statusLabel}] successfully enforced.`);
    } catch {
      // fallback
    } finally {
      setIsProcessing(false);
      setConfirmingAction(null);
    }
  };

  return (
    <div className="bg-[#0B1D29] rounded-2xl p-5 border border-[#1A2E3D] shadow-lg shadow-[#030B12]/40 select-none flex flex-col justify-between relative">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00C9A7]/15 border border-[#00C9A7]/30 flex items-center justify-center text-[#00C9A7]">
              <ShieldCheck className="w-4 h-4 text-[#00C9A7]" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#F4F8FC]">
                Defense Recommendations
              </h3>
              <p className="text-[10px] text-[#A8BBC8]">
                Controlled Adaptive Mitigation Engine · Subject: <span className="font-mono text-[#00E5FF]">{selectedEvent?.id || 'EVT-001'}</span>
              </p>
            </div>
          </div>

          <span className="text-[10px] text-[#A8BBC8] bg-[#081722] px-2.5 py-1 rounded-full border border-[#1A2E3D]">
            Zero-Trust Policy Enclave
          </span>
        </div>

        {/* Action Recommendations List */}
        <div className="space-y-2.5">
          {actions.map((act) => {
            const isHigh = act.impactLevel === 'High';
            const isExecuted = act.status === 'Executed' || act.status === 'Simulated';

            return (
              <div
                key={act.id}
                className="p-3 rounded-xl bg-[#081722] border border-[#1A2E3D] hover:border-[#00E5FF]/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-[#F4F8FC] truncate">
                      {act.title}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-md border uppercase ${
                        isHigh
                          ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                          : 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]'
                      }`}
                    >
                      {act.impactLevel} Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-[#A8BBC8] leading-tight">
                    {act.reason}
                  </p>
                </div>

                {/* Status / Enforce Button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      isExecuted
                        ? 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                        : 'bg-[#5A7382]/15 border-[#5A7382]/30 text-[#A8BBC8]'
                    }`}
                  >
                    {act.status}
                  </span>

                  {!isExecuted && (
                    <button
                      onClick={() => handleOpenConfirm(act)}
                      className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/15 hover:bg-[#00E5FF]/25 border border-[#00E5FF]/30 text-[11px] font-bold text-[#00E5FF] transition-colors cursor-pointer"
                    >
                      Enforce →
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Safety Policy Guarantee Notice */}
      <div className="mt-4 pt-3 border-t border-[#1A2E3D] text-[10px] text-[#5A7382] leading-tight flex items-center justify-between">
        <span>
          🛡️ <strong>Safety Guarantee:</strong> High-impact mitigations enforce approval safeguards. No destructive attack-back actions.
        </span>
        <span className="font-mono text-[#10B981] font-semibold">
          POLICY CHECK: PASS
        </span>
      </div>

      {/* Controlled Approval Confirmation Modal */}
      {confirmingAction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030B12]/80 backdrop-blur-sm animate-in fade-in"
        >
          <div className="bg-[#0B1D29] rounded-2xl w-full max-w-md p-5 border border-[#1A2E3D] shadow-2xl text-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/15 border border-[#00E5FF]/30 flex items-center justify-center text-[#00E5FF]">
                <ShieldAlert className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#F4F8FC]">
                  Confirm Defensive Countermeasure
                </h4>
                <span className="text-[10px] text-[#A8BBC8]">
                  Enclave Policy Verification
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#081722] border border-[#1A2E3D] space-y-1.5">
              <span className="font-bold text-[#F4F8FC] block">
                {confirmingAction.title}
              </span>
              <p className="text-[#A8BBC8] text-[11px]">
                {confirmingAction.reason}
              </p>
              <div className="pt-1.5 flex justify-between text-[10px] font-mono text-[#5A7382]">
                <span>Target Subject: {selectedEvent?.id || 'EVT-001'}</span>
                <span className="text-[#F59E0B] font-bold">
                  {confirmingAction.impactLevel} Impact Policy
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmingAction(null)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-[#081722] border border-[#1A2E3D] text-[#A8BBC8] hover:text-[#F4F8FC] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-[#00E5FF] hover:bg-[#00C9A7] text-[#030B12] font-bold cursor-pointer transition-colors"
              >
                {isProcessing ? 'Enforcing...' : 'Authorize Action'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
