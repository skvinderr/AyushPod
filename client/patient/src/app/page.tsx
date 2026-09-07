"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../store/useAvatar';
import { useSessionStore } from '../store/useSessionStore';
import { useVoiceInput } from '../lib/useVoiceInput';
import { LargeTouchButton } from '../components/LargeTouchButton';
import { Stethoscope, Mic, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/LargeTouchButton';

// Language data
const LANGUAGES = [
  { id: 'hi', native: 'हिंदी', english: 'Hindi', flag: '🇮🇳', greeting: 'नमस्ते, आपका स्वागत है!' },
  { id: 'en', native: 'English', english: 'English', flag: '🇬🇧', greeting: 'Welcome to MediKiosk!' },
  { id: 'bn', native: 'বাংলা', english: 'Bengali', flag: '🇮🇳', greeting: 'নমস্কার, আপনাকে স্বাগত!' },
  { id: 'ta', native: 'தமிழ்', english: 'Tamil', flag: '🇮🇳', greeting: 'வணக்கம், நல்வரவு!' },
  { id: 'mr', native: 'मराठी', english: 'Marathi', flag: '🇮🇳', greeting: 'नमस्कार, आपले स्वागत आहे!' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setLanguage } = useSessionStore();
  const { isListening, startListening } = useVoiceInput();
  
  const [hasSelected, setHasSelected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    // Speak on mount after a short delay — Aaya steps out and opens her arms.
    const timeout = setTimeout(() => {
      speak("Namaste! Welcome. Please choose your language.", { gesture: 'welcome', stage: true });
    }, 800);
    return () => clearTimeout(timeout);
  }, [speak]);

  // Clean up auto-advance timeout if unmounted
  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handleLanguageSelect = (langId: string, greeting: string) => {
    setLanguage(langId);
    setHasSelected(true);
    
    // Avatar speaks the language-specific greeting with a warm wave
    speak(greeting, { language: langId, gesture: 'wave', stage: true });

    // Cancel any existing timeout
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Auto-advance after 3.5 seconds
    timeoutRef.current = setTimeout(() => {
      router.push('/consent');
    }, 3500);
  };

  const handleNextClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    router.push('/consent');
  };

  return (
    <div className="absolute inset-0 flex flex-col pt-14 pb-8 px-12 overflow-hidden">

      {/* Header / Logo */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="flex flex-col items-center justify-center gap-4 mb-12"
      >
        <div className="flex items-center gap-4">
          <div className="bg-primary text-white p-4 rounded-2xl shadow-[var(--shadow-lift)]">
            <Stethoscope size={48} />
          </div>
          <h1 className="text-7xl font-extrabold text-ink tracking-tight">MediKiosk</h1>
        </div>
        <p className="text-3xl text-ink font-bold">Choose your language</p>
        <p className="text-2xl text-muted font-medium -mt-1">अपनी भाषा चुनें</p>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full z-10">
        
        {/* Language Grid */}
        <div className="flex flex-wrap justify-center gap-8 mb-16">
          {LANGUAGES.map((lang, i) => (
            <motion.button
              key={lang.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 + i * 0.08, type: 'spring', stiffness: 220, damping: 20 }}
              whileHover={{ scale: 1.05, y: -6 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLanguageSelect(lang.id, lang.greeting)}
              className={cn(
                "flex flex-col items-center justify-center p-8 rounded-[1.75rem] w-56 h-56 gap-3 transition-shadow duration-300",
                "bg-surface outline-none focus-visible:ring-8 focus-visible:ring-primary/40",
                language === lang.id && hasSelected
                  ? "shadow-[var(--shadow-lift)] ring-4 ring-primary"
                  : "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-warm)] border border-hairline"
              )}
            >
              <span className="text-5xl">{lang.flag}</span>
              <span className={cn(
                "text-4xl font-bold",
                language === lang.id && hasSelected ? "text-primary-deep" : "text-ink"
              )}>
                {lang.native}
              </span>
              {lang.id !== 'en' && (
                <span className="text-xl font-medium text-muted">
                  {lang.english}
                </span>
              )}
            </motion.button>
          ))}
        </div>

        {/* Voice Input Hint & Manual Next Button Container */}
        <div className="mt-auto w-full h-32 flex items-center justify-center relative">
          
          <AnimatePresence>
            {!hasSelected ? (
              <motion.button
                key="voice-hint"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={startListening}
                className={cn(
                  "flex items-center gap-6 px-10 py-6 rounded-full bg-surface/80 backdrop-blur-md shadow-[var(--shadow-soft)] border border-hairline",
                  "transition-all duration-300",
                  isListening ? "ring-4 ring-primary border-primary" : ""
                )}
              >
                <div className={cn(
                  "p-4 rounded-full text-primary",
                  isListening ? "animate-pulse bg-primary text-white" : "bg-primary-soft"
                )}>
                  <Mic size={32} />
                </div>
                <span className="text-2xl font-semibold text-ink">
                  {isListening ? "Listening..." : "Tap a language or say it aloud"}
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="next-btn"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-6"
              >
                <span className="text-2xl font-medium text-muted px-6 py-3 rounded-full animate-pulse">
                  Continuing automatically...
                </span>
                <LargeTouchButton 
                  onClick={handleNextClick} 
                >
                  <span className="text-3xl">Next</span>
                  <ArrowRight size={36} />
                </LargeTouchButton>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </div>
  );
}
