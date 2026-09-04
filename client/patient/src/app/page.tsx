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
    <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col pt-12 pb-8 px-12 overflow-hidden">
      
      {/* Header / Logo */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-center gap-4 mb-16"
      >
        <div className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg">
          <Stethoscope size={48} />
        </div>
        <h1 className="text-6xl font-extrabold text-blue-900 tracking-tight">MediKiosk</h1>
      </motion.div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full z-10">
        
        {/* Language Grid */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap justify-center gap-8 mb-16"
        >
          {LANGUAGES.map((lang) => (
            <motion.button
              key={lang.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleLanguageSelect(lang.id, lang.greeting)}
              className={cn(
                "flex flex-col items-center justify-center p-8 rounded-[2rem] w-56 h-56 gap-4 transition-all duration-300",
                "border-4 shadow-xl outline-none focus-visible:ring-8 focus-visible:ring-blue-500/50",
                language === lang.id && hasSelected
                  ? "border-blue-600 bg-blue-100 scale-105"
                  : "border-white bg-white hover:border-blue-200"
              )}
            >
              <span className="text-5xl">{lang.flag}</span>
              <span className={cn(
                "text-4xl font-bold",
                language === lang.id && hasSelected ? "text-blue-700" : "text-slate-800"
              )}>
                {lang.native}
              </span>
              {lang.id !== 'en' && (
                <span className="text-xl font-medium text-slate-500">
                  {lang.english}
                </span>
              )}
            </motion.button>
          ))}
        </motion.div>

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
                  "flex items-center gap-6 px-10 py-6 rounded-full bg-white/80 backdrop-blur-md shadow-lg border-2 border-slate-200",
                  "transition-all duration-300",
                  isListening ? "ring-4 ring-blue-400 border-blue-400" : ""
                )}
              >
                <div className={cn(
                  "p-4 rounded-full bg-blue-100 text-blue-600",
                  isListening ? "animate-pulse bg-blue-600 text-white" : ""
                )}>
                  <Mic size={32} />
                </div>
                <span className="text-2xl font-semibold text-slate-700">
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
                <span className="text-2xl font-medium text-blue-800 bg-blue-100 px-6 py-3 rounded-full animate-pulse">
                  Continuing automatically...
                </span>
                <LargeTouchButton 
                  onClick={handleNextClick} 
                  className="bg-blue-700 text-white border-none py-6 px-12"
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
