"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { interviewTree } from '../../lib/interviewTree';
import { LargeTouchButton } from '../../components/LargeTouchButton';
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
  const { language, patientInfo, chiefComplaint, historyAnswers } = useSessionStore();

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [confirmedSections, setConfirmedSections] = useState<Record<string, boolean>>({});

  // Helper to format history answers
  const formatHPI = () => {
    if (!chiefComplaint || chiefComplaint === 'voice_narration') return "User described symptoms via voice recording.";
    const questions = interviewTree[chiefComplaint] || interviewTree['general'];
    let text = "";
    Object.entries(historyAnswers).forEach(([qId, optionId]) => {
      const q = questions.find(q => q.id === qId);
      if (q) {
        const opt = q.options.find(o => o.id === optionId);
        if (opt) {
          text += `${q.text.replace('?', '')}: ${opt.label}. `;
        }
      }
    });
    return text || "No specific details provided.";
  };

  const sections: Section[] = [
    {
      id: 'complaint',
      title: 'Chief Complaint',
      icon: UserCircle,
      content: (
        <div className="text-3xl text-slate-700 capitalize">
          {chiefComplaint ? chiefComplaint.replace('_', ' ') : "Not specified"}
        </div>
      ),
      spokenText: `Your main reason for visiting today is: ${chiefComplaint ? chiefComplaint.replace('_', ' ') : "Not specified"}.`,
      editRoute: '/complaint'
    },
    {
      id: 'hpi',
      title: 'History of Present Illness',
      icon: ActivitySquare,
      content: (
        <div className="text-2xl text-slate-700 leading-relaxed">
          {formatHPI()}
        </div>
      ),
      spokenText: `You mentioned: ${formatHPI()}`,
      editRoute: '/interview'
    },
    {
      id: 'history',
      title: 'Past / Personal History',
      icon: FileText,
      content: (
        <div className="text-2xl text-slate-700 italic">
          No significant past medical history reported.
        </div>
      ),
      spokenText: `You reported no significant past medical history.`,
      editRoute: '/complaint'
    },
    {
      id: 'documents',
      title: 'Scanned Documents',
      icon: FileText,
      content: (
        <div className="text-2xl text-slate-700">
          1 Document attached (Blood Report).
        </div>
      ),
      spokenText: `You have attached 1 document for the doctor to review.`,
      editRoute: '/scan'
    }
  ];

  // Speak the active section
  useEffect(() => {
    if (activeSectionIndex < sections.length) {
      speak(sections[activeSectionIndex].spokenText, language);
    } else {
      speak("Great. If everything looks correct, please confirm and submit.", language);
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
    <div className="absolute inset-0 bg-slate-50 flex flex-col pt-8 pb-8 px-12 overflow-y-auto">
      
      <div className="max-w-5xl mx-auto w-full flex flex-col gap-8">
        <div className="text-center mb-4">
          <h1 className="text-5xl font-bold text-slate-800">Review Your File</h1>
          <p className="text-2xl text-slate-600 mt-4">Please verify the information below before we send it to your doctor.</p>
        </div>

        <div className="flex flex-col gap-6 w-full pb-32">
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
                  "bg-white rounded-[2rem] p-8 shadow-md border-4 transition-all duration-300",
                  isActive ? "border-blue-400 ring-4 ring-blue-100" : isConfirmed ? "border-green-200" : "border-slate-100"
                )}
              >
                <div className="flex items-start gap-6">
                  <div className={cn(
                    "p-4 rounded-full",
                    isConfirmed ? "bg-[#20c997]/20 text-[#20c997]" : isActive ? "bg-[#00a8e8]/20 text-[#00a8e8]" : "bg-slate-100 text-slate-500"
                  )}>
                    {isConfirmed ? <CheckCircle2 size={40} /> : <Icon size={40} />}
                  </div>
                  
                  <div className="flex-1">
                    <h2 className="text-3xl font-bold text-slate-800 mb-4">{section.title}</h2>
                    <div className={cn(
                      "transition-all duration-300",
                      isConfirmed ? "opacity-70" : "opacity-100"
                    )}>
                      {section.content}
                    </div>
                  </div>
                </div>

                {/* Actions (Only visible when active or already confirmed) */}
                <AnimatePresence>
                  {(isActive || isConfirmed) && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      className="flex gap-4 mt-8 pt-6 border-t border-slate-100 justify-end"
                    >
                      <LargeTouchButton 
                        onClick={() => handleFix(section.editRoute)} 
                        variant="secondary"
                        className="py-4 px-8"
                      >
                        <Edit3 size={24} className="mr-3" />
                        <span className="text-xl">Fix This</span>
                      </LargeTouchButton>
                      
                      {!isConfirmed && (
                        <LargeTouchButton 
                          onClick={() => handleConfirm(section.id)} 
                          className="py-4 px-12 bg-[#00a8e8] hover:bg-[#0090c8] text-white border-none shadow-lg shadow-[#00a8e8]/20"
                        >
                          <Check size={28} className="mr-3" />
                          <span className="text-2xl font-bold">This is Correct</span>
                        </LargeTouchButton>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {/* Floating Submit Button */}
        <AnimatePresence>
          {allConfirmed && (
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t-2 border-slate-200 p-8 flex justify-center z-50 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]"
            >
              <LargeTouchButton 
                onClick={() => router.push('/done')}
                className="w-[40rem] py-8 bg-[#00a8e8] hover:bg-[#0090c8] text-white border-none shadow-xl shadow-[#00a8e8]/30"
              >
                <span className="text-4xl font-bold">Confirm & Submit File</span>
                <ArrowRight size={40} className="ml-4" />
              </LargeTouchButton>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
}
