import { create } from 'zustand';

export type AvatarState = 'idle' | 'talking' | 'listening' | 'happy' | 'concerned';

/** Where Aaya is on screen: her calm corner home, or out on the stage guiding. */
export type AvatarPresence = 'corner' | 'stage';

/** Hand/arm poses Aaya can strike while guiding. */
export type AvatarGesture =
  | 'none'
  | 'wave'
  | 'welcome'
  | 'point-right'
  | 'point-down'
  | 'present';

interface SpeakOpts {
  language?: string;
  /** Bring Aaya onto the stage for this line, then auto-retreat when it ends. */
  stage?: boolean;
  /** Hand gesture to strike while speaking. */
  gesture?: AvatarGesture;
}

interface AvatarStore {
  state: AvatarState;
  /** 0..1 mouth-openness, driven while talking so the 3D/2D mouth can lip-sync */
  mouth: number;
  presence: AvatarPresence;
  gesture: AvatarGesture;
  /** The line Aaya is currently speaking — shown in her speech bubble on stage. */
  caption: string;
  setState: (state: AvatarState) => void;
  setMouth: (v: number) => void;
  enterStage: (gesture?: AvatarGesture) => void;
  exitStage: () => void;
  speak: (text: string, opts?: SpeakOpts | string) => void;
}

let mouthTimer: ReturnType<typeof setInterval> | null = null;
let fallbackTimer: ReturnType<typeof setTimeout> | null = null;
// The audio element for the line currently playing. Each new line stops the
// previous one so lines never overlap. Monotonic token guards against a slow
// TTS response arriving after a newer line has already started.
let currentAudio: HTMLAudioElement | null = null;
let speakToken = 0;

function stopCurrentAudio() {
  if (currentAudio) {
    currentAudio.onended = null;
    currentAudio.onerror = null;
    try {
      currentAudio.pause();
    } catch {
      /* ignore */
    }
    currentAudio = null;
  }
}

function startMouth(set: (partial: Partial<AvatarStore>) => void) {
  stopMouth(set);
  // Pseudo-viseme: jitter the mouth openness on a fast interval. Cheap, and
  // reads as speech without needing real audio-amplitude analysis.
  mouthTimer = setInterval(() => {
    set({ mouth: 0.25 + Math.random() * 0.75 });
  }, 90);
}

function stopMouth(set: (partial: Partial<AvatarStore>) => void) {
  if (mouthTimer) {
    clearInterval(mouthTimer);
    mouthTimer = null;
  }
  set({ mouth: 0 });
}

export const useAvatar = create<AvatarStore>((set) => ({
  state: 'idle',
  mouth: 0,
  presence: 'corner',
  gesture: 'none',
  caption: '',
  setState: (state) => set({ state }),
  setMouth: (mouth) => set({ mouth }),
  enterStage: (gesture = 'present') => set({ presence: 'stage', gesture }),
  exitStage: () => set({ presence: 'corner', gesture: 'none', caption: '' }),
  speak: (text, opts) => {
    // Back-compat: speak(text, 'hi') still works; new call is speak(text, { ... }).
    const o: SpeakOpts = typeof opts === 'string' ? { language: opts } : opts || {};
    const language = o.language ?? 'en';
    const wantsStage = !!o.stage;
    const gesture = o.gesture ?? (wantsStage ? 'present' : 'none');

    // Clear any in-flight line so a new one takes over cleanly.
    if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
    stopCurrentAudio();
    const myToken = ++speakToken;

    // Enter IMMEDIATELY (synchronously) so guidance is always visible — even on
    // kiosks whose SpeechSynthesis has no installed voices and never fires
    // onstart/onend. TTS, when it works, just adds the voice on top.
    set({ state: 'talking', caption: text });
    if (wantsStage) set({ presence: 'stage', gesture });
    startMouth(set);

    let ended = false;
    const finish = () => {
      if (ended) return;
      ended = true;
      if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
      stopCurrentAudio();
      stopMouth(set);
      // Retreat to the corner after guiding; caption is only shown while
      // actively speaking, so always clear it here.
      set({ state: 'idle', caption: '', gesture: 'none', presence: 'corner' });
    };

    // Reading-time fallback so she always retreats, TTS or not (~150 wpm).
    // If Sarvam audio arrives and plays, its real `onended` drives `finish()`
    // instead (more accurate); the timer still covers the silent/offline case.
    const words = text.trim().split(/\s+/).filter(Boolean).length;
    const estMs = Math.min(12_000, Math.max(2_600, words * 380));
    fallbackTimer = setTimeout(finish, estMs);

    // Sarvam Bulbul v3 via our server proxy. The key stays server-side; the
    // browser only ever talks to /api/tts. Any failure leaves the fallback
    // timer in charge, so Aaya still guides silently and never hangs.
    if (typeof window !== 'undefined') {
      fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language }),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject(res.status)))
        .then((data: { audio?: string }) => {
          // A newer line started while we were waiting — drop this audio.
          if (myToken !== speakToken || ended || !data.audio) return;
          const audio = new Audio(`data:audio/wav;base64,${data.audio}`);
          currentAudio = audio;
          // Real audio is playing: extend past the reading estimate and let
          // playback end drive the retreat.
          if (fallbackTimer) { clearTimeout(fallbackTimer); fallbackTimer = null; }
          audio.onended = () => {
            if (myToken === speakToken) finish();
          };
          audio.onerror = () => {
            if (myToken === speakToken) finish();
          };
          audio.play().catch(() => {
            // Autoplay blocked or decode failed — fall back to a fresh timer.
            if (myToken === speakToken && !ended) {
              fallbackTimer = setTimeout(finish, estMs);
            }
          });
        })
        .catch(() => {
          /* network/500: fallback timer already scheduled */
        });
    }
  },
}));

// Dev-only affordance: expose the store so the avatar can be driven/pinned from
// the browser console (e.g. useAvatar.setState({ presence: 'stage' })) while
// tuning her look. Stripped from production builds.
if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
  (window as unknown as { useAvatar?: typeof useAvatar }).useAvatar = useAvatar;
}
