import { NextRequest, NextResponse } from 'next/server';
import { callOllama } from '@/lib/ollama';
import { safeParseAIResponse } from '@/lib/json';

export async function POST(req: NextRequest) {
  try {
    const { cvJson, jobRequirementsJson } = await req.json();

    const prompt = `You are an AI resume matcher and ATS validator.

Compare the CV with the job requirements and calculate an ATS match score.

Rules:
1. LANGUAGE PRESERVATION: You MUST provide the suggested edits and feedback in the SAME language as the CV. If the CV is in French, write the "suggested_edits" in French.
2. Be strict and honest.
3. Identify missing critical keywords.
4. Provide specific suggested edits for each section to improve the match.
5. Return ONLY valid JSON.

Schema:
{
  "match_score": 0,
  "matched_skills": [],
  "missing_keywords": [],
  "suggested_edits": {
    "summary": "Specific advice to improve summary",
    "experience": ["Advice 1", "Advice 2"],
    "skills": "Advice for skills section"
  },
  "ats_validation": {
    "font_check": "Pass/Fail/Warn",
    "section_order": "Pass/Fail/Warn",
    "keyword_density": "High/Optimal/Low"
  }
}

CV:
${JSON.stringify(cvJson, null, 2)}

JOB REQUIREMENTS:
${JSON.stringify(jobRequirementsJson, null, 2)}`;

    const response = await callOllama(prompt);
    const data = safeParseAIResponse(response, {
      match_score: 0,
      matched_skills: [],
      missing_keywords: [],
      suggested_edits: {
        summary: '',
        experience: [],
        skills: ''
      },
      ats_validation: {
        font_check: 'Pass',
        section_order: 'Pass',
        keyword_density: 'Optimal'
      }
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Match error:', error);
    return NextResponse.json({ error: 'Failed to calculate match score' }, { status: 500 });
  }
}
