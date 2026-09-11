"use client";

import React, { Suspense, Component, ReactNode } from 'react';
import { Canvas } from '@react-three/fiber';
import { Avatar3D } from './Avatar3D';
import { Html } from '@react-three/drei';

class ErrorBoundary extends Component<{children: ReactNode}, {hasError: boolean, error: any}> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="absolute inset-0 flex items-center justify-center p-4 bg-red-500/10">
          <div className="bg-white p-6 rounded-2xl shadow-xl max-w-sm">
            <h2 className="text-red-600 font-bold text-xl mb-2">Avatar Crash</h2>
            <p className="text-sm text-ink/80 font-mono break-words">
              {String(this.state.error?.message || this.state.error)}
            </p>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export function AvatarController() {
  return (
    <ErrorBoundary>
      <Canvas
        shadows
        dpr={[1, 2]}
        camera={{ position: [0, 0.45, 5.2], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        style={{ width: '100%', height: '100%' }}
      >
        <Suspense fallback={
          <Html center>
            <div className="bg-primary text-white px-6 py-3 rounded-full text-xl font-bold shadow-[0_10px_40px_rgba(42,157,143,0.5)] flex items-center gap-3">
              <span className="animate-spin text-2xl">⏳</span>
              <span className="whitespace-nowrap">Loading 3D Model...</span>
            </div>
          </Html>
        }>
          <Avatar3D />
        </Suspense>
      </Canvas>
    </ErrorBoundary>
  );
}
