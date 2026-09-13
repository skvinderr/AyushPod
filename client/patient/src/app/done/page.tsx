"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { QrCode, CheckCircle2, ShieldCheck, ArrowRight, MapPin, Clock } from 'lucide-react';
import { useT } from '../../i18n';

export default function DoneScreen() {
  const router = useRouter();
  const { speak, setState } = useAvatar();
  const { language, resetSession } = useSessionStore();
  const { t } = useT();

  const [dataCleared, setDataCleared] = useState(false);

  // Token + time are generated client-side on mount. Computing a random token
  // during render would make the server-prerendered HTML disagree with the
  // client's first render, tripping a hydration mismatch on this screen.
  const [token, setToken] = useState('');
  const [time, setTime] = useState('');
  useEffect(() => {
    setToken('A-' + Math.floor(100 + Math.random() * 900));
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  useEffect(() => {
    setState('happy');
    speak(t('done.spoken.thanks'), { language, gesture: 'wave', stage: true });

    const timer = setTimeout(() => {
      resetSession();
      setDataCleared(true);
      speak(t('done.spoken.cleared'), language);
    }, 8000);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak, language, resetSession, setState]);

  return (
    <div className="relative h-full flex items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="w-full max-w-2xl bg-surface rounded-2xl shadow-md border border-hairline flex overflow-hidden relative"
      >
        {/* Left — confirmation + token */}
        <div className="flex-1 p-5 sm:p-6 flex flex-col justify-center">
          <div className="flex items-center gap-2 text-primary-deep font-bold text-sm sm:text-base mb-2">
            <CheckCircle2 size={20} />
            <span>{t('done.registered')}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight leading-tight">{t('done.heading')}</h1>

          <div className="mt-4">
            <span className="text-xs sm:text-sm font-semibold text-muted">{t('done.tokenLabel')}</span>
            <div className="text-5xl sm:text-6xl font-extrabold text-primary-deep leading-none mt-1 tracking-tight">
              {token || <span className="opacity-25">A-···</span>}
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <div className="flex items-center gap-2.5 bg-surface-warm px-3.5 py-2.5 rounded-xl border border-hairline">
              <div className="p-1.5 bg-surface rounded-lg text-primary">
                <Clock size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted">{t('done.waitLabel')}</span>
                <span className="text-sm sm:text-base font-bold text-primary">{t('done.waitValue')}</span>
              </div>
            </div>
            <div className="flex items-center gap-2.5 bg-surface-warm px-3.5 py-2.5 rounded-xl border border-hairline">
              <div className="p-1.5 bg-surface rounded-lg text-primary">
                <MapPin size={16} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-medium text-muted">Go to</span>
                <span className="text-sm sm:text-base font-bold text-ink">Room 4, Level 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="relative w-px border-l-2 border-dashed border-hairline my-4">
          <div className="absolute -top-5 -left-2.5 w-5 h-5 bg-bg rounded-full" />
          <div className="absolute -bottom-5 -left-2.5 w-5 h-5 bg-bg rounded-full" />
        </div>

        {/* Right — QR stub */}
        <div className="w-[200px] sm:w-[220px] bg-primary-soft flex flex-col items-center justify-center gap-2.5 p-5 text-center shrink-0">
          <div className="bg-white p-2.5 rounded-xl shadow-xs">
            <QrCode size={72} className="text-ink" />
          </div>
          <span className="text-sm font-bold text-primary-deep leading-tight">Scan to track your turn</span>
          <span className="text-xs text-muted max-w-[170px] leading-snug">Follow status on your phone while you wait.</span>
        </div>
      </motion.div>

      {/* Privacy notice */}
      <AnimatePresence>
        {dataCleared && (
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-ink text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-3 z-50 text-xs sm:text-sm"
          >
            <ShieldCheck size={20} className="text-primary" />
            <span className="font-medium">Session data cleared for privacy.</span>
            <div className="w-px h-5 bg-white/25" />
            <button onClick={() => router.push('/')} className="flex items-center gap-1.5 text-primary-soft hover:text-white font-semibold transition-colors">
              Start new patient <ArrowRight size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
