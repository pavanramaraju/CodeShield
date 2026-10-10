'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function CyberPedestal() {
  const ringsRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ringsRef.current) {
      ringsRef.current.rotation.y = t * 0.1;
    }
  });

  return (
    <group position={[0, -2.4, 0]}>
      {/* Base cylinder platform */}
      <mesh position={[0, -0.2, 0]}>
        <cylinderGeometry args={[2.5, 2.7, 0.4, 48]} />
        <meshStandardMaterial
          color="#07141D"
          roughness={0.4}
          metalness={0.8}
        />
      </mesh>

      {/* Top ring glowing lip */}
      <mesh position={[0, 0.01, 0]}>
        <cylinderGeometry args={[2.3, 2.45, 0.06, 48]} />
        <meshStandardMaterial
          color="#0A1C26"
          roughness={0.2}
          metalness={0.9}
        />
      </mesh>

      {/* Rotating concentric energy rings */}
      <group ref={ringsRef}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.6, 1.7, 64]} />
          <meshBasicMaterial
            color="#00E6C3"
            transparent
            opacity={0.85}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[1.9, 1.96, 64]} />
          <meshBasicMaterial
            color="#38D9FF"
            transparent
            opacity={0.65}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.05, 0]}>
          <ringGeometry args={[2.2, 2.25, 64]} />
          <meshBasicMaterial
            color="#00E6C3"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      </group>

      {/* Upward cyan spotlight */}
      <spotLight
        position={[0, 0.1, 0]}
        target-position={[0, 1, 0]}
        color="#00E6C3"
        intensity={2.8}
        angle={Math.PI / 3}
        penumbra={0.8}
        distance={4.5}
      />
    </group>
  );
}
