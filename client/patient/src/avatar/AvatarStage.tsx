"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarController } from './AvatarController';
import { FallbackAvatar } from './FallbackAvatar';
import { useAvatar } from '../store/useAvatar';

/*
 * AvatarStage — a full-viewport overlay that lets Aaya leave her corner and step
 * onto the screen to guide, then retreat.
 *
 * She renders in a fixed-size box (native canvas resolution) that is only ever
 * scaled DOWN via CSS transform, so she stays crisp and the WebGL buffer is
 * never resized (no jank). Two layouts, driven by `presence` from the store:
 *   - corner: small, parked over the teal guide rail (her home).
 *   - stage:  large, standing in the left of the content area, gesturing toward
 *             it, with a soft spotlight vignette and a speech bubble by her head.
 *
 * The whole layer is pointer-events-none so the content underneath stays fully
 * touchable — she never blocks a button, and she auto-retreats when her line
 * ends (see the store's speak()).
 */

// Native box size (the largest she is ever shown, so CSS only downscales).
const BOX_W = 620;
const BOX_H = 760;

// Transform targets, anchored bottom-left of the viewport.
// CORNER: parked in the left guide rail (her consultation room).
// STAGE: steps gracefully out of the rail, gesturing towards the content without blocking it.
const CORNER = { x: -25, y: -210, scale: 0.58 };
const STAGE = { x: 170, y: -70, scale: 0.70 };

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

const spring = { type: 'spring', stiffness: 160, damping: 24, mass: 1 } as const;

export function AvatarStage() {
  const presence = useAvatar((s) => s.presence);
  const caption = useAvatar((s) => s.caption);
  const [useWebGL, setUseWebGL] = useState(true);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setUseWebGL(isWebGLAvailable());
    setReady(true);
  }, []);

  const onStage = presence === 'stage';
  const pos = onStage ? STAGE : CORNER;

  return (
    <div className="pointer-events-none fixed inset-0 z-30 overflow-hidden">
      {/* Subtle warm ambient focus on stage — non-intrusive, keeps content clearly visible */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: onStage ? 0.22 : 0 }}
        transition={{ duration: 0.4 }}
        style={{
          background:
            'radial-gradient(ellipse 65% 75% at 28% 50%, rgba(42, 157, 143, 0.18) 0%, rgba(30, 20, 10, 0.22) 100%)',
        }}
      />

      {/* Aaya — fixed-size box, scaled/translated between rail corner and guiding stage */}
      <motion.div
        className="absolute bottom-0 left-0"
        style={{ width: BOX_W, height: BOX_H, transformOrigin: 'bottom left' }}
        initial={false}
        animate={{ x: pos.x, y: pos.y, scale: pos.scale }}
        transition={spring}
      >
        {/* Soft floor glow under her feet */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 bottom-[54px] w-[74%] h-14 rounded-[50%] blur-md"
          style={{ background: 'radial-gradient(closest-side, rgba(31,122,110,0.28), transparent)' }}
        />

        {ready && (useWebGL ? <AvatarController /> : <FallbackAvatar />)}

        {/* Speech bubble — rides along beside her head smoothly */}
        <AnimatePresence>
          {caption && (
            <motion.div
              key="aaya-speech-bubble"
              className="absolute pointer-events-none"
              style={{ left: 345, top: 125, maxWidth: 300 }}
              initial={{ opacity: 0, scale: 0.85, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 8 }}
              transition={{ type: 'spring', stiffness: 220, damping: 20 }}
            >
              <div className="relative rounded-2xl bg-white/95 backdrop-blur-md px-4 py-3 shadow-[0_16px_36px_-12px_rgba(70,55,40,0.35)] border border-hairline">
                {/* tail pointing down-left toward her mouth */}
                <div className="absolute -bottom-1.5 left-6 w-3 h-3 rotate-45 bg-white border-b border-r border-hairline" />
                <p className="text-xs sm:text-sm font-semibold text-ink leading-snug">{caption}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
