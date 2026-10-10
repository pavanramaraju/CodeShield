'use client';

import React, { useState } from 'react';
import {
  Search,
  Bell,
  ChevronDown,
  Shield,
  Check,
  Globe2,
  Clock,
  Sparkles,
  Menu,
} from 'lucide-react';
import { TimeRange, UserRole } from '@/types';
import { NotificationsPopover } from './NotificationsPopover';

interface DashboardHeaderProps {
  currentRole: UserRole;
  username: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
  timeRange?: TimeRange;
  onTimeRangeChange?: (range: TimeRange) => void;
  selectedEnvironment?: string;
  onEnvironmentChange?: (env: string) => void;
  isBackendConnected?: boolean;
  onOpenEventDetail?: (eventId: string) => void;
  onNavigateSettings?: () => void;
  onToggleMobileMenu?: () => void;
}

export function DashboardHeader({
  currentRole,
  username,
  searchQuery,
  onSearchChange,
  onRoleSwitch,
  onLogout,
  timeRange = '24h',
  onTimeRangeChange,
  selectedEnvironment = 'Production Grid',
  onEnvironmentChange,
  isBackendConnected = false,
  onOpenEventDetail,
  onNavigateSettings,
  onToggleMobileMenu,
}: DashboardHeaderProps) {
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [showEnvDropdown, setShowEnvDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  React.useEffect(() => {
    if (!showSwitchDropdown && !showEnvDropdown) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowSwitchDropdown(false);
        setShowEnvDropdown(false);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showSwitchDropdown, showEnvDropdown]);

  const environments = [
    'Production Grid',
    'Staging Enclave',
    'Quantum Sim Grid (Qiskit)',
  ];

  const timeRanges: { id: TimeRange; label: string }[] = [
    { id: '15m', label: '15m' },
    { id: '1h', label: '1h' },
    { id: '24h', label: '24h' },
    { id: '7d', label: '7d' },
    { id: 'all', label: 'All' },
  ];

  return (
    <header className="h-16 px-4 sm:px-6 border-b border-[#1A2E3D] bg-[#081722] flex items-center justify-between select-none relative z-30">
      {/* Left side: Mobile Toggle + Search Bar + Environment Selector */}
      <div className="flex items-center gap-3 sm:gap-6 flex-1 max-w-2xl">
        {/* Mobile menu button */}
        <button
          onClick={onToggleMobileMenu}
          aria-label="Open navigation sidebar"
          className="p-1.5 rounded-lg bg-[#0B1D29] border border-[#1A2E3D] text-[#A8BBC8] hover:text-[#00E5FF] lg:hidden cursor-pointer shrink-0"
        >
          <Menu className="w-4 h-4" />
        </button>
        {/* Search Input: Search events, IPs, devices... */}
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#5A7382]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, IPs, devices..."
            aria-label="Search events, IPs, devices"
            className="w-full pl-10 pr-3.5 py-1.5 rounded-full bg-[#0B1D29] border border-[#1A2E3D] text-xs text-[#F4F8FC] placeholder-[#5A7382] focus:outline-none focus:ring-2 focus:ring-[#00E5FF] focus:border-transparent transition-all shadow-inner"
          />
        </div>

        {/* Workspace / Environment Selector */}
        <div className="relative hidden md:block">
          <button
            onClick={() => setShowEnvDropdown((prev) => !prev)}
            aria-label="Select environment or workspace"
            className="px-3 py-1.5 rounded-xl bg-[#0B1D29] hover:bg-[#0F2535] border border-[#1A2E3D] text-xs font-semibold text-[#A8BBC8] hover:text-[#F4F8FC] flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Globe2 className="w-3.5 h-3.5 text-[#00E5FF]" />
            <span className="truncate max-w-[130px]">{selectedEnvironment}</span>
            <ChevronDown className="w-3 h-3 text-[#5A7382]" />
          </button>

          {showEnvDropdown && (
            <div className="absolute left-0 mt-1.5 w-52 p-1 rounded-xl bg-[#0B1D29] border border-[#1A2E3D] shadow-2xl z-50 flex flex-col gap-0.5 text-xs">
              {environments.map((env) => (
                <button
                  key={env}
                  onClick={() => {
                    onEnvironmentChange?.(env);
                    setShowEnvDropdown(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left cursor-pointer transition-colors ${
                    selectedEnvironment === env
                      ? 'bg-[#00E5FF]/15 text-[#00E5FF] font-bold'
                      : 'text-[#A8BBC8] hover:bg-[#081722] hover:text-[#F4F8FC]'
                  }`}
                >
                  <span className="truncate">{env}</span>
                  {selectedEnvironment === env && (
                    <Check className="w-3.5 h-3.5 text-[#00E5FF]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right side: Time-Range Selector + Status Pill + Notifications + Role Switcher */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Time-Range Selector */}
        <div className="hidden lg:flex items-center bg-[#0B1D29] rounded-full p-0.5 border border-[#1A2E3D] text-xs">
          <span className="px-2 text-[#5A7382] flex items-center gap-1">
            <Clock className="w-3 h-3" />
          </span>
          {timeRanges.map((tr) => (
            <button
              key={tr.id}
              onClick={() => onTimeRangeChange?.(tr.id)}
              className={`px-2.5 py-1 rounded-full font-semibold transition-all cursor-pointer ${
                timeRange === tr.id
                  ? 'bg-[#00E5FF] text-[#030B12] shadow-[0_0_8px_rgba(0,229,255,0.3)]'
                  : 'text-[#A8BBC8] hover:text-[#F4F8FC]'
              }`}
            >
              {tr.label}
            </button>
          ))}
        </div>

        {/* Backend Connectivity Status Pill */}
        <div
          title={
            isBackendConnected
              ? 'Connected to local FastAPI backend with Qiskit 2.5.2 engine'
              : 'Backend disconnected. Operating in simulated demo mode.'
          }
          className={`px-2.5 py-1 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${
            isBackendConnected
              ? 'bg-[#10B981]/10 border-[#10B981]/30 text-[#10B981]'
              : 'bg-[#F59E0B]/10 border-[#F59E0B]/30 text-[#F59E0B]'
          }`}
        >
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isBackendConnected
                ? 'bg-[#10B981] animate-pulse'
                : 'bg-[#F59E0B]'
            }`}
          />
          <span className="hidden sm:inline">
            {isBackendConnected ? 'Live Grid' : 'Demo Mode'}
          </span>
        </div>

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="w-9 h-9 rounded-xl bg-[#0B1D29] hover:bg-[#0F2535] border border-[#1A2E3D] hover:border-[#00E5FF]/40 text-[#F4F8FC] flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
          >
            <Bell className="w-4 h-4 text-[#A8BBC8]" />
          </button>
          <span className="absolute -top-1 -right-1 px-1.5 min-w-[16px] h-4 rounded-full bg-[#EF4444] text-[9px] font-bold text-white flex items-center justify-center pointer-events-none shadow-xs">
            4
          </span>

          <NotificationsPopover
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onOpenEventDetail={(eventId: string) => {
              setShowNotifications(false);
              onOpenEventDetail?.(eventId);
            }}
          />
        </div>

        {/* Role Switcher Menu */}
        <div className="relative">
          <button
            onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
            aria-expanded={showSwitchDropdown}
            aria-label="Switch operator role"
            className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-[#0B1D29] hover:bg-[#0F2535] border border-[#1A2E3D] cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
          >
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00C9A7] flex items-center justify-center text-[#030B12] font-black text-[10px]">
              {username.slice(0, 2).toUpperCase()}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="text-xs font-bold text-[#F4F8FC] capitalize leading-none">
                {currentRole}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#5A7382]" />
          </button>

          {showSwitchDropdown && (
            <div className="absolute right-0 mt-2 w-48 p-1.5 rounded-xl bg-[#0B1D29] border border-[#1A2E3D] shadow-2xl z-50 flex flex-col gap-1 text-xs">
              <div className="px-2.5 py-1 text-[10px] font-bold text-[#5A7382] uppercase tracking-wider">
                Switch Role Context
              </div>
              {(['admin', 'analyst', 'user'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleSwitch(role);
                    setShowSwitchDropdown(false);
                  }}
                  className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left cursor-pointer transition-colors capitalize ${
                    currentRole === role
                      ? 'bg-[#00E5FF]/15 text-[#00E5FF] font-bold'
                      : 'text-[#A8BBC8] hover:bg-[#081722] hover:text-[#F4F8FC]'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5" />
                    {role === 'admin'
                      ? 'Administrator'
                      : role === 'analyst'
                      ? 'SOC Analyst'
                      : 'Student Operator'}
                  </span>
                  {currentRole === role && <Check className="w-3 h-3 text-[#00E5FF]" />}
                </button>
              ))}

              <div className="border-t border-[#1A2E3D] my-1" />

              <button
                onClick={() => {
                  setShowSwitchDropdown(false);
                  onNavigateSettings?.();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-[#A8BBC8] hover:bg-[#081722] hover:text-[#F4F8FC] flex items-center gap-2 text-left cursor-pointer transition-colors"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00E5FF]" />
                Sensor Settings
              </button>

              <button
                onClick={() => {
                  setShowSwitchDropdown(false);
                  onLogout();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg text-[#EF4444] hover:bg-[#EF4444]/10 flex items-center gap-2 text-left cursor-pointer transition-colors"
              >
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
