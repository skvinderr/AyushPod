"use client";

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { useAvatar } from '../store/useAvatar';
import * as THREE from 'three';

/*
 * Aaya — MediKiosk's guide character.
 * A warm, rounded, toon-style helper (soft skin + teal "scrubs" + a little
 * headscarf-style cap). Fully procedural so it always loads on a kiosk with no
 * external asset. Real face: pupils that track a gentle target, eyelids that
 * blink, a mouth that lip-syncs to the `talking` state, plus happy / concerned
 * / listening poses.
 */

const SKIN = '#f2c9a0';
const SKIN_SHADOW = '#e3ac82';
const TEAL = '#2a9d8f';
const TEAL_DEEP = '#1f7a6e';
const CHEEK = '#e8896f';
const DARK = '#3a3330';

function Character() {
  const { state, mouth } = useAvatar();

  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const mouthMesh = useRef<THREE.Mesh>(null);
  const lidL = useRef<THREE.Mesh>(null);
  const lidR = useRef<THREE.Mesh>(null);
  const pupilL = useRef<THREE.Mesh>(null);
  const pupilR = useRef<THREE.Mesh>(null);
  const browL = useRef<THREE.Mesh>(null);
  const browR = useRef<THREE.Mesh>(null);

  const { pointer } = useThree();

  // Blink bookkeeping
  const blink = useRef({ next: 1.5, t: 0, closing: false, amount: 0 });

  useFrame((_, delta) => {
    const t = performance.now() / 1000;
    if (!group.current || !head.current) return;

    // ---- Body idle bob ----
    const bob = Math.sin(t * 1.6) * 0.04;
    group.current.position.y = -1.15 + bob;

    // ---- Head base pose per state ----
    let targetRotX = 0;
    let targetRotZ = 0;
    let targetPosY = 0;
    let browY = 0;

    switch (state) {
      case 'listening':
        targetRotZ = 0.18;      // sympathetic head-tilt
        targetRotX = 0.06;
        browY = 0.02;
        break;
      case 'happy':
        targetPosY = Math.abs(Math.sin(t * 6)) * 0.08;
        browY = 0.03;
        break;
      case 'concerned':
        targetRotX = 0.16;      // head dips down
        browY = -0.03;          // brows draw in/down
        break;
      case 'talking':
        targetRotX = Math.sin(t * 6) * 0.03;
        break;
    }

    // Pointer-based head tracking (gentle) — feels alive, looks at the person.
    const lookX = THREE.MathUtils.clamp(pointer.x, -1, 1) * 0.22;
    const lookY = THREE.MathUtils.clamp(pointer.y, -1, 1) * 0.14;

    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, targetRotX - lookY, 6, delta);
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, lookX + Math.sin(t * 0.6) * 0.05, 6, delta);
    head.current.rotation.z = THREE.MathUtils.damp(head.current.rotation.z, targetRotZ, 6, delta);
    head.current.position.y = THREE.MathUtils.damp(head.current.position.y, 1.15 + targetPosY, 6, delta);

    // Pupils drift toward the pointer too
    [pupilL, pupilR].forEach((p) => {
      if (!p.current) return;
      p.current.position.x = THREE.MathUtils.damp(p.current.position.x, (p === pupilL ? -0.22 : 0.22) + lookX * 0.06, 8, delta);
      p.current.position.y = THREE.MathUtils.damp(p.current.position.y, 0.16 - lookY * 0.04, 8, delta);
    });

    // Brows
    [browL, browR].forEach((b) => {
      if (!b.current) return;
      b.current.position.y = THREE.MathUtils.damp(b.current.position.y, 0.42 + browY, 6, delta);
    });

    // ---- Blink ----
    const bl = blink.current;
    bl.t += delta;
    if (!bl.closing && bl.t >= bl.next) {
      bl.closing = true;
      bl.t = 0;
    }
    if (bl.closing) {
      // quick close then open (~0.16s)
      bl.amount = bl.t < 0.08 ? bl.t / 0.08 : Math.max(0, 1 - (bl.t - 0.08) / 0.08);
      if (bl.t > 0.16) {
        bl.closing = false;
        bl.t = 0;
        bl.next = 1.5 + Math.random() * 3.5;
        bl.amount = 0;
      }
    }
    const lidScale = 0.15 + bl.amount * 0.85;
    if (lidL.current) lidL.current.scale.y = lidScale;
    if (lidR.current) lidR.current.scale.y = lidScale;

    // ---- Mouth (lip-sync) ----
    if (mouthMesh.current) {
      let open = 0.14;             // gentle resting smile
      if (state === 'talking') open = 0.14 + mouth * 0.7;
      else if (state === 'happy') open = 0.5;
      else if (state === 'concerned') open = 0.08;
      mouthMesh.current.scale.y = THREE.MathUtils.damp(mouthMesh.current.scale.y, open, 14, delta);
      // smile curve: push corners via z-scale a touch when happy/idle
      const wide = state === 'concerned' ? 0.7 : 1;
      mouthMesh.current.scale.x = THREE.MathUtils.damp(mouthMesh.current.scale.x, wide, 10, delta);
    }
  });

  return (
    <group ref={group}>
      {/* ===== Torso (teal scrubs) ===== */}
      <mesh position={[0, 0.15, 0]} castShadow>
        <capsuleGeometry args={[0.62, 0.5, 12, 32]} />
        <meshStandardMaterial color={TEAL} roughness={0.85} />
      </mesh>
      {/* collar */}
      <mesh position={[0, 0.62, 0.02]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.28, 0.06, 12, 32]} />
        <meshStandardMaterial color={TEAL_DEEP} roughness={0.8} />
      </mesh>
      {/* little heart badge */}
      <mesh position={[0.28, 0.24, 0.55]}>
        <sphereGeometry args={[0.06, 16, 16]} />
        <meshStandardMaterial color="#ffffff" emissive={CHEEK} emissiveIntensity={0.3} />
      </mesh>

      {/* ===== Head group ===== */}
      <group ref={head} position={[0, 1.15, 0]}>
        {/* skull */}
        <mesh castShadow>
          <sphereGeometry args={[0.75, 48, 48]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>

        {/* soft cap / hair */}
        <mesh position={[0, 0.28, -0.05]} scale={[1.04, 0.82, 1.04]}>
          <sphereGeometry args={[0.74, 40, 40, 0, Math.PI * 2, 0, Math.PI / 1.7]} />
          <meshStandardMaterial color={TEAL_DEEP} roughness={0.7} />
        </mesh>

        {/* ears */}
        <mesh position={[-0.74, 0, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.6} />
        </mesh>
        <mesh position={[0.74, 0, 0]}>
          <sphereGeometry args={[0.14, 16, 16]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.6} />
        </mesh>

        {/* eye whites */}
        <mesh position={[-0.24, 0.16, 0.62]}>
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>
        <mesh position={[0.24, 0.16, 0.62]}>
          <sphereGeometry args={[0.17, 24, 24]} />
          <meshStandardMaterial color="#ffffff" roughness={0.3} />
        </mesh>

        {/* pupils */}
        <mesh ref={pupilL} position={[-0.22, 0.16, 0.76]}>
          <sphereGeometry args={[0.08, 20, 20]} />
          <meshStandardMaterial color={DARK} roughness={0.2} />
        </mesh>
        <mesh ref={pupilR} position={[0.22, 0.16, 0.76]}>
          <sphereGeometry args={[0.08, 20, 20]} />
          <meshStandardMaterial color={DARK} roughness={0.2} />
        </mesh>

        {/* eyelids (scale.y animates the blink) */}
        <mesh ref={lidL} position={[-0.24, 0.16, 0.64]} scale={[1, 0.15, 1]}>
          <sphereGeometry args={[0.185, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
        <mesh ref={lidR} position={[0.24, 0.16, 0.64]} scale={[1, 0.15, 1]}>
          <sphereGeometry args={[0.185, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>

        {/* brows */}
        <mesh ref={browL} position={[-0.24, 0.42, 0.66]} rotation={[0, 0, 0.1]}>
          <boxGeometry args={[0.22, 0.05, 0.06]} />
          <meshStandardMaterial color={TEAL_DEEP} roughness={0.7} />
        </mesh>
        <mesh ref={browR} position={[0.24, 0.42, 0.66]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.22, 0.05, 0.06]} />
          <meshStandardMaterial color={TEAL_DEEP} roughness={0.7} />
        </mesh>

        {/* nose */}
        <mesh position={[0, 0, 0.76]}>
          <sphereGeometry args={[0.07, 16, 16]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.6} />
        </mesh>

        {/* cheeks */}
        <mesh position={[-0.38, -0.12, 0.6]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={CHEEK} transparent opacity={0.35} roughness={0.6} />
        </mesh>
        <mesh position={[0.38, -0.12, 0.6]}>
          <sphereGeometry args={[0.12, 16, 16]} />
          <meshStandardMaterial color={CHEEK} transparent opacity={0.35} roughness={0.6} />
        </mesh>

        {/* mouth (scale.y = openness) */}
        <mesh ref={mouthMesh} position={[0, -0.32, 0.66]} scale={[1, 0.14, 1]}>
          <sphereGeometry args={[0.2, 24, 16]} />
          <meshStandardMaterial color="#a5432f" roughness={0.5} />
        </mesh>
      </group>
    </group>
  );
}

export function Avatar3D() {
  return (
    <>
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 4]} intensity={1.1} castShadow />
      <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#ffe6c9" />
      <pointLight position={[0, -2, 3]} intensity={0.3} color="#2a9d8f" />
      <Character />
    </>
  );
}
