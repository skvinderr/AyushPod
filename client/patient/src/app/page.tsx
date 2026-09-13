"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../store/useAvatar';
import { useSessionStore } from '../store/useSessionStore';
import { useVoiceInput } from '../lib/useVoiceInput';
import { LargeTouchButton } from '../components/LargeTouchButton';
import { Stethoscope, Mic, ArrowRight, Sparkles, MicOff } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/LargeTouchButton';

// Language data with enhanced styling metadata
const LANGUAGES = [
  { id: 'hi', native: 'हिंदी', english: 'Hindi', flag: '🇮🇳', greeting: 'नमस्ते, आपका स्वागत है!' },
  { id: 'en', native: 'English', english: 'English', flag: '🇬🇧', greeting: 'Welcome to AyushPod!' },
  { id: 'bn', native: 'বাংলা', english: 'Bengali', flag: '🇮🇳', greeting: 'নমস্কার, আপনাকে স্বাগত!' },
  { id: 'ta', native: 'தமிழ்', english: 'Tamil', flag: '🇮🇳', greeting: 'வணக்கம், நல்வரவு!' },
  { id: 'mr', native: 'मराठी', english: 'Marathi', flag: '🇮🇳', greeting: 'नमस्कार, आपले स्वागत आहे!' },
];

// Map spoken language names → IDs for voice-based selection
const VOICE_LANG_MAP: Record<string, string> = {
  hindi: 'hi', हिंदी: 'hi', हिन्दी: 'hi',
  english: 'en', अंग्रेज़ी: 'en', अंग्रेजी: 'en',
  bengali: 'bn', bangla: 'bn', বাংলা: 'bn',
  tamil: 'ta', தமிழ்: 'ta',
  marathi: 'mr', मराठी: 'mr',
};

