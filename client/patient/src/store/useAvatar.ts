import { create } from 'zustand';

export type AvatarState = 'idle' | 'talking' | 'listening' | 'happy' | 'concerned';

interface AvatarStore {
  state: AvatarState;
  /** 0..1 mouth-openness, driven while talking so the 3D/2D mouth can lip-sync */
  mouth: number;
  setState: (state: AvatarState) => void;
  setMouth: (v: number) => void;
  speak: (text: string, language?: string) => void;
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
  setState: (state) => set({ state }),
  setMouth: (mouth) => set({ mouth }),
  speak: (text, language = 'en') => {
    // Browser SpeechSynthesis. Swappable for Sarvam TTS later.
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-IN' : 'hi-IN';
      utterance.rate = 0.95;
      utterance.pitch = 1.05;

      utterance.onstart = () => {
        set({ state: 'talking' });
        startMouth(set);
      };
      utterance.onend = () => {
        stopMouth(set);
        set({ state: 'idle' });
      };
      utterance.onerror = () => {
        stopMouth(set);
        set({ state: 'idle' });
      };

      window.speechSynthesis.speak(utterance);
    } else {
      // Unsupported environment — simulate a talking beat so the UI still animates.
      set({ state: 'talking' });
      startMouth(set);
      setTimeout(() => {
        stopMouth(set);
        set({ state: 'idle' });
      }, 3000);
    }
  },
}));
