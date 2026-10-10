export type UserRole = 'admin' | 'analyst' | 'user';

export type ActiveTab = 'overview' | 'monitoring' | 'events' | 'ai-analysis' | 'quantum-analysis' | 'reports' | 'settings';

export type TimeRange = 'live' | '24h' | '7d';

export interface KPIMetrics {
  threatsDetected: number;
  threatsGrowth: string;
  accessibleNetworksError: string;
  eventsAnalyzed: number;
  anomalyRate: string;
  modelConfidence: number;
  quantumVerificationRate: number;
}

export interface SecurityEventItem {
  id: string;
  username: string;
  targetService: string;
  category: string;
  status: 'safe' | 'suspicious' | 'high-risk';
  timestamp: string;
  riskScore: number;
  quantumFidelity: number;
  classicalConfidence: number;
  ipAddress: string;
  location: string;
  mitigationAction: string;
}

export interface TrafficPoint {
  time: string;
  traffic: number;
  baseline: number;
  anomalyFlag?: boolean;
  anomalyValue?: string;
  anomalyLabel?: string;
}

export interface ThreatCategoryStat {
  name: string;
  count: number;
  percentage: number;
  riskLevel: 'high' | 'medium' | 'low';
}

export interface QuantumJobDetails {
  jobId: string;
  status: 'COMPLETED' | 'RUNNING' | 'QUEUED';
  backend: string;
  qubitCount: number;
  circuitDepth: number;
  quantumKernel: string;
  stateFidelity: number;
  classicalModelScore: number;
  quantumModelScore: number;
  quantumConfidenceGain: string;
  finalDecision: 'ANOMALY_CONFIRMED' | 'BENIGN_VERIFIED';
  executionTimeMs: number;
}
