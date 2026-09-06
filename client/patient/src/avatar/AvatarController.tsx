"use client";

import React from 'react';
import { Canvas } from '@react-three/fiber';
import { Avatar3D } from './Avatar3D';

export function AvatarController() {
  return (
    <div className="w-full h-full relative">
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.4, 4.2], fov: 42 }}
        gl={{ alpha: true, antialias: true }}
      >
        <Avatar3D />
      </Canvas>
    </div>
  );
}
