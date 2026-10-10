'use client';

import React, { useState } from 'react';
import { X, Bell, AlertTriangle, ShieldCheck, Trash2 } from 'lucide-react';

interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'alert' | 'success' | 'info';
  read: boolean;
}

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEventDetail?: (eventId: string) => void;
}

export function NotificationsPopover({ isOpen, onClose, onOpenEventDetail }: NotificationsPopoverProps) {
  const [notifications, setNotifications] = useState<NotificationItem[]>([
    {
      id: '5028000066559',
      title: 'High-Risk Anomaly Quarantined',
      message: 'Zero-day exfiltration probe intercepted on API Gateway Ingress (IP: 185.220.101.5).',
      time: '4m ago',
      type: 'alert',
      read: false,
    },
    {
      id: '5028000066560',
      title: 'Qiskit Quantum Kernel Calibrated',
      message: 'IBM Quantum Falcon execution completed with 98.42% state fidelity.',
      time: '18m ago',
      type: 'success',
      read: false,
    },
    {
      id: '5028000066561',
      title: 'Sensor Pod 04 Health Verified',
      message: 'Frankfurt edge sensor node latency stable at 1.2ms.',
      time: '1h ago',
      type: 'info',
      read: true,
    },
  ]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const handleNotificationClick = (n: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((item) => (item.id === n.id ? { ...item, read: true } : item))
    );
    if (onOpenEventDetail) {
      onOpenEventDetail(n.id);
      onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Notifications"
      className="absolute right-0 top-12 w-80 sm:w-96 bg-[#0A1C26] rounded-2xl border border-[#193543] shadow-2xl p-4 z-50 animate-in fade-in slide-in-from-top-2 duration-150 select-none"
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-[#193543]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-[#00E6C3]" />
          <h3 className="font-bold text-xs text-[#F4F8FC]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.2 rounded-full bg-[#FF626B] text-white text-[10px] font-bold">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-semibold text-[#00E6C3] hover:underline cursor-pointer"
            >
              Mark read
            </button>
          )}
          <button
            onClick={clearAll}
            className="text-[11px] text-[#A8BBC8] hover:text-[#FF626B] cursor-pointer"
            title="Clear all"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={onClose}
            aria-label="Close notifications"
            className="w-5 h-5 rounded-full hover:bg-[#07141D] flex items-center justify-center text-[#A8BBC8] hover:text-[#F4F8FC] cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="divide-y divide-[#193543]/60 max-h-72 overflow-y-auto py-1">
        {notifications.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#5A7382]">No new notifications</div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => handleNotificationClick(n)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleNotificationClick(n);
                }
              }}
              className={`py-2.5 px-2 rounded-xl transition-colors cursor-pointer ${
                n.read ? 'opacity-65 hover:opacity-100 hover:bg-[#07141D]' : 'bg-[#07141D]/60 hover:bg-[#07141D]'
              }`}
            >
              <div className="flex items-start gap-2.5">
                <div className="mt-0.5">
                  {n.type === 'alert' ? (
                    <div className="w-6 h-6 rounded-lg bg-[#FF626B]/20 text-[#FF626B] border border-[#FF626B]/30 flex items-center justify-center">
                      <AlertTriangle className="w-3.5 h-3.5" />
                    </div>
                  ) : n.type === 'success' ? (
                    <div className="w-6 h-6 rounded-lg bg-[#00E6C3]/20 text-[#00E6C3] border border-[#00E6C3]/30 flex items-center justify-center">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-lg bg-[#07141D] text-[#A8BBC8] border border-[#193543] flex items-center justify-center">
                      <Bell className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#F4F8FC] truncate">{n.title}</span>
                    <span className="text-[10px] text-[#5A7382] shrink-0 ml-1">{n.time}</span>
                  </div>
                  <p className="text-[11px] text-[#A8BBC8] line-clamp-2 mt-0.5">{n.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
