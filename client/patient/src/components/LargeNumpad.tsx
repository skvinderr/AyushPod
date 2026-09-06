"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { Delete } from 'lucide-react';
import { cn } from './LargeTouchButton';

interface LargeNumpadProps {
  value: string;
  onChange: (val: string) => void;
  maxLength?: number;
  className?: string;
}

export function LargeNumpad({ value, onChange, maxLength = 10, className }: LargeNumpadProps) {
  const handlePress = (key: string) => {
    if (key === 'del') {
      onChange(value.slice(0, -1));
    } else {
      if (value.length < maxLength) {
        onChange(value + key);
      }
    }
  };

  const keys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  return (
    <div className={cn("grid grid-cols-3 gap-4 w-full max-w-sm mx-auto", className)}>
      {keys.map((key, i) => {
        if (key === '') return <div key={i} />;
        
        return (
          <motion.button
            key={i}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handlePress(key)}
<<<<<<< HEAD
            className="h-24 bg-surface border-2 border-hairline rounded-[1.25rem] shadow-[var(--shadow-soft)] text-4xl font-semibold text-ink flex items-center justify-center hover:border-primary/40 hover:shadow-[var(--shadow-warm)] focus:outline-none focus:ring-4 focus:ring-primary/40"
=======
            className="h-24 bg-white border-2 border-slate-100 rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.05)] text-4xl font-bold text-slate-800 flex items-center justify-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-4 focus:ring-[#00a8e8]/50"
>>>>>>> 2f8ced706fa712422c697077db4fd6d094ead9ed
          >
            {key === 'del' ? <Delete size={40} className="text-muted" /> : key}
          </motion.button>
        );
      })}
    </div>
  );
}
