'use client';

import React, { useEffect } from 'react';
import { X, Atom, ShieldCheck, Cpu, Network, Check } from 'lucide-react';

interface FeaturesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreDashboard: () => void;
}

export function FeaturesModal({ isOpen, onClose, onExploreDashboard }: FeaturesModalProps) {
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

  const features = [
    {
      icon: <Atom className="w-5 h-5 text-[#00E6C3]" />,
      title: 'Qiskit Quantum Kernel (QSVM)',
      description:
        'Projects encrypted telemetry into high-dimensional Hilbert spaces using ZZFeatureMap circuits to identify zero-day polymorphic attack patterns classical ML misses.',
      badge: 'Quantum Hardware Ready',
    },
    {
      icon: <Cpu className="w-5 h-5 text-[#38D9FF]" />,
      title: 'Sub-Millisecond Classical ML Ensemble',
      description:
        'Dual XGBoost and Random Forest classifiers process up to 250,000 network flows per second at edge gateway ingress points with 99.65% baseline confidence.',
      badge: '99.65% Baseline',
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-[#00E6C3]" />,
      title: 'Post-Quantum Zero-Trust Enclaves',
      description:
        'Enforces cryptographic authentication via CRYSTALS-Kyber and Dilithium signatures, guarding sensitive government and corporate infrastructure against harvest-now-decrypt-later.',
      badge: 'NIST Standardized',
    },
    {
      icon: <Network className="w-5 h-5 text-[#38D9FF]" />,
      title: 'Global SOC Sensor Mesh',
      description:
        '14 distributed monitoring pods across Frankfurt, Zurich, Tokyo, and Virginia streaming telemetry continuously to the central Q-SHIELD analysis node.',
      badge: '14 Active Pods',
    },
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="features-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020A10]/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#0A1C26] rounded-3xl w-full max-w-2xl p-6 border border-[#193543] shadow-2xl shadow-[#020A10] relative select-none max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#193543]">
          <div>
            <h2 id="features-title" className="text-lg font-bold text-[#F4F8FC]">
              Q-SHIELD Platform Features
            </h2>
            <p className="text-xs text-[#A8BBC8] mt-0.5">
              Quantum-classical hybrid cybersecurity architecture specifications.
            </p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-[#07141D] border border-[#193543] flex items-center justify-center text-[#A8BBC8] hover:text-[#F4F8FC] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E6C3]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-5">
          {features.map((feat, idx) => (
            <div
              key={idx}
              className="p-4 rounded-2xl bg-[#07141D] border border-[#193543] flex flex-col justify-between hover:border-[#00E6C3]/40 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="w-8 h-8 rounded-xl bg-[#0A1C26] border border-[#193543] flex items-center justify-center shadow-xs">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] font-semibold text-[#00E6C3] bg-[#00E6C3]/15 border border-[#00E6C3]/30 px-2 py-0.5 rounded-full">
                    {feat.badge}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-[#F4F8FC] mb-1">
                  {feat.title}
                </h3>
                <p className="text-xs text-[#A8BBC8] leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#193543]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#A8BBC8] hover:text-[#F4F8FC] hover:bg-[#07141D] transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            onClick={() => {
              onClose();
              onExploreDashboard();
            }}
            className="px-5 py-2 rounded-xl text-xs font-bold bg-[#00E6C3] hover:bg-[#38D9FF] text-[#020A10] shadow-md shadow-[#00E6C3]/20 transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Explore Live Dashboard</span>
            <Check className="w-3.5 h-3.5 stroke-[3]" />
          </button>
        </div>
      </div>
    </div>
  );
}
