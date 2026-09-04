"use client";

import React from 'react';
import { useAvatar } from '../store/useAvatar';
import { motion } from 'framer-motion';

export function FallbackAvatar() {
  const { state } = useAvatar();

  const getAnimationProps = () => {
    switch (state) {
      case 'idle':
        return { y: [0, -5, 0], transition: { repeat: Infinity, duration: 2 } };
      case 'talking':
        return { scale: [1, 1.05, 1], transition: { repeat: Infinity, duration: 0.3 } };
      case 'listening':
        return { rotate: 5, scale: 1.02 };
      case 'happy':
        return { y: [0, -10, 0], transition: { repeat: Infinity, duration: 0.8 } };
      case 'concerned':
        return { rotate: -5, scale: 0.98 };
      default:
        return {};
    }
  };

  const getMouthClass = () => {
    if (state === 'talking') return 'h-4 w-12 rounded-full bg-blue-900 animate-pulse';
    if (state === 'happy') return 'h-6 w-12 rounded-b-full bg-blue-900';
    if (state === 'concerned') return 'h-2 w-8 rounded-full bg-blue-900 mt-2';
    return 'h-2 w-10 rounded-full bg-blue-900'; // idle/listening
  };

  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <motion.div
        animate={getAnimationProps()}
        className="w-32 h-32 bg-blue-500 rounded-full shadow-lg flex flex-col items-center justify-center relative border-4 border-blue-400"
      >
        {/* Eyes */}
        <div className="flex gap-4 mb-2">
          <div className="w-4 h-4 bg-blue-900 rounded-full" />
          <div className="w-4 h-4 bg-blue-900 rounded-full" />
        </div>
        {/* Mouth */}
        <div className={getMouthClass()} />
      </motion.div>
    </div>
  );
}
