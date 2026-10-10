'use client';

import React, { useState, useMemo } from 'react';
import { SecurityEventItem } from '@/types';
import {
  RefreshCw,
  Search,
  ArrowUpDown,
  Download,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Atom,
  MoreHorizontal,
} from 'lucide-react';

interface AnomalyDetectionLogProps {
  events: SecurityEventItem[];
  onSelectEvent: (event: SecurityEventItem) => void;
  searchFilter?: string;
  initialStatusFilter?: 'all' | 'safe' | 'suspicious' | 'high-risk';
}

type SortColumn = 'riskScore' | 'id' | 'category';

export function AnomalyDetectionLog({
  events,
  onSelectEvent,
  searchFilter = '',
  initialStatusFilter = 'all',
}: AnomalyDetectionLogProps) {
  const [internalSearch, setInternalSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'safe' | 'suspicious' | 'high-risk'>(initialStatusFilter);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortColumn | null>(null);
  const [sortDesc, setSortDesc] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const [prevInitial, setPrevInitial] = useState(initialStatusFilter);
  if (prevInitial !== initialStatusFilter) {
    setPrevInitial(initialStatusFilter);
    setStatusFilter(initialStatusFilter);
    setCurrentPage(1);
  }

  const activeSearch = internalSearch || searchFilter;

  // Distinct categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.category));
    return Array.from(set);
  }, [events]);

  const filteredEvents = useMemo(() => {
    return events
      .filter((e) => {
        const matchesSearch =
          !activeSearch ||
          e.id.toLowerCase().includes(activeSearch.toLowerCase()) ||
          e.category.toLowerCase().includes(activeSearch.toLowerCase()) ||
          e.targetService.toLowerCase().includes(activeSearch.toLowerCase()) ||
          e.username.toLowerCase().includes(activeSearch.toLowerCase()) ||
          e.ipAddress.toLowerCase().includes(activeSearch.toLowerCase());

        const matchesStatus =
          statusFilter === 'all' || e.status === statusFilter;

        const matchesCategory =
          categoryFilter === 'all' || e.category === categoryFilter;

        return matchesSearch && matchesStatus && matchesCategory;
      })
      .sort((a, b) => {
        if (sortBy === 'riskScore') {
          return sortDesc ? b.riskScore - a.riskScore : a.riskScore - b.riskScore;
        }
        if (sortBy === 'id') {
          return sortDesc ? b.id.localeCompare(a.id) : a.id.localeCompare(b.id);
        }
        if (sortBy === 'category') {
          return sortDesc ? b.category.localeCompare(a.category) : a.category.localeCompare(b.category);
        }
        return 0;
      });
  }, [events, activeSearch, statusFilter, categoryFilter, sortBy, sortDesc]);

  // Pagination slice
  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / pageSize));
  const displayedEvents = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredEvents.slice(start, start + pageSize);
  }, [filteredEvents, currentPage]);

  const handleSort = (column: SortColumn) => {
    if (sortBy === column) {
      setSortDesc(!sortDesc);
    } else {
      setSortBy(column);
      setSortDesc(true);
    }
    setCurrentPage(1);
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Category', 'Status', 'RiskScore', 'IPAddress', 'TargetService', 'Username'];
    const rows = filteredEvents.map((e) => [
      e.id,
      `"${e.category}"`,
      e.status,
      e.riskScore,
      e.ipAddress,
      `"${e.targetService}"`,
      e.username,
    ]);
    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `qshield_anomalies_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleResetFilters = () => {
    setInternalSearch('');
    setStatusFilter('all');
    setCategoryFilter('all');
    setSortBy(null);
    setSortDesc(true);
    setCurrentPage(1);
  };

  return (
    <div className="bg-[#0A1C26] rounded-2xl p-5 border border-[#193543] shadow-lg shadow-[#020A10]/40 flex flex-col h-full select-none">
      {/* Header matching Reference Image: "Recent Security Events" + "View All" */}
      <div className="flex items-center justify-between mb-3.5">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-bold text-[#F4F8FC] tracking-wide">
            Recent Security Events
          </h2>
          <span className="text-[11px] text-[#A8BBC8] hidden sm:inline">
            Showing {filteredEvents.length} of {events.length} records
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              handleResetFilters();
            }}
            className="text-xs font-semibold text-[#00E6C3] hover:underline cursor-pointer"
          >
            View All
          </button>

          <button
            onClick={handleExportCSV}
            className="p-1.5 rounded-lg bg-[#07141D] hover:bg-[#0E2431] border border-[#193543] text-[#A8BBC8] hover:text-[#00E6C3] transition-colors cursor-pointer flex items-center gap-1 text-[11px] font-semibold"
            title="Export filtered records to CSV"
            aria-label="Export filtered records to CSV"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">CSV</span>
          </button>

          <button
            onClick={handleResetFilters}
            className="p-1.5 rounded-lg bg-[#07141D] hover:bg-[#0E2431] border border-[#193543] transition-colors cursor-pointer text-[#A8BBC8] hover:text-[#00E6C3]"
            title="Reset filters and sorting"
            aria-label="Reset filters"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Filter and Inline Search Toolbar */}
      <div className="flex flex-wrap items-center gap-2 mb-3.5">
        <div className="relative flex-1 min-w-[130px]">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-[#5A7382]" />
          <input
            type="text"
            value={internalSearch}
            onChange={(e) => {
              setInternalSearch(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Filter log..."
            className="w-full pl-8 pr-2 py-1.5 rounded-lg bg-[#07141D] border border-[#193543] text-xs text-[#F4F8FC] placeholder-[#5A7382] focus:outline-none focus:ring-1 focus:ring-[#00E6C3]"
          />
        </div>

        {/* Severity Status Dropdown */}
        <select
          value={statusFilter}
          aria-label="Filter by severity status"
          onChange={(e) => {
            setStatusFilter(e.target.value as 'all' | 'safe' | 'suspicious' | 'high-risk');
            setCurrentPage(1);
          }}
          className="py-1.5 px-2.5 text-xs rounded-lg bg-[#07141D] border border-[#193543] text-[#F4F8FC] font-medium focus:outline-none focus:ring-1 focus:ring-[#00E6C3] cursor-pointer"
        >
          <option value="all">All Severities</option>
          <option value="high-risk">High Risk</option>
          <option value="suspicious">Suspicious / Medium</option>
          <option value="safe">Safe / Normal</option>
        </select>

        {/* Threat Category Dropdown */}
        <select
          value={categoryFilter}
          aria-label="Filter by category"
          onChange={(e) => {
            setCategoryFilter(e.target.value);
            setCurrentPage(1);
          }}
          className="py-1.5 px-2.5 text-xs rounded-lg bg-[#07141D] border border-[#193543] text-[#F4F8FC] font-medium focus:outline-none focus:ring-1 focus:ring-[#00E6C3] cursor-pointer max-w-[140px] truncate"
        >
          <option value="all">All Categories</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      {/* Table Column Headers matching Reference Image */}
      <div className="grid grid-cols-12 text-[11px] font-bold text-[#A8BBC8] pb-2 border-b border-[#193543] px-2 select-none">
        <button
          onClick={() => handleSort('id')}
          className="col-span-2 text-left flex items-center gap-1 hover:text-[#F4F8FC] cursor-pointer"
        >
          <span>ID</span>
          <span className="sr-only">Username / ID</span>
          <ArrowUpDown className="w-2.5 h-2.5" />
        </button>

        <span className="col-span-2 text-left">Time</span>

        <button
          onClick={() => handleSort('category')}
          className="col-span-3 text-left flex items-center gap-1 hover:text-[#F4F8FC] cursor-pointer"
        >
          <span>Event Type</span>
          <span className="sr-only">Cyber connections</span>
          <ArrowUpDown className="w-2.5 h-2.5" />
        </button>

        <button
          onClick={() => handleSort('riskScore')}
          className="col-span-2 text-center flex items-center justify-center gap-1 hover:text-[#F4F8FC] cursor-pointer"
        >
          <span>Risk Score</span>
          <span className="sr-only">Type</span>
          <ArrowUpDown className="w-2.5 h-2.5" />
        </button>

        <span className="col-span-2 text-center">Status</span>

        <span className="col-span-1 text-right">Actions</span>
      </div>

      {/* Event Items List */}
      <div className="flex-1 overflow-y-auto divide-y divide-[#193543]/60 min-h-[220px] pr-1">
        {displayedEvents.length === 0 ? (
          <div className="py-10 text-center text-xs text-[#5A7382] space-y-2">
            <div>No records found matching filters</div>
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-[#00E6C3] hover:underline cursor-pointer"
            >
              Reset filters
            </button>
          </div>
        ) : (
          displayedEvents.map((event) => {
            const isHighRisk = event.status === 'high-risk';
            const isSuspicious = event.status === 'suspicious';
            const decimalScore = (event.riskScore / 100).toFixed(2);

            // Action Badge logic matching reference screenshot
            let actionPill = (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#00E6C3]/15 text-[#00E6C3] border border-[#00E6C3]/30">
                <ShieldCheck className="w-3 h-3" />
                Verified
              </span>
            );

            if (isHighRisk) {
              actionPill = (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FF626B]/15 text-[#FF626B] border border-[#FF626B]/30">
                  <ShieldAlert className="w-3 h-3" />
                  Blocked
                </span>
              );
            } else if (isSuspicious) {
              if (event.category.includes('Device') || event.category.includes('Quantum')) {
                actionPill = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#38D9FF]/15 text-[#38D9FF] border border-[#38D9FF]/30">
                    <Atom className="w-3 h-3" />
                    Quantum
                  </span>
                );
              } else {
                actionPill = (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FFB020]/15 text-[#FFB020] border border-[#FFB020]/30">
                    <ShieldCheck className="w-3 h-3" />
                    Verify
                  </span>
                );
              }
            }

            return (
              <div
                key={event.id}
                role="button"
                tabIndex={0}
                onClick={() => onSelectEvent(event)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectEvent(event);
                  }
                }}
                aria-label={`Event ${event.id}: ${event.category}, risk ${event.status}. Click to open forensic telemetry.`}
                className="grid grid-cols-12 items-center py-2.5 px-2 hover:bg-[#07141D] focus-visible:bg-[#07141D] focus-visible:outline-none rounded-lg transition-colors cursor-pointer group text-xs"
              >
                {/* Event ID */}
                <div className="col-span-2 font-mono text-[11px] text-[#F4F8FC] font-semibold truncate group-hover:text-[#00E6C3] transition-colors">
                  {event.id}
                </div>

                {/* Time */}
                <div className="col-span-2 text-[#A8BBC8] text-[11px] truncate">
                  {event.timestamp}
                </div>

                {/* Event Type / Category */}
                <div className="col-span-3 text-[#F4F8FC] font-medium truncate pr-2">
                  {event.category}
                </div>

                {/* Risk Score + Risk Badge */}
                <div className="col-span-2 text-center flex items-center justify-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-[#A8BBC8]">
                    {decimalScore}
                  </span>
                  {isHighRisk ? (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FF626B]/20 text-[#FF626B] border border-[#FF626B]/30">
                      High Risk
                    </span>
                  ) : isSuspicious ? (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#FFB020]/20 text-[#FFB020] border border-[#FFB020]/30">
                      Medium
                    </span>
                  ) : (
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#00E6C3]/20 text-[#00E6C3] border border-[#00E6C3]/30">
                      Safe
                    </span>
                  )}
                </div>

                {/* Status / Defense Action Pill */}
                <div className="col-span-2 text-center">
                  {actionPill}
                </div>

                {/* Actions (...) */}
                <div className="col-span-1 text-right text-[#5A7382] group-hover:text-[#A8BBC8]">
                  <MoreHorizontal className="w-4 h-4 ml-auto" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Pagination Footer */}
      {filteredEvents.length > pageSize && (
        <div className="pt-3 border-t border-[#193543] flex items-center justify-between text-xs text-[#A8BBC8] select-none">
          <span>
            Page <strong className="text-[#F4F8FC]">{currentPage}</strong> of <strong className="text-[#F4F8FC]">{totalPages}</strong>
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              aria-label="Previous page"
              className="p-1 rounded-md border border-[#193543] bg-[#07141D] hover:bg-[#0E2431] text-[#F4F8FC] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              aria-label="Next page"
              className="p-1 rounded-md border border-[#193543] bg-[#07141D] hover:bg-[#0E2431] text-[#F4F8FC] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
