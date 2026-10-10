'use client';

import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import { latLonToVector3 } from './DigitalEarthSphere';

export interface GlobalHub {
  id: string;
  name: string;
  code: string;
  lat: number;
  lon: number;
  isPrimary: boolean;
  label: string;
}

export interface ArcConfig {
  fromId: string;
  toId: string;
  isMajorTransfer: boolean; // true = white-gold high-throughput trail, false = cyan/ice-blue
  color?: string;
  speed: number;
  offset: number;
}

// 16 Global Cybersecurity Hubs & Quantum Telemetry Centers
export const GLOBAL_HUBS: GlobalHub[] = [
  { id: 'wdc', name: 'Washington D.C.', code: 'US-CYBER', lat: 38.9, lon: -77.04, isPrimary: true, label: 'US-EAST // 38.9°N' },
  { id: 'sfo', name: 'Silicon Valley', code: 'SFO-CORE', lat: 37.77, lon: -122.42, isPrimary: false, label: 'US-WEST // 37.8°N' },
  { id: 'nyc', name: 'New York', code: 'NYC-FIN', lat: 40.71, lon: -74.0, isPrimary: false, label: 'NYC-TRUNK // 40.7°N' },
  { id: 'lon', name: 'London', code: 'LON-NCSC', lat: 51.51, lon: -0.13, isPrimary: false, label: 'LON-01 // 51.5°N' },
  { id: 'fra', name: 'Frankfurt', code: 'FRA-DECIX', lat: 50.11, lon: 8.68, isPrimary: true, label: 'EU-GW // 50.1°N' },
  { id: 'zrh', name: 'Zurich', code: 'ZRH-QUANT', lat: 47.38, lon: 8.54, isPrimary: false, label: 'ZRH-Q // 47.4°N' },
  { id: 'tyo', name: 'Tokyo', code: 'TYO-CERT', lat: 35.68, lon: 139.77, isPrimary: true, label: 'TYO-01 // 35.7°N' },
  { id: 'sin', name: 'Singapore', code: 'SIN-SEC', lat: 1.35, lon: 103.82, isPrimary: true, label: 'SG-NET // 1.4°N' },
  { id: 'syd', name: 'Sydney', code: 'SYD-ACSC', lat: -33.87, lon: 151.21, isPrimary: false, label: 'SYD-01 // 33.9°S' },
  { id: 'dxb', name: 'Dubai', code: 'DXB-HUB', lat: 25.2, lon: 55.27, isPrimary: false, label: 'DXB-GW // 25.2°N' },
  { id: 'bom', name: 'Mumbai', code: 'BOM-CERT', lat: 19.07, lon: 72.88, isPrimary: false, label: 'BOM-01 // 19.1°N' },
  { id: 'icn', name: 'Seoul', code: 'ICN-KISA', lat: 37.57, lon: 126.98, isPrimary: false, label: 'ICN-SEC // 37.6°N' },
  { id: 'gru', name: 'Sao Paulo', code: 'GRU-IX', lat: -23.55, lon: -46.63, isPrimary: false, label: 'GRU-LATAM // 23.6°S' },
  { id: 'arn', name: 'Stockholm', code: 'ARN-DEF', lat: 59.33, lon: 18.07, isPrimary: false, label: 'ARN-NORD // 59.3°N' },
  { id: 'yyz', name: 'Toronto', code: 'YYZ-CCC', lat: 43.65, lon: -79.38, isPrimary: false, label: 'YYZ-01 // 43.7°N' },
  { id: 'tlv', name: 'Tel Aviv', code: 'TLV-CYBER', lat: 32.08, lon: 34.78, isPrimary: false, label: 'TLV-SEC // 32.1°N' },
];

