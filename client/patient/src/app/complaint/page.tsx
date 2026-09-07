"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { StepIndicator } from '../../components/StepIndicator';
import { BodyModelCanvas } from '../../components/BodyModel3D';
import { useVoiceInput } from '../../lib/useVoiceInput';
import { cn } from '../../components/LargeTouchButton';
import {
  Zap, Waves, Anchor, Flame, Feather, RotateCw, Mic, X,
} from 'lucide-react';

/*
 * Zone -> interview-tree category + a short "how does it feel" drill-down.
 * The feel answer is stored as a pre-answer so the interview can carry it.
 */
const ZONE_CONFIG: Record<
  string,
  { title: string; category: string; feels: { id: string; label: string; icon: any }[] }
> = {
  head: {
    title: 'Your head',
    category: 'head',
    feels: [
      { id: 'throbbing', label: 'Throbbing', icon: Waves },
      { id: 'pressure', label: 'Pressure', icon: Anchor },
      { id: 'sharp', label: 'Sharp', icon: Zap },
    ],
  },
  chest: {
    title: 'Your chest',
    category: 'chest',
    feels: [
      { id: 'tightness', label: 'Tightness', icon: Anchor },
      { id: 'sharp', label: 'Sharp pain', icon: Zap },
      { id: 'burning', label: 'Burning', icon: Flame },
    ],
  },
  stomach: {
    title: 'Your stomach',
    category: 'stomach',
    feels: [
      { id: 'cramping', label: 'Cramping', icon: Waves },
      { id: 'burning', label: 'Burning', icon: Flame },
      { id: 'dull', label: 'Dull ache', icon: Feather },
    ],
  },
  back: {
    title: 'Your back',
    category: 'general',
    feels: [
      { id: 'stiff', label: 'Stiff', icon: Anchor },
      { id: 'sharp', label: 'Sharp', icon: Zap },
      { id: 'dull', label: 'Dull ache', icon: Feather },
    ],
  },
  joints: {
    title: 'Your arms & joints',
    category: 'joints',
    feels: [
      { id: 'stiff', label: 'Stiff', icon: Anchor },
      { id: 'swelling', label: 'Swollen', icon: Waves },
      { id: 'sharp', label: 'Sharp', icon: Zap },
    ],
  },
  legs: {
    title: 'Your legs',
    category: 'joints',
    feels: [
      { id: 'weak', label: 'Weak', icon: Feather },
      { id: 'swelling', label: 'Swollen', icon: Waves },
      { id: 'cramping', label: 'Cramping', icon: Waves },
    ],
  },
};

export default function ComplaintScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setChiefComplaint, updateHistoryAnswer } = useSessionStore();
  const { isListening, startListening } = useVoiceInput();

  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [rotateSignal, setRotateSignal] = useState(0);

  useEffect(() => {
    speak('Where does it hurt? Touch the part of the body that bothers you, or tell me in your own words.', language);
  }, [speak, language]);

  const handleZone = (id: string) => {
    setActiveZone(id);
    speak(`${ZONE_CONFIG[id].title}. How does it feel?`, language);
  };

  const handleFeel = (feelId: string) => {
    if (!activeZone) return;
    const cfg = ZONE_CONFIG[activeZone];
    setChiefComplaint(cfg.category);
    updateHistoryAnswer('reported_zone', activeZone);
    updateHistoryAnswer('reported_feel', feelId);
    speak('Got it. I have a few quick questions about that.', language);
    router.push('/interview');
  };

  const activeCfg = activeZone ? ZONE_CONFIG[activeZone] : null;

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pb-6">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-6xl bg-surface rounded-[2rem] shadow-[var(--shadow-warm)] border border-hairline p-10 flex flex-col min-h-[74vh]"
      >
        <StepIndicator currentStep={2} totalSteps={4} title="Where does it hurt?" />

        <div className="flex-1 flex gap-8 items-stretch">
          {/* 3D body */}
          <div className="relative flex-1 rounded-[1.5rem] bg-gradient-to-b from-primary-soft/60 to-surface-warm overflow-hidden border border-hairline">
            <BodyModelCanvas
              activeZone={activeZone}
              onSelectZone={handleZone}
              rotateSignal={rotateSignal}
            />
            {/* hint chip */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-surface/90 backdrop-blur px-5 py-2 shadow-[var(--shadow-soft)] border border-hairline">
              <span className="text-lg font-medium text-muted">Drag to turn • Tap a glowing spot</span>
            </div>
            {/* rotate button */}
            <button
              onClick={() => setRotateSignal((s) => s + 1)}
              className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-surface px-5 py-3 shadow-[var(--shadow-warm)] border border-hairline text-primary-deep font-semibold hover:bg-primary-soft transition-colors"
            >
              <RotateCw size={24} /> Turn
            </button>
          </div>

          {/* Right rail: drill-down OR voice prompt */}
          <div className="w-[380px] flex flex-col">
            <AnimatePresence mode="wait">
              {activeCfg ? (
                <motion.div
                  key={activeZone}
                  initial={{ opacity: 0, x: 24 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -24 }}
                  className="flex flex-col h-full"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-3xl font-extrabold text-ink">{activeCfg.title}</h2>
                    <button
                      onClick={() => setActiveZone(null)}
                      className="p-2 rounded-full text-muted hover:bg-surface-warm"
                      aria-label="Close"
                    >
                      <X size={28} />
                    </button>
                  </div>
                  <p className="text-xl text-muted mb-6">How does it feel?</p>

                  <div className="flex flex-col gap-4 flex-1">
                    {activeCfg.feels.map((f) => {
                      const Icon = f.icon;
                      return (
                        <motion.button
                          key={f.id}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => handleFeel(f.id)}
                          className="flex items-center gap-5 p-5 rounded-[1.25rem] bg-surface border-2 border-hairline hover:border-primary hover:bg-primary-soft transition-all min-h-[96px] text-left"
                        >
                          <div className="p-4 rounded-full bg-primary-soft text-primary">
                            <Icon size={36} />
                          </div>
                          <span className="text-2xl font-semibold text-ink">{f.label}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                <motion.div
                  key="voice"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col h-full items-center justify-center text-center gap-6 rounded-[1.5rem] bg-surface-warm/60 border border-hairline p-8"
                >
                  <p className="text-2xl font-semibold text-ink leading-snug">
                    Not sure where?<br />Tell me in your own words.
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      startListening();
                      setChiefComplaint('voice_narration');
                    }}
                    className={cn(
                      'w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 shadow-[var(--shadow-warm)] transition-all',
                      isListening
                        ? 'bg-primary text-white animate-pulse'
                        : 'bg-surface text-primary border-4 border-primary/30',
                    )}
                  >
                    <Mic size={56} />
                    <span className="text-lg font-semibold">
                      {isListening ? 'Listening…' : 'Tap to speak'}
                    </span>
                  </motion.button>
                  {isListening && (
                    <button
                      onClick={() => router.push('/interview')}
                      className="text-primary-deep font-semibold text-xl underline underline-offset-4"
                    >
                      Done — continue
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
