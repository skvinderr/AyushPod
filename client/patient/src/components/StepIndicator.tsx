"use client";

import React from 'react';
import { Check } from 'lucide-react';
import { cn } from './LargeTouchButton';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  title: string;
}

/*
 * Warm numbered progress rail. The intake genuinely is a sequence
 * (Identify → Complaint → History → Documents), so numbered nodes are honest
 * here. Done steps carry a check, the current step is a filled teal ring, and
 * upcoming steps stay muted. Big Poppins-800 title sits underneath.
 */
export function StepIndicator({ currentStep, totalSteps, title }: StepIndicatorProps) {
  return (
    <div className="flex flex-col gap-6 w-full mb-10">
      <div className="flex items-center gap-3">
        {Array.from({ length: totalSteps }).map((_, i) => {
          const step = i + 1;
          const done = step < currentStep;
          const active = step === currentStep;
          return (
            <React.Fragment key={i}>
              <div
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full text-xl font-bold shrink-0 transition-all duration-300',
                  done && 'bg-primary text-white',
                  active && 'bg-primary text-white ring-4 ring-primary/25 scale-110',
                  !done && !active && 'bg-surface-warm text-muted border-2 border-hairline'
                )}
              >
                {done ? <Check size={24} strokeWidth={3} /> : step}
              </div>
              {step < totalSteps && (
                <div className="flex-1 h-1.5 rounded-full bg-surface-warm overflow-hidden">
                  <div
                    className={cn(
                      'h-full rounded-full bg-primary transition-all duration-500',
                      done ? 'w-full' : 'w-0'
                    )}
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
      <h1 className="text-5xl font-extrabold text-ink tracking-tight">{title}</h1>
    </div>
  );
}
