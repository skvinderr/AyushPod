"use client";

<<<<<<< HEAD
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import dynamic from 'next/dynamic';
const BodyModelCanvas = dynamic(() => import('../../components/BodyModel3D').then(mod => mod.BodyModelCanvas), { ssr: false });
import { useVoiceInput } from '../../lib/useVoiceInput';
import { cn } from '../../components/LargeTouchButton';
import { useT } from '../../i18n';
import type { LucideIcon } from 'lucide-react';
import {
  Zap, Waves, Anchor, Flame, Feather, RotateCw, Mic, X,
=======
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { 
  ArrowLeft, 
  Volume2, 
  Mic, 
  Activity, 
  Heart, 
  UserCheck, 
  Bandage, 
  Thermometer, 
  HelpCircle, 
  ArrowRight,
  Flame,
  Check
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
} from 'lucide-react';
import { FaTooth } from 'react-icons/fa';
import { IconType } from 'react-icons';

<<<<<<< HEAD
/*
 * Zone -> interview-tree category + a short "how does it feel" drill-down.
 * `titleKey` and each feel `labelKey` are i18n catalog keys resolved via t().
 * The feel answer is stored as a pre-answer so the interview can carry it.
 */
const ZONE_CONFIG: Record<
  string,
  { titleKey: string; category: string; feels: { id: string; labelKey: string; icon: LucideIcon }[] }
> = {
  head: {
    titleKey: 'complaint.zone.head',
    category: 'head',
    feels: [
      { id: 'throbbing', labelKey: 'complaint.feel.throbbing', icon: Waves },
      { id: 'pressure', labelKey: 'complaint.feel.pressure', icon: Anchor },
      { id: 'sharp', labelKey: 'complaint.feel.sharp', icon: Zap },
    ],
  },
  chest: {
    titleKey: 'complaint.zone.chest',
    category: 'chest',
    feels: [
      { id: 'tightness', labelKey: 'complaint.feel.tightness', icon: Anchor },
      { id: 'sharp', labelKey: 'complaint.feel.sharpPain', icon: Zap },
      { id: 'burning', labelKey: 'complaint.feel.burning', icon: Flame },
    ],
  },
  stomach: {
    titleKey: 'complaint.zone.stomach',
    category: 'stomach',
    feels: [
      { id: 'cramping', labelKey: 'complaint.feel.cramping', icon: Waves },
      { id: 'burning', labelKey: 'complaint.feel.burning', icon: Flame },
      { id: 'dull', labelKey: 'complaint.feel.dull', icon: Feather },
    ],
  },
  back: {
    titleKey: 'complaint.zone.back',
    category: 'general',
    feels: [
      { id: 'stiff', labelKey: 'complaint.feel.stiff', icon: Anchor },
      { id: 'sharp', labelKey: 'complaint.feel.sharp', icon: Zap },
      { id: 'dull', labelKey: 'complaint.feel.dull', icon: Feather },
    ],
  },
  joints: {
    titleKey: 'complaint.zone.joints',
    category: 'joints',
    feels: [
      { id: 'stiff', labelKey: 'complaint.feel.stiff', icon: Anchor },
      { id: 'swelling', labelKey: 'complaint.feel.swelling', icon: Waves },
      { id: 'sharp', labelKey: 'complaint.feel.sharp', icon: Zap },
    ],
  },
  legs: {
    titleKey: 'complaint.zone.legs',
    category: 'joints',
    feels: [
      { id: 'weak', labelKey: 'complaint.feel.weak', icon: Feather },
      { id: 'swelling', labelKey: 'complaint.feel.swelling', icon: Waves },
      { id: 'cramping', labelKey: 'complaint.feel.cramping', icon: Waves },
    ],
  },
};
=======
interface Category {
  id: string;
  labelEn: string;
  labelHi: string;
  color: string;
  icon?: React.ComponentType<{ className?: string }> | IconType;
  imageUrl?: string;
}

const CATEGORIES: Category[] = [
  { id: 'head', labelEn: 'HEAD', labelHi: 'सिर', imageUrl: '/head.png', color: 'bg-teal-100 text-[#008080]' },
  { id: 'chest', labelEn: 'CHEST', labelHi: 'छाती', imageUrl: '/chest.png', color: 'bg-rose-100 text-rose-600' },
  { id: 'stomach', labelEn: 'STOMACH', labelHi: 'पेट', imageUrl: '/stomach.png', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'back_leg', labelEn: 'BACK & LEG', labelHi: 'पीठ / पैर', icon: Activity, color: 'bg-teal-100 text-[#008080]' },
  { id: 'wound', labelEn: 'WOUND', labelHi: 'घाव / चोट', icon: Bandage, color: 'bg-blue-100 text-blue-600' },
  { id: 'fever', labelEn: 'FEVER', labelHi: 'बुखार', imageUrl: '/fever.png', color: 'bg-amber-100 text-amber-600' },
  { id: 'teeth', labelEn: 'TEETH', labelHi: 'दांत', icon: FaTooth, color: 'bg-cyan-100 text-cyan-600' },
  { id: 'other', labelEn: 'OTHER', labelHi: 'अन्य', icon: HelpCircle, color: 'bg-indigo-100 text-indigo-600' },
];
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa

export default function ComplaintScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setChiefComplaint, updateHistoryAnswer } = useSessionStore();
  const { isListening, startListening } = useVoiceInput();
  const { t } = useT();

  const [activeZone, setActiveZone] = useState<string | null>(null);
  const [rotateSignal, setRotateSignal] = useState(0);

