"use client";

import React, { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Stethoscope, HelpCircle, Globe, Clock, RotateCcw, Check } from 'lucide-react';
import { AvatarStage } from './AvatarStage';
import { useAvatar } from '../store/useAvatar';
import { useSessionStore } from '../store/useSessionStore';

/*
 * KioskShell — the persistent split frame for the whole kiosk.
 *
 * Left: a deep-teal "consultation room" where Aaya (the doctor avatar) stands
 * and guides the patient.
 * Right: a warm working area with a compact top flow bar and the current screen.
 */

const LANG_LABELS: Record<string, string> = {
  hi: 'हिंदी', en: 'English', bn: 'বাংলা', ta: 'தமிழ்', mr: 'मराठी',
};

const STEPS = [
  { match: '/consent', label: 'Identify' },
  { match: '/complaint', label: 'Symptoms' },
  { match: '/interview', label: 'History' },
  { match: '/scan', label: 'Documents' },
  { match: '/summary', label: 'Review' },
];

const IDLE_WARN_MS = 120_000; // 2 min of no touch → start the reset countdown
const RESET_SECONDS = 20;


/** Horizontal 5-step tracker for the intake sequence. */
function FlowProgress({ pathname }: { pathname: string }) {
  const done = pathname === '/done';
  let current = STEPS.findIndex((s) => pathname.startsWith(s.match));
  if (done) current = STEPS.length; // everything complete

  return (
    <div className="flex items-center gap-1.5">
      {STEPS.map((s, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={s.match}>
            <div className="flex items-center gap-2">
              <div
                className={[
                  'flex items-center justify-center w-8 h-8 rounded-xl text-xs font-bold transition-all duration-300',
                  isDone ? 'bg-primary text-white' : '',
                  isActive ? 'bg-primary text-white ring-3 ring-primary/25 shadow-sm' : '',
                  !isDone && !isActive ? 'bg-surface-warm text-muted border border-hairline' : '',
                ].join(' ')}
              >
                {isDone ? <Check size={16} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={[
                  'text-xs font-semibold transition-colors hidden sm:inline',
                  isActive ? 'text-ink font-bold' : isDone ? 'text-primary-deep' : 'text-muted',
                ].join(' ')}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="w-4 sm:w-6 h-0.5 rounded-full bg-surface-warm overflow-hidden mx-0.5">
                <div className={`h-full rounded-full bg-primary transition-all duration-500 ${i < current ? 'w-full' : 'w-0'}`} />
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

export function KioskShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const state = useAvatar((s) => s.state);
  const caption = useAvatar((s) => s.caption);
  const speak = useAvatar((s) => s.speak);
  const language = useSessionStore((s) => s.language);
  const resetSession = useSessionStore((s) => s.resetSession);

  const [time, setTime] = useState('');
  const [countdown, setCountdown] = useState<number | null>(null);
  const lastActive = useRef(Date.now());

  const showFlow = pathname !== '/' && pathname !== '/urgent' && pathname !== '/done';
  const isUrgent = pathname === '/urgent';

  // Clock
  useEffect(() => {
    const tick = () => setTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    tick();
    const id = setInterval(tick, 10_000);
    return () => clearInterval(id);
  }, []);

  // Idle reset
  useEffect(() => {
    const bump = () => { lastActive.current = Date.now(); };
    window.addEventListener('pointerdown', bump);
    window.addEventListener('keydown', bump);
    return () => {
      window.removeEventListener('pointerdown', bump);
      window.removeEventListener('keydown', bump);
    };
  }, []);

  useEffect(() => {
    lastActive.current = Date.now();
    setCountdown(null);
  }, [pathname]);

  useEffect(() => {
    if (pathname === '/') return; // welcome screen never times out
    const id = setInterval(() => {
      const idle = Date.now() - lastActive.current;
      if (idle >= IDLE_WARN_MS) {
        const left = Math.ceil((IDLE_WARN_MS + RESET_SECONDS * 1000 - idle) / 1000);
        if (left <= 0) {
          resetSession();
          setCountdown(null);
          router.push('/');
        } else {
          setCountdown(left);
        }
      } else if (countdown !== null) {
        setCountdown(null);
      }
    }, 1000);
    return () => clearInterval(id);
  }, [pathname, countdown, resetSession, router]);

  return (
    <div className="fixed inset-0 flex overflow-hidden">
      {/* ===================== LEFT: doctor guide rail ===================== */}
      <aside className="rail relative w-[clamp(270px,22vw,300px)] shrink-0 h-full flex flex-col overflow-hidden border-r border-hairline/20">
        <div className="rail-texture absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--rail-glow)' }} />
        {/* soft floor ellipse — the spot Aaya stands on when she is home */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 bottom-[135px] w-[74%] h-16 rounded-[50%] pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.18), transparent)' }}
        />

        <div className="relative z-10 flex flex-col h-full px-4 pt-3.5 pb-3">
          {/* Brand */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="bg-white/95 text-primary-deep p-2 rounded-xl shadow-md">
              <Stethoscope size={20} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-extrabold text-white tracking-tight">MediKiosk</span>
              <span className="text-xs font-medium text-white/70 mt-0.5">Aapki apni saheli</span>
            </div>
          </div>

          {/* Aaya stands here when idle (rendered by the AvatarStage overlay) */}
          <div className="flex-1 min-h-0" />

          {/* Nameplate & Live status */}
          <div className="shrink-0 bg-white/10 backdrop-blur-xs rounded-xl p-2.5 border border-white/15 min-h-[52px]">
            <p className="text-sm font-bold text-white leading-tight">Hello, I'm Aaya</p>
            <p className="text-xs text-white/80 mt-0.5 line-clamp-2">
              {state === 'listening' ? "I'm listening…" : state === 'talking' ? 'Guiding you…' : "I'll guide you the whole way."}
            </p>
          </div>

          {/* Help */}
          <button
            onClick={() => speak('I am here to help you. Just tap the buttons on the screen, or ask a staff member nearby.', { language, gesture: 'present', stage: true })}
            className="mt-2.5 shrink-0 flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-white/15 hover:bg-white/25 active:scale-[0.98] transition text-white font-semibold text-xs sm:text-sm border border-white/20"
          >
            <HelpCircle size={17} />
            Need help?
          </button>
        </div>
      </aside>

      {/* ===================== RIGHT: working area ===================== */}
      <main className="ambient relative flex-1 min-w-0 h-full flex flex-col">
        {/* Top flow bar */}
        <div className="relative z-20 flex items-center justify-between gap-3 px-6 pt-3 pb-2 shrink-0">
          <div className="min-w-0">
            {showFlow ? (
              <FlowProgress pathname={pathname} />
            ) : (
              <span className="text-sm font-semibold text-muted">
                {isUrgent ? 'Please wait for staff' : pathname === '/done' ? 'All done' : 'Welcome'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <AnimatePresence>
              {countdown !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-soft text-ink text-xs font-semibold border border-amber/40"
                >
                  <RotateCcw size={14} className="text-amber" />
                  Resetting in {countdown}s
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-hairline text-ink text-xs font-semibold shadow-xs">
              <Globe size={14} className="text-primary" />
              {LANG_LABELS[language] ?? 'English'}
            </div>
            <div className="flex items-center gap-1.5 bg-surface px-3 py-1.5 rounded-full border border-hairline text-muted text-xs font-semibold shadow-xs">
              <Clock size={14} className="text-primary" />
              {time}
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div className="relative z-10 flex-1 min-h-0 px-6 pb-4 pt-1 overflow-hidden">{children}</div>
      </main>

      {/* Aaya overlay — animates between rail corner and stage */}
      <AvatarStage />
    </div>
  );
}
