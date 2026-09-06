"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { cn } from './LargeTouchButton';

interface IconTileProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  selected?: boolean;
  disabled?: boolean;
  className?: string;
}

export function IconTile({ 
  icon: Icon, 
  label, 
  onClick, 
  selected = false,
  disabled = false,
  className 
}: IconTileProps) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center p-8 gap-6 transition-all duration-300 outline-none",
        "rounded-[1.75rem] border-2 bg-surface",
        selected
          ? "border-primary shadow-[var(--shadow-warm)] ring-4 ring-primary/25"
          : "border-hairline shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:shadow-[var(--shadow-warm)]",
        disabled ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer focus-visible:ring-4 focus-visible:ring-primary/40",
        className
      )}
    >
      <div className={cn(
        "p-6 rounded-full transition-colors duration-300",
        selected ? "bg-primary text-white" : "bg-primary-soft text-primary"
      )}>
        <Icon size={48} />
      </div>
      <span className={cn(
        "text-2xl font-semibold text-center",
        selected ? "text-primary-deep" : "text-ink"
      )}>
        {label}
      </span>
    </motion.button>
  );
}
