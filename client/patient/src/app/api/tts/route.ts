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
  }
}
