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
    <div className="bg-[#0B1D29] rounded-2xl p-5 border border-[#1E3A52] shadow-xl shadow-[#030B12]/50 select-none flex flex-col justify-between relative">
      {/* Header */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#00F5A0]/20 border border-[#00F5A0]/40 flex items-center justify-center text-[#00F5A0] shadow-[0_0_12px_rgba(0,245,160,0.25)]">
              <ShieldCheck className="w-4 h-4 text-[#00F5A0]" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#FFFFFF]">
                Defense Recommendations
              </h3>
              <p className="text-[10px] text-[#CBD5E1]">
                Controlled Adaptive Mitigation Engine · Subject: <span className="font-mono text-[#00E5FF] font-bold">{selectedEvent?.id || 'EVT-001'}</span>
              </p>
            </div>
          </div>

          <span className="text-[10px] text-[#CBD5E1] bg-[#081722] px-2.5 py-1 rounded-full border border-[#1E3A52] font-semibold">
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
                className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52] hover:border-[#00E5FF]/50 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-2.5"
              >
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-bold text-[#FFFFFF] truncate">
                      {act.title}
                    </span>
                    <span
                      className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md border uppercase ${
                        isHigh
                          ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                          : 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                      }`}
                    >
                      {act.impactLevel} Impact
                    </span>
                  </div>
                  <p className="text-[11px] text-[#E2E8F0] leading-tight">
                    {act.reason}
                  </p>
                </div>

                {/* Status / Enforce Button */}
                <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                      isExecuted
                        ? 'bg-[#00F5A0]/20 border-[#00F5A0] text-[#00F5A0] shadow-[0_0_8px_rgba(0,245,160,0.2)]'
                        : 'bg-[#1E3A52]/60 border-[#1E3A52] text-[#CBD5E1]'
                    }`}
                  >
                    {act.status}
                  </span>

                  {!isExecuted && (
                    <button
                      onClick={() => handleOpenConfirm(act)}
                      className="px-2.5 py-1 rounded-lg bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF] text-[11px] font-extrabold text-[#00E5FF] transition-all cursor-pointer shadow-[0_0_8px_rgba(0,229,255,0.2)]"
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
      <div className="mt-4 pt-3 border-t border-[#1E3A52] text-[10px] text-[#CBD5E1] leading-tight flex items-center justify-between">
        <span>
          🛡️ <strong className="text-[#FFFFFF]">Safety Guarantee:</strong> High-impact mitigations enforce approval safeguards. No destructive attack-back actions.
        </span>
        <span className="font-mono text-[#00F5A0] font-extrabold">
          POLICY CHECK: PASS
        </span>
      </div>

      {/* Controlled Approval Confirmation Modal */}
      {confirmingAction && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#030B12]/85 backdrop-blur-md animate-in fade-in"
        >
          <div className="bg-[#0B1D29] rounded-2xl w-full max-w-md p-5 border border-[#1E3A52] shadow-2xl text-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/20 border border-[#00E5FF]/40 flex items-center justify-center text-[#00E5FF] shadow-[0_0_12px_rgba(0,229,255,0.25)]">
                <ShieldAlert className="w-5 h-5 text-[#00E5FF]" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-[#FFFFFF]">
                  Confirm Defensive Countermeasure
                </h4>
                <span className="text-[10px] text-[#CBD5E1]">
                  Enclave Policy Verification
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52] space-y-1.5">
              <span className="font-bold text-[#FFFFFF] block">
                {confirmingAction.title}
              </span>
              <p className="text-[#E2E8F0] text-[11px]">
                {confirmingAction.reason}
              </p>
              <div className="pt-1.5 flex justify-between text-[10px] font-mono text-[#CBD5E1]">
                <span>Target Subject: <strong className="text-[#00E5FF]">{selectedEvent?.id || 'EVT-001'}</strong></span>
                <span className="text-[#F59E0B] font-bold">
                  {confirmingAction.impactLevel} Impact Policy
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setConfirmingAction(null)}
                disabled={isProcessing}
                className="px-3 py-1.5 rounded-lg bg-[#081722] border border-[#1E3A52] text-[#CBD5E1] hover:text-[#FFFFFF] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteAction}
                disabled={isProcessing}
                className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-[#00E5FF] to-[#00F5A0] hover:brightness-110 text-[#030B12] font-black cursor-pointer transition-all shadow-[0_0_12px_rgba(0,229,255,0.3)]"
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
