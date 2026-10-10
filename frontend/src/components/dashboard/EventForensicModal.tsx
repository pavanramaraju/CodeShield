'use client';

import React from 'react';
import { SecurityEventItem } from '@/types';
import { X, ShieldAlert, Shield } from 'lucide-react';

interface EventForensicModalProps {
  event: SecurityEventItem | null;
  isOpen: boolean;
  onClose: () => void;
  onTriggerQuantumVerification?: (event: SecurityEventItem) => void;
}

export function EventForensicModal({
  event,
  isOpen,
  onClose,
  onTriggerQuantumVerification,
}: EventForensicModalProps) {
  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !event) return null;

  const isHighRisk = event.status === 'high-risk';

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020A10]/80 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0A1C26] rounded-3xl w-full max-w-xl p-6 border border-[#193543] shadow-2xl shadow-[#020A10] relative select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#193543]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isHighRisk
                  ? 'bg-[#FF626B]/15 text-[#FF626B] border border-[#FF626B]/30'
                  : 'bg-[#00E6C3]/15 text-[#00E6C3] border border-[#00E6C3]/30'
              }`}
            >
              {isHighRisk ? <ShieldAlert className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F4F8FC]">
                Event Forensic Telemetry
              </h3>
              <p className="text-xs font-mono text-[#A8BBC8]">ID: {event.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#07141D] border border-[#193543] flex items-center justify-center text-[#A8BBC8] hover:text-[#F4F8FC] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-3 py-5 text-xs">
          <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543]">
            <span className="text-[#A8BBC8] block mb-1">Target Service</span>
            <span className="font-bold text-[#F4F8FC]">{event.targetService}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543]">
            <span className="text-[#A8BBC8] block mb-1">Threat Classification</span>
            <span
              className={`font-bold ${
                isHighRisk ? 'text-[#FF626B]' : 'text-[#00E6C3]'
              }`}
            >
              {event.category}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543]">
            <span className="text-[#A8BBC8] block mb-1">Source IP & Location</span>
            <span className="font-mono text-[#F4F8FC]">
              {event.ipAddress} ({event.location})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543]">
            <span className="text-[#A8BBC8] block mb-1">Risk Score</span>
            <span className="font-bold text-sm text-[#FF626B]">{event.riskScore} / 100</span>
          </div>

          <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543]">
            <span className="text-[#A8BBC8] block mb-1">Classical ML Confidence</span>
            <span className="font-bold text-[#F4F8FC]">
              {(event.classicalConfidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543]">
            <span className="text-[#A8BBC8] block mb-1">Quantum State Fidelity</span>
            <span className="font-bold text-[#00E6C3]">
              {(event.quantumFidelity * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Mitigation action */}
        <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543] text-xs mb-5">
          <div className="font-bold text-[#F4F8FC] mb-1">Enforced Defense Policy</div>
          <div className="text-[#A8BBC8]">{event.mitigationAction}</div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#193543]">
          <div className="flex items-center gap-2">
            {/* Quarantine Node Action */}
            <button
              onClick={() => {
                alert(`Node ${event.ipAddress} (${event.targetService}) successfully quarantined from zero-trust mesh.`);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#FF626B]/50 text-[#FF626B] bg-[#FF626B]/10 hover:bg-[#FF626B]/20 transition-colors cursor-pointer"
            >
              Quarantine Node
            </button>

            {/* Export JSON Payload */}
            <button
              onClick={() => {
                const blob = new Blob([JSON.stringify(event, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `forensic_event_${event.id}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              aria-label="Export forensic telemetry JSON"
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#193543] bg-[#07141D] text-[#F4F8FC] hover:bg-[#0E2431] transition-colors cursor-pointer"
            >
              Export JSON
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-[#A8BBC8] hover:text-[#F4F8FC] hover:bg-[#07141D] transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onTriggerQuantumVerification?.(event);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00E6C3] hover:bg-[#38D9FF] text-[#020A10] transition-all shadow-md shadow-[#00E6C3]/20 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E6C3]"
            >
              Run Qiskit Verification Circuit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
