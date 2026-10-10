'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { HolographicShield } from './HolographicShield';
import { CyberPedestal } from './CyberPedestal';

export function SculptedGlobe() {
  const globeMeshRef = useRef<THREE.Mesh>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);

  // Load sculpted ceramic textures with proper colorSpace configuration
  const { diffuseMap, bumpMap, roughnessMap } = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const dMap = loader.load('/earth_diffuse_sculpted.jpg');
    dMap.colorSpace = THREE.SRGBColorSpace;

    const bMap = loader.load('/earth_bump_sculpted.jpg');
    const rMap = loader.load('/earth_roughness_sculpted.jpg');

    return { diffuseMap: dMap, bumpMap: bMap, roughnessMap: rMap };
  }, []);

  // Continuous globe rotation
  useFrame((_, delta) => {
    if (globeMeshRef.current) {
      globeMeshRef.current.rotation.y += delta * 0.06;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * 0.04;
    }
  });

  return (
    <group>
      {/* Main Dark Cyber Earth Sphere */}
      <mesh
        ref={globeMeshRef}
        rotation={[0.15, -Math.PI * 0.35, 0]}
        receiveShadow
        castShadow
      >
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshStandardMaterial
          map={diffuseMap}
          bumpMap={bumpMap}
          bumpScale={0.07}
          roughnessMap={roughnessMap}
          roughness={0.6}
          metalness={0.25}
          color="#0A2838"
        />
      </mesh>

      {/* Luminous cyan/emerald atmospheric glow hugging the globe */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.035, 64, 64]} />
        <meshStandardMaterial
          color="#00E6C3"
          transparent
          opacity={0.16}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Cyan Halo */}
      <mesh>
        <sphereGeometry args={[2.08, 48, 48]} />
        <meshStandardMaterial
          color="#38D9FF"
          transparent
          opacity={0.08}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Center 3D Holographic Shield with Padlock */}
      <HolographicShield />

      {/* High-Tech Glowing Pedestal beneath the globe */}
      <CyberPedestal />
    </group>
  );
}
