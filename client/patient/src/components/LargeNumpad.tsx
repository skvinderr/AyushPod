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
            className="h-24 bg-white border-2 border-slate-200 rounded-2xl shadow-sm text-4xl font-bold text-slate-800 flex items-center justify-center hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
          >
            {key === 'del' ? <Delete size={40} className="text-slate-500" /> : key}
          </motion.button>
        );
      })}
    </div>
  );
}
