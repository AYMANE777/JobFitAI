import { NextRequest, NextResponse } from 'next/server';
import { callOllama } from '@/lib/ollama';
import { safeParseAIResponse } from '@/lib/json';

export async function POST(req: NextRequest) {
  try {
    const { targetJobTitle, industry } = await req.json();

    const prompt = `You are a world-class product designer and UI/UX architect specialized in modern resume platforms (JobSuit.ai, Rezi, Teal, Notion CV).

Your task:
Design a PREMIUM, PROFESSIONAL, and MODERN resume presentation that is better than JobSuit.ai.

GOALS:
- Look high-end and trustworthy
- Feel modern, clean, and animated
- Stay ATS-compatible for export
- Work for any job and industry
- Be readable and recruiter-friendly

IMPORTANT RULES:
- Do NOT generate HTML or CSS
- Do NOT generate images or icons
- Only return structured design decisions
- Design must separate:
  - Screen (animated, rich)
  - PDF (ATS-safe, clean)

RETURN ONLY VALID JSON.

DESIGN SYSTEM SCHEMA:
{
  "visual_identity": {
    "style": "modern | minimal | executive | tech | creative",
    "personality": "confident | elegant | bold | calm | premium"
  },
  "typography": {
    "heading_font": "e.g. Inter, Playfair Display, Montserrat",
    "body_font": "e.g. Inter, Open Sans, Roboto",
    "heading_weight": "e.g. 700, 800",
    "body_weight": "e.g. 400, 500",
    "line_height": "e.g. 1.5, 1.6"
  },
  "color_palette": {
    "primary": "Hex code",
    "secondary": "Hex code",
    "accent": "Hex code",
    "background": "Hex code",
    "text": "Hex code"
  },
  "layout": {
    "structure": "one-column | adaptive-two-column",
    "section_spacing": "tight | balanced | spacious",
    "alignment": "left | centered"
  },
  "section_priority_order": ["summary", "skills", "experience", "education"],
  "ui_interactions": {
    "hover_effects": true,
    "micro_animations": true,
    "animation_style": "subtle | smooth | premium",
    "transition_speed_ms": 300
  },
  "screen_only_enhancements": {
    "skill_chips": true,
    "section_highlighting": true,
    "edit_focus_mode": true
  },
  "pdf_export_rules": {
    "force_one_column": true,
    "remove_icons": true,
    "disable_animations": true,
    "use_standard_fonts": true
  },
  "recruiter_psychology_notes": ["Why this design works for this industry"]
}

INPUT CONTEXT:
TARGET JOB TITLE: ${targetJobTitle}
INDUSTRY: ${industry}
SENIORITY LEVEL: ${industry === 'Technology' ? 'Senior' : 'Professional'}`;

    const response = await callOllama(prompt);
    const designSuggestion = safeParseAIResponse(response, {
      visual_identity: { style: 'modern', personality: 'professional' },
      typography: { heading_font: 'Inter', body_font: 'Inter' },
      color_palette: { primary: '#4f46e5', text: '#1e293b', background: '#ffffff' },
      layout: { structure: 'one-column', section_spacing: 'balanced', alignment: 'left' },
      section_priority_order: ["summary", "skills", "experience", "education"]
    });

    return NextResponse.json(designSuggestion);
  } catch (error: any) {
    console.error('Design suggestion error:', error);
    return NextResponse.json({ error: error.message || 'Failed to suggest design' }, { status: 500 });
  }
}
