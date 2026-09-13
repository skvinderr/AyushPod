import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { input, source_language_code, target_language_code } = await request.json();

    if (!input || !target_language_code) {
      return NextResponse.json(
        { error: 'Missing input or target_language_code parameter' },
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

    const response = await fetch('https://api.sarvam.ai/translate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-subscription-key': sarvamApiKey,
      },
      body: JSON.stringify({
        input: input,
        source_language_code: source_language_code || 'en-IN',
        target_language_code: target_language_code,
        speaker_gender: 'Female',
        mode: 'formal',
        model: 'mayura:v1',
        enable_preprocessing: false
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Sarvam Translate API Error:', response.status, errorData);
      return NextResponse.json(
        { error: `Sarvam API returned error: ${response.status}` },
        { status: response.status }
      );
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error('API Error in /api/translate:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
