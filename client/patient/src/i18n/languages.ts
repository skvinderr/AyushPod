// Single source of truth for the languages the kiosk supports. Previously this
// data was duplicated (and drifting) across app/page.tsx (LANGUAGES),
// avatar/KioskShell.tsx (LANG_LABELS) and components/TopBar.tsx.

export type LangId = 'en' | 'hi' | 'bn' | 'ta' | 'mr';

export interface LanguageMeta {
  id: LangId;
  /** Name in its own script, shown on the welcome tile. */
  native: string;
  /** English name, shown as a sub-label. */
  english: string;
  /** A representative glyph in the script (renders everywhere; flags don't). */
  glyph: string;
  /** Native greeting Aaya speaks when the language is chosen. */
  greeting: string;
  /** BCP-47 code Sarvam expects for TTS/STT (e.g. 'hi-IN'). */
  bcp47: string;
}

export const LANGUAGES: LanguageMeta[] = [
  { id: 'hi', native: 'हिंदी', english: 'Hindi', glyph: 'अ', greeting: 'नमस्ते, आपका स्वागत है!', bcp47: 'hi-IN' },
  { id: 'en', native: 'English', english: 'English', glyph: 'A', greeting: 'Welcome to MediKiosk!', bcp47: 'en-IN' },
  { id: 'bn', native: 'বাংলা', english: 'Bengali', glyph: 'অ', greeting: 'নমস্কার, আপনাকে স্বাগত!', bcp47: 'bn-IN' },
  { id: 'ta', native: 'தமிழ்', english: 'Tamil', glyph: 'அ', greeting: 'வணக்கம், நல்வரவு!', bcp47: 'ta-IN' },
  { id: 'mr', native: 'मराठी', english: 'Marathi', glyph: 'म', greeting: 'नमस्कार, आपले स्वागत आहे!', bcp47: 'mr-IN' },
];

/** Languages whose translation catalogs are complete enough to expose fully. */
export const LIVE_LANGS: LangId[] = ['en', 'hi'];

const BY_ID = new Map<string, LanguageMeta>(LANGUAGES.map((l) => [l.id, l]));

/** Short label for the top-bar language chip. */
export const LANG_LABELS: Record<LangId, string> = LANGUAGES.reduce(
  (acc, l) => ({ ...acc, [l.id]: l.native }),
  {} as Record<LangId, string>,
);

/** Map an app language id (or Sarvam BCP-47 code) to the BCP-47 Sarvam wants. */
export function toBcp47(lang: string): string {
  if (BY_ID.has(lang)) return BY_ID.get(lang)!.bcp47;
  // already a BCP-47 code (e.g. from STT auto-detect)
  return lang.includes('-') ? lang : 'en-IN';
}

/** Map a Sarvam BCP-47 detection (e.g. 'hi-IN') back to an app language id. */
export function fromBcp47(code: string | null | undefined): LangId | null {
  if (!code) return null;
  const base = code.split('-')[0].toLowerCase();
  return (LANGUAGES.find((l) => l.id === base)?.id as LangId) ?? null;
}

export function isLangId(v: string): v is LangId {
  return BY_ID.has(v);
}
