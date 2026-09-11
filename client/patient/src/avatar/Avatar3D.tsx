"use client";

import React, { useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useGLTF, ContactShadows } from '@react-three/drei';
import { useAvatar } from '../store/useAvatar';
import * as THREE from 'three';

export function Avatar3D() {
  const { scene } = useGLTF('/Ch46_nonPBR.glb');
  const { state, gesture, mouth } = useAvatar();

  const { cloned, modelScale, modelY } = useMemo(() => {
    const clone = scene.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
      }
    });

    const box = new THREE.Box3().setFromObject(clone);
    if (box.isEmpty() || !isFinite(box.min.y) || !isFinite(box.max.y)) {
       return { cloned: clone, modelScale: 1.5, modelY: -3.2 };
    }

    const size = box.getSize(new THREE.Vector3());
    const height = size.y > 0 ? size.y : 1.8; 
    
    // Auto-scale to exactly 4.2 units tall
    const scale = 4.2 / height;
    
    // Position the feet so the waist is centered
    const posY = -3.2 - (box.min.y * scale);

    return { cloned: clone, modelScale: scale, modelY: posY };
  }, [scene]);

  // Extract bones (ignore the weird Assimp translation nodes)
  const bones = useMemo(() => {
    const dict: Record<string, THREE.Bone> = {};
    cloned.traverse((child) => {
      if ((child as THREE.Bone).isBone && !child.name.includes('$AssimpFbx$')) {
        const name = child.name.replace(/^mixamorig:?/, '');
        dict[name] = child as THREE.Bone;
      }
    });
    return dict;
  }, [cloned]);

  // Set the resting A-pose
  useEffect(() => {
    if (bones.RightArm) bones.RightArm.rotation.z = 1.2;
    if (bones.LeftArm) bones.LeftArm.rotation.z = -1.2;
    if (bones.RightForeArm) bones.RightForeArm.rotation.x = 0.2;
    if (bones.LeftForeArm) bones.LeftForeArm.rotation.x = 0.2;
  }, [bones]);

  useFrame((_, delta) => {
    const t = performance.now() / 1000;
    
    // Subtle whole-body drift
    cloned.position.y = THREE.MathUtils.damp(cloned.position.y, modelY + Math.sin(t * 1.5) * 0.02, 6, delta);
    
    // Head logic
    if (bones.Head) {
      let targetRotX = 0;
      let targetRotZ = 0;
      if (state === 'listening') { targetRotZ = -0.15; targetRotX = 0.05; }
      else if (state === 'concerned') { targetRotX = 0.13; }
      else if (state === 'talking') { targetRotX = Math.sin(t * 5.5) * 0.02; }

      const driftX = Math.sin(t * 0.45) * 0.11;
      const driftY = Math.sin(t * 0.7 + 1.3) * 0.05;

      bones.Head.rotation.x = THREE.MathUtils.damp(bones.Head.rotation.x, targetRotX + driftY * 0.4, 6, delta);
      bones.Head.rotation.y = THREE.MathUtils.damp(bones.Head.rotation.y, driftX, 6, delta);
      bones.Head.rotation.z = THREE.MathUtils.damp(bones.Head.rotation.z, targetRotZ, 6, delta);
      
      if (state === 'talking') {
         bones.Head.rotation.x += mouth * 0.08;
      }
    }

    // Right Arm Gestures
    if (bones.RightShoulder && bones.RightArm && bones.RightForeArm) {
      const osc = Math.sin(t * 7) * 0.18;
      
      let tgArmZ = 1.2; // A-pose rest
      let tgArmX = 0;
      let tgArmY = 0;
      let tgForeArmX = 0.2;

      if (gesture === 'present') {
        tgArmZ = 0.4;
        tgArmX = -0.5;
        tgForeArmX = -1.5;
      } else if (gesture === 'point-right') {
        tgArmZ = 1.5;
        tgArmY = -0.5;
        tgForeArmX = -0.1;
      } else if (gesture === 'wave') {
        tgArmZ = -1.5;
        tgArmX = 0;
        tgForeArmX = -1.5 + osc;
      } else if (gesture === 'point-down') {
        tgArmZ = 1.2;
        tgArmX = -1.2;
        tgForeArmX = -0.5;
      }

      bones.RightArm.rotation.z = THREE.MathUtils.damp(bones.RightArm.rotation.z, tgArmZ, 7, delta);
      bones.RightArm.rotation.x = THREE.MathUtils.damp(bones.RightArm.rotation.x, tgArmX, 7, delta);
      bones.RightArm.rotation.y = THREE.MathUtils.damp(bones.RightArm.rotation.y, tgArmY, 7, delta);
      bones.RightForeArm.rotation.x = THREE.MathUtils.damp(bones.RightForeArm.rotation.x, tgForeArmX, 7, delta);
    }

    // Left Arm Gestures
    if (bones.LeftShoulder && bones.LeftArm && bones.LeftForeArm) {
      let tgArmZ = -1.2;
      let tgArmX = 0;
      let tgForeArmX = 0.2;

      if (gesture === 'present') {
        tgArmZ = -0.4;
        tgArmX = -0.5;
        tgForeArmX = -1.5;
      } else if (gesture === 'welcome') {
        tgArmZ = -1.0;
        tgArmX = 0.2;
        tgForeArmX = -0.5;
      }

      bones.LeftArm.rotation.z = THREE.MathUtils.damp(bones.LeftArm.rotation.z, tgArmZ, 7, delta);
      bones.LeftArm.rotation.x = THREE.MathUtils.damp(bones.LeftArm.rotation.x, tgArmX, 7, delta);
      bones.LeftForeArm.rotation.x = THREE.MathUtils.damp(bones.LeftForeArm.rotation.x, tgForeArmX, 7, delta);
    }
  });

  return (
    <>
      <hemisphereLight args={['#fff6ec', '#d8cfc0', 0.95]} />
      <directionalLight position={[3, 5, 4]} intensity={1.05} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, 1]} intensity={0.5} color="#ffe6c9" />
      <directionalLight position={[0, 3, -4]} intensity={0.55} color="#bfe9ff" />
      <directionalLight position={[0, 1.7, 6]} intensity={0.75} color="#fff2e0" />
      <pointLight position={[0, 1.7, 3]} intensity={0.5} color="#fff6ee" />
      
      <group position={[0, modelY, 0]} scale={modelScale}>
        <primitive object={cloned} />
      </group>
      
      <ContactShadows position={[0, -3.15, 0]} opacity={0.25} scale={4.5} blur={2.8} far={3} />
    </>
  );
}

useGLTF.preload('/Ch46_nonPBR.glb');
