'use client';

import React, { useState } from 'react';
import { X, Check, Sparkles, Layout, ShieldCheck, Target, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/components/ResumeComponents';

interface Template {
  id: string;
  name: string;
  description: string;
  isDefault?: boolean;
  image: string;
  font: string;
  atsScore: number;
  recommendedFor: string[];
  isAtsSafe: boolean;
  metadata?: {
    layout: string;
    recommendedFor: string[];
    riskyForATS: boolean;
  };
}

const TEMPLATES: Template[] = [
  {
    id: 'standard',
    name: 'STANDARD',
    description: 'CLEAN, PROFESSIONAL SINGLE-COLUMN LAYOUT',
    isDefault: true,
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1766506496073.png',
    font: 'ARIAL, SANS-SERIF',
    atsScore: 98,
    recommendedFor: ['Engineering', 'Finance', 'Law'],
    isAtsSafe: true,
    metadata: {
      layout: 'single-column',
      recommendedFor: ['Tech', 'Legal'],
      riskyForATS: false
    }
  },
  {
    id: 'hybrid',
    name: 'PROFESSIONAL HYBRID',
    description: 'SINGLE-COLUMN EXPERIENCE WITH TWO-COLUMN CONTACT/SKILLS SIDEBAR',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1766506496073.png',
    font: 'ARIAL, SANS-SERIF',
    atsScore: 97,
    recommendedFor: ['Management', 'Sales', 'Executive'],
    isAtsSafe: true,
    metadata: {
      layout: 'hybrid-sidebar',
      recommendedFor: ['Business', 'Sales'],
      riskyForATS: false
    }
  },
  {
    id: 'modern',
    name: 'MODERN',
    description: 'TWO-COLUMN LAYOUT WITH SIDEBAR FOR CONTACT INFO',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1766506496073.png',
    font: 'ARIAL, SANS-SERIF',
    atsScore: 85,
    recommendedFor: ['Marketing', 'Sales', 'Product'],
    isAtsSafe: true,
    metadata: {
      layout: 'two-column',
      recommendedFor: ['Creative', 'Startup'],
      riskyForATS: true
    }
  },
  {
    id: 'creative',
    name: 'CREATIVE',
    description: 'TIMELINE-BASED DESIGN WITH ICONS AND VISUAL ELEMENTS',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1766506496073.png',
    font: 'ARIAL, SANS-SERIF',
    atsScore: 70,
    recommendedFor: ['Design', 'Creative Arts', 'Media'],
    isAtsSafe: false,
    metadata: {
      layout: 'creative',
      recommendedFor: ['Design', 'Media'],
      riskyForATS: true
    }
  },
  {
    id: 'classic',
    name: 'CLASSIC',
    description: 'TRADITIONAL FORMAT WITH CLEAN TYPOGRAPHY',
    image: 'https://slelguoygbfzlpylpxfs.supabase.co/storage/v1/render/image/public/document-uploads/image-1766506499182.png',
    font: 'TIMES NEW ROMAN, SERIF',
    atsScore: 95,
    recommendedFor: ['Academic', 'Executive', 'Government'],
    isAtsSafe: true,
    metadata: {
      layout: 'single-column',
      recommendedFor: ['Academic', 'Gov'],
      riskyForATS: false
    }
  }
];

interface TemplateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (templateId: string) => void;
  selectedId?: string;
  recommendedTemplateId?: string;
}

