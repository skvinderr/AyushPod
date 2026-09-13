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
        "flex flex-col items-center justify-center p-4 sm:p-5 gap-3 transition-all duration-300 outline-none",
        "rounded-2xl border-2 bg-surface",
        selected
          ? "border-primary shadow-[var(--shadow-warm)] ring-4 ring-primary/25"
          : "border-hairline shadow-[var(--shadow-soft)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-warm)]",
        disabled ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer focus-visible:ring-4 focus-visible:ring-primary/40",
        className
      )}
    >
      <div className={cn(
        "p-3 sm:p-3.5 rounded-full transition-colors duration-300",
        selected ? "bg-primary text-white" : "bg-primary-soft text-primary"
      )}>
        <Icon size={30} />
      </div>
      <span className={cn(
        "text-base sm:text-lg font-semibold text-center leading-snug",
        selected ? "text-primary-deep" : "text-ink"
      )}>
        {label}
      </span>
    </motion.button>
  );
}
