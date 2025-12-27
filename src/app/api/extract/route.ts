import { NextRequest, NextResponse } from 'next/server';
import pdf from 'pdf-parse';
import { callOllama } from '@/lib/ollama';
import { safeParseAIResponse } from '@/lib/json';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    console.log(`PDF file size: ${buffer.length} bytes`);
    
    let pdfData;
    try {
      pdfData = await pdf(buffer);
    } catch (pdfErr: any) {
      console.error('PDF Parse Error:', pdfErr);
      throw new Error(`Failed to parse PDF: ${pdfErr.message}`);
    }

    const rawText = (pdfData?.text || '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');
    
    if (!rawText || rawText.trim().length === 0) {
      throw new Error('PDF is empty or could not be read (might be an image-only PDF)');
    }

    console.log(`Extracted raw text len: ${rawText.length}`);

    const prompt = `Extract all information from this CV into a clean, structured JSON format. 
DO NOT include any commentary, just the JSON.

CRITICAL INSTRUCTIONS:
1. LANGUAGE PRESERVATION: You MUST preserve the original language of the source text. If the CV is in French, the extracted titles, summaries, and bullet points MUST be in French. DO NOT translate them.
2. Look for contact information (Email, Phone, LinkedIn, Location/City, Website) everywhere in the text. It is often found at the very top or very end.
3. Contact details might be separated by symbols like "•", "|", "-", or "•". Parse them carefully.
4. For "location", extract the City and Country if available.
5. For "linkedin" and "website", extract the full URLs.

Follow this schema strictly:
{
  "personal_info": { 
    "full_name": "", 
    "email": "", 
    "phone": "", 
    "location": "",
    "linkedin": "",
    "website": ""
  },
  "title": "Desired or Current Professional Title",
  "summary": "Professional summary",
  "skills": ["Skill1", "Skill2"],
  "experience": [
    {
      "job_title": "",
      "company": "",
      "location": "",
      "start_date": "",
      "end_date": "",
      "bullets": ["Bullet point 1", "Bullet point 2"]
    }
  ],
  "education": [
    { "degree": "", "institution": "", "location": "", "start_date": "", "end_date": "" }
  ]
}

CV CONTENT:
"""
${rawText}
"""`;

    const response = await callOllama(prompt);
    
    const extractedData = safeParseAIResponse(response, {
      personal_info: { full_name: 'Unknown', email: '', phone: '', location: '', linkedin: '', website: '' },
      title: '',
      summary: '',
      skills: [],
      experience: [],
      education: []
    });

    console.log('Successfully extracted CV data:', extractedData.personal_info?.full_name);
    return NextResponse.json(extractedData);
  } catch (error: any) {
    console.error('Extraction error:', error);
    return NextResponse.json({ error: error.message || 'Failed to extract CV data' }, { status: 500 });
  }
}
