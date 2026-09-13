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
    <div className="absolute inset-0 bg-coral-soft flex items-center justify-center p-4 overflow-hidden rounded-2xl">
      <motion.div
        initial={{ scale: 0.88, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-xl w-full bg-surface rounded-2xl shadow-xl p-6 sm:p-8 text-center border-4 border-coral relative overflow-hidden"
      >
        <motion.div animate={{ opacity: [0.3, 0.7, 0.3] }} transition={{ duration: 2, repeat: Infinity }} className="absolute inset-0 bg-coral/10 z-0" />

        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="text-coral bg-coral-soft p-3.5 rounded-full">
            <AlertTriangle size={48} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-coral tracking-tight">{t('urgent.heading')}</h1>

          <p className="text-sm sm:text-base text-ink font-medium max-w-lg leading-relaxed">
            {t('urgent.body')}
          </p>

          <LargeTouchButton onClick={() => router.push('/scan')} className="w-full mt-2 py-3 min-h-[44px] bg-ink text-white hover:bg-ink/90 border-none text-base font-semibold">
            <ShieldAlert size={20} className="mr-2" />
            <span>{t('urgent.told')}</span>
          </LargeTouchButton>
        </div>
      </motion.div>
    </div>
  );
}
