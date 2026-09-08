import {
  HeartPulse, Activity, Zap, AlertTriangle,
  Clock, Calendar, ActivitySquare, AlertOctagon, Frown
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

// NOTE: `text`, `label`, and `confirmationText` below are i18n catalog KEYS,
// not display strings. Every consumer must resolve them through `t()` (or
// `translate(lang, …)`), so the interview renders and speaks in the selected
// language. English values live in src/i18n/en.json under the same keys.
export interface InterviewOption {
  id: string;
  /** i18n key → option button label */
  label: string;
  icon: LucideIcon;
  /** i18n key → line Aaya speaks when this option is chosen */
  confirmationText: string;
  triggersRedFlag?: boolean;
}

export interface InterviewQuestion {
  id: string;
  /** i18n key → question text (rendered + spoken) */
  text: string;
  options: InterviewOption[];
}

export const interviewTree: Record<string, InterviewQuestion[]> = {
  // Chest Pain (SOCRATES implementation)
  chest: [
    {
      id: 'chest_onset',
      text: 'interview.q.chest_onset.text',
      options: [
        { id: 'minutes', label: 'interview.o.chest_onset.minutes.label', icon: Zap, confirmationText: 'interview.o.chest_onset.minutes.confirm', triggersRedFlag: true }, // RED FLAG
        { id: 'hours', label: 'interview.o.chest_onset.hours.label', icon: Clock, confirmationText: 'interview.o.chest_onset.hours.confirm' },
        { id: 'days', label: 'interview.o.chest_onset.days.label', icon: Calendar, confirmationText: 'interview.o.chest_onset.days.confirm' },
        { id: 'weeks', label: 'interview.o.chest_onset.weeks.label', icon: Calendar, confirmationText: 'interview.o.chest_onset.weeks.confirm' },
      ]
    },
    {
      id: 'chest_character',
      text: 'interview.q.chest_character.text',
      options: [
        { id: 'crushing', label: 'interview.o.chest_character.crushing.label', icon: AlertOctagon, confirmationText: 'interview.o.chest_character.crushing.confirm', triggersRedFlag: true }, // RED FLAG
        { id: 'sharp', label: 'interview.o.chest_character.sharp.label', icon: Zap, confirmationText: 'interview.o.chest_character.sharp.confirm' },
        { id: 'burning', label: 'interview.o.chest_character.burning.label', icon: Activity, confirmationText: 'interview.o.chest_character.burning.confirm' },
        { id: 'dull', label: 'interview.o.chest_character.dull.label', icon: Frown, confirmationText: 'interview.o.chest_character.dull.confirm' },
      ]
    },
    {
      id: 'chest_severity',
      text: 'interview.q.chest_severity.text',
      options: [
        { id: 'mild', label: 'interview.o.chest_severity.mild.label', icon: ActivitySquare, confirmationText: 'interview.o.chest_severity.mild.confirm' },
        { id: 'moderate', label: 'interview.o.chest_severity.moderate.label', icon: AlertTriangle, confirmationText: 'interview.o.chest_severity.moderate.confirm' },
        { id: 'severe', label: 'interview.o.chest_severity.severe.label', icon: AlertOctagon, confirmationText: 'interview.o.chest_severity.severe.confirm', triggersRedFlag: true }, // RED FLAG
      ]
    }
  ],

  // Head / headache
  head: [
    {
      id: 'head_onset',
      text: 'interview.q.head_onset.text',
      options: [
        { id: 'today', label: 'interview.o.head_onset.today.label', icon: Clock, confirmationText: 'interview.o.head_onset.today.confirm' },
        { id: 'days', label: 'interview.o.head_onset.days.label', icon: Calendar, confirmationText: 'interview.o.head_onset.days.confirm' },
        { id: 'weeks', label: 'interview.o.head_onset.weeks.label', icon: Calendar, confirmationText: 'interview.o.head_onset.weeks.confirm' },
      ],
    },
    {
      id: 'head_severity',
      text: 'interview.q.head_severity.text',
      options: [
        { id: 'mild', label: 'interview.o.head_severity.mild.label', icon: ActivitySquare, confirmationText: 'interview.o.head_severity.mild.confirm' },
        { id: 'moderate', label: 'interview.o.head_severity.moderate.label', icon: AlertTriangle, confirmationText: 'interview.o.head_severity.moderate.confirm' },
        { id: 'severe', label: 'interview.o.head_severity.severe.label', icon: AlertOctagon, confirmationText: 'interview.o.head_severity.severe.confirm' },
      ],
    },
    {
      id: 'head_assoc',
      text: 'interview.q.head_assoc.text',
      options: [
        { id: 'nausea', label: 'interview.o.head_assoc.nausea.label', icon: Frown, confirmationText: 'interview.o.head_assoc.nausea.confirm' },
        { id: 'vision', label: 'interview.o.head_assoc.vision.label', icon: Zap, confirmationText: 'interview.o.head_assoc.vision.confirm' },
        { id: 'none', label: 'interview.o.head_assoc.none.label', icon: HeartPulse, confirmationText: 'interview.o.head_assoc.none.confirm' },
      ],
    },
  ],

  // Stomach / abdomen
  stomach: [
    {
      id: 'stomach_onset',
      text: 'interview.q.stomach_onset.text',
      options: [
        { id: 'today', label: 'interview.o.stomach_onset.today.label', icon: Clock, confirmationText: 'interview.o.stomach_onset.today.confirm' },
        { id: 'days', label: 'interview.o.stomach_onset.days.label', icon: Calendar, confirmationText: 'interview.o.stomach_onset.days.confirm' },
        { id: 'weeks', label: 'interview.o.stomach_onset.weeks.label', icon: Calendar, confirmationText: 'interview.o.stomach_onset.weeks.confirm' },
      ],
    },
    {
      id: 'stomach_assoc',
      text: 'interview.q.stomach_assoc.text',
      options: [
        { id: 'vomiting', label: 'interview.o.stomach_assoc.vomiting.label', icon: Frown, confirmationText: 'interview.o.stomach_assoc.vomiting.confirm' },
        { id: 'loose', label: 'interview.o.stomach_assoc.loose.label', icon: Activity, confirmationText: 'interview.o.stomach_assoc.loose.confirm' },
        { id: 'none', label: 'interview.o.stomach_assoc.none.label', icon: HeartPulse, confirmationText: 'interview.o.stomach_assoc.none.confirm' },
      ],
    },
    {
      id: 'stomach_severity',
      text: 'interview.q.stomach_severity.text',
      options: [
        { id: 'mild', label: 'interview.o.stomach_severity.mild.label', icon: ActivitySquare, confirmationText: 'interview.o.stomach_severity.mild.confirm' },
        { id: 'moderate', label: 'interview.o.stomach_severity.moderate.label', icon: AlertTriangle, confirmationText: 'interview.o.stomach_severity.moderate.confirm' },
        { id: 'severe', label: 'interview.o.stomach_severity.severe.label', icon: AlertOctagon, confirmationText: 'interview.o.stomach_severity.severe.confirm' },
      ],
    },
  ],

  // Joints / arms / legs
  joints: [
    {
      id: 'joints_onset',
      text: 'interview.q.joints_onset.text',
      options: [
        { id: 'today', label: 'interview.o.joints_onset.today.label', icon: Clock, confirmationText: 'interview.o.joints_onset.today.confirm' },
        { id: 'days', label: 'interview.o.joints_onset.days.label', icon: Calendar, confirmationText: 'interview.o.joints_onset.days.confirm' },
        { id: 'weeks', label: 'interview.o.joints_onset.weeks.label', icon: Calendar, confirmationText: 'interview.o.joints_onset.weeks.confirm' },
      ],
    },
    {
      id: 'joints_pattern',
      text: 'interview.q.joints_pattern.text',
      options: [
        { id: 'morning', label: 'interview.o.joints_pattern.morning.label', icon: Clock, confirmationText: 'interview.o.joints_pattern.morning.confirm' },
        { id: 'movement', label: 'interview.o.joints_pattern.movement.label', icon: Activity, confirmationText: 'interview.o.joints_pattern.movement.confirm' },
        { id: 'always', label: 'interview.o.joints_pattern.always.label', icon: AlertTriangle, confirmationText: 'interview.o.joints_pattern.always.confirm' },
      ],
    },
    {
      id: 'joints_severity',
      text: 'interview.q.joints_severity.text',
      options: [
        { id: 'mild', label: 'interview.o.joints_severity.mild.label', icon: ActivitySquare, confirmationText: 'interview.o.joints_severity.mild.confirm' },
        { id: 'moderate', label: 'interview.o.joints_severity.moderate.label', icon: AlertTriangle, confirmationText: 'interview.o.joints_severity.moderate.confirm' },
        { id: 'severe', label: 'interview.o.joints_severity.severe.label', icon: AlertOctagon, confirmationText: 'interview.o.joints_severity.severe.confirm' },
      ],
    },
  ],

  // Generic fallback for other categories (also used for "back")
  general: [
    {
      id: 'general_onset',
      text: 'interview.q.general_onset.text',
      options: [
        { id: 'today', label: 'interview.o.general_onset.today.label', icon: Clock, confirmationText: 'interview.o.general_onset.today.confirm' },
        { id: 'days', label: 'interview.o.general_onset.days.label', icon: Calendar, confirmationText: 'interview.o.general_onset.days.confirm' },
        { id: 'weeks', label: 'interview.o.general_onset.weeks.label', icon: Calendar, confirmationText: 'interview.o.general_onset.weeks.confirm' },
      ]
    },
    {
      id: 'general_severity',
      text: 'interview.q.general_severity.text',
      options: [
        { id: 'yes', label: 'interview.o.general_severity.yes.label', icon: AlertTriangle, confirmationText: 'interview.o.general_severity.yes.confirm' },
        { id: 'no', label: 'interview.o.general_severity.no.label', icon: ActivitySquare, confirmationText: 'interview.o.general_severity.no.confirm' },
        { id: 'better', label: 'interview.o.general_severity.better.label', icon: HeartPulse, confirmationText: 'interview.o.general_severity.better.confirm' },
      ]
    }
  ]
};
