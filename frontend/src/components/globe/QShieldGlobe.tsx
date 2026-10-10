'use client';

import React, { Suspense, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { DigitalEarthSphere } from './DigitalEarthSphere';
import { NetworkArcConnections } from './NetworkArcConnections';
import { BackgroundAtmosphere } from './BackgroundAtmosphere';

function CameraRig({ reducedMotion }: { reducedMotion: boolean }) {
  const targetLook = useRef(new THREE.Vector3(0, 0, 0));

  useFrame((state) => {
    const isMobile = state.size.width < 768;
    const baseZ = isMobile ? 8.4 : 6.6;
    const targetY = isMobile ? -0.15 : 0.0;

    const t = state.clock.getElapsedTime();
    const mouseX = reducedMotion ? 0 : state.pointer.x * 0.28;
    const mouseY = reducedMotion ? 0 : state.pointer.y * 0.2;

    const swayX = Math.sin(t * 0.12) * 0.12 + mouseX;
    const swayY = Math.cos(t * 0.09) * 0.08 + mouseY + targetY;

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      swayX,
      0.025
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      swayY,
      0.025
    );
    state.camera.position.z = THREE.MathUtils.lerp(
      state.camera.position.z,
      baseZ,
      0.04
    );
    state.camera.lookAt(targetLook.current);
  });

  return null;
}

function GlobeLoadingFallback() {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-transparent select-none">
      <div className="relative w-28 h-28 flex items-center justify-center">
        <div className="absolute inset-0 rounded-full border-2 border-[#00E6C3]/20 animate-ping" />
        <div className="w-20 h-20 rounded-full border-2 border-[#00E6C3]/30 border-t-[#00E6C3] border-r-[#38D9FF] animate-spin" />
        <div className="absolute w-2 h-2 rounded-full bg-[#00E6C3] shadow-[0_0_12px_#00E6C3]" />
      </div>
      <div className="flex flex-col items-center gap-1">
        <span className="text-xs font-mono font-bold tracking-widest text-[#00E6C3] uppercase">
          Initializing Q-SHIELD 3D Globe
        </span>
        <span className="text-[10px] font-mono text-[#A8BBC8] tracking-wider">
          Rendering Digital Quantum Defense Core
        </span>
      </div>
    </div>
  );
}

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

interface QShieldGlobeProps {
  className?: string;
}

export function QShieldGlobe({ className = 'w-full h-full' }: QShieldGlobeProps) {
  const reducedMotion = React.useSyncExternalStore(
    subscribeReducedMotion,
    getReducedMotionSnapshot,
    getReducedMotionServerSnapshot
  );
  const containerRef = useRef<HTMLDivElement>(null);

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-full select-none overflow-hidden ${className}`}
      style={{
        background:
          'radial-gradient(ellipse at 50% 50%, #061B26 0%, #04131C 50%, #020A10 100%)',
      }}
    >
      <Suspense fallback={<GlobeLoadingFallback />}>
        <Canvas
          camera={{ position: [0, 0, 6.6], fov: 42 }}
          dpr={[1, 1.5]}
          gl={{
            antialias: true,
            alpha: true,
            powerPreference: 'high-performance',
          }}
          className="w-full h-full"
        >
          {/* 1. Cinematic 4-point lighting and atmospheric background particles */}
          <BackgroundAtmosphere reducedMotion={reducedMotion} />

          {/* 2. High-resolution digital Earth with 11k+ points, coastlines, and halos */}
          <DigitalEarthSphere reducedMotion={reducedMotion} />

          {/* 3. 3D Curved connection arcs, white-gold comets, and target hubs */}
          <NetworkArcConnections reducedMotion={reducedMotion} />

          {/* 4. Smooth camera sway and mouse parallax rig */}
          <CameraRig reducedMotion={reducedMotion} />
        </Canvas>
      </Suspense>
    </div>
  );
}

export default QShieldGlobe;