<<<<<<< HEAD
  useEffect(() => {
    router.prefetch('/interview');
    speak(t('complaint.spoken.prompt'), { language, gesture: 'point-right', stage: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speak, language, router]);

  const handleZone = (id: string) => {
    setActiveZone(id);
    speak(t('complaint.spoken.zoneFeel', { zone: t(ZONE_CONFIG[id].titleKey) }), { language, gesture: 'present', stage: true });
  };

  const handleFeel = (feelId: string) => {
    if (!activeZone) return;
    const cfg = ZONE_CONFIG[activeZone];
    setChiefComplaint(cfg.category);
    updateHistoryAnswer('reported_zone', activeZone);
    updateHistoryAnswer('reported_feel', feelId);
    speak(t('complaint.spoken.gotIt'), language);
=======
  const [selectedCategory, setSelectedCategory] = useState<string | null>('stomach');
  const [painLevel, setPainLevel] = useState<'low' | 'medium' | 'high'>('medium');
  const [isAudioGuideOn, setIsAudioGuideOn] = useState(true);

  useEffect(() => {
    if (isAudioGuideOn) {
      speak(
        language === 'hi' 
          ? "कहाँ दर्द है? फोटो पर टैप करें या बोलें।" 
          : "Where are you experiencing pain? Touch a picture or tap to speak.", 
        language
      );
    }
  }, [language, isAudioGuideOn, speak]);

  const handleAudioSpeakerClick = (textEn: string, textHi: string, e: React.MouseEvent) => {
    e.stopPropagation();
    speak(language === 'hi' ? textHi : textEn, language);
  };

  const handleNext = () => {
    if (!selectedCategory) return;
    setChiefComplaint(`${selectedCategory}_pain_${painLevel}`);
    speak("Thank you. Proceeding to interview.", language);
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
    router.push('/interview');
  };

  const activeCfg = activeZone ? ZONE_CONFIG[activeZone] : null;

  return (
<<<<<<< HEAD
    <div className="h-full flex flex-col">
      {/* prompt */}
      <div className="pb-3">
        <h1 className="text-5xl font-extrabold text-ink tracking-tight">{t('complaint.heading')}</h1>
        <p className="text-2xl text-muted mt-1">{t('complaint.sub')}</p>
      </div>

      {/* body: 3D model + drill-down */}
      <div className="flex-1 min-h-0 flex gap-5">
        {/* 3D body — the focal, elevated surface */}
        <div className="relative flex-1 rounded-[1.75rem] bg-gradient-to-b from-primary-soft/70 via-surface to-surface-warm overflow-hidden border border-hairline shadow-[var(--card-lift)]">
          <BodyModelCanvas activeZone={activeZone} onSelectZone={handleZone} rotateSignal={rotateSignal} />

          <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full bg-surface/90 backdrop-blur px-5 py-2 shadow-[var(--shadow-soft)] border border-hairline">
            <span className="text-lg font-medium text-muted">{t('complaint.dragHint')}</span>
          </div>

          <button
            onClick={() => setRotateSignal((s) => s + 1)}
            className="absolute bottom-5 right-5 flex items-center gap-2 rounded-full bg-surface px-5 py-3 shadow-[var(--shadow-warm)] border border-hairline text-primary-deep font-semibold hover:bg-primary-soft transition-colors"
          >
            <RotateCw size={24} /> {t('complaint.turn')}
          </button>
        </div>

        {/* Right rail: drill-down OR voice prompt */}
        <div className="w-[320px] shrink-0 flex flex-col">
          <AnimatePresence mode="wait">
            {activeCfg ? (
              <motion.div
                key={activeZone}
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -24 }}
                className="flex flex-col h-full"
              >
                <div className="flex items-center justify-between mb-1">
                  <h2 className="text-3xl font-extrabold text-ink">{t(activeCfg.titleKey)}</h2>
                  <button onClick={() => setActiveZone(null)} className="p-2 rounded-full text-muted hover:bg-surface-warm" aria-label={t('common.close')}>
                    <X size={28} />
                  </button>
                </div>
                <p className="text-xl text-muted mb-5">{t('complaint.howFeel')}</p>

                <div className="flex flex-col gap-4 flex-1">
                  {activeCfg.feels.map((f) => {
                    const Icon = f.icon;
                    return (
                      <motion.button
                        key={f.id}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleFeel(f.id)}
                        className="flex items-center gap-5 p-5 rounded-[1.25rem] bg-surface border-2 border-hairline hover:border-primary hover:bg-primary-soft transition-all min-h-[96px] text-left"
                      >
                        <div className="p-4 rounded-full bg-primary-soft text-primary">
                          <Icon size={34} />
                        </div>
                        <span className="text-2xl font-semibold text-ink">{t(f.labelKey)}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="voice"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col h-full items-center justify-center text-center gap-6 rounded-[1.75rem] bg-surface-warm/70 border border-hairline p-8"
              >
                <p className="text-2xl font-semibold text-ink leading-snug">
                  {t('complaint.notSure')}<br />{t('complaint.tellWords')}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { startListening({ language, mode: 'transcribe' }); setChiefComplaint('voice_narration'); }}
                  className={cn(
                    'w-40 h-40 rounded-full flex flex-col items-center justify-center gap-2 shadow-[var(--shadow-warm)] transition-all',
                    isListening ? 'bg-primary text-white animate-pulse' : 'bg-surface text-primary border-4 border-primary/30',
                  )}
                >
                  <Mic size={52} />
                  <span className="text-lg font-semibold">{isListening ? t('common.listening') : t('common.tapToSpeak')}</span>
                </motion.button>
                {isListening && (
                  <button onClick={() => router.push('/interview')} className="text-primary-deep font-semibold text-xl underline underline-offset-4">
                    {t('complaint.doneContinue')}
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
=======
    <div className="fixed inset-0 bg-[#eef7f6] flex flex-col justify-between p-3 sm:p-5 select-none font-sans overflow-hidden h-[100svh] w-[100vw]">
      
      {/* 1. TOP NAVBAR */}
      <div className="w-full max-w-xl mx-auto flex items-center justify-between gap-2 shrink-0">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-100 text-[#008080] rounded-full font-bold text-sm shadow-sm hover:bg-teal-200 active:scale-95 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button 
          onClick={() => setIsAudioGuideOn(!isAudioGuideOn)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-bold text-xs sm:text-sm shadow-sm transition-all ${
            isAudioGuideOn 
              ? 'bg-teal-100 text-[#008080] border border-teal-300' 
              : 'bg-slate-200 text-slate-600'
          }`}
        >
          <Volume2 className="w-4 h-4" />
          <span>Audio Guide {isAudioGuideOn ? 'ON' : 'OFF'}</span>
        </button>
      </div>

      {/* 2. AVATAR PROMPT HEADER */}
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl p-3.5 shadow-sm border border-slate-100 flex items-center gap-3 shrink-0 my-2">
        <div className="relative">
          <div className="w-12 h-12 rounded-full bg-teal-600 overflow-hidden border-2 border-teal-500 shadow-sm flex items-center justify-center text-white font-black text-xl">
            🩺
          </div>
          <button 
            onClick={(e) => handleAudioSpeakerClick("Where is the pain?", "कहाँ दर्द है?", e)}
            className="absolute -bottom-1 -right-1 bg-[#008080] text-white p-1 rounded-full shadow-md"
          >
            <Volume2 className="w-3 h-3" />
          </button>
        </div>
        <div>
          <h2 className="text-lg font-black text-slate-800 leading-tight">कहाँ दर्द है?</h2>
          <p className="text-xs font-semibold text-slate-500">Touch Picture or Speak</p>
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
        </div>
      </div>

      {/* 3. SPEAK BUTTON BANNER */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => handleNext()}
        className="w-full max-w-xl mx-auto bg-[#005f73] hover:bg-[#004f60] text-white rounded-2xl p-3 shadow-md flex items-center justify-between shrink-0 my-1 transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="bg-white/20 p-2.5 rounded-full">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <span className="text-sm sm:text-base font-black block leading-none">बोलें / TAP & SPEAK</span>
            <span className="text-[10px] sm:text-xs text-teal-100 font-medium">Tell symptoms in any language</span>
          </div>
        </div>
        <div className="flex gap-0.5 opacity-80">
          <span className="w-1 h-5 bg-white/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-1 h-7 bg-white rounded-full animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-1 h-4 bg-white/60 rounded-full animate-bounce"></span>
        </div>
      </motion.button>

      {/* 4. SYMPTOM CATEGORIES GRID */}
      <div className="w-full max-w-xl mx-auto flex-1 overflow-y-auto py-1">
        <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconComponent = cat.icon;

            return (
              <motion.div
                key={cat.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedCategory(cat.id)}
                className={`relative rounded-2xl p-3 border-2 transition-all flex flex-col items-center justify-center text-center cursor-pointer min-h-[95px] sm:min-h-[105px] ${
                  isSelected 
                    ? 'bg-[#d8f3dc] border-[#008080] shadow-md' 
                    : 'bg-white border-slate-100 hover:border-slate-300 shadow-sm'
                }`}
              >
                {/* Audio speaker button */}
                <button 
                  onClick={(e) => handleAudioSpeakerClick(cat.labelEn, cat.labelHi, e)}
                  className="absolute top-2 right-2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                </button>

                {/* Selection Check Indicator */}
                {isSelected && (
                  <div className="absolute top-2 left-2 bg-[#008080] text-white p-0.5 rounded-full shadow-sm">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}

                {/* Icon / Image Container */}
                <div className={`p-2 rounded-full mb-1.5 ${cat.color} shadow-inner flex items-center justify-center w-11 h-11`}>
                  {cat.imageUrl ? (
                    <img 
                      src={cat.imageUrl} 
                      alt={cat.labelEn} 
                      className="w-6 h-6 object-contain"
                    />
                  ) : IconComponent ? (
                    <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
                  ) : null}
                </div>

                {/* Labels */}
                <span className="text-xs sm:text-sm font-black text-slate-800 tracking-wide leading-none">{cat.labelEn}</span>
                <span className="text-[10px] sm:text-xs font-bold text-slate-500 mt-0.5">{cat.labelHi}</span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* 5. PAIN LEVEL SELECTOR */}
      <div className="w-full max-w-xl mx-auto bg-white rounded-2xl p-3 shadow-sm border border-slate-100 shrink-0 my-1">
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5">
            <Flame className="w-4 h-4 text-rose-500" />
            <span className="text-xs sm:text-sm font-black text-slate-800">दर्द कितना है? Pain Level</span>
          </div>
          <button 
            onClick={(e) => handleAudioSpeakerClick("Pain Level", "दर्द कितना है?", e)}
            className="text-slate-400 p-0.5"
          >
            <Volume2 className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => setPainLevel('low')}
            className={`py-2 px-2 rounded-xl text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 ${
              painLevel === 'low' 
                ? 'bg-emerald-100 text-emerald-800 border-2 border-emerald-400 shadow-sm' 
                : 'bg-emerald-50/50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            <span>😊</span>
            <span>कम / Low</span>
          </button>

          <button
            onClick={() => setPainLevel('medium')}
            className={`py-2 px-2 rounded-xl text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 ${
              painLevel === 'medium' 
                ? 'bg-[#005f73] text-white shadow-md' 
                : 'bg-teal-50 text-[#005f73] hover:bg-teal-100'
            }`}
          >
            <span>😳</span>
            <span>मध्यम / Medium</span>
          </button>

          <button
            onClick={() => setPainLevel('high')}
            className={`py-2 px-2 rounded-xl text-center font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1 ${
              painLevel === 'high' 
                ? 'bg-rose-100 text-rose-800 border-2 border-rose-400 shadow-sm' 
                : 'bg-rose-50/50 text-rose-700 hover:bg-rose-100'
            }`}
          >
            <span>😫</span>
            <span>तेज़ / High</span>
          </button>
        </div>
      </div>

      {/* 6. NEXT ACTION BUTTON */}
      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleNext}
        disabled={!selectedCategory}
        className="w-full max-w-xl mx-auto bg-[#005f73] hover:bg-[#004f60] active:bg-[#003f4d] text-white py-3 px-5 rounded-full font-black text-sm sm:text-base flex items-center justify-between shadow-lg shrink-0 transition-all disabled:opacity-40"
      >
        <div className="flex items-center gap-2">
          <Volume2 className="w-4 h-4 text-teal-200" />
          <div className="text-left">
            <span className="block leading-none">आगे बढ़ें / NEXT</span>
            <span className="text-[10px] text-teal-200 font-medium">Touch to Continue</span>
          </div>
        </div>
        <div className="bg-white/20 p-2 rounded-full">
          <ArrowRight className="w-5 h-5 text-white" />
        </div>
      </motion.button>

    </div>
  );
}