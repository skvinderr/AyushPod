"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { QrCode, CheckCircle2, ShieldCheck, ArrowRight, MapPin, Clock } from 'lucide-react';

export default function DoneScreen() {
  const router = useRouter();
  const { speak, setState } = useAvatar();
  const { language, resetSession } = useSessionStore();

  const [dataCleared, setDataCleared] = useState(false);
  const token = 'A-' + Math.floor(100 + Math.random() * 900);

  const [time, setTime] = useState('');
  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  useEffect(() => {
    setState('happy');
    speak('Thank you. Your doctor will have this ready when you go in.', { language, gesture: 'wave', stage: true });

    const timer = setTimeout(() => {
      resetSession();
      setDataCleared(true);
      speak('Your session data has been securely cleared.', language);
    }, 8000);

    return () => clearTimeout(timer);
  }, [speak, language, resetSession, setState]);

  return (
    <div className="relative h-full flex items-center justify-center">
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 180, damping: 22 }}
        className="w-full max-w-4xl bg-surface rounded-[2rem] shadow-[var(--card-lift)] border border-hairline flex overflow-hidden relative"
      >
        {/* Left — confirmation + token */}
        <div className="flex-1 p-10 flex flex-col justify-center">
          <div className="flex items-center gap-2.5 text-primary-deep font-bold text-xl mb-4">
            <CheckCircle2 size={28} />
            <span>Registration successful</span>
          </div>

          <h1 className="text-5xl font-extrabold text-ink tracking-tight leading-tight">You're all set for your visit</h1>

          <div className="mt-8">
            <span className="text-xl font-semibold text-muted">Your token number</span>
            <div className="text-8xl font-extrabold text-primary-deep leading-none mt-1">{token}</div>
          </div>

          <div className="mt-8 flex gap-4">
            <div className="flex items-center gap-3 bg-surface-warm px-5 py-4 rounded-2xl border border-hairline">
              <div className="p-2.5 bg-surface rounded-full text-primary">
                <Clock size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-muted">Estimated wait</span>
                <span className="text-xl font-bold text-primary">~12 mins</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-surface-warm px-5 py-4 rounded-2xl border border-hairline">
              <div className="p-2.5 bg-surface rounded-full text-primary">
                <MapPin size={22} />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-muted">Go to</span>
                <span className="text-xl font-bold text-ink">Room 4, Level 2</span>
              </div>
            </div>
          </div>
        </div>

        {/* Perforated divider */}
        <div className="relative w-px border-l-2 border-dashed border-hairline my-8">
          <div className="absolute -top-8 -left-4 w-8 h-8 bg-bg rounded-full" />
          <div className="absolute -bottom-8 -left-4 w-8 h-8 bg-bg rounded-full" />
        </div>

        {/* Right — QR stub */}
        <div className="w-[300px] bg-primary-soft flex flex-col items-center justify-center gap-4 p-10 text-center">
          <div className="bg-white p-4 rounded-2xl shadow-[var(--shadow-soft)]">
            <QrCode size={128} className="text-ink" />
          </div>
          <span className="text-lg font-semibold text-primary-deep">Scan to track your turn</span>
          <span className="text-base text-muted max-w-[220px]">Follow your status on your own phone while you wait.</span>
        </div>
      </motion.div>

      {/* Privacy notice */}
      <AnimatePresence>
        {dataCleared && (
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-2 left-1/2 -translate-x-1/2 bg-ink text-white px-7 py-4 rounded-full shadow-2xl flex items-center gap-5 z-50"
          >
            <ShieldCheck size={30} className="text-primary" />
            <span className="text-xl font-medium">Session data cleared for your privacy.</span>
            <div className="w-px h-8 bg-white/25" />
            <button onClick={() => router.push('/')} className="flex items-center gap-2 text-primary-soft hover:text-white font-semibold text-lg transition-colors">
              Start new patient <ArrowRight size={22} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
