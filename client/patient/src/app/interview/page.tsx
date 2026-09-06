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
import { Mic, ArrowRight } from 'lucide-react';
import { cn } from '../../components/LargeTouchButton';

export default function InterviewScreen() {
  const router = useRouter();
  const { speak, setState } = useAvatar();
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
    // Clear timeouts on unmount
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  // Speak the question on mount or index change
  useEffect(() => {
    if (isVoiceNarration) {
      speak("Please describe your problem in detail.", language);
    } else if (!isConfirming && currentQuestion) {
      speak(currentQuestion.text, language);
    }
  }, [currentIndex, isConfirming, currentQuestion, isVoiceNarration, speak, language]);

  const handleOptionSelect = (optionId: string, confirmationText: string, triggersRedFlag?: boolean) => {
    setSelectedOption(optionId);
    setIsConfirming(true);
    
    // Save to store
    updateHistoryAnswer(currentQuestion.id, optionId);
    if (triggersRedFlag) setRedFlag(true);

    // Avatar confirmation
    speak(confirmationText, language);

    // Auto advance
    timeoutRef.current = setTimeout(() => {
      if (triggersRedFlag || redFlag) {
        router.push('/urgent');
      } else if (currentIndex < questions.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsConfirming(false);
        setSelectedOption(null);
      } else {
        router.push('/scan');
      }
    }, 3500);
  };

  const handleVoiceNarrationComplete = () => {
    speak("Thank you. I have recorded your symptoms.", language);
    router.push('/scan');
  };

  if (isVoiceNarration) {
    return (
      <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-12 overflow-hidden">
        <h1 className="text-5xl font-bold text-slate-800 text-center mb-12">Describe your symptoms</h1>
        
        <motion.button
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          whileTap={{ scale: 0.95 }}
          onClick={startListening}
          className={cn(
            "w-96 h-96 rounded-full flex flex-col items-center justify-center gap-6 shadow-2xl transition-all duration-300",
            isListening ? "bg-blue-600 text-white animate-pulse border-8 border-blue-400" : "bg-white border-8 border-slate-200 text-slate-700"
          )}
        >
          <Mic size={100} />
          <span className="text-3xl font-bold">{isListening ? "Listening..." : "Tap to Speak"}</span>
        </motion.button>

        <LargeTouchButton 
          onClick={handleVoiceNarrationComplete}
          className="mt-16 w-96 py-6"
        >
          <span className="text-3xl">Done</span>
          <ArrowRight size={32} />
        </LargeTouchButton>
      </div>
    );
  }

  // Structured Interview Flow
  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col pt-12 pb-8 px-12 overflow-hidden">
      
      {/* Progress Dots */}
      <div className="flex justify-center gap-4 mb-8">
        {questions.map((_, idx) => (
          <div 
            key={idx} 
            className={cn(
              "w-4 h-4 rounded-full transition-colors",
              idx === currentIndex ? "bg-blue-600" : idx < currentIndex ? "bg-blue-300" : "bg-slate-300"
            )}
          />
        ))}
      </div>

      <div className="flex-1 flex flex-col items-center max-w-5xl mx-auto w-full relative">
        <AnimatePresence mode="wait">
          
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            className="w-full flex flex-col items-center gap-12"
          >
            {/* Question Text */}
            <h1 className="text-5xl font-bold text-slate-800 text-center leading-tight">
              {currentQuestion.text}
            </h1>

            {/* Answer Options Grid */}
            <div className={cn(
              "grid gap-8 w-full mt-8",
              currentQuestion.options.length <= 4 ? "grid-cols-2" : "grid-cols-3"
            )}>
              {currentQuestion.options.map(opt => (
                <IconTile
                  key={opt.id}
                  icon={opt.icon}
                  label={opt.label}
                  selected={selectedOption === opt.id}
                  onClick={() => !isConfirming && handleOptionSelect(opt.id, opt.confirmationText, opt.triggersRedFlag)}
                  className={cn(
                    "h-64",
                    isConfirming && selectedOption !== opt.id ? "opacity-50 grayscale" : ""
                  )}
                  disabled={isConfirming}
                />
              ))}
            </div>

            {/* Voice Fallback Button */}
            {!isConfirming && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={startListening}
                className={cn(
                  "mt-8 flex items-center gap-6 px-10 py-6 rounded-full bg-white shadow-[0_4px_20px_rgba(0,0,0,0.05)] border-2 border-transparent",
                  isListening ? "ring-4 ring-[#00a8e8]/30 border-[#00a8e8]" : ""
                )}
              >
                <div className={cn(
                  "p-4 rounded-full text-[#00a8e8]",
                  isListening ? "bg-[#00a8e8] text-white animate-pulse" : "bg-sky-50"
                )}>
                  <Mic size={32} />
                </div>
                <span className="text-2xl font-semibold text-slate-700">
                  {isListening ? "Listening..." : "Tap to answer with your voice"}
                </span>
              </motion.button>
            )}

            {/* Confirmation Overlay Indicator */}
            {isConfirming && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 px-8 py-4 bg-blue-100 text-blue-800 rounded-full text-2xl font-medium animate-pulse"
              >
                Recording your answer...
              </motion.div>
            )}
          </motion.div>

        </AnimatePresence>
      </div>
    </div>
  );
}
