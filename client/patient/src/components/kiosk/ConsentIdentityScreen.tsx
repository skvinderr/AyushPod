

// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import {
//   Plus,
//   Volume2,
//   ArrowLeft,
//   QrCode,
//   Fingerprint,
//   UserPlus,
//   CheckCircle2,
//   ShieldCheck,
//   Mic,
//   FileText,
//   Users,
//   X,
//   Lock,
//   Check,
//   PlayCircle,
//   PauseCircle,
// } from "lucide-react";
// import { useKioskStore, type IdMethod } from "@/lib/useKioskStore";

// const ID_OPTIONS: { id: IdMethod; title: string; sub: string; icon: typeof QrCode }[] = [
//   { id: "abha", title: "ABHA ID", sub: "Digital Health ID / आभा कार्ड", icon: QrCode },
//   { id: "aadhaar", title: "Aadhaar", sub: "UIDAI Bio/Card / आधार कार्ड", icon: Fingerprint },
//   { id: "new", title: "New Patient", sub: "Walk-in Registration / नयी पंजीकरण पर्ची", icon: UserPlus },
// ];

// const CONSENT_ROWS: {
//   key: "voiceAnswers" | "healthRecords" | "careTeam";
//   title: string;
//   sub: string;
//   icon: typeof Mic;
// }[] = [
//   {
//     key: "voiceAnswers",
//     title: "Voice Answers / आवाज़ उत्तर",
//     sub: "Voice data for symptom triage and interactive clinical answers",
//     icon: Mic,
//   },
//   {
//     key: "healthRecords",
//     title: "Health Records / डिजिटल स्वास्थ्य रिकॉर्ड",
//     sub: "Ayushman Bharat digital record access and past diagnostic tests",
//     icon: FileText,
//   },
//   {
//     key: "careTeam",
//     title: "Hospital Care Team / अस्पताल मेडिकल टीम",
//     sub: "Duty doctor & triage nurse access to today's kiosk intake notes",
//     icon: Users,
//   },
// ];

// export default function ConsentIdentityScreen() {
//   const router = useRouter();
//   const selectedId = useKioskStore((s) => s.selectedId);
//   const setSelectedId = useKioskStore((s) => s.setSelectedId);
//   const consents = useKioskStore((s) => s.consents);
//   const toggleConsent = useKioskStore((s) => s.toggleConsent);
//   const allGranted = useKioskStore((s) => s.allConsentsGranted());

//   // Visual-only states for the "dynamic" bits — no real audio/voice yet
//   const [playingRow, setPlayingRow] = useState<string | null>(null);
//   const [listening, setListening] = useState(false);
//   const [readingIntro, setReadingIntro] = useState(false);

//   const canContinue = selectedId !== null && allGranted;

//   const handlePlayExplainer = (key: string) => {
//     setPlayingRow(key);
//     setTimeout(() => setPlayingRow((current) => (current === key ? null : current)), 2500);
//   };

//   const handleListen = () => {
//     setReadingIntro(true);
//     setTimeout(() => setReadingIntro(false), 2500);
//   };

//   const handleSpeakAgree = () => {
//     setListening(true);
//     setTimeout(() => setListening(false), 2500);
//   };

//   return (
//     <main className="min-h-screen w-full bg-[#f8f9ff]">
//       {/* Full-width header bar */}
//       <header className="w-full border-b border-slate-200 bg-white">
//         <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
//           <div className="flex items-center gap-3">
//             <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f766e] text-white">
//               <Plus size={22} strokeWidth={2.5} />
//             </div>
//             <div>
//               <div className="flex items-center gap-2">
//                 <span className="font-semibold text-[#0f766e]">MediKiosk</span>
//                 <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
//                   Clinical 2.0
//                 </span>
//               </div>
//               <p className="text-xs text-slate-500">National Health Mission · Verified Portal</p>
//             </div>
//           </div>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={handleListen}
//               className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
//                 readingIntro
//                   ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]"
//                   : "border-slate-200 text-slate-600 hover:border-[#0f766e] hover:text-[#0f766e]"
//               }`}
//             >
//               <Volume2 size={16} className={readingIntro ? "animate-pulse" : ""} />
//               सुनें / Tap to Listen
//             </button>

