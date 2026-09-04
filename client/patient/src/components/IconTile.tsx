"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from './LargeTouchButton'; // re-using the cn utility

interface IconTileProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  icon: LucideIcon;
  label: string;
  selected?: boolean;
}

export const IconTile = React.forwardRef<HTMLButtonElement, IconTileProps>(
  ({ className, icon: Icon, label, selected = false, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.95 }}
        className={cn(
          'flex flex-col items-center justify-center p-8 rounded-3xl min-h-[160px] min-w-[160px] gap-4 transition-colors',
          'border-4 outline-none focus-visible:ring-8 focus-visible:ring-blue-500/50 shadow-md',
          selected 
            ? 'border-blue-600 bg-blue-50 text-blue-700' 
            : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300',
          className
        )}
        {...props}
      >
        <Icon size={64} className={selected ? 'text-blue-600' : 'text-slate-600'} />
        <span className="text-2xl font-bold text-center">{label}</span>
      </motion.button>
    );
  }
);
IconTile.displayName = 'IconTile';
