"use client";

import React from 'react';
import { useAvatar } from '../store/useAvatar';
import { motion } from 'framer-motion';

/*
 * 2D fallback for the Aaya guide (WebGL unavailable / low-power kiosk).
 * Same warm palette + face language as the 3D character: teal cap, soft skin,
 * blinking-style eyes, a mouth that opens while talking.
 */
export function FallbackAvatar() {
  const { state, mouth } = useAvatar();

  const bodyAnim = () => {
    switch (state) {
      case 'idle':
        return { y: [0, -4, 0], transition: { repeat: Infinity, duration: 2.4, ease: 'easeInOut' } };
      case 'happy':
        return { y: [0, -8, 0], transition: { repeat: Infinity, duration: 0.7 } };
      case 'listening':
        return { rotate: 6, transition: { type: 'spring', stiffness: 120 } };
      case 'concerned':
        return { rotate: -4, y: 2 };
      default:
        return {};
    }
  };

  const mouthHeight =
    state === 'talking' ? 6 + mouth * 20 : state === 'happy' ? 20 : state === 'concerned' ? 4 : 8;
  const mouthWidth = state === 'concerned' ? 24 : 34;

  return (
    <div className="w-full h-full flex items-center justify-center p-3">
      <motion.div animate={bodyAnim()} className="relative w-32 h-32">
        {/* head */}
        <div className="absolute inset-0 rounded-full bg-[#f2c9a0] shadow-inner" />
        {/* cap */}
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-[118px] h-16 rounded-t-full bg-[#1f7a6e]" />
        {/* eyes */}
        <div className="absolute top-[52px] left-1/2 -translate-x-1/2 flex gap-5">
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3a3330]" />
          </div>
          <div className="w-5 h-5 rounded-full bg-white flex items-center justify-center">
            <div className="w-2.5 h-2.5 rounded-full bg-[#3a3330]" />
          </div>
        </div>
        {/* cheeks */}
        <div className="absolute top-[74px] left-[26px] w-4 h-3 rounded-full bg-[#e8896f]/40" />
        <div className="absolute top-[74px] right-[26px] w-4 h-3 rounded-full bg-[#e8896f]/40" />
        {/* mouth */}
        <div
          className="absolute left-1/2 -translate-x-1/2 rounded-full bg-[#a5432f] transition-all duration-75"
          style={{ top: 84, width: mouthWidth, height: mouthHeight }}
        />
      </motion.div>
    </div>
  );
}
