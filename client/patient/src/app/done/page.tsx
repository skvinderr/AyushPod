"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { QrCode, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function DoneScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, resetSession } = useSessionStore();
  
  const [dataCleared, setDataCleared] = useState(false);
  const token = "TKN-" + Math.floor(100 + Math.random() * 900);

  useEffect(() => {
    // Initial greeting
    speak("Thank you. Your doctor will have this ready when you go in.", language);

    // Auto-clear session data after 8 seconds for privacy demo
    const timer = setTimeout(() => {
      resetSession();
      setDataCleared(true);
      speak("Your session data has been securely cleared.", language);
    }, 8000);

    return () => clearTimeout(timer);
  }, [speak, language, resetSession]);

  return (
    <div className="absolute inset-0 bg-slate-50 flex flex-col items-center justify-center p-12 overflow-hidden">
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="max-w-4xl w-full bg-white rounded-[3rem] shadow-2xl p-16 flex flex-col items-center text-center relative overflow-hidden border-2 border-slate-100"
      >
        <div className="text-[#20c997] mb-8 bg-[#20c997]/10 p-6 rounded-full">
          <CheckCircle2 size={100} />
        </div>
        
        <h1 className="text-6xl font-black text-slate-800 tracking-tight">
          You're all set!
        </h1>
        
        <p className="text-3xl text-slate-600 mt-6 max-w-2xl">
          Your file has been sent to the doctor's dashboard. Please take a seat in the waiting area.
        </p>

        {/* Token Card */}
        <div className="mt-12 bg-sky-50 border-4 border-sky-100 rounded-[2rem] p-12 flex gap-12 items-center">
          <div className="bg-white p-4 rounded-[2rem] shadow-sm border-2 border-slate-100">
            <QrCode size={120} className="text-[#00a8e8]" />
          </div>
          <div className="flex flex-col items-start text-left">
            <span className="text-2xl font-bold text-slate-500 uppercase tracking-widest">Your Token</span>
            <span className="text-7xl font-black text-[#00a8e8] tracking-wider">{token}</span>
          </div>
        </div>

      </motion.div>

      {/* Privacy Notice Banner */}
      <AnimatePresence>
        {dataCleared && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="absolute bottom-12 bg-slate-800 text-white px-8 py-6 rounded-full shadow-2xl flex items-center gap-6 border-4 border-slate-700"
          >
            <ShieldCheck size={36} className="text-green-400" />
            <span className="text-2xl font-medium">Session data cleared for your privacy.</span>
            <div className="w-px h-10 bg-slate-600 mx-2" />
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-blue-300 hover:text-white font-bold text-xl"
            >
              Start New Patient <ArrowRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
