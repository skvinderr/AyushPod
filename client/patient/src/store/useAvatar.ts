import { create } from 'zustand';

export type AvatarState = 'idle' | 'talking' | 'listening' | 'happy' | 'concerned';

interface AvatarStore {
  state: AvatarState;
  setState: (state: AvatarState) => void;
  speak: (text: string, language?: string) => void;
}

export const useAvatar = create<AvatarStore>((set) => ({
  state: 'idle',
  setState: (state) => set({ state }),
  speak: (text, language = 'en') => {
    // Basic SpeechSynthesis API implementation
    // This can later be swapped out for Sarvam TTS API integration
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = language === 'en' ? 'en-IN' : 'hi-IN'; // Default to Indian English or Hindi
      
      utterance.onstart = () => {
        set({ state: 'talking' });
      };
      
      utterance.onend = () => {
        set({ state: 'idle' });
      };
      
      utterance.onerror = (e) => {
        console.error('Speech synthesis error', e);
        set({ state: 'idle' });
      };

      window.speechSynthesis.speak(utterance);
    } else {
      console.warn('SpeechSynthesis API not supported in this browser.');
      // Simulate talking state for testing in unsupported environments
      set({ state: 'talking' });
      setTimeout(() => set({ state: 'idle' }), 3000);
    }
  },
}));
