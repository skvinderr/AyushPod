"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAvatar } from '../../store/useAvatar';
import { useSessionStore } from '../../store/useSessionStore';
import { QrCode, CheckCircle2, ShieldCheck, ArrowRight, MapPin, Clock } from 'lucide-react';

export default function DoneScreen() {
  const router = useRouter();
  const { speak } = useAvatar();
  const { language, resetSession } = useSessionStore();
  
  const [dataCleared, setDataCleared] = useState(false);
  const token = "A-" + Math.floor(100 + Math.random() * 900);
  
  // Get current time
  const [time, setTime] = useState("");
  useEffect(() => {
    setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
  }, []);

  useEffect(() => {
    speak("Thank you. Your doctor will have this ready when you go in.", language);

    const timer = setTimeout(() => {
      resetSession();
      setDataCleared(true);
      speak("Your session data has been securely cleared.", language);
    }, 8000);

    return () => clearTimeout(timer);
  }, [speak, language, resetSession]);

  return (
    <div className="w-full h-full flex flex-col items-center justify-center pb-12">
      
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="w-full max-w-2xl bg-white rounded-[3rem] shadow-[0_4px_30px_rgba(0,0,0,0.05)] border-2 border-slate-100 flex flex-col relative overflow-hidden"
      >
        
        {/* Success Header Area */}
        <div className="flex flex-col items-center justify-center p-12 bg-sky-50 border-b-2 border-dashed border-slate-300">
          <div className="flex items-center gap-3 text-[#20c997] font-bold tracking-widest uppercase text-lg mb-6">
            <CheckCircle2 size={24} />
            <span>Registration Successful</span>
          </div>
          
          <h1 className="text-5xl font-black text-slate-800 tracking-tight text-center leading-tight">
            You're All Set For<br/>Your Visit
          </h1>
        </div>

        {/* Ticket Cutout Details (Left & Right semicircles to simulate ticket) */}
        <div className="absolute left-[-20px] top-[260px] w-10 h-10 bg-slate-50 rounded-full border-r-2 border-slate-300" />
        <div className="absolute right-[-20px] top-[260px] w-10 h-10 bg-slate-50 rounded-full border-l-2 border-slate-300" />

        {/* Token Details Area */}
        <div className="p-12 flex flex-col items-center">
          <span className="text-sm font-bold text-slate-400 tracking-widest uppercase">Your Ticket Number</span>
          <span className="text-8xl font-black text-slate-900 mt-2 mb-8">{token}</span>
          
          <div className="w-full flex justify-between items-center bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-12">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-full shadow-sm text-slate-500">
                <Clock size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase">Estimated Wait</span>
                <span className="text-xl font-bold text-[#00a8e8]">~12 mins</span>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-full shadow-sm text-slate-500">
                <MapPin size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-slate-400 uppercase">Go To</span>
                <span className="text-xl font-bold text-slate-800">Room 4, Level 2</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <QrCode size={120} className="text-slate-800" />
            <span className="text-sm text-slate-500 max-w-xs">Scan this QR code to track your status on your phone.</span>
          </div>

        </div>
      </motion.div>

      {/* Privacy Notice Banner */}
      <AnimatePresence>
        {dataCleared && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed bottom-12 bg-slate-800 text-white px-8 py-6 rounded-full shadow-2xl flex items-center gap-6 border-4 border-slate-700 z-50"
          >
            <ShieldCheck size={36} className="text-[#20c997]" />
            <span className="text-2xl font-medium">Session data cleared for your privacy.</span>
            <div className="w-px h-10 bg-slate-600 mx-2" />
            <button 
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-sky-300 hover:text-white font-bold text-xl transition-colors"
            >
              Start New Patient <ArrowRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
