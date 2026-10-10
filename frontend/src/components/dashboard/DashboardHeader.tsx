'use client';

import React, { useState } from 'react';
import { Search, Bell, ChevronDown, User, Shield, Check } from 'lucide-react';
import { UserRole } from '@/types';
import { NotificationsPopover } from './NotificationsPopover';

interface DashboardHeaderProps {
  currentRole: UserRole;
  username: string;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRoleSwitch: (role: UserRole) => void;
  onLogout: () => void;
  activeNavTab?: string;
  onNavTabChange?: (tab: string) => void;
  onOpenEventDetail?: (eventId: string) => void;
  onNavigateSettings?: () => void;
}

export function DashboardHeader({
  currentRole,
  username,
  searchQuery,
  onSearchChange,
  onRoleSwitch,
  onLogout,
  activeNavTab = 'analytics',
  onNavTabChange,
  onOpenEventDetail,
  onNavigateSettings,
}: DashboardHeaderProps) {
  const [showSwitchDropdown, setShowSwitchDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  React.useEffect(() => {
    if (!showSwitchDropdown) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setShowSwitchDropdown(false);
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [showSwitchDropdown]);

  return (
    <header className="h-16 px-6 border-b border-[#193543] bg-[#07141D] flex items-center justify-between select-none relative z-30">
      {/* Left side: Search Bar matching reference image */}
      <div className="flex items-center gap-6">
        {/* Search Input: Search events, users, IP addresses... */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-2.5 text-[#5A7382]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search events, users, IP addresses..."
            className="w-64 sm:w-80 pl-10 pr-3.5 py-1.5 rounded-full bg-[#0A1C26] border border-[#193543] text-xs text-[#F4F8FC] placeholder-[#5A7382] focus:outline-none focus:ring-2 focus:ring-[#00E6C3] focus:border-transparent transition-all shadow-inner"
          />
        </div>

        {/* View Navigation Tabs */}
        <nav aria-label="Dashboard views" className="hidden lg:flex items-center gap-5 text-xs">
          <button
            onClick={() => onNavTabChange?.('analytics')}
            aria-label="Dashboard Analytics view"
            className={`relative py-2 font-bold transition-colors cursor-pointer ${
              activeNavTab === 'analytics'
                ? 'text-[#00E6C3]'
                : 'text-[#A8BBC8] hover:text-[#F4F8FC]'
            }`}
          >
            <span>Analytics</span>
            {activeNavTab === 'analytics' && (
              <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-[#00E6C3] shadow-[0_0_8px_#00E6C3] rounded-full" />
            )}
          </button>

          <button
            onClick={() => onNavTabChange?.('threats')}
            aria-label="Dashboard Threat Intelligence view"
            className={`py-2 transition-colors cursor-pointer font-semibold ${
              activeNavTab === 'threats'
                ? 'text-[#00E6C3]'
                : 'text-[#A8BBC8] hover:text-[#F4F8FC]'
            }`}
          >
            Threat Intelligence
          </button>

          <button
            onClick={() => onNavTabChange?.('connects')}
            aria-label="Dashboard My Connects view"
            className={`py-2 transition-colors cursor-pointer font-semibold ${
              activeNavTab === 'connects'
                ? 'text-[#00E6C3]'
                : 'text-[#A8BBC8] hover:text-[#F4F8FC]'
            }`}
          >
            My Connects
          </button>
        </nav>
      </div>

      {/* Right side: Notifications, User Switcher */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            aria-label="View notifications"
            className="w-9 h-9 rounded-xl bg-[#0A1C26] hover:bg-[#0E2431] border border-[#193543] hover:border-[#00E6C3]/40 text-[#F4F8FC] flex items-center justify-center transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E6C3]"
          >
            <Bell className="w-4 h-4 text-[#A8BBC8]" />
          </button>
          <span className="absolute -top-1 -right-1 px-1.5 min-w-[16px] h-4 rounded-full bg-[#FF626B] text-[9px] font-bold text-white flex items-center justify-center pointer-events-none shadow-xs">
            4
          </span>

          <NotificationsPopover
            isOpen={showNotifications}
            onClose={() => setShowNotifications(false)}
            onOpenEventDetail={onOpenEventDetail}
          />
        </div>

        {/* User Profile & Switch User Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowSwitchDropdown(!showSwitchDropdown)}
            aria-label="User account and role menu"
            className="flex items-center gap-2 pl-2 pr-3 py-1 rounded-full bg-[#0A1C26] hover:bg-[#0E2431] border border-[#193543] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E6C3]"
          >
            <div className="w-7 h-7 rounded-full bg-[#00E6C3] flex items-center justify-center text-[#020A10] font-bold text-xs">
              AD
            </div>
            <div className="text-left hidden sm:block">
              <div className="text-xs font-bold text-[#F4F8FC] capitalize">
                {currentRole === 'user' ? 'Student' : currentRole}
              </div>
              <div className="text-[10px] text-[#A8BBC8] leading-none truncate max-w-[90px]">
                {username}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-[#5A7382]" />
          </button>

          {/* Switch User Popup */}
          {showSwitchDropdown && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-[#0A1C26] border border-[#193543] p-2.5 shadow-2xl z-50 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="px-2 py-1.5 text-[11px] font-bold text-[#5A7382] uppercase tracking-wider">
                Switch Role Context
              </div>

              {(['admin', 'analyst', 'user'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  onClick={() => {
                    onRoleSwitch(role);
                    setShowSwitchDropdown(false);
                  }}
                  aria-label={`Switch role context to ${role}`}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl text-xs font-semibold cursor-pointer transition-colors ${
                    currentRole === role
                      ? 'bg-[#00E6C3]/20 text-[#00E6C3] border border-[#00E6C3]/30'
                      : 'text-[#F4F8FC] hover:bg-[#07141D]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-6 h-6 rounded-full flex items-center justify-center ${
                        role === 'admin'
                          ? 'bg-[#FF626B]/20 text-[#FF626B]'
                          : role === 'analyst'
                          ? 'bg-[#00E6C3]/20 text-[#00E6C3]'
                          : 'bg-[#38D9FF]/20 text-[#38D9FF]'
                      }`}
                    >
                      {role === 'admin' ? (
                        <Shield className="w-3 h-3" />
                      ) : (
                        <User className="w-3 h-3" />
                      )}
                    </div>
                    <span className="capitalize">{role === 'user' ? 'Student' : role}</span>
                  </div>
                  {currentRole === role && <Check className="w-3.5 h-3.5 text-[#00E6C3]" />}
                </button>
              ))}

              <div className="my-1.5 border-t border-[#193543]" />

              <button
                onClick={() => {
                  setShowSwitchDropdown(false);
                  onNavigateSettings?.();
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-semibold text-[#F4F8FC] hover:bg-[#07141D] transition-colors cursor-pointer flex items-center justify-between"
              >
                <span>Node & System Settings</span>
                <span className="text-[10px] text-[#A8BBC8]">⚙</span>
              </button>

              <button
                onClick={() => {
                  setShowSwitchDropdown(false);
                  setTimeout(() => {
                    onLogout();
                  }, 50);
                }}
                className="w-full text-left px-2.5 py-2 rounded-lg text-xs font-bold text-[#FF626B] hover:bg-[#FF626B]/10 transition-colors cursor-pointer"
              >
                Log Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
