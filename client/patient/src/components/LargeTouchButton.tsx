"use client";

import React from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LargeTouchButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  fullWidth?: boolean;
}

export const LargeTouchButton = React.forwardRef<HTMLButtonElement, LargeTouchButtonProps>(
  ({ className, variant = 'primary', fullWidth, children, ...props }, ref) => {
    
    const variants = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800',
      secondary: 'bg-slate-200 text-slate-900 hover:bg-slate-300 active:bg-slate-400',
      outline: 'border-4 border-blue-600 text-blue-600 hover:bg-blue-50 active:bg-blue-100',
      ghost: 'bg-transparent text-slate-700 hover:bg-slate-100 active:bg-slate-200'
    };

    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          // Essential accessibility classes for public kiosks
          'min-h-[80px] min-w-[80px] px-8 py-4 rounded-2xl text-2xl font-bold shadow-sm transition-colors',
          'flex items-center justify-center gap-4 outline-none focus-visible:ring-8 focus-visible:ring-blue-500/50',
          variants[variant],
          fullWidth ? 'w-full' : '',
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);
LargeTouchButton.displayName = 'LargeTouchButton';
