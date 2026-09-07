"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useAvatar } from '../store/useAvatar';
import * as THREE from 'three';

function MedicalDoctorAvatar() {
  const { state } = useAvatar();
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Group>(null);
  const mouthRef = useRef<THREE.Mesh>(null);
  const leftEyebrowRef = useRef<THREE.Mesh>(null);
  const rightEyebrowRef = useRef<THREE.Mesh>(null);

  useFrame((stateObj) => {
    if (!group.current || !headRef.current || !mouthRef.current) return;

    const time = stateObj.clock.getElapsedTime();

    // Default Neutral Positions
    group.current.position.y = -1.2;
    headRef.current.rotation.set(0, 0, 0);
    mouthRef.current.scale.set(1, 1, 1);
    
    if (leftEyebrowRef.current && rightEyebrowRef.current) {
      leftEyebrowRef.current.rotation.z = -0.05;
      rightEyebrowRef.current.rotation.z = 0.05;
      leftEyebrowRef.current.position.y = 0.38;
      rightEyebrowRef.current.position.y = 0.38;
    }

    // State Animations
    switch (state) {
      case 'idle':
        // Soft breathing and subtle head movement
        group.current.position.y = -1.2 + Math.sin(time * 1.8) * 0.04;
        headRef.current.rotation.y = Math.sin(time * 0.8) * 0.08;
        headRef.current.rotation.x = Math.cos(time * 0.6) * 0.03;
        break;

      case 'talking':
        // Natural speech movement
        group.current.position.y = -1.2 + Math.sin(time * 3) * 0.02;
        mouthRef.current.scale.y = 1 + Math.sin(time * 16) * 0.9;
        mouthRef.current.scale.x = 1 + Math.cos(time * 10) * 0.2;
        headRef.current.rotation.x = Math.sin(time * 6) * 0.04;
        headRef.current.rotation.y = Math.sin(time * 2) * 0.05;
        break;

      case 'listening':
        // Attentive tilt
        headRef.current.rotation.z = 0.12;
        headRef.current.rotation.x = 0.08;
        group.current.position.y = -1.2 + Math.sin(time * 1.5) * 0.02;
        break;

      case 'happy':
        // Cheerful bounce and smile
        group.current.position.y = -1.2 + Math.abs(Math.sin(time * 4)) * 0.1;
        mouthRef.current.scale.x = 1.6;
        mouthRef.current.scale.y = 1.2;
        if (leftEyebrowRef.current && rightEyebrowRef.current) {
          leftEyebrowRef.current.position.y = 0.42;
          rightEyebrowRef.current.position.y = 0.42;
        }
        break;

      case 'concerned':
        // Sympathetic empathetic pose
        headRef.current.rotation.x = 0.15;
        headRef.current.rotation.z = -0.05;
        if (leftEyebrowRef.current && rightEyebrowRef.current) {
          leftEyebrowRef.current.rotation.z = 0.25;
          rightEyebrowRef.current.rotation.z = -0.25;
        }
        break;
    }
  });

  return (
    <group ref={group} position={[0, -1.2, 0]}>
      {/* 1. TORSO & MEDICAL COAT */}
      <group position={[0, 0, 0]}>
        {/* Inner Scrubs Top */}
        <mesh position={[0, -0.1, 0]}>
          <cylinderGeometry args={[0.65, 0.75, 1.3, 32]} />
          <meshStandardMaterial color="#008080" roughness={0.6} /> {/* Teal Scrubs */}
        </mesh>

        {/* Doctor White Overcoat */}
        <mesh position={[0, -0.12, 0.02]}>
          <cylinderGeometry args={[0.7, 0.8, 1.35, 32, 1, true, -Math.PI * 0.75, Math.PI * 1.5]} />
          <meshStandardMaterial color="#f8fafc" roughness={0.3} side={THREE.DoubleSide} />
        </mesh>

        {/* Stethoscope around neck */}
        <mesh position={[0, 0.35, 0.22]} rotation={[Math.PI / 3, 0, 0]}>
          <torusGeometry args={[0.35, 0.03, 16, 32, Math.PI]} />
          <meshStandardMaterial color="#334155" roughness={0.2} metalness={0.5} />
        </mesh>
        <mesh position={[0, 0.1, 0.42]}>
          <cylinderGeometry args={[0.08, 0.08, 0.03, 24]} />
          <meshStandardMaterial color="#94a3b8" metalness={0.8} roughness={0.2} />
        </mesh>
      </group>

      {/* 2. NECK */}
      <mesh position={[0, 0.65, 0]}>
        <cylinderGeometry args={[0.22, 0.25, 0.35, 32]} />
        <meshStandardMaterial color="#fcd34d" roughness={0.7} /> {/* Skin tone */}
      </mesh>

      {/* 3. HEAD & FACE */}
      <group ref={headRef} position={[0, 1.15, 0]}>
        {/* Head Base */}
        <mesh>
          <sphereGeometry args={[0.55, 32, 32]} />
          <meshStandardMaterial color="#fcd34d" roughness={0.6} />
        </mesh>

        {/* Hair Cap / Stylized Medical Hair */}
        <mesh position={[0, 0.15, -0.05]}>
          <sphereGeometry args={[0.57, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
          <meshStandardMaterial color="#1e293b" roughness={0.9} />
        </mesh>

        {/* Left Eye */}
        <group position={[-0.2, 0.1, 0.48]}>
          <mesh>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Right Eye */}
        <group position={[0.2, 0.1, 0.48]}>
          <mesh>
            <sphereGeometry args={[0.09, 16, 16]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0, 0, 0.06]}>
            <sphereGeometry args={[0.05, 16, 16]} />
            <meshStandardMaterial color="#0f172a" />
          </mesh>
        </group>

        {/* Eyebrows */}
        <mesh ref={leftEyebrowRef} position={[-0.2, 0.25, 0.5]}>
          <boxGeometry args={[0.15, 0.025, 0.02]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>
        <mesh ref={rightEyebrowRef} position={[0.2, 0.25, 0.5]}>
          <boxGeometry args={[0.15, 0.025, 0.02]} />
          <meshStandardMaterial color="#0f172a" />
        </mesh>

        {/* Nose */}
        <mesh position={[0, -0.02, 0.55]} rotation={[0.2, 0, 0]}>
          <coneGeometry args={[0.05, 0.12, 16]} />
          <meshStandardMaterial color="#fbbf24" roughness={0.7} />
        </mesh>

        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.2, 0.5]} rotation={[0, 0, Math.PI / 2]}>
  <capsuleGeometry args={[0.03, 0.12, 4, 8]} />
  <meshStandardMaterial color="#e11d48" roughness={0.4} />
</mesh>
      </group>
    </group>
  );
}

export function AvatarController() {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[5, 8, 5]} intensity={1.2} />
        <pointLight position={[-5, -2, -2]} intensity={0.4} color="#008080" />
        <MedicalDoctorAvatar />
      </Canvas>
    </div>
  );
}