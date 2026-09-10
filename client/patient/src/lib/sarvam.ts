// Server-only Sarvam helper. Reads SARVAM_API_KEY from the environment and
// wraps the two endpoints we need: Bulbul v3 (TTS) and Saaras v3 (STT).
// This module MUST NOT be imported from client components — the key would
// leak into the browser bundle. It is only ever imported by the route
// handlers under app/api/*, which always run on the server.

const SARVAM_BASE = 'https://api.sarvam.ai';

// Warm female v3 voice for Aaya. Bulbul v3 speakers differ from v2
// (anushka/vidya are v2). "ritu" is a natural warm female v3 voice.
const AAYA_SPEAKER = 'ritu';

function getKey(): string {
  const key = process.env.SARVAM_API_KEY;
  if (!key) {
    throw new Error('SARVAM_API_KEY is not set');
  }
  return key;
}

export interface TtsResult {
  /** base64-encoded WAV audio */
  audio: string;
}

/**
 * Synthesize `text` in `languageCode` (BCP-47, e.g. "hi-IN") with Bulbul v3.
 * Returns the first base64 WAV clip Sarvam produces.
 */
export async function synthesizeSpeech(
  text: string,
  languageCode: string,
): Promise<TtsResult> {
  const res = await fetch(`${SARVAM_BASE}/text-to-speech`, {
    method: 'POST',
    headers: {
      'api-subscription-key': getKey(),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: text.slice(0, 2500),
      language_code: languageCode,
      model: 'bulbul:v3',
      speaker: AAYA_SPEAKER,
      pace: 0.95,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Sarvam TTS ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as { audios?: string[] };
  const audio = data.audios?.[0];
  if (!audio) {
    throw new Error('Sarvam TTS returned no audio');
  }
  return { audio };
}

export interface SttResult {
  transcript: string;
  languageCode: string | null;
}

/**
 * Transcribe an audio clip with Saaras v3.
 * @param file      the recorded audio blob (webm/opus, wav, etc.)
 * @param mode      'transcribe' keeps the spoken language; 'translate' → English
 * @param language  BCP-47 code, or 'unknown' to auto-detect
 */
export async function transcribeSpeech(
  file: Blob,
  mode: string,
  language: string,
): Promise<SttResult> {
  const form = new FormData();
  form.append('file', file, 'audio.webm');
  form.append('model', 'saaras:v3');
  if (language && language !== 'unknown') {
    form.append('language_code', language);
  }
  // Saaras exposes translation via the endpoint variant; for in-language we
  // use the transcribe endpoint. Both share the same shape.
  const endpoint =
    mode === 'translate' ? '/speech-to-text-translate' : '/speech-to-text';

  const res = await fetch(`${SARVAM_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      'api-subscription-key': getKey(),
    },
    body: form,
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => '');
    throw new Error(`Sarvam STT ${res.status}: ${detail.slice(0, 300)}`);
  }

  const data = (await res.json()) as {
    transcript?: string;
    language_code?: string;
  };
  return {
    transcript: data.transcript ?? '',
    languageCode: data.language_code ?? null,
  };
}
