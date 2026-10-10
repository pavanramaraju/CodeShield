'use client';

import React, { useState } from 'react';
import {
  LayoutDashboard,
  Globe,
  ShieldAlert,
  Activity,
  Atom,
  ShieldCheck,
  GitCommit,
  FileText,
  Settings,
  Shield,
  Server,
  LogOut,
  User,
  ChevronUp,
} from 'lucide-react';
import { ActiveTab, UserRole } from '@/types';

interface SidebarRailProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogoClick?: () => void;
  onUserClick?: () => void;
  onLogout?: () => void;
  isBackendConnected?: boolean;
  username?: string;
  currentRole?: UserRole;
  onOpenGlobeView?: () => void;
  isOpenOnMobile?: boolean;
  onCloseMobile?: () => void;
}

export function SidebarRail({
  activeTab,
  onTabChange,
  onLogoClick,
  onUserClick,
  onLogout,
  isBackendConnected = false,
  username = 'analyst@qshield.ai',
  currentRole = 'analyst',
  onOpenGlobeView,
  isOpenOnMobile = false,
  onCloseMobile,
}: SidebarRailProps) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Normalize legacy tab aliases
  const normalizedActiveTab =
    activeTab === 'monitoring'
      ? 'live-threat-monitor'
      : activeTab === 'events'
      ? 'security-events'
      : activeTab === 'ai-analysis'
      ? 'risk-analysis'
      : activeTab;

  const menuItems: {
    id: ActiveTab;
    label: string;
    icon: React.ReactNode;
    action: () => void;
  }[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
      action: () => {
        onTabChange('overview');
        onCloseMobile?.();
      },
    },
    {
      id: 'live-threat-monitor',
      label: 'Live Threat Monitor',
      icon: <Globe className="w-4 h-4 shrink-0" />,
      action: () => {
        onTabChange('live-threat-monitor');
        onOpenGlobeView?.();
        onCloseMobile?.();
      },
    },
    {
      id: 'security-events',
      label: 'Security Events',
      icon: <ShieldAlert className="w-4 h-4 shrink-0" />,
      action: () => {
        onTabChange('security-events');
        onCloseMobile?.();
      },
    },
    {
      id: 'risk-analysis',
      label: 'Risk Analysis',
      icon: <Activity className="w-4 h-4 shrink-0" />,
      action: () => {
        onTabChange('risk-analysis');
        onCloseMobile?.();
      },
    },
    {
      id: 'quantum-analysis',
      label: 'Quantum Analysis',
      icon: <Atom className="w-4 h-4 shrink-0" />,
      action: () => {
        onTabChange('quantum-analysis');
        onCloseMobile?.();
      },
    },
    {
      id: 'defense-policies',
      label: 'Defense Policies',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
      action: () => {
        onTabChange('defense-policies');
        onCloseMobile?.();
      },
    },
    {
      id: 'attack-timeline',
      label: 'Attack Timeline',
      icon: <GitCommit className="w-4 h-4 shrink-0" />,
      action: () => {
        onTabChange('attack-timeline');
        onCloseMobile?.();
      },
    },
    {
      id: 'reports',
      label: 'Reports',
      icon: <FileText className="w-4 h-4 shrink-0" />,
      action: () => {
        onTabChange('reports');
        onCloseMobile?.();
      },
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4 shrink-0" />,
      action: () => {
        onTabChange('settings');
        onCloseMobile?.();
      },
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenOnMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-[#030B12]/80 backdrop-blur-sm z-40 lg:hidden"
        />
      )}

      <aside
        aria-label="Sidebar Navigation"
        className={`fixed inset-y-0 left-0 z-50 w-60 bg-[#081722] border-r border-[#1A2E3D] flex flex-col justify-between py-5 px-3 select-none shrink-0 transition-transform duration-300 lg:static lg:translate-x-0 ${
          isOpenOnMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
      {/* Top Logo & App Title */}
      <div className="flex flex-col gap-5">
        <button
          onClick={onLogoClick}
          aria-label="Q-SHIELD Home"
          className="flex items-center gap-3 px-2 py-1 text-left border-0 bg-transparent cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#00E5FF] rounded-lg"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E5FF] to-[#00C9A7] flex items-center justify-center text-[#030B12] shadow-md shadow-[#00E5FF]/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 fill-[#030B12] text-[#030B12]" />
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-sm tracking-wider text-[#F4F8FC]">
              Q-SHIELD
            </span>
            <span className="text-[9px] font-semibold tracking-widest uppercase text-[#00E5FF] -mt-0.5">
              QUANTUM CYBER DEFENSE
            </span>
          </div>
        </button>

        {/* 9 Navigation Items */}
        <nav aria-label="Sidebar main menu" className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = normalizedActiveTab === item.id;
            return (
              <button
                key={item.id}
                onClick={item.action}
                aria-current={isActive ? 'page' : undefined}
                className={`relative w-full h-10 px-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E5FF] text-left ${
                  isActive
                    ? 'bg-[#00E5FF]/15 text-[#00E5FF] border border-[#00E5FF]/30 font-bold shadow-[0_0_12px_rgba(0,229,255,0.15)]'
                    : 'text-[#A8BBC8] hover:text-[#F4F8FC] hover:bg-[#0B1D29]'
                }`}
              >
                {/* Glowing Left Indicator for active item */}
                {isActive && (
                  <span className="absolute left-0 top-2 bottom-2 w-1 bg-[#00E5FF] rounded-r-full shadow-[0_0_8px_#00E5FF]" />
                )}

                <span className={isActive ? 'text-[#00E5FF]' : 'text-[#A8BBC8]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom Area: System Health + Backend Status + User Profile */}
      <div className="pt-3 border-t border-[#1A2E3D] flex flex-col gap-3">
        {/* System Health & Backend Status */}
        <div className="px-3 py-2 rounded-xl bg-[#0B1D29] border border-[#1A2E3D] flex flex-col gap-1.5 text-[11px]">
          <div className="flex items-center justify-between text-[#A8BBC8]">
            <span className="flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider text-[#5A7382]">
              <Server className="w-3 h-3 text-[#00E5FF]" />
              System Grid
            </span>
            <span className="flex items-center gap-1 text-[#10B981] font-semibold text-[10px]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse" />
              99.8% Healthy
            </span>
          </div>

          <div className="flex items-center justify-between pt-1 border-t border-[#1A2E3D]/60 text-[10px]">
            <span className="text-[#A8BBC8]">Engine:</span>
            {isBackendConnected ? (
              <span className="font-mono text-[#00E5FF] font-semibold">
                FastAPI + Qiskit
              </span>
            ) : (
              <span className="font-mono text-[#F59E0B] font-semibold">
                Demo Mode
              </span>
            )}
          </div>
        </div>

        {/* User Profile Card with Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            aria-label="User profile and authentication menu"
            className="w-full p-2 rounded-xl bg-[#0B1D29] hover:bg-[#0F2535] border border-[#1A2E3D] flex items-center justify-between cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#00E5FF]"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#00E5FF] to-[#00C9A7] flex items-center justify-center text-[#030B12] font-black text-xs shrink-0 shadow-xs">
                {username.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex flex-col text-left overflow-hidden">
                <span className="text-xs font-bold text-[#F4F8FC] truncate">
                  {username}
                </span>
                <span className="text-[10px] text-[#00E5FF] capitalize truncate">
                  {currentRole === 'admin'
                    ? 'Security Administrator'
                    : currentRole === 'analyst'
                    ? 'Senior SOC Analyst'
                    : 'Junior Operator'}
                </span>
              </div>
            </div>
            <ChevronUp
              className={`w-3.5 h-3.5 text-[#5A7382] transition-transform ${
                showProfileMenu ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Profile Menu Popover */}
          {showProfileMenu && (
            <div className="absolute bottom-full left-0 right-0 mb-2 p-2 rounded-xl bg-[#0B1D29] border border-[#1A2E3D] shadow-2xl z-50 flex flex-col gap-1 text-xs">
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onUserClick?.();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-[#081722] text-[#A8BBC8] hover:text-[#F4F8FC] flex items-center gap-2 text-left cursor-pointer transition-colors"
              >
                <User className="w-3.5 h-3.5 text-[#00E5FF]" />
                <span>Account Profile</span>
              </button>
              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onLogout?.();
                }}
                className="w-full px-2.5 py-1.5 rounded-lg hover:bg-[#EF4444]/15 text-[#EF4444] flex items-center gap-2 text-left cursor-pointer transition-colors"
              >
                <LogOut className="w-3.5 h-3.5 text-[#EF4444]" />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
    </>
  );
}
