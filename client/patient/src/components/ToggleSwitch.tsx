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
      "flex items-center gap-4 p-3.5 sm:p-4 rounded-2xl border-2 transition-all duration-300",
      checked ? "border-primary bg-surface shadow-[var(--shadow-warm)] ring-4 ring-primary/20" : "border-hairline bg-surface shadow-[var(--shadow-soft)]",
      className
    )}>
      
      {/* Icon & Label */}
      <div className="flex items-center gap-3.5 flex-1 cursor-pointer" onClick={() => onChange(!checked)}>
        <div className={cn(
          "p-2.5 sm:p-3 rounded-xl transition-colors",
          checked ? "bg-primary text-white" : "bg-primary-soft text-primary"
        )}>
          <Icon size={24} />
        </div>
        <span className="text-base sm:text-lg font-semibold text-ink select-none">{label}</span>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-4">
        
        {/* Audio Explain Button */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onExplain();
          }}
          className="p-2.5 rounded-xl bg-primary-soft text-primary hover:bg-primary/15 flex items-center justify-center outline-none focus:ring-2 focus:ring-primary/40 shadow-sm"
          aria-label="Explain this"
        >
          <Volume2 size={20} />
        </motion.button>

        {/* The Toggle itself */}
        <motion.button
          onClick={() => onChange(!checked)}
          className={cn(
            "relative w-16 h-8 rounded-full transition-colors duration-300 flex items-center px-1 outline-none focus:ring-4 focus:ring-primary/40 shadow-inner",
            checked ? "bg-primary" : "bg-hairline"
          )}
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className={cn(
              "w-6 h-6 rounded-full shadow-md",
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
