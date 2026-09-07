"use client";

import React, { useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { useAvatar } from '../store/useAvatar';
import * as THREE from 'three';

/*
 * Aaya — MediKiosk's guide: a warm female doctor who stands in the teal guide
 * rail and gestures toward the content with her hands. Fully procedural (no
 * external asset, always loads on a bare kiosk). She wears a white coat over
 * teal scrubs with a stethoscope; dark hair tied in a low bun with a small
 * bindi. Real face: pupils that track a gentle target, eyelids that blink, a
 * mouth that lip-syncs while talking, plus happy / concerned / listening poses.
 *
 * The camera frames her whole standing figure (head → hands) so her gestures
 * read, and leans in a touch when she steps onto the "stage" to guide.
 */

const SKIN = '#f2c9a0';
const SKIN_SHADOW = '#e3ac82';
const TEAL = '#2a9d8f';
const TEAL_DEEP = '#1f7a6e';
const COAT = '#f6f4ef';        // warm white doctor's coat
const COAT_SEAM = '#e4ded2';   // subtle coat seams / lapel
const HAIR = '#2b2320';        // dark hair
const NAVY = '#33415c';        // stethoscope tubing
const STEEL = '#c9ced6';       // stethoscope chestpiece
const BINDI = '#8e1d3a';
const CHEEK = '#e8896f';
const DARK = '#3a3330';

function Character() {
  const { state, mouth, gesture, presence } = useAvatar();

  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const mouthMesh = useRef<THREE.Mesh>(null);
  const lidL = useRef<THREE.Mesh>(null);
  const lidR = useRef<THREE.Mesh>(null);
  const pupilL = useRef<THREE.Mesh>(null);
  const pupilR = useRef<THREE.Mesh>(null);
  const browL = useRef<THREE.Mesh>(null);
  const browR = useRef<THREE.Mesh>(null);
  // Arm pivots (rotate at the shoulder). Left/right are the viewer's left/right.
  const armL = useRef<THREE.Group>(null);
  const armR = useRef<THREE.Group>(null);

  const { pointer, camera } = useThree();

  // Blink bookkeeping
  const blink = useRef({ next: 1.5, t: 0, closing: false, amount: 0 });
  // Damped camera look target (y) so lean-in is smooth
  const lookY = useRef(-0.1);

  useFrame((_, delta) => {
    const t = performance.now() / 1000;
    if (!group.current || !head.current) return;

    const onStage = presence === 'stage';

    // ---- Camera framing: whole figure at rest, lean in a touch on stage ----
    const camTargetY = onStage ? 0.05 : -0.1;
    const camTargetZ = onStage ? 5.5 : 6.1;
    camera.position.x = THREE.MathUtils.damp(camera.position.x, 0, 4, delta);
    camera.position.y = THREE.MathUtils.damp(camera.position.y, camTargetY, 4, delta);
    camera.position.z = THREE.MathUtils.damp(camera.position.z, camTargetZ, 4, delta);
    lookY.current = THREE.MathUtils.damp(lookY.current, onStage ? 0.05 : -0.1, 4, delta);
    camera.lookAt(0, lookY.current, 0);

    // ---- Body idle bob + a small "step forward" lift on stage ----
    const bob = Math.sin(t * 1.6) * 0.03;
    group.current.position.y = THREE.MathUtils.damp(
      group.current.position.y,
      (onStage ? -0.08 : -0.15) + bob,
      6,
      delta,
    );

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
    const lookYp = THREE.MathUtils.clamp(pointer.y, -1, 1) * 0.14;

    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, targetRotX - lookYp, 6, delta);
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, lookX + Math.sin(t * 0.6) * 0.05, 6, delta);
    head.current.rotation.z = THREE.MathUtils.damp(head.current.rotation.z, targetRotZ, 6, delta);
    head.current.position.y = THREE.MathUtils.damp(head.current.position.y, 1.15 + targetPosY, 6, delta);

    // Pupils drift toward the pointer too
    [pupilL, pupilR].forEach((p) => {
      if (!p.current) return;
      p.current.position.x = THREE.MathUtils.damp(p.current.position.x, (p === pupilL ? -0.22 : 0.22) + lookX * 0.06, 8, delta);
      p.current.position.y = THREE.MathUtils.damp(p.current.position.y, 0.16 - lookYp * 0.04, 8, delta);
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
      // smile curve: narrow the mouth a touch when concerned
      const wide = state === 'concerned' ? 0.7 : 1;
      mouthMesh.current.scale.x = THREE.MathUtils.damp(mouthMesh.current.scale.x, wide, 10, delta);
    }

    // ---- Arms / hand gestures ----
    // Resting pose: arms hang softly at her sides. Each gesture damps the
    // shoulder rotation toward a target; the right arm gets a small live
    // oscillation for wave/point so it feels alive.
    let lz = 0.28;   // left arm out-splay (viewer left)
    let lx = 0;      // left arm forward/back
    let rz = -0.28;  // right arm out-splay (viewer right)
    let rx = 0;      // right arm forward/back
    const osc = Math.sin(t * 7) * 0.18;

    switch (gesture) {
      case 'wave':
        rz = -2.3;               // right arm up beside the head
        rx = 0.2 + osc;          // waving oscillation
        break;
      case 'welcome':
        lz = 1.15; rz = -1.15;   // both arms open outward, palms up
        lx = 0.4; rx = 0.4;
        break;
      case 'present':
        lz = 0.7; rz = -0.7;     // both hands gesture forward toward content
        lx = 1.15; rx = 1.15;
        break;
      case 'point-right':
        rz = -1.5;               // right arm extends toward content on the right
        rx = 1.2 + osc * 0.4;
        break;
      case 'point-down':
        rz = -0.5;               // right arm angles down toward tiles below
        rx = 1.4;
        break;
    }

    if (armL.current) {
      armL.current.rotation.z = THREE.MathUtils.damp(armL.current.rotation.z, lz, 7, delta);
      armL.current.rotation.x = THREE.MathUtils.damp(armL.current.rotation.x, lx, 7, delta);
    }
    if (armR.current) {
      armR.current.rotation.z = THREE.MathUtils.damp(armR.current.rotation.z, rz, 7, delta);
      armR.current.rotation.x = THREE.MathUtils.damp(armR.current.rotation.x, rx, 7, delta);
    }
  });

  return (
    <group ref={group}>
      {/* ===== White coat (standing figure, flares gently to the hem) ===== */}
      <mesh position={[0, -0.7, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.9, 2.2, 40, 1, false]} />
        <meshStandardMaterial color={COAT} roughness={0.9} />
      </mesh>
      {/* coat front seams — a soft V toward the collar */}
      <mesh position={[-0.13, 0.14, 0.44]} rotation={[0, 0, 0.2]}>
        <boxGeometry args={[0.045, 0.66, 0.05]} />
        <meshStandardMaterial color={COAT_SEAM} roughness={0.85} />
      </mesh>
      <mesh position={[0.13, 0.14, 0.44]} rotation={[0, 0, -0.2]}>
        <boxGeometry args={[0.045, 0.66, 0.05]} />
        <meshStandardMaterial color={COAT_SEAM} roughness={0.85} />
      </mesh>
      {/* teal scrubs shown in the coat opening */}
      <mesh position={[0, 0.28, 0.4]}>
        <boxGeometry args={[0.34, 0.55, 0.12]} />
        <meshStandardMaterial color={TEAL} roughness={0.85} />
      </mesh>
      {/* teal scrubs crew-collar */}
      <mesh position={[0, 0.6, 0.04]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.26, 0.07, 12, 32]} />
        <meshStandardMaterial color={TEAL_DEEP} roughness={0.8} />
      </mesh>

      {/* hospital ID badge clipped to the coat */}
      <mesh position={[0.3, 0.02, 0.44]} rotation={[0, 0, 0.04]}>
        <boxGeometry args={[0.2, 0.13, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.6} />
      </mesh>
      <mesh position={[0.3, 0.05, 0.46]}>
        <sphereGeometry args={[0.028, 12, 12]} />
        <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.3} />
      </mesh>

      {/* ===== Stethoscope ===== */}
      {/* tubing draped around the neck */}
      <mesh position={[0, 0.56, 0.12]} rotation={[Math.PI / 2.1, 0, 0]}>
        <torusGeometry args={[0.28, 0.04, 12, 40]} />
        <meshStandardMaterial color={NAVY} roughness={0.5} />
      </mesh>
      {/* a length of tube hanging toward the chestpiece */}
      <mesh position={[0.17, 0.28, 0.44]} rotation={[0.1, 0, -0.16]}>
        <capsuleGeometry args={[0.028, 0.42, 6, 12]} />
        <meshStandardMaterial color={NAVY} roughness={0.5} />
      </mesh>
      {/* chestpiece */}
      <mesh position={[0.17, 0.02, 0.47]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.09, 0.09, 0.04, 24]} />
        <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.35} />
      </mesh>

      {/* ===== Shoulders ===== */}
      <mesh position={[-0.5, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={COAT} roughness={0.9} />
      </mesh>
      <mesh position={[0.5, 0.52, 0]} castShadow>
        <sphereGeometry args={[0.2, 24, 24]} />
        <meshStandardMaterial color={COAT} roughness={0.9} />
      </mesh>

      {/* ===== Arms (pivot at the shoulder; sleeve hangs downward) ===== */}
      {/* Left arm (viewer's left) */}
      <group ref={armL} position={[-0.6, 0.5, 0.05]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.62, 8, 20]} />
          <meshStandardMaterial color={COAT} roughness={0.9} />
        </mesh>
        {/* teal scrubs cuff */}
        <mesh position={[0, -0.74, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.035, 10, 20]} />
          <meshStandardMaterial color={TEAL} roughness={0.8} />
        </mesh>
        {/* hand */}
        <mesh position={[0, -0.9, 0]} castShadow>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
      </group>
      {/* Right arm (viewer's right) */}
      <group ref={armR} position={[0.6, 0.5, 0.05]}>
        <mesh position={[0, -0.42, 0]} castShadow>
          <capsuleGeometry args={[0.15, 0.62, 8, 20]} />
          <meshStandardMaterial color={COAT} roughness={0.9} />
        </mesh>
        <mesh position={[0, -0.74, 0]} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[0.15, 0.035, 10, 20]} />
          <meshStandardMaterial color={TEAL} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.9, 0]} castShadow>
          <sphereGeometry args={[0.16, 20, 20]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>
      </group>

      {/* neck */}
      <mesh position={[0, 0.62, 0]} castShadow>
        <cylinderGeometry args={[0.15, 0.19, 0.3, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.55} />
      </mesh>

      {/* ===== Head group ===== */}
      <group ref={head} position={[0, 1.15, 0]}>
        {/* skull */}
        <mesh castShadow>
          <sphereGeometry args={[0.75, 48, 48]} />
          <meshStandardMaterial color={SKIN} roughness={0.55} />
        </mesh>

        {/* hair — dark cap over the crown, framing the face */}
        <mesh position={[0, 0.26, -0.04]} scale={[1.06, 0.92, 1.08]}>
          <sphereGeometry args={[0.76, 40, 40, 0, Math.PI * 2, 0, Math.PI / 1.6]} />
          <meshStandardMaterial color={HAIR} roughness={0.72} />
        </mesh>
        {/* low bun at the back */}
        <mesh position={[0, -0.02, -0.62]} castShadow>
          <sphereGeometry args={[0.27, 28, 28]} />
          <meshStandardMaterial color={HAIR} roughness={0.72} />
        </mesh>
        {/* side locks framing the cheeks */}
        <mesh position={[-0.64, -0.08, 0.12]} rotation={[0, 0, 0.12]}>
          <capsuleGeometry args={[0.09, 0.42, 6, 12]} />
          <meshStandardMaterial color={HAIR} roughness={0.72} />
        </mesh>
        <mesh position={[0.64, -0.08, 0.12]} rotation={[0, 0, -0.12]}>
          <capsuleGeometry args={[0.09, 0.42, 6, 12]} />
          <meshStandardMaterial color={HAIR} roughness={0.72} />
        </mesh>

        {/* ears */}
        <mesh position={[-0.74, 0, 0.02]}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.6} />
        </mesh>
        <mesh position={[0.74, 0, 0.02]}>
          <sphereGeometry args={[0.13, 16, 16]} />
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
          <boxGeometry args={[0.22, 0.045, 0.06]} />
          <meshStandardMaterial color={HAIR} roughness={0.7} />
        </mesh>
        <mesh ref={browR} position={[0.24, 0.42, 0.66]} rotation={[0, 0, -0.1]}>
          <boxGeometry args={[0.22, 0.045, 0.06]} />
          <meshStandardMaterial color={HAIR} roughness={0.7} />
        </mesh>

        {/* bindi */}
        <mesh position={[0, 0.3, 0.72]}>
          <sphereGeometry args={[0.045, 12, 12]} />
          <meshStandardMaterial color={BINDI} roughness={0.4} />
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

        {/* lips (scale.y = openness) */}
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
      <ambientLight intensity={0.85} />
      <directionalLight position={[3, 5, 4]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, -2]} intensity={0.4} color="#ffe6c9" />
      <pointLight position={[0, 1, 3]} intensity={0.35} color="#eafaf6" />
      <Character />
      <ContactShadows position={[0, -1.92, 0]} opacity={0.32} scale={5} blur={2.8} far={4} />
    </>
  );
}
