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
        className="w-full max-w-2xl bg-surface rounded-[2rem] shadow-[var(--shadow-warm)] border border-hairline flex flex-col relative overflow-hidden"
      >

        {/* Success Header Area */}
        <div className="flex flex-col items-center justify-center p-12 bg-primary-soft border-b-2 border-dashed border-hairline">
          <div className="flex items-center gap-3 text-primary-deep font-semibold tracking-widest uppercase text-lg mb-6">
            <CheckCircle2 size={24} />
            <span>Registration Successful</span>
          </div>

          <h1 className="text-5xl font-extrabold text-ink tracking-tight text-center leading-tight">
            You're All Set For<br/>Your Visit
          </h1>
        </div>

        {/* Ticket Cutout Details (Left & Right semicircles to simulate ticket) */}
        <div className="absolute left-[-20px] top-[260px] w-10 h-10 bg-bg rounded-full border-r-2 border-hairline" />
        <div className="absolute right-[-20px] top-[260px] w-10 h-10 bg-bg rounded-full border-l-2 border-hairline" />

        {/* Token Details Area */}
        <div className="p-12 flex flex-col items-center">
          <span className="text-sm font-semibold text-muted tracking-widest uppercase">Your Ticket Number</span>
          <span className="text-8xl font-extrabold text-ink mt-2 mb-8">{token}</span>

          <div className="w-full flex justify-between items-center bg-surface-warm p-6 rounded-2xl border border-hairline mb-12">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-surface rounded-full shadow-sm text-muted">
                <Clock size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted uppercase">Estimated Wait</span>
                <span className="text-xl font-bold text-primary">~12 mins</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-surface rounded-full shadow-sm text-muted">
                <MapPin size={24} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-muted uppercase">Go To</span>
                <span className="text-xl font-bold text-ink">Room 4, Level 2</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-4 text-center">
            <QrCode size={120} className="text-ink" />
            <span className="text-sm text-muted max-w-xs">Scan this QR code to track your status on your phone.</span>
          </div>

        </div>
      </motion.div>

      {/* Privacy Notice Banner */}
      <AnimatePresence>
        {dataCleared && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed bottom-12 bg-ink text-white px-8 py-6 rounded-full shadow-2xl flex items-center gap-6 z-50"
          >
            <ShieldCheck size={36} className="text-primary" />
            <span className="text-2xl font-medium">Session data cleared for your privacy.</span>
            <div className="w-px h-10 bg-white/25 mx-2" />
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-primary-soft hover:text-white font-semibold text-xl transition-colors"
            >
              Start New Patient <ArrowRight size={24} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
