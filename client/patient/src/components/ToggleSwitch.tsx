"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { LucideIcon, Volume2 } from 'lucide-react';
import { cn } from './LargeTouchButton';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  icon: LucideIcon;
  label: string;
  onExplain: () => void;
  className?: string;
}

export function ToggleSwitch({ checked, onChange, icon: Icon, label, onExplain, className }: ToggleSwitchProps) {
  return (
    <div className={cn(
      "flex items-center gap-6 p-6 rounded-[2rem] border-2 transition-all duration-300",
      checked ? "border-primary bg-surface shadow-[var(--shadow-warm)] ring-4 ring-primary/20" : "border-hairline bg-surface shadow-[var(--shadow-soft)]",
      className
    )}>
      
      {/* Icon & Label */}
      <div className="flex items-center gap-6 flex-1 cursor-pointer" onClick={() => onChange(!checked)}>
        <div className={cn(
          "p-4 rounded-full transition-colors",
          checked ? "bg-primary text-white" : "bg-primary-soft text-primary"
        )}>
          <Icon size={40} />
        </div>
        <span className="text-3xl font-semibold text-ink select-none">{label}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-8">
        
        {/* Audio Explain Button */}
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onExplain();
          }}
          className="p-4 rounded-full bg-primary-soft text-primary hover:bg-primary/15 flex items-center justify-center outline-none focus:ring-4 focus:ring-primary/40 shadow-sm"
          aria-label="Explain this"
        >
          <Volume2 size={32} />
        </motion.button>

        {/* The big Toggle itself */}
        <motion.button
          onClick={() => onChange(!checked)}
          className={cn(
            "relative w-32 h-16 rounded-full transition-colors duration-300 flex items-center px-2 outline-none focus:ring-8 focus:ring-primary/40 shadow-inner",
            checked ? "bg-primary" : "bg-hairline"
          )}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "w-12 h-12 rounded-full shadow-md",
              checked ? "bg-white" : "bg-white"
            )}
            style={{
              marginLeft: checked ? "auto" : "0",
            }}
          />
        </motion.button>
      </div>

    </div>
  );
}
