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
  ({ className, variant = 'primary', fullWidth, children, disabled, ...props }, ref) => {
    
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: disabled ? 1 : 1.02 }}
        whileTap={{ scale: disabled ? 1 : 0.95 }}
        disabled={disabled}
        className={cn(
<<<<<<< HEAD
          "flex items-center justify-center font-semibold transition-all duration-300 outline-none focus-visible:ring-8",
          "rounded-[1.5rem] px-12 py-6 text-2xl min-h-[96px]",
          variant === 'primary'
            ? "bg-primary text-white hover:bg-primary-deep shadow-[0_14px_30px_-14px_rgba(31,122,110,0.7)] focus-visible:ring-primary/40"
            : "bg-surface text-ink border-2 border-hairline hover:border-primary/40 hover:bg-surface-warm shadow-sm focus-visible:ring-primary/25",
=======
          "flex items-center justify-center font-bold transition-all duration-300 outline-none focus-visible:ring-8",
          "rounded-full px-12 py-6 text-2xl min-h-[80px]",
          variant === 'primary' 
            ? "bg-[#00a8e8] text-white hover:bg-[#0090c8] shadow-lg shadow-[#00a8e8]/30 focus-visible:ring-[#00a8e8]/50" 
            : "bg-white text-slate-700 border-2 border-slate-200 hover:border-slate-300 hover:bg-slate-50 shadow-sm focus-visible:ring-slate-200/50",
>>>>>>> 2f8ced706fa712422c697077db4fd6d094ead9ed
          disabled ? "opacity-50 cursor-not-allowed" : "",
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