//             <div className="text-right">
//               <p className="text-xs font-medium text-slate-500">Step 1 of 4 · 25% Done</p>
//               <div className="mt-1 h-1.5 w-24 rounded-full bg-slate-100">
//                 <div className="h-1.5 w-1/4 rounded-full bg-[#0f766e]" />
//               </div>
//             </div>

//             <button
//               onClick={() => router.back()}
//               className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-400"
//             >
//               <ArrowLeft size={16} />
//               Go Back
//             </button>
//           </div>
//         </div>
//       </header>

//       {/* Main content — wide, fills the screen */}
//       <div className="mx-auto max-w-6xl px-8 py-10">
//         <div className="flex items-start justify-between gap-4">
//           <div>
//             <h1 className="text-2xl font-semibold text-slate-900">
//               Please choose your ID &amp; confirm consent
//             </h1>
//             <p className="mt-1 text-sm text-slate-500">
//               कृपया पहचान के माध्यम चुनें एवं सहमति प्रदान करें
//             </p>
//           </div>
//           <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#0f766e]/30 bg-[#0f766e]/5 px-3 py-1.5 text-xs font-medium text-[#0f766e]">
//             <ShieldCheck size={14} />
//             ABHA Ayushman Certified
//           </span>
//         </div>

//         {/* ID selection cards */}
//         <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
//           {ID_OPTIONS.map((opt) => {
//             const selected = selectedId === opt.id;
//             const Icon = opt.icon;
//             return (
//               <button
//                 key={opt.id}
//                 onClick={() => setSelectedId(opt.id)}
//                 aria-pressed={selected}
//                 className={`relative min-h-[110px] rounded-2xl border-2 p-5 text-left transition-all ${
//                   selected
//                     ? "border-[#0f766e] bg-[#0f766e]/5 shadow-sm"
//                     : "border-slate-200 bg-white hover:border-slate-300"
//                 }`}
//               >
//                 {selected && (
//                   <CheckCircle2
//                     size={22}
//                     className="absolute -right-2 -top-2 rounded-full bg-white text-[#0f766e]"
//                     fill="white"
//                   />
//                 )}
//                 <div
//                   className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
//                     selected ? "bg-[#0f766e] text-white" : "bg-slate-100 text-slate-500"
//                   }`}
//                 >
//                   <Icon size={20} />
//                 </div>
//                 <p className=" font-semibold  text-slate-900">{opt.title}</p>
//                 <p className="mt-1 text-xs leading-snug text-slate-500">{opt.sub}</p>
//               </button>
//             );
//           })}
//         </div>

//         {/* Consent rows */}
//         <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
//           <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
//             <div className="flex items-center gap-2">
//               <ShieldCheck size={18} className="text-[#0f766e]" />
//               <div>
//                 <span className="text-sm  font-semibold  text-slate-800">Consent &amp; Permissions</span>
//                 <span className="ml-2 text-xs text-slate-400">· Patient Data Sharing Accord</span>
//               </div>
//             </div>
//             <span className="text-xs font-medium text-slate-500">All 3 Required to Continue</span>
//           </div>

//           {CONSENT_ROWS.map((row, i) => {
//             const Icon = row.icon;
//             const granted = consents[row.key];
//             const isPlaying = playingRow === row.key;
//             return (
//               <div
//                 key={row.key}
//                 className={`flex items-center justify-between px-5 py-4 ${
//                   i < CONSENT_ROWS.length - 1 ? "border-b border-slate-100" : ""
//                 } ${granted ? "" : "opacity-60"}`}
//               >
//                 <div className="flex items-center gap-3">
//                   <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
//                     <Icon size={18} />
//                   </div>
//                   <div>
//                     <p className="text-sm font-medium text-slate-900">{row.title}</p>
//                     <p className="text-xs text-slate-500">{row.sub}</p>
//                   </div>
//                 </div>

//                 <div className="flex items-center gap-3">
//                   <button
//                     onClick={() => handlePlayExplainer(row.key)}
//                     className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-[#0f766e] hover:text-[#0f766e]"
//                   >
//                     {isPlaying ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
//                     {isPlaying ? "Playing…" : "Play Explainer"}
//                   </button>

