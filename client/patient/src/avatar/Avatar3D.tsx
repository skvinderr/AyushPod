"use client";

import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import { useAvatar } from '../store/useAvatar';
import * as THREE from 'three';

/*
 * Aaya — MediKiosk's guide. A warm, adult female doctor, fully procedural (no
 * external asset, so she always loads on a bare kiosk).
 *
 * She is framed WAIST-UP, like a receptionist leaning in to help — so her face
 * and, crucially, her HANDS are large and legible. White coat with lapels over
 * teal scrubs, a stethoscope at the neck, an ID badge, dark centre-parted hair
 * into a low bun, a small bindi.
 *
 * Her arms are two-bone (upper arm + forearm with a real elbow) ending in a
 * five-finger hand, with the sleeves rolled to the elbow so the SKIN forearms
 * and hands read clearly against the white coat. A gesture system damps both the
 * shoulder and elbow toward per-gesture targets, so she can genuinely point at /
 * present / wave toward the part of the screen a zero-literacy patient needs.
 *
 * The camera (in <AvatarStage>'s canvas) is fixed and frames her bust; this
 * component only animates the character. Corner↔stage movement is the canvas
 * container scaling, so she stays crisp and the WebGL buffer never resizes.
 */

const SKIN = '#e8b48a';
const SKIN_SHADOW = '#d69f72';
const TEAL = '#2a9d8f';
const TEAL_DEEP = '#1f7a6e';
const COAT = '#f8f6f1';        // warm white doctor's coat
const COAT_SHADE = '#e7e1d5';  // coat seams / lapel shade
const HAIR = '#241c18';        // warm near-black hair
const HAIR_HI = '#3a2c24';     // hair highlight
const NAVY = '#33415c';        // stethoscope tubing
const STEEL = '#c9ced6';       // stethoscope chestpiece
const BINDI = '#8e1d3a';
const CHEEK = '#e08a6a';
const IRIS = '#4a352a';        // warm brown iris
const LASH = '#1c1512';
const LIP = '#b4586a';         // warm rose lip

