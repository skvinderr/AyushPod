"use client";

import React, { useEffect, useState } from 'react';
import { AvatarController } from './AvatarController';
import { FallbackAvatar } from './FallbackAvatar';
import { useAvatar } from '../store/useAvatar';

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

export function AvatarWrapper() {
  const [useWebGL, setUseWebGL] = useState(true);
  const state = useAvatar((s) => s.state);

  useEffect(() => {
    if (!isWebGLAvailable()) {
      console.warn('WebGL unavailable — using 2D fallback avatar');
      setUseWebGL(false);
    }
  }, []);

  // Ring color reflects the avatar's mood; coral only when concerned.
  const ring =
    state === 'concerned'
      ? 'ring-coral/50'
      : state === 'listening'
      ? 'ring-amber/60'
      : 'ring-primary/40';

  return (
    <div className="fixed top-6 left-6 z-50 flex items-end gap-3 pointer-events-none">
      <div
        className={`w-[150px] h-[150px] rounded-full bg-gradient-to-b from-primary-soft to-surface shadow-[var(--shadow-warm)] ring-4 ${ring} border-4 border-white overflow-hidden pointer-events-auto transition-all duration-500`}
      >
        {useWebGL ? <AvatarController /> : <FallbackAvatar />}
      </div>
      {/* Name tag */}
      <div className="mb-4 rounded-full bg-surface/90 backdrop-blur px-4 py-1.5 shadow-[var(--shadow-soft)] border border-hairline">
        <span className="text-lg font-semibold text-primary-deep">Aaya</span>
        <span className="ml-1.5 text-sm text-muted">your guide</span>
      </div>
    </div>
  );
}
