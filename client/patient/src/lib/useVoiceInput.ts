import { useState, useCallback } from 'react';

/**
 * A stub hook for voice input.
 * Later, this will be wired to the Sarvam AI API for native language STT.
 */
export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);

  const startListening = useCallback(() => {
    setIsListening(true);
    // Stub implementation: auto-stop after 3 seconds
    setTimeout(() => {
      setIsListening(false);
      console.log('Voice input stopped (stub)');
    }, 3000);
  }, []);

  const stopListening = useCallback(() => {
    setIsListening(false);
  }, []);

  return {
    isListening,
    startListening,
    stopListening
  };
}