/** A five-finger hand (palm + four fingers + thumb), pointing along -Y. */
function Hand({ side }: { side: number }) {
  return (
    <group>
      {/* palm */}
      <mesh scale={[1, 1.12, 0.5]} castShadow>
        <sphereGeometry args={[0.12, 20, 20]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>
      {/* four fingers, splayed slightly, continuing past the palm */}
      {[-0.052, -0.017, 0.018, 0.053].map((fx, i) => (
        <mesh
          key={i}
          position={[fx, -0.17, 0.01]}
          rotation={[0.12, 0, fx * 1.6]}
          castShadow
        >
          <capsuleGeometry args={[0.021, 0.13 - Math.abs(fx) * 0.4, 5, 8]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>
      ))}
      {/* thumb — off the inner edge (toward body) */}
      <mesh
        position={[-side * 0.1, -0.03, 0.05]}
        rotation={[0.2, 0, side * 0.9]}
        castShadow
      >
        <capsuleGeometry args={[0.026, 0.09, 5, 8]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>
    </group>
  );
}

function Character() {
  const { state, mouth, gesture } = useAvatar();

  const group = useRef<THREE.Group>(null);
  const head = useRef<THREE.Group>(null);
  const mouthMesh = useRef<THREE.Mesh>(null);
  const lidL = useRef<THREE.Mesh>(null);
  const lidR = useRef<THREE.Mesh>(null);
  const pupilL = useRef<THREE.Mesh>(null);
  const pupilR = useRef<THREE.Mesh>(null);
  const browL = useRef<THREE.Mesh>(null);
  const browR = useRef<THREE.Mesh>(null);

  // Two-bone arms: an upper-arm group (pivots at the shoulder) and a nested
  // forearm group (pivots at the elbow), keyed by side (-1 = viewer left).
  const upper = useRef<Record<number, THREE.Group | null>>({});
  const fore = useRef<Record<number, THREE.Group | null>>({});

  const blink = useRef({ next: 1.5, t: 0, closing: false, amount: 0 });

  useFrame((_, delta) => {
    const t = performance.now() / 1000;
    if (!group.current || !head.current) return;

    // ---- Body idle: breathing bob + a slow autonomous shoulder sway ----
    // A fixed downward offset keeps generous air above her head and below her
    // waist in the canvas frame, so she is never clipped wherever the stage
    // places/scales the box.
    const bob = Math.sin(t * 1.5) * 0.02;
    group.current.position.y = THREE.MathUtils.damp(group.current.position.y, -0.5 + bob, 6, delta);
    group.current.rotation.y = THREE.MathUtils.damp(
      group.current.rotation.y,
      Math.sin(t * 0.5) * 0.04,
      4,
      delta,
    );

    // ---- Head base pose per state ----
    let targetRotX = 0;
    let targetRotZ = 0;
    let targetPosY = 0;
    let browY = 0;
    switch (state) {
      case 'listening':
        targetRotZ = 0.15; targetRotX = 0.05; browY = 0.015; break;
      case 'happy':
        targetPosY = Math.abs(Math.sin(t * 5.5)) * 0.05; browY = 0.025; break;
      case 'concerned':
        targetRotX = 0.13; browY = -0.03; break;
      case 'talking':
        targetRotX = Math.sin(t * 5.5) * 0.02; break;
    }

    const driftX = Math.sin(t * 0.45) * 0.11;
    const driftY = Math.sin(t * 0.7 + 1.3) * 0.05;

    head.current.rotation.x = THREE.MathUtils.damp(head.current.rotation.x, targetRotX - driftY * 0.4, 6, delta);
    head.current.rotation.y = THREE.MathUtils.damp(head.current.rotation.y, driftX, 6, delta);
    head.current.rotation.z = THREE.MathUtils.damp(head.current.rotation.z, targetRotZ, 6, delta);
    head.current.position.y = THREE.MathUtils.damp(head.current.position.y, 1.5 + targetPosY, 6, delta);

    [pupilL, pupilR].forEach((p) => {
      if (!p.current) return;
      const baseX = p === pupilL ? -0.205 : 0.205;
      p.current.position.x = THREE.MathUtils.damp(p.current.position.x, baseX + driftX * 0.05, 8, delta);
      p.current.position.y = THREE.MathUtils.damp(p.current.position.y, -0.03 + driftY * 0.05, 8, delta);
    });

    [browL, browR].forEach((b) => {
      if (!b.current) return;
      b.current.position.y = THREE.MathUtils.damp(b.current.position.y, 0.19 + browY, 6, delta);
    });

    // ---- Blink ----
    const bl = blink.current;
    bl.t += delta;
    if (!bl.closing && bl.t >= bl.next) { bl.closing = true; bl.t = 0; }
    if (bl.closing) {
      bl.amount = bl.t < 0.08 ? bl.t / 0.08 : Math.max(0, 1 - (bl.t - 0.08) / 0.08);
      if (bl.t > 0.16) { bl.closing = false; bl.t = 0; bl.next = 1.5 + Math.random() * 3.5; bl.amount = 0; }
    }
    const lidScale = 0.12 + bl.amount * 0.88;
    if (lidL.current) lidL.current.scale.y = lidScale;
    if (lidR.current) lidR.current.scale.y = lidScale;

    // ---- Mouth (lip-sync) ----
    if (mouthMesh.current) {
      let open = 0.16;
      if (state === 'talking') open = 0.16 + mouth * 0.6;
      else if (state === 'happy') open = 0.4;
      else if (state === 'concerned') open = 0.1;
      mouthMesh.current.scale.y = THREE.MathUtils.damp(mouthMesh.current.scale.y, open, 14, delta);
      const wide = state === 'concerned' ? 0.72 : 1;
      mouthMesh.current.scale.x = THREE.MathUtils.damp(mouthMesh.current.scale.x, wide, 10, delta);
    }

    // ---- Arms / hand gestures (two-bone) ----
    // For each side compute shoulder tilt (ux forward, uz out-splay) + elbow
    // bend (fx). Rest = hands softly forward at the waist. `osc` livens the
    // waving/pointing arm.
    const osc = Math.sin(t * 7) * 0.18;
    const breath = Math.sin(t * 1.5) * 0.02;

    // side: -1 viewer-left, +1 viewer-right. out-splay uses s so both go outward.
    const target = (s: number): { ux: number; uz: number; fx: number } => {
      const rest = { ux: 0.2, uz: s * 0.12, fx: 0.95 + breath };
      const active = s > 0; // right arm is the "acting" arm for one-sided gestures
      switch (gesture) {
        case 'present':
          // both hands lift to chest, palms opening toward the content
          return { ux: 0.55, uz: s * 0.3, fx: 1.55 + breath };
        case 'welcome':
          // arms open wide, a warm "come in" — palms up
          return { ux: 0.2, uz: s * 1.05, fx: 0.5 };
        case 'point-right':
          // right arm reaches straight out toward the content on her right
          return active ? { ux: 0.42, uz: 1.5, fx: 0.08 } : rest;
        case 'point-down':
          // right arm angles down-forward toward tiles below
          return active ? { ux: 1.25, uz: 0.14, fx: 0.3 } : rest;
        case 'wave':
          // right arm raised high beside the head, hand waving
          return active ? { ux: 0.15, uz: -2.2, fx: 1.05 + osc } : rest;
        default:
          return rest;
      }
    };

    ([-1, 1] as const).forEach((s) => {
      const u = upper.current[s];
      const f = fore.current[s];
      const tg = target(s);
      if (u) {
        u.rotation.x = THREE.MathUtils.damp(u.rotation.x, tg.ux, 7, delta);
        u.rotation.z = THREE.MathUtils.damp(u.rotation.z, tg.uz, 7, delta);
      }
      if (f) {
        f.rotation.x = THREE.MathUtils.damp(f.rotation.x, tg.fx, 7, delta);
      }
    });
  });

  return (
    <group ref={group}>
      {/* ===== Torso: white coat over teal scrubs (waist-up; flares below frame) ===== */}
      <mesh position={[0, 0.0, 0]} castShadow>
        <cylinderGeometry args={[0.5, 0.66, 2.0, 48, 1, false]} />
        <meshStandardMaterial color={COAT} roughness={0.85} />
      </mesh>
      {/* teal scrubs V shown in the coat opening */}
      <mesh position={[0, 0.5, 0.34]}>
        <boxGeometry args={[0.34, 0.8, 0.14]} />
        <meshStandardMaterial color={TEAL} roughness={0.82} />
      </mesh>
      {/* scrubs crew-collar */}
      <mesh position={[0, 0.86, 0.06]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.22, 0.055, 12, 32]} />
        <meshStandardMaterial color={TEAL_DEEP} roughness={0.78} />
      </mesh>
      {/* coat lapels — a soft V from the collar down the chest */}
      <mesh position={[-0.17, 0.5, 0.4]} rotation={[0.05, 0, 0.32]}>
        <boxGeometry args={[0.14, 0.9, 0.06]} />
        <meshStandardMaterial color={COAT_SHADE} roughness={0.8} />
      </mesh>
      <mesh position={[0.17, 0.5, 0.4]} rotation={[0.05, 0, -0.32]}>
        <boxGeometry args={[0.14, 0.9, 0.06]} />
        <meshStandardMaterial color={COAT_SHADE} roughness={0.8} />
      </mesh>

      {/* hospital ID badge clipped to the coat */}
      <mesh position={[0.34, 0.18, 0.4]} rotation={[0, 0, 0.05]} castShadow>
        <boxGeometry args={[0.2, 0.14, 0.02]} />
        <meshStandardMaterial color="#ffffff" roughness={0.55} />
      </mesh>
      <mesh position={[0.34, 0.215, 0.42]}>
        <boxGeometry args={[0.14, 0.03, 0.01]} />
        <meshStandardMaterial color={TEAL} emissive={TEAL} emissiveIntensity={0.25} />
      </mesh>

      {/* ===== Stethoscope: neck loop + two tubes + chestpiece ===== */}
      <mesh position={[0, 0.92, 0.08]} rotation={[Math.PI / 2.1, 0, 0]}>
        <torusGeometry args={[0.28, 0.032, 12, 40]} />
        <meshStandardMaterial color={NAVY} roughness={0.45} />
      </mesh>
      <mesh position={[-0.16, 0.62, 0.4]} rotation={[0.1, 0, 0.14]}>
        <capsuleGeometry args={[0.024, 0.46, 6, 12]} />
        <meshStandardMaterial color={NAVY} roughness={0.45} />
      </mesh>
      <mesh position={[0.16, 0.62, 0.4]} rotation={[0.1, 0, -0.14]}>
        <capsuleGeometry args={[0.024, 0.46, 6, 12]} />
        <meshStandardMaterial color={NAVY} roughness={0.45} />
      </mesh>
      <mesh position={[-0.16, 0.34, 0.44]} rotation={[Math.PI / 2, 0, 0]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
        <meshStandardMaterial color={STEEL} metalness={0.6} roughness={0.32} />
      </mesh>

      {/* ===== Shoulders (clearly wider than the head → adult) ===== */}
      <mesh position={[-0.6, 0.92, 0]} castShadow>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color={COAT} roughness={0.85} />
      </mesh>
      <mesh position={[0.6, 0.92, 0]} castShadow>
        <sphereGeometry args={[0.24, 24, 24]} />
        <meshStandardMaterial color={COAT} roughness={0.85} />
      </mesh>

      {/* ===== Two-bone arms ===== */}
      {([-1, 1] as const).map((side) => (
        <group
          key={side}
          ref={(el) => { upper.current[side] = el; }}
          position={[side * 0.62, 0.92, 0.06]}
        >
          {/* upper sleeve (white coat) hanging from the shoulder */}
          <mesh position={[0, -0.28, 0]} castShadow>
            <capsuleGeometry args={[0.135, 0.44, 8, 20]} />
            <meshStandardMaterial color={COAT} roughness={0.85} />
          </mesh>
          {/* rolled cuff (teal) at the elbow */}
          <mesh position={[0, -0.54, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.13, 0.035, 10, 20]} />
            <meshStandardMaterial color={TEAL} roughness={0.78} />
          </mesh>

          {/* forearm group — pivots at the elbow */}
          <group ref={(el) => { fore.current[side] = el; }} position={[0, -0.56, 0]}>
            {/* skin forearm (sleeve rolled up) */}
            <mesh position={[0, -0.22, 0]} castShadow>
              <capsuleGeometry args={[0.1, 0.36, 8, 18]} />
              <meshStandardMaterial color={SKIN} roughness={0.5} />
            </mesh>
            {/* wrist + hand */}
            <group position={[0, -0.5, 0]}>
              <Hand side={side} />
            </group>
          </group>
        </group>
      ))}

      {/* neck — slim + longer so she reads as an adult woman */}
      <mesh position={[0, 1.02, 0]} castShadow>
        <cylinderGeometry args={[0.12, 0.16, 0.4, 24]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>

      {/* ===== Head group (scaled down so the head reads adult vs the shoulders) ===== */}
      <group ref={head} position={[0, 1.5, 0]} scale={0.86}>
        {/* skull — an OVAL face (taller than wide), not a round ball */}
        <mesh castShadow scale={[0.9, 1.08, 0.94]}>
          <sphereGeometry args={[0.58, 48, 48]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.44, 0.04]} scale={[0.82, 0.9, 0.9]}>
          <sphereGeometry args={[0.34, 32, 32]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>

        {/* ---- Hair ---- */}
        <mesh position={[0, 0.12, -0.05]} scale={[1.08, 1.05, 1.1]}>
          <sphereGeometry args={[0.6, 40, 40, 0, Math.PI * 2, 0, Math.PI / 1.55]} />
          <meshStandardMaterial color={HAIR} roughness={0.62} metalness={0.05} />
        </mesh>
        <mesh position={[0, 0.4, 0.16]} rotation={[0.5, 0, 0]}>
          <boxGeometry args={[0.03, 0.36, 0.04]} />
          <meshStandardMaterial color={HAIR_HI} roughness={0.55} />
        </mesh>
        <mesh position={[-0.47, -0.06, 0.14]} rotation={[0, 0, 0.16]}>
          <capsuleGeometry args={[0.12, 0.6, 8, 16]} />
          <meshStandardMaterial color={HAIR} roughness={0.62} />
        </mesh>
        <mesh position={[0.47, -0.06, 0.14]} rotation={[0, 0, -0.16]}>
          <capsuleGeometry args={[0.12, 0.6, 8, 16]} />
          <meshStandardMaterial color={HAIR} roughness={0.62} />
        </mesh>
        <mesh position={[0, -0.16, -0.52]} castShadow>
          <sphereGeometry args={[0.24, 28, 28]} />
          <meshStandardMaterial color={HAIR} roughness={0.62} />
        </mesh>

        {/* ears */}
        <mesh position={[-0.56, -0.04, 0.0]} scale={[0.7, 1, 0.7]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.55} />
        </mesh>
        <mesh position={[0.56, -0.04, 0.0]} scale={[0.7, 1, 0.7]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.55} />
        </mesh>

        {/* ---- Eyes ---- */}
        <mesh position={[-0.205, -0.03, 0.46]} scale={[1.25, 0.72, 0.5]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color="#f7f4ef" roughness={0.25} />
        </mesh>
        <mesh position={[0.205, -0.03, 0.46]} scale={[1.25, 0.72, 0.5]}>
          <sphereGeometry args={[0.12, 24, 24]} />
          <meshStandardMaterial color="#f7f4ef" roughness={0.25} />
        </mesh>
        <mesh ref={pupilL} position={[-0.205, -0.03, 0.53]}>
          <sphereGeometry args={[0.058, 20, 20]} />
          <meshStandardMaterial color={IRIS} roughness={0.18} />
        </mesh>
        <mesh ref={pupilR} position={[0.205, -0.03, 0.53]}>
          <sphereGeometry args={[0.058, 20, 20]} />
          <meshStandardMaterial color={IRIS} roughness={0.18} />
        </mesh>
        <mesh position={[-0.185, 0.0, 0.57]}>
          <sphereGeometry args={[0.018, 10, 10]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[0.225, 0.0, 0.57]}>
          <sphereGeometry args={[0.018, 10, 10]} />
          <meshStandardMaterial color="#ffffff" emissive="#ffffff" emissiveIntensity={0.5} />
        </mesh>

        {/* upper lash line */}
        <mesh position={[-0.205, 0.04, 0.5]} rotation={[0, 0, 0.05]} scale={[1.3, 1, 0.5]}>
          <boxGeometry args={[0.2, 0.022, 0.05]} />
          <meshStandardMaterial color={LASH} roughness={0.5} />
        </mesh>
        <mesh position={[0.205, 0.04, 0.5]} rotation={[0, 0, -0.05]} scale={[1.3, 1, 0.5]}>
          <boxGeometry args={[0.2, 0.022, 0.05]} />
          <meshStandardMaterial color={LASH} roughness={0.5} />
        </mesh>

        {/* eyelids (scale.y animates the blink) */}
        <mesh ref={lidL} position={[-0.205, -0.02, 0.47]} scale={[1.25, 0.12, 0.5]}>
          <sphereGeometry args={[0.125, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>
        <mesh ref={lidR} position={[0.205, -0.02, 0.47]} scale={[1.25, 0.12, 0.5]}>
          <sphereGeometry args={[0.125, 24, 24, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>

        {/* brows */}
        <mesh ref={browL} position={[-0.205, 0.19, 0.5]} rotation={[0, 0, 0.14]} scale={[1, 1, 0.5]}>
          <boxGeometry args={[0.2, 0.03, 0.05]} />
          <meshStandardMaterial color={HAIR} roughness={0.6} />
        </mesh>
        <mesh ref={browR} position={[0.205, 0.19, 0.5]} rotation={[0, 0, -0.14]} scale={[1, 1, 0.5]}>
          <boxGeometry args={[0.2, 0.03, 0.05]} />
          <meshStandardMaterial color={HAIR} roughness={0.6} />
        </mesh>

        {/* bindi */}
        <mesh position={[0, 0.34, 0.49]}>
          <sphereGeometry args={[0.032, 12, 12]} />
          <meshStandardMaterial color={BINDI} roughness={0.35} />
        </mesh>

        {/* nose */}
        <mesh position={[0, 0.02, 0.52]} rotation={[0.1, 0, 0]}>
          <capsuleGeometry args={[0.032, 0.16, 6, 12]} />
          <meshStandardMaterial color={SKIN} roughness={0.5} />
        </mesh>
        <mesh position={[0, -0.12, 0.55]}>
          <sphereGeometry args={[0.05, 16, 16]} />
          <meshStandardMaterial color={SKIN_SHADOW} roughness={0.55} />
        </mesh>

        {/* cheeks — soft blush */}
        <mesh position={[-0.32, -0.2, 0.42]} scale={[1.1, 0.8, 0.5]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color={CHEEK} transparent opacity={0.3} roughness={0.6} />
        </mesh>
        <mesh position={[0.32, -0.2, 0.42]} scale={[1.1, 0.8, 0.5]}>
          <sphereGeometry args={[0.11, 16, 16]} />
          <meshStandardMaterial color={CHEEK} transparent opacity={0.3} roughness={0.6} />
        </mesh>

        {/* lips (scale.y = openness) */}
        <mesh ref={mouthMesh} position={[0, -0.3, 0.49]} scale={[1, 0.16, 0.5]}>
          <sphereGeometry args={[0.13, 24, 16]} />
          <meshStandardMaterial color={LIP} roughness={0.45} />
        </mesh>
      </group>
    </group>
  );
}

export function Avatar3D() {
  return (
    <>
      {/* soft ambient so nothing is fully black */}
      <hemisphereLight args={['#fff6ec', '#d8cfc0', 0.75]} />
      {/* key light */}
      <directionalLight position={[3, 5, 4]} intensity={1.15} castShadow shadow-mapSize={[1024, 1024]} />
      {/* warm fill from the other side */}
      <directionalLight position={[-4, 2, -1]} intensity={0.42} color="#ffe6c9" />
      {/* cool rim from behind to separate her from the teal room */}
      <directionalLight position={[0, 3, -4]} intensity={0.55} color="#bfe9ff" />
      {/* small front light for eye catchlights */}
      <pointLight position={[0, 1.4, 3]} intensity={0.38} color="#eafaf6" />
      <Character />
      <ContactShadows position={[0, -1.15, 0]} opacity={0.25} scale={4.5} blur={2.8} far={3} />
    </>
  );
}
