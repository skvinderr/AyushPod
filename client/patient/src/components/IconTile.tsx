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
        "rounded-[2rem] border-2 bg-white",
        selected
          ? "border-[#00a8e8] shadow-lg shadow-[#00a8e8]/20 ring-4 ring-[#00a8e8]/30"
          : "border-transparent shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]",
        disabled ? "opacity-50 cursor-not-allowed grayscale" : "cursor-pointer focus-visible:ring-4 focus-visible:ring-[#00a8e8]/50",
        className
      )}
    >
      <div className={cn(
        "p-6 rounded-full transition-colors duration-300",
        selected ? "bg-[#00a8e8] text-white" : "bg-sky-50 text-[#00a8e8]"
      )}>
        <Icon size={48} />
      </div>
      <span className={cn(
        "text-2xl font-bold text-center",
        selected ? "text-[#00a8e8]" : "text-slate-700"
      )}>
        {label}
      </span>
    </motion.button>
  );
}
