"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { interviewTree } from '../../lib/interviewTree';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { CheckCircle2, Edit3, ArrowRight, UserCircle, ActivitySquare, FileText, Check } from 'lucide-react';
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

  // Complaint label in the active language. The stored value is a category id
  // ("chest", "voice_narration", …); we key it back through the zone catalog.
  const complaintLabel = !chiefComplaint
    ? t('summary.notSpecified')
    : chiefComplaint === 'voice_narration'
      ? t('summary.viaVoice')
      : t(`complaint.zone.${chiefComplaint}`);

  // Build the answered-questions list, translating each question + option key.
  const hpiRows = (): { q: string; a: string }[] => {
    if (!chiefComplaint || chiefComplaint === 'voice_narration') return [];
    const questions = interviewTree[chiefComplaint] || interviewTree['general'];
    const rows: { q: string; a: string }[] = [];
    Object.entries(historyAnswers).forEach(([qId, optionId]) => {
      const q = questions.find((q) => q.id === qId);
      const opt = q?.options.find((o) => o.id === optionId);
      if (q && opt) {
        rows.push({ q: t(q.text).replace('?', ''), a: t(opt.label) });
      }
    });
    return rows;
  };

  const rows = hpiRows();

  const sections: Section[] = [
    {
      id: 'complaint',
      title: t('summary.section.complaint'),
      icon: UserCircle,
      content: (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-muted">{t('summary.label.complaint')}</span>
          <span className="text-lg sm:text-xl font-bold text-ink">{complaintLabel}</span>
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
        <div className="grid grid-cols-2 gap-x-6 gap-y-2">
          {rows.length > 0 ? (
            rows.map((row, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-xs font-semibold text-muted">{row.q}</span>
                <span className="text-sm sm:text-base font-bold text-ink">{row.a}</span>
              </div>
            ))
          ) : (
            <span className="text-base font-bold text-ink">{t('summary.viaVoice')}</span>
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
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-semibold text-muted">{t('summary.label.attached')}</span>
          <span className="text-lg sm:text-xl font-bold text-ink">{t('summary.documentsValue')}</span>
        </div>
      ),
      spokenText: t('summary.spoken.documents'),
      editRoute: '/scan',
    },
  ];

  useEffect(() => {
    if (activeSectionIndex < sections.length) {
      speak(sections[activeSectionIndex].spokenText, { language, gesture: 'present', stage: true });
    } else {
      speak(t('summary.spoken.confirm'), { language, gesture: 'present', stage: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionIndex, speak, language]);

  const handleConfirm = (sectionId: string) => {
    setConfirmedSections((prev) => ({ ...prev, [sectionId]: true }));
    if (activeSectionIndex < sections.length) {
      setActiveSectionIndex((prev) => prev + 1);
    }
  };

  const handleFix = (route: string) => {
    speak(t('summary.spoken.fix'), language);
    router.push(route);
  };

  const allConfirmed = sections.every((s) => confirmedSections[s.id]);

  return (
    <div className="h-full flex flex-col">
      {/* prompt */}
      <div className="pb-2 shrink-0">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-ink tracking-tight">{t('summary.heading')}</h1>
        <p className="text-sm sm:text-base text-muted mt-0.5">{t('summary.sub')}</p>
      </div>

      {/* sections */}
      <div className="flex-1 min-h-0 overflow-y-auto touch-pan-y pr-1 flex flex-col gap-2.5 sm:gap-3">
        {sections.map((section, idx) => {
          const isConfirmed = confirmedSections[section.id];
          const isActive = idx === activeSectionIndex;
          const isPast = idx < activeSectionIndex || isConfirmed;
          const isLocked = !isPast && !isActive;
          const Icon = section.icon;

          return (
            <motion.div
              key={section.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: isLocked ? 0.45 : 1, y: 0 }}
              className={cn(
                'shrink-0 flex flex-col border-2 rounded-2xl transition-all duration-300 overflow-hidden bg-surface shadow-xs',
                isActive ? 'border-primary ring-2 ring-primary/20 shadow-sm' : 'border-hairline',
              )}
            >
              <div className="flex items-center justify-between px-4 py-2.5 bg-surface-warm/80 border-b border-hairline">
                <div className="flex items-center gap-2.5">
                  <div className={cn(isConfirmed || isActive ? 'text-primary' : 'text-muted')}>
                    {isConfirmed ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                  </div>
                  <span className="text-sm sm:text-base font-bold text-ink">{section.title}</span>
                </div>

                {(isActive || isConfirmed) && (
                  <button onClick={() => handleFix(section.editRoute)} className="flex items-center gap-1.5 text-primary font-semibold text-xs sm:text-sm hover:underline">
                    <Edit3 size={15} /> {t('summary.edit')}
                  </button>
                )}
              </div>

              <div className="px-4 py-3 flex flex-col gap-2.5">
                {section.content}

                {isActive && !isConfirmed && (
                  <div className="flex justify-end pt-1">
                    <LargeTouchButton onClick={() => handleConfirm(section.id)} className="py-2 px-5 min-h-[42px] rounded-xl text-sm font-semibold">
                      <Check size={18} className="mr-1.5" />
                      <span>{t('summary.yesCorrect')}</span>
                    </LargeTouchButton>
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* submit */}
      <AnimatePresence>
        {allConfirmed && (
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="pt-2.5 shrink-0">
            <LargeTouchButton onClick={() => router.push('/done')} className="w-full py-3.5 min-h-[48px] rounded-2xl text-lg font-bold">
              <span>{t('summary.send')}</span>
              <ArrowRight size={22} className="ml-2" />
            </LargeTouchButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
