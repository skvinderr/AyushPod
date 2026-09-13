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
    // Speak on mount after a short delay
    const timeout = setTimeout(() => {
      speak("Namaste! Welcome!");
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
    
    // Avatar speaks the language-specific greeting
    speak(greeting, langId);

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
    <div className="absolute inset-0 flex flex-col pt-6 pb-4 px-6 overflow-hidden">
      
      {/* Header / Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-3 mb-6 sm:mb-8 shrink-0"
      >
        <div className="bg-primary text-white p-2.5 rounded-xl shadow-md">
          <Stethoscope size={28} />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-ink tracking-tight">MediKiosk</h1>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center max-w-4xl mx-auto w-full z-10 min-h-0">
        
        {/* Language Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="flex flex-wrap justify-center gap-3.5 sm:gap-5 mb-6"
        >
          {LANGUAGES.map((lang) => (
            <motion.button
              key={lang.id}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleLanguageSelect(lang.id, lang.greeting)}
              className={cn(
                "flex flex-col items-center justify-center p-3.5 sm:p-4 rounded-2xl w-32 h-32 sm:w-36 sm:h-36 gap-2 transition-all duration-300",
                "bg-surface outline-none border-2 border-hairline focus-visible:ring-4 focus-visible:ring-primary/40",
                language === lang.id && hasSelected
                  ? "shadow-[var(--shadow-warm)] ring-3 ring-primary border-primary scale-105"
                  : "shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-warm)]"
              )}
            >
              <span className="text-3xl sm:text-4xl">{lang.flag}</span>
              <span className={cn(
                "text-lg sm:text-xl font-bold leading-tight",
                language === lang.id && hasSelected ? "text-primary" : "text-ink"
              )}>
                {lang.native}
              </span>
              {lang.id !== 'en' && (
                <span className="text-xs font-medium text-ink/60">
                  {lang.english}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

        {/* Voice Input Hint & Manual Next Button Container */}
        <div className="w-full h-16 flex items-center justify-center relative shrink-0">
          
          <AnimatePresence>
            {!hasSelected ? (
              <motion.button
                key="voice-hint"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                onClick={() => startListening()}
                className={cn(
                  "flex items-center gap-3.5 px-6 py-2.5 rounded-full bg-surface/90 backdrop-blur-md shadow-[var(--shadow-soft)] border border-hairline",
                  "transition-all duration-300",
                  isListening ? "ring-3 ring-primary border-primary" : ""
                )}
              >
                <div className={cn(
                  "p-2 rounded-full text-primary",
                  isListening ? "animate-pulse bg-primary text-white" : "bg-primary-soft"
                )}>
                  <Mic size={20} />
                </div>
                <span className="text-sm sm:text-base font-semibold text-ink">
                  {isListening ? "Listening..." : "Tap a language or say it aloud"}
                </span>
              </motion.button>
            ) : (
              <motion.div
                key="next-btn"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-4"
              >
                <span className="text-sm font-medium text-ink/60 px-4 py-1.5 rounded-full animate-pulse">
                  Continuing automatically...
                </span>
                <LargeTouchButton 
                  onClick={handleNextClick} 
                  className="py-2.5 px-6 min-h-[44px] text-base"
                >
                  <span>Next</span>
                  <ArrowRight size={20} className="ml-1.5" />
                </LargeTouchButton>
              </motion.div>
            )}
          </AnimatePresence>
          
        </div>
      </div>
    </div>
  );
}
