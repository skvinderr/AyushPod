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
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      // Cancel any ongoing speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Language code determine karein
      const targetLang = language === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.lang = targetLang;

      // Available voices Fetch karein
      const voices = window.speechSynthesis.getVoices();

      // Selected language ke according exact Voice match find karein
      const selectedVoice = voices.find(
        (voice) => voice.lang.includes(targetLang) || voice.lang.replace('_', '-').includes(targetLang)
      );

      // Explicitly voice attach karein (agar browser mein Hindi voice mil jaye)
      if (selectedVoice) {
        utterance.voice = selectedVoice;
      }

      utterance.onstart = () => {
        set({ state: 'talking' });
      };
      
      utterance.onend = () => {
        set({ state: 'idle' });
      };
      
      utterance.onerror = (e) => {
        console.log('Speech synthesis error', e);
        set({ state: 'idle' });
      };

      // Firefox/Chrome bug fix: Chrome mein kabhi-kabhi voices delay se load hoti hain
      if (voices.length === 0) {
        window.speechSynthesis.onvoiceschanged = () => {
          const reloadedVoices = window.speechSynthesis.getVoices();
          const match = reloadedVoices.find((v) => v.lang.includes(targetLang));
          if (match) utterance.voice = match;
          window.speechSynthesis.speak(utterance);
        };
      } else {
        window.speechSynthesis.speak(utterance);
      }
    } else {
      console.warn('SpeechSynthesis API not supported in this browser.');
      set({ state: 'talking' });
      setTimeout(() => set({ state: 'idle' }), 3000);
    }
  },
}));