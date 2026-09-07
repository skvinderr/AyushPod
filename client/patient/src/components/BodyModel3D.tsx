"use client";

import React, { useRef, useState } from 'react';
import { Canvas, useFrame, ThreeEvent } from '@react-three/fiber';
import { OrbitControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

/*
 * Stylized-realistic body model for the symptom picker.
 * A calm, correctly-proportioned human built from smooth capsule geometry with
 * soft skin shading — clearly a person, deliberately NON-graphic (no organs /
 * muscle / gore), because patients using this are anxious or in pain.
 *
 * 6 soft glowing tap-zones (head, chest, stomach, back, arms/joints, legs) sit
 * on the body; tapping one fires onSelectZone(zoneId).
 */

export interface BodyZone {
  id: string;
  label: string;
  position: [number, number, number];
}

// Zone anchor points in model space (model is ~2.6 units tall, centered ~y=0).
export const BODY_ZONES: BodyZone[] = [
  { id: 'head', label: 'Head', position: [0, 1.42, 0.28] },
  { id: 'chest', label: 'Chest', position: [0, 0.55, 0.4] },
  { id: 'stomach', label: 'Stomach', position: [0, 0.02, 0.42] },
  { id: 'back', label: 'Back', position: [0, 0.5, -0.42] },
  { id: 'joints', label: 'Arms', position: [0.66, 0.35, 0.1] },
  { id: 'legs', label: 'Legs', position: [0.22, -1.05, 0.22] },
];

const SKIN = '#e8b48c';
const SKIN_DEEP = '#d59b73';

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
    const target = (hover || active ? 1.45 : 1) * pulse;
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
      <sphereGeometry args={[0.16, 24, 24]} />
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

function HumanFigure() {
  const skin = <meshStandardMaterial color={SKIN} roughness={0.62} metalness={0.02} />;

  return (
    <group position={[0, -0.1, 0]}>
      {/* head */}
      <mesh position={[0, 1.42, 0]} castShadow>
        <sphereGeometry args={[0.28, 40, 40]} />
        {skin}
      </mesh>
      {/* neck */}
      <mesh position={[0, 1.12, 0]} castShadow>
        <cylinderGeometry args={[0.11, 0.13, 0.22, 24]} />
        {skin}
      </mesh>
      {/* torso (chest + abdomen as one smooth capsule) */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.34, 0.62, 16, 32]} />
        <meshStandardMaterial color={SKIN} roughness={0.62} />
      </mesh>
      {/* pelvis */}
      <mesh position={[0, -0.12, 0]} castShadow>
        <capsuleGeometry args={[0.3, 0.18, 12, 24]} />
        {skin}
      </mesh>

      {/* shoulders */}
      <mesh position={[-0.38, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 20]} />
        {skin}
      </mesh>
      <mesh position={[0.38, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.16, 20, 20]} />
        {skin}
      </mesh>

      {/* arms */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.5, 0.4, 0]} rotation={[0, 0, side * 0.12]} castShadow>
            <capsuleGeometry args={[0.1, 0.55, 12, 20]} />
            {skin}
          </mesh>
          <mesh position={[side * 0.58, -0.18, 0]} rotation={[0, 0, side * 0.12]} castShadow>
            <capsuleGeometry args={[0.088, 0.5, 12, 20]} />
            {skin}
          </mesh>
          {/* hand */}
          <mesh position={[side * 0.64, -0.5, 0]} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={SKIN_DEEP} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* legs */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.17, -0.7, 0]} castShadow>
            <capsuleGeometry args={[0.135, 0.6, 12, 20]} />
            {skin}
          </mesh>
          <mesh position={[side * 0.17, -1.42, 0]} castShadow>
            <capsuleGeometry args={[0.11, 0.58, 12, 20]} />
            {skin}
          </mesh>
          {/* foot */}
          <mesh position={[side * 0.17, -1.78, 0.1]} castShadow>
            <boxGeometry args={[0.16, 0.1, 0.3]} />
            <meshStandardMaterial color={SKIN_DEEP} roughness={0.6} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

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

  // Parent listens to rotateSignal by nudging targetY (see effect below).
  useFrame((_, delta) => {
    if (!groupRef.current) return;
    groupRef.current.rotation.y = THREE.MathUtils.damp(
      groupRef.current.rotation.y,
      targetY.current,
      6,
      delta,
    );
  });

  // Expose imperative rotate via prop change.
  React.useEffect(() => {
    if (rotateSignal !== undefined) {
      targetY.current += Math.PI / 4;
    }
  }, [rotateSignal]);

  return (
    <group ref={groupRef}>
      <HumanFigure />
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
  return (
    <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 0.3, 4.6], fov: 42 }} gl={{ antialias: true }}>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 6, 5]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -3]} intensity={0.35} color="#ffe0c0" />
      <BodyModel3D {...props} />
      <ContactShadows position={[0, -1.95, 0]} opacity={0.35} scale={5} blur={2.6} far={4} />
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
