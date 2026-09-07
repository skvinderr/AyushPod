"use client";

import React, { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Stethoscope, Globe } from 'lucide-react';
import { motion } from 'framer-motion';

export function TopBar() {
  const pathname = usePathname();
  const [time, setTime] = useState("");

  useEffect(() => {
    const updateClock = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    };
    updateClock();
    const timer = setInterval(updateClock, 10000);
    return () => clearInterval(timer);
  }, []);

  // Don't show the generic top bar on the welcome page since it has a giant hero logo
  if (pathname === '/') return null;

  return (
    <div className="w-full flex items-center justify-between px-12 py-8 bg-transparent relative z-50">
      
      {/* Time */}
      <div className="flex-1">
        <span className="text-3xl font-bold text-ink">{time}</span>
      </div>

      {/* Center Logo */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 justify-center flex-1"
      >
        <div className="bg-primary text-white p-2 rounded-xl shadow-[0_10px_24px_-12px_rgba(31,122,110,0.8)]">
          <Stethoscope size={28} />
        </div>
        <span className="text-3xl font-extrabold text-ink tracking-tight">MediKiosk</span>
      </motion.div>

      {/* Language Toggle (Mock for now) */}
      <div className="flex-1 flex justify-end">
        <button className="flex items-center gap-2 bg-surface px-6 py-3 rounded-full shadow-sm border border-hairline text-ink font-semibold hover:shadow-md transition-shadow">
          <Globe size={20} className="text-primary" />
          <span>EN</span>
          <span className="ml-2 text-xs text-muted">▼</span>
        </button>
      </div>
      
    </div>
  );
}
