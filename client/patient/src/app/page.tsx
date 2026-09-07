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

// Language data. `glyph` is a representative letter in each script — it renders
// on every platform (unlike flag emoji, which fall back to "IN"/"GB" on Windows).
const LANGUAGES = [
  { id: 'hi', native: 'हिंदी', english: 'Hindi', glyph: 'अ', greeting: 'नमस्ते, आपका स्वागत है!' },
  { id: 'en', native: 'English', english: 'English', glyph: 'A', greeting: 'Welcome to MediKiosk!' },
  { id: 'bn', native: 'বাংলা', english: 'Bengali', glyph: 'অ', greeting: 'নমস্কার, আপনাকে স্বাগত!' },
  { id: 'ta', native: 'தமிழ்', english: 'Tamil', glyph: 'அ', greeting: 'வணக்கம், நல்வரவு!' },
  { id: 'mr', native: 'मराठी', english: 'Marathi', glyph: 'म', greeting: 'नमस्कार, आपले स्वागत आहे!' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setLanguage } = useSessionStore();
  const { isListening, startListening } = useVoiceInput();

  const [hasSelected, setHasSelected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      speak('Namaste! Welcome. Please choose the language you speak.', { gesture: 'welcome', stage: true });
    }, 700);
    return () => clearTimeout(timeout);
  }, [speak]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLanguageSelect = (langId: string, greeting: string) => {
    setLanguage(langId);
    setHasSelected(true);
    speak(greeting, { language: langId, gesture: 'wave', stage: true });
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => router.push('/consent'), 3200);
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
        <p className="text-xl font-semibold text-primary-deep">MediKiosk · Government Health Kiosk</p>
        <h1 className="text-6xl font-extrabold text-ink tracking-tight mt-1">Choose your language</h1>
        <p className="text-2xl text-muted mt-2">अपनी भाषा चुनें — tap the language you speak</p>
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
                onClick={() => handleLanguageSelect(lang.id, lang.greeting)}
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
                onClick={startListening}
                className={cn(
                  'flex items-center gap-5 px-9 py-5 rounded-full bg-surface shadow-[var(--shadow-soft)] border border-hairline transition-all',
                  isListening ? 'ring-4 ring-primary border-primary' : '',
                )}
              >
                <div className={cn('p-3.5 rounded-full', isListening ? 'animate-pulse bg-primary text-white' : 'bg-primary-soft text-primary')}>
                  <Mic size={28} />
                </div>
                <span className="text-2xl font-semibold text-ink">
                  {isListening ? 'Listening…' : 'Or say your language out loud'}
                </span>
              </motion.button>
            ) : (
              <motion.div key="next-btn" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-5">
                <span className="text-xl font-medium text-muted">Starting automatically…</span>
                <LargeTouchButton onClick={handleNextClick}>
                  <span className="text-2xl">Next</span>
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