export default function WelcomeScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setLanguage } = useSessionStore();
  const { isListening, startListening, stopListening } = useVoiceInput();

  const [hasSelected, setHasSelected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to avoid including `speak` in useEffect deps (it's a new function each render)
  const speakRef = useRef(speak);
  speakRef.current = speak;

  // Clean mount speech with a natural slight delay
  useEffect(() => {
    const timer = setTimeout(() => {
      speakRef.current("Namaste! Welcome!");
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // Clean up auto-advance timeout if unmounted
  useEffect(() => {
    router.prefetch('/consent');
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  const handleLanguageSelect = useCallback((langId: string, greeting: string) => {
    setLanguage(langId);
    setHasSelected(true);
    speakRef.current(greeting, langId);

    // Cancel any existing timeout to prevent overlapping navigations
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Auto-advance after 3s
    timeoutRef.current = setTimeout(() => {
      router.push('/consent');
    }, 3000);
  }, [setLanguage, router]);

  const handleVoiceListen = useCallback(() => {
    if (isListening) {
      stopListening();
      return;
    }
    startListening({
      mode: 'transcribe',
      language: 'unknown',
      onResult: (result) => {
        const spoken = result.transcript.trim().toLowerCase();
        // Check against known language names
        const matchedId = VOICE_LANG_MAP[spoken];
        if (matchedId) {
          const lang = LANGUAGES.find((l) => l.id === matchedId);
          if (lang) handleLanguageSelect(lang.id, lang.greeting);
        }
        // Also try matching by detected languageCode
        if (!matchedId && result.languageCode) {
          const code = result.languageCode.split('-')[0]; // e.g. "hi-IN" → "hi"
          const lang = LANGUAGES.find((l) => l.id === code);
          if (lang) handleLanguageSelect(lang.id, lang.greeting);
        }
      },
      onError: () => {
        // Silently fail — user can still tap
      },
    });
  }, [isListening, startListening, stopListening, handleLanguageSelect]);

  const handleNextClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    router.push('/consent');
  };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">

      {/* Header — Brand + Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-2 flex-none pt-4"
      >
        <div className="flex items-center gap-3">
          <div className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20">
            <Stethoscope size={32} />
          </div>
          <div className="flex flex-col">
            <h1 className="text-4xl font-extrabold text-ink tracking-tight flex items-center gap-2">
              AyushPod <Sparkles className="text-primary w-5 h-5 animate-pulse" />
            </h1>
            <span className="text-xs font-semibold text-muted tracking-wider uppercase">Smart Healthcare Access</span>
          </div>
        </div>
        <p className="text-lg font-semibold text-muted mt-3 text-center">
          Please select your preferred language / अपनी भाषा चुनें
        </p>
      </motion.div>

      {/* Language Grid */}
      <div className="flex-1 flex items-center justify-center py-4">
        <div className="grid grid-cols-3 gap-4 max-w-3xl w-full px-2">
          {LANGUAGES.map((lang, index) => {
            const isSelected = language === lang.id && hasSelected;
            return (
              <motion.button
                key={lang.id}
                initial={{ opacity: 0, scale: 0.92, y: 16 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ delay: 0.15 + index * 0.06, duration: 0.35, ease: "easeOut" }}
                whileHover={{ scale: 1.04, y: -3 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleLanguageSelect(lang.id, lang.greeting)}
                className={cn(
                  "flex flex-col items-center justify-center py-7 px-4 rounded-[2rem] gap-2 transition-all duration-300 relative overflow-hidden",
                  "bg-surface outline-none border-2 focus-visible:ring-4 focus-visible:ring-primary/40",
                  isSelected
                    ? "shadow-xl ring-2 ring-primary border-primary bg-primary-soft/40"
                    : "border-hairline shadow-[var(--shadow-soft)] hover:shadow-[var(--shadow-warm)] hover:border-primary/40"
                )}
              >
                {isSelected && (
                  <motion.div
                    layoutId="activeIndicator"
                    className="absolute inset-0 border-[3px] border-primary rounded-[2rem] pointer-events-none"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                <span className="text-4xl drop-shadow-sm">{lang.flag}</span>
                <span className={cn(
                  "text-2xl font-extrabold tracking-wide",
                  isSelected ? "text-primary" : "text-ink"
                )}>
                  {lang.native}
                </span>
                {lang.id !== 'en' && (
                  <span className="text-sm font-medium text-muted">{lang.english}</span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Bottom: Voice Hint or Next Button */}
      <div className="flex-none pb-2">
        <AnimatePresence mode="wait">
          {!hasSelected ? (
            <motion.button
              key="voice-hint"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              onClick={handleVoiceListen}
              className={cn(
                "flex items-center gap-4 w-full max-w-xl mx-auto px-6 py-4 rounded-2xl",
                "bg-surface/90 backdrop-blur-md shadow-lg border-2 border-hairline",
                "transition-all duration-300 hover:border-primary/50 group justify-center",
                isListening && "ring-2 ring-primary border-primary bg-primary-soft/20"
              )}
            >
              <div className={cn(
                "p-2.5 rounded-xl transition-all",
                isListening ? "animate-pulse bg-primary text-white" : "bg-primary-soft text-primary"
              )}>
                {isListening ? <MicOff size={22} /> : <Mic size={22} />}
              </div>
              <span className="text-lg font-bold text-ink">
                {isListening ? "Listening… tap to stop" : "Tap to speak your language"}
              </span>
            </motion.button>
          ) : (
            <motion.div
              key="next-btn"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.25 }}
              className="flex items-center justify-between gap-4 w-full max-w-xl mx-auto bg-surface/90 backdrop-blur-md px-5 py-3 rounded-2xl shadow-xl border-2 border-primary/30"
            >
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-primary animate-ping" />
                <span className="text-base font-bold text-ink">Continuing automatically…</span>
              </div>
              <LargeTouchButton
                onClick={handleNextClick}
                className="py-3 px-6 text-lg shadow-md !min-h-0 !rounded-xl"
              >
                <span>Next</span>
                <ArrowRight size={20} className="ml-2" />
              </LargeTouchButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}