import { NextRequest, NextResponse } from 'next/server';
import { callOllama } from '@/lib/ollama';
import { safeParseAIResponse } from '@/lib/json';

export async function POST(req: NextRequest) {
  try {
    const { sections, jobTitle } = await req.json();

    const prompt = `You are an ATS optimization assistant.

Reorder resume sections to maximize relevance
for the target job.

Rules:
- Do NOT remove sections
- Return ONLY JSON

Schema:
{
  "section_order": []
}

SECTIONS:
${JSON.stringify(sections)}

TARGET JOB:
${jobTitle}`;

    const response = await callOllama(prompt);
    const reorderedData = safeParseAIResponse(response, { section_order: sections });

    return NextResponse.json(reorderedData);
  } catch (error: any) {
    console.error('Reorder error:', error);
    return NextResponse.json({ error: error.message || 'Failed to reorder sections' }, { status: 500 });
  }
}
