'use client';

import React, { Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { SculptedGlobe } from './SculptedGlobe';
import { OrbitalNetworks } from './OrbitalNetworks';

function CameraRig() {
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    const mouseX = state.pointer.x * 0.35;
    const mouseY = state.pointer.y * 0.25;

    state.camera.position.x = THREE.MathUtils.lerp(
      state.camera.position.x,
      Math.sin(t * 0.15) * 0.15 + mouseX,
      0.02
    );
    state.camera.position.y = THREE.MathUtils.lerp(
      state.camera.position.y,
      Math.cos(t * 0.12) * 0.12 + mouseY,
      0.02
    );
    state.camera.lookAt(0, 0, 0);
  });

  return null;
}

function LightingSetup() {
  return (
    <>
      {/* 1. Large key light with subtle cyan tint */}
      <directionalLight
        position={[-5, 5, 4]}
        intensity={2.4}
        color="#E0FAFF"
        castShadow
      />

      {/* 2. Electric emerald fill light from opposite side */}
      <directionalLight
        position={[5, -2, 2]}
        intensity={1.2}
        color="#00E6C3"
      />

      {/* 3. Luminous cyan rim lighting from right edge */}
      <directionalLight
        position={[6, 1, -2]}
        intensity={2.8}
        color="#38D9FF"
      />

      {/* 4. Subtle ambient lighting */}
      <ambientLight intensity={0.9} color="#0A1C26" />
    </>
  );
}

function GlobeFallback() {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      <div className="w-64 h-64 rounded-full border-4 border-[#00E6C3]/40 animate-pulse bg-gradient-to-tr from-[#07141D] to-[#0A1C26] shadow-2xl flex items-center justify-center">
        <span className="text-sm font-medium text-[#38D9FF] tracking-wider">Initializing Q-SHIELD 3D Core...</span>
      </div>
    </div>
  );
}

export function CyberGlobeCanvas() {
  return (
    <div className="relative w-full h-full select-none">
      <Suspense fallback={<GlobeFallback />}>
        <Canvas
          camera={{ position: [0, 0, 6.8], fov: 42 }}
          dpr={[1, 2]}
          gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
          className="w-full h-full"
        >
          <LightingSetup />
          <SculptedGlobe />
          <OrbitalNetworks />
          <CameraRig />
        </Canvas>
      </Suspense>
    </div>
  );
}
