'use client';

import React, { useRef, useMemo } from 'react';
import * as THREE from 'three';
import { useFrame } from '@react-three/fiber';
import geoData from './data/earthGeoData.json';

// Mathematical conversion of (lat, lon) to 3D Cartesian coordinates matching Three.js Sphere UVs
export function latLonToVector3(lat: number, lon: number, radius: number): THREE.Vector3 {
  const phi = (lat * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  const x = -radius * Math.cos(phi) * Math.cos(theta);
  const y = radius * Math.sin(phi);
  const z = radius * Math.cos(phi) * Math.sin(theta);
  return new THREE.Vector3(x, y, z);
}

interface DigitalEarthSphereProps {
  reducedMotion?: boolean;
}

export function DigitalEarthSphere({ reducedMotion = false }: DigitalEarthSphereProps) {
  const earthGroupRef = useRef<THREE.Group>(null);
  const atmosphereRef = useRef<THREE.Mesh>(null);
  const outerHaloRef = useRef<THREE.Mesh>(null);

  // 1. Textures for the dark Earth base sphere
  const { diffuseMap, bumpMap, roughnessMap } = useMemo(() => {
    const loader = new THREE.TextureLoader();
    const dMap = loader.load('/earth_diffuse_sculpted.jpg');
    dMap.colorSpace = THREE.SRGBColorSpace;
    const bMap = loader.load('/earth_bump_sculpted.jpg');
    const rMap = loader.load('/earth_roughness_sculpted.jpg');
    return { diffuseMap: dMap, bumpMap: bMap, roughnessMap: rMap };
  }, []);

  // 2. Real Natural Earth Coastline Vector Segments (4,994 segments)
  const coastlinesGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const rawLines = geoData.coastLines as number[];
    const segCount = rawLines.length / 4;
    const positions = new Float32Array(segCount * 6);

    for (let i = 0; i < segCount; i++) {
      const idx = i * 4;
      const lat1 = rawLines[idx];
      const lon1 = rawLines[idx + 1];
      const lat2 = rawLines[idx + 2];
      const lon2 = rawLines[idx + 3];

      const p1 = latLonToVector3(lat1, lon1, 2.022);
      const p2 = latLonToVector3(lat2, lon2, 2.022);

      positions[i * 6] = p1.x;
      positions[i * 6 + 1] = p1.y;
      positions[i * 6 + 2] = p1.z;

      positions[i * 6 + 3] = p2.x;
      positions[i * 6 + 4] = p2.y;
      positions[i * 6 + 5] = p2.z;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // 3. Real Natural Earth Country Boundary Lines (2,647 segments)
  const bordersGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const rawLines = geoData.borderLines as number[];
    const segCount = rawLines.length / 4;
    const positions = new Float32Array(segCount * 6);

    for (let i = 0; i < segCount; i++) {
      const idx = i * 4;
      const lat1 = rawLines[idx];
      const lon1 = rawLines[idx + 1];
      const lat2 = rawLines[idx + 2];
      const lon2 = rawLines[idx + 3];

      const p1 = latLonToVector3(lat1, lon1, 2.023);
      const p2 = latLonToVector3(lat2, lon2, 2.023);

      positions[i * 6] = p1.x;
      positions[i * 6 + 1] = p1.y;
      positions[i * 6 + 2] = p1.z;

      positions[i * 6 + 3] = p2.x;
      positions[i * 6 + 4] = p2.y;
      positions[i * 6 + 5] = p2.z;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // 4. Dotted Coastline Highlight Points (5,128 true coastline coordinate beads)
  const coastDotsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const dots = geoData.coastDots as [number, number][];
    const positions = new Float32Array(dots.length * 3);

    for (let i = 0; i < dots.length; i++) {
      const [lat, lon] = dots[i];
      const vec = latLonToVector3(lat, lon, 2.024);
      positions[i * 3] = vec.x;
      positions[i * 3 + 1] = vec.y;
      positions[i * 3 + 2] = vec.z;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return geo;
  }, []);

  // 5. High-Density Interior Landmass Dot Matrix (19,298 points)
  const landPointsGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const points = geoData.landPoints as [number, number][];
    const positions = new Float32Array(points.length * 3);
    const colors = new Float32Array(points.length * 3);

    const cyan = new THREE.Color('#00E6C3');
    const iceBlue = new THREE.Color('#38D9FF');
    const tempColor = new THREE.Color();

    for (let i = 0; i < points.length; i++) {
      const [lat, lon] = points[i];
      const vec = latLonToVector3(lat, lon, 2.018);
      positions[i * 3] = vec.x;
      positions[i * 3 + 1] = vec.y;
      positions[i * 3 + 2] = vec.z;

      // Color variation between vibrant cyan and ice-blue
      const mix = ((i % 17) / 17) * 0.45;
      tempColor.copy(cyan).lerp(iceBlue, mix);
      colors[i * 3] = tempColor.r;
      colors[i * 3 + 1] = tempColor.g;
      colors[i * 3 + 2] = tempColor.b;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    return geo;
  }, []);

  // 6. Subtle Latitude and Longitude Graticule Matrix
  const graticulesGeo = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    const linePoints: THREE.Vector3[] = [];
    const radius = 2.016;

    // Latitude rings: 0 (Equator), ±23.5 (Tropics), ±45, ±60
    const lats = [0, 23.5, -23.5, 45, -45, 60, -60];
    const latSegs = 72;
    for (const lat of lats) {
      for (let s = 0; s < latSegs; s++) {
        const lon1 = (s / latSegs) * 360 - 180;
        const lon2 = ((s + 1) / latSegs) * 360 - 180;
        linePoints.push(latLonToVector3(lat, lon1, radius));
        linePoints.push(latLonToVector3(lat, lon2, radius));
      }
    }

    // Longitude meridians every 30 degrees
    const lonSegs = 36;
    for (let lon = -180; lon < 180; lon += 30) {
      for (let s = 0; s < lonSegs; s++) {
        const lat1 = (s / lonSegs) * 180 - 90;
        const lat2 = ((s + 1) / lonSegs) * 180 - 90;
        linePoints.push(latLonToVector3(lat1, lon, radius));
        linePoints.push(latLonToVector3(lat2, lon, radius));
      }
    }

    const posArray = new Float32Array(linePoints.length * 3);
    for (let i = 0; i < linePoints.length; i++) {
      posArray[i * 3] = linePoints[i].x;
      posArray[i * 3 + 1] = linePoints[i].y;
      posArray[i * 3 + 2] = linePoints[i].z;
    }
    geo.setAttribute('position', new THREE.BufferAttribute(posArray, 3));
    return geo;
  }, []);

  // Frame animation: continuous slow rotation
  useFrame((_, delta) => {
    const rotationSpeed = reducedMotion ? 0.015 : 0.045;
    if (earthGroupRef.current) {
      earthGroupRef.current.rotation.y += delta * rotationSpeed;
    }
    if (atmosphereRef.current) {
      atmosphereRef.current.rotation.y += delta * (rotationSpeed * 0.85);
    }
  });

  return (
    <group ref={earthGroupRef}>
      {/* A. Dark Cyber Earth Base Sphere with high-res texture */}
      <mesh receiveShadow castShadow>
        <sphereGeometry args={[2.0, 64, 64]} />
        <meshStandardMaterial
          map={diffuseMap}
          bumpMap={bumpMap}
          bumpScale={0.065}
          roughnessMap={roughnessMap}
          roughness={0.8}
          metalness={0.15}
          color="#030C16"
        />
      </mesh>

      {/* B. Dense Digital Land Points (Glowing Cyan Point Matrix) */}
      <points geometry={landPointsGeo}>
        <pointsMaterial
          size={0.022}
          vertexColors
          transparent
          opacity={0.82}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* C. Real Natural Earth Coastline Vector Outlines */}
      <lineSegments geometry={coastlinesGeo}>
        <lineBasicMaterial
          color="#00E6C3"
          transparent
          opacity={0.85}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* D. Dotted Coastline Highlight Beads */}
      <points geometry={coastDotsGeo}>
        <pointsMaterial
          size={0.026}
          color="#E0FAFF"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </points>

      {/* E. Real Natural Earth Country Boundary Lines */}
      <lineSegments geometry={bordersGeo}>
        <lineBasicMaterial
          color="#38D9FF"
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* F. Fine Longitude / Latitude Graticule Grid */}
      <lineSegments geometry={graticulesGeo}>
        <lineBasicMaterial
          color="#00E6C3"
          transparent
          opacity={0.12}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </lineSegments>

      {/* G. Soft Cyan Atmospheric Rim Hugging the Globe (Inner Layer) */}
      <mesh ref={atmosphereRef}>
        <sphereGeometry args={[2.036, 64, 64]} />
        <meshStandardMaterial
          color="#00E6C3"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* H. Outer Luminous Cyan / Ice-Blue Atmospheric Halo */}
      <mesh ref={outerHaloRef}>
        <sphereGeometry args={[2.11, 48, 48]} />
        <meshStandardMaterial
          color="#38D9FF"
          transparent
          opacity={0.12}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>

      {/* I. Distant Deep Space Corona */}
      <mesh>
        <sphereGeometry args={[2.22, 36, 36]} />
        <meshStandardMaterial
          color="#0F766E"
          transparent
          opacity={0.05}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
    </group>
  );
}
