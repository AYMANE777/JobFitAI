import { NextRequest, NextResponse } from 'next/server';
import { callOllama } from '@/lib/ollama';
import { safeParseAIResponse } from '@/lib/json';

export async function POST(req: NextRequest) {
  try {
    const { cvJson, jobDescription, matchAnalysis } = await req.json();

    const prompt = `You are an expert resume optimizer and career coach.

Your goal is to adapt the CV to better fit the job description while ensuring it is 100% ATS-compatible.

CRITICAL RULES:
1. LANGUAGE PRESERVATION: You MUST preserve the language of the CV and Job Description. If they are in French, the optimized CV MUST be in French. DO NOT translate French to English.
2. Anti-Hallucination Guard:
   - NEVER invent experience, companies, or dates.
   - NEVER add skills the candidate does not have.
   - ONLY rewrite existing content to be more impactful and relevant.
3. BULLET POINT REWRITING ENGINE:
   - Every bullet point in 'experience' MUST follow the pattern: [Action Verb] + [Skill/Task] + [Impact/Metric].
   - Use strong action verbs (Led, Spearheaded, Optimized, Engineered). In French, use verbs like (Dirigé, Piloté, Optimisé, Conçu).
4. ATS OPTIMIZATION:
   - Use keywords from the job description naturally.
   - Ensure professional, impact-driven tone.

  Schema:
  {
    "personal_info": {
      "full_name": "",
      "email": "",
      "phone": "",
      "location": "",
      "linkedin": "",
      "website": "",
      "job_title": "Optimized target title",
      "summary": "Tailored professional summary"
    },
    "skills": [],
  "experience": [
    {
      "job_title": "",
      "company": "",
      "location": "",
      "start_date": "",
      "end_date": "",
      "currently_work_here": false,
      "bullets": []
    }
  ],
  "education": [],
  "improvements_made": [
    { "section": "", "change": "", "reason": "" }
  ],
  "missing_skills_not_added": []
}

CV DATA:
${JSON.stringify(cvJson, null, 2)}

JOB DESCRIPTION:
${jobDescription}

MATCH ANALYSIS:
${JSON.stringify(matchAnalysis, null, 2)}`;

    const response = await callOllama(prompt);
    const data = safeParseAIResponse(response, { 
      personal_info: cvJson.personal_info,
      skills: cvJson.skills,
      experience: cvJson.experience,
      education: cvJson.education,
      improvements_made: [],
      missing_skills_not_added: []
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error('Optimization error:', error);
    return NextResponse.json({ error: 'Failed to optimize CV' }, { status: 500 });
  }
}
