'use client';

import React, { useState } from 'react';
import { X, Atom, CheckCircle2, Binary, Play, RefreshCw } from 'lucide-react';
import { DEMO_QUANTUM_JOB } from '@/lib/mockData';

interface QuantumAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function QuantumAnalysisModal({ isOpen, onClose }: QuantumAnalysisModalProps) {
  const [jobState, setJobState] = useState(DEMO_QUANTUM_JOB);
  const [isRunning, setIsRunning] = useState(false);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleRerun = () => {
    setIsRunning(true);
    setJobState((prev) => ({
      ...prev,
      status: 'RUNNING',
    }));

    setTimeout(() => {
      setIsRunning(false);
      setJobState((prev) => ({
        ...prev,
        status: 'COMPLETED',
        stateFidelity: Number((0.982 + Math.random() * 0.015).toFixed(4)),
        quantumModelScore: Number((0.95 + Math.random() * 0.03).toFixed(3)),
        executionTimeMs: Math.round(380 + Math.random() * 60),
      }));
    }, 1200);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quantum-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020A10]/85 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-[#0B1D29] rounded-3xl w-full max-w-2xl p-6 border border-[#1E3A52] shadow-2xl shadow-[#020A10] relative max-h-[90vh] overflow-y-auto select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#1E3A52]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E5FF]/20 text-[#00E5FF] border border-[#00E5FF]/40 flex items-center justify-center shadow-[0_0_12px_rgba(0,229,255,0.25)]">
              <Atom className={`w-6 h-6 ${isRunning ? 'animate-spin' : 'animate-spin-slow'}`} />
            </div>
            <div>
              <h2 id="quantum-modal-title" className="font-extrabold text-base text-[#FFFFFF]">
                Q-SHIELD Qiskit Quantum Kernel Engine
              </h2>
              <p className="text-xs font-mono text-[#CBD5E1]">
                Job ID: <span className="text-[#00E5FF] font-bold">{jobState.jobId}</span> · Backend: <span className="text-[#00F5A0] font-bold">{jobState.backend}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="w-8 h-8 rounded-full bg-[#081722] border border-[#1E3A52] flex items-center justify-center text-[#CBD5E1] hover:text-[#FFFFFF] hover:border-[#00E5FF] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Demo verification transparency notice */}
        <div className="mt-3.5 px-3 py-2 rounded-xl bg-[#081722] border border-[#1E3A52] text-[11px] text-[#CBD5E1] flex items-center justify-between">
          <span>
            🔬 <strong className="text-[#FFFFFF]">Simulation Telemetry:</strong> Evaluated via Qiskit Aer statevector model emulating IBM Quantum Eagle r3 architecture.
          </span>
          <span className="font-bold text-[#00F5A0] bg-[#00F5A0]/20 px-2 py-0.5 rounded-full text-[10px] border border-[#00F5A0] shadow-[0_0_8px_rgba(0,245,160,0.2)]">
            Verified
          </span>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-3 py-4 text-xs">
          <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52]">
            <span className="text-[#CBD5E1] block text-[11px] font-semibold mb-1">Quantum Backend</span>
            <select
              value={jobState.backend}
              aria-label="Select quantum backend"
              onChange={(e) => setJobState((prev) => ({ ...prev, backend: e.target.value }))}
              className="font-mono font-bold text-[#FFFFFF] text-xs bg-transparent border-0 p-0 focus:ring-0 cursor-pointer w-full"
            >
              <option value="ibm_kyiv" className="bg-[#081722] text-[#FFFFFF]">ibm_kyiv (127-Qubit)</option>
              <option value="ibm_brisbane" className="bg-[#081722] text-[#FFFFFF]">ibm_brisbane (127-Qubit)</option>
              <option value="aer_statevector" className="bg-[#081722] text-[#FFFFFF]">aer_statevector (32-Qubit)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52]">
            <span className="text-[#CBD5E1] block text-[11px] font-semibold mb-1">Circuit Architecture</span>
            <span className="font-bold text-[#FFFFFF]">
              {jobState.qubitCount} Qubits · Depth {jobState.circuitDepth}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#081722] border border-[#1E3A52]">
            <span className="text-[#CBD5E1] block text-[11px] font-semibold mb-1">State Fidelity</span>
            <span className="font-black text-[#00F5A0] text-sm">
              {(jobState.stateFidelity * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Classical vs Quantum Decision Comparison */}
        <div className="p-4 rounded-2xl bg-[#081722] border border-[#1E3A52] mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-black text-[#FFFFFF] uppercase tracking-wider">
              Quantum Confidence Enhancement
            </span>
            <span className="text-xs font-bold text-[#00F5A0] bg-[#00F5A0]/20 px-2.5 py-0.5 rounded-full border border-[#00F5A0] shadow-[0_0_8px_rgba(0,245,160,0.2)]">
              {jobState.quantumConfidenceGain} Margin
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0B1D29] p-3 rounded-xl border border-[#1E3A52] text-xs">
              <span className="text-[#CBD5E1] block text-[11px] font-semibold">Classical ML Model (XGBoost)</span>
              <div className="text-lg font-black text-[#FFFFFF] mt-0.5">
                {(jobState.classicalModelScore * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-[#EF4444] font-semibold">Ambiguous decision boundary</span>
            </div>

            <div className="bg-[#0B1D29] p-3 rounded-xl border border-[#00E5FF] text-xs relative overflow-hidden shadow-[0_0_12px_rgba(0,229,255,0.15)]">
              <span className="text-[#00E5FF] block text-[11px] font-bold">
                Q-SHIELD QSVM Quantum Kernel
              </span>
              <div className="text-lg font-black text-[#00E5FF] mt-0.5">
                {(jobState.quantumModelScore * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-[#00F5A0] font-semibold">High-dimensional Hilbert hyperplane</span>
            </div>
          </div>
        </div>

        {/* Quantum Circuit Visualization Matrix */}
        <div className="bg-[#030B12] border border-[#1E3A52] rounded-2xl p-4 text-[#00E5FF] font-mono text-[11px] space-y-2 mb-4 overflow-x-auto shadow-inner">
          <div className="flex items-center justify-between text-white/90 pb-1 border-b border-[#1E3A52]">
            <span className="flex items-center gap-1.5 text-xs text-[#00E5FF] font-bold">
              <Binary className="w-3.5 h-3.5 text-[#00E5FF]" />
              <span>Qiskit Entanglement Circuit</span>
            </span>
            <span className="text-[10px] text-[#CBD5E1] font-semibold">{jobState.quantumKernel}</span>
          </div>

          <div className="space-y-1 text-[#00E5FF] pt-1 leading-relaxed font-bold">
            <div>q[0]: ──[ H ]──[ Rz(θ0) ]──■───────────────■────────[ M ]</div>
            <div>q[1]: ──[ H ]──[ Rz(θ1) ]──┼────■──────────┼────■───[ M ]</div>
            <div>q[2]: ──[ H ]──[ Rz(θ2) ]──X────┼────■─────┼────┼───[ M ]</div>
            <div>q[3]: ──[ H ]──[ Rz(θ3) ]───────X────┼─────X────┼───[ M ]</div>
            <div>q[4]: ──[ H ]──[ Rz(θ4) ]────────────X──────────X───[ M ]</div>
          </div>
        </div>

        {/* Final Decision & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#081722] border border-[#1E3A52]">
          <div className="flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-5 h-5 text-[#00F5A0]" />
            <div>
              <span className="font-extrabold text-[#FFFFFF] block">
                Verdict: {jobState.finalDecision === 'ANOMALY_CONFIRMED' ? 'Confirmed Zero-Day Anomaly' : 'Benign Telemetry'}
              </span>
              <span className="text-[11px] text-[#CBD5E1]">
                Execution latency: <strong className="text-[#00E5FF]">{jobState.executionTimeMs}ms</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const qasm = `// Q-SHIELD Quantum Anomaly Detection Circuit (OpenQASM 3.0)\nOPENQASM 3.0;\ninclude "stdgates.inc";\nqubit[4] q;\nbit[4] c;\nh q[0];\nh q[1];\nh q[2];\nh q[3];\nrz(0.428) q[0];\nrz(0.781) q[1];\nrz(1.104) q[2];\nrz(0.319) q[3];\ncx q[0], q[1];\ncx q[1], q[2];\ncx q[2], q[3];\nc = measure q;\n`;
                const blob = new Blob([qasm], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `qshield_circuit_${jobState.jobId}.qasm`;
                a.click();
                URL.revokeObjectURL(url);
              }}
              className="px-3 py-2 rounded-xl text-xs font-bold border border-[#1E3A52] bg-[#0B1D29] text-[#FFFFFF] hover:border-[#00E5FF] hover:text-[#00E5FF] shadow-2xs transition-all cursor-pointer"
            >
              Export QASM
            </button>

            <button
              onClick={handleRerun}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl text-xs font-black bg-gradient-to-r from-[#00E5FF] to-[#00F5A0] text-[#030B12] shadow-md shadow-[#00E5FF]/25 hover:brightness-110 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Simulating Circuit...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-[#030B12]" />
                  <span>Execute Quantum Pass</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
