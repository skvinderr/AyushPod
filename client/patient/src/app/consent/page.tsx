"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../store/useSessionStore';
import { useAvatar } from '../../store/useAvatar';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { LargeNumpad } from '../../components/LargeNumpad';
import { ToggleSwitch } from '../../components/ToggleSwitch';
import { QrCode, CreditCard, UserPlus, Mic, FileText, Share2, ArrowRight, ChevronRight, Check } from 'lucide-react';
import { cn } from '../../components/LargeTouchButton';
import { useT } from '../../i18n';

type Step = 'identity' | 'details' | 'consent';
type IdType = 'abha' | 'aadhaar' | 'new' | null;

const SUB_STEP_KEYS = ['consent.step.identity', 'consent.step.details', 'consent.step.privacy'];

export default function ConsentScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setConsentStatus, updatePatientInfo } = useSessionStore();
  const { t } = useT();

  const [step, setStep] = useState<Step>('identity');
  const [idType, setIdType] = useState<IdType>(null);
  const [inputValue, setInputValue] = useState('');

  const [consentVoice, setConsentVoice] = useState(false);
  const [consentDocs, setConsentDocs] = useState(false);
  const [consentShare, setConsentShare] = useState(false);
  const [interactedVoice, setInteractedVoice] = useState(false);
  const [interactedDocs, setInteractedDocs] = useState(false);
  const [interactedShare, setInteractedShare] = useState(false);

  const allInteracted = interactedVoice && interactedDocs && interactedShare;
  const canContinue = allInteracted && consentVoice && consentDocs && consentShare;

  useEffect(() => {
    if (step === 'identity') {
      speak(t('consent.spoken.identity'), { language, gesture: 'present', stage: true });
    } else if (step === 'details') {
      speak(t('consent.spoken.details'), { language, gesture: 'point-down', stage: true });
    } else {
      speak(t('consent.spoken.privacy'), { language, gesture: 'present', stage: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, language, speak]);

  const handleIdentitySelect = (type: IdType) => {
    setIdType(type);
    setInputValue('');
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    updatePatientInfo({ id: inputValue, name: 'Guest Patient', age: parseInt(inputValue) || 30 });
    setStep('consent');
  };

  const handleConsentSubmit = () => {
    setConsentStatus(true);
    speak(t('consent.spoken.thankYou'), language);
    router.push('/complaint');
  };

  const subIdx = step === 'identity' ? 0 : step === 'details' ? 1 : 2;
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

  const pageVariants = { initial: { opacity: 0, y: 18 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -18 } };

  return (
    <div className="h-full flex flex-col">
      {/* header */}
      <div className="pb-3 shrink-0">
        <div className="flex items-center gap-2 mb-2">
          {SUB_STEP_KEYS.map((labelKey, i) => (
            <React.Fragment key={labelKey}>
              <div className={cn(
                'flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-colors',
                i === subIdx ? 'bg-primary text-white' : i < subIdx ? 'bg-primary-soft text-primary-deep' : 'bg-surface-warm text-muted',
              )}>
                <span className="grid place-items-center w-4 h-4 rounded-full bg-white/25 text-xs">
                  {i < subIdx ? <Check size={11} strokeWidth={3} /> : i + 1}
                </span>
                {t(labelKey)}
              </div>
              {i < SUB_STEP_KEYS.length - 1 && <ChevronRight size={14} className="text-hairline" />}
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-2xl sm:text-3xl leading-tight font-extrabold text-ink tracking-tight">{heading}</h1>
        <p className="text-sm sm:text-base leading-snug text-muted mt-0.5">{sub}</p>
      </div>

      {/* body */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1">
        <AnimatePresence mode="wait">
          {step === 'identity' && (
            <motion.div key="identity" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-3 h-full justify-center max-w-2xl mx-auto">
              <button
                onClick={() => handleIdentitySelect('abha')}
                className="group flex items-center gap-4 w-full p-3.5 sm:p-4 rounded-2xl bg-primary text-white shadow-sm hover:brightness-105 active:scale-[0.99] transition"
              >
                <div className="bg-white/20 p-2.5 rounded-xl"><QrCode size={32} /></div>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-lg sm:text-xl font-bold">{t('consent.abha.title')}</span>
                  <span className="text-xs sm:text-sm text-white/85 mt-0.5">{t('consent.abha.sub')}</span>
                </div>
                <ChevronRight size={24} className="opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleIdentitySelect('aadhaar')}
                className="group flex items-center gap-4 w-full p-3.5 sm:p-4 rounded-2xl bg-surface border-2 border-hairline hover:border-primary/50 hover:bg-surface-warm active:scale-[0.99] transition"
              >
                <div className="bg-primary-soft text-primary p-2.5 rounded-xl"><CreditCard size={30} /></div>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-base sm:text-lg font-bold text-ink">{t('consent.aadhaar.title')}</span>
                  <span className="text-xs sm:text-sm text-muted mt-0.5">{t('consent.aadhaar.sub')}</span>
                </div>
                <ChevronRight size={22} className="text-muted group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleIdentitySelect('new')}
                className="group flex items-center gap-4 w-full p-3.5 sm:p-4 rounded-2xl bg-surface border-2 border-hairline hover:border-primary/50 hover:bg-surface-warm active:scale-[0.99] transition"
              >
                <div className="bg-primary-soft text-primary p-2.5 rounded-xl"><UserPlus size={30} /></div>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-base sm:text-lg font-bold text-ink">{t('consent.new.title')}</span>
                  <span className="text-xs sm:text-sm text-muted mt-0.5">{t('consent.new.sub')}</span>
                </div>
                <ChevronRight size={22} className="text-muted group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div key="details" variants={pageVariants} initial="initial" animate="in" exit="out" className="h-full flex flex-col items-center justify-center gap-4 max-w-sm mx-auto">
              <div className="w-full bg-surface rounded-2xl p-3 border-2 border-hairline text-center h-14 flex items-center justify-center">
                <span className={cn('text-2xl sm:text-3xl font-bold tracking-widest', inputValue ? 'text-ink' : 'text-muted/40')}>
                  {inputValue || (idType === 'new' ? t('consent.placeholder.age') : t('consent.placeholder.id'))}
                </span>
              </div>
              <div className="w-full">
                <LargeNumpad value={inputValue} onChange={setInputValue} maxLength={14} />
              </div>
              <div className="flex gap-3 w-full">
                <LargeTouchButton variant="secondary" onClick={() => setStep('identity')} className="flex-1 py-2.5 min-h-[44px] text-base">{t('common.back')}</LargeTouchButton>
                <LargeTouchButton onClick={handleDetailsSubmit} className="flex-1 py-2.5 min-h-[44px] text-base" disabled={inputValue.length === 0}>{t('common.continue')}</LargeTouchButton>
              </div>
            </motion.div>
          )}

          {step === 'consent' && (
            <motion.div key="consent" variants={pageVariants} initial="initial" animate="in" exit="out" className="h-full flex flex-col max-w-2xl mx-auto justify-center gap-3">
              <ToggleSwitch icon={Mic} label={t('consent.toggle.voice')} checked={consentVoice}
                onChange={(v) => { setConsentVoice(v); setInteractedVoice(true); }}
                onExplain={() => speak(t('consent.spoken.explainVoice'), language)} />
              <ToggleSwitch icon={FileText} label={t('consent.toggle.docs')} checked={consentDocs}
                onChange={(v) => { setConsentDocs(v); setInteractedDocs(true); }}
                onExplain={() => speak(t('consent.spoken.explainDocs'), language)} />
              <ToggleSwitch icon={Share2} label={t('consent.toggle.share')} checked={consentShare}
                onChange={(v) => { setConsentShare(v); setInteractedShare(true); }}
                onExplain={() => speak(t('consent.spoken.explainShare'), language)} />

              <div className="flex justify-between items-center pt-2">
                <LargeTouchButton variant="secondary" onClick={() => setStep('details')} className="w-36 py-2.5 min-h-[44px] text-base">{t('common.back')}</LargeTouchButton>
                <LargeTouchButton onClick={handleConsentSubmit} className="w-52 py-2.5 min-h-[44px] text-base" disabled={!canContinue}>
                  {t('consent.agree')} <ArrowRight size={20} className="ml-1.5" />
                </LargeTouchButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