//                   <button
//                     onClick={() => toggleConsent(row.key)}
//                     aria-pressed={granted}
//                     aria-label={granted ? `Revoke ${row.title}` : `Grant ${row.title}`}
//                     className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
//                       granted ? "bg-[#0f766e]" : "bg-slate-300"
//                     }`}
//                   >
//                     <span
//                       className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-transform ${
//                         granted ? "translate-x-7 text-[#0f766e]" : "translate-x-1 text-slate-400"
//                       }`}
//                     >
//                       {granted ? <X size={14} /> : <Plus size={14} />}
//                     </span>
//                   </button>
//                 </div>
//               </div>
//             );
//           })}
//         </div>

//         {/* Footer */}
//         <div className="mt-8 flex flex-col items-center gap-5 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
//           <p className="flex items-start gap-2 text-xs text-slate-500">
//             <Lock size={14} className="mt-0.5 shrink-0" />
//             <span>
//               Data Protected under DISHA &amp; ABDM Guidelines
//               <br />
//               24/7 Citizen Health Helpline 104 · Zero personal data stored on this kiosk terminal.
//             </span>
//           </p>

//           <div className="flex items-center gap-3">
//             <button
//               onClick={handleSpeakAgree}
//               className={`flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors ${
//                 listening
//                   ? "border-amber-400 bg-amber-100 text-amber-800"
//                   : "border-amber-300 bg-amber-50 text-amber-700"
//               }`}
//             >
//               <Mic size={16} className={listening ? "animate-pulse" : ""} />
//               {listening ? "Listening…" : 'Speak: "Yes, I Agree"'}
//             </button>

//             <button
//               disabled={!canContinue}
//               onClick={() => router.push("/complaint")}
//               className={`flex min-h-[56px] items-center gap-2 rounded-full px-8 text-base font-medium text-white transition-colors ${
//                 canContinue ? "bg-[#0f766e] hover:bg-[#0d6058]" : "cursor-not-allowed bg-slate-300"
//               }`}
//             >
//               <Check size={18} />
//               I Agree / सहमत हूँ
//             </button>
//           </div>
//         </div>
//       </div>
//     </main>
//   );
// }




"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Plus,
  Volume2,
  ArrowLeft,
  QrCode,
  Fingerprint,
  UserPlus,
  CheckCircle2,
  ShieldCheck,
  Mic,
  FileText,
  Users,
  X,
  Lock,
  Check,
  PlayCircle,
  PauseCircle,
  Languages,
} from "lucide-react";
import { useKioskStore, type IdMethod, type Language } from "@/lib/useKioskStore";

const ID_OPTIONS: { id: IdMethod; title: string; sub: string; icon: typeof QrCode }[] = [
  { id: "abha", title: "ABHA ID", sub: "Digital Health ID / आभा कार्ड", icon: QrCode },
  { id: "aadhaar", title: "Aadhaar", sub: "UIDAI Bio/Card / आधार कार्ड", icon: Fingerprint },
  { id: "new", title: "New Patient", sub: "Walk-in Registration / नयी पंजीकरण पर्ची", icon: UserPlus },
];

type ConsentKey = "voiceAnswers" | "healthRecords" | "careTeam";

const CONSENT_ROWS: { key: ConsentKey; title: string; sub: string; icon: typeof Mic }[] = [
  {
    key: "voiceAnswers",
    title: "Voice Answers / आवाज़ उत्तर",
    sub: "Voice data for symptom triage and interactive clinical answers",
    icon: Mic,
  },
  {
    key: "healthRecords",
    title: "Health Records / डिजिटल स्वास्थ्य रिकॉर्ड",
    sub: "Ayushman Bharat digital record access and past diagnostic tests",
    icon: FileText,
  },
  {
    key: "careTeam",
    title: "Hospital Care Team / अस्पताल मेडिकल टीम",
    sub: "Duty doctor & triage nurse access to today's kiosk intake notes",
    icon: Users,
  },
];

// Pre-recorded audio files, bundled in public/audio/ — play fully offline.
// Filenames must exactly match what's in client/patient/public/audio/.
const SUMMARY_AUDIO: Record<Language, string> = {
  en: "/audio/consent-summary-en.mp3",
  hi: "/audio/consent-summary-hi.mp3",
};

const EXPLAINER_AUDIO: Record<ConsentKey, Record<Language, string>> = {
  voiceAnswers: { en: "/audio/voice-answers-en.mp3", hi: "/audio/voice-answers-hi.mp3" },
  healthRecords: { en: "/audio/health-records-en.mp3", hi: "/audio/health-records-hi.mp3" },
  careTeam: { en: "/audio/care-team-en.mp3", hi: "/audio/care-team-hi.mp3" },
};

