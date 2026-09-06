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
import { Fingerprint, CreditCard, UserPlus, Mic, FileText, Share2, ArrowRight } from 'lucide-react';

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
  
  // Tracking if user interacted with toggles (to enforce explicit choice)
  const [interactedVoice, setInteractedVoice] = useState(false);
  const [interactedDocs, setInteractedDocs] = useState(false);
  const [interactedShare, setInteractedShare] = useState(false);

  const allInteracted = interactedVoice && interactedDocs && interactedShare;
  const canContinue = allInteracted && consentVoice && consentDocs && consentShare;

  // Initial prompt
  useEffect(() => {
    if (step === 'identity') {
      speak("How would you like to register today?", language);
    } else if (step === 'details') {
      speak("Please enter your details using the keypad.", language);
    } else if (step === 'consent') {
      speak("We need your permission to collect some data to help your doctor. Please review the options.", language);
    }
  }, [step, language, speak]);

  const handleIdentitySelect = (type: IdType) => {
    setIdType(type);
    setInputValue('');
    setStep('details');
  };

  const handleDetailsSubmit = () => {
    // Stub save patient info
    updatePatientInfo({ id: inputValue, name: "Guest Patient", age: parseInt(inputValue) || 30 });
    setStep('consent');
  };

  const handleConsentSubmit = () => {
    setConsentStatus(true);
    speak("Thank you. Moving to the next step.", language);
    router.push('/complaint');
  };

  const pageVariants = {
    initial: { opacity: 0, x: 100 },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: -100 }
  };

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col pt-12 pb-8 px-12 overflow-hidden overflow-y-auto">
      
      <div className="max-w-4xl mx-auto w-full h-full flex flex-col">
        <AnimatePresence mode="wait">
          
          {/* STEP 1: IDENTITY */}
          {step === 'identity' && (
            <motion.div 
              key="identity"
              variants={pageVariants}
              initial="initial" animate="in" exit="out"
              className="flex-1 flex flex-col items-center justify-center gap-12"
            >
              <h1 className="text-5xl font-bold text-slate-800 text-center">How would you like to register?</h1>
              
              <div className="grid grid-cols-3 gap-8 w-full mt-8">
                <IconTile 
                  icon={Fingerprint} 
                  label="I have an ABHA ID" 
                  onClick={() => handleIdentitySelect('abha')}
                  className="h-72"
                />
                <IconTile 
                  icon={CreditCard} 
                  label="I have Aadhaar" 
                  onClick={() => handleIdentitySelect('aadhaar')}
                  className="h-72"
                />
                <IconTile 
                  icon={UserPlus} 
                  label="New Patient" 
                  onClick={() => handleIdentitySelect('new')}
                  className="h-72"
                />
              </div>
            </motion.div>
          )}

          {/* STEP 2: DETAILS (STUBBED TO NUMPAD) */}
          {step === 'details' && (
            <motion.div 
              key="details"
              variants={pageVariants}
              initial="initial" animate="in" exit="out"
              className="flex-1 flex flex-col items-center justify-center gap-8 w-full"
            >
              <h1 className="text-5xl font-bold text-slate-800 text-center">
                {idType === 'new' ? 'Enter your Age' : `Enter your ${idType === 'abha' ? 'ABHA ID' : 'Aadhaar'} Number`}
              </h1>
              
              <div className="w-full max-w-lg bg-white rounded-3xl p-6 shadow-sm border-2 border-slate-200 text-center h-24 flex items-center justify-center">
                <span className="text-5xl font-mono tracking-widest text-slate-800">
                  {inputValue || (idType === 'new' ? '0' : 'XXXX-XXXX-XXXX')}
                </span>
              </div>

              <div className="w-full max-w-lg">
                <LargeNumpad 
                  value={inputValue} 
                  onChange={setInputValue} 
                  maxLength={14}
                />
              </div>

              <div className="flex gap-6 mt-8">
                <LargeTouchButton variant="secondary" onClick={() => setStep('identity')} className="w-64">
                  Back
                </LargeTouchButton>
                <LargeTouchButton onClick={handleDetailsSubmit} className="w-64" disabled={inputValue.length === 0}>
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
              className="flex-1 flex flex-col gap-8 w-full py-8"
            >
              <div className="text-center mb-4">
                <h1 className="text-5xl font-bold text-slate-800">Data Collection Consent</h1>
                <p className="text-2xl text-slate-600 mt-4">Please review and enable the permissions below.</p>
              </div>

              <div className="flex flex-col gap-6 max-w-3xl mx-auto w-full">
                <ToggleSwitch 
                  icon={Mic}
                  label="Record my voice to write notes"
                  checked={consentVoice}
                  onChange={(val) => { setConsentVoice(val); setInteractedVoice(true); }}
                  onExplain={() => speak("We will record your voice to automatically write your symptoms for the doctor. Your voice is not saved permanently.", language)}
                />
                <ToggleSwitch 
                  icon={FileText}
                  label="Scan and save my old reports"
                  checked={consentDocs}
                  onChange={(val) => { setConsentDocs(val); setInteractedDocs(true); }}
                  onExplain={() => speak("If you scan old prescriptions, we will save them so the doctor can review your history.", language)}
                />
                <ToggleSwitch 
                  icon={Share2}
                  label="Share my data with the hospital"
                  checked={consentShare}
                  onChange={(val) => { setConsentShare(val); setInteractedShare(true); }}
                  onExplain={() => speak("Your information will be shared with the hospital staff to prepare your medical file.", language)}
                />
              </div>

              <div className="mt-auto flex justify-center pt-8">
                <LargeTouchButton 
                  onClick={handleConsentSubmit} 
                  className="w-[32rem] py-8"
                  disabled={!canContinue}
                >
                  <span className="text-3xl">I Understand and Agree</span>
                  <ArrowRight size={36} />
                </LargeTouchButton>
              </div>
              
              {!allInteracted && (
                <p className="text-center text-xl text-red-500 font-medium">
                  Please interact with all toggles to continue.
                </p>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </div>
    </div>
  );
}
