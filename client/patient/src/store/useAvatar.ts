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



let currentAudio: HTMLAudioElement | null = null;
let currentRequestId = 0; // Used to cancel stale requests and fix double-voice

// Fix for autoplay policy: if audio can't play automatically (before user gesture),
// queue it and play on the very next user interaction.
let pendingAudio: HTMLAudioElement | null = null;

function setupAutoplayUnlock() {
  if (typeof window === 'undefined') return;
  const unlock = () => {
    if (pendingAudio) {
      pendingAudio.play().catch(() => {});
      pendingAudio = null;
    }
    window.removeEventListener('click', unlock);
    window.removeEventListener('touchstart', unlock);
    window.removeEventListener('keydown', unlock);
  };
  window.addEventListener('click', unlock, { once: true });
  window.addEventListener('touchstart', unlock, { once: true });
  window.addEventListener('keydown', unlock, { once: true });
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
  speak: async (text, optsOrLang = 'en') => {
    if (typeof window === 'undefined') return;

    const language = typeof optsOrLang === 'string' ? optsOrLang : (optsOrLang?.language || 'en');

    // Increment request ID — any older in-flight request will see a mismatch and abort
    const myRequestId = ++currentRequestId;

    // Stop currently playing audio immediately
    if (currentAudio) {
      currentAudio.pause();
      currentAudio.src = '';
      currentAudio = null;
    }
    pendingAudio = null;

    try {
      set({ state: 'talking' });

      // Normalize to BCP-47: 'en' -> 'en-IN', 'hi-IN' stays 'hi-IN'
      const targetLang = language.includes('-') ? language : `${language}-IN`;

      const response = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, language_code: targetLang }),
      });

      // If a newer speak() call came in while we were fetching, discard this result
      if (myRequestId !== currentRequestId) return;

      if (!response.ok) {
        console.log('TTS fetch failed:', response.status);
        set({ state: 'idle' });
        return;
      }

      const data = await response.json();

      // Guard again after awaiting JSON parse
      if (myRequestId !== currentRequestId) return;

      // Sarvam bulbul:v3 returns `audios` array with base64 WAV strings
      const base64Audio = data?.audios?.[0];

      if (base64Audio) {
        const audio = new Audio(`data:audio/wav;base64,${base64Audio}`);
        currentAudio = audio;

        audio.onended = () => {
          if (myRequestId === currentRequestId) set({ state: 'idle' });
        };
        audio.onerror = () => {
          if (myRequestId === currentRequestId) set({ state: 'idle' });
        };

        try {
          await audio.play();
        } catch (autoplayError: any) {
          // Browser blocked autoplay — queue it for next user interaction
          if (autoplayError?.name === 'NotAllowedError') {
            console.log('Autoplay blocked — audio will play on next user interaction');
            pendingAudio = audio;
            setupAutoplayUnlock();
          } else {
            set({ state: 'idle' });
          }
        }
      } else {
        console.warn('No audio data received from Sarvam TTS API');
        set({ state: 'idle' });
      }

    } catch (error) {
      if (myRequestId === currentRequestId) {
        console.error('Error during TTS playback:', error);
        set({ state: 'idle' });
      }
    }
  },
}));