export default function ConsentIdentityScreen() {
  const router = useRouter();
  const selectedId = useKioskStore((s) => s.selectedId);
  const setSelectedId = useKioskStore((s) => s.setSelectedId);
  const consents = useKioskStore((s) => s.consents);
  const toggleConsent = useKioskStore((s) => s.toggleConsent);
  const allGranted = useKioskStore((s) => s.allConsentsGranted());
  const language = useKioskStore((s) => s.language);
  const setLanguage = useKioskStore((s) => s.setLanguage);

  const [playingRow, setPlayingRow] = useState<string | null>(null);
  const [readingIntro, setReadingIntro] = useState(false);
  const [listening, setListening] = useState(false); // still a placeholder — voice INPUT, not covered here
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const canContinue = selectedId !== null && allGranted;

  /**
   * Plays a local pre-recorded MP3 from public/audio/.
   * Stops any currently-playing clip first so audio never overlaps.
   * onStart/onEnd let the calling button track its own "is this playing"
   * state accurately, tied to the real audio element's events.
   */
  const playClip = (src: string, onStart: () => void, onEnd: () => void) => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }

    const audio = new Audio(src);
    audio.onplay = onStart;
    audio.onended = onEnd;
    audio.onerror = () => {
      // Missing/undownloaded file, or unsupported format — fail quietly.
      onEnd();
      console.warn(`Could not play audio clip: ${src}`);
    };

    audioRef.current = audio;
    audio.play();
  };

  const handleListen = () => {
    playClip(
      SUMMARY_AUDIO[language],
      () => setReadingIntro(true),
      () => setReadingIntro(false)
    );
  };

  const handlePlayExplainer = (key: ConsentKey) => {
    playClip(
      EXPLAINER_AUDIO[key][language],
      () => setPlayingRow(key),
      () => setPlayingRow((current) => (current === key ? null : current))
    );
  };

  const handleSpeakAgree = () => {
    // Voice INPUT (speech recognition) — not implemented yet.
    // Kept as a visual-only placeholder until that feature is built.
    setListening(true);
    setTimeout(() => setListening(false), 2000);
  };

  return (
    <main className="min-h-screen w-full bg-[#f8f9ff]">
      <header className="w-full border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-8 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#0f766e] text-white">
              <Plus size={22} strokeWidth={2.5} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-[#0f766e]">MediKiosk</span>
                <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-600">
                  Clinical 2.0
                </span>
              </div>
              <p className="text-xs text-slate-500">National Health Mission · Verified Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language toggle — drives which language the voice guide speaks */}
            <div className="flex items-center gap-1 rounded-full border border-slate-200 p-1">
              <Languages size={14} className="ml-1.5 text-slate-400" />
              {(["en", "hi"] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                    language === lang ? "bg-[#0f766e] text-white" : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {lang === "en" ? "EN" : "हिं"}
                </button>
              ))}
            </div>

            <button
              onClick={handleListen}
              className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors ${
                readingIntro
                  ? "border-[#0f766e] bg-[#0f766e]/10 text-[#0f766e]"
                  : "border-slate-200 text-slate-600 hover:border-[#0f766e] hover:text-[#0f766e]"
              }`}
            >
              <Volume2 size={16} className={readingIntro ? "animate-pulse" : ""} />
              सुनें / Tap to Listen
            </button>

            <div className="text-right">
              <p className="text-xs font-medium text-slate-500">Step 1 of 4 · 25% Done</p>
              <div className="mt-1 h-1.5 w-24 rounded-full bg-slate-100">
                <div className="h-1.5 w-1/4 rounded-full bg-[#0f766e]" />
              </div>
            </div>

            <button
              onClick={() => router.back()}
              className="flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600 hover:border-slate-400"
            >
              <ArrowLeft size={16} />
              Go Back
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-8 py-10">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              Please choose your ID &amp; confirm consent
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              कृपया पहचान के माध्यम चुनें एवं सहमति प्रदान करें
            </p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 rounded-full border border-[#0f766e]/30 bg-[#0f766e]/5 px-3 py-1.5 text-xs font-medium text-[#0f766e]">
            <ShieldCheck size={14} />
            ABHA Ayushman Certified
          </span>
        </div>

        <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-3">
          {ID_OPTIONS.map((opt) => {
            const selected = selectedId === opt.id;
            const Icon = opt.icon;
            return (
              <button
                key={opt.id}
                onClick={() => setSelectedId(opt.id)}
                aria-pressed={selected}
                className={`relative min-h-[110px] rounded-2xl border-2 p-5 text-left transition-all ${
                  selected
                    ? "border-[#0f766e] bg-[#0f766e]/5 shadow-sm"
                    : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                {selected && (
                  <CheckCircle2
                    size={22}
                    className="absolute -right-2 -top-2 rounded-full bg-white text-[#0f766e]"
                    fill="white"
                  />
                )}
                <div
                  className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${
                    selected ? "bg-[#0f766e] text-white" : "bg-slate-100 text-slate-500"
                  }`}
                >
                  <Icon size={20} />
                </div>
                <p className="font-semibold text-slate-900">{opt.title}</p>
                <p className="mt-1 text-xs leading-snug text-slate-500">{opt.sub}</p>
              </button>
            );
          })}
        </div>

        <div className="mt-8 rounded-2xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck size={18} className="text-[#0f766e]" />
              <div>
                <span className="text-sm font-semibold text-slate-800">Consent &amp; Permissions</span>
                <span className="ml-2 text-xs text-slate-400">· Patient Data Sharing Accord</span>
              </div>
            </div>
            <span className="text-xs font-medium text-slate-500">All 3 Required to Continue</span>
          </div>

          {CONSENT_ROWS.map((row, i) => {
            const Icon = row.icon;
            const granted = consents[row.key];
            const isPlaying = playingRow === row.key;
            return (
              <div
                key={row.key}
                className={`flex items-center justify-between px-5 py-4 ${
                  i < CONSENT_ROWS.length - 1 ? "border-b border-slate-100" : ""
                } ${granted ? "" : "opacity-60"}`}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                    <Icon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{row.title}</p>
                    <p className="text-xs text-slate-500">{row.sub}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handlePlayExplainer(row.key)}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 px-3 py-1.5 text-xs text-slate-600 hover:border-[#0f766e] hover:text-[#0f766e]"
                  >
                    {isPlaying ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                    {isPlaying ? "Playing…" : "Play Explainer"}
                  </button>

                  <button
                    onClick={() => toggleConsent(row.key)}
                    aria-pressed={granted}
                    aria-label={granted ? `Revoke ${row.title}` : `Grant ${row.title}`}
                    className={`relative h-8 w-14 shrink-0 rounded-full transition-colors ${
                      granted ? "bg-[#0f766e]" : "bg-slate-300"
                    }`}
                  >
                    <span
                      className={`absolute top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow transition-transform ${
                        granted ? "translate-x-7 text-[#0f766e]" : "translate-x-1 text-slate-400"
                      }`}
                    >
                      {granted ? <X size={14} /> : <Plus size={14} />}
                    </span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 flex flex-col items-center gap-5 border-t border-slate-100 pt-6 sm:flex-row sm:justify-between">
          <p className="flex items-start gap-2 text-xs text-slate-500">
            <Lock size={14} className="mt-0.5 shrink-0" />
            <span>
              Data Protected under DISHA &amp; ABDM Guidelines
              <br />
              24/7 Citizen Health Helpline 104 · Zero personal data stored on this kiosk terminal.
            </span>
          </p>

          <div className="flex items-center gap-3">
            <button
              onClick={handleSpeakAgree}
              className={`flex items-center gap-2 rounded-full border px-4 py-3 text-sm font-medium transition-colors ${
                listening
                  ? "border-amber-400 bg-amber-100 text-amber-800"
                  : "border-amber-300 bg-amber-50 text-amber-700"
              }`}
            >
              <Mic size={16} className={listening ? "animate-pulse" : ""} />
              {listening ? "Listening…" : 'Speak: "Yes, I Agree"'}
            </button>

            <button
              disabled={!canContinue}
              onClick={() => router.push("/complaint")}
              className={`flex min-h-[56px] items-center gap-2 rounded-full px-8 text-base font-medium text-white transition-colors ${
                canContinue ? "bg-[#0f766e] hover:bg-[#0d6058]" : "cursor-not-allowed bg-slate-300"
              }`}
            >
              <Check size={18} />
              I Agree / सहमत हूँ
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
