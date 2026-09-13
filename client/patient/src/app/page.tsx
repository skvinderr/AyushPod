"use client";

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../store/useAvatar';
import { useSessionStore } from '../store/useSessionStore';
import { useVoiceInput } from '../lib/useVoiceInput';
import { LargeTouchButton } from '../components/LargeTouchButton';
<<<<<<< HEAD
import { Stethoscope, Mic, ArrowRight, Sparkles, MicOff } from 'lucide-react';
=======
import { 
  Stethoscope, 
  Mic, 
  ArrowRight, 
  Volume2, 
  PhoneCall, 
  Globe, 
  Sparkles,
  HelpCircle,
  HeartPulse
} from 'lucide-react';
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/LargeTouchButton';
import { useTranslation } from '../lib/i18n/TranslationContext';

<<<<<<< HEAD
// Language data with enhanced styling metadata
const LANGUAGES = [
  { id: 'hi', native: 'हिंदी', english: 'Hindi', flag: '🇮🇳', greeting: 'नमस्ते, आपका स्वागत है!' },
  { id: 'en', native: 'English', english: 'English', flag: '🇬🇧', greeting: 'Welcome to AyushPod!' },
  { id: 'bn', native: 'বাংলা', english: 'Bengali', flag: '🇮🇳', greeting: 'নমস্কার, আপনাকে স্বাগত!' },
  { id: 'ta', native: 'தமிழ்', english: 'Tamil', flag: '🇮🇳', greeting: 'வணக்கம், நல்வரவு!' },
  { id: 'mr', native: 'मराठी', english: 'Marathi', flag: '🇮🇳', greeting: 'नमस्कार, आपले स्वागत आहे!' },
=======
// Updated Language Data with Greetings & Phonetics/English names
const LANGUAGES = [
  { id: 'en', code: 'IN/EN', native: 'English', english: 'English', flag: '🇬🇧', hello: '"Hello"', greeting: 'Welcome to AyushPod!' },
  { id: 'hi', code: 'IN/HI', native: 'हिंदी', english: 'Hindi', flag: '🇮🇳', hello: '"नमस्ते"', greeting: 'आयुष पॉड में आपका स्वागत है!' },
  { id: 'bn', code: 'IN/BN', native: 'বাংলা', english: 'Bengali', flag: '🇮🇳', hello: '"নমস্কার"', greeting: 'আয়ুষ পডে আপনাকে স্বাগতম!' },
  { id: 'ta', code: 'IN/TA', native: 'தமிழ்', english: 'Tamil', flag: '🇮🇳', hello: '"வணக்கம்"', greeting: 'ஆயுஷ் பாடுக்க வருக!' },
  { id: 'mr', code: 'IN/MR', native: 'मराठी', english: 'Marathi', flag: '🇮🇳', hello: '"नमस्कार"', greeting: 'आयुष पॉड मध्ये आपले स्वागत आहे!' },
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
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
<<<<<<< HEAD
  const { isListening, startListening, stopListening } = useVoiceInput();
=======
  const { isListening, startListening } = useVoiceInput();
  const { t } = useTranslation();
  
  const [hasSelected, setHasSelected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa

  const [hasSelected, setHasSelected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref to avoid including `speak` in useEffect deps (it's a new function each render)
  const speakRef = useRef(speak);
  speakRef.current = speak;

  // Clean mount speech with a natural slight delay
  useEffect(() => {
<<<<<<< HEAD
    const timer = setTimeout(() => {
      speakRef.current("Namaste! Welcome!");
    }, 600);
    return () => clearTimeout(timer);
  }, []);
=======
    const timeout = setTimeout(() => {
      speak("Namaste! Welcome to AyushPod health kiosk.");
    }, 800);
    return () => clearTimeout(timeout);
  }, [speak]);
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa

  useEffect(() => {
    router.prefetch('/consent');
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [router]);

  const handleLanguageSelect = useCallback((langId: string, greeting: string) => {
    setLanguage(langId);
    setHasSelected(true);
<<<<<<< HEAD
    speakRef.current(greeting, langId);

    // Cancel any existing timeout to prevent overlapping navigations
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    // Auto-advance after 3s
=======
    
    speak(greeting, langId);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
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
<<<<<<< HEAD
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
=======
    <div className="absolute inset-0 bg-[#eef7f6] flex flex-col justify-between p-6 md:p-8 overflow-hidden select-none font-sans">
      
      {/* 1. TOP BAR / HEADER */}
      <motion.header 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center mb-12 justify-between w-full max-w-5xl mx-auto"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#008080] text-white p-3 rounded-2xl shadow-md flex items-center justify-center">
            <Stethoscope size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-[#0a3636] tracking-tight">AyushPod</h1>
            <p className="text-xs font-semibold text-[#008080] tracking-widest uppercase">{t('Smart Health Kiosk')}</p>
          </div>
        </div>

        <motion.button 
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 bg-red-100 border border-red-200 text-red-600 px-5 py-3 rounded-full shadow-sm hover:bg-red-200 transition-colors"
        >
          <PhoneCall size={20} className="animate-bounce" />
          <div className="text-left leading-tight">
            <span className="block font-bold text-sm">{t('Call Nurse')}</span>
            <span className="block text-[10px] opacity-80">{t('Ayuda / सहायता')}</span>
          </div>
        </motion.button>
      </motion.header>

      {/* 3. LANGUAGE SELECTION GRID */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="max-w-5xl w-full mx-auto  m-13 grid grid-cols-2 md:grid-cols-3 gap-4 my-auto"
      >
        {LANGUAGES.map((lang) => {
          const isSelected = language === lang.id && hasSelected;
          return (
            <motion.button
              key={lang.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleLanguageSelect(lang.id, lang.greeting)}
              className={cn(
                "relative flex flex-col justify-between p-5 rounded-2xl text-left border-2 transition-all duration-300 min-h-[120px]",
                isSelected
                  ? "bg-white border-[#008080] shadow-xl ring-4 ring-[#008080]/20 scale-[1.02]"
                  : "bg-white/90 border-slate-200 hover:border-emerald-300 shadow-sm hover:shadow-md"
              )}
            >
              <div className="flex justify-between items-start w-full">
                <span className="text-lg font-black text-slate-400 tracking-wider">{lang.code}</span>
                <span className="text-2xl">{lang.flag}</span>
              </div>

              <div className="my-1">
                <h3 className={cn("text-2xl font-black", isSelected ? "text-[#008080]" : "text-slate-800")}>
                  {lang.native}
                </h3>
                <p className="text-xs font-semibold text-slate-400">{lang.hello}</p>
              </div>

              <div className="flex items-center gap-1.5 text-[#008080] text-xs font-bold pt-1">
                <Volume2 size={14} />
                <span>Listen</span>
              </div>
            </motion.button>
          );
        })}

        {/* INTERPRETER / OTHER LANGUAGES TILE */}
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="relative flex flex-col justify-between p-5 rounded-2xl text-left bg-emerald-100/60 border-2 border-emerald-300/80 shadow-sm hover:shadow-md transition-all min-h-[120px]"
        >
          <div className="flex justify-between items-start w-full text-[#008080]">
            <Globe size={24} />
            <HelpCircle size={20} />
          </div>

          <div className="my-1">
            <h3 className="text-xl font-bold text-[#0a3636]">Interpreter</h3>
            <p className="text-xs font-medium text-slate-600">Other / अन्य भाषाएं</p>
          </div>

          <div className="flex items-center gap-1.5 text-[#008080] text-xs font-bold pt-1">
            <span>Tap for Helper</span>
          </div>
        </motion.button>
      </motion.div>

      {/* 4. FOOTER & ACTION CONTAINER */}
      <div className="max-w-5xl w-full mx-auto mt-4 space-y-3">
        <AnimatePresence mode="wait">
          {!hasSelected ? (
            <motion.div
              key="start-btn-initial"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full"
            >
              <button
                onClick={() => handleLanguageSelect(language || 'en', LANGUAGES.find(l => l.id === language)?.greeting || 'Welcome')}
                className="w-full bg-[#008080] hover:bg-[#006666] text-white py-5 px-8 rounded-2xl shadow-lg hover:shadow-xl flex items-center justify-between transition-all duration-300 group"
              >
                <div className="flex items-center gap-3">
                  <Volume2 size={28} className="opacity-80" />
                  <div className="text-left">
                    <span className="block text-2xl font-black tracking-wide">START / शुरू करें</span>
                    <span className="block text-xs font-medium opacity-80">Tap here to begin • प्रारंभ करने के लिए यहां छुएं</span>
                  </div>
                </div>
                <div className="bg-white/20 p-3 rounded-xl group-hover:translate-x-1 transition-transform">
                  <ArrowRight size={28} />
                </div>
              </button>
            </motion.div>
          ) : (
            <motion.div
              key="next-btn-selected"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full flex items-center gap-4"
            >
              <div className="flex-1 bg-white border border-emerald-200 py-4 px-6 rounded-2xl text-center shadow-sm">
                <span className="text-sm font-semibold text-slate-600 animate-pulse">
                  {t('Continuing automatically in 3 seconds...')}
                </span>
              </div>
              <LargeTouchButton 
                onClick={handleNextClick}
                className="bg-[#008080] text-white py-4 px-8 rounded-2xl shadow-lg flex items-center gap-3 font-bold text-xl hover:bg-[#006666]"
              >
                <span>{t('Next')}</span>
                <ArrowRight size={24} />
              </LargeTouchButton>
            </motion.div>
          )}
        </AnimatePresence>

        {/* NURSE ASSIST FOOTER BANNER */}
        <div className="bg-white/80 backdrop-blur-sm border border-slate-200/80 rounded-xl py-2.5 px-4 flex items-center justify-center gap-2 text-xs font-semibold text-slate-600 text-center shadow-sm">
          <HeartPulse size={16} className="text-red-500" />
          <span>{t('Need help? A nurse or assistant is available right here to assist you.')}</span>
        </div>
      </div>

>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
    </div>
  );
}