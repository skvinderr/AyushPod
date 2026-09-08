"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { useT } from '../../i18n';

export default function UrgentScreen() {
  const router = useRouter();
  const { speak, setState } = useAvatar();
  const { language } = useSessionStore();
  const { t } = useT();

  useEffect(() => {
    // Aaya stays in her corner and turns concerned — no theatrics on the alert.
    setState('concerned');
    speak(t('urgent.spoken'), language);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak, setState, language]);

  return (
    <div className="absolute inset-0 bg-coral-soft flex items-center justify-center p-6 overflow-hidden rounded-[1.5rem]">
      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-3xl w-full bg-surface rounded-[2rem] shadow-2xl p-12 text-center border-8 border-coral relative overflow-hidden"
      >
        <motion.div animate={{ opacity: [0.4, 0.9, 0.4] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-coral/10 z-0" />

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="text-coral bg-coral-soft p-7 rounded-full">
            <AlertTriangle size={96} />
          </div>

          <h1 className="text-5xl font-extrabold text-coral tracking-tight">{t('urgent.heading')}</h1>

          <p className="text-2xl text-ink font-medium max-w-2xl">
            {t('urgent.body')}
          </p>

          <LargeTouchButton onClick={() => router.push('/scan')} className="w-full mt-4 py-6 bg-ink text-white hover:bg-ink/90 border-none">
            <ShieldAlert size={34} className="mr-3" />
            <span className="text-2xl">{t('urgent.told')}</span>
          </LargeTouchButton>
        </div>
      </motion.div>
    </div>
  );
}
