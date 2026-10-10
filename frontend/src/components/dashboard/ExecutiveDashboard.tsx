'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { SidebarRail } from './SidebarRail';
import { DashboardHeader } from './DashboardHeader';
import { KPICardsRow } from './KPICardsRow';
import { ThreatGlobeSection } from './ThreatGlobeSection';
import { ThreatActivityOverview } from './ThreatActivityOverview';
import { RiskAnalysisPanel } from './RiskAnalysisPanel';
import { QuantumAnalysisPanel } from './QuantumAnalysisPanel';
import { RecentSecurityEvents } from './RecentSecurityEvents';
import { AttackTimelinePanel } from './AttackTimelinePanel';
import { AdaptiveDefensePanel } from './AdaptiveDefensePanel';
import { DetectionPipelineCard } from './DetectionPipelineCard';
import { SecurityInsightsPanel } from './SecurityInsightsPanel';
import { EventForensicModal } from './EventForensicModal';
import { QuantumAnalysisModal } from './QuantumAnalysisModal';
import {
  DEMO_KPI_METRICS,
  DEMO_SECURITY_EVENTS,
} from '@/lib/mockData';
import { ActiveTab, SecurityEventItem, TimeRange, UserRole } from '@/types';
import { cyberApi } from '@/lib/cyberApi';
import {
  Globe,
  RefreshCw,
  Download,
  CheckCircle2,
  Calendar,
  Clock,
} from 'lucide-react';

interface ExecutiveDashboardProps {
  currentRole: UserRole;
  username: string;
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
  onReturnToGlobe?: () => void;
}

