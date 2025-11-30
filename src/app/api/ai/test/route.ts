import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { engine, apiKey } = await request.json();

    if (!engine || !apiKey) {
      return NextResponse.json(
        { error: 'Engine and API key are required' },
        { status: 400 }
      );
    }

    // OpenAI 테스트
    if (engine === 'openai') {
      const response = await fetch('https://api.openai.com/v1/models', {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      });

      if (response.ok) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Google Gemini 테스트
    if (engine === 'gemini') {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
      );

      if (response.ok) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    // Anthropic Claude 테스트
    if (engine === 'claude') {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-haiku-20240307',
          max_tokens: 10,
          messages: [{ role: 'user', content: 'test' }],
        }),
      });

      if (response.ok || response.status === 200) {
        return NextResponse.json({ success: true });
      }
      return NextResponse.json({ error: 'Invalid API key' }, { status: 401 });
    }

    return NextResponse.json({ error: 'Unsupported engine' }, { status: 400 });
  } catch (error: any) {
    console.error('AI test error:', error);
    return NextResponse.json(
      { error: 'Test failed', message: error.message },
      { status: 500 }
    );
  }
}


