import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronUp, ChevronDown, Check, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden transition-all duration-200", className)}>
    {children}
  </div>
);

export const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  loading = false, 
  disabled = false,
  className
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'ai' | 'danger' | 'success';
  loading?: boolean;
  disabled?: boolean;
  className?: string;
}) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm transition-all",
    secondary: "bg-slate-900 text-white hover:bg-slate-800",
    outline: "border border-slate-200 text-slate-700 hover:bg-slate-50",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 shadow-sm",
    danger: "bg-rose-500 text-white hover:bg-rose-600 shadow-sm",
    ghost: "text-slate-600 hover:bg-slate-100",
    ai: "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90 shadow-md transform hover:scale-[1.02]"
  };

  return (
    <button 
      onClick={onClick} 
      disabled={disabled || loading}
      className={cn(
        "px-4 py-2 rounded-xl font-bold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm whitespace-nowrap",
        variants[variant],
        className
      )}
    >
      {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : children}
    </button>
  );
};

export const SidebarItem = ({ icon: Icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick?: () => void }) => (
  <div 
    onClick={onClick}
    className={cn(
      "flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all group",
      active ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
    )}
  >
    <Icon className={cn("w-5 h-5", active ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-600")} />
    <span className="text-sm font-bold">{label}</span>
  </div>
);

export const EditorSection = ({ 
  title, 
  icon: Icon, 
  children, 
  isOpen, 
  onToggle,
  tips = "Tips and Recommendations",
  hasSuggestions = false,
  onAccept,
  onDecline
}: { 
  title: string; 
  icon: any; 
  children: React.ReactNode; 
  isOpen: boolean; 
  onToggle: () => void;
  tips?: string;
  hasSuggestions?: boolean;
  onAccept?: () => void;
  onDecline?: () => void;
}) => {
  const [showTips, setShowTips] = React.useState(false);

  return (
    <div className={cn(
      "border rounded-2xl overflow-hidden shadow-sm mb-4 bg-white transition-all",
      hasSuggestions ? "border-emerald-200 ring-1 ring-emerald-100" : "border-slate-100"
    )}>
      <div className="flex items-center justify-between bg-white pr-4">
        <button 
          onClick={onToggle}
          className="flex-1 px-6 py-5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
        >
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-indigo-600" />
            <span className="font-black uppercase tracking-tight text-slate-800 text-sm">{title}</span>
          </div>
          {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        
        {hasSuggestions && (
          <div className="flex items-center gap-2 no-print">
            <button 
              onClick={(e) => { e.stopPropagation(); onAccept?.(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-[10px] font-black hover:bg-emerald-600 transition-all shadow-sm"
            >
              <Check className="w-3 h-3" /> Accept Changes
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDecline?.(); }}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-500 text-white rounded-lg text-[10px] font-black hover:bg-rose-600 transition-all shadow-sm"
            >
              <X className="w-3 h-3" /> Decline Changes
            </button>
          </div>
        )}
      </div>
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 space-y-4">
              <div className="border border-slate-100 rounded-xl overflow-hidden mb-6">
                <button 
                  onClick={() => setShowTips(!showTips)}
                  className="w-full px-4 py-3 bg-slate-50 flex items-center justify-between text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-slate-100 transition-colors"
                >
                  {tips} {showTips ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                </button>
                <AnimatePresence>
                  {showTips && (
                    <motion.div 
                      initial={{ height: 0 }} 
                      animate={{ height: "auto" }} 
                      exit={{ height: 0 }}
                      className="overflow-hidden bg-slate-50/50 px-4 pb-4 text-[10px] text-slate-500 font-medium leading-relaxed"
                    >
                      Follow these professional guidelines to ensure your {title} section is optimized for both human recruiters and ATS systems. Use quantifiable metrics where possible and keep descriptions concise.
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const USER_EXAMPLE_DATA = {
  personal_info: {
    full_name: "Alexander Pierce",
    job_title: "Senior Software Architect",
    email: "alex.pierce@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    linkedin: "linkedin.com/in/alexpierce",
    github: "github.com/alexpierce",
    website: "alexpierce.dev"
  },
  experience: [
    {
      company: "TechFlow Systems",
      job_title: "Senior Software Architect",
      dates: "2019 - Present",
      start_date: "2019-01-01",
      end_date: "",
      location: "San Francisco, CA",
      currently_work_here: true,
      bullets: [
        "Led a team of 15 engineers to rebuild the core streaming architecture, increasing throughput by 400%.",
        "Implemented microservices using Go and Node.js, reducing latency by 120ms across all global regions.",
        "Architected a real-time analytics dashboard used by Fortune 500 clients to track user engagement."
      ]
    },
    {
      company: "DataCloud Inc",
      job_title: "Full Stack Engineer",
      dates: "2016 - 2019",
      start_date: "2016-06-01",
      end_date: "2019-12-31",
      location: "Austin, TX",
      currently_work_here: false,
      bullets: [
        "Developed and maintained high-scale React applications with complex state management.",
        "Optimized database queries in PostgreSQL, resulting in a 30% reduction in server costs.",
        "Integrated third-party payment gateways (Stripe, PayPal) for a global e-commerce platform."
      ]
    }
  ],
  education: [
    {
      degree: "M.S. in Computer Science",
      institution: "Stanford University",
      end_date: "2016",
      location: "Palo Alto, CA"
    },
    {
      degree: "B.S. in Software Engineering",
      institution: "University of Texas",
      end_date: "2014",
      location: "Austin, TX"
    }
  ],
  skills: ["React", "TypeScript", "Node.js", "Go", "Kubernetes", "AWS", "PostgreSQL", "System Design", "Microservices"],
    languages: [
      { language: "English", level: "Native" },
      { language: "French", level: "Professional" }
    ],
    projects: [
      { title: "AI Resume Builder", description: "Developed a full-stack application using Next.js and OpenAI to automate resume tailoring." }
    ],
    references: [
      { name: "Jane Smith", company: "TechFlow Systems" }
    ],
    certifications: [
      { name: "AWS Certified Solutions Architect", issuer: "Amazon Web Services" },
      { name: "Professional Scrum Master I", issuer: "Scrum.org" }
    ]
  };