export function TemplateModal({ isOpen, onClose, onSelect, selectedId, recommendedTemplateId }: TemplateModalProps) {
  const [activeId, setActiveId] = useState(selectedId || 'standard');
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            className="relative w-full max-w-[1280px] bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
          >
            {/* Header */}
            <div className="px-12 py-10 flex items-center justify-between border-b border-slate-50 bg-white z-10">
              <div className="space-y-1">
                <h2 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
                  Choose Resume Template
                  <span className="px-3 py-1 bg-indigo-50 text-indigo-600 text-xs font-black rounded-full uppercase tracking-widest border border-indigo-100">
                    ATS Optimized
                  </span>
                </h2>
                <p className="text-sm font-bold text-slate-400">Select a layout that matches your industry and target role</p>
              </div>
              <button
                onClick={onClose}
                className="p-3 hover:bg-slate-100 rounded-2xl transition-all text-slate-400 hover:text-slate-900 border border-transparent hover:border-slate-200"
              >
                <X className="w-8 h-8" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-12 py-10 custom-scrollbar bg-[#F9FAFB]">
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                {TEMPLATES.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setActiveId(template.id)}
                    onMouseEnter={() => setHoveredId(template.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={cn(
                      "group cursor-pointer rounded-[32px] border-4 transition-all flex flex-col overflow-hidden relative bg-white",
                      activeId === template.id
                        ? "border-indigo-600 ring-8 ring-indigo-500/5 shadow-2xl scale-[1.02]"
                        : "border-slate-50 hover:border-slate-200 shadow-sm hover:shadow-xl"
                    )}
                  >
                      {/* Selection Indicator */}
                      <div className={cn(
                        "absolute top-6 right-6 w-8 h-8 rounded-full border-2 z-20 flex items-center justify-center transition-all",
                        activeId === template.id 
                          ? "bg-indigo-600 border-indigo-600 shadow-lg" 
                          : "border-slate-200 bg-white/80"
                      )}>
                        {activeId === template.id && <Check className="w-5 h-5 text-white stroke-[4]" />}
                      </div>

                      {/* Header Info */}
                      <div className="p-8 pb-6 space-y-4">
                        <div className="space-y-2">
                          <div className="flex items-center flex-wrap gap-2">
                            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">{template.name}</h3>
                            {template.isDefault && (
                              <span className="px-2 py-0.5 bg-slate-900 text-white text-[9px] font-black rounded uppercase tracking-[0.2em] shadow-sm">DEFAULT</span>
                            )}
                            {template.isAtsSafe ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-600 text-[9px] font-black rounded uppercase tracking-wider flex items-center gap-1 border border-emerald-100 shadow-sm">
                                <ShieldCheck className="w-3 h-3" /> ATS SAFE
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-rose-50 text-rose-600 text-[9px] font-black rounded uppercase tracking-wider flex items-center gap-1 border border-rose-100 shadow-sm">
                                <Zap className="w-3 h-3" /> ATS RISKY
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest leading-relaxed">{template.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div 
                                initial={{ width: 0 }}
                                animate={{ width: `${template.atsScore}%` }}
                                className={cn(
                                  "h-full rounded-full",
                                  template.atsScore > 90 ? "bg-emerald-500" : template.atsScore > 80 ? "bg-amber-500" : "bg-rose-500"
                                )}
                              />
                            </div>
                            <span className="text-[10px] font-black text-slate-500">{template.atsScore}% Score</span>
                          </div>
                          <div className="flex gap-1">
                            {template.recommendedFor.slice(0, 2).map(role => (
                              <span key={role} className="text-[9px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                    {/* Image Preview with Zoom Effect */}
                    <div className="flex-1 px-8 pb-4">
                      <div className="aspect-[4/5] bg-slate-50 rounded-[20px] overflow-hidden border border-slate-100 shadow-inner relative">
                        <motion.img
                          animate={{ scale: hoveredId === template.id ? 1.05 : 1 }}
                          transition={{ duration: 0.4 }}
                          src={template.image}
                          alt={template.name}
                          className="w-full h-full object-cover object-top opacity-95 group-hover:opacity-100"
                        />
                        {hoveredId === template.id && (
                          <div className="absolute inset-0 bg-indigo-600/5 backdrop-blur-[1px] transition-all" />
                        )}
                      </div>
                    </div>

                    {/* Meta Badge for Recommended */}
                    {recommendedTemplateId === template.id && (
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 z-30">
                        <div className="px-4 py-1.5 bg-indigo-600 text-white text-[10px] font-black rounded-full shadow-2xl flex items-center gap-2 animate-bounce">
                          <Sparkles className="w-3 h-3 text-yellow-300 fill-yellow-300" /> RECOMMENDED FOR THIS JOB
                        </div>
                      </div>
                    )}

                    {/* Footer Info */}
                    <div className="px-8 py-5 bg-white border-t border-slate-50 mt-auto flex items-center justify-between">
                       <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        Font: <span className="text-slate-900">{template.font.split(',')[0]}</span>
                      </p>
                      <Layout className="w-4 h-4 text-slate-200" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="px-12 py-8 border-t border-slate-100 bg-white flex items-center justify-between shadow-[0_-20px_50px_rgba(0,0,0,0.02)]">
              <div className="flex items-center gap-4 text-slate-400">
                 <ShieldCheck className="w-5 h-5" />
                 <span className="text-xs font-bold">All templates are verified for high-score ATS parsing compatibility</span>
              </div>
              <div className="flex items-center gap-4">
                <button
                  onClick={onClose}
                  className="px-10 py-4 rounded-2xl text-sm font-black text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-all border border-transparent"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    onSelect(activeId);
                    onClose();
                  }}
                  className="px-16 py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black shadow-2xl shadow-indigo-100 hover:bg-indigo-700 transition-all transform active:scale-95 flex items-center gap-3"
                >
                  Apply {activeId.toUpperCase()} Layout <Target className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
