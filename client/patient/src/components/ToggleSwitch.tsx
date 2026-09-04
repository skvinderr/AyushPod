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
      "flex items-center gap-6 p-6 rounded-3xl border-4 transition-all duration-300",
      checked ? "border-blue-600 bg-blue-50" : "border-slate-200 bg-white",
      className
    )}>
      
      {/* Icon & Label */}
      <div className="flex items-center gap-6 flex-1 cursor-pointer" onClick={() => onChange(!checked)}>
        <div className={cn(
          "p-4 rounded-2xl",
          checked ? "bg-blue-600 text-white" : "bg-slate-100 text-slate-500"
        )}>
          <Icon size={40} />
        </div>
        <span className="text-3xl font-bold text-slate-800 select-none">{label}</span>
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
          className="p-4 rounded-full bg-indigo-100 text-indigo-700 hover:bg-indigo-200 flex items-center justify-center outline-none focus:ring-4 focus:ring-indigo-500/50 shadow-sm"
          aria-label="Explain this"
        >
          <Volume2 size={32} />
        </motion.button>

        {/* The big Toggle itself */}
        <motion.button
          onClick={() => onChange(!checked)}
          className={cn(
            "relative w-32 h-16 rounded-full transition-colors duration-300 flex items-center px-2 outline-none focus:ring-8 focus:ring-blue-500/50 shadow-inner",
            checked ? "bg-blue-600" : "bg-slate-300"
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
