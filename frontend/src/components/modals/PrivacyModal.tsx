'use client';

import React, { useEffect } from 'react';
import { X, Lock, ShieldCheck } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PrivacyModal({ isOpen, onClose }: PrivacyModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="privacy-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020A10]/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#0A1C26] rounded-3xl w-full max-w-lg p-6 border border-[#193543] shadow-2xl shadow-[#020A10] relative select-none max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4 border-b border-[#193543]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#00E6C3]/15 text-[#00E6C3] border border-[#00E6C3]/30 flex items-center justify-center">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <h2 id="privacy-title" className="text-base font-bold text-[#F4F8FC]">
                Q-SHIELD Privacy Policy
              </h2>
              <p className="text-[11px] text-[#A8BBC8]">Cryptographic & Telemetry Data Protection</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-[#07141D] border border-[#193543] flex items-center justify-center text-[#A8BBC8] hover:text-[#F4F8FC] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="py-4 space-y-3.5 text-xs text-[#A8BBC8] leading-relaxed">
          <p>
            Q-SHIELD operates under strict zero-trust confidentiality. All captured network
            flows are hashed and sanitized before transmission to the quantum feature mapping pipeline.
          </p>

          <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543] space-y-1.5">
            <div className="font-semibold text-[#F4F8FC] flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#00E6C3]" />
              <span>Telemetry Protection Standards</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-[#A8BBC8]">
              <li><strong>Zero Plaintext Storage:</strong> Payloads are vectorized on local edge sensors.</li>
              <li><strong>Ephemeral Sessions:</strong> Authentication tokens expire automatically after inactivity.</li>
              <li><strong>Post-Quantum Encryption:</strong> Transport secured via CRYSTALS-Kyber key exchange.</li>
              <li><strong>Audited Access:</strong> Forensic logs maintain immutable tamper-evident cryptographic hashes.</li>
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-end pt-3 border-t border-[#193543]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00E6C3] hover:bg-[#38D9FF] text-[#020A10] shadow-md shadow-[#00E6C3]/20 transition-colors cursor-pointer"
          >
            I Understand
          </button>
        </div>
      </div>
    </div>
  );
}
