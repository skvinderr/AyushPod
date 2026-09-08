"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { BodyModelCanvas } from '../../components/BodyModel3D';
import { useVoiceInput } from '../../lib/useVoiceInput';
import { cn } from '../../components/LargeTouchButton';
import { useT } from '../../i18n';
import type { LucideIcon } from 'lucide-react';
import {
  Zap, Waves, Anchor, Flame, Feather, RotateCw, Mic, X,
} from 'lucide-react';

/*
 * Zone -> interview-tree category + a short "how does it feel" drill-down.
 * `titleKey` and each feel `labelKey` are i18n catalog keys resolved via t().
 * The feel answer is stored as a pre-answer so the interview can carry it.
 */
const ZONE_CONFIG: Record<
  string,
  { titleKey: string; category: string; feels: { id: string; labelKey: string; icon: LucideIcon }[] }
> = {
  head: {
    titleKey: 'complaint.zone.head',
    category: 'head',
    feels: [
      { id: 'throbbing', labelKey: 'complaint.feel.throbbing', icon: Waves },
      { id: 'pressure', labelKey: 'complaint.feel.pressure', icon: Anchor },
      { id: 'sharp', labelKey: 'complaint.feel.sharp', icon: Zap },
    ],
  },
  chest: {
    titleKey: 'complaint.zone.chest',
    category: 'chest',
    feels: [
      { id: 'tightness', labelKey: 'complaint.feel.tightness', icon: Anchor },
      { id: 'sharp', labelKey: 'complaint.feel.sharpPain', icon: Zap },
      { id: 'burning', labelKey: 'complaint.feel.burning', icon: Flame },
    ],
  },
  stomach: {
    titleKey: 'complaint.zone.stomach',
    category: 'stomach',
    feels: [
      { id: 'cramping', labelKey: 'complaint.feel.cramping', icon: Waves },
      { id: 'burning', labelKey: 'complaint.feel.burning', icon: Flame },
      { id: 'dull', labelKey: 'complaint.feel.dull', icon: Feather },
    ],
  },
  back: {
    titleKey: 'complaint.zone.back',
    category: 'general',
    feels: [
      { id: 'stiff', labelKey: 'complaint.feel.stiff', icon: Anchor },
      { id: 'sharp', labelKey: 'complaint.feel.sharp', icon: Zap },
      { id: 'dull', labelKey: 'complaint.feel.dull', icon: Feather },
    ],
  },
  joints: {
    titleKey: 'complaint.zone.joints',
    category: 'joints',
    feels: [
      { id: 'stiff', labelKey: 'complaint.feel.stiff', icon: Anchor },
      { id: 'swelling', labelKey: 'complaint.feel.swelling', icon: Waves },
      { id: 'sharp', labelKey: 'complaint.feel.sharp', icon: Zap },
    ],
  },
  legs: {
    titleKey: 'complaint.zone.legs',
    category: 'joints',
    feels: [
      { id: 'weak', labelKey: 'complaint.feel.weak', icon: Feather },
      { id: 'swelling', labelKey: 'complaint.feel.swelling', icon: Waves },
      { id: 'cramping', labelKey: 'complaint.feel.cramping', icon: Waves },
    ],
  },
};

export default function ComplaintScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setChiefComplaint, updateHistoryAnswer } = useSessionStore();
  const { isListening, startListening } = useVoiceInput();
  const { t } = useT();

  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [rotateSignal, setRotateSignal] = useState(0);

  useEffect(() => {
    speak(t('complaint.spoken.prompt'), { language, gesture: 'point-right', stage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak, language]);

  const handleZone = (id: string) => {
    setActiveZone(id);
    speak(t('complaint.spoken.zoneFeel', { zone: t(ZONE_CONFIG[id].titleKey) }), { language, gesture: 'present', stage: true });
  };

  const handleFeel = (feelId: string) => {
    if (!activeZone) return;
    const cfg = ZONE_CONFIG[activeZone];
    setChiefComplaint(cfg.category);
    updateHistoryAnswer('reported_zone', activeZone);
    updateHistoryAnswer('reported_feel', feelId);
    speak(t('complaint.spoken.gotIt'), language);
    router.push('/interview');
  };

  const activeCfg = activeZone ? ZONE_CONFIG[activeZone] : null;

  return (
    <div className="h-full flex flex-col">
      {/* prompt */}
      <div className="pb-3">
        <h1 className="text-5xl font-extrabold text-ink tracking-tight">{t('complaint.heading')}</h1>
        <p className="text-2xl text-muted mt-1">{t('complaint.sub')}</p>
      </div>

      {/* body: 3D model + drill-down */}
      <div className="flex-1 min-h-0 flex gap-5">
        {/* 3D body — the focal, elevated surface */}
        <div className="relative flex-1 rounded-[1.75rem] bg-gradient-to-b from-primary-soft/70 via-surface to-surface-warm overflow-hidden border border-hairline shadow-[var(--card-lift)]">
          <BodyModelCanvas activeZone={activeZone} onSelectZone={handleZone} rotateSignal={rotateSignal} />

          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-surface/90 backdrop-blur px-5 py-2 shadow-[var(--shadow-soft)] border border-hairline">
            <span className="text-lg font-medium text-muted">{t('complaint.dragHint')}</span>
          </div>

          <button
            onClick={() => setRotateSignal((s) => s + 1)}
            className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-surface px-5 py-3 shadow-[var(--shadow-warm)] border border-hairline text-primary-deep font-semibold hover:bg-primary-soft transition-colors"
          >
            <RotateCw size={24} /> {t('complaint.turn')}
          </button>
        </div>

        {/* Right rail: drill-down OR voice prompt */}
        <div className="w-[320px] shrink-0 flex flex-col">
          <AnimatePresence mode="wait">
            {activeCfg ? (
              <motion.div
                key={activeZone}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-3xl font-extrabold text-ink">{t(activeCfg.titleKey)}</h2>
                  <button onClick={() => setActiveZone(null)} className="p-2 rounded-full text-muted hover:bg-surface-warm" aria-label={t('common.close')}>
                    <X size={28} />
                  </button>
                </div>
                <p className="text-xl text-muted mb-5">{t('complaint.howFeel')}</p>

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
                          <Icon size={34} />
                        </div>
                        <span className="text-2xl font-semibold text-ink">{t(f.labelKey)}</span>
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
                className="flex flex-col h-full items-center justify-center text-center gap-6 rounded-[1.75rem] bg-surface-warm/70 border border-hairline p-8"
              >
                <p className="text-2xl font-semibold text-ink leading-snug">
                  {t('complaint.notSure')}<br />{t('complaint.tellWords')}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { startListening({ language, mode: 'transcribe' }); setChiefComplaint('voice_narration'); }}
                  className={cn(
                    'w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 shadow-[var(--shadow-warm)] transition-all',
                    isListening ? 'bg-primary text-white animate-pulse' : 'bg-surface text-primary border-4 border-primary/30',
                  )}
                >
                  <Mic size={52} />
                  <span className="text-lg font-semibold">{isListening ? t('common.listening') : t('common.tapToSpeak')}</span>
                </motion.button>
                {isListening && (
                  <button onClick={() => router.push('/interview')} className="text-primary-deep font-semibold text-xl underline underline-offset-4">
                    {t('complaint.doneContinue')}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
