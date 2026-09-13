"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../store/useSessionStore';
import { useAvatar } from '../../store/useAvatar';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { LargeNumpad } from '../../components/LargeNumpad';
import { ToggleSwitch } from '../../components/ToggleSwitch';
import { QrCode, CreditCard, UserPlus, Mic, FileText, Share2, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { cn } from '../../components/LargeTouchButton';
import { useT } from '../../i18n';

type Step = 'identity' | 'details' | 'consent';
type IdType = 'abha' | 'aadhaar' | 'new' | null;

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

  const handleIdentitySelect = (type: IdType) => {
    setIdType(type);
    setInputValue('');
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    if (idType === 'new') {
      updatePatientInfo({ age: parseInt(inputValue) || 30, name: 'Guest Patient' });
    } else if (idType === 'abha') {
      updatePatientInfo({ abhaId: inputValue, name: 'Guest Patient' });
    } else {
      updatePatientInfo({ id: inputValue, name: 'Guest Patient' });
    }
    setStep('consent');
  };

  const handleConsentSubmit = () => {
    setConsentStatus(true);
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
          {step === 'identity' && (
            <motion.div
              key="identity"
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

          {step === 'details' && (
            <motion.div
              key="details"
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
                </LargeTouchButton>
              </div>
            </motion.div>
          )}

          {step === 'consent' && (
            <motion.div
              key="consent"
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
                </LargeTouchButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}