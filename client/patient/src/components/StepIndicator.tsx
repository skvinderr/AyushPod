"use client";

import React from 'react';
import { cn } from './LargeTouchButton';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps: number;
  title: string;
}

export function StepIndicator({ currentStep, totalSteps, title }: StepIndicatorProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-2xl mx-auto text-left mb-12">
      <div className="flex items-center gap-4">
        <span className="text-sm font-semibold text-muted tracking-[0.18em] uppercase">
          Step {currentStep} of {totalSteps}
        </span>
        <div className="flex-1 flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-1.5 rounded-full flex-1 transition-all duration-300",
                i + 1 <= currentStep ? "bg-primary" : "bg-hairline"
              )}
            />
          ))}
        </div>
      </div>
      <h1 className="text-4xl font-extrabold text-ink">{title}</h1>
    </div>
  );
}
