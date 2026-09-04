"use client";

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useAvatar } from '../store/useAvatar';
import * as THREE from 'three';

function RobotAvatar() {
  const { state } = useAvatar();
  const group = useRef<THREE.Group>(null);
  const headRef = useRef<THREE.Mesh>(null);
  const mouthRef = useRef<THREE.Mesh>(null);

  useFrame((stateObj, delta) => {
    if (!group.current || !headRef.current || !mouthRef.current) return;

    const time = stateObj.clock.getElapsedTime();

    // Reset default rotations
    headRef.current.rotation.set(0, 0, 0);
    mouthRef.current.scale.set(1, 1, 1);
    group.current.position.y = 0;

    switch (state) {
      case 'idle':
        // Gentle bobbing
        group.current.position.y = Math.sin(time * 2) * 0.1;
        headRef.current.rotation.y = Math.sin(time * 0.5) * 0.1;
        break;
      case 'talking':
        // Rapid mouth movement and slight head movement
        mouthRef.current.scale.y = 1 + Math.sin(time * 15) * 0.8;
        headRef.current.rotation.x = Math.sin(time * 8) * 0.05;
        break;
      case 'listening':
        // Head tilted, slightly lowered
        headRef.current.rotation.z = 0.2;
        headRef.current.rotation.x = 0.1;
        break;
      case 'happy':
        // Slight bounce and tilt
        group.current.position.y = Math.abs(Math.sin(time * 5)) * 0.2;
        mouthRef.current.scale.x = 1.5; // Wide smile equivalent
        break;
      case 'concerned':
        // Head down
        headRef.current.rotation.x = 0.2;
        break;
    }
  });

  return (
    <group ref={group} position={[0, -1.5, 0]}>
      {/* Body */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.8, 0.8, 1.5, 32]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      
      {/* Head */}
      <group ref={headRef} position={[0, 1.2, 0]}>
        <mesh>
          <sphereGeometry args={[0.7, 32, 32]} />
          <meshStandardMaterial color="#60a5fa" />
        </mesh>
        {/* Eyes */}
        <mesh position={[-0.3, 0.2, 0.6]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        <mesh position={[0.3, 0.2, 0.6]}>
          <sphereGeometry args={[0.1, 16, 16]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
        {/* Mouth */}
        <mesh ref={mouthRef} position={[0, -0.2, 0.65]}>
          <boxGeometry args={[0.4, 0.05, 0.1]} />
          <meshStandardMaterial color="#1e3a8a" />
        </mesh>
      </group>
    </group>
  );
}

export function AvatarController() {
  return (
    <div className="w-full h-full relative">
      <Canvas camera={{ position: [0, 0, 4], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1} />
        <RobotAvatar />
      </Canvas>
    </div>
  );
}
