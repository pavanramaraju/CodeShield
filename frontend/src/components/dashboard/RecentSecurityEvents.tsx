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
    <div className="bg-[#0B1D29] rounded-2xl p-5 border border-[#1A2E3D] shadow-lg shadow-[#030B12]/40 select-none flex flex-col justify-between">
      {/* Header with Title and Search/Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-[#F4F8FC] tracking-wide">
              Recent Security Events
            </h2>
            <span className="text-[10px] text-[#A8BBC8] bg-[#081722] px-2 py-0.5 rounded-full border border-[#1A2E3D]">
              {filteredEvents.length} Recorded
            </span>
          </div>
          <p className="text-[11px] text-[#A8BBC8] mt-0.5">
            Audit trail of identity anomalies, volumetric bursts, and honeypot probes
          </p>
        </div>

        {/* Search, Filter, View All */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#5A7382]" />
            <input
              type="text"
              value={internalSearch}
              onChange={(e) => {
                setInternalSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Filter events..."
              className="w-36 sm:w-44 pl-8 pr-2.5 py-1 rounded-full bg-[#081722] border border-[#1A2E3D] text-[11px] text-[#F4F8FC] placeholder-[#5A7382] focus:outline-none focus:ring-1 focus:ring-[#00E5FF]"
            />
          </div>

          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            aria-label="Filter by severity"
            className="px-2.5 py-1 rounded-full bg-[#081722] border border-[#1A2E3D] text-[11px] text-[#A8BBC8] focus:outline-none focus:ring-1 focus:ring-[#00E5FF] cursor-pointer"
          >
            <option value="all">All Severities</option>
            <option value="high-risk">Critical / High</option>
            <option value="suspicious">Suspicious</option>
            <option value="safe">Safe</option>
          </select>

          {onViewAll && (
            <button
              onClick={onViewAll}
              className="px-2.5 py-1 rounded-full bg-[#00E5FF]/10 hover:bg-[#00E5FF]/20 border border-[#00E5FF]/30 text-[11px] font-bold text-[#00E5FF] transition-colors cursor-pointer"
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
            <tr className="border-b border-[#1A2E3D] text-[#5A7382] text-[10px] uppercase font-bold tracking-wider">
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
          <tbody className="divide-y divide-[#1A2E3D]/50 text-[11px]">
            {displayedEvents.map((evt) => {
              const isHigh = evt.status === 'high-risk' || evt.riskScore >= 75;
              const isMed = evt.status === 'suspicious' || (evt.riskScore >= 35 && evt.riskScore < 75);

              return (
                <tr
                  key={evt.id}
                  onClick={() => onSelectEvent(evt)}
                  className="hover:bg-[#081722]/80 transition-colors cursor-pointer group"
                >
                  {/* Event Identifier */}
                  <td className="py-2.5 px-3 font-mono font-bold text-[#00E5FF] group-hover:underline">
                    {evt.id}
                  </td>

                  {/* Event Type / Category */}
                  <td className="py-2.5 px-3 text-[#F4F8FC] font-semibold">
                    {evt.category}
                  </td>

                  {/* Anonymized Source IP */}
                  <td className="py-2.5 px-3 font-mono text-[#A8BBC8]">
                    {evt.ipAddress}
                  </td>

                  {/* Device / Client */}
                  <td className="py-2.5 px-3 text-[#5A7382] hidden md:table-cell truncate max-w-[150px]">
                    {evt.device || 'Enterprise Chrome / MacOS'}
                  </td>

                  {/* Timestamp */}
                  <td className="py-2.5 px-3 text-[#A8BBC8] whitespace-nowrap">
                    {evt.timestamp}
                  </td>

                  {/* Risk Score */}
                  <td className="py-2.5 px-3 text-right font-mono font-bold">
                    <span
                      style={{
                        color: isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#10B981',
                      }}
                    >
                      {evt.riskScore}/100
                    </span>
                  </td>

                  {/* Severity Badge */}
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                        isHigh
                          ? 'bg-[#EF4444]/15 border-[#EF4444]/30 text-[#EF4444]'
                          : isMed
                          ? 'bg-[#F59E0B]/15 border-[#F59E0B]/30 text-[#F59E0B]'
                          : 'bg-[#10B981]/15 border-[#10B981]/30 text-[#10B981]'
                      }`}
                    >
                      {isHigh ? 'Critical' : isMed ? 'Suspicious' : 'Safe'}
                    </span>
                  </td>

                  {/* Investigation Status */}
                  <td className="py-2.5 px-3 text-right">
                    <span className="text-[#A8BBC8] text-[10px] font-medium group-hover:text-[#00E5FF] transition-colors">
                      {evt.investigationStatus || (isHigh ? 'Investigating' : 'Resolved')} →
                    </span>
                  </td>
                </tr>
              );
            })}

            {displayedEvents.length === 0 && (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[#5A7382]">
                  No security events match the current filter criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex items-center justify-between pt-3 mt-3 border-t border-[#1A2E3D] text-[11px] text-[#A8BBC8]">
        <span>
          Showing page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            aria-label="Previous page"
            className="p-1 rounded-lg bg-[#081722] border border-[#1A2E3D] hover:border-[#00E5FF]/40 disabled:opacity-40 cursor-pointer"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            aria-label="Next page"
            className="p-1 rounded-lg bg-[#081722] border border-[#1A2E3D] hover:border-[#00E5FF]/40 disabled:opacity-40 cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
