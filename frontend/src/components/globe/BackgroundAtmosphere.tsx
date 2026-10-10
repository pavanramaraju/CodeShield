'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface BackgroundAtmosphereProps {
  reducedMotion?: boolean;
}

export function BackgroundAtmosphere({ reducedMotion = false }: BackgroundAtmosphereProps) {
  const particlesRef = useRef<THREE.Points>(null);
  const gridRef = useRef<THREE.Group>(null);

  // Floating ambient digital particles with depth in the background
  const particlesGeo = useMemo(() => {
    const count = 420;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    const cyan = new THREE.Color('#00E6C3');
    const blue = new THREE.Color('#38D9FF');
    const darkNavy = new THREE.Color('#0F4C64');
    const tempColor = new THREE.Color();

    for (let i = 0; i < count; i++) {
      // Scatter in a wide cylinder behind and around the globe
      const theta = (i / count) * Math.PI * 2 + (i % 7);
      const r = 3.5 + ((i * 17) % 65) * 0.08;
      const x = Math.cos(theta) * r;
      const y = ((i * 31) % 100) * 0.08 - 4.0;
      const z = -2.5 - ((i * 13) % 40) * 0.15;

      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;

      // Color variation
      const choice = i % 3;
      if (choice === 0) tempColor.copy(cyan);
      else if (choice === 1) tempColor.copy(blue);
      else tempColor.copy(darkNavy);

      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // Faint perspective matrix grid lines in the distant background
  const backgroundGridGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const lines: THREE.Vector3[] = [];
    const gridSize = 14;
    const step = 1.0;

    // Horizontal lines
    for (let y = -7; y <= 7; y += step) {
      lines.push(new THREE.Vector3(-gridSize, y, -7.5));
      lines.push(new THREE.Vector3(gridSize, y, -7.5));
    }

    // Vertical lines
    for (let x = -gridSize; x <= gridSize; x += step * 1.5) {
      lines.push(new THREE.Vector3(x, -7, -7.5));
      lines.push(new THREE.Vector3(x, 7, -7.5));
    }

    const pos = new Float32Array(lines.length * 3);
    for (let i = 0; i < lines.length; i++) {
      pos[i * 3] = lines[i].x;
      pos[i * 3 + 1] = lines[i].y;
      pos[i * 3 + 2] = lines[i].z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return geo;
  }, []);

  // Subtle floating motion
  useFrame((state, delta) => {
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * (reducedMotion ? 0.005 : 0.015);
      particlesRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.1) * 0.03;
    }
    if (gridRef.current) {
      gridRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.2) * 0.05;
    }
  });

  return (
    <>
      {/* ========================================================= */}
      {/* CINEMATIC LIGHTING RIG                                    */}
      {/* ========================================================= */}
      {/* 1. Large key light with subtle cool cyan tint */}
      <directionalLight
        position={[-5.5, 5.0, 4.2]}
        intensity={2.8}
        color="#E0FAFF"
      />

      {/* 2. Electric emerald fill light from opposite side */}
      <directionalLight
        position={[5.5, -2.5, 2.0]}
        intensity={1.4}
        color="#00E6C3"
      />

      {/* 3. Luminous cyan rim lighting from right edge */}
      <directionalLight
        position={[6.2, 1.2, -2.5]}
        intensity={3.2}
        color="#38D9FF"
      />

      {/* 4. Deep navy ambient base illumination for high contrast */}
      <ambientLight intensity={0.45} color="#020B14" />

      {/* ========================================================= */}
      {/* BACKGROUND PARTICLES & GRID WITH DEPTH                    */}
      {/* ========================================================= */}
      <points ref={particlesRef} geometry={particlesGeo}>
        <pointsMaterial
          size={0.032}
          vertexColors
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* Faint distant perspective grid */}
      <group ref={gridRef}>
        <lineSegments geometry={backgroundGridGeo}>
          <lineBasicMaterial
            color="#073347"
            transparent
            opacity={0.22}
            depthWrite={false}
          />
        </lineSegments>
      </group>
    </>
  );
}
