"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { interviewTree } from '../../lib/interviewTree';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { CheckCircle2, Edit3, ArrowRight, UserCircle, ActivitySquare, FileText, Check, ChevronLeft } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '../../components/LargeTouchButton';
import { useT } from '../../i18n';

interface Section {
  id: string;
  title: string;
  icon: LucideIcon;
  content: React.ReactNode;
  spokenText: string;
  editRoute: string;
}

export default function SummaryScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, chiefComplaint, historyAnswers } = useSessionStore();
  const { t } = useT();

  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [confirmedSections, setConfirmedSections] = useState<Record<string, boolean>>({});

  const speakRef = useRef(speak);
  speakRef.current = speak;

  // Complaint label in the active language. The stored value is a category id
  // ("chest", "voice_narration", …); we key it back through the zone catalog.
  const complaintLabel = !chiefComplaint
    ? t('summary.notSpecified')
    : chiefComplaint === 'voice_narration'
      ? t('summary.viaVoice')
      : t(`complaint.zone.${chiefComplaint}`);

  // Build the answered-questions list, translating each question + option key.
  const rows = useMemo(() => {
    if (!chiefComplaint || chiefComplaint === 'voice_narration') return [];
    const questions = interviewTree[chiefComplaint] || interviewTree['general'];
    const r: { q: string; a: string }[] = [];
    Object.entries(historyAnswers).forEach(([qId, optionId]) => {
      const q = questions.find((q) => q.id === qId);
      const opt = q?.options.find((o) => o.id === optionId);
      if (q && opt) {
        r.push({ q: t(q.text).replace('?', ''), a: t(opt.label) });
      }
    });
    return r;
  }, [chiefComplaint, historyAnswers, t]);

  const sections: Section[] = useMemo(() => [
    {
      id: 'complaint',
      title: t('summary.section.complaint'),
      icon: UserCircle,
      content: (
        <div className="flex flex-col gap-2">
          <span className="text-sm uppercase tracking-wider font-bold text-primary">{t('summary.label.complaint')}</span>
          <span className="text-3xl font-extrabold text-ink leading-tight">{complaintLabel}</span>
        </div>
      ),
      spokenText: t('summary.spoken.complaint', { complaint: complaintLabel }),
      editRoute: '/complaint',
    },
    {
      id: 'hpi',
      title: t('summary.section.hpi'),
      icon: ActivitySquare,
      content: (
        <div className="flex flex-col gap-3">
          {rows.length > 0 ? (
            rows.map((row, i) => (
              <div key={i} className="flex flex-col gap-1 bg-surface-warm/30 p-3 rounded-2xl border border-hairline/50">
                <span className="text-sm font-semibold text-muted">{row.q}</span>
                <span className="text-xl font-bold text-ink">{row.a}</span>
              </div>
            ))
          ) : (
            <div className="flex items-center gap-3 bg-surface-warm/30 p-4 rounded-2xl border border-hairline/50">
              <span className="text-xl font-bold text-ink">{t('summary.viaVoice')}</span>
            </div>
          )}
        </div>
      ),
      spokenText: t('summary.spoken.hpi'),
      editRoute: '/interview',
    },
    {
      id: 'documents',
      title: t('summary.section.documents'),
      icon: FileText,
      content: (
        <div className="flex flex-col gap-2">
          <span className="text-sm uppercase tracking-wider font-bold text-primary">{t('summary.label.attached')}</span>
          <div className="flex items-center gap-4 bg-surface-warm/30 p-4 rounded-2xl border border-hairline/50">
            <div className="p-3 bg-white rounded-xl shadow-sm text-primary">
              <FileText size={24} />
            </div>
            <span className="text-2xl font-bold text-ink">{t('summary.documentsValue')}</span>
          </div>
        </div>
      ),
      spokenText: t('summary.spoken.documents'),
      editRoute: '/scan',
    },
  ], [complaintLabel, rows, t]);

  useEffect(() => {
    router.prefetch('/done');
    if (activeSectionIndex < sections.length) {
      speakRef.current(sections[activeSectionIndex].spokenText, { language, gesture: 'present', stage: true });
    } else {
      speakRef.current(t('summary.spoken.confirm'), { language, gesture: 'present', stage: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionIndex, language, router]);

  const handleConfirm = (sectionId: string) => {
    setConfirmedSections((prev) => ({ ...prev, [sectionId]: true }));
    if (activeSectionIndex < sections.length) {
      setActiveSectionIndex((prev) => prev + 1);
    }
  };

  const handleFix = (route: string) => {
    speakRef.current(t('summary.spoken.fix'), { language });
    router.push(route);
  };

  const allConfirmed = sections.every((s) => confirmedSections[s.id]);

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* prompt */}
      <div className="flex-none pb-4 mb-2">
        <motion.button
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={() => router.push('/scan')}
          className="mb-2 flex items-center gap-1 px-3 py-1.5 -ml-3 rounded-xl text-primary font-semibold hover:bg-primary-soft transition-colors"
        >
          <ChevronLeft size={22} />
          {t('common.back')}
        </motion.button>
        <motion.h1 
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl lg:text-5xl font-extrabold text-ink tracking-tight"
        >
          {t('summary.heading')}
        </motion.h1>
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-xl lg:text-2xl text-muted mt-2"
        >
          {t('summary.sub')}
        </motion.p>
      </div>

      {/* sections */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-2 pb-6 flex flex-col gap-5 scrollbar-thin">
        {sections.map((section, idx) => {
          const isConfirmed = confirmedSections[section.id];
          const isActive = idx === activeSectionIndex;
          const isPast = idx < activeSectionIndex || isConfirmed;
          const isLocked = !isPast && !isActive;
          const Icon = section.icon;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: isLocked ? 0.6 : 1, y: 0, scale: isActive ? 1 : 0.98 }}
              className={cn(
                'flex flex-col shrink-0 rounded-[2rem] transition-all duration-300 overflow-hidden relative',
                isActive 
                  ? 'bg-surface border-2 border-primary shadow-xl ring-4 ring-primary/20' 
                  : 'bg-surface-warm/40 border-2 border-transparent'
              )}
            >
              {isConfirmed && (
                <div className="absolute top-0 right-0 w-0 h-0 border-t-[60px] border-l-[60px] border-t-primary border-l-transparent" />
              )}
              {isConfirmed && (
                <Check size={20} className="absolute top-2 right-2 text-white z-10 drop-shadow-sm" strokeWidth={4} />
              )}

              <div className={cn(
                "flex items-center justify-between px-6 py-5 transition-colors",
                isActive ? "bg-primary-soft/50 border-b border-primary/20" : "bg-transparent border-b border-hairline/50"
              )}>
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "p-3 rounded-2xl transition-colors",
                    isActive ? "bg-primary text-white shadow-md shadow-primary/20" : isConfirmed ? "bg-primary-soft text-primary" : "bg-surface text-muted"
                  )}>
                    {isConfirmed ? <CheckCircle2 size={28} /> : <Icon size={28} />}
                  </div>
                  <span className={cn(
                    "text-2xl font-extrabold tracking-tight",
                    isActive ? "text-primary-deep" : "text-ink"
                  )}>
                    {section.title}
                  </span>
                </div>

                {(isActive || isConfirmed) && (
                  <button 
                    onClick={() => handleFix(section.editRoute)} 
                    className={cn(
                      "flex items-center gap-2 font-bold text-lg px-4 py-2 rounded-xl transition-colors",
                      isActive ? "bg-white text-primary shadow-sm hover:bg-surface-warm" : "text-primary hover:bg-primary-soft"
                    )}
                  >
                    <Edit3 size={18} /> {t('summary.edit')}
                  </button>
                )}
              </div>

              <div className={cn("px-6 py-6 flex flex-col gap-5", !isActive && "opacity-80")}>
                {section.content}

                {isActive && !isConfirmed && (
                  <div className="flex justify-end pt-2 border-t border-hairline/50">
                    <LargeTouchButton onClick={() => handleConfirm(section.id)} className="py-4 px-10 shadow-lg !min-h-0 !rounded-2xl bg-primary hover:bg-primary-deep">
                      <Check size={28} className="mr-3" strokeWidth={3} />
                      <span className="text-xl font-bold tracking-wide">{t('summary.yesCorrect')}</span>
                    </LargeTouchButton>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}

        {/* submit */}
        <AnimatePresence>
          {allConfirmed && (
            <motion.div 
              initial={{ y: 30, opacity: 0, scale: 0.95 }} 
              animate={{ y: 0, opacity: 1, scale: 1 }} 
              className="pt-2 pb-10"
            >
              <LargeTouchButton onClick={() => router.push('/done')} className="w-full py-5 text-2xl shadow-xl !min-h-0 !rounded-[2rem]">
                <span className="font-extrabold">{t('summary.send')}</span>
                <ArrowRight size={32} className="ml-3" strokeWidth={3} />
              </LargeTouchButton>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
