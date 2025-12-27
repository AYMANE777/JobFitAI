import { NextRequest, NextResponse } from 'next/server';
import { callOllama } from '@/lib/ollama';
import { safeParseAIResponse } from '@/lib/json';

export async function POST(req: NextRequest) {
  try {
    const { jobDescription } = await req.json();

    if (!jobDescription) {
      return NextResponse.json({ error: 'Job description is required' }, { status: 400 });
    }

    const prompt = `You are a job description analyzer.

Extract job requirements from the description.

Rules:
1. LANGUAGE PRESERVATION: You MUST preserve the language of the job description. If it is in French, the extracted skills and responsibilities MUST be in French.
2. Do NOT invent requirements.
3. Return ONLY valid JSON.

Schema:
{
  "job_title": "",
  "required_skills": [],
  "preferred_skills": [],
  "tools": [],
  "responsibilities": [],
  "seniority_level": ""
}

JOB DESCRIPTION:
"""
${jobDescription}
"""`;

    const response = await callOllama(prompt);
    const data = safeParseAIResponse(response, {
      job_title: 'Job Role',
      required_skills: [],
      preferred_skills: [],
      tools: [],
      responsibilities: [],
      seniority_level: 'Professional'
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Job analysis error:', error);
    return NextResponse.json({ error: 'Failed to analyze job description' }, { status: 500 });
  }
}
