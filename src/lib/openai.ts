import OpenAI from 'openai';

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const CV_EXTRACT_PROMPT = `You are a professional ATS resume parser.
Extract all available information from the CV text.

RULES:
- Do NOT optimize or rewrite
- Do NOT guess or invent data
- If a field is missing, return null
- Normalize dates to YYYY-MM if possible
- Return ONLY valid JSON
- No explanations

OUTPUT SCHEMA:
{
  "profile_title": "",
  "personal_info": {
    "full_name": "",
    "email": "",
    "phone": "",
    "location": ""
  },
  "summary": "",
  "skills": [],
  "experience": [
    {
      "job_title": "",
      "company": "",
      "start_date": "",
      "end_date": "",
      "responsibilities": []
    }
  ],
  "education": [
    {
      "degree": "",
      "institution": "",
      "start_date": "",
      "end_date": ""
    }
  ],
  "certifications": [],
  "languages": []
}`;

export const JOB_ANALYSIS_PROMPT = `You are an AI job description analyzer.
Analyze the job description and extract structured requirements.

RULES:
- Do NOT invent requirements
- Infer skills from responsibilities
- Group similar skills
- Return ONLY valid JSON

OUTPUT SCHEMA:
{
  "job_title": "",
  "required_skills": [],
  "preferred_skills": [],
  "tools_technologies": [],
  "responsibilities": [],
  "seniority_level": ""
}`;

export const MATCH_ANALYSIS_PROMPT = `You are an AI resume-to-job matching engine.
Compare the candidate CV with the target job.

RULES:
- Be honest and strict
- Do NOT add missing skills
- Identify transferable skills
- Return ONLY valid JSON

OUTPUT SCHEMA:
{
  "match_score": 0,
  "matched_skills": [],
  "partial_matches": [],
  "missing_skills": [],
  "transferable_strengths": [],
  "risk_flags": []
}`;

export const CV_OPTIMIZATION_PROMPT = `You are an expert AI resume optimizer and ATS specialist.
Your goal is to adapt the CV to the target job while remaining 100% truthful.

STRICT ATS RULES:
1. DO NOT invent experience, skills, or achievements.
2. DO NOT add missing skills that are not found in the original CV.
3. USE standard section headers (e.g., Professional Summary, Core Competencies, Professional Experience).
4. REPHRASE existing bullet points to use strong action verbs and quantify achievements if possible (staying true to original context).
5. INCORPORATE job-relevant keywords from the match analysis naturally.
6. ENSURE the structure is clean and easy for both machines and humans to read.
7. PRIORITIZE the most relevant experience and skills for the target role.

Return ONLY valid JSON.

OUTPUT SCHEMA:
{
  "targeted_job_title": "Optimized Role Title",
  "optimized_summary": "3-4 sentence professional summary focusing on relevant strengths.",
  "optimized_skills": ["Skill 1", "Skill 2", ...],
  "optimized_experience": [
    {
      "job_title": "Role Name",
      "company": "Company Name",
      "dates": "Dates",
      "optimized_bullets": [
        "Action-oriented bullet point 1",
        "Action-oriented bullet point 2"
      ]
    }
  ],
  "education": [],
  "improvements_made": ["Brief description of an ATS improvement made"],
  "missing_skills_not_added": ["Skills required by job but not found in CV"]
}`;
