'use client';

import React, { useEffect } from 'react';
import { X, Shield, Award } from 'lucide-react';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AboutModal({ isOpen, onClose }: AboutModalProps) {
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
      aria-labelledby="about-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020A10]/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#0A1C26] rounded-3xl w-full max-w-lg p-6 border border-[#193543] shadow-2xl shadow-[#020A10] relative select-none max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#193543]">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E6C3] to-[#0F766E] flex items-center justify-center text-[#020A10] shadow-md shadow-[#00E6C3]/20">
              <Shield className="w-5 h-5 fill-[#020A10] text-[#020A10]" />
            </div>
            <div>
              <h2 id="about-title" className="text-base font-bold text-[#F4F8FC]">
                About Q-SHIELD
              </h2>
              <p className="text-[11px] text-[#00E6C3] font-mono">Version 2.4-Production</p>
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

        {/* Content */}
        <div className="py-4 space-y-4 text-xs text-[#A8BBC8]">
          <p className="leading-relaxed">
            <strong className="text-[#F4F8FC]">Q-SHIELD</strong> is a next-generation
            cyber anomaly detection operations center built to fuse classical machine learning
            heuristics with Qiskit quantum kernel classifiers (QSVM).
          </p>

          <div className="p-3.5 rounded-xl bg-[#07141D] border border-[#193543] space-y-2">
            <div className="flex items-center gap-2 font-semibold text-[#F4F8FC]">
              <Award className="w-4 h-4 text-[#00E6C3]" />
              <span>Key Architectural Specifications</span>
            </div>
            <ul className="list-disc pl-5 space-y-1 text-[11px] text-[#A8BBC8]">
              <li>Quantum Backend: IBM Quantum Falcon & Eagle r3 simulation targets.</li>
              <li>Kernel Feature Map: ZZFeatureMap (2 reps, full entanglement).</li>
              <li>Throughput: Up to 250k ingress packets/sec analyzed with sub-10ms latency.</li>
              <li>Compliance: NIST Post-Quantum Cryptography FIPS 203/204 alignment.</li>
            </ul>
          </div>

          <div className="text-[11px] text-[#5A7382]">
            Engineering Lead: Nikhil Guptha · Developed for CodeShield Cyber Defense.
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-[#193543]">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00E6C3] hover:bg-[#38D9FF] text-[#020A10] shadow-md shadow-[#00E6C3]/20 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
