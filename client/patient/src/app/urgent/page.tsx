"use client";

import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { LargeTouchButton } from '../../components/LargeTouchButton';
import { AlertTriangle, ShieldAlert } from 'lucide-react';

export default function UrgentScreen() {
  const router = useRouter();
  const { speak, setState } = useAvatar();
  const { language } = useSessionStore();

  useEffect(() => {
    // Escalate avatar expression and warning
    setState('concerned');
    speak("Based on your answers, please let a staff member know right away.", language);
  }, [speak, setState, language]);

  return (
    <div className="absolute inset-0 bg-red-50 flex flex-col items-center justify-center p-12 overflow-hidden">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl p-16 text-center border-8 border-red-500 relative overflow-hidden"
      >
        <motion.div 
          animate={{ opacity: [0.5, 1, 0.5] }} 
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute inset-0 bg-red-100/50 z-0"
        />
        
        <div className="relative z-10 flex flex-col items-center gap-8">
          <div className="text-red-600 bg-red-100 p-8 rounded-full">
            <AlertTriangle size={120} />
          </div>
          
          <h1 className="text-6xl font-black text-red-700 uppercase tracking-wide">
            Please Notify Staff
          </h1>
          
          <p className="text-3xl text-slate-700 font-medium">
            Your symptoms require immediate attention. A staff member needs to assist you now.
          </p>

          <LargeTouchButton 
            onClick={() => router.push('/scan')}
            className="w-full mt-8 py-8 bg-slate-900 text-white hover:bg-slate-800"
          >
            <ShieldAlert size={40} className="mr-4" />
            <span className="text-3xl">I have notified a staff member</span>
          </LargeTouchButton>
        </div>
      </motion.div>
    </div>
  );
}
