"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../store/useAvatar';
import { useSessionStore } from '../store/useSessionStore';
import { useVoiceInput } from '../lib/useVoiceInput';
import { LargeTouchButton } from '../components/LargeTouchButton';
import { Mic, ArrowRight, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/LargeTouchButton';
import { useT, translate } from '../i18n';
import { LANGUAGES, LIVE_LANGS, fromBcp47, type LangId } from '../i18n/languages';

export default function WelcomeScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setLanguage } = useSessionStore();
  const { isListening, startListening } = useVoiceInput();
  const { t } = useT();

  const [hasSelected, setHasSelected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      speak(translate('en', 'welcome.spoken.greeting'), { gesture: 'welcome', stage: true });
    }, 700);
    return () => clearTimeout(timeout);
  }, [speak]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const commitLanguage = (langId: LangId) => {
    setLanguage(langId);
    setHasSelected(true);
    // Speak the greeting in the just-chosen language. `translate(langId, …)`
    // reads that catalog directly (the store update hasn't propagated yet).
    speak(translate(langId, 'welcome.spoken.greeting'), {
      language: langId,
      gesture: 'wave',
      stage: true,
    });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => router.push('/consent'), 3200);
  };

  // Welcome always auto-detects the spoken language, then switches the UI to it.
  const handleVoice = () => {
    startListening({
      language: 'unknown',
      mode: 'transcribe',
      onResult: ({ languageCode }) => {
        const detected = languageCode ? fromBcp47(languageCode) : null;
        // Fall back to Hindi if we detect an Indic language we don't yet host.
        const target: LangId = detected && LIVE_LANGS.includes(detected) ? detected : 'hi';
        commitLanguage(target);
      },
    });
  };

  const handleNextClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    router.push('/consent');
  };

  return (
    <div className="h-full flex flex-col">
      {/* Hero heading */}
      <motion.div
        initial={{ opacity: 0, y: -14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="pt-1 pb-2"
      >
        <p className="text-xl font-semibold text-primary-deep">{t('welcome.kicker')}</p>
        <h1 className="text-6xl font-extrabold text-ink tracking-tight mt-1">{t('welcome.chooseLanguage')}</h1>
        <p className="text-2xl text-muted mt-2">{t('welcome.chooseLanguageSub')}</p>
      </motion.div>

      {/* Language grid + voice */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8">
        <div className="flex flex-wrap justify-center gap-6 max-w-[860px]">
          {LANGUAGES.map((lang, i) => {
            const active = language === lang.id && hasSelected;
            return (
              <motion.button
                key={lang.id}
                initial={{ opacity: 0, y: 22 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.07, type: 'spring', stiffness: 220, damping: 20 }}
                whileHover={{ y: -6 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => commitLanguage(lang.id)}
                className={cn(
                  'relative flex flex-col items-center justify-center w-[188px] h-[196px] gap-3 rounded-[2rem] bg-surface transition-shadow duration-300 outline-none focus-visible:ring-8 focus-visible:ring-primary/30',
                  active
                    ? 'ring-4 ring-primary shadow-[var(--card-pop)]'
                    : 'border border-hairline shadow-[var(--shadow-soft)] hover:shadow-[var(--card-lift)]',
                )}
              >
                {active && (
                  <div className="absolute top-3 right-3 bg-primary text-white rounded-full p-1.5">
                    <Check size={20} strokeWidth={3} />
                  </div>
                )}
                <div
                  className={cn(
                    'grid place-items-center w-[70px] h-[70px] rounded-full text-4xl font-bold transition-colors',
                    active ? 'bg-primary text-white' : 'bg-primary-soft text-primary-deep',
                  )}
                >
                  {lang.glyph}
                </div>
                <span className="text-3xl font-bold text-ink leading-none">{lang.native}</span>
                {lang.id !== 'en' && <span className="text-base font-medium text-muted">{lang.english}</span>}
              </motion.button>
            );
          })}
        </div>

        <div className="h-24 flex items-center justify-center">
          <AnimatePresence mode="wait">
            {!hasSelected ? (
              <motion.button
                key="voice-hint"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                onClick={handleVoice}
                className={cn(
                  'flex items-center gap-5 px-9 py-5 rounded-full bg-surface shadow-[var(--shadow-soft)] border border-hairline transition-all',
                  isListening ? 'ring-4 ring-primary border-primary' : '',
                )}
              >
                <div className={cn('p-3.5 rounded-full', isListening ? 'animate-pulse bg-primary text-white' : 'bg-primary-soft text-primary')}>
                  <Mic size={28} />
                </div>
                <span className="text-2xl font-semibold text-ink">
                  {isListening ? t('common.listening') : t('welcome.sayLanguage')}
                </span>
              </motion.button>
            ) : (
              <motion.div key="next-btn" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5">
                <span className="text-xl font-medium text-muted">{t('welcome.startingAuto')}</span>
                <LargeTouchButton onClick={handleNextClick}>
                  <span className="text-2xl">{t('common.next')}</span>
                  <ArrowRight size={30} className="ml-2" />
                </LargeTouchButton>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
