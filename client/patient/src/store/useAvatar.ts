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

    const onSpeakStart = () => {
      set({ state: 'talking', caption: text });
      if (wantsStage) set({ presence: 'stage', gesture });
      startMouth(set);
    };
    const onSpeakEnd = () => {
      stopMouth(set);
      // Retreat to the corner after guiding; keep the resting state calm.
      set({ state: 'idle' });
      if (wantsStage) set({ presence: 'corner', gesture: 'none', caption: '' });
    };

    // Browser SpeechSynthesis. Swappable for Sarvam TTS later.
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-IN' : 'hi-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      utterance.onstart = onSpeakStart;
      utterance.onend = onSpeakEnd;
      utterance.onerror = onSpeakEnd;

      window.speechSynthesis.speak(utterance);
    } else {
      // Unsupported environment — simulate a talking beat so the UI still animates.
      onSpeakStart();
      setTimeout(onSpeakEnd, 3000);
    }
  },
}));
