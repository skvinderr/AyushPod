"use client";

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { useVoiceInput } from '../../lib/useVoiceInput';
import { interviewTree } from '../../lib/interviewTree';
import { IconTile } from '../../components/IconTile';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { Mic, ArrowRight, ArrowLeft } from 'lucide-react';
import { cn } from '../../components/LargeTouchButton';

export default function InterviewScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, chiefComplaint, setRedFlag, redFlag, updateHistoryAnswer } = useSessionStore();
  const { isListening, startListening } = useVoiceInput();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isConfirming, setIsConfirming] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout>(null);

  // If the user selected the Voice Narration tile, skip structured flow
  const isVoiceNarration = chiefComplaint === 'voice_narration';

  // Fallback to 'general' if the category isn't defined in the tree
  const questions = interviewTree[chiefComplaint || 'general'] || interviewTree['general'];
  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Speak the question on mount or index change
  useEffect(() => {
    if (isVoiceNarration) {
      speak('Please describe your problem in detail.', { language, gesture: 'present', stage: true });
    } else if (!isConfirming && currentQuestion) {
      speak(currentQuestion.text, { language, gesture: 'present', stage: true });
    }
  }, [currentIndex, isConfirming, currentQuestion, isVoiceNarration, speak, language]);

  const handleOptionSelect = (optionId: string, confirmationText: string, triggersRedFlag?: boolean) => {
    setSelectedOption(optionId);
    setIsConfirming(true);

    updateHistoryAnswer(currentQuestion.id, optionId);
    if (triggersRedFlag) setRedFlag(true);

    speak(confirmationText, language);

    timeoutRef.current = setTimeout(() => {
      if (triggersRedFlag || redFlag) {
        router.push('/urgent');
      } else if (currentIndex < questions.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsConfirming(false);
        setSelectedOption(null);
      } else {
        router.push('/scan');
      }
    }, 3500);
  };

  const handleVoiceNarrationComplete = () => {
    speak('Thank you. I have recorded your symptoms.', language);
    router.push('/scan');
  };

  // ---- Voice narration path ----
  if (isVoiceNarration) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-10">
        <div className="text-center">
          <h1 className="text-5xl font-extrabold text-ink tracking-tight">Tell me what's wrong</h1>
          <p className="text-2xl text-muted mt-2">Speak in your own words — take your time.</p>
        </div>

        <motion.button
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={startListening}
          className={cn(
            'w-80 h-80 rounded-full flex flex-col items-center justify-center gap-5 shadow-[var(--card-pop)] transition-all duration-300',
            isListening ? 'bg-primary text-white animate-pulse border-8 border-primary/30' : 'bg-surface border-8 border-hairline text-primary',
          )}
        >
          <Mic size={96} />
          <span className="text-3xl font-bold">{isListening ? 'Listening…' : 'Tap to speak'}</span>
        </motion.button>

        <LargeTouchButton onClick={handleVoiceNarrationComplete} className="w-80 py-5">
          <span className="text-2xl">Done</span>
          <ArrowRight size={30} className="ml-2" />
        </LargeTouchButton>
      </div>
    );
  }

  // ---- Structured interview path ----
  return (
    <div className="h-full flex flex-col">
      {/* per-question progress dots */}
      <div className="flex items-center gap-2.5 pb-2">
        {questions.map((_, idx) => (
          <div
            key={idx}
            className={cn(
              'h-2.5 rounded-full transition-all duration-300',
              idx === currentIndex ? 'w-10 bg-primary' : idx < currentIndex ? 'w-2.5 bg-primary/50' : 'w-2.5 bg-hairline',
            )}
          />
        ))}
        <span className="ml-2 text-lg font-semibold text-muted">
          Question {currentIndex + 1} of {questions.length}
        </span>
      </div>

      <div className="flex-1 min-h-0 flex flex-col justify-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full flex flex-col items-center gap-6"
          >
            <h1 className="text-[2.5rem] font-extrabold text-ink text-center leading-tight tracking-tight max-w-4xl">
              {currentQuestion.text}
            </h1>

            <div className={cn('grid gap-5 w-full', currentQuestion.options.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
              {currentQuestion.options.map((opt) => (
                <IconTile
                  key={opt.id}
                  icon={opt.icon}
                  label={opt.label}
                  selected={selectedOption === opt.id}
                  onClick={() => !isConfirming && handleOptionSelect(opt.id, opt.confirmationText, opt.triggersRedFlag)}
                  className={cn(currentQuestion.options.length >= 4 ? 'h-40' : 'h-52', isConfirming && selectedOption !== opt.id ? 'opacity-50 grayscale' : '')}
                  disabled={isConfirming}
                />
              ))}
            </div>

            {!isConfirming ? (
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={startListening}
                className={cn(
                  'flex items-center gap-4 px-8 py-4 rounded-full bg-surface shadow-[var(--shadow-soft)] border-2 border-hairline',
                  isListening ? 'ring-4 ring-primary/30 border-primary' : '',
                )}
              >
                <div className={cn('p-3 rounded-full text-primary', isListening ? 'bg-primary text-white animate-pulse' : 'bg-primary-soft')}>
                  <Mic size={28} />
                </div>
                <span className="text-xl font-semibold text-ink">{isListening ? 'Listening…' : 'Answer with your voice'}</span>
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-8 py-3.5 bg-primary-soft text-primary-deep rounded-full text-xl font-semibold animate-pulse"
              >
                Saving your answer…
              </motion.div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="pt-3">
        <LargeTouchButton variant="secondary" onClick={() => router.push('/complaint')} className="w-44 py-4">
          <ArrowLeft size={24} className="mr-2" /> Back
        </LargeTouchButton>
      </div>
    </div>
  );
}