// Connection Arcs: white-gold for selected active transfers, cyan/ice-blue for normal connections
export const ARC_CONFIGS: ArcConfig[] = [
  // Major Active Data Transfers (Luminous White-to-Gold Trails)
  { fromId: 'nyc', toId: 'lon', isMajorTransfer: true, color: '#FFE082', speed: 0.16, offset: 0.05 },
  { fromId: 'sfo', toId: 'tyo', isMajorTransfer: true, color: '#FFE082', speed: 0.14, offset: 0.35 },
  { fromId: 'lon', toId: 'fra', isMajorTransfer: true, color: '#FFD54F', speed: 0.22, offset: 0.1 },
  { fromId: 'fra', toId: 'sin', isMajorTransfer: true, color: '#FFE082', speed: 0.13, offset: 0.8 },
  { fromId: 'tyo', toId: 'sin', isMajorTransfer: true, color: '#FFD54F', speed: 0.19, offset: 0.25 },
  { fromId: 'wdc', toId: 'fra', isMajorTransfer: true, color: '#FFE082', speed: 0.15, offset: 0.45 },
  { fromId: 'fra', toId: 'dxb', isMajorTransfer: true, color: '#FFD54F', speed: 0.17, offset: 0.6 },

  // Normal Network Connections (Cyan & Ice-Blue Lines)
  { fromId: 'sfo', toId: 'nyc', isMajorTransfer: false, color: '#00E6C3', speed: 0.18, offset: 0.15 },
  { fromId: 'wdc', toId: 'nyc', isMajorTransfer: false, color: '#38D9FF', speed: 0.24, offset: 0.3 },
  { fromId: 'lon', toId: 'zrh', isMajorTransfer: false, color: '#00E6C3', speed: 0.2, offset: 0.55 },
  { fromId: 'fra', toId: 'arn', isMajorTransfer: false, color: '#38D9FF', speed: 0.19, offset: 0.4 },
  { fromId: 'sin', toId: 'syd', isMajorTransfer: false, color: '#00E6C3', speed: 0.15, offset: 0.65 },
  { fromId: 'sin', toId: 'bom', isMajorTransfer: false, color: '#38D9FF', speed: 0.17, offset: 0.2 },
  { fromId: 'dxb', toId: 'bom', isMajorTransfer: false, color: '#00E6C3', speed: 0.21, offset: 0.85 },
  { fromId: 'tyo', toId: 'icn', isMajorTransfer: false, color: '#38D9FF', speed: 0.23, offset: 0.0 },
  { fromId: 'nyc', toId: 'gru', isMajorTransfer: false, color: '#00E6C3', speed: 0.14, offset: 0.5 },
  { fromId: 'nyc', toId: 'yyz', isMajorTransfer: false, color: '#38D9FF', speed: 0.25, offset: 0.75 },
  { fromId: 'lon', toId: 'arn', isMajorTransfer: false, color: '#00E6C3', speed: 0.18, offset: 0.9 },
  { fromId: 'zrh', toId: 'tlv', isMajorTransfer: false, color: '#38D9FF', speed: 0.16, offset: 0.38 },
];

// Helper: Calculate 3D curved Great-Circle arc points that visibly arch high above the sphere
function computeGreatCircleArc(
  p1: THREE.Vector3,
  p2: THREE.Vector3,
  radius: number,
  segments: number = 64
): { points: THREE.Vector3[]; getPointAt: (t: number) => THREE.Vector3 } {
  const v1 = p1.clone().normalize();
  const v2 = p2.clone().normalize();

  const dot = Math.min(Math.max(v1.dot(v2), -0.9999), 0.9999);
  const omega = Math.acos(dot);
  const sinOmega = Math.sin(omega);

  // Peak altitude rises visibly into space above the globe
  const peakAltitude = Math.min(1.2, Math.max(0.32, omega * 0.48));

  const getPointAt = (t: number): THREE.Vector3 => {
    // Slerp unit vector along great circle
    const s1 = Math.sin((1 - t) * omega) / sinOmega;
    const s2 = Math.sin(t * omega) / sinOmega;
    const unitV = new THREE.Vector3(
      v1.x * s1 + v2.x * s2,
      v1.y * s1 + v2.y * s2,
      v1.z * s1 + v2.z * s2
    ).normalize();

    // Smooth sinusoidal parabolic lift in 3D space
    const alt = radius + peakAltitude * Math.sin(Math.PI * t);
    return unitV.multiplyScalar(alt);
  };

  const points: THREE.Vector3[] = [];
  for (let i = 0; i <= segments; i++) {
    points.push(getPointAt(i / segments));
  }

  return { points, getPointAt };
}

