"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { IconTile } from '../../components/IconTile';
import { 
  HeartPulse, 
  Bug, 
  Brain, 
  Bone, 
  Hand, 
  Thermometer, 
  Mic 
} from 'lucide-react';

const CATEGORIES = [
  { id: 'chest', label: 'Chest / Heart', icon: HeartPulse },
  { id: 'stomach', label: 'Stomach / Digestion', icon: Bug },
  { id: 'head', label: 'Head / Brain', icon: Brain },
  { id: 'joints', label: 'Joints / Bones', icon: Bone },
  { id: 'skin', label: 'Skin / Rashes', icon: Hand },
  { id: 'general', label: 'General / Fever', icon: Thermometer },
];

export default function ComplaintScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, setChiefComplaint } = useSessionStore();

  useEffect(() => {
    speak("Where are you experiencing the most discomfort? Tap an icon below, or tap the microphone to describe it.", language);
  }, [speak, language]);

  const handleSelect = (categoryId: string) => {
    setChiefComplaint(categoryId);
    speak("Got it. I have a few quick questions about that.", language);
    router.push('/interview');
  };

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col pt-8 pb-8 px-12 overflow-y-auto">
      
      <div className="max-w-6xl mx-auto w-full flex flex-col gap-12">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-slate-800">What brings you here today?</h1>
          <p className="text-2xl text-slate-600 mt-4">Select the area that bothers you most.</p>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-3 gap-8"
        >
          {CATEGORIES.map((cat) => (
            <IconTile 
              key={cat.id}
              icon={cat.icon}
              label={cat.label}
              onClick={() => handleSelect(cat.id)}
              className="h-64 rounded-[3rem] shadow-md border-0 bg-white hover:bg-blue-50"
            />
          ))}
        </motion.div>

        {/* Voice First Tile (Skip to free narration) */}
        <div className="flex justify-center mt-4">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleSelect('voice_narration')}
            className="flex items-center gap-8 bg-blue-600 text-white rounded-[4rem] px-12 py-8 shadow-xl hover:bg-blue-700 w-full max-w-4xl"
          >
            <div className="bg-white/20 p-6 rounded-full animate-pulse">
              <Mic size={48} />
            </div>
            <div className="flex flex-col text-left">
              <span className="text-4xl font-bold">Describe in your own words</span>
              <span className="text-xl text-blue-100 mt-2">Skip the questions and just tell us what's wrong</span>
            </div>
          </motion.button>
        </div>
      </div>
    </div>
  );
}
