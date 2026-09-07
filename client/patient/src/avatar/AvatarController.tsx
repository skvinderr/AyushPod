"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Avatar3D } from './Avatar3D';

/*
 * The single WebGL canvas that renders Aaya. It lives inside the <AvatarStage>
 * container, which scales/translates it between her corner home and the stage —
 * so the camera here is fixed, framing her whole standing figure (feet → raised
 * hands) in a portrait frame.
 */
export function AvatarController() {
  return (
    <Canvas
      shadows
      dpr={[1, 2]}
      camera={{ position: [0, 0.45, 5.2], fov: 40 }}
      gl={{ alpha: true, antialias: true }}
      style={{ width: '100%', height: '100%' }}
    >
      <Avatar3D />
    </Canvas>
  );
}
