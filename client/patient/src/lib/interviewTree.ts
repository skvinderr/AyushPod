import { 
  HeartPulse, Activity, Zap, AlertTriangle, 
  Clock, Calendar, ActivitySquare, AlertOctagon, Frown
} from 'lucide-react';
import { LucideIcon } from 'lucide-react';

export interface InterviewOption {
  id: string;
  label: string;
  icon: LucideIcon;
  confirmationText: string;
  triggersRedFlag?: boolean;
}

export interface InterviewQuestion {
  id: string;
  text: string;
  options: InterviewOption[];
}

export const interviewTree: Record<string, InterviewQuestion[]> = {
  // Chest Pain (SOCRATES implementation)
  chest: [
    {
      id: 'chest_onset',
      text: 'When did this chest pain start?',
      options: [
        { id: 'minutes', label: 'Just now / Minutes ago', icon: Zap, confirmationText: 'Got it. It started just now.', triggersRedFlag: true }, // RED FLAG
        { id: 'hours', label: 'A few hours ago', icon: Clock, confirmationText: 'Understood. It started a few hours ago.' },
        { id: 'days', label: 'A few days ago', icon: Calendar, confirmationText: 'Okay, started a few days ago.' },
        { id: 'weeks', label: 'More than a week ago', icon: Calendar, confirmationText: 'Alright, it has been going on for a while.' },
      ]
    },
    {
      id: 'chest_character',
      text: 'What does the pain feel like?',
      options: [
        { id: 'crushing', label: 'Heavy / Crushing', icon: AlertOctagon, confirmationText: 'Got it, a heavy, crushing feeling.', triggersRedFlag: true }, // RED FLAG
        { id: 'sharp', label: 'Sharp / Stabbing', icon: Zap, confirmationText: 'Okay, a sharp stabbing pain.' },
        { id: 'burning', label: 'Burning', icon: Activity, confirmationText: 'Understood, a burning sensation.' },
        { id: 'dull', label: 'Dull ache', icon: Frown, confirmationText: 'Alright, a dull ache.' },
      ]
    },
    {
      id: 'chest_severity',
      text: 'How bad is the pain on a scale from mild to severe?',
      options: [
        { id: 'mild', label: 'Mild, I can ignore it', icon: ActivitySquare, confirmationText: 'Got it. Mild pain.' },
        { id: 'moderate', label: 'Moderate, it bothers me', icon: AlertTriangle, confirmationText: 'Okay, moderate pain.' },
        { id: 'severe', label: 'Severe, very painful', icon: AlertOctagon, confirmationText: 'Understood. Severe pain.', triggersRedFlag: true }, // RED FLAG
      ]
    }
  ],
  
  // Generic fallback for other categories just for demo purposes
  general: [
    {
      id: 'general_onset',
      text: 'When did you first notice this issue?',
      options: [
        { id: 'today', label: 'Today', icon: Clock, confirmationText: 'Got it, it started today.' },
        { id: 'days', label: 'A few days ago', icon: Calendar, confirmationText: 'Okay, a few days ago.' },
        { id: 'weeks', label: 'Weeks ago', icon: Calendar, confirmationText: 'Alright, weeks ago.' },
      ]
    },
    {
      id: 'general_severity',
      text: 'Is it getting worse?',
      options: [
        { id: 'yes', label: 'Yes, getting worse', icon: AlertTriangle, confirmationText: 'Okay, it is getting worse.' },
        { id: 'no', label: 'No, staying the same', icon: ActivitySquare, confirmationText: 'Got it, staying the same.' },
        { id: 'better', label: 'It is getting better', icon: HeartPulse, confirmationText: 'That is good, it is getting better.' },
      ]
    }
  ]
};
