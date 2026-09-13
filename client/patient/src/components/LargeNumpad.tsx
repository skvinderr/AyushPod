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
    <div className={cn("grid grid-cols-3 gap-3 w-full max-w-lg mx-auto", className)}>
      {keys.map((key, i) => {
        if (key === '') return <div key={i} />;

        return (
          <motion.button
            key={i}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.92, backgroundColor: 'var(--primary-soft)' }}
            onClick={() => handlePress(key)}
            className={cn(
              "h-14 lg:h-20 bg-surface border-2 border-hairline rounded-2xl shadow-[var(--shadow-soft)]",
              "text-2xl lg:text-3xl font-bold text-ink flex items-center justify-center",
              "hover:border-primary/40 hover:shadow-[var(--shadow-warm)]",
              "focus:outline-none focus:ring-4 focus:ring-primary/40",
              "active:bg-primary-soft transition-colors duration-150",
              key === 'del' && "bg-surface-warm"
            )}
          >
            {key === 'del' ? <Delete size={32} className="text-muted" /> : key}
          </motion.button>
        );
      })}
    </div>
  );
}
