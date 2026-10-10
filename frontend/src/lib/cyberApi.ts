/**
 * Q-SHIELD Backend API Client
 * Seamlessly interfaces with the FastAPI backend (/api/*)
 * and provides robust fallback to verified demo data when disconnected.
 */

export interface CyberApiHealth {
  status: string;
  service: string;
  message: string;
}

export interface BackendEventSummary {
  total_events: number;
  risk_distribution: {
    LOW: number;
    MEDIUM: number;
    HIGH: number;
    CRITICAL: number;
  };
  verification_distribution: {
    unverified: number;
    verified: number;
    flagged: number;
    dismissed: number;
  };
  average_risk_score: number;
  quantum_pending_count: number;
  simulated_actions_count: number;
  recent_events: BackendEventItem[];
}

export interface BackendEventItem {
  event_id: string;
  timestamp: string;
  features: {
    source_ip: string;
    destination_ip?: string;
    protocol?: string;
    packet_rate?: number;
    failed_logins?: number;
    payload_entropy?: number;
    port?: number;
    request_rate?: number;
    encryption_anomalies?: boolean;
    [key: string]: string | number | boolean | undefined;
  };
  classical_risk_score: number;
  quantum_status: string;
  quantum_result?: {
    status?: string;
    circuit_executed?: boolean;
    qubit_count?: number;
    shots?: number;
    circuit_depth?: number;
    encoded_features?: number[];
    counts?: Record<string, number>;
    statistic_name?: string;
    statistic_description?: string;
    quantum_measurement_statistic?: number;
    ground_state_probability?: number;
    disclaimer?: string;
    error_message?: string | null;
  };
  final_risk: number;
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reasons: string[];
  verification_status: string;
  defense_actions: Array<{
    action_id: string;
    timestamp: string;
    action_type: string;
    status: string;
    details: string;
  }>;
  timeline: Array<{
    timestamp: string;
    stage: string;
    action: string;
    details: string;
  }>;
}

class CyberApiClient {
  private isOnlineCache: boolean | null = null;
  private lastCheckTime = 0;

  async checkHealth(): Promise<{ isOnline: boolean; health?: CyberApiHealth }> {
    const now = Date.now();
    // Cache health check for 5 seconds to prevent spam
    if (this.isOnlineCache !== null && now - this.lastCheckTime < 5000) {
      return { isOnline: this.isOnlineCache };
    }

    try {
      const res = await fetch('/api/health', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(3000),
      });

      if (res.ok) {
        const data = (await res.json()) as CyberApiHealth;
        this.isOnlineCache = true;
        this.lastCheckTime = now;
        return { isOnline: true, health: data };
      }
    } catch {
      // Backend not reachable
    }

    this.isOnlineCache = false;
    this.lastCheckTime = now;
    return { isOnline: false };
  }

  async getDashboardSummary(): Promise<BackendEventSummary | null> {
    try {
      const res = await fetch('/api/dashboard/summary', {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        return (await res.json()) as BackendEventSummary;
      }
    } catch {
      // fallback
    }
    return null;
  }

  async listEvents(limit = 50): Promise<BackendEventItem[] | null> {
    try {
      const res = await fetch(`/api/events?limit=${limit}`, {
        method: 'GET',
        headers: { Accept: 'application/json' },
        signal: AbortSignal.timeout(4000),
      });
      if (res.ok) {
        return (await res.json()) as BackendEventItem[];
      }
    } catch {
      // fallback
    }
    return null;
  }

  async simulateEvent(scenario: string, customFeatures?: Record<string, string | number | boolean>): Promise<BackendEventItem | null> {
    try {
      const res = await fetch('/api/events/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ scenario, features: customFeatures }),
        signal: AbortSignal.timeout(8000),
      });
      if (res.ok) {
        return (await res.json()) as BackendEventItem;
      }
    } catch {
      // fallback
    }
    return null;
  }

  async verifyEvent(eventId: string, verification_status: string, notes?: string): Promise<BackendEventItem | null> {
    try {
      const res = await fetch(`/api/events/${eventId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ verification_status, notes: notes || 'Verified by SOC Analyst' }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        return (await res.json()) as BackendEventItem;
      }
    } catch {
      // fallback
    }
    return null;
  }

  async respondToEvent(eventId: string, action_type: string, details?: string): Promise<BackendEventItem | null> {
    try {
      const res = await fetch(`/api/events/${eventId}/respond`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ action_type, details: details || 'Adaptive zero-trust policy triggered' }),
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        return (await res.json()) as BackendEventItem;
      }
    } catch {
      // fallback
    }
    return null;
  }
}

export const cyberApi = new CyberApiClient();