// Create billboard sprite for technical HUD labels
function createHubLabelSprite(label: string): THREE.Sprite {
  if (typeof document === 'undefined') {
    return new THREE.Sprite();
  }
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 64;
  const ctx = canvas.getContext('2d');
  if (ctx) {
    ctx.fillStyle = 'rgba(7, 20, 29, 0.94)';
    ctx.strokeStyle = 'rgba(0, 230, 195, 0.7)';
    ctx.lineWidth = 2;

    ctx.beginPath();
    ctx.roundRect(8, 8, 240, 48, 10);
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = '#00E6C3';
    ctx.beginPath();
    ctx.arc(28, 32, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#F4F8FC';
    ctx.font = 'bold 18px "Courier New", monospace';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, 44, 32);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.minFilter = THREE.LinearFilter;
  const mat = new THREE.SpriteMaterial({
    map: texture,
    transparent: true,
    depthWrite: false,
  });
  const sprite = new THREE.Sprite(mat);
  sprite.scale.set(0.42, 0.105, 1);
  return sprite;
}

interface NetworkArcConnectionsProps {
  reducedMotion?: boolean;
}

export function NetworkArcConnections({ reducedMotion = false }: NetworkArcConnectionsProps) {
  const groupRef = useRef<THREE.Group>(null);

  // Hub positions and quaternions on the globe surface
  const hubData = useMemo(() => {
    const map = new Map<
      string,
      {
        hub: GlobalHub;
        position: THREE.Vector3;
        quaternion: THREE.Quaternion;
        labelSprite?: THREE.Sprite;
      }
    >();

    const radius = 2.032;
    for (const hub of GLOBAL_HUBS) {
      const pos = latLonToVector3(hub.lat, hub.lon, radius);
      const normal = pos.clone().normalize();
      const quat = new THREE.Quaternion().setFromUnitVectors(
        new THREE.Vector3(0, 0, 1),
        normal
      );
      const labelSprite = hub.isPrimary ? createHubLabelSprite(hub.label) : undefined;
      map.set(hub.id, { hub, position: pos, quaternion: quat, labelSprite });
    }
    return map;
  }, []);

  // Compute 3D curved Great-Circle arc paths rising above the globe
  const arcCurves = useMemo(() => {
    const radius = 2.032;
    return ARC_CONFIGS.map((cfg) => {
      const from = hubData.get(cfg.fromId);
      const to = hubData.get(cfg.toId);
      if (!from || !to) return null;

      const { points, getPointAt } = computeGreatCircleArc(
        from.position,
        to.position,
        radius,
        64
      );

      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const material = new THREE.LineBasicMaterial({
        color: cfg.color || (cfg.isMajorTransfer ? '#FFE082' : '#00E6C3'),
        transparent: true,
        opacity: cfg.isMajorTransfer ? 0.85 : 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const lineObject = new THREE.Line(geometry, material);

      return {
        cfg,
        from,
        to,
        getPointAt,
        lineObject,
      };
    }).filter(Boolean) as {
      cfg: ArcConfig;
      from: { hub: GlobalHub; position: THREE.Vector3; quaternion: THREE.Quaternion };
      to: { hub: GlobalHub; position: THREE.Vector3; quaternion: THREE.Quaternion };
      getPointAt: (t: number) => THREE.Vector3;
      lineObject: THREE.Line;
    }[];
  }, [hubData]);

  // Target reticle ring and pulse wave ring geometries
  const targetRingGeo = useMemo(() => new THREE.RingGeometry(0.045, 0.062, 32), []);
  const pulseRingGeo = useMemo(() => new THREE.RingGeometry(0.03, 0.048, 32), []);

  // Refs for animated pulse rings, beacons, and moving comets
  const pulseRingsRef = useRef<{ [key: string]: THREE.Mesh | null }>({});
  const hubBeaconsRef = useRef<{ [key: string]: THREE.Mesh | null }>({});
  const cometHeadsRef = useRef<(THREE.Mesh | null)[]>([]);
  const cometTailsRef = useRef<(THREE.Mesh | null)[][]>([]);

  // Smooth continuous animation loop based on elapsed time
  useFrame((state, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * (reducedMotion ? 0.015 : 0.045);
    }

    const t = state.clock.getElapsedTime();

    // 1. Hub expanding pulse rings & subtle node blinking
    GLOBAL_HUBS.forEach((hub, idx) => {
      const ring = pulseRingsRef.current[hub.id];
      if (ring) {
        const pulseCycle = (t * (hub.isPrimary ? 1.4 : 1.0) + idx * 0.25) % 1;
        const scale = 1 + pulseCycle * 2.6;
        ring.scale.set(scale, scale, 1);
        const mat = ring.material as THREE.MeshBasicMaterial;
        if (mat) {
          mat.opacity = Math.max(0, (1 - pulseCycle) * 0.75);
        }
      }

      const beacon = hubBeaconsRef.current[hub.id];
      if (beacon) {
        const blink = Math.sin(t * 3.5 + idx * 0.7) * 0.2 + 0.8;
        const bMat = beacon.material as THREE.MeshBasicMaterial;
        if (bMat) {
          bMat.opacity = blink;
        }
      }
    });

    // 2. Animate small light particles traveling along curved 3D arcs
    arcCurves.forEach((arc, idx) => {
      const speed = reducedMotion ? arc.cfg.speed * 0.4 : arc.cfg.speed;
      const progress = (t * speed + arc.cfg.offset) % 1;

      // Leading photon head
      const head = cometHeadsRef.current[idx];
      if (head) {
        const pt = arc.getPointAt(progress);
        head.position.copy(pt);
      }

      // Multi-point trailing beads for white-gold major transfers
      const tails = cometTailsRef.current[idx];
      if (tails && tails.length > 0) {
        tails.forEach((tailMesh, tailIdx) => {
          if (tailMesh) {
            const lag = (tailIdx + 1) * 0.016;
            const tailProgress = (progress - lag + 1) % 1;
            const pt = arc.getPointAt(tailProgress);
            tailMesh.position.copy(pt);
          }
        });
      }
    });
  });

  return (
    <group ref={groupRef}>
      {/* ========================================================= */}
      {/* 1. CURVED 3D CONNECTION ARCS RISING ABOVE THE GLOBE       */}
      {/* ========================================================= */}
      {arcCurves.map((arc, idx) => {
        const isMajor = arc.cfg.isMajorTransfer;
        return (
          <group key={idx}>
            {/* Luminous curved 3D arc path */}
            <primitive object={arc.lineObject} />

            {/* Leading photon / comet head */}
            <mesh
              ref={(el) => {
                cometHeadsRef.current[idx] = el;
              }}
            >
              <sphereGeometry args={[isMajor ? 0.042 : 0.03, 16, 16]} />
              <meshBasicMaterial
                color="#FFFFFF"
                transparent
                opacity={0.95}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Comet trailing aura */}
            <mesh
              position={[0, 0, 0]}
              ref={(el) => {
                if (!cometTailsRef.current[idx]) cometTailsRef.current[idx] = [];
                cometTailsRef.current[idx][0] = el;
              }}
            >
              <sphereGeometry args={[isMajor ? 0.034 : 0.022, 12, 12]} />
              <meshBasicMaterial
                color={isMajor ? '#FFE082' : '#38D9FF'}
                transparent
                opacity={0.8}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Additional gold trails for major data transfers */}
            {isMajor && (
              <>
                <mesh
                  ref={(el) => {
                    if (!cometTailsRef.current[idx]) cometTailsRef.current[idx] = [];
                    cometTailsRef.current[idx][1] = el;
                  }}
                >
                  <sphereGeometry args={[0.026, 10, 10]} />
                  <meshBasicMaterial
                    color="#FFCA28"
                    transparent
                    opacity={0.65}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
                <mesh
                  ref={(el) => {
                    if (!cometTailsRef.current[idx]) cometTailsRef.current[idx] = [];
                    cometTailsRef.current[idx][2] = el;
                  }}
                >
                  <sphereGeometry args={[0.018, 8, 8]} />
                  <meshBasicMaterial
                    color="#FFA000"
                    transparent
                    opacity={0.45}
                    blending={THREE.AdditiveBlending}
                  />
                </mesh>
              </>
            )}
          </group>
        );
      })}

      {/* ========================================================= */}
      {/* 2. CIRCULAR TARGET-STYLE HUBS & PULSE RINGS               */}
      {/* ========================================================= */}
      {GLOBAL_HUBS.map((hub) => {
        const item = hubData.get(hub.id);
        if (!item) return null;

        return (
          <group key={hub.id} position={item.position} quaternion={item.quaternion}>
            {/* Core illuminated center beacon with rhythmic blinking */}
            <mesh
              ref={(el) => {
                hubBeaconsRef.current[hub.id] = el;
              }}
              position={[0, 0, 0.005]}
            >
              <sphereGeometry args={[hub.isPrimary ? 0.032 : 0.022, 16, 16]} />
              <meshBasicMaterial
                color="#FFFFFF"
                transparent
                opacity={0.9}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Target reticle ring */}
            <mesh geometry={targetRingGeo} position={[0, 0, 0.004]}>
              <meshBasicMaterial
                color={hub.isPrimary ? '#00E6C3' : '#38D9FF'}
                transparent
                opacity={0.85}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Concentric expanding pulse wave ring */}
            <mesh
              ref={(el) => {
                pulseRingsRef.current[hub.id] = el;
              }}
              geometry={pulseRingGeo}
              position={[0, 0, 0.002]}
            >
              <meshBasicMaterial
                color={hub.isPrimary ? '#00E6C3' : '#38D9FF'}
                transparent
                opacity={0.7}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
              />
            </mesh>

            {/* Subtle technical HUD coordinate label for primary cyber hubs */}
            {item.labelSprite && (
              <primitive object={item.labelSprite} position={[0, 0.14, 0.04]} />
            )}
          </group>
        );
      })}
    </group>
  );
}
