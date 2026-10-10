'use client';

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function HolographicShield() {
  const groupRef = useRef<THREE.Group>(null);
  const outerRingRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (groupRef.current) {
      // Gentle floating breathing animation
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.04;
    }
    if (outerRingRef.current) {
      outerRingRef.current.rotation.z = t * 0.2;
    }
  });

  // Create Shield 2D Shape to extrude
  const shieldShape = React.useMemo(() => {
    const shape = new THREE.Shape();
    // Shield dimensions centered around (0,0)
    // Top-left to top-right
    shape.moveTo(-0.6, 0.7);
    shape.quadraticCurveTo(0, 0.85, 0.6, 0.7);
    // Right side curve down to bottom tip
    shape.quadraticCurveTo(0.65, 0.0, 0.5, -0.4);
    shape.quadraticCurveTo(0.25, -0.75, 0, -0.9);
    // Left side curve back up
    shape.quadraticCurveTo(-0.25, -0.75, -0.5, -0.4);
    shape.quadraticCurveTo(-0.65, 0.0, -0.6, 0.7);
    return shape;
  }, []);

  return (
    <group ref={groupRef} position={[0, 0, 2.3]}>
      {/* Outer ambient energy ring */}
      <mesh ref={outerRingRef} position={[0, 0, -0.05]}>
        <ringGeometry args={[1.1, 1.15, 64]} />
        <meshBasicMaterial
          color="#38D9FF"
          transparent
          opacity={0.35}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Outer Shield Outline */}
      <mesh>
        <shapeGeometry args={[shieldShape]} />
        <meshBasicMaterial
          color="#00E6C3"
          transparent
          opacity={0.25}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Inner Shield border line */}
      <lineSegments>
        <edgesGeometry args={[new THREE.ShapeGeometry(shieldShape)]} />
        <lineBasicMaterial color="#38D9FF" linewidth={2} transparent opacity={0.9} />
      </lineSegments>

      {/* Padlock Base (Rectangle with rounded corners) */}
      <mesh position={[0, -0.22, 0.05]}>
        <boxGeometry args={[0.34, 0.28, 0.04]} />
        <meshStandardMaterial
          color="#07141D"
          emissive="#00E6C3"
          emissiveIntensity={0.6}
          roughness={0.2}
          metalness={0.8}
        />
      </mesh>

      {/* Keyhole Dot & Bar */}
      <mesh position={[0, -0.2, 0.08]}>
        <circleGeometry args={[0.035, 16]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>
      <mesh position={[0, -0.25, 0.08]}>
        <planeGeometry args={[0.02, 0.06]} />
        <meshBasicMaterial color="#FFFFFF" />
      </mesh>

      {/* Padlock Shackle (Torus arch) */}
      <mesh position={[0, -0.05, 0.05]} rotation={[0, 0, 0]}>
        <torusGeometry args={[0.13, 0.035, 16, 32, Math.PI]} />
        <meshStandardMaterial
          color="#38D9FF"
          emissive="#38D9FF"
          emissiveIntensity={0.8}
          metalness={0.9}
        />
      </mesh>

      {/* Central Glow Particle */}
      <pointLight color="#00E6C3" intensity={3.5} distance={3} decay={2} position={[0, 0, 0.2]} />
    </group>
  );
}
