"use client";

import React, { useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { useFBX, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';

export function Avatar3D() {
  const fbx = useFBX('/Ch46_nonPBR.fbx');

  const cloned = useMemo(() => {
    const clone = fbx.clone(true);
    clone.traverse((child) => {
      if ((child as THREE.Mesh).isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        
        // Critical fix for Mixamo SkinnedMeshes: they often get frustum culled incorrectly
        // because their bounding box doesn't update with the bones.
        child.frustumCulled = false;
        
        // Fix for Mixamo materials sometimes loading with broken transparency
        const mat = (child as THREE.Mesh).material;
        if (mat) {
          if (Array.isArray(mat)) {
            mat.forEach(m => { m.transparent = false; m.depthWrite = true; });
          } else {
            mat.transparent = false;
            mat.depthWrite = true;
          }
        }
      }
    });
    return clone;
  }, [fbx]);

  // Slowly rotate so we can see the full model
  useFrame((_, delta) => {
    cloned.rotation.y += delta * 0.5;
  });

  return (
    <>
      <hemisphereLight args={['#fff6ec', '#d8cfc0', 0.95]} />
      <directionalLight position={[3, 5, 4]} intensity={1.05} castShadow shadow-mapSize={[1024, 1024]} />
      <directionalLight position={[-4, 2, 1]} intensity={0.5} color="#ffe6c9" />
      <directionalLight position={[0, 3, -4]} intensity={0.55} color="#bfe9ff" />
      <directionalLight position={[0, 1.7, 6]} intensity={0.75} color="#fff2e0" />
      <pointLight position={[0, 1.7, 3]} intensity={0.5} color="#fff6ee" />
      
      {/* Based on Size 147.38, a scale of 0.0285 makes it ~4.2 units tall.
          Placing it at Y=-3.2 perfectly frames the waist-up in the camera. */}
      <group position={[0, -3.2, 0]} scale={0.0285}>
        <primitive object={cloned} />
      </group>
      
      <ContactShadows position={[0, -3.15, 0]} opacity={0.25} scale={4.5} blur={2.8} far={3} />
    </>
  );
}
