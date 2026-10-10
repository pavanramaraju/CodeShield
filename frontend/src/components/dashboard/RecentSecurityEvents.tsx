'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { SecurityEventItem } from '@/types';

interface RecentSecurityEventsProps {
  events: SecurityEventItem[];
  onSelectEvent: (event: SecurityEventItem) => void;
  onViewAll?: () => void;
  searchFilter?: string;
}

export function RecentSecurityEvents({
  events,
  onSelectEvent,
  onViewAll,
  searchFilter = '',
}: RecentSecurityEventsProps) {
  const [internalSearch, setInternalSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const activeSearch = internalSearch || searchFilter;

  const filteredEvents = useMemo(() => {
    return events.filter((e) => {
      const matchesSearch =
        !activeSearch ||
        e.id.toLowerCase().includes(activeSearch.toLowerCase()) ||
        e.category.toLowerCase().includes(activeSearch.toLowerCase()) ||
        e.targetService.toLowerCase().includes(activeSearch.toLowerCase()) ||
        e.username.toLowerCase().includes(activeSearch.toLowerCase()) ||
        e.ipAddress.toLowerCase().includes(activeSearch.toLowerCase()) ||
        (e.device && e.device.toLowerCase().includes(activeSearch.toLowerCase()));

      const matchesSeverity =
        severityFilter === 'all' || e.status === severityFilter;

      return matchesSearch && matchesSeverity;
    });
  }, [events, activeSearch, severityFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const displayedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage]);

  return (
    <div className="bg-[#0B1D29] rounded-2xl p-5 border border-[#1E3A52] shadow-xl shadow-[#030B12]/50 select-none flex flex-col justify-between">
      {/* Header with Title and Search/Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-[#FFFFFF] tracking-wide">
              Recent Security Events
            </h2>
            <span className="text-[10px] text-[#00E5FF] font-bold bg-[#081722] px-2.5 py-0.5 rounded-full border border-[#1E3A52] shadow-xs">
              {filteredEvents.length} Recorded
            </span>
          </div>
          <p className="text-[11px] text-[#CBD5E1] mt-0.5">
            Audit trail of identity anomalies, volumetric bursts, and honeypot probes
          </p>
        </div>

        {/* Search, Filter, View All */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#94A3B8]" />
            <input
              type="text"
              value={internalSearch}
              onChange={(e) => {
                setInternalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter events..."
              className="w-36 sm:w-44 pl-8 pr-2.5 py-1 rounded-full bg-[#081722] border border-[#1E3A52] text-[11px] text-[#FFFFFF] placeholder-[#94A3B8] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by severity"
            className="px-2.5 py-1 rounded-full bg-[#081722] border border-[#1E3A52] text-[11px] text-[#CBD5E1] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="high-risk">Critical / High</option>
            <option value="suspicious">Suspicious</option>
            <option value="safe">Safe</option>
          </select>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="px-2.5 py-1 rounded-full bg-[#00E5FF]/20 hover:bg-[#00E5FF]/30 border border-[#00E5FF] text-[11px] font-extrabold text-[#00E5FF] transition-all cursor-pointer shadow-[0_0_8px_rgba(0,229,255,0.2)]"
            >
              View All
            </button>
          )}
        </div>
      </div>

      {/* Events Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-[#1E3A52] text-[#CBD5E1] text-[10px] uppercase font-bold tracking-wider">
              <th className="py-2 px-3">Event ID</th>
              <th className="py-2 px-3">Type</th>
              <th className="py-2 px-3">Source IP</th>
              <th className="py-2 px-3 hidden md:table-cell">Device / Client</th>
              <th className="py-2 px-3">Timestamp</th>
              <th className="py-2 px-3 text-right">Risk Score</th>
              <th className="py-2 px-3 text-center">Severity</th>
              <th className="py-2 px-3 text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1E3A52]/60 text-[11px]">
            {displayedEvents.map((evt) => {
              const isHigh = evt.status === 'high-risk' || evt.riskScore >= 75;
              const isMed = evt.status === 'suspicious' || (evt.riskScore >= 35 && evt.riskScore < 75);

              return (
                <tr
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="hover:bg-[#081722] transition-colors cursor-pointer group"
                >
                  {/* Event Identifier */}
                  <td className="py-2.5 px-3 font-mono font-bold text-[#00E5FF] group-hover:underline">
                    {evt.id}
                  </td>

                  {/* Event Type / Category */}
                  <td className="py-2.5 px-3 text-[#FFFFFF] font-bold">
                    {evt.category}
                  </td>

                  {/* Anonymized Source IP */}
                  <td className="py-2.5 px-3 font-mono text-[#E2E8F0]">
                    {evt.ipAddress}
                  </td>

                  {/* Device / Client */}
                  <td className="py-2.5 px-3 text-[#94A3B8] hidden md:table-cell truncate max-w-[150px]">
                    {evt.device || 'Enterprise Chrome / MacOS'}
                  </td>

                  {/* Timestamp */}
                  <td className="py-2.5 px-3 text-[#CBD5E1] whitespace-nowrap font-medium">
                    {evt.timestamp}
                  </td>

                  {/* Risk Score */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    <span
                      style={{
                        color: isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#00F5A0',
                      }}
                    >
                      {evt.riskScore}/100
                    </span>
                  </td>

                  {/* Severity Badge */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${
                        isHigh
                          ? 'bg-[#EF4444]/20 border-[#EF4444] text-[#EF4444]'
                          : isMed
                          ? 'bg-[#F59E0B]/20 border-[#F59E0B] text-[#F59E0B]'
                          : 'bg-[#00F5A0]/20 border-[#00F5A0] text-[#00F5A0] shadow-[0_0_6px_rgba(0,245,160,0.2)]'
                      }`}
                    >
                      {isHigh ? 'Critical' : isMed ? 'Suspicious' : 'Safe'}
                    </span>
                  </td>

                  {/* Investigation Status */}
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[#CBD5E1] text-[10px] font-semibold group-hover:text-[#00E5FF] transition-colors">
                      {evt.investigationStatus || (isHigh ? 'Investigating' : 'Resolved')} →
                    </span>
                  </td>
                </tr>
              );
            })}

            {displayedEvents.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#94A3B8]">
                  No security events match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1E3A52] text-[11px] text-[#CBD5E1]">
        <span>
          Showing page <strong className="text-[#FFFFFF]">{currentPage}</strong> of <strong className="text-[#FFFFFF]">{totalPages}</strong>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="p-1 rounded-lg bg-[#081722] border border-[#1E3A52] text-[#CBD5E1] hover:text-[#00E5FF] hover:border-[#00E5FF] disabled:opacity-40 cursor-pointer transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="p-1 rounded-lg bg-[#081722] border border-[#1E3A52] text-[#CBD5E1] hover:text-[#00E5FF] hover:border-[#00E5FF] disabled:opacity-40 cursor-pointer transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
