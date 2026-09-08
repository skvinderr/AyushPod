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
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-muted">{t('summary.label.complaint')}</span>
          <span className="text-3xl font-bold text-ink">{complaintLabel}</span>
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
        <div className="grid grid-cols-2 gap-x-8 gap-y-4">
          {rows.length > 0 ? (
            rows.map((row, i) => (
              <div key={i} className="flex flex-col gap-0.5">
                <span className="text-base font-semibold text-muted">{row.q}</span>
                <span className="text-xl font-bold text-ink">{row.a}</span>
              </div>
            ))
          ) : (
            <span className="text-xl font-bold text-ink">{t('summary.viaVoice')}</span>
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
        <div className="flex flex-col gap-1">
          <span className="text-base font-semibold text-muted">{t('summary.label.attached')}</span>
          <span className="text-2xl font-bold text-ink">{t('summary.documentsValue')}</span>
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
      <div className="pb-3">
        <h1 className="text-5xl font-extrabold text-ink tracking-tight">{t('summary.heading')}</h1>
        <p className="text-2xl text-muted mt-1">{t('summary.sub')}</p>
      </div>

      {/* sections */}
      <div className="flex-1 min-h-0 overflow-y-auto pr-1 flex flex-col gap-4">
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
              animate={{ opacity: isLocked ? 0.45 : 1, y: 0 }}
              className={cn(
                'flex flex-col border-2 rounded-[1.75rem] transition-all duration-300 overflow-hidden bg-surface',
                isActive ? 'border-primary shadow-[var(--card-pop)]' : 'border-hairline',
              )}
            >
              <div className="flex items-center justify-between px-6 py-4 bg-surface-warm border-b border-hairline">
                <div className="flex items-center gap-3">
                  <div className={cn(isConfirmed || isActive ? 'text-primary' : 'text-muted')}>
                    {isConfirmed ? <CheckCircle2 size={26} /> : <Icon size={26} />}
                  </div>
                  <span className="text-xl font-bold text-ink">{section.title}</span>
                </div>

                {(isActive || isConfirmed) && (
                  <button onClick={() => handleFix(section.editRoute)} className="flex items-center gap-2 text-primary font-semibold text-lg hover:underline">
                    <Edit3 size={18} /> {t('summary.edit')}
                  </button>
                )}
              </div>

              <div className="px-6 py-5 flex flex-col gap-4">
                {section.content}

                {isActive && !isConfirmed && (
                  <div className="flex justify-end">
                    <LargeTouchButton onClick={() => handleConfirm(section.id)} className="py-3.5 px-10">
                      <Check size={26} className="mr-2" />
                      <span className="text-xl font-semibold">{t('summary.yesCorrect')}</span>
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
          <motion.div initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="pt-4">
            <LargeTouchButton onClick={() => router.push('/done')} className="w-full py-6">
              <span className="text-3xl font-bold">{t('summary.send')}</span>
              <ArrowRight size={34} className="ml-3" />
            </LargeTouchButton>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
