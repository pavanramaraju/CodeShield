'use client';

import React from 'react';
import {
  LayoutDashboard,
  ShieldAlert,
  Zap,
  BarChart3,
  Users,
  ShieldCheck,
  Activity,
  Settings,
  Shield,
} from 'lucide-react';
import { ActiveTab } from '@/types';

type SidebarItemId = ActiveTab | 'simulate';

interface SidebarRailProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
  onLogoClick?: () => void;
  onUserClick?: () => void;
  onSimulateEvent?: () => void;
  onDefenseActions?: () => void;
  onSystemStatus?: () => void;
  onUsersClick?: () => void;
}

export function SidebarRail({
  activeTab,
  onTabChange,
  onLogoClick,
  onUserClick,
  onSimulateEvent,
  onDefenseActions,
}: SidebarRailProps) {
  const menuItems: {
    id: SidebarItemId;
    label: string;
    icon: React.ReactNode;
    ariaLabel: string;
    action: () => void;
  }[] = [
    {
      id: 'overview',
      label: 'Dashboard',
      icon: <LayoutDashboard className="w-4 h-4" />,
      ariaLabel: 'Overview',
      action: () => onTabChange('overview'),
    },
    {
      id: 'events',
      label: 'Security Events',
      icon: <ShieldAlert className="w-4 h-4" />,
      ariaLabel: 'Security Events',
      action: () => onTabChange('events'),
    },
    {
      id: 'simulate',
      label: 'Simulate Event',
      icon: <Zap className="w-4 h-4" />,
      ariaLabel: 'Simulate Event',
      action: () => (onSimulateEvent ? onSimulateEvent() : onTabChange('events')),
    },
    {
      id: 'monitoring',
      label: 'Analytics',
      icon: <BarChart3 className="w-4 h-4" />,
      ariaLabel: 'Threat Monitoring',
      action: () => onTabChange('monitoring'),
    },
    {
      id: 'ai-analysis',
      label: 'Users',
      icon: <Users className="w-4 h-4" />,
      ariaLabel: 'AI Analysis',
      action: () => onTabChange('ai-analysis'),
    },
    {
      id: 'quantum-analysis',
      label: 'Defense Actions',
      icon: <ShieldCheck className="w-4 h-4" />,
      ariaLabel: 'Defense Actions',
      action: () => {
        onTabChange('quantum-analysis');
        onDefenseActions?.();
      },
    },
    {
      id: 'reports',
      label: 'System Status',
      icon: <Activity className="w-4 h-4" />,
      ariaLabel: 'Reports',
      action: () => onTabChange('reports'),
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: <Settings className="w-4 h-4" />,
      ariaLabel: 'Settings',
      action: () => onTabChange('settings'),
    },
  ];

  return (
    <aside
      aria-label="Sidebar Navigation"
      className="w-56 bg-[#07141D] border-r border-[#193543] flex flex-col justify-between py-5 px-3 select-none shrink-0"
    >
      {/* Top Logo & Branding matching Reference Image */}
      <div className="flex flex-col gap-6">
        <button
          onClick={onLogoClick}
          aria-label="Q-SHIELD Dashboard Overview"
          className="flex items-center gap-3 px-2 py-1 text-left border-0 bg-transparent cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#00E6C3] rounded-lg"
          title="Q-SHIELD Dashboard"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E6C3] to-[#0F766E] flex items-center justify-center text-[#020A10] shadow-md shadow-[#00E6C3]/20 group-hover:scale-105 transition-transform">
            <Shield className="w-5 h-5 fill-[#020A10] text-[#020A10]" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-sm tracking-wider text-[#F4F8FC]">
              Q-SHIELD
            </span>
            <span className="text-[9px] font-medium tracking-widest uppercase text-[#00E6C3] -mt-0.5">
              Cyber Defense
            </span>
          </div>
        </button>

        {/* Navigation Items (8 Items matching Reference Image) */}
        <nav aria-label="Sidebar main menu" className="flex flex-col gap-1">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.label}
                onClick={item.action}
                aria-label={item.ariaLabel}
                aria-current={isActive ? 'page' : undefined}
                title={item.label}
                className={`relative w-full h-10 px-3 rounded-xl flex items-center gap-3 text-xs font-semibold transition-all cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E6C3] ${
                  isActive
                    ? 'bg-[#00E6C3] text-[#020A10] font-bold shadow-md shadow-[#00E6C3]/20'
                    : 'text-[#A8BBC8] hover:text-[#F4F8FC] hover:bg-[#0A1C26]'
                }`}
              >
                <span className={isActive ? 'text-[#020A10]' : 'text-[#A8BBC8]'}>
                  {item.icon}
                </span>
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User Avatar Card at bottom */}
      <div className="pt-4 border-t border-[#193543]">
        <button
          onClick={onUserClick}
          aria-label="Account Settings"
          title="Account Settings"
          className="w-full p-2 rounded-xl bg-[#0A1C26] hover:bg-[#0E2431] border border-[#193543] flex items-center gap-2.5 cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#00E6C3]"
        >
          <div className="w-8 h-8 rounded-full bg-[#00E6C3] flex items-center justify-center text-[#020A10] font-black text-xs">
            AD
          </div>
          <div className="flex flex-col text-left overflow-hidden">
            <span className="text-xs font-bold text-[#F4F8FC] truncate">
              Analyst User
            </span>
            <span className="text-[10px] text-[#00E6C3] truncate">
              SOC Operator
            </span>
          </div>
        </button>
      </div>
    </aside>
  );
}
