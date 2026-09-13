<<<<<<< HEAD
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
=======
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { text, language_code } = await request.json();

    if (!text || !language_code) {
      return NextResponse.json(
        { error: 'Missing text or language_code parameter' },
        { status: 400 }
      );
    }

    const sarvamApiKey = process.env.SARVAM_API_KEY;

    if (!sarvamApiKey) {
      console.error('SARVAM_API_KEY is missing in environment variables');
      return NextResponse.json(
        { error: 'Server configuration error' },
        { status: 500 }
      );
    }

    const response = await fetch('https://api.sarvam.ai/text-to-speech', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': sarvamApiKey,
      },
      body: JSON.stringify({
        text: text,
        language_code: language_code,
        speaker: 'shreya',
        model: 'bulbul:v3',
        pace: 1.0,
        target_sample_rate: 24000
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Sarvam TTS API Error:', response.status, errorData);
      return NextResponse.json(
        { error: `Sarvam API returned error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error in /api/tts:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
>>>>>>> 96461fe3b8abefe86ba2737f1489dee49613bcfa
  }
}
