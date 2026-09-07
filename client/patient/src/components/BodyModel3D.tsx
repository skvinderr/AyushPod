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
const HAIR = '#2e2622';     // soft near-black hair
const SHIRT = '#b8c2cf';    // calm heather top (neutral, gender-agnostic)
const PANTS = '#596372';    // muted slate trousers
const SHOE = '#3a4450';
const EYE = '#2c2a28';

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
  const skin = <meshStandardMaterial color={SKIN} roughness={0.6} metalness={0.02} />;
  const shirt = <meshStandardMaterial color={SHIRT} roughness={0.85} metalness={0} />;
  const pants = <meshStandardMaterial color={PANTS} roughness={0.85} metalness={0} />;

  return (
    <group position={[0, -0.1, 0]}>
      {/* ---- head ---- */}
      <mesh position={[0, 1.44, 0]} castShadow>
        <sphereGeometry args={[0.28, 40, 40]} />
        {skin}
      </mesh>
      {/* hair — a soft cap over the scalp/back, open at the face */}
      <mesh position={[0, 1.47, -0.02]} castShadow>
        <sphereGeometry args={[0.3, 36, 36, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
        <meshStandardMaterial color={HAIR} roughness={0.75} />
      </mesh>
      {/* eyes — small, calm, clearly a person (non-cartoonish) */}
      <mesh position={[-0.1, 1.45, 0.25]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshStandardMaterial color={EYE} roughness={0.3} />
      </mesh>
      <mesh position={[0.1, 1.45, 0.25]}>
        <sphereGeometry args={[0.032, 16, 16]} />
        <meshStandardMaterial color={EYE} roughness={0.3} />
      </mesh>

      {/* neck */}
      <mesh position={[0, 1.14, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.12, 0.2, 24]} />
        {skin}
      </mesh>

      {/* ---- torso: a soft top ---- */}
      <mesh position={[0, 0.5, 0]} castShadow>
        <capsuleGeometry args={[0.36, 0.62, 16, 32]} />
        {shirt}
      </mesh>
      {/* hem where the top meets the trousers */}
      <mesh position={[0, 0.06, 0]} castShadow>
        <cylinderGeometry args={[0.34, 0.32, 0.14, 32]} />
        {shirt}
      </mesh>

      {/* pelvis / trousers top */}
      <mesh position={[0, -0.14, 0]} castShadow>
        <capsuleGeometry args={[0.31, 0.18, 12, 24]} />
        {pants}
      </mesh>

      {/* shoulders (top) */}
      <mesh position={[-0.39, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.17, 20, 20]} />
        {shirt}
      </mesh>
      <mesh position={[0.39, 0.78, 0]} castShadow>
        <sphereGeometry args={[0.17, 20, 20]} />
        {shirt}
      </mesh>

      {/* ---- arms: short sleeve, then skin ---- */}
      {[-1, 1].map((side) => (
        <group key={side}>
          {/* short sleeve over the upper arm */}
          <mesh position={[side * 0.51, 0.56, 0]} rotation={[0, 0, side * 0.12]} castShadow>
            <capsuleGeometry args={[0.135, 0.16, 12, 20]} />
            {shirt}
          </mesh>
          {/* upper arm (skin) */}
          <mesh position={[side * 0.53, 0.3, 0]} rotation={[0, 0, side * 0.12]} castShadow>
            <capsuleGeometry args={[0.098, 0.4, 12, 20]} />
            {skin}
          </mesh>
          {/* forearm */}
          <mesh position={[side * 0.6, -0.2, 0]} rotation={[0, 0, side * 0.12]} castShadow>
            <capsuleGeometry args={[0.085, 0.48, 12, 20]} />
            {skin}
          </mesh>
          {/* hand */}
          <mesh position={[side * 0.65, -0.52, 0]} castShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
            <meshStandardMaterial color={SKIN_DEEP} roughness={0.6} />
          </mesh>
        </group>
      ))}

      {/* ---- legs: trousers + shoes ---- */}
      {[-1, 1].map((side) => (
        <group key={side}>
          <mesh position={[side * 0.17, -0.7, 0]} castShadow>
            <capsuleGeometry args={[0.14, 0.62, 12, 20]} />
            {pants}
          </mesh>
          <mesh position={[side * 0.17, -1.42, 0]} castShadow>
            <capsuleGeometry args={[0.115, 0.6, 12, 20]} />
            {pants}
          </mesh>
          {/* shoe */}
          <mesh position={[side * 0.17, -1.8, 0.12]} castShadow>
            <boxGeometry args={[0.18, 0.12, 0.34]} />
            <meshStandardMaterial color={SHOE} roughness={0.5} metalness={0.05} />
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