export function ExecutiveDashboard({
  currentRole,
  username,
  onRoleSwitch,
  onLogout,
  onReturnToGlobe,
}: ExecutiveDashboardProps) {
  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [timeRange, setTimeRange] = useState<TimeRange>('24h');
  const [selectedEnvironment, setSelectedEnvironment] = useState('Production Grid');
  const [isBackendConnected, setIsBackendConnected] = useState(false);

  // Data States
  const [eventsList, setEventsList] = useState<SecurityEventItem[]>(DEMO_SECURITY_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEventItem | null>(DEMO_SECURITY_EVENTS[0]);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isQuantumModalOpen, setIsQuantumModalOpen] = useState(false);

  // UI Feedback States
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [showGlobeSection, setShowGlobeSection] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Live Clock
  const [liveDate, setLiveDate] = useState('Oct 10, 2026');
  const [liveTime, setLiveTime] = useState('12:00:00 PM');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setLiveDate(
        now.toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      );
      setLiveTime(
        now.toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        })
      );
    };
    updateTime();
    const timer = setInterval(updateTime, 1000);
    return () => clearInterval(timer);
  }, []);

  // Poll Backend Connectivity
  useEffect(() => {
    let mounted = true;
    const checkBackend = async () => {
      const { isOnline } = await cyberApi.checkHealth();
      if (mounted) {
        setIsBackendConnected(isOnline);
      }
    };
    checkBackend();
    const interval = setInterval(checkBackend, 10000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, []);

  // Handlers
  const handleSelectEvent = (event: SecurityEventItem) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleNotificationSelect = (eventId: string) => {
    const match = eventsList.find((e) => e.id === eventId) || eventsList[0];
    setSelectedEvent(match);
    setIsEventModalOpen(true);
  };

  const handleRefreshData = async () => {
    setIsRefreshing(true);
    try {
      const { isOnline } = await cyberApi.checkHealth();
      setIsBackendConnected(isOnline);
      if (isOnline) {
        const summary = await cyberApi.getDashboardSummary();
        if (summary && summary.recent_events.length > 0) {
          // Normalize backend events
          const mapped: SecurityEventItem[] = summary.recent_events.map((be) => ({
            id: be.event_id,
            username: be.features?.source_ip || 'unknown_source',
            targetService: `Port ${be.features?.port || 443}`,
            category: be.reasons?.[0]?.split(':')[0] || 'Ingress Anomaly',
            status: be.risk_level === 'CRITICAL' ? 'high-risk' : be.risk_level === 'HIGH' ? 'high-risk' : 'suspicious',
            timestamp: new Date(be.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            riskScore: Math.round((be.final_risk || 0.5) * 100),
            quantumFidelity: be.quantum_result?.quantum_measurement_statistic || 0.965,
            classicalConfidence: 0.88,
            ipAddress: be.features?.source_ip || '198.51.100.1',
            location: 'Local Enclave',
            mitigationAction: 'Adaptive policy evaluated',
            reasons: be.reasons || [],
          }));
          setEventsList((prev) => [...mapped, ...prev]);
        }
      }
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
      setToastMessage('Security telemetry synchronized successfully.');
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      // fallback
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleExport = useCallback(() => {
    const timestamp = Date.now();
    const reportData = {
      timestamp: new Date(timestamp).toISOString(),
      role: currentRole,
      operator: username,
      metrics: DEMO_KPI_METRICS,
      totalEvents: eventsList.length,
      events: eventsList,
      backendStatus: isBackendConnected ? 'FastAPI + Qiskit 2.5.2' : 'Simulated Demo Enclave',
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qshield_audit_report_${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setToastMessage('Forensic audit report exported successfully as JSON.');
    setTimeout(() => setToastMessage(null), 3000);
  }, [currentRole, username, eventsList, isBackendConnected]);

  // Tab Filtering logic
  const handleSidebarTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (tab === 'live-threat-monitor') {
      setShowGlobeSection(true);
    } else if (tab === 'quantum-analysis') {
      setIsQuantumModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#030B12] p-2 sm:p-4 flex items-center justify-center select-none font-sans text-[#FFFFFF]">
      {/* Application Shell */}
      <div className="w-full max-w-[1540px] bg-[#081722] rounded-3xl shadow-2xl border border-[#1E3A52] flex flex-row overflow-hidden min-h-[95vh]">
        {/* Left Sidebar Navigation */}
        <SidebarRail
          activeTab={activeTab}
          onTabChange={handleSidebarTabChange}
          onLogoClick={() => setActiveTab('overview')}
          onUserClick={() => setActiveTab('settings')}
          onLogout={onLogout}
          isBackendConnected={isBackendConnected}
          username={username}
          currentRole={currentRole}
          isOpenOnMobile={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
          onOpenGlobeView={() => {
            if (onReturnToGlobe) onReturnToGlobe();
            else {
              setShowGlobeSection(true);
              setActiveTab('live-threat-monitor');
            }
          }}
        />

        {/* Main Content Workspace */}
        <div className="flex-1 flex flex-col bg-[#081722] overflow-y-auto w-full">
          {/* Top Bar Navigation */}
          <DashboardHeader
            currentRole={currentRole}
            username={username}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRoleSwitch={onRoleSwitch}
            onLogout={onLogout}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
            selectedEnvironment={selectedEnvironment}
            onEnvironmentChange={setSelectedEnvironment}
            isBackendConnected={isBackendConnected}
            onOpenEventDetail={handleNotificationSelect}
            onNavigateSettings={() => setActiveTab('settings')}
            onToggleMobileMenu={() => setIsMobileMenuOpen((prev) => !prev)}
          />

          {/* Toast Notification */}
          {toastMessage && (
            <div className="px-6 py-2.5 bg-[#00E5FF]/20 border-b border-[#00E5FF] text-xs text-[#00E5FF] font-bold flex items-center justify-between animate-in fade-in shadow-[0_0_12px_rgba(0,229,255,0.2)]">
              <span className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#00F5A0]" />
                {toastMessage}
              </span>
              <button
                onClick={() => setToastMessage(null)}
                className="text-[#CBD5E1] hover:text-[#FFFFFF] cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}

          {/* Inner Dashboard Body */}
          <div className="p-5 sm:p-6 space-y-6">
            {/* ======================================================= */}
            {/* 1. WELCOME SECTION (Section 5 of specification)        */}
            {/* ======================================================= */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl bg-[#0B1D29] border border-[#1E3A52] shadow-xl shadow-[#030B12]/50 relative overflow-hidden">
              {/* Subtle background glow */}
              <div className="absolute -right-20 -top-20 w-64 h-64 rounded-full bg-[#00E5FF]/10 blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-[#FFFFFF]">
                    Security Operations Overview
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#00E5FF]/20 border border-[#00E5FF] text-[10px] font-extrabold text-[#00E5FF] shadow-[0_0_8px_rgba(0,229,255,0.25)]">
                    SOC 2.0
                  </span>
                </div>
                <p className="text-xs text-[#E2E8F0] max-w-2xl leading-relaxed">
                  Monitor suspicious activity, investigate anomalies, and coordinate safer defense responses.
                </p>
                <div className="flex items-center gap-4 mt-2 text-[11px] text-[#CBD5E1]">
                  <span className="flex items-center gap-1.5 font-mono">
                    <Calendar className="w-3.5 h-3.5 text-[#00E5FF]" />
                    {liveDate}
                  </span>
                  <span className="flex items-center gap-1.5 font-mono">
                    <Clock className="w-3.5 h-3.5 text-[#00F5A0]" />
                    {liveTime}
                  </span>
                  <span>· Updated: <strong className="text-[#FFFFFF]">{lastRefreshed}</strong></span>
                </div>
              </div>

              {/* Actions: Prominent Live Threat Monitor Button + Refresh + Export */}
              <div className="flex items-center gap-2.5 flex-wrap z-10">
                <button
                  onClick={() => {
                    setShowGlobeSection((prev) => !prev);
                    setActiveTab('live-threat-monitor');
                  }}
                  aria-label="Toggle Live Threat Monitor Globe"
                  className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#00E5FF] to-[#00F5A0] hover:brightness-110 text-[#030B12] text-xs font-black flex items-center gap-2 shadow-[0_0_20px_rgba(0,229,255,0.35)] transition-all cursor-pointer"
                >
                  <Globe className="w-4 h-4 text-[#030B12]" />
                  <span>Live Threat Monitor</span>
                </button>

                <button
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                  aria-label="Synchronize telemetry"
                  title="Synchronize telemetry"
                  className="p-2 rounded-xl bg-[#081722] hover:bg-[#0B1D29] border border-[#1E3A52] text-[#CBD5E1] hover:text-[#00E5FF] hover:border-[#00E5FF] transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>

                <button
                  onClick={handleExport}
                  aria-label="Export audit dataset"
                  title="Export audit dataset"
                  className="p-2 rounded-xl bg-[#081722] hover:bg-[#0B1D29] border border-[#1E3A52] text-[#CBD5E1] hover:text-[#00E5FF] hover:border-[#00E5FF] transition-all cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* ======================================================= */}
            {/* 2. SECURITY SUMMARY CARDS (Section 6 of specification) */}
            {/* ======================================================= */}
            <KPICardsRow
              metrics={DEMO_KPI_METRICS}
              isBackendConnected={isBackendConnected}
              onSelectMetric={(metric) => {
                if (metric === 'threats') setActiveTab('security-events');
                else if (metric === 'high-risk') setActiveTab('risk-analysis');
                else if (metric === 'quantum') setIsQuantumModalOpen(true);
                else if (metric === 'protected') setActiveTab('defense-policies');
              }}
            />

            {/* ======================================================= */}
            {/* 3. CINEMATIC DIGITAL GLOBE (Section 7 of specification) */}
            {/* ======================================================= */}
            {(showGlobeSection || activeTab === 'live-threat-monitor') && (
              <ThreatGlobeSection isBackendConnected={isBackendConnected} />
            )}

            {/* ======================================================= */}
            {/* 4. THREAT ACTIVITY OVERVIEW (Section 8 of spec)         */}
            {/* ======================================================= */}
            {(activeTab === 'overview' || activeTab === 'reports') && (
              <ThreatActivityOverview
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            )}

            {/* ======================================================= */}
            {/* 5. RISK ANALYSIS & QUANTUM ANALYSIS (Sections 9 & 10)   */}
            {/* ======================================================= */}
            {(activeTab === 'overview' || activeTab === 'risk-analysis' || activeTab === 'quantum-analysis') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <RiskAnalysisPanel
                  selectedEvent={selectedEvent}
                  onOpenEventDetail={handleSelectEvent}
                  onTriggerDefenseAction={() => setActiveTab('defense-policies')}
                />
                <QuantumAnalysisPanel
                  onOpenDetailedModal={() => setIsQuantumModalOpen(true)}
                  isBackendConnected={isBackendConnected}
                />
              </div>
            )}

            {/* ======================================================= */}
            {/* 6. RECENT SECURITY EVENTS (Section 11 of specification) */}
            {/* ======================================================= */}
            {(activeTab === 'overview' || activeTab === 'security-events') && (
              <RecentSecurityEvents
                events={eventsList}
                onSelectEvent={handleSelectEvent}
                searchFilter={searchQuery}
                onViewAll={() => setActiveTab('security-events')}
              />
            )}

            {/* ======================================================= */}
            {/* 7. ATTACK TIMELINE & ADAPTIVE DEFENSE (Sec 12 & 13)    */}
            {/* ======================================================= */}
            {(activeTab === 'overview' || activeTab === 'attack-timeline' || activeTab === 'defense-policies') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <AttackTimelinePanel
                  event={selectedEvent}
                  isBackendConnected={isBackendConnected}
                />
                <AdaptiveDefensePanel
                  selectedEvent={selectedEvent}
                  isBackendConnected={isBackendConnected}
                  onActionComplete={(msg) => {
                    setToastMessage(msg);
                    setTimeout(() => setToastMessage(null), 3500);
                  }}
                />
              </div>
            )}

            {/* ======================================================= */}
            {/* 8. SYSTEM HEALTH & SECURITY INSIGHTS (Sec 14 & 15)     */}
            {/* ======================================================= */}
            {(activeTab === 'overview' || activeTab === 'reports' || activeTab === 'settings') && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                <DetectionPipelineCard isBackendConnected={isBackendConnected} />
                <SecurityInsightsPanel
                  onViewReport={handleExport}
                  onExportReport={handleExport}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forensic Investigation Deep-Dive Modal */}
      <EventForensicModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onTriggerQuantumVerification={() => {
          setIsEventModalOpen(false);
          setIsQuantumModalOpen(true);
        }}
      />

      {/* Qiskit Quantum Analysis Deep-Dive Modal */}
      <QuantumAnalysisModal
        isOpen={isQuantumModalOpen}
        onClose={() => setIsQuantumModalOpen(false)}
      />
    </div>
  );
}
