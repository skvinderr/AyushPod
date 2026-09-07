"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSessionStore } from '../../store/useSessionStore';
import { useAvatar } from '../../store/useAvatar';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { IconTile } from '../../components/IconTile';
import { LargeNumpad } from '../../components/LargeNumpad';
import { ToggleSwitch } from '../../components/ToggleSwitch';
import { StepIndicator } from '../../components/StepIndicator';
import { Fingerprint, CreditCard, UserPlus, Mic, FileText, Share2, ArrowRight } from 'lucide-react';
import { cn } from '../../components/LargeTouchButton';

type Step = 'identity' | 'details' | 'consent';
type IdType = 'abha' | 'aadhaar' | 'new' | null;

export default function ConsentScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setConsentStatus, updatePatientInfo } = useSessionStore();
  
  const [step, setStep] = useState<Step>('identity');
  const [idType, setIdType] = useState<IdType>(null);
  const [inputValue, setInputValue] = useState('');
  
  // Consent toggles state
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
      speak("How would you like to identify yourself?", { language, gesture: 'present', stage: true });
    } else if (step === 'details') {
      speak("Please enter your details using the keypad.", { language, gesture: 'point-down', stage: true });
    } else if (step === 'consent') {
      speak("Please review the data collection terms.", { language, gesture: 'present', stage: true });
    }
  }, [step, language, speak]);

  const handleIdentitySelect = (type: IdType) => {
    setIdType(type);
    setInputValue('');
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    updatePatientInfo({ id: inputValue, name: "Guest Patient", age: parseInt(inputValue) || 30 });
    setStep('consent');
  };

  const handleConsentSubmit = () => {
    setConsentStatus(true);
    speak("Thank you.", language);
    router.push('/complaint');
  };

  const pageVariants = {
    initial: { opacity: 0, y: 20 },
    in: { opacity: 1, y: 0 },
    out: { opacity: 0, y: -20 }
  };

  const getStepNumber = () => {
    if (step === 'identity') return 1;
    if (step === 'details') return 2;
    return 3;
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pb-12">
      
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-4xl bg-surface rounded-[2.5rem] shadow-[var(--shadow-lift)] border border-hairline p-12 flex flex-col min-h-[70vh]"
      >

        <StepIndicator
          currentStep={getStepNumber()}
          totalSteps={4} // Total steps in app: 1.ID/Consent 2.Complaint 3.Interview 4.Scan
          title={step === 'consent' ? 'Review & Confirm' : 'Patient Identification'}
        />

        <div className="flex-1 flex flex-col">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: IDENTITY */}
            {step === 'identity' && (
              <motion.div 
                key="identity"
                variants={pageVariants}
                initial="initial" animate="in" exit="out"
                className="flex flex-col gap-8 flex-1"
              >
                <p className="text-2xl text-muted">Choose how you would like to identify yourself.</p>
                
                <div className="flex flex-col gap-6 w-full mt-4 flex-1">
                  
                  {/* Primary — QR / ABHA scan */}
                  <button
                    onClick={() => handleIdentitySelect('abha')}
                    className="flex items-center gap-8 w-full p-8 rounded-[1.75rem] border-4 border-dashed border-primary/40 bg-primary-soft/50 hover:bg-primary-soft transition-colors"
                  >
                    <div className="bg-primary text-white p-4 rounded-xl shadow-[0_12px_26px_-14px_rgba(31,122,110,0.9)]">
                      <Fingerprint size={48} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-3xl font-bold text-ink">Scan ABHA ID or QR Code</span>
                      <span className="text-xl text-muted mt-1">Place your phone or ID near the scanner</span>
                    </div>
                  </button>

                  <div className="flex items-center justify-center py-4">
                    <span className="text-muted font-semibold tracking-widest uppercase">OR</span>
                  </div>

                  {/* Manual entry */}
                  <button
                    onClick={() => handleIdentitySelect('aadhaar')}
                    className="flex items-center gap-8 w-full p-8 rounded-[1.75rem] border-2 border-hairline bg-surface hover:bg-surface-warm transition-colors"
                  >
                    <div className="bg-surface-warm text-muted p-4 rounded-xl">
                      <CreditCard size={48} />
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-3xl font-bold text-ink">Enter Aadhaar Details Manually</span>
                      <span className="text-xl text-muted mt-1">If you don't have a QR code</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleIdentitySelect('new')}
                    className="flex items-center gap-8 w-full p-6 rounded-[1.75rem] border-2 border-transparent hover:border-hairline bg-transparent transition-colors mt-auto"
                  >
                    <div className="bg-surface-warm text-muted p-3 rounded-xl">
                      <UserPlus size={32} />
                    </div>
                    <span className="text-2xl font-bold text-muted">Register as a New Patient</span>
                  </button>
                  
                </div>
              </motion.div>
            )}

            {/* STEP 2: DETAILS */}
            {step === 'details' && (
              <motion.div
                key="details"
                variants={pageVariants}
                initial="initial" animate="in" exit="out"
                className="flex-1 flex flex-col items-center justify-center gap-8"
              >
                <div className="w-full bg-surface-warm rounded-[1.5rem] p-8 border-2 border-hairline text-center h-28 flex items-center justify-center mb-4">
                  <span className={cn(
                    "text-5xl font-mono tracking-widest",
                    inputValue ? "text-ink" : "text-muted/50"
                  )}>
                    {inputValue || (idType === 'new' ? 'Enter Age' : 'Enter ID Number')}
                  </span>
                </div>

                <div className="w-full max-w-lg">
                  <LargeNumpad value={inputValue} onChange={setInputValue} maxLength={14} />
                </div>

                <div className="flex gap-6 mt-8 w-full">
                  <LargeTouchButton variant="secondary" onClick={() => setStep('identity')} className="flex-1 py-6">
                    Back
                  </LargeTouchButton>
                  <LargeTouchButton onClick={handleDetailsSubmit} className="flex-1 py-6" disabled={inputValue.length === 0}>
                    Continue
                  </LargeTouchButton>
                </div>
              </motion.div>
            )}

            {/* STEP 3: CONSENT */}
            {step === 'consent' && (
              <motion.div 
                key="consent"
                variants={pageVariants}
                initial="initial" animate="in" exit="out"
                className="flex-1 flex flex-col gap-6"
              >
                <p className="text-2xl text-muted mb-2">Please check and confirm data permissions.</p>

                <div className="flex flex-col gap-4">
                  <ToggleSwitch 
                    icon={Mic}
                    label="Record my voice to write notes"
                    checked={consentVoice}
                    onChange={(val) => { setConsentVoice(val); setInteractedVoice(true); }}
                    onExplain={() => speak("We will record your voice.", language)}
                  />
                  <ToggleSwitch 
                    icon={FileText}
                    label="Scan and save my old reports"
                    checked={consentDocs}
                    onChange={(val) => { setConsentDocs(val); setInteractedDocs(true); }}
                    onExplain={() => speak("We will save your documents.", language)}
                  />
                  <ToggleSwitch 
                    icon={Share2}
                    label="Share my data with the hospital"
                    checked={consentShare}
                    onChange={(val) => { setConsentShare(val); setInteractedShare(true); }}
                    onExplain={() => speak("Data will be shared.", language)}
                  />
                </div>

                <div className="mt-auto flex justify-between items-center pt-8">
                  <LargeTouchButton variant="secondary" onClick={() => setStep('details')} className="w-48 py-6">
                    Back
                  </LargeTouchButton>
                  <LargeTouchButton 
                    onClick={handleConsentSubmit} 
                    className="w-72 py-6"
                    disabled={!canContinue}
                  >
                    Confirm <ArrowRight size={28} className="ml-2" />
                  </LargeTouchButton>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
