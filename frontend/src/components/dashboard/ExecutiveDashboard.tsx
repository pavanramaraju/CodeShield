'use client';

import React, { useState, useEffect } from 'react';
import { SidebarRail } from './SidebarRail';
import { DashboardHeader } from './DashboardHeader';
import { KPICardsRow } from './KPICardsRow';
import { DetectionPipeline } from './DetectionPipeline';
import { LiveTrafficChart } from './LiveTrafficChart';
import { AnomalyDetectionLog } from './AnomalyDetectionLog';
import { LowerAnalyticsCards } from './LowerAnalyticsCards';
import { RadarScannerCard } from './RadarScannerCard';
import { EventForensicModal } from './EventForensicModal';
import { QuantumAnalysisModal } from './QuantumAnalysisModal';
import { SimulateEventModal } from '@/components/modals/SimulateEventModal';
import {
  DEMO_KPI_METRICS,
  DEMO_SECURITY_EVENTS,
  DEMO_TRAFFIC_TIMELINE,
} from '@/lib/mockData';
import { ActiveTab, SecurityEventItem, UserRole } from '@/types';
import {
  RefreshCw,
  Download,
  CheckCircle2,
  FileCheck,
  Calendar,
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
}: ExecutiveDashboardProps) {
  const [activeTab, setActiveTab] = useState<ActiveTab>('overview');
  const [activeNavTab, setActiveNavTab] = useState('analytics');
  const [searchQuery, setSearchQuery] = useState('');
  const [eventsList, setEventsList] = useState<SecurityEventItem[]>(DEMO_SECURITY_EVENTS);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEventItem | null>(null);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isQuantumModalOpen, setIsQuantumModalOpen] = useState(false);
  const [isSimulateModalOpen, setIsSimulateModalOpen] = useState(false);
  const [showRadar, setShowRadar] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('Just now');
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [eventStatusFilter, setEventStatusFilter] = useState<'all' | 'safe' | 'suspicious' | 'high-risk'>('all');

  // Real-time live date/time matching reference image
  const [liveDate, setLiveDate] = useState('Nov 29, 2024');
  const [liveTime, setLiveTime] = useState('10:24:32 AM');

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

  // Settings State
  const [sensorFrequency, setSensorFrequency] = useState(30);
  const [zeroTrustStrictness, setZeroTrustStrictness] = useState('High');
  const [settingsSavedToast, setSettingsSavedToast] = useState(false);

  const handleSelectEvent = (event: SecurityEventItem) => {
    setSelectedEvent(event);
    setIsEventModalOpen(true);
  };

  const handleNotificationSelect = (eventId: string) => {
    const match = eventsList.find((e) => e.id === eventId) || eventsList[0];
    setSelectedEvent(match);
    setIsEventModalOpen(true);
  };

  const handleRefreshData = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
      setLastRefreshed(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    }, 600);
  };

  const handleExport = React.useCallback(() => {
    const timestamp = Date.now();
    const reportData = {
      timestamp: new Date(timestamp).toISOString(),
      role: currentRole,
      operator: username,
      metrics: DEMO_KPI_METRICS,
      totalEvents: eventsList.length,
      events: eventsList,
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qshield_forensic_audit_${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Forensic audit dataset exported successfully as JSON.');
    setTimeout(() => setExportNotice(null), 3000);
  }, [currentRole, username, eventsList]);

  const handleDownloadComplianceReport = React.useCallback((reportName: string) => {
    const timestamp = Date.now();
    const data = {
      title: reportName,
      generatedAt: new Date(timestamp).toISOString(),
      auditor: username,
      complianceStandard: 'SOC-2 Type II & NIST CSF 2.0',
      quantumVerificationStatus: 'ASSURED_VALID',
      activeEnclaves: ['Frankfurt', 'Tokyo', 'Ashburn', 'Singapore'],
      incidentsLogged: eventsList.length,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportName.toLowerCase().replace(/\s+/g, '_')}_${timestamp}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice(`${reportName} downloaded successfully.`);
    setTimeout(() => setExportNotice(null), 3000);
  }, [username, eventsList]);

  const handleSaveSettings = () => {
    setSettingsSavedToast(true);
    setTimeout(() => setSettingsSavedToast(false), 3000);
  };

  // KPI Card Drilldown Handler
  const handleKPIClick = (metric: 'threats' | 'networks' | 'streams' | 'quantum') => {
    if (metric === 'threats') {
      setActiveTab('events');
      setEventStatusFilter('high-risk');
    } else if (metric === 'networks') {
      setActiveTab('monitoring');
      setShowRadar(true);
    } else if (metric === 'streams') {
      setActiveTab('events');
      setEventStatusFilter('all');
    } else if (metric === 'quantum') {
      setIsQuantumModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#020A10] p-2 sm:p-4 flex items-center justify-center select-none font-sans">
      {/* Floating Application Shell Canvas */}
      <div className="w-full max-w-[1480px] bg-[#07141D] rounded-3xl shadow-2xl border border-[#193543] flex flex-row overflow-hidden min-h-[94vh]">
        {/* Left Sidebar Rail (8 Items matching reference image) */}
        <SidebarRail
          activeTab={activeTab}
          onTabChange={(tab) => {
            setActiveTab(tab);
            if (tab === 'monitoring') setShowRadar(true);
            else if (tab === 'quantum-analysis') setIsQuantumModalOpen(true);
            else if (tab === 'overview') {
              setShowRadar(false);
              setEventStatusFilter('all');
            }
          }}
          onLogoClick={() => {
            setActiveTab('overview');
            setShowRadar(false);
            setEventStatusFilter('all');
          }}
          onUserClick={() => setActiveTab('settings')}
          onSimulateEvent={() => setIsSimulateModalOpen(true)}
          onDefenseActions={() => {
            setExportNotice('Zero-trust defense mesh verified. Active policies: Automated IP Drop, Quarantine Enclave.');
            setTimeout(() => setExportNotice(null), 4000);
          }}
          onSystemStatus={() => {
            setIsQuantumModalOpen(true);
          }}
          onUsersClick={() => {
            setExportNotice(`Active Operators: 4. Current Context: ${username} (${currentRole}).`);
            setTimeout(() => setExportNotice(null), 4000);
          }}
        />

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col bg-[#07141D] overflow-y-auto">
          {/* Top Bar */}
          <DashboardHeader
            currentRole={currentRole}
            username={username}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            onRoleSwitch={onRoleSwitch}
            onLogout={onLogout}
            activeNavTab={activeNavTab}
            onNavTabChange={(tab) => {
              setActiveNavTab(tab);
              if (tab === 'threats') {
                setActiveTab('events');
              } else if (tab === 'connects') {
                setActiveTab('monitoring');
                setShowRadar(true);
              } else if (tab === 'analytics') {
                setActiveTab('overview');
              }
            }}
            onOpenEventDetail={handleNotificationSelect}
            onNavigateSettings={() => setActiveTab('settings')}
          />

          {/* Inner Dashboard Body */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Title Section matching Reference Image */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-[#F4F8FC] capitalize">
                    {activeTab === 'overview'
                      ? 'Security Dashboard'
                      : activeTab === 'monitoring'
                      ? 'Threat Monitoring & Perimeter Radar'
                      : activeTab === 'events'
                      ? 'Security Events & Forensic Telemetry'
                      : activeTab === 'ai-analysis'
                      ? 'Classical AI Model Performance'
                      : activeTab === 'quantum-analysis'
                      ? 'Qiskit Quantum Kernel Analysis'
                      : activeTab === 'reports'
                      ? 'Audit & Compliance Reports'
                      : 'Sensor Nodes & Platform Settings'}
                  </h1>

                  {activeTab !== 'overview' && (
                    <button
                      onClick={() => {
                        setActiveTab('overview');
                        setEventStatusFilter('all');
                      }}
                      className="px-2.5 py-1 rounded-full bg-[#0A1C26] hover:bg-[#0E2431] border border-[#193543] text-[11px] font-semibold text-[#00E6C3] transition-colors cursor-pointer"
                    >
                      ← Back to Overview
                    </button>
                  )}
                </div>

                <p className="text-xs text-[#A8BBC8] mt-1">
                  Real-time cyber anomaly detection using quantum computing.
                  <span className="ml-2 font-mono text-[11px] text-[#5A7382]">
                    Updated: {lastRefreshed}
                  </span>
                </p>
              </div>

              {/* Action buttons & Live Date/Time widget */}
              <div className="flex items-center gap-3 flex-wrap">
                {/* Live Date/Time widget matching reference image */}
                <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0A1C26] border border-[#193543] text-xs">
                  <Calendar className="w-4 h-4 text-[#00E6C3] shrink-0" />
                  <div className="flex flex-col text-[11px] font-mono leading-tight">
                    <span className="font-semibold text-[#F4F8FC]">{liveDate}</span>
                    <span className="text-[#00E6C3]">{liveTime}</span>
                  </div>
                </div>

                {/* Refresh Data button */}
                <button
                  onClick={handleRefreshData}
                  disabled={isRefreshing}
                  className="px-3 py-1.5 rounded-full border border-[#193543] bg-[#0A1C26] hover:bg-[#0E2431] text-xs font-semibold text-[#F4F8FC] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-60"
                  title="Refresh Telemetry"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-[#00E6C3]' : 'text-[#A8BBC8]'}`} />
                  <span>{isRefreshing ? 'Refreshing...' : 'Refresh'}</span>
                </button>

                {/* Export Telemetry */}
                <button
                  onClick={handleExport}
                  aria-label="Export audit log JSON"
                  className="px-3 py-1.5 rounded-full border border-[#193543] bg-[#0A1C26] hover:bg-[#0E2431] text-xs font-semibold text-[#F4F8FC] transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                  title="Export Audit Log JSON"
                >
                  <Download className="w-3.5 h-3.5 text-[#A8BBC8]" />
                  <span>Export JSON</span>
                </button>

                {/* Radar Scanner toggle */}
                <button
                  onClick={() => setShowRadar(!showRadar)}
                  className={`px-3 py-1.5 rounded-full border text-xs font-semibold transition-all cursor-pointer shadow-xs ${
                    showRadar
                      ? 'bg-[#00E6C3]/20 border-[#00E6C3] text-[#00E6C3]'
                      : 'border-[#193543] bg-[#0A1C26] text-[#A8BBC8] hover:bg-[#0E2431] hover:text-[#F4F8FC]'
                  }`}
                >
                  {showRadar ? 'Hide Radar' : 'Radar Scanner'}
                </button>
              </div>
            </div>

            {/* Export Success Toast */}
            {exportNotice && (
              <div className="p-2.5 rounded-xl bg-[#00E6C3]/15 border border-[#00E6C3]/30 text-xs font-semibold text-[#00E6C3] flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-[#00E6C3]" />
                <span>{exportNotice}</span>
              </div>
            )}

            {/* Settings Saved Toast */}
            {settingsSavedToast && (
              <div className="p-2.5 rounded-xl bg-[#00E6C3]/15 border border-[#00E6C3]/30 text-xs font-semibold text-[#00E6C3] flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 text-[#00E6C3]" />
                <span>Platform sensor node configurations and zero-trust policies applied successfully.</span>
              </div>
            )}

            {/* ========================================================= */}
            {/* TAB CONTENT ROUTING                                      */}
            {/* ========================================================= */}

            {/* VIEW 1: OVERVIEW (Default Dashboard matching Reference) */}
            {activeTab === 'overview' && (
              <div className="space-y-4">
                {/* 1. Metric Cards Row (4 cards matching Reference Image) */}
                <KPICardsRow
                  metrics={DEMO_KPI_METRICS}
                  onSelectMetric={handleKPIClick}
                />

                {/* 2. Detection Pipeline (4 connected stages matching Reference Image) */}
                <DetectionPipeline
                  onOpenEvent={() => {
                    setSelectedEvent(eventsList[0]);
                    setIsEventModalOpen(true);
                  }}
                  onOpenQuantum={() => setIsQuantumModalOpen(true)}
                  onTriggerDefense={() => {
                    setExportNotice('Automated zero-trust defense policy triggered: Quarantined suspicious ingress.');
                    setTimeout(() => setExportNotice(null), 3500);
                  }}
                />

                {/* 3. Middle Row: Recent Security Events Table & Live Traffic Area Chart */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
                  {/* Recent Security Events Table */}
                  <div className={showRadar ? 'lg:col-span-7' : 'lg:col-span-7'}>
                    <AnomalyDetectionLog
                      events={eventsList}
                      onSelectEvent={handleSelectEvent}
                      searchFilter={searchQuery}
                      initialStatusFilter={eventStatusFilter}
                    />
                  </div>

                  {/* Live Traffic Area Chart or Radar */}
                  <div className={showRadar ? 'lg:col-span-5' : 'lg:col-span-5'}>
                    {showRadar ? (
                      <RadarScannerCard />
                    ) : (
                      <LiveTrafficChart data={DEMO_TRAFFIC_TIMELINE} />
                    )}
                  </div>
                </div>

                {/* 4. Lower Row: 4 Analytics Cards */}
                <LowerAnalyticsCards
                  onOpenQuantumAnalysis={() => setIsQuantumModalOpen(true)}
                  onFilterCategory={(category) => setSearchQuery(category)}
                />
              </div>
            )}

            {/* VIEW 2: THREAT MONITORING (Radar & Enclaves) */}
            {activeTab === 'monitoring' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                  <div className="lg:col-span-5">
                    <RadarScannerCard />
                  </div>
                  <div className="lg:col-span-7 bg-[#0A1C26] rounded-2xl p-5 border border-[#193543] shadow-lg">
                    <h3 className="font-bold text-sm text-[#F4F8FC] mb-3">
                      Global SOC Enclaves & Perimeter Verification
                    </h3>
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {[
                        { name: 'Frankfurt Central Pod', latency: '1.2ms', status: 'Optimal', pings: '42k' },
                        { name: 'Tokyo Edge Router', latency: '18.4ms', status: 'Optimal', pings: '89k' },
                        { name: 'Virginia US-East Vault', latency: '3.1ms', status: 'Optimal', pings: '124k' },
                        { name: 'Singapore Gateway', latency: '24.2ms', status: 'Monitoring', pings: '18k' },
                      ].map((item) => (
                        <div key={item.name} className="p-3 rounded-xl bg-[#07141D] border border-[#193543]">
                          <div className="font-semibold text-[#F4F8FC]">{item.name}</div>
                          <div className="text-[#A8BBC8] text-[11px] mt-1">Latency: {item.latency}</div>
                          <div className="text-[#00E6C3] font-bold text-[11px]">{item.status} · {item.pings}/sec</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <LiveTrafficChart data={DEMO_TRAFFIC_TIMELINE} />
              </div>
            )}

            {/* VIEW 3: SECURITY EVENTS (Full Width Anomaly Table) */}
            {activeTab === 'events' && (
              <div className="space-y-4">
                <AnomalyDetectionLog
                  events={eventsList}
                  onSelectEvent={handleSelectEvent}
                  searchFilter={searchQuery}
                  initialStatusFilter={eventStatusFilter}
                />
              </div>
            )}

            {/* VIEW 4: AI ANALYSIS (Classical ML Performance) */}
            {activeTab === 'ai-analysis' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#0A1C26] p-5 rounded-2xl border border-[#193543] shadow-lg">
                    <span className="text-xs text-[#A8BBC8] font-semibold">XGBoost F1-Score</span>
                    <div className="text-2xl font-black text-[#00E6C3] mt-1">0.9942</div>
                    <p className="text-[11px] text-[#5A7382] mt-1">Evaluated on 400k telemetry vectors</p>
                  </div>
                  <div className="bg-[#0A1C26] p-5 rounded-2xl border border-[#193543] shadow-lg">
                    <span className="text-xs text-[#A8BBC8] font-semibold">Random Forest Accuracy</span>
                    <div className="text-2xl font-black text-[#38D9FF] mt-1">99.65%</div>
                    <p className="text-[11px] text-[#5A7382] mt-1">Ensemble consensus threshold 0.85</p>
                  </div>
                  <div className="bg-[#0A1C26] p-5 rounded-2xl border border-[#193543] shadow-lg">
                    <span className="text-xs text-[#A8BBC8] font-semibold">Avg Ingress Latency</span>
                    <div className="text-2xl font-black text-[#F4F8FC] mt-1">1.84ms</div>
                    <p className="text-[11px] text-[#5A7382] mt-1">Real-time edge packet filtering</p>
                  </div>
                </div>
                <LiveTrafficChart data={DEMO_TRAFFIC_TIMELINE} />
              </div>
            )}

            {/* VIEW 5: REPORTS & COMPLIANCE */}
            {activeTab === 'reports' && (
              <div className="space-y-4">
                <div className="bg-[#0A1C26] rounded-2xl p-6 border border-[#193543] shadow-lg">
                  <h3 className="font-bold text-sm text-[#F4F8FC] mb-4">
                    Audit & Compliance Reports
                  </h3>
                  <div className="space-y-3">
                    {[
                      'SOC-2 Type II Zero-Trust Compliance Audit',
                      'NIST Post-Quantum Cryptography Assessment',
                      'Annual Threat Surface Penetration Log',
                    ].map((rep) => (
                      <div
                        key={rep}
                        className="flex items-center justify-between p-3.5 rounded-xl bg-[#07141D] border border-[#193543]"
                      >
                        <div className="flex items-center gap-3">
                          <FileCheck className="w-5 h-5 text-[#00E6C3]" />
                          <div>
                            <span className="font-semibold text-xs text-[#F4F8FC] block">{rep}</span>
                            <span className="text-[10px] text-[#A8BBC8]">Cryptographically signed by Q-SHIELD kernel</span>
                          </div>
                        </div>
                        <button
                          onClick={() => handleDownloadComplianceReport(rep)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#00E6C3] hover:bg-[#38D9FF] text-[#020A10] text-xs font-bold transition-colors cursor-pointer"
                        >
                          Download
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* VIEW 6: SENSOR NODES & PLATFORM SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-4">
                <div className="bg-[#0A1C26] rounded-2xl p-6 border border-[#193543] shadow-lg max-w-2xl">
                  <h3 className="font-bold text-sm text-[#F4F8FC] mb-4">
                    Sensor Nodes & Platform Settings
                  </h3>

                  <div className="space-y-4 text-xs">
                    <div>
                      <label className="block text-xs font-semibold text-[#A8BBC8] mb-1">
                        Sensor Mesh Ping Frequency ({sensorFrequency}s)
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="60"
                        value={sensorFrequency}
                        onChange={(e) => setSensorFrequency(Number(e.target.value))}
                        className="w-full accent-[#00E6C3]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#A8BBC8] mb-1">
                        Zero-Trust Enforcement Strictness
                      </label>
                      <select
                        value={zeroTrustStrictness}
                        onChange={(e) => setZeroTrustStrictness(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-[#07141D] border border-[#193543] text-xs text-[#F4F8FC] font-semibold"
                      >
                        <option value="Standard">Standard (Monitor & Flag)</option>
                        <option value="High">High (Automated Edge Isolation)</option>
                        <option value="Maximum">Maximum (Immediate Post-Quantum Quarantine)</option>
                      </select>
                    </div>

                    <div className="pt-3 border-t border-[#193543]">
                      <button
                        onClick={handleSaveSettings}
                        className="px-5 py-2.5 rounded-xl bg-[#00E6C3] hover:bg-[#38D9FF] text-[#020A10] font-bold text-xs shadow-md shadow-[#00E6C3]/20 transition-all cursor-pointer"
                      >
                        Save Preferences
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Forensic Modal */}
      <EventForensicModal
        event={selectedEvent}
        isOpen={isEventModalOpen}
        onClose={() => setIsEventModalOpen(false)}
        onTriggerQuantumVerification={() => {
          setIsEventModalOpen(false);
          setIsQuantumModalOpen(true);
        }}
      />

      {/* Quantum Analysis Modal */}
      <QuantumAnalysisModal
        isOpen={isQuantumModalOpen}
        onClose={() => setIsQuantumModalOpen(false)}
      />

      {/* Simulate Security Event Modal */}
      <SimulateEventModal
        isOpen={isSimulateModalOpen}
        onClose={() => setIsSimulateModalOpen(false)}
        onEventCreated={(newEvent) => {
          setEventsList((prev) => [newEvent, ...prev]);
          setExportNotice(`Simulated event ${newEvent.id} recorded and processed.`);
          setTimeout(() => setExportNotice(null), 3500);
        }}
      />
    </div>
  );
}
