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

// transform targets, anchored bottom-left of the viewport.
// She idles up in the top-left rail (her "home"); on stage she stands large in
// the left of the content area. Only downscaled from the native box, so crisp.
const CORNER = { x: 2, y: -210, scale: 0.6 };
const STAGE = { x: 296, y: 4, scale: 0.9 };

// speech-bubble targets (top-left, viewport px)
const BUBBLE_CORNER = { x: 24, y: 500 };
const BUBBLE_STAGE = { x: 610, y: 110 };

function isWebGLAvailable() {
  try {
    const canvas = document.createElement('canvas');
    return !!(window.WebGLRenderingContext && (canvas.getContext('webgl') || canvas.getContext('experimental-webgl')));
  } catch {
    return false;
  }
}

const spring = { type: 'spring', stiffness: 150, damping: 22, mass: 1 } as const;

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
  const bubblePos = onStage ? BUBBLE_STAGE : BUBBLE_CORNER;

  return (
    <div className="pointer-events-none fixed inset-0 z-40 overflow-hidden">
      {/* Spotlight vignette — dims the content and focuses on Aaya on stage */}
      <motion.div
        aria-hidden
        className="absolute inset-0"
        initial={false}
        animate={{ opacity: onStage ? 1 : 0 }}
        transition={{ duration: 0.5 }}
        style={{
          background:
            'radial-gradient(58% 80% at 30% 54%, rgba(255,255,255,0) 0%, rgba(41,30,18,0.10) 55%, rgba(41,30,18,0.30) 100%)',
        }}
      />

      {/* Aaya — fixed-size box, scaled/translated between corner and stage */}
      <motion.div
        className="absolute bottom-0 left-0"
        style={{ width: BOX_W, height: BOX_H, transformOrigin: 'bottom left' }}
        initial={false}
        animate={{ x: pos.x, y: pos.y, scale: pos.scale }}
        transition={spring}
      >
        {/* soft floor glow under her feet, so she is grounded on any background */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 bottom-[54px] w-[74%] h-16 rounded-[50%] blur-md"
          style={{ background: 'radial-gradient(closest-side, rgba(31,122,110,0.32), transparent)' }}
        />
        {ready && (useWebGL ? <AvatarController /> : <FallbackAvatar />)}
      </motion.div>

      {/* Speech bubble — rides along beside her head while she speaks */}
      <AnimatePresence>
        {caption && (
          <motion.div
            key="aaya-speech"
            className="absolute"
            style={{ width: 372, transformOrigin: 'left bottom' }}
            initial={{ opacity: 0, scale: 0.9, x: bubblePos.x, y: bubblePos.y }}
            animate={{ opacity: 1, scale: 1, x: bubblePos.x, y: bubblePos.y }}
            exit={{ opacity: 0, scale: 0.92 }}
            transition={spring}
          >
            <div className="relative rounded-[1.6rem] bg-white px-6 py-5 shadow-[0_24px_60px_-18px_rgba(70,55,40,0.5)] border border-hairline">
              {/* tail pointing down-left toward her */}
              <div className="absolute -bottom-2 left-9 w-5 h-5 rotate-45 bg-white border-b border-r border-hairline" />
              <p className="text-[1.35rem] leading-snug font-semibold text-ink">{caption}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
