"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../store/useSessionStore';
import { useAvatar } from '../../store/useAvatar';
import { useTranslation } from '../../lib/i18n/TranslationContext';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { LargeNumpad } from '../../components/LargeNumpad';
import { ToggleSwitch } from '../../components/ToggleSwitch';
<<<<<<< HEAD
import { QrCode, CreditCard, UserPlus, Mic, FileText, Share2, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../../components/LargeTouchButton';
import { useT } from '../../i18n';
=======
import { 
  Fingerprint, 
  CreditCard, 
  UserPlus, 
  Mic, 
  FileText, 
  Share2, 
  ArrowRight, 
  ArrowLeft,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles
} from 'lucide-react';
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa

type Step = 'identity' | 'details' | 'consent';
type IdType = 'abha' | 'aadhaar' | 'new' | null;

export default function ConsentScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setConsentStatus, updatePatientInfo } = useSessionStore();
<<<<<<< HEAD
  const { t } = useT();

=======
  const { t } = useTranslation();
  
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
  const [step, setStep] = useState<Step>('identity');
  const [idType, setIdType] = useState<IdType>(null);
  const [inputValue, setInputValue] = useState('');

  const [consentVoice, setConsentVoice] = useState(false);
  const [consentDocs, setConsentDocs] = useState(false);
  const [consentShare, setConsentShare] = useState(false);
<<<<<<< HEAD
=======
  
  // Tracking user interaction
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
  const [interactedVoice, setInteractedVoice] = useState(false);
  const [interactedDocs, setInteractedDocs] = useState(false);
  const [interactedShare, setInteractedShare] = useState(false);

  const allInteracted = interactedVoice && interactedDocs && interactedShare;
  const canContinue = allInteracted && consentVoice && consentDocs && consentShare;

