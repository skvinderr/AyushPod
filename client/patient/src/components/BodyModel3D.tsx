"use client";

import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, ContactShadows, useGLTF } from '@react-three/drei';
import * as THREE from 'three';

/*
 * 3D Body model for the complaint/symptom picker.
 * Uses /finalbasemesh.glb from the public folder.
 *
 * 6 interactive tap-zones (head, chest, stomach, back, joints/arms, legs)
 * sit accurately on the mesh; tapping one fires onSelectZone(zoneId).
 */

export interface BodyZone {
  id: string;
  label: string;
  position: [number, number, number];
}

// Zone anchor points calibrated to /finalbasemesh.glb scaled at 0.16 and offset by y=-1.75.
export const BODY_ZONES: BodyZone[] = [
  { id: 'head', label: 'Head', position: [0, 1.34, 0.28] },
  { id: 'chest', label: 'Chest', position: [0, 0.70, 0.26] },
  { id: 'stomach', label: 'Stomach', position: [0, 0.20, 0.25] },
  { id: 'back', label: 'Back', position: [0, 0.65, -0.32] },
  { id: 'joints', label: 'Arms', position: [0.55, 0.33, 0.18] },
  { id: 'legs', label: 'Legs', position: [0.22, -0.66, 0.22] },
];

function TapZone({
  zone,
  active,
  onSelect,
}: {
  zone: BodyZone;
  active: boolean;
  onSelect: (id: string) => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const [hover, setHover] = useState(false);

  useFrame((_, delta) => {
    if (!ref.current) return;
    const t = performance.now() / 1000;
    const pulse = 1 + Math.sin(t * 3 + zone.position[1]) * 0.12;
    const target = (hover || active ? 1.4 : 1) * pulse;
    const s = THREE.MathUtils.damp(ref.current.scale.x, target, 10, delta);
    ref.current.scale.setScalar(s);
    const mat = ref.current.material as THREE.MeshStandardMaterial;
    mat.emissiveIntensity = THREE.MathUtils.damp(
      mat.emissiveIntensity,
      hover || active ? 2.4 : 1.3,
      8,
      delta,
    );
  });

  return (
    <mesh
      ref={ref}
      position={zone.position}
      onPointerOver={(e: ThreeEvent<PointerEvent>) => {
        e.stopPropagation();
        setHover(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHover(false);
        document.body.style.cursor = 'auto';
      }}
      onClick={(e: ThreeEvent<MouseEvent>) => {
        e.stopPropagation();
        onSelect(zone.id);
      }}
    >
      <sphereGeometry args={[0.13, 24, 24]} />
      <meshStandardMaterial
        color="#ffffff"
        emissive={active ? '#2a9d8f' : '#f4a261'}
        emissiveIntensity={1.3}
        transparent
        opacity={0.92}
        toneMapped={false}
      />
    </mesh>
  );
}

function FinalBaseMeshModel() {
  const { scene } = useGLTF('/finalbasemesh.glb');

  const model = useMemo(() => {
    const clone = scene.clone();
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        const mesh = child as THREE.Mesh;
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        mesh.material = new THREE.MeshStandardMaterial({
          color: '#dfd5ca',
          roughness: 0.52,
          metalness: 0.04,
        });
      }
    });
    return clone;
  }, [scene]);

  return (
    <primitive
      object={model}
      position={[0, -1.75, 0]}
      scale={0.16}
    />
  );
}

useGLTF.preload('/finalbasemesh.glb');

export function BodyModel3D({
  activeZone,
  onSelectZone,
  rotateSignal,
}: {
  activeZone: string | null;
  onSelectZone: (id: string) => void;
  rotateSignal?: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const targetY = useRef(0);

  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetY.current,
      6,
      delta,
    );
  });

  React.useEffect(() => {
    if (rotateSignal !== undefined) {
      targetY.current += Math.PI / 4;
    }
  }, [rotateSignal]);

  return (
    <group ref={groupRef}>
      <FinalBaseMeshModel />
      {BODY_ZONES.map((z) => (
        <TapZone key={z.id} zone={z} active={activeZone === z.id} onSelect={onSelectZone} />
      ))}
    </group>
  );
}

export function BodyModelCanvas(props: {
  activeZone: string | null;
  onSelectZone: (id: string) => void;
  rotateSignal?: number;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="w-full h-full flex items-center justify-center text-muted" />;
  }

  return (
    <Canvas
      shadows={{ type: THREE.PCFShadowMap }}
      dpr={[1, 2]}
      camera={{ position: [0, 0.1, 4.4], fov: 42 }}
      gl={{ antialias: true }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 6, 5]} intensity={1.2} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={0.4} color="#ffe0c0" />
      <Suspense fallback={null}>
        <BodyModel3D {...props} />
      </Suspense>
      <ContactShadows position={[0, -1.78, 0]} opacity={0.35} scale={4.5} blur={2.5} far={4} />
      <OrbitControls
        enablePan={false}
        enableZoom={false}
        minPolarAngle={Math.PI / 2.6}
        maxPolarAngle={Math.PI / 1.9}
        rotateSpeed={0.8}
      />
    </Canvas>
  );
}
