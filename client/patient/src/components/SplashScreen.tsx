"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse } from 'lucide-react';

export function SplashScreen() {
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Keep splash screen visible for 2.4 seconds before triggering exit animation
    const timer = setTimeout(() => {
      setShow(false);
    }, 2400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-gradient-to-br from-primary-deep via-primary to-primary-soft text-white overflow-hidden pointer-events-none"
        >
          {/* Subtle background glow effect */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_60%)] pointer-events-none" />

          {/* Logo Container */}
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.2 }}
            className="relative flex items-center justify-center gap-5 z-10"
          >
            {/* Animated Icon */}
            <motion.div
              initial={{ rotate: -15, scale: 0.8 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{
                type: "spring",
                stiffness: 200,
                damping: 15,
                delay: 0.4
              }}
              className="p-5 bg-white/20 rounded-[2rem] backdrop-blur-md shadow-[0_8px_32px_rgba(0,0,0,0.1)] border border-white/30"
            >
              <HeartPulse size={64} className="text-white drop-shadow-md" strokeWidth={2.5} />
            </motion.div>

            {/* Typography Logo */}
            <div className="flex flex-col">
              <motion.span
                initial={{ opacity: 0, x: -15 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-[4.5rem] leading-none font-extrabold tracking-tight drop-shadow-sm"
              >
                Ayush<span className="text-white/80 font-medium">Pod</span>
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="text-xl font-semibold tracking-[0.25em] text-white/70 uppercase pl-1 mt-1 drop-shadow-sm"
              >
                Aapki Apni Saheli
              </motion.span>
            </div>
          </motion.div>

          {/* Pulsing loading indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1.2 }}
            className="absolute bottom-20 flex items-center gap-3"
          >
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
              className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.2 }}
              className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
            <motion.div
              animate={{ scale: [1, 1.5, 1], opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.4 }}
              className="w-3 h-3 rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.5)]"
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