<<<<<<< HEAD
  useEffect(() => {
    router.prefetch('/complaint');
  }, [router]);

  const speakRef = useRef(speak);
  speakRef.current = speak;

  useEffect(() => {
    if (step === 'identity') {
      speakRef.current(t('consent.spoken.identity'), { language, gesture: 'present', stage: true });
    } else if (step === 'details') {
      speakRef.current(t('consent.spoken.details'), { language, gesture: 'point-down', stage: true });
    } else {
      speakRef.current(t('consent.spoken.privacy'), { language, gesture: 'present', stage: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, language]);
=======
 // 1. CONTEXT-AWARE SPEECH HANDLER (Fixed Dependencies)
  useEffect(() => {
    if (step === 'identity') {
      speak("How would you like to register today? Please select ABHA ID, Identification Card, or New Patient.", language);
    } else if (step === 'details') {
      if (idType === 'new') {
        speak("Please enter your age using the keypad.", language);
      } else if (idType === 'abha') {
        speak("Please enter your 14 digit ABHA ID number using the keypad.", language);
      } else if (idType === 'aadhaar') {
        speak("Please enter your 12 digit identification number using the keypad.", language);
      }
    } else if (step === 'consent') {
      speak("We need your permission to collect data for your consultation. Please review and enable all three options.", language);
    }
  }, [step, idType, language]); // 'speak' function ko dependency array se hata dein
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa

  const handleIdentitySelect = (type: IdType) => {
    setIdType(type);
    setInputValue('');
    setStep('details');
  };

  const handleDetailsSubmit = () => {
<<<<<<< HEAD
    if (idType === 'new') {
      updatePatientInfo({ age: parseInt(inputValue) || 30, name: 'Guest Patient' });
    } else if (idType === 'abha') {
      updatePatientInfo({ abhaId: inputValue, name: 'Guest Patient' });
    } else {
      updatePatientInfo({ id: inputValue, name: 'Guest Patient' });
    }
=======
    if (!inputValue) return;
    
    updatePatientInfo({ 
      id: idType === 'new' ? `GUEST-${Date.now().toString().slice(-4)}` : inputValue, 
      name: "Guest Patient", 
      age: idType === 'new' ? parseInt(inputValue) || 30 : 30 
    });
    
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
    setStep('consent');
  };

  const handleConsentSubmit = () => {
    setConsentStatus(true);
<<<<<<< HEAD
    speakRef.current(t('consent.spoken.thankYou'), { language });
    router.push('/complaint');
  };

  const heading = step === 'identity'
    ? t('consent.identity.heading')
    : step === 'details'
      ? t('consent.details.heading')
      : t('consent.privacy.heading');
  const sub = step === 'identity'
    ? t('consent.identity.sub')
    : step === 'details'
      ? (idType === 'new' ? t('consent.details.subNew') : t('consent.details.subCard'))
      : t('consent.privacy.sub');

  const pageVariants = { initial: { opacity: 0, y: 15 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -15 } };

  return (
    <div className="h-full flex flex-col justify-between overflow-hidden">
      {/* Header Area */}
      <div className="flex-none pb-2 mb-2">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => {
            if (step === 'consent') setStep('details');
            else if (step === 'details') setStep('identity');
            else router.push('/');
          }}
          className="mb-2 flex items-center gap-1 px-3 py-1.5 -ml-3 rounded-xl text-primary font-semibold hover:bg-primary-soft transition-colors"
        >
          <ChevronLeft size={22} />
          {t('common.back')}
        </motion.button>
        <motion.h1
          key={heading}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-extrabold text-ink tracking-tight"
        >
          {heading}
        </motion.h1>
        <motion.p
          key={sub}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl lg:text-2xl text-muted mt-2"
        >
          {sub}
        </motion.p>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 min-h-0 flex flex-col justify-center py-2">
        <AnimatePresence mode="wait">
=======
    speak("Thank you for providing consent. Moving to the health complaint section.", language);
    router.push('/complaint');
  };

  const containerVariants = {
    initial: { opacity: 0, scale: 0.96 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.96 }
  };

  // Input Validation Logic based on Type
  const getMaxInputLength = () => {
    if (idType === 'new') return 3; // Age limit (up to 3 digits)
    if (idType === 'aadhaar') return 12; // Standard 12 digits
    if (idType === 'abha') return 14; // Standard 14 digits
    return 14;
  };

  const isContinueDisabled = () => {
    if (!inputValue) return true;
    if (idType === 'new') return parseInt(inputValue) <= 0 || parseInt(inputValue) > 120;
    if (idType === 'aadhaar') return inputValue.length < 12;
    if (idType === 'abha') return inputValue.length < 14;
    return false;
  };

  return (
    <div className="fixed inset-0 bg-[#eef7f6] flex flex-col justify-between p-4 sm:p-6 lg:p-8 select-none font-sans overflow-hidden h-[100svh] w-[100vw]">
      
      {/* HEADER */}
      <motion.header 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-5xl mx-auto flex items-center justify-between bg-white/90 backdrop-blur-md border border-slate-200 px-5 py-3.5 rounded-2xl shadow-sm shrink-0"
      >
        <div className="flex items-center gap-3">
          <div className="bg-[#008080] text-white p-2.5 rounded-xl shadow-sm">
            <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-[#008080] uppercase tracking-wider block">{t('AyushPod Kiosk')}</span>
            <h2 className="text-sm sm:text-base md:text-lg font-black text-slate-800">
              {step === 'identity' && t("Step 1: Patient Verification")}
              {step === 'details' && t("Step 2: Enter Details")}
              {step === 'consent' && t("Step 3: Permissions & Consent")}
            </h2>
          </div>
        </div>

        {/* STEP PROGRESS INDICATORS */}
        <div className="flex items-center gap-2">
          {['identity', 'details', 'consent'].map((s, idx) => {
            const isActive = step === s;
            const isCompleted = 
              (s === 'identity' && (step === 'details' || step === 'consent')) ||
              (s === 'details' && step === 'consent');

            return (
              <div 
                key={s} 
                className={`w-7 h-7 sm:w-9 sm:h-9 rounded-full flex items-center justify-center font-bold text-xs sm:text-sm transition-all ${
                  isActive 
                    ? "bg-[#008080] text-white shadow-md ring-4 ring-[#008080]/20" 
                    : isCompleted 
                    ? "bg-emerald-100 text-[#008080]" 
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isCompleted ? <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" /> : idx + 1}
              </div>
            );
          })}
        </div>
      </motion.header>

      {/* MAIN CONTENT DISPLAY */}
      <div className="w-full max-w-5xl mx-auto flex-1 flex flex-col justify-center my-auto py-2 overflow-y-auto">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: IDENTITY SELECTION */}
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
          {step === 'identity' && (
            <motion.div
              key="identity"
<<<<<<< HEAD
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              className="flex flex-col gap-4 max-w-3xl mx-auto w-full"
            >
              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleIdentitySelect('abha')}
                className="group flex items-center gap-6 w-full p-5 lg:p-6 rounded-[1.75rem] bg-primary text-white shadow-lg hover:brightness-105 transition-all text-left"
              >
                <div className="bg-white/20 p-4 rounded-2xl shrink-0"><QrCode size={40} /></div>
                <div className="flex flex-col flex-1">
                  <span className="text-2xl font-extrabold">{t('consent.abha.title')}</span>
                  <span className="text-lg text-white/85 mt-1">{t('consent.abha.sub')}</span>
                </div>
                <ChevronRight size={32} className="opacity-70 group-hover:translate-x-2 transition-transform shrink-0" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleIdentitySelect('aadhaar')}
                className="group flex items-center gap-6 w-full p-5 lg:p-6 rounded-[1.75rem] bg-surface border-2 border-hairline hover:border-primary/50 hover:bg-surface-warm transition-all text-left shadow-sm"
              >
                <div className="bg-primary-soft text-primary p-4 rounded-2xl shrink-0"><CreditCard size={40} /></div>
                <div className="flex flex-col flex-1">
                  <span className="text-2xl font-extrabold text-ink">{t('consent.aadhaar.title')}</span>
                  <span className="text-lg text-muted mt-1">{t('consent.aadhaar.sub')}</span>
                </div>
                <ChevronRight size={32} className="text-muted group-hover:translate-x-2 transition-transform shrink-0" />
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.99 }}
                onClick={() => handleIdentitySelect('new')}
                className="group flex items-center gap-6 w-full p-5 lg:p-6 rounded-[1.75rem] bg-surface border-2 border-hairline hover:border-primary/50 hover:bg-surface-warm transition-all text-left shadow-sm"
              >
                <div className="bg-primary-soft text-primary p-4 rounded-2xl shrink-0"><UserPlus size={40} /></div>
                <div className="flex flex-col flex-1">
                  <span className="text-2xl font-extrabold text-ink">{t('consent.new.title')}</span>
                  <span className="text-lg text-muted mt-1">{t('consent.new.sub')}</span>
                </div>
                <ChevronRight size={32} className="text-muted group-hover:translate-x-2 transition-transform shrink-0" />
              </motion.button>
            </motion.div>
          )}

=======
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 md:p-10 shadow-md border border-slate-200/80 flex flex-col items-center justify-center min-h-0 flex-1"
            >
              <div className="text-center mb-6 sm:mb-8">
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-[#008080] font-bold text-xs px-3 py-1 rounded-full border border-emerald-200 mb-2">
                  <Sparkles className="w-3.5 h-3.5" /> {t('Easy Verification')}
                </span>
                <h1 className="text-2xl sm:text-4xl font-black text-slate-800">{t('How would you like to register?')}</h1>
                <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">{t('Tap one of the large buttons below to select')}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 w-full max-w-4xl">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleIdentitySelect('abha')}
                  className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-emerald-50/60 border-2 border-slate-200 hover:border-[#008080] rounded-3xl transition-all shadow-sm active:bg-emerald-100 min-h-[140px] sm:min-h-[180px]"
                >
                  <div className="p-3.5 bg-teal-100 text-[#008080] rounded-2xl mb-3">
                    <Fingerprint className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <span className="text-base sm:text-xl font-bold text-slate-800">{t('ABHA Health ID')}</span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">{t('Government Digital ID')}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleIdentitySelect('aadhaar')}
                  className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-emerald-50/60 border-2 border-slate-200 hover:border-[#008080] rounded-3xl transition-all shadow-sm active:bg-emerald-100 min-h-[140px] sm:min-h-[180px]"
                >
                  <div className="p-3.5 bg-teal-100 text-[#008080] rounded-2xl mb-3">
                    <CreditCard className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <span className="text-base sm:text-xl font-bold text-slate-800">{t('Identity Card')}</span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">{t('National ID Number')}</span>
                </motion.button>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => handleIdentitySelect('new')}
                  className="flex flex-col items-center justify-center p-6 bg-slate-50 hover:bg-emerald-50/60 border-2 border-slate-200 hover:border-[#008080] rounded-3xl transition-all shadow-sm active:bg-emerald-100 min-h-[140px] sm:min-h-[180px]"
                >
                  <div className="p-3.5 bg-teal-100 text-[#008080] rounded-2xl mb-3">
                    <UserPlus className="w-8 h-8 sm:w-10 sm:h-10" />
                  </div>
                  <span className="text-base sm:text-xl font-bold text-slate-800">{t('New Patient')}</span>
                  <span className="text-[11px] sm:text-xs text-slate-400 font-medium mt-0.5">{t('Manual Entry / Walk-in')}</span>
                </motion.button>
              </div>
            </motion.div>
          )}

          {/* STEP 2: INPUT NUMPAD AREA */}
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
          {step === 'details' && (
            <motion.div
              key="details"
<<<<<<< HEAD
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              className="h-full flex flex-col justify-between max-w-xl mx-auto w-full"
            >
              {/* Added a flex-1 wrapper to keep the numpad centered and the buttons at the bottom without squishing */}
              <div className="flex-1 flex flex-col justify-center min-h-0">
                <div className="w-full bg-surface rounded-[1.5rem] px-6 py-4 border-2 border-hairline text-center shadow-inner min-h-[64px] lg:min-h-[80px] flex items-center justify-center mb-3 lg:mb-6">
                  <span className={cn('text-3xl lg:text-4xl font-bold tracking-[0.2em] break-all', inputValue ? 'text-ink' : 'text-muted/40')}>
                    {inputValue || (idType === 'new' ? t('consent.placeholder.age') : t('consent.placeholder.id'))}
                  </span>
                </div>

                <div className="w-full">
                  <LargeNumpad value={inputValue} onChange={setInputValue} maxLength={14} />
                </div>
              </div>

              <div className="flex gap-4 w-full pt-4 mt-2 flex-none">
                <LargeTouchButton variant="secondary" onClick={() => setStep('identity')} className="flex-1 py-3 lg:py-4 text-xl !min-h-[64px] lg:!min-h-[80px] !rounded-2xl">
                  {t('common.back')}
                </LargeTouchButton>
                <LargeTouchButton onClick={handleDetailsSubmit} className="flex-1 py-3 lg:py-4 text-xl shadow-md !min-h-[64px] lg:!min-h-[80px] !rounded-2xl" disabled={inputValue.length === 0}>
                  {t('common.continue')}
=======
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 shadow-md border border-slate-200 flex flex-col items-center max-w-lg mx-auto w-full"
            >
              <h1 className="text-xl sm:text-3xl font-black text-slate-800 text-center">
                {idType === 'new' ? t('Enter your Age') : t(`Enter your ${idType === 'abha' ? 'ABHA ID' : 'ID'} Number`)}
              </h1>
              <p className="text-slate-500 font-medium text-xs sm:text-sm mb-4 text-center">
                {idType === 'new' ? t('Enter age in years') : t(`Enter digits (${inputValue.length}/${getMaxInputLength()})`)}
              </p>

              {/* READOUT BOX */}
              <div className="w-full bg-slate-50 rounded-2xl p-3 sm:p-4 border-2 border-slate-200 text-center mb-4 shadow-inner">
                <span className="text-2xl sm:text-4xl font-mono font-bold tracking-widest text-[#008080] break-all">
                  {inputValue || (idType === 'new' ? '0' : 'X'.repeat(getMaxInputLength()))}
                </span>
              </div>

              {/* NUMPAD WRAPPER */}
              <div className="w-full mb-4">
                <LargeNumpad 
                  value={inputValue} 
                  onChange={setInputValue} 
                  maxLength={getMaxInputLength()}
                />
              </div>

              {/* CONTROLS */}
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setStep('identity')} 
                  className="flex-1 py-3.5 sm:py-4 rounded-2xl border-2 border-slate-200 font-bold text-slate-600 hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center gap-2 transition-all text-sm sm:text-base"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
                  <span>{t('Back')}</span>
                </button>

                <LargeTouchButton 
                  onClick={handleDetailsSubmit} 
                  className="flex-[2] bg-[#008080] hover:bg-[#006666] text-white py-3.5 sm:py-4 rounded-2xl font-black text-base sm:text-lg flex items-center justify-center gap-2 shadow-md disabled:opacity-40"
                  disabled={isContinueDisabled()}
                >
                  <span>{t('Continue')}</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
                </LargeTouchButton>
              </div>
            </motion.div>
          )}

<<<<<<< HEAD
=======
          {/* STEP 3: CONSENT OPTIONS */}
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
          {step === 'consent' && (
            <motion.div
              key="consent"
<<<<<<< HEAD
              variants={pageVariants}
              initial="initial"
              animate="in"
              exit="out"
              className="h-full flex flex-col justify-between max-w-3xl mx-auto w-full"
            >
              <div className="flex-1 flex flex-col justify-center gap-4 min-h-0">
                <ToggleSwitch
                  icon={Mic}
                  label={t('consent.toggle.voice')}
                  checked={consentVoice}
                  onChange={(v) => { setConsentVoice(v); setInteractedVoice(true); }}
                  onExplain={() => speakRef.current(t('consent.spoken.explainVoice'), { language })}
                />
                <ToggleSwitch
                  icon={FileText}
                  label={t('consent.toggle.docs')}
                  checked={consentDocs}
                  onChange={(v) => { setConsentDocs(v); setInteractedDocs(true); }}
                  onExplain={() => speakRef.current(t('consent.spoken.explainDocs'), { language })}
                />
                <ToggleSwitch
                  icon={Share2}
                  label={t('consent.toggle.share')}
                  checked={consentShare}
                  onChange={(v) => { setConsentShare(v); setInteractedShare(true); }}
                  onExplain={() => speakRef.current(t('consent.spoken.explainShare'), { language })}
                />
              </div>

              <div className="flex justify-between items-center gap-4 pt-4 mt-2 flex-none border-t border-hairline/40">
                <LargeTouchButton variant="secondary" onClick={() => setStep('details')} className="w-44 py-3 lg:py-4 text-xl !min-h-[64px] lg:!min-h-[80px] !rounded-2xl">
                  {t('common.back')}
                </LargeTouchButton>
                <LargeTouchButton onClick={handleConsentSubmit} className="flex-1 max-w-sm py-3 lg:py-4 text-xl shadow-lg !min-h-[64px] lg:!min-h-[80px] !rounded-2xl" disabled={!canContinue}>
                  <span>{t('consent.agree')}</span>
                  <ArrowRight size={24} className="ml-2" />
=======
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.25 }}
              className="bg-white/95 backdrop-blur-md rounded-3xl p-5 sm:p-8 shadow-md border border-slate-200 flex flex-col max-w-3xl mx-auto w-full"
            >
              <div className="text-center mb-4 sm:mb-6">
                <h1 className="text-2xl sm:text-3xl font-black text-slate-800">{t('Consent & Privacy Permissions')}</h1>
                <p className="text-slate-500 font-medium text-xs sm:text-sm mt-1">
                  {t('Please enable all permissions to proceed with your AI checkup')}
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:gap-4 w-full mb-6">
                <ToggleSwitch 
                  icon={Mic}
                  label={t("Record voice for automatic doctor notes")}
                  checked={consentVoice}
                  onChange={(val) => { setConsentVoice(val); setInteractedVoice(true); }}
                  onExplain={() => speak(t("We record your voice during consultation to draft your clinical report."), language)}
                />

                <ToggleSwitch 
                  icon={FileText}
                  label={t("Scan and store old prescriptions & reports")}
                  checked={consentDocs}
                  onChange={(val) => { setConsentDocs(val); setInteractedDocs(true); }}
                  onExplain={() => speak(t("Your documents will be stored securely for your assigned doctor to review."), language)}
                />

                <ToggleSwitch 
                  icon={Share2}
                  label={t("Share health profile with hospital doctors")}
                  checked={consentShare}
                  onChange={(val) => { setConsentShare(val); setInteractedShare(true); }}
                  onExplain={() => speak(t("Data is strictly shared only with verified medical staff."), language)}
                />
              </div>

              {/* FINAL ACTION AREA */}
              <div className="flex flex-col items-center gap-2 pt-3 border-t border-slate-100">
                <LargeTouchButton 
                  onClick={handleConsentSubmit} 
                  className="w-full bg-[#008080] hover:bg-[#006666] active:bg-[#004d4d] text-white py-4 sm:py-5 rounded-2xl font-black text-base sm:text-xl flex items-center justify-center gap-3 shadow-lg transition-all disabled:opacity-40"
                  disabled={!canContinue}
                >
                  <Lock className="w-5 h-5 sm:w-6 sm:h-6" />
                  <span>{t('I Understand and Agree')}</span>
                  <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
                </LargeTouchButton>

                {!allInteracted && (
                  <motion.p 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }} 
                    className="text-[11px] sm:text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full text-center"
                  >
                    {t('Please toggle all 3 options above to continue')}
                  </motion.p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="w-full max-w-5xl mx-auto text-center shrink-0 pt-1">
        <p className="text-[10px] sm:text-xs font-semibold text-slate-400 flex items-center justify-center gap-1">
          <Lock className="w-3 h-3 text-[#008080]" />
          <span>AyushPod Health Kiosk System • HIPAA & ABDM Compliant Data Security</span>
        </p>
      </footer>

    </div>
  );
}