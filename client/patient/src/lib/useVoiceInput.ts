import { useState, useCallback, useRef } from 'react';

export interface VoiceResult {
  transcript: string;
  /** BCP-47 code Saaras detected/used, e.g. "hi-IN", or null. */
  languageCode: string | null;
}

export interface ListenOpts {
  /** 'transcribe' keeps the spoken language; 'translate' returns English. */
  mode?: 'transcribe' | 'translate';
  /** BCP-47 or LangId; 'unknown' auto-detects (welcome "say your language"). */
  language?: string;
  onResult?: (result: VoiceResult) => void;
  onError?: (message: string) => void;
}

/**
 * Records the mic with MediaRecorder and posts the clip to /api/stt (Sarvam
 * Saaras v3, proxied server-side). Real STT, replacing the old stub.
 *
 * `startListening(opts)` begins recording and returns immediately; call
 * `stopListening()` to end capture and trigger transcription, or let the
 * built-in 15s safety cap stop it. `onResult` fires with the transcript.
 */
export function useVoiceInput() {
  const [isListening, setIsListening] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const optsRef = useRef<ListenOpts>({});
  const capTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const cleanupStream = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
  }, []);

  const startListening = useCallback(
    async (opts: ListenOpts = {}) => {
      optsRef.current = opts;
      if (isListening) return;

      if (
        typeof navigator === 'undefined' ||
        !navigator.mediaDevices?.getUserMedia ||
        typeof MediaRecorder === 'undefined'
      ) {
        opts.onError?.('Microphone is not available on this device.');
        return;
      }

      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;
        chunksRef.current = [];

        const mime = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
          ? 'audio/webm;codecs=opus'
          : MediaRecorder.isTypeSupported('audio/webm')
            ? 'audio/webm'
            : '';
        const recorder = mime
          ? new MediaRecorder(stream, { mimeType: mime })
          : new MediaRecorder(stream);
        recorderRef.current = recorder;

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
          cleanupStream();
          if (capTimerRef.current) {
            clearTimeout(capTimerRef.current);
            capTimerRef.current = null;
          }
          const blob = new Blob(chunksRef.current, {
            type: recorder.mimeType || 'audio/webm',
          });
          chunksRef.current = [];
          if (blob.size === 0) {
            setIsTranscribing(false);
            return;
          }

          setIsTranscribing(true);
          const o = optsRef.current;
          try {
            const form = new FormData();
            form.append('audio', blob, 'audio.webm');
            form.append('mode', o.mode ?? 'transcribe');
            form.append('language', o.language ?? 'unknown');

            const res = await fetch('/api/stt', { method: 'POST', body: form });
            if (!res.ok) throw new Error(`stt ${res.status}`);
            const data = (await res.json()) as {
              transcript?: string;
              languageCode?: string | null;
            };
            o.onResult?.({
              transcript: data.transcript ?? '',
              languageCode: data.languageCode ?? null,
            });
          } catch {
            o.onError?.('I could not hear that clearly. Please try again.');
          } finally {
            setIsTranscribing(false);
          }
        };

        recorder.start();
        setIsListening(true);

        // Safety cap: STT clips should stay under ~30s; stop at 15s.
        capTimerRef.current = setTimeout(() => {
          if (recorderRef.current?.state === 'recording') {
            recorderRef.current.stop();
            setIsListening(false);
          }
        }, 15_000);
      } catch {
        cleanupStream();
        opts.onError?.('I need microphone access to hear you.');
      }
    },
    [isListening, cleanupStream],
  );

  const stopListening = useCallback(() => {
    if (recorderRef.current?.state === 'recording') {
      recorderRef.current.stop();
    }
    setIsListening(false);
  }, []);

  return { isListening, isTranscribing, startListening, stopListening };
}
