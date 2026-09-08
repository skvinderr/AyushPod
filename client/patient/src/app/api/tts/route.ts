import { NextRequest, NextResponse } from 'next/server';
import { synthesizeSpeech } from '../../../lib/sarvam';
import { toBcp47 } from '../../../i18n/languages';

// Proxies Bulbul v3 so the Sarvam key stays server-side. The client posts
// { text, language } and gets back { audio: <base64 WAV> }. On any failure we
// return a non-200 with a small JSON error; the caller falls back to its
// silent reading-time timer, so Aaya never hangs.
export async function POST(req: NextRequest) {
  let body: { text?: string; language?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'invalid body' }, { status: 400 });
  }

  const text = (body.text ?? '').trim();
  if (!text) {
    return NextResponse.json({ error: 'text required' }, { status: 400 });
  }

  const languageCode = toBcp47(body.language ?? 'en');

  try {
    const { audio } = await synthesizeSpeech(text, languageCode);
    return NextResponse.json({ audio });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'tts failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
