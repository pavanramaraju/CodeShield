'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';

interface OrbitalSplineData {
  curve: THREE.CatmullRomCurve3;
  color: string;
  isCoral: boolean;
  speed: number;
  offset: number;
  nodePositions: THREE.Vector3[];
  lineObject: THREE.Line;
}

function createDeterministicParticles(): THREE.BufferGeometry {
  const geo = new THREE.BufferGeometry();
  const count = 180;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const seed1 = (i * 9301 + 49297) % 233280;
    const rnd1 = seed1 / 233280;
    const seed2 = (seed1 * 9301 + 49297) % 233280;
    const rnd2 = seed2 / 233280;
    const seed3 = (seed2 * 49297 + 9301) % 233280;
    const rnd3 = seed3 / 233280;

    const radius = 2.4 + rnd1 * 1.5;
    const theta = rnd2 * Math.PI * 2;
    const phi = Math.acos(2 * rnd3 - 1);
    positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = radius * Math.cos(phi);
  }
  geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  return geo;
}

export function OrbitalNetworks() {
  const groupRef = useRef<THREE.Group>(null);
  const markersRef = useRef<(THREE.Mesh | null)[]>([]);
  const particlesRef = useRef<THREE.Points>(null);

  // Generate 8 electric teal/cyan paths and 3 threat-red paths
  const orbits: OrbitalSplineData[] = useMemo(() => {
    const list: OrbitalSplineData[] = [];

    const makeOrbit = (
      rX: number,
      rY: number,
      tiltX: number,
      tiltY: number,
      tiltZ: number,
      isCoral: boolean,
      speed: number,
      offset: number
    ): OrbitalSplineData => {
      const points: THREE.Vector3[] = [];
      const segments = 64;
      const euler = new THREE.Euler(tiltX, tiltY, tiltZ);

      for (let i = 0; i <= segments; i++) {
        const theta = (i / segments) * Math.PI * 2;
        const rawPt = new THREE.Vector3(
          Math.cos(theta) * rX,
          Math.sin(theta) * rY,
          Math.sin(theta * 2) * 0.15
        );
        rawPt.applyEuler(euler);
        points.push(rawPt);
      }

      const curve = new THREE.CatmullRomCurve3(points, true);
      const nodePositions = [
        curve.getPoint(0.1),
        curve.getPoint(0.45),
        curve.getPoint(0.78),
      ];

      const linePoints = curve.getPoints(90);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
      const splineColor = isCoral ? '#FF626B' : (offset % 2 === 0 ? '#00E6C3' : '#38D9FF');
      const lineMat = new THREE.LineBasicMaterial({
        color: splineColor,
        transparent: true,
        opacity: isCoral ? 0.9 : 0.65,
        depthWrite: false,
      });
      const lineObject = new THREE.Line(lineGeo, lineMat);

      return {
        curve,
        color: splineColor,
        isCoral,
        speed,
        offset,
        nodePositions,
        lineObject,
      };
    };

    // 8 Electric teal/cyan orbital splines
    list.push(makeOrbit(2.28, 2.38, 0.35, 0.2, 0.1, false, 0.03, 0.0));
    list.push(makeOrbit(2.35, 2.24, -0.4, 0.6, 0.3, false, 0.025, 0.2));
    list.push(makeOrbit(2.42, 2.45, 0.8, -0.3, 0.5, false, 0.035, 0.5));
    list.push(makeOrbit(2.32, 2.32, -0.7, -0.5, -0.2, false, 0.028, 0.7));
    list.push(makeOrbit(2.5, 2.38, 0.2, 1.1, -0.4, false, 0.032, 0.3));
    list.push(makeOrbit(2.24, 2.42, 1.2, 0.4, -0.6, false, 0.027, 0.8));
    list.push(makeOrbit(2.46, 2.52, -0.2, -0.9, 0.7, false, 0.031, 0.4));
    list.push(makeOrbit(2.4, 2.32, 0.5, -0.8, -0.5, false, 0.029, 0.6));

    // 3 Threat Red orbital splines with travelling markers
    list.push(makeOrbit(2.48, 2.32, -0.3, 0.4, 0.2, true, 0.045, 0.1));
    list.push(makeOrbit(2.35, 2.52, 0.6, 0.9, -0.3, true, 0.05, 0.45));
    list.push(makeOrbit(2.55, 2.4, -0.8, -0.4, 0.6, true, 0.04, 0.75));

    return list;
  }, []);

  // Floating particles around the globe
  const particleGeo = useMemo(() => createDeterministicParticles(), []);

  // Update travelling markers and slow overall group rotation
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.035;
    }
    if (particlesRef.current) {
      particlesRef.current.rotation.y += delta * 0.02;
    }

    const t = state.clock.getElapsedTime();

    orbits.forEach((orbit, index) => {
      if (orbit.isCoral && markersRef.current[index]) {
        const marker = markersRef.current[index]!;
        const progress = (t * orbit.speed + orbit.offset) % 1;
        const pt = orbit.curve.getPoint(progress);
        const tangent = orbit.curve.getTangent(progress);

        marker.position.copy(pt);
        marker.quaternion.setFromUnitVectors(new THREE.Vector3(1, 0, 0), tangent);
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* Floating Network Particles */}
      <points ref={particlesRef} geometry={particleGeo}>
        <pointsMaterial
          size={0.035}
          color="#00E6C3"
          transparent
          opacity={0.65}
          blending={THREE.AdditiveBlending}
        />
      </points>

      {orbits.map((orbit, idx) => (
        <group key={idx}>
          {/* Core illuminated spline line */}
          <primitive object={orbit.lineObject} />

          {/* Glowing nodes at key coordinates */}
          {orbit.nodePositions.map((pos, nodeIdx) => (
            <group key={nodeIdx} position={pos}>
              {/* Bright white core */}
              <mesh>
                <sphereGeometry args={[0.035, 12, 12]} />
                <meshBasicMaterial color="#FFFFFF" />
              </mesh>
              {/* Luminous soft halo */}
              <mesh>
                <sphereGeometry args={[0.08, 12, 12]} />
                <meshBasicMaterial
                  color={orbit.color}
                  transparent
                  opacity={0.65}
                  depthWrite={false}
                  blending={THREE.AdditiveBlending}
                />
              </mesh>
            </group>
          ))}

          {/* Travelling threat tag */}
          {orbit.isCoral && (
            <mesh
              ref={(el) => {
                markersRef.current[idx] = el;
              }}
            >
              <boxGeometry args={[0.22, 0.06, 0.03]} />
              <meshBasicMaterial color="#FF626B" transparent opacity={0.95} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
}
