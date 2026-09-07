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
 * when idle. Right: a warm working area with a top flow bar (which of the 5
 * intake steps you're on + clock + language + idle reset) and the current
 * screen below.
 *
 * Aaya herself is rendered by <AvatarStage>, a single full-viewport overlay
 * mounted once here — she animates continuously across route changes (never
 * remounts) and can step out of this rail onto the content to guide, then
 * retreat home.
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
    <div className="flex items-start gap-2">
      {STEPS.map((s, i) => {
        const isDone = i < current;
        const isActive = i === current;
        return (
          <React.Fragment key={s.match}>
            <div className="flex flex-col items-center gap-1.5 w-[74px]">
              <div
                className={[
                  'flex items-center justify-center w-11 h-11 rounded-2xl text-lg font-bold transition-all duration-300',
                  isDone ? 'bg-primary text-white' : '',
                  isActive ? 'bg-primary text-white ring-4 ring-primary/20 scale-105 shadow-[var(--shadow-warm)]' : '',
                  !isDone && !isActive ? 'bg-surface-warm text-muted border border-hairline' : '',
                ].join(' ')}
              >
                {isDone ? <Check size={22} strokeWidth={3} /> : i + 1}
              </div>
              <span
                className={[
                  'text-sm font-semibold transition-colors',
                  isActive ? 'text-ink' : isDone ? 'text-primary-deep' : 'text-muted',
                ].join(' ')}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 h-1 rounded-full bg-surface-warm mt-5 min-w-[16px] overflow-hidden">
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

  // Idle reset — a hallmark of public kiosks. After 2 min of no interaction,
  // count down, then clear the session and return home. Any touch cancels it.
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
      <aside className="rail relative w-[360px] shrink-0 h-full flex flex-col overflow-hidden">
        <div className="rail-texture absolute inset-0 pointer-events-none" />
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'var(--rail-glow)' }} />
        {/* soft floor ellipse — the spot Aaya stands on when she is home */}
        <div
          aria-hidden
          className="absolute left-1/2 -translate-x-1/2 bottom-[150px] w-[74%] h-20 rounded-[50%] pointer-events-none"
          style={{ background: 'radial-gradient(closest-side, rgba(255,255,255,0.16), transparent)' }}
        />

        <div className="relative z-10 flex flex-col h-full px-8 pt-8 pb-7">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="bg-white/95 text-primary-deep p-2.5 rounded-2xl shadow-lg">
              <Stethoscope size={26} />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-2xl font-extrabold text-white tracking-tight">MediKiosk</span>
              <span className="text-sm font-medium text-white/70 mt-1">Aapki apni saheli</span>
            </div>
          </div>

          {/* Aaya stands here (rendered by the AvatarStage overlay above) */}
          <div className="flex-1 min-h-0" />

          {/* Nameplate */}
          <div className="min-h-[64px]">
            <p className="text-2xl font-bold text-white leading-tight">Hello, I'm Aaya</p>
            <p className="text-base text-white/75 mt-0.5">
              {state === 'listening' ? "I'm listening…" : state === 'talking' ? 'Guiding you…' : "I'll guide you the whole way."}
            </p>
          </div>

          {/* Help */}
          <button
            onClick={() => speak('I am here to help you. Just tap the big buttons on the screen, or ask a staff member nearby.', { language, gesture: 'present', stage: true })}
            className="mt-5 flex items-center justify-center gap-3 w-full py-4 rounded-2xl bg-white/15 hover:bg-white/25 active:scale-[0.98] transition text-white font-semibold text-lg border border-white/20"
          >
            <HelpCircle size={24} />
            Need help?
          </button>
        </div>
      </aside>

      {/* ===================== RIGHT: working area ===================== */}
      <main className="ambient relative flex-1 min-w-0 h-full flex flex-col">
        {/* Top flow bar */}
        <div className="relative z-20 flex items-center justify-between gap-6 px-10 pt-6 pb-3">
          <div className="min-w-0">
            {showFlow ? (
              <FlowProgress pathname={pathname} />
            ) : (
              <span className="text-lg font-semibold text-muted">
                {isUrgent ? 'Please wait for staff' : pathname === '/done' ? 'All done' : 'Welcome'}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <AnimatePresence>
              {countdown !== null && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-amber-soft text-ink font-semibold border border-amber/40"
                >
                  <RotateCcw size={18} className="text-amber" />
                  Resetting in {countdown}s
                </motion.div>
              )}
            </AnimatePresence>
            <div className="flex items-center gap-2 bg-surface px-4 py-2.5 rounded-full border border-hairline text-ink font-semibold">
              <Globe size={18} className="text-primary" />
              {LANG_LABELS[language] ?? 'English'}
            </div>
            <div className="flex items-center gap-2 bg-surface px-4 py-2.5 rounded-full border border-hairline text-muted font-semibold">
              <Clock size={18} className="text-primary" />
              {time}
            </div>
          </div>
        </div>

        {/* Screen content */}
        <div className="relative z-10 flex-1 min-h-0 px-10 pb-8">{children}</div>
      </main>

      {/* Aaya overlay — steps out of the rail onto the content to guide */}
      <AvatarStage />
    </div>
  );
}
