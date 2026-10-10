'use client';

import React from 'react';
import { Search, Shield, Sparkles, Loader2 } from 'lucide-react';

interface TopNavProps {
  onLoginClick: () => void;
  onGetStartedClick?: () => void;
  activeNav?: string;
  onNavClick: (nav: string) => void;
  onOpenSearch: () => void;
  onOpenFeatures: () => void;
  onOpenAbout: () => void;
}

export function TopNav({
  onLoginClick,
  onNavClick,
  onOpenSearch,
  onOpenFeatures,
  onOpenAbout,
}: TopNavProps) {

  return (
    <header className="fixed top-0 left-0 right-0 z-40 px-6 sm:px-8 py-5 flex items-center justify-between pointer-events-auto select-none bg-gradient-to-b from-[#020A10]/90 to-transparent backdrop-blur-xs">
      {/* Brand Logo & Wordmark matching Reference */}
      <button
        onClick={() => onNavClick('home')}
        className="flex items-center gap-3 cursor-pointer group text-left border-0 bg-transparent focus-visible:ring-2 focus-visible:ring-[#00E6C3] rounded-lg p-1"
        aria-label="Q-SHIELD Home"
      >
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#00E6C3] to-[#0F766E] flex items-center justify-center shadow-lg shadow-[#00E6C3]/20 text-[#020A10] transition-transform group-hover:scale-105">
          <Shield className="w-5 h-5 fill-[#020A10] text-[#020A10]" />
        </div>
        <div className="flex flex-col">
          <span className="font-bold text-lg tracking-wider text-[#F4F8FC] group-hover:text-white transition-colors">
            Q-SHIELD
          </span>
          <span className="text-[10px] font-medium tracking-widest uppercase text-[#00E6C3] -mt-1">
            Quantum Cyber Defense
          </span>
        </div>
      </button>

      {/* Center Nav Links */}
      <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-6">
        {[
          { id: 'features', label: 'Features', action: onOpenFeatures },
          { id: 'about', label: 'About', action: onOpenAbout },
        ].map((item) => (
          <button
            key={item.id}
            onClick={item.action}
            className="text-xs uppercase tracking-wider font-semibold text-[#5A7382] hover:text-[#00E6C3] transition-colors cursor-pointer py-1"
          >
            {item.label}
          </button>
        ))}
      </nav>

      {/* Right Controls: Initializing status + Login matching Reference Image */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Environment Status Indicator matching Reference Image */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#07141D]/80 border border-[#193543] text-[11px] text-[#A8BBC8]">
          <span className="text-[#A8BBC8]">Initializing Secure Environment...</span>
          <Loader2 className="w-3.5 h-3.5 text-[#00E6C3] animate-spin" />
        </div>

        {/* Search button (Ctrl+K) */}
        <button
          onClick={onOpenSearch}
          aria-label="Quick Search (Ctrl+K)"
          title="Quick Search (Ctrl+K)"
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#07141D] border border-[#193543] text-[#A8BBC8] hover:text-[#00E6C3] hover:border-[#00E6C3]/40 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-[#00E6C3]"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* Log In Outlined Button */}
        <button
          onClick={onLoginClick}
          className="px-4 py-1.5 rounded-full border border-[#00E6C3]/60 text-xs font-semibold text-[#00E6C3] bg-[#07141D]/90 hover:bg-[#00E6C3] hover:text-[#020A10] transition-all cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-[#00E6C3]"
        >
          Log In
        </button>
      </div>
    </header>
  );
}

// Bottom right subtle cyan sparkle decorative element
export function BottomRightSparkle() {
  return (
    <div className="fixed bottom-6 right-6 z-20 pointer-events-none opacity-40 select-none">
      <Sparkles className="w-6 h-6 text-[#00E6C3] fill-[#00E6C3] stroke-none drop-shadow-[0_0_8px_#00E6C3]" />
    </div>
  );
}
