import { NextRequest, NextResponse } from 'next/server';
import { callOllama } from '@/lib/ollama';

export async function POST(req: NextRequest) {
  try {
    const { text, targetJobTitle } = await req.json();

    const prompt = `You are an AI resume editor.

The user is editing an existing CV section.

Your task:
- Improve clarity, grammar, and professionalism
- Keep the same meaning
- Keep it ATS-friendly
- Keep it concise
- Do NOT add new skills or experience

Rules:
- Do NOT change facts
- Do NOT add achievements
- Do NOT invent tools or technologies
- Return ONLY the edited text
- No explanations

ORIGINAL TEXT:
"""
${text}
"""

TARGET JOB TITLE:
${targetJobTitle}`;

    const response = await callOllama(prompt, process.env.OLLAMA_MODEL || "llama3", undefined);

    return NextResponse.json({ editedText: response.trim() });
  } catch (error: any) {
    console.error('Edit error:', error);
    return NextResponse.json({ error: error.message || 'Failed to edit section' }, { status: 500 });
  }
}
