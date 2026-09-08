import { NextRequest, NextResponse } from 'next/server';
import { transcribeSpeech } from '../../../lib/sarvam';
import { toBcp47 } from '../../../i18n/languages';

// Proxies Saaras v3 so the Sarvam key stays server-side. The client posts
// multipart form-data { audio, language, mode } and gets back
// { transcript, languageCode }. `language` may be 'unknown' for auto-detect
// (used on the welcome "say your language" step).
export async function POST(req: NextRequest) {
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'invalid form' }, { status: 400 });
  }

  const audio = form.get('audio');
  if (!(audio instanceof Blob)) {
    return NextResponse.json({ error: 'audio required' }, { status: 400 });
  }

  const mode = String(form.get('mode') ?? 'transcribe');
  const rawLang = String(form.get('language') ?? 'unknown');
  const language = rawLang === 'unknown' ? 'unknown' : toBcp47(rawLang);

  try {
    const result = await transcribeSpeech(audio, mode, language);
    return NextResponse.json({
      transcript: result.transcript,
      languageCode: result.languageCode,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'stt failed';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
