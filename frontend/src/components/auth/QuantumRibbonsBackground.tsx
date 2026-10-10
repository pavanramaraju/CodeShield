'use client';

import React, { useEffect, useState } from 'react';

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function getReducedMotionServerSnapshot() {
  return false;
}

interface QuantumRibbonsBackgroundProps {
  children?: React.ReactNode;
}

export function QuantumRibbonsBackground({ children }: QuantumRibbonsBackgroundProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const reducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );

  useEffect(() => {
    if (typeof window === 'undefined' || reducedMotion) return;

    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePos({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [reducedMotion]);

  return (
    <div className="relative w-full h-full min-h-screen bg-[#000000] overflow-hidden flex items-center justify-center select-none">
      {/* ========================================================= */}
      {/* 1. SOFT CYAN & ELECTRIC-BLUE BLOOM NEBULAE                */}
      {/* ========================================================= */}
      <div
        className="absolute top-1/4 -right-20 w-[600px] h-[600px] rounded-full bg-[#0055FF]/15 blur-[140px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.8}px, ${mousePos.y * 0.8}px)`,
        }}
      />
      <div
        className="absolute bottom-1/4 -left-20 w-[500px] h-[500px] rounded-full bg-[#00D9FF]/12 blur-[130px] pointer-events-none transition-transform duration-700 ease-out"
        style={{
          transform: `translate(${-mousePos.x * 0.6}px, ${-mousePos.y * 0.6}px)`,
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-[#020B35]/50 blur-[160px] pointer-events-none" />

      {/* ========================================================= */}
      {/* 2. LARGE DIAGONAL ELECTRIC-BLUE ENERGY RIBBONS            */}
      {/* ========================================================= */}
      <div
        className="absolute inset-0 w-full h-full pointer-events-none transition-transform duration-500 ease-out"
        style={{
          transform: `translate(${mousePos.x * 0.4}px, ${mousePos.y * 0.4}px)`,
        }}
      >
        <svg
          className="w-full h-full object-cover"
          viewBox="0 0 1600 1000"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          preserveAspectRatio="xMidYMid slice"
        >
          <defs>
            {/* Ribbon 1 Gradient (Deep navy center with electric-blue core) */}
            <linearGradient id="ribbonGrad1" x1="1400" y1="-100" x2="200" y2="1100" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#020B35" stopOpacity="0.85" />
              <stop offset="35%" stopColor="#002888" stopOpacity="0.9" />
              <stop offset="65%" stopColor="#020B35" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#01061C" stopOpacity="0.8" />
            </linearGradient>

            {/* Ribbon 2 Gradient */}
            <linearGradient id="ribbonGrad2" x1="1600" y1="100" x2="400" y2="1200" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#001859" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#0035A8" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#010826" stopOpacity="0.75" />
            </linearGradient>

            {/* Edge Glow Filter */}
            <filter id="ribbonGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="8" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Cyan Edge Streamer Gradient */}
            <linearGradient id="streamerCyan" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0055FF" stopOpacity="0.4" />
              <stop offset="50%" stopColor="#00D9FF" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#0055FF" stopOpacity="0.4" />
            </linearGradient>
          </defs>

          {/* Ribbon 1: Massive Primary Diagonal Ribbon */}
          <path
            d="M 1550 -120 C 1350 250, 650 650, 150 1150 L 50 1150 C 550 650, 1250 250, 1420 -120 Z"
            fill="url(#ribbonGrad1)"
          />
          {/* Ribbon 1 Glowing Outer Edge */}
          <path
            d="M 1550 -120 C 1350 250, 650 650, 150 1150"
            stroke="#0055FF"
            strokeWidth="3.5"
            strokeOpacity="0.9"
            filter="url(#ribbonGlow)"
          />
          {/* Ribbon 1 Luminous Cyan Inner Edge */}
          <path
            d="M 1420 -120 C 1250 250, 550 650, 50 1150"
            stroke="#00D9FF"
            strokeWidth="2.5"
            strokeOpacity="0.85"
            filter="url(#ribbonGlow)"
          />

          {/* Ribbon 2: Secondary Diagonal Flowing Ribbon */}
          <path
            d="M 1750 80 C 1500 450, 850 820, 420 1250 L 320 1250 C 750 820, 1400 450, 1620 80 Z"
            fill="url(#ribbonGrad2)"
          />
          <path
            d="M 1750 80 C 1500 450, 850 820, 420 1250"
            stroke="#0055FF"
            strokeWidth="3"
            strokeOpacity="0.75"
            filter="url(#ribbonGlow)"
          />
          <path
            d="M 1620 80 C 1400 450, 750 820, 320 1250"
            stroke="#00D9FF"
            strokeWidth="2"
            strokeOpacity="0.7"
            filter="url(#ribbonGlow)"
          />

          {/* Ribbon 3: Intense Luminous Quantum Energy Streamer Line */}
          <path
            d="M 1300 -80 C 1100 280, 500 620, -50 1020"
            stroke="url(#streamerCyan)"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#ribbonGlow)"
            className={reducedMotion ? '' : 'animate-pulse'}
          />

          {/* Dynamic Traveling Light Pulses along the ribbon edges */}
          <path
            d="M 1480 -100 C 1280 260, 580 640, 100 1120"
            stroke="#FFFFFF"
            strokeWidth="3"
            strokeDasharray="80 380"
            strokeLinecap="round"
            filter="url(#ribbonGlow)"
            style={{
              animation: reducedMotion ? 'none' : 'travelingLight 6s linear infinite',
            }}
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes travelingLight {
          0% {
            stroke-dashoffset: 920;
          }
          100% {
            stroke-dashoffset: 0;
          }
        }
      `}</style>

      {/* ========================================================= */}
      {/* 3. CENTERED LOGIN CARD CONTAINER                          */}
      {/* ========================================================= */}
      <div className="relative z-10 w-full flex items-center justify-center p-4 sm:p-6">
        {children}
      </div>
    </div>
  );
}

export default QuantumRibbonsBackground;
