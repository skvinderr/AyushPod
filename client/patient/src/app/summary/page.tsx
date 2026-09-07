"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { interviewTree } from '../../lib/interviewTree';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { StepIndicator } from '../../components/StepIndicator';
import { CheckCircle2, Edit3, ArrowRight, UserCircle, ActivitySquare, FileText, Check } from 'lucide-react';
import { cn } from '../../components/LargeTouchButton';

interface Section {
  id: string;
  title: string;
  icon: any;
  content: React.ReactNode;
  spokenText: string;
  editRoute: string;
}

export default function SummaryScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, chiefComplaint, historyAnswers } = useSessionStore();

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [confirmedSections, setConfirmedSections] = useState<Record<string, boolean>>({});

  const formatHPI = () => {
    if (!chiefComplaint || chiefComplaint === 'voice_narration') return "User described symptoms via voice recording.";
    const questions = interviewTree[chiefComplaint] || interviewTree['general'];
    let text = "";
    Object.entries(historyAnswers).forEach(([qId, optionId]) => {
      const q = questions.find(q => q.id === qId);
      if (q) {
        const opt = q.options.find(o => o.id === optionId);
        if (opt) {
          text += `${q.text.replace('?', '')}: ${opt.label}\n`;
        }
      }
    });
    return text || "No specific details provided.";
  };

  const sections: Section[] = [
    {
      id: 'complaint',
      title: 'Selected Specialty / Complaint',
      icon: UserCircle,
      content: (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-muted tracking-widest uppercase">Complaint</span>
          <span className="text-3xl font-bold text-ink capitalize">
            {chiefComplaint ? chiefComplaint.replace('_', ' ') : "Not specified"}
          </span>
        </div>
      ),
      spokenText: `Your main reason for visiting today is: ${chiefComplaint ? chiefComplaint.replace('_', ' ') : "Not specified"}.`,
      editRoute: '/complaint'
    },
    {
      id: 'hpi',
      title: 'Interview Answers',
      icon: ActivitySquare,
      content: (
        <div className="flex flex-col gap-4">
          {formatHPI().split('\n').filter(Boolean).map((line, i) => {
            const [q, a] = line.split(':');
            return (
              <div key={i} className="flex flex-col gap-1">
                <span className="text-sm font-semibold text-muted tracking-widest uppercase">{q}</span>
                <span className="text-xl font-bold text-ink">{a}</span>
              </div>
            );
          })}
        </div>
      ),
      spokenText: `You answered the medical history questions.`,
      editRoute: '/interview'
    },
    {
      id: 'documents',
      title: 'Medical Documents',
      icon: FileText,
      content: (
        <div className="flex flex-col gap-1">
          <span className="text-sm font-semibold text-muted tracking-widest uppercase">Attached</span>
          <span className="text-2xl font-bold text-ink">
            1 Document (Blood Report)
          </span>
        </div>
      ),
      spokenText: `You have attached 1 document for the doctor to review.`,
      editRoute: '/scan'
    }
  ];

  useEffect(() => {
    if (activeSectionIndex < sections.length) {
      speak(sections[activeSectionIndex].spokenText, { language, gesture: 'present', stage: true });
    } else {
      speak("Great. If everything looks correct, please confirm and submit.", { language, gesture: 'present', stage: true });
    }
  }, [activeSectionIndex, speak, language]);

  const handleConfirm = (sectionId: string) => {
    setConfirmedSections(prev => ({ ...prev, [sectionId]: true }));
    if (activeSectionIndex < sections.length) {
      setActiveSectionIndex(prev => prev + 1);
    }
  };

  const handleFix = (route: string) => {
    speak("Okay, let's fix that.", language);
    router.push(route);
  };

  const allConfirmed = sections.every(s => confirmedSections[s.id]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pb-32">

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-4xl bg-surface rounded-[2.5rem] shadow-[var(--shadow-lift)] border border-hairline p-12 flex flex-col"
      >
        <StepIndicator currentStep={4} totalSteps={4} title="Review & Confirm Details" />
        <p className="text-2xl text-muted mb-12 -mt-4">Please check and confirm your information.</p>

        <div className="flex flex-col gap-8 w-full">
          {sections.map((section, idx) => {
            const isConfirmed = confirmedSections[section.id];
            const isActive = idx === activeSectionIndex;
            const isPast = idx < activeSectionIndex || isConfirmed;
            const isLocked = !isPast && !isActive;
            const Icon = section.icon;

            return (
              <motion.div
                key={section.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: isLocked ? 0.4 : 1, y: 0 }}
                className={cn(
                  "flex flex-col border-2 rounded-[2rem] transition-all duration-300 relative overflow-hidden",
                  isActive ? "border-primary shadow-[var(--shadow-warm)]" : "border-hairline"
                )}
              >
                {/* Header Strip */}
                <div className="flex items-center justify-between p-6 bg-surface-warm border-b border-hairline">
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-2 rounded-full",
                      isConfirmed ? "text-primary" : isActive ? "text-primary" : "text-muted"
                    )}>
                      {isConfirmed ? <CheckCircle2 size={24} /> : <Icon size={24} />}
                    </div>
                    <span className="text-xl font-semibold text-ink">{section.title}</span>
                  </div>

                  {(isActive || isConfirmed) && (
                    <button
                      onClick={() => handleFix(section.editRoute)}
                      className="flex items-center gap-2 text-primary font-semibold text-lg hover:underline"
                    >
                      <Edit3 size={18} /> Edit
                    </button>
                  )}
                </div>

                {/* Content */}
                <div className="p-8 bg-surface flex flex-col gap-6">
                  {section.content}

                  {isActive && !isConfirmed && (
                    <div className="pt-6 border-t-2 border-dashed border-hairline flex justify-end">
                      <LargeTouchButton
                        onClick={() => handleConfirm(section.id)}
                        className="py-4 px-12 bg-primary hover:bg-primary-deep text-white border-none shadow-[var(--shadow-warm)]"
                      >
                        <Check size={28} className="mr-3" />
                        <span className="text-2xl font-semibold">Confirm</span>
                      </LargeTouchButton>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </motion.div>

      {/* Floating Submit Button */}
      <AnimatePresence>
        {allConfirmed && (
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-0 left-0 right-0 bg-surface/85 backdrop-blur-md border-t border-hairline p-8 flex justify-center z-50 shadow-[0_-10px_40px_-15px_rgba(70,55,40,0.15)]"
          >
            <LargeTouchButton
              onClick={() => router.push('/done')}
              className="w-[40rem] py-8 bg-primary hover:bg-primary-deep text-white border-none shadow-[var(--shadow-warm)]"
            >
              <span className="text-4xl font-bold">Confirm & Submit File</span>
              <ArrowRight size={40} className="ml-4" />
            </LargeTouchButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
