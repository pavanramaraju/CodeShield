'use client';

import React, { useState } from 'react';
import { X, Zap, Cpu, Atom, ShieldCheck, RefreshCw, CheckCircle2 } from 'lucide-react';
import { SecurityEventItem } from '@/types';

interface SimulateEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEventCreated: (event: SecurityEventItem) => void;
}

export function SimulateEventModal({ isOpen, onClose, onEventCreated }: SimulateEventModalProps) {
  const [vector, setVector] = useState('Quantum Tunnel Anomaly');
  const [target, setTarget] = useState('API Gateway Ingress');
  const [simIp, setSimIp] = useState('185.220.101.44');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simStage, setSimStage] = useState<'idle' | 'ml' | 'quantum' | 'defense'>('idle');
  const [resultEvent, setResultEvent] = useState<SecurityEventItem | null>(null);

  if (!isOpen) return null;

  const handleStartSimulation = () => {
    setIsSimulating(true);
    setSimStage('ml');
    setResultEvent(null);

    setTimeout(() => {
      setSimStage('quantum');
      setTimeout(() => {
        setSimStage('defense');
        setTimeout(() => {
          setIsSimulating(false);
          const newId = `EVT-${Math.floor(100 + Math.random() * 900)}`;
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

          const created: SecurityEventItem = {
            id: newId,
            username: `sim_operator_${Math.floor(Math.random() * 99)}`,
            targetService: target,
            category: vector,
            status: 'high-risk',
            timestamp: timeStr,
            riskScore: Math.floor(82 + Math.random() * 16),
            quantumFidelity: Number((0.97 + Math.random() * 0.02).toFixed(3)),
            classicalConfidence: 0.78,
            ipAddress: simIp,
            location: 'Simulated Sandbox Mesh',
            mitigationAction: 'Zero-trust perimeter rule deployed: Node quarantined',
          };

          setResultEvent(created);
          onEventCreated(created);
        }, 800);
      }, 900);
    }, 700);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020A10]/85 backdrop-blur-md animate-in fade-in duration-150 select-none"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-[#0A1C26] rounded-3xl w-full max-w-xl p-6 border border-[#193543] shadow-2xl shadow-[#020A10] relative"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#193543]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#00E6C3]/15 text-[#00E6C3] border border-[#00E6C3]/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-[#00E6C3]" />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#F4F8FC]">
                Simulate Security Event
              </h3>
              <p className="text-xs text-[#A8BBC8]">
                Inject synthetic cyber anomaly into classical + quantum pipeline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-[#07141D] border border-[#193543] flex items-center justify-center text-[#A8BBC8] hover:text-[#F4F8FC] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Configuration Form */}
        <div className="space-y-4 py-4 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-[#A8BBC8] uppercase tracking-wider mb-1.5">
              Anomaly Vector Type
            </label>
            <select
              value={vector}
              onChange={(e) => setVector(e.target.value)}
              className="w-full p-2.5 rounded-xl bg-[#07141D] border border-[#193543] text-xs text-[#F4F8FC] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00E6C3]"
            >
              <option value="Quantum Tunnel Anomaly">Quantum Tunnel Anomaly (High Risk)</option>
              <option value="Encrypted Credential Stuffing">Encrypted Credential Stuffing (High Risk)</option>
              <option value="Zero-Day Exfiltration Burst">Zero-Day Exfiltration Burst (Critical)</option>
              <option value="Reconnaissance Port Sweep">Reconnaissance Port Sweep (Medium)</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-semibold text-[#A8BBC8] uppercase tracking-wider mb-1.5">
                Target Endpoint
              </label>
              <select
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#07141D] border border-[#193543] text-xs text-[#F4F8FC] font-semibold focus:outline-none focus:ring-1 focus:ring-[#00E6C3]"
              >
                <option value="API Gateway Ingress">API Gateway Ingress</option>
                <option value="Auth SSO Portal">Auth SSO Portal</option>
                <option value="Vault Key DB">Vault Key DB</option>
                <option value="Kubernetes Core Node">Kubernetes Core Node</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-[#A8BBC8] uppercase tracking-wider mb-1.5">
                Synthetic Ingress IP
              </label>
              <input
                type="text"
                value={simIp}
                onChange={(e) => setSimIp(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-[#07141D] border border-[#193543] font-mono text-xs text-[#F4F8FC] focus:outline-none focus:ring-1 focus:ring-[#00E6C3]"
              />
            </div>
          </div>

          {/* Simulation Progress Stages */}
          {isSimulating && (
            <div className="p-3.5 rounded-2xl bg-[#07141D] border border-[#193543] space-y-2">
              <span className="text-[10px] font-bold text-[#A8BBC8] uppercase tracking-wider block">
                Pipeline Execution Status
              </span>
              <div className="flex items-center gap-2 text-xs">
                {simStage === 'ml' && (
                  <div className="flex items-center gap-2 text-[#38D9FF] font-semibold animate-pulse">
                    <Cpu className="w-4 h-4" />
                    <span>Stage 2: Evaluating Classical ML XGBoost screening...</span>
                  </div>
                )}
                {simStage === 'quantum' && (
                  <div className="flex items-center gap-2 text-[#00E6C3] font-semibold animate-pulse">
                    <Atom className="w-4 h-4 animate-spin" />
                    <span>Stage 3: Running Qiskit QSVM quantum state map on IBM Eagle...</span>
                  </div>
                )}
                {simStage === 'defense' && (
                  <div className="flex items-center gap-2 text-[#00E6C3] font-semibold animate-pulse">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Stage 4: Enforcing automated perimeter defense policy...</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Completed Feedback */}
          {resultEvent && (
            <div className="p-3.5 rounded-2xl bg-[#00E6C3]/10 border border-[#00E6C3]/30 text-xs space-y-1.5">
              <div className="flex items-center gap-2 text-[#00E6C3] font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Simulation Completed & Logged: {resultEvent.id}</span>
              </div>
              <div className="text-[#A8BBC8] leading-relaxed">
                Risk Score: <strong className="text-[#FF626B]">{resultEvent.riskScore}/100</strong> · Quantum Fidelity: <strong className="text-[#00E6C3]">{(resultEvent.quantumFidelity * 100).toFixed(1)}%</strong>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#193543]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-[#A8BBC8] hover:text-[#F4F8FC] cursor-pointer"
          >
            Close
          </button>

          <button
            onClick={handleStartSimulation}
            disabled={isSimulating}
            className="px-5 py-2.5 rounded-xl bg-[#00E6C3] hover:bg-[#38D9FF] text-[#020A10] font-bold text-xs shadow-md shadow-[#00E6C3]/20 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isSimulating ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Injecting Telemetry...</span>
              </>
            ) : (
              <>
                <Zap className="w-3.5 h-3.5 fill-[#020A10]" />
                <span>Run Anomaly Simulation</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
