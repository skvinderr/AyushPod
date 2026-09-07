"use client";

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../store/useAvatar';
import { useSessionStore } from '../store/useSessionStore';
import { useVoiceInput } from '../lib/useVoiceInput';
import { LargeTouchButton } from '../components/LargeTouchButton';
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
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../components/LargeTouchButton';
import { useTranslation } from '../lib/i18n/TranslationContext';

// Updated Language Data with Greetings & Phonetics/English names
const LANGUAGES = [
  { id: 'en', code: 'IN/EN', native: 'English', english: 'English', flag: '🇬🇧', hello: '"Hello"', greeting: 'Welcome to AyushPod!' },
  { id: 'hi', code: 'IN/HI', native: 'हिंदी', english: 'Hindi', flag: '🇮🇳', hello: '"नमस्ते"', greeting: 'आयुष पॉड में आपका स्वागत है!' },
  { id: 'bn', code: 'IN/BN', native: 'বাংলা', english: 'Bengali', flag: '🇮🇳', hello: '"নমস্কার"', greeting: 'আয়ুষ পডে আপনাকে স্বাগতম!' },
  { id: 'ta', code: 'IN/TA', native: 'தமிழ்', english: 'Tamil', flag: '🇮🇳', hello: '"வணக்கம்"', greeting: 'ஆயுஷ் பாடுக்க வருக!' },
  { id: 'mr', code: 'IN/MR', native: 'मराठी', english: 'Marathi', flag: '🇮🇳', hello: '"नमस्कार"', greeting: 'आयुष पॉड मध्ये आपले स्वागत आहे!' },
];

export default function WelcomeScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setLanguage } = useSessionStore();
  const { isListening, startListening } = useVoiceInput();
  const { t } = useTranslation();
  
  const [hasSelected, setHasSelected] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      speak("Namaste! Welcome to AyushPod health kiosk.");
    }, 800);
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
    
    speak(greeting, langId);

    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      router.push('/consent');
    }, 3500);
  };

  const handleNextClick = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    router.push('/consent');
  };

  return (
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

    </div>
  );
}