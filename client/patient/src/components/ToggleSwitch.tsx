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
  description?: string;
  onExplain: () => void;
  className?: string;
}

export function ToggleSwitch({ checked, onChange, icon: Icon, label, description, onExplain, className }: ToggleSwitchProps) {
  return (
    <div className={cn(
      "flex items-center gap-5 p-5 rounded-[1.75rem] border-2 transition-all duration-300",
      checked
        ? "border-primary bg-primary-soft/30 shadow-[var(--shadow-warm)] ring-2 ring-primary/25"
        : "border-hairline bg-surface shadow-[var(--shadow-soft)] hover:border-hairline hover:shadow-[var(--shadow-warm)]",
      className
    )}>

      {/* Clickable icon + label area */}
      <div
        className="flex items-center gap-5 flex-1 cursor-pointer min-w-0"
        onClick={() => onChange(!checked)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onChange(!checked); } }}
      >
        <div className={cn(
          "p-3.5 rounded-2xl transition-all duration-300 shrink-0",
          checked ? "bg-primary text-white shadow-md shadow-primary/20" : "bg-surface-warm text-muted"
        )}>
          <Icon size={32} />
        </div>
        <div className="flex flex-col min-w-0">
          <span className={cn(
            "text-xl font-bold select-none transition-colors leading-tight",
            checked ? "text-ink" : "text-ink"
          )}>{label}</span>
          {description && (
            <span className="text-sm text-muted mt-0.5 leading-snug">{description}</span>
          )}
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-4 shrink-0">

        {/* Audio explain button */}
        <motion.button
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          onClick={(e) => {
            e.stopPropagation();
            onExplain();
          }}
          className={cn(
            "p-3 rounded-xl flex items-center justify-center outline-none",
            "focus:ring-4 focus:ring-primary/40 transition-all",
            "bg-surface-warm text-muted hover:bg-primary-soft hover:text-primary"
          )}
          aria-label="Explain this"
        >
          <Volume2 size={24} />
        </motion.button>

        {/* Toggle switch */}
        <motion.button
          onClick={() => onChange(!checked)}
          className={cn(
            "relative w-[72px] h-10 rounded-full transition-colors duration-300 flex items-center px-1.5",
            "outline-none focus:ring-4 focus:ring-primary/40",
            checked ? "bg-primary shadow-inner shadow-primary-deep/30" : "bg-hairline"
          )}
          aria-checked={checked}
          role="switch"
        >
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
            className="w-7 h-7 rounded-full bg-white shadow-md"
            style={{
              marginLeft: checked ? "auto" : "0",
            }}
          />
        </motion.button>
      </div>
    </div>
  );
}
