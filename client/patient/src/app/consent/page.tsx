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

type Step = 'identity' | 'details' | 'consent';
type IdType = 'abha' | 'aadhaar' | 'new' | null;

const SUB_STEPS = ['Identity', 'Details', 'Privacy'];

export default function ConsentScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setConsentStatus, updatePatientInfo } = useSessionStore();

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
      speak('How would you like to tell us who you are?', { language, gesture: 'present', stage: true });
    } else if (step === 'details') {
      speak('Please type your number using the big keypad.', { language, gesture: 'point-down', stage: true });
    } else {
      speak('These are your privacy choices. Turn on the ones you agree to.', { language, gesture: 'present', stage: true });
    }
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
    speak('Thank you.', language);
    router.push('/complaint');
  };

  const subIdx = step === 'identity' ? 0 : step === 'details' ? 1 : 2;
  const heading = step === 'identity' ? "Let's get you registered" : step === 'details' ? 'Enter your details' : 'Your privacy choices';
  const sub = step === 'identity'
    ? 'Choose any one — whatever you have with you.'
    : step === 'details'
    ? (idType === 'new' ? 'How old are you?' : 'Type the number on your card.')
    : 'You are in control of your information.';

  const pageVariants = { initial: { opacity: 0, y: 18 }, in: { opacity: 1, y: 0 }, out: { opacity: 0, y: -18 } };

  return (
    <div className="h-full flex flex-col">
      {/* header */}
      <div className="pb-4">
        <div className="flex items-center gap-2.5 mb-3">
          {SUB_STEPS.map((label, i) => (
            <React.Fragment key={label}>
              <div className={cn(
                'flex items-center gap-2 px-3.5 py-1.5 rounded-full text-base font-semibold transition-colors',
                i === subIdx ? 'bg-primary text-white' : i < subIdx ? 'bg-primary-soft text-primary-deep' : 'bg-surface-warm text-muted',
              )}>
                <span className="grid place-items-center w-5 h-5 rounded-full bg-white/25 text-sm">
                  {i < subIdx ? <Check size={13} strokeWidth={3} /> : i + 1}
                </span>
                {label}
              </div>
              {i < SUB_STEPS.length - 1 && <ChevronRight size={18} className="text-hairline" />}
            </React.Fragment>
          ))}
        </div>
        <h1 className="text-5xl font-extrabold text-ink tracking-tight">{heading}</h1>
        <p className="text-2xl text-muted mt-1.5">{sub}</p>
      </div>

      {/* body */}
      <div className="flex-1 min-h-0">
        <AnimatePresence mode="wait">
          {step === 'identity' && (
            <motion.div key="identity" variants={pageVariants} initial="initial" animate="in" exit="out" className="flex flex-col gap-4 h-full justify-center max-w-3xl">
              <button
                onClick={() => handleIdentitySelect('abha')}
                className="group flex items-center gap-7 w-full p-7 rounded-[1.75rem] bg-primary text-white shadow-[var(--card-pop)] hover:brightness-105 active:scale-[0.99] transition"
              >
                <div className="bg-white/20 p-4 rounded-2xl"><QrCode size={52} /></div>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-3xl font-bold">Scan my ABHA / QR code</span>
                  <span className="text-xl text-white/85 mt-1">Hold your phone or health card up to the scanner</span>
                </div>
                <ChevronRight size={40} className="opacity-70 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleIdentitySelect('aadhaar')}
                className="group flex items-center gap-7 w-full p-6 rounded-[1.75rem] bg-surface border-2 border-hairline hover:border-primary/50 hover:bg-surface-warm active:scale-[0.99] transition"
              >
                <div className="bg-primary-soft text-primary p-4 rounded-2xl"><CreditCard size={44} /></div>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-2xl font-bold text-ink">Enter my Aadhaar number</span>
                  <span className="text-lg text-muted mt-0.5">Type it on the next screen</span>
                </div>
                <ChevronRight size={34} className="text-muted group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => handleIdentitySelect('new')}
                className="group flex items-center gap-7 w-full p-6 rounded-[1.75rem] bg-surface border-2 border-hairline hover:border-primary/50 hover:bg-surface-warm active:scale-[0.99] transition"
              >
                <div className="bg-primary-soft text-primary p-4 rounded-2xl"><UserPlus size={44} /></div>
                <div className="flex flex-col text-left flex-1">
                  <span className="text-2xl font-bold text-ink">I'm new — register me</span>
                  <span className="text-lg text-muted mt-0.5">No card needed, just a few questions</span>
                </div>
                <ChevronRight size={34} className="text-muted group-hover:translate-x-1 transition-transform" />
              </button>
            </motion.div>
          )}

          {step === 'details' && (
            <motion.div key="details" variants={pageVariants} initial="initial" animate="in" exit="out" className="h-full flex flex-col items-center justify-center gap-6">
              <div className="w-full max-w-lg bg-surface rounded-[1.5rem] p-7 border-2 border-hairline text-center h-24 flex items-center justify-center">
                <span className={cn('text-5xl font-bold tracking-[0.2em]', inputValue ? 'text-ink' : 'text-muted/50')}>
                  {inputValue || (idType === 'new' ? 'Age' : 'ID number')}
                </span>
              </div>
              <div className="w-full max-w-lg">
                <LargeNumpad value={inputValue} onChange={setInputValue} maxLength={14} />
              </div>
              <div className="flex gap-5 w-full max-w-lg">
                <LargeTouchButton variant="secondary" onClick={() => setStep('identity')} className="flex-1 py-5">Back</LargeTouchButton>
                <LargeTouchButton onClick={handleDetailsSubmit} className="flex-1 py-5" disabled={inputValue.length === 0}>Continue</LargeTouchButton>
              </div>
            </motion.div>
          )}

          {step === 'consent' && (
            <motion.div key="consent" variants={pageVariants} initial="initial" animate="in" exit="out" className="h-full flex flex-col max-w-3xl mx-auto justify-center gap-4">
              <ToggleSwitch icon={Mic} label="Record my voice to write notes" checked={consentVoice}
                onChange={(v) => { setConsentVoice(v); setInteractedVoice(true); }}
                onExplain={() => speak('We record your voice only to write down what you say. It stays private.', language)} />
              <ToggleSwitch icon={FileText} label="Scan and save my old reports" checked={consentDocs}
                onChange={(v) => { setConsentDocs(v); setInteractedDocs(true); }}
                onExplain={() => speak('We save photos of your old reports so the doctor can see them.', language)} />
              <ToggleSwitch icon={Share2} label="Share my details with the doctor" checked={consentShare}
                onChange={(v) => { setConsentShare(v); setInteractedShare(true); }}
                onExplain={() => speak('Your details are shared only with the doctor who will see you.', language)} />

              <div className="flex justify-between items-center pt-4">
                <LargeTouchButton variant="secondary" onClick={() => setStep('details')} className="w-44 py-5">Back</LargeTouchButton>
                <LargeTouchButton onClick={handleConsentSubmit} className="w-72 py-5" disabled={!canContinue}>
                  I agree, continue <ArrowRight size={26} className="ml-2" />
                </LargeTouchButton>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
