'use client';

import React, { useState, useEffect } from 'react';
import { Search, ShieldAlert, Atom, ArrowRight } from 'lucide-react';
import { DEMO_SECURITY_EVENTS } from '@/lib/mockData';
import { SecurityEventItem } from '@/types';

interface QuickSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectEvent: (event: SecurityEventItem) => void;
  onOpenQuantum: () => void;
}

export function QuickSearchModal({
  isOpen,
  onClose,
  onSelectEvent,
  onOpenQuantum,
}: QuickSearchModalProps) {
  const [query, setQuery] = useState('');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filteredEvents = DEMO_SECURITY_EVENTS.filter(
    (e) =>
      e.id.toLowerCase().includes(query.toLowerCase()) ||
      e.category.toLowerCase().includes(query.toLowerCase()) ||
      e.targetService.toLowerCase().includes(query.toLowerCase()) ||
      e.username.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-search-title"
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-[#020A10]/80 backdrop-blur-md animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="bg-[#0A1C26] rounded-2xl w-full max-w-xl border border-[#193543] shadow-2xl shadow-[#020A10] relative select-none overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-[#193543] gap-3">
          <Search className="w-5 h-5 text-[#00E6C3] shrink-0" />
          <input
            id="quick-search-title"
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search events, IPs, quantum jobs, target services..."
            className="w-full text-sm text-[#F4F8FC] placeholder-[#5A7382] bg-transparent focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-[#A8BBC8] hover:text-[#F4F8FC]"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            className="text-xs text-[#A8BBC8] hover:text-[#F4F8FC] bg-[#07141D] px-2 py-1 rounded-md border border-[#193543]"
          >
            ESC
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto divide-y divide-[#193543]/60 p-2 text-xs">
          {/* Quick Shortcuts */}
          <div className="p-2 space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#5A7382] tracking-wider px-2">
              System Modules
            </div>
            <button
              onClick={() => {
                onClose();
                onOpenQuantum();
              }}
              className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#07141D] text-left transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-[#00E6C3]/20 text-[#00E6C3] flex items-center justify-center">
                  <Atom className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-semibold text-[#F4F8FC]">Qiskit Quantum Kernel Engine</div>
                  <div className="text-[11px] text-[#A8BBC8]">Job ID: q-job-ibm-79402c-falcon</div>
                </div>
              </div>
              <ArrowRight className="w-4 h-4 text-[#5A7382] group-hover:text-[#00E6C3]" />
            </button>
          </div>

          {/* Security Events Search Results */}
          <div className="p-2 space-y-1">
            <div className="text-[10px] uppercase font-bold text-[#5A7382] tracking-wider px-2">
              Matching Telemetry Events ({filteredEvents.length})
            </div>
            {filteredEvents.length === 0 ? (
              <div className="p-4 text-center text-[#5A7382]">No events matching &quot;{query}&quot;</div>
            ) : (
              filteredEvents.map((evt) => (
                <button
                  key={evt.id}
                  onClick={() => {
                    onClose();
                    onSelectEvent(evt);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-[#07141D] text-left transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                        evt.status === 'high-risk'
                          ? 'bg-[#FF626B]/20 text-[#FF626B]'
                          : 'bg-[#00E6C3]/20 text-[#00E6C3]'
                      }`}
                    >
                      <ShieldAlert className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="font-medium text-[#F4F8FC]">
                        {evt.category} · <span className="font-mono text-[11px] text-[#00E6C3]">{evt.id}</span>
                      </div>
                      <div className="text-[11px] text-[#A8BBC8]">
                        Target: {evt.targetService} · IP: {evt.ipAddress}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      evt.status === 'high-risk'
                        ? 'bg-[#FF626B]/20 text-[#FF626B] border border-[#FF626B]/30'
                        : 'bg-[#00E6C3]/20 text-[#00E6C3] border border-[#00E6C3]/30'
                    }`}
                  >
                    {evt.status}
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
