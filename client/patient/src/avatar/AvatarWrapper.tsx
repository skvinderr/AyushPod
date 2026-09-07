"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  const presence = useAvatar((s) => s.presence);
  const caption = useAvatar((s) => s.caption);

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

  const onStage = presence === 'stage';

  return (
    <div className="fixed top-6 left-6 z-50 flex items-start gap-4 pointer-events-none">
      {/* Warm spotlight scrim — only while she's on stage */}
      <AnimatePresence>
        {onStage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            className="fixed -top-24 -left-24 w-[720px] h-[720px] -z-10"
            style={{ background: 'var(--stage-scrim)' }}
          />
        )}
      </AnimatePresence>

      {/* Aaya herself — the same single Canvas, the container just grows */}
      <motion.div
        animate={{
          width: onStage ? 340 : 150,
          height: onStage ? 340 : 150,
        }}
        transition={{ type: 'spring', stiffness: 180, damping: 24 }}
        className={`rounded-full bg-gradient-to-b from-primary-soft to-surface shadow-[var(--shadow-warm)] ring-4 ${ring} border-4 border-white overflow-hidden pointer-events-auto`}
      >
        {useWebGL ? <AvatarController /> : <FallbackAvatar />}
      </motion.div>

      {/* Corner name tag (idle) OR stage speech bubble (guiding) */}
      <AnimatePresence mode="wait">
        {onStage && caption ? (
          <motion.div
            key="bubble"
            initial={{ opacity: 0, x: -12, scale: 0.9 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: -12, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 220, damping: 22 }}
            className="mt-10 max-w-sm relative rounded-[1.75rem] bg-surface px-7 py-5 shadow-[var(--shadow-warm)] border border-hairline"
          >
            {/* little tail pointing back at Aaya */}
            <div className="absolute -left-2 top-8 w-4 h-4 rotate-45 bg-surface border-l border-b border-hairline" />
            <p className="text-2xl font-semibold text-ink leading-snug">{caption}</p>
          </motion.div>
        ) : !onStage ? (
          <motion.div
            key="tag"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-10 rounded-full bg-surface/90 backdrop-blur px-4 py-1.5 shadow-[var(--shadow-soft)] border border-hairline"
          >
            <span className="text-lg font-semibold text-primary-deep">Aaya</span>
            <span className="ml-1.5 text-sm text-muted">your guide</span>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
