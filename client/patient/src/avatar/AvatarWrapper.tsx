"use client";

import React, { useEffect, useState } from 'react';
import { AvatarController } from './AvatarController';
import { FallbackAvatar } from './FallbackAvatar';

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch (e) {
    return false;
  }
}

export function AvatarWrapper() {
  const [useWebGL, setUseWebGL] = useState(true);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      console.warn('WebGL is not available, switching to 2D Fallback Avatar');
      setUseWebGL(false);
    }
  }, []);

  return (
    <div className="fixed top-8 right-8 w-48 h-48 z-50 pointer-events-none">
      <div className="w-full h-full bg-blue-50/50 rounded-full backdrop-blur-sm shadow-xl border-4 border-white/50 overflow-hidden pointer-events-auto">
        {useWebGL ? <AvatarController /> : <FallbackAvatar />}
      </div>
    </div>
  );
}
