export type UserRole = 'admin' | 'analyst' | 'user';

export type ActiveTab =
  | 'overview'
  | 'live-threat-monitor'
  | 'monitoring' // alias
  | 'security-events'
  | 'events' // alias
  | 'risk-analysis'
  | 'ai-analysis' // alias
  | 'quantum-analysis'
  | 'defense-policies'
  | 'attack-timeline'
  | 'reports'
  | 'settings';

export type TimeRange = '15m' | '1h' | '24h' | '7d' | 'all' | 'live';

export interface KPIMetrics {
  threatsDetected: number;
  threatsGrowth: string;
  accessibleNetworksError: string;
  eventsAnalyzed: number;
  anomalyRate: string;
  modelConfidence: number;
  quantumVerificationRate: number;
  highRiskCount?: number;
  quantumProcessedCount?: number;
  protectedSessionsCount?: number;
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
  device?: string;
  investigationStatus?: 'Open' | 'Investigating' | 'Contained' | 'Resolved';
  reasons?: string[];
  quantumStatus?: string;
}

export interface TrafficPoint {
  time: string;
  traffic: number;
  baseline: number;
  lowRisk?: number;
  mediumRisk?: number;
  highRisk?: number;
  critical?: number;
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
  counts?: Record<string, number>;
  statisticName?: string;
  statisticValue?: number;
}
