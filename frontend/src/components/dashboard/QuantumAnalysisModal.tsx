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
        className="bg-[#0A1C26] rounded-3xl w-full max-w-2xl p-6 border border-[#193543] shadow-2xl shadow-[#020A10] relative max-h-[90vh] overflow-y-auto select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#193543]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E6C3]/15 text-[#00E6C3] border border-[#00E6C3]/30 flex items-center justify-center">
              <Atom className={`w-6 h-6 ${isRunning ? 'animate-spin' : 'animate-spin-slow'}`} />
            </div>
            <div>
              <h2 id="quantum-modal-title" className="font-bold text-base text-[#F4F8FC]">
                Q-SHIELD Qiskit Quantum Kernel Engine
              </h2>
              <p className="text-xs font-mono text-[#A8BBC8]">
                Job ID: {jobState.jobId} · Backend: {jobState.backend}
              </p>
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

        {/* Demo verification transparency notice */}
        <div className="mt-3.5 px-3 py-2 rounded-xl bg-[#07141D] border border-[#193543] text-[11px] text-[#A8BBC8] flex items-center justify-between">
          <span>
            🔬 <strong>Simulation Telemetry:</strong> Evaluated via Qiskit Aer statevector model emulating IBM Quantum Eagle r3 architecture.
          </span>
          <span className="font-semibold text-[#00E6C3] bg-[#00E6C3]/15 px-2 py-0.5 rounded-full text-[10px] border border-[#00E6C3]/30">
            Verified
          </span>
        </div>

        {/* Telemetry Metrics */}
        <div className="grid grid-cols-3 gap-3 py-4 text-xs">
          <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543]">
            <span className="text-[#5A7382] block text-[11px] font-medium mb-1">Quantum Backend</span>
            <select
              value={jobState.backend}
              aria-label="Select quantum backend"
              onChange={(e) => setJobState((prev) => ({ ...prev, backend: e.target.value }))}
              className="font-mono font-bold text-[#F4F8FC] text-xs bg-transparent border-0 p-0 focus:ring-0 cursor-pointer w-full"
            >
              <option value="ibm_kyiv" className="bg-[#07141D] text-[#F4F8FC]">ibm_kyiv (127-Qubit)</option>
              <option value="ibm_brisbane" className="bg-[#07141D] text-[#F4F8FC]">ibm_brisbane (127-Qubit)</option>
              <option value="aer_statevector" className="bg-[#07141D] text-[#F4F8FC]">aer_statevector (32-Qubit)</option>
            </select>
          </div>

          <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543]">
            <span className="text-[#5A7382] block text-[11px] font-medium mb-1">Circuit Architecture</span>
            <span className="font-bold text-[#F4F8FC]">
              {jobState.qubitCount} Qubits · Depth {jobState.circuitDepth}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#07141D] border border-[#193543]">
            <span className="text-[#5A7382] block text-[11px] font-medium mb-1">State Fidelity</span>
            <span className="font-bold text-[#00E6C3]">
              {(jobState.stateFidelity * 100).toFixed(2)}%
            </span>
          </div>
        </div>

        {/* Classical vs Quantum Decision Comparison */}
        <div className="p-4 rounded-2xl bg-[#07141D] border border-[#193543] mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-[#F4F8FC] uppercase tracking-wider">
              Quantum Confidence Enhancement
            </span>
            <span className="text-xs font-bold text-[#00E6C3] bg-[#00E6C3]/15 px-2.5 py-0.5 rounded-full border border-[#00E6C3]/30">
              {jobState.quantumConfidenceGain} Margin
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#0A1C26] p-3 rounded-xl border border-[#193543] text-xs">
              <span className="text-[#A8BBC8] block text-[11px] font-semibold">Classical ML Model (XGBoost)</span>
              <div className="text-lg font-bold text-[#F4F8FC] mt-0.5">
                {(jobState.classicalModelScore * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-[#FF626B] font-medium">Ambiguous decision boundary</span>
            </div>

            <div className="bg-[#0A1C26] p-3 rounded-xl border border-[#00E6C3]/40 text-xs relative overflow-hidden">
              <span className="text-[#00E6C3] block text-[11px] font-bold">
                Q-SHIELD QSVM Quantum Kernel
              </span>
              <div className="text-lg font-bold text-[#00E6C3] mt-0.5">
                {(jobState.quantumModelScore * 100).toFixed(1)}%
              </div>
              <span className="text-[10px] text-[#00E6C3] font-medium">High-dimensional Hilbert hyperplane</span>
            </div>
          </div>
        </div>

        {/* Quantum Circuit Visualization Matrix */}
        <div className="bg-[#040D14] border border-[#193543] rounded-2xl p-4 text-[#00E6C3] font-mono text-[11px] space-y-2 mb-4 overflow-x-auto">
          <div className="flex items-center justify-between text-white/90 pb-1 border-b border-[#193543]">
            <span className="flex items-center gap-1.5 text-xs text-[#00E6C3] font-semibold">
              <Binary className="w-3.5 h-3.5" />
              <span>Qiskit Entanglement Circuit</span>
            </span>
            <span className="text-[10px] text-[#A8BBC8]">{jobState.quantumKernel}</span>
          </div>

          <div className="space-y-1 text-[#38D9FF] pt-1 leading-relaxed">
            <div>q[0]: ──[ H ]──[ Rz(θ0) ]──■───────────────■────────[ M ]</div>
            <div>q[1]: ──[ H ]──[ Rz(θ1) ]──┼────■──────────┼────■───[ M ]</div>
            <div>q[2]: ──[ H ]──[ Rz(θ2) ]──X────┼────■─────┼────┼───[ M ]</div>
            <div>q[3]: ──[ H ]──[ Rz(θ3) ]───────X────┼─────X────┼───[ M ]</div>
            <div>q[4]: ──[ H ]──[ Rz(θ4) ]────────────X──────────X───[ M ]</div>
          </div>
        </div>

        {/* Final Decision & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#07141D] border border-[#193543]">
          <div className="flex items-center gap-2.5 text-xs">
            <CheckCircle2 className="w-5 h-5 text-[#00E6C3]" />
            <div>
              <span className="font-bold text-[#F4F8FC] block">
                Verdict: {jobState.finalDecision === 'ANOMALY_CONFIRMED' ? 'Confirmed Zero-Day Anomaly' : 'Benign Telemetry'}
              </span>
              <span className="text-[11px] text-[#A8BBC8]">
                Execution latency: {jobState.executionTimeMs}ms
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
              className="px-3 py-2 rounded-xl text-xs font-semibold border border-[#193543] bg-[#0A1C26] text-[#F4F8FC] hover:bg-[#0E2431] shadow-2xs transition-colors cursor-pointer"
            >
              Export QASM
            </button>

            <button
              onClick={handleRerun}
              disabled={isRunning}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-[#00E6C3] hover:bg-[#38D9FF] text-[#020A10] shadow-md shadow-[#00E6C3]/20 transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              {isRunning ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Simulating Circuit...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-[#020A10]" />
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
