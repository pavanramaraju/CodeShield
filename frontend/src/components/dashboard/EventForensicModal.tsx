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
        className="bg-[#0B1D29] rounded-3xl w-full max-w-xl p-6 border border-[#1E3A52] shadow-2xl shadow-[#020A10] relative select-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E3A52]">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isHighRisk
                  ? 'bg-[#EF4444]/20 text-[#EF4444] border border-[#EF4444]'
                  : 'bg-[#00F5A0]/20 text-[#00F5A0] border border-[#00F5A0]'
              }`}
            >
              {isHighRisk ? <ShieldAlert className="w-5 h-5" /> : <Shield className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base text-[#FFFFFF]">
                Event Forensic Telemetry
              </h3>
              <p className="text-xs font-mono text-[#00E5FF] font-bold">ID: {event.id}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#081722] border border-[#1E3A52] flex items-center justify-center text-[#CBD5E1] hover:text-[#FFFFFF] hover:border-[#00E5FF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-2 gap-3 py-5 text-xs">
          <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52]">
            <span className="text-[#CBD5E1] block mb-1 font-semibold">Target Service</span>
            <span className="font-bold text-[#FFFFFF]">{event.targetService}</span>
          </div>

          <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52]">
            <span className="text-[#CBD5E1] block mb-1 font-semibold">Threat Classification</span>
            <span
              className={`font-bold ${
                isHighRisk ? 'text-[#EF4444]' : 'text-[#00F5A0]'
              }`}
            >
              {event.category}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52]">
            <span className="text-[#CBD5E1] block mb-1 font-semibold">Source IP & Location</span>
            <span className="font-mono text-[#FFFFFF]">
              {event.ipAddress} ({event.location})
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52]">
            <span className="text-[#CBD5E1] block mb-1 font-semibold">Risk Score</span>
            <span className="font-extrabold text-sm text-[#EF4444]">{event.riskScore} / 100</span>
          </div>

          <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52]">
            <span className="text-[#CBD5E1] block mb-1 font-semibold">Classical ML Confidence</span>
            <span className="font-bold text-[#FFFFFF]">
              {(event.classicalConfidence * 100).toFixed(1)}%
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52]">
            <span className="text-[#CBD5E1] block mb-1 font-semibold">Quantum State Fidelity</span>
            <span className="font-extrabold text-[#00F5A0]">
              {(event.quantumFidelity * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Mitigation action */}
        <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52] text-xs mb-5">
          <div className="font-bold text-[#FFFFFF] mb-1">Enforced Defense Policy</div>
          <div className="text-[#E2E8F0]">{event.mitigationAction}</div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#1E3A52]">
          <div className="flex items-center gap-2">
            {/* Quarantine Node Action */}
            <button
              onClick={() => {
                alert(`Node ${event.ipAddress} (${event.targetService}) successfully quarantined from zero-trust mesh.`);
              }}
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#EF4444] text-[#EF4444] bg-[#EF4444]/20 hover:bg-[#EF4444]/30 transition-colors cursor-pointer"
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
              className="px-3 py-1.5 rounded-xl text-xs font-bold border border-[#1E3A52] bg-[#081722] text-[#FFFFFF] hover:border-[#00E5FF] hover:text-[#00E5FF] transition-colors cursor-pointer"
            >
              Export JSON
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-[#CBD5E1] hover:text-[#FFFFFF] hover:bg-[#081722] transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              onClick={() => {
                onTriggerQuantumVerification?.(event);
                onClose();
              }}
              className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#00E5FF] to-[#00F5A0] text-[#030B12] hover:brightness-110 transition-all shadow-md shadow-[#00E5FF]/30 cursor-pointer"
            >
              Run Qiskit Verification Circuit
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
