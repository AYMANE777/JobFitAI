'use client';

import { Suspense, useState, useEffect, useRef } from 'react';
import { 
  Upload, FileText, CheckCircle2, AlertCircle, Edit3, RotateCcw, 
  Copy, Check, FileDown, Info, Mail, Phone, MapPin, Linkedin, Github,
  ChevronDown, ChevronUp, ChevronRight, Minus, Plus, Undo2, Redo2, Layout, Palette, Search, Sparkles, Trash2, Globe, User,
  X, Send, Target, Wand2, ShieldCheck, GripVertical, Briefcase, GraduationCap, Award, Languages, Terminal, Box, Quote, Settings, PlusCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, Button, EditorSection, USER_EXAMPLE_DATA, cn } from '@/components/ResumeComponents';
import { TemplateModal } from '@/components/TemplateModal';

function EditorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
    const resumeId = searchParams.get('id');
    const mode = searchParams.get('mode');
    const tabParam = searchParams.get('tab');

    const [step, setStep] = useState(1);

  const [file, setFile] = useState<File | null>(null);
  const [targetJob, setTargetJob] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [progress, setProgress] = useState(0);
  
  const [extractedCv, setExtractedCv] = useState<any>(USER_EXAMPLE_DATA);
  const [matchAnalysis, setMatchAnalysis] = useState<any>({
    match_score: 84,
    missing_keywords: ['CI/CD', 'Docker', 'Kubernetes'],
    suggested_edits: {
      summary: 'Highlight your architectural achievements more clearly.',
      experience: ['Quantify your impact in the last role', 'Add technical stack to project bullets'],
      skills: 'Add cloud-native tools if applicable'
    },
    ats_validation: {
      font_check: 'Pass',
      section_order: 'Pass',
      keyword_density: 'Optimal'
    }
  });
  const [optimizedCv, setOptimizedCv] = useState<any>(USER_EXAMPLE_DATA);

  const [designStyle, setDesignStyle] = useState<any>({
    typography: { body_font: 'Inter, sans-serif', heading_font: 'Inter, sans-serif', line_height: '1.4' }
  });
  
  const [zoom, setZoom] = useState(70);
  const [history, setHistory] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [askAiVisible, setAskAiVisible] = useState(false);
  const [chatMessages, setChatMessages] = useState<any[]>([
    { role: 'assistant', content: 'Hi! I can help you improve your CV. How can I assist you today?' }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  
  const [openSections, setOpenSections] = useState<string[]>(['personal', 'experience', 'summary', 'skills']);
  const [error, setError] = useState<string | null>(null);
  const [layoutSettings, setLayoutSettings] = useState({
    fontSize: 100,
    lineSpacing: 140,
    headerAlignment: 'center' as 'left' | 'center' | 'right',
    dateAlignment: 'right' as 'left' | 'right',
    format: 'A4',
    skillsLayout: 'columns' as 'columns' | 'comma',
    margins: {
      topBottom: 0.5,
      leftRight: 0.5,
      betweenSections: 15,
      betweenTitles: 8,
      betweenBlocks: 10
    }
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showChanges, setShowChanges] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const photoInputRef = useRef<HTMLInputElement>(null);

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('standard');

  useEffect(() => {
    if (resumeId) {
      const savedResumes = localStorage.getItem('resumes');
      if (savedResumes) {
        const resumes = JSON.parse(savedResumes);
        const resume = resumes.find((r: any) => r.id === parseInt(resumeId) || r.id === resumeId);
        if (resume) {
          setExtractedCv(resume.data);
          setOptimizedCv(resume.data);
          if (mode === 'tailor') {
            setStep(2);
          } else {
            setStep(3);
          }
        }
      }
    }
  }, [resumeId, mode]);

  const handleSaveResume = () => {
    const savedResumes = localStorage.getItem('resumes') || '[]';
    const resumes = JSON.parse(savedResumes);
    
    const resumeData = {
      id: resumeId || Date.now(),
      title: optimizedCv?.personal_info?.job_title || 'Untitled Resume',
      subtitle: `Job Title: ${optimizedCv?.personal_info?.job_title || 'Not specified'}`,
      type: mode === 'tailor' ? 'tailored' : 'base',
      data: optimizedCv,
      updatedAt: new Date().toISOString()
    };

    let updatedResumes;
    const existingIndex = resumes.findIndex((r: any) => r.id === resumeData.id);
    
    if (existingIndex > -1) {
      updatedResumes = [...resumes];
      updatedResumes[existingIndex] = resumeData;
    } else {
      updatedResumes = [...resumes, resumeData];
    }

    localStorage.setItem('resumes', JSON.stringify(updatedResumes));
    showToast('Resume saved successfully!');
    
    if (!resumeId) {
      router.replace(`/editor?id=${resumeData.id}`);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const applyKeyword = (keyword: string) => {
    const currentSkills = optimizedCv?.skills || [];
    if (currentSkills.includes(keyword)) {
      showToast(`${keyword} already in skills`, 'info');
      return;
    }
    updatePath(['skills'], [...currentSkills, keyword]);
    showToast(`Added ${keyword} to skills`);
  };

  const applySuggestion = async (type: string, suggestion: string, index?: number) => {
    setLoading(true);
    setLoadingMsg('Applying suggestion...');
    try {
      let textToEdit = '';
      let path: any[] = [];
      
      if (type === 'summary') {
        textToEdit = optimizedCv?.optimized_summary || optimizedCv?.personal_info?.summary || '';
        path = ['optimized_summary'];
      } else if (type === 'experience' && typeof index === 'number') {
        textToEdit = (optimizedCv?.experience?.[index]?.bullets || []).join('\n');
        path = ['experience', index, 'bullets'];
      }

      const res = await fetch('/api/edit-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text: textToEdit, 
          instruction: suggestion,
          targetJobTitle: optimizedCv?.personal_info?.job_title 
        })
      });
      
      const data = await res.json();
      if (data.editedText) {
        if (type === 'experience') {
          updatePath(path, data.editedText.split('\n').filter((b: string) => b.trim()));
        } else {
          updatePath(path, data.editedText);
        }
        showToast('Suggestion applied!');
      }
    } catch (e) {
      showToast('Failed to apply suggestion', 'error');
    } finally {
      setLoading(false);
    }
  };

  const acceptAllChanges = () => {
    setExtractedCv(JSON.parse(JSON.stringify(optimizedCv)));
    setShowChanges(false);
    showToast('All changes accepted');
  };

  const declineAllChanges = () => {
    setOptimizedCv(JSON.parse(JSON.stringify(extractedCv)));
    setShowChanges(false);
    showToast('Changes reverted');
  };

  const highlightDiff = (current: string, original: string) => {
    if (!showChanges || current === original) return current;
    return (
      <span className="bg-emerald-100 text-emerald-900 px-0.5 rounded border border-emerald-200">
        {current}
      </span>
    );
  };

  const [leftPanelWidth, setLeftPanelWidth] = useState(550);
  const [isResizing, setIsResizing] = useState(false);
    const [activeTab, setActiveTab] = useState<'analysis' | 'edit'>('edit');

    useEffect(() => {
      if (tabParam === 'analysis') {
        setActiveTab('analysis');
      }
    }, [tabParam]);

  const [activeMode, setActiveMode] = useState<'content' | 'layout'>('content');
  const [activeLayoutTab, setActiveLayoutTab] = useState<'settings' | 'layout'>('settings');
  
    const [targetCountry, setTargetCountry] = useState('US');
    const [companyType, setCompanyType] = useState('corporate');

    useEffect(() => {

    const handleMouseMove = (e: MouseEvent) => {
      if (!isResizing) return;
      const newWidth = Math.max(400, Math.min(1000, e.clientX));
      setLeftPanelWidth(newWidth);
    };
    const handleMouseUp = () => setIsResizing(false);

    if (isResizing) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    } else {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    }
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isResizing]);

  const saveToHistory = (extCv: any, optCv: any) => {
    const newState = { extractedCv: JSON.parse(JSON.stringify(extCv)), optimizedCv: JSON.parse(JSON.stringify(optCv)) };
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newState);
    if (newHistory.length > 20) newHistory.shift();
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  const undo = () => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setExtractedCv(prevState.extractedCv);
      setOptimizedCv(prevState.optimizedCv);
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setExtractedCv(nextState.extractedCv);
      setOptimizedCv(nextState.optimizedCv);
      setHistoryIndex(historyIndex + 1);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = e.target.files?.[0];
    if (!uploadedFile) return;
    setFile(uploadedFile);
    setLoading(true);
    setLoadingMsg('Extracting information from resume...');
    setProgress(20);

    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const res = await fetch('/api/extract', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) throw new Error('Failed to extract CV');
      const data = await res.json();
      
      // Normalize data (responsibilities -> bullets)
      if (data.experience) {
        data.experience = data.experience.map((exp: any) => ({
          ...exp,
          bullets: exp.bullets || exp.responsibilities || []
        }));
      }

      setExtractedCv(data);
      setOptimizedCv(data);
      setProgress(100);
      showToast('Resume extracted successfully!');
      setStep(2);
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handleAnalysedJob = async () => {
    if (!jobDescription) return;
    setLoading(true);
    setProgress(10);
    try {
      setLoadingMsg('Analyzing job requirements...');
      const jobRes = await fetch('/api/analyze-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobDescription, targetJob })
      });
      const jobData = await jobRes.json();
      
      setProgress(40);
      setLoadingMsg('Calculating match & ATS score...');
      const matchRes = await fetch('/api/match', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvJson: extractedCv, jobRequirementsJson: jobData })
      });
      const matchData = await matchRes.json();
      setMatchAnalysis(matchData);
      
      setProgress(70);
      setLoadingMsg('Optimizing CV for target role...');
      const optimizeRes = await fetch('/api/optimize', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cvJson: extractedCv, jobDescription, targetJob, matchAnalysis: matchData })
      });
      const optimizeData = await optimizeRes.json();
      
      // Normalize optimized data too
      if (optimizeData.experience) {
        optimizeData.experience = optimizeData.experience.map((exp: any) => ({
          ...exp,
          bullets: exp.bullets || exp.responsibilities || []
        }));
      }

      setOptimizedCv(optimizeData);
      
      if (matchData.match_score > 90) {
        setSelectedTemplateId('standard');
      } else if (jobDescription.toLowerCase().includes('startup') || jobDescription.toLowerCase().includes('tech')) {
        setSelectedTemplateId('minimalist');
      }

      saveToHistory(extractedCv, optimizeData);
      setStep(3);
      showToast('Resume optimized by AI!');
    } catch (err: any) {
      setError(err.message);
      showToast(err.message, 'error');
    } finally {
      setLoading(false);
      setProgress(0);
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      updatePath(['personal_info', 'image'], base64String);
      showToast('Profile photo updated!');
    };
    reader.readAsDataURL(file);
  };

  const updatePath = (path: any[], value: any) => {
    const newData = JSON.parse(JSON.stringify(optimizedCv));
    let current = newData;
    for (let i = 0; i < path.length - 1; i++) {
      if (!current[path[i]]) current[path[i]] = {};
      current = current[path[i]];
    }
    current[path[path.length - 1]] = value;
    setOptimizedCv(newData);
    
    if (path[0] === 'personal_info') {
      const newExtData = JSON.parse(JSON.stringify(extractedCv));
      let extCurrent = newExtData;
      for (let i = 0; i < path.length - 1; i++) {
        extCurrent = extCurrent[path[i]];
      }
      extCurrent[path[path.length - 1]] = value;
      setExtractedCv(newExtData);
    }
  };

  const refineWithAI = async (text: string, path: any[], sectionId: string) => {
    setLoading(true);
    setLoadingMsg('Refining text...');
    try {
      const res = await fetch('/api/edit-section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text, targetJobTitle: extractedCv?.personal_info?.job_title })
      });
      const data = await res.json();
      if (data.editedText) {
        updatePath(path, data.editedText);
        showToast('Text refined by AI!');
      }
    } catch (e) {
      showToast('Refinement failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  const addItem = (section: string, defaultObj: any) => {
    const newData = JSON.parse(JSON.stringify(optimizedCv));
    if (!newData[section]) newData[section] = [];
    newData[section].push(defaultObj);
    setOptimizedCv(newData);
  };

  const removeItem = (section: string, index: number) => {
    const newData = JSON.parse(JSON.stringify(optimizedCv));
    newData[section].splice(index, 1);
    setOptimizedCv(newData);
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { role: 'user', content: chatInput };
    setChatMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsChatLoading(true);
    try {
      // Simulate API call for now or connect to real endpoint if it exists
      setTimeout(() => {
        setChatMessages(prev => [...prev, { role: 'assistant', content: "I've analyzed your request. I recommend highlighting your architectural achievements in your summary to better align with this role." }]);
        setIsChatLoading(false);
      }, 1000);
    } catch (e) {
      setIsChatLoading(false);
      showToast('Chat failed', 'error');
    }
  };

  const renderField = (label: string, path: any[], value: any, isTextArea = false, placeholder = "") => (
    <div className={cn("space-y-1.5", isTextArea ? "w-full" : "flex-1")}>
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      {isTextArea ? (
        <textarea 
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all h-32 resize-none leading-relaxed"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => updatePath(path, e.target.value)}
        />
      ) : (
        <input 
          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all"
          placeholder={placeholder}
          value={value || ''}
          onChange={(e) => updatePath(path, e.target.value)}
        />
      )}
    </div>
  );

  return (
    <main className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-900 overflow-hidden relative">
      {/* Loading Overlay */}
      <AnimatePresence>
        {loading && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center"
          >
            <div className="w-24 h-24 relative mb-8">
              <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
              <motion.div 
                className="absolute inset-0 border-4 border-indigo-600 rounded-full border-t-transparent"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-indigo-600 animate-pulse" />
              </div>
            </div>
            <h2 className="text-2xl font-black italic mb-2 uppercase">{loadingMsg}</h2>
            <div className="w-64 h-2 bg-slate-100 rounded-full overflow-hidden mb-4">
              <motion.div 
                className="h-full bg-indigo-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-slate-400 font-bold max-w-xs">{progress}% complete - our AI is processing your request</p>
          </motion.div>
        )}
      </AnimatePresence>

      {step === 1 && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 max-w-4xl mx-auto w-full">
           <div className="text-center mb-12">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200">
                 <Upload className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-black mb-4 uppercase italic">Upload your current resume</h1>
              <p className="text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
                We'll extract your information automatically to populate your new template. Supporting PDF and DOCX formats.
              </p>
           </div>
           
           <div 
             onClick={() => fileInputRef.current?.click()}
             className="w-full aspect-[16/9] border-4 border-dashed border-slate-200 rounded-[2.5rem] bg-white flex flex-col items-center justify-center cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group"
           >
              <div className="w-16 h-16 bg-slate-50 text-slate-400 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                 <FileText className="w-8 h-8" />
              </div>
              <span className="text-lg font-black text-slate-400 group-hover:text-indigo-600 transition-all uppercase">Drop your file here or click to browse</span>
              <span className="text-[10px] font-black uppercase text-slate-300 mt-2 tracking-widest">Maximum file size: 10MB</span>
              <input type="file" ref={fileInputRef} className="hidden" accept=".pdf,.docx" onChange={handleFileUpload} />
           </div>

           <div className="mt-12 flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                 <span className="text-xs font-bold text-slate-600">Secure & Confidential</span>
              </div>
              <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                 <span className="text-xs font-bold text-slate-600">AI-Powered Extraction</span>
              </div>
              <div className="flex items-center gap-2">
                 <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                 <span className="text-xs font-bold text-slate-600">ATS-Friendly Output</span>
              </div>
           </div>
           
           <button onClick={() => setStep(3)} className="mt-12 text-slate-400 font-bold text-sm hover:text-indigo-600 transition-colors uppercase tracking-widest">
              Skip and start from scratch
           </button>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1 flex flex-col items-center justify-center p-12 max-w-4xl mx-auto w-full">
           <div className="text-center mb-12">
              <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-indigo-200">
                 <Target className="w-10 h-10 text-white" />
              </div>
              <h1 className="text-4xl font-black mb-4 uppercase italic">Tailor to your target job</h1>
              <p className="text-slate-500 font-bold max-w-lg mx-auto leading-relaxed">
                Provide your target job title and description. Our AI will optimize your resume to match the requirements perfectly.
              </p>
           </div>
           
           <div className="w-full space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Target Job Title</label>
                <input 
                  type="text"
                  placeholder="e.g. Senior Software Architect"
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all"
                  value={targetJob || ''}
                  onChange={(e) => setTargetJob(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Job Description</label>
                <textarea 
                  placeholder="Paste the job description here..."
                  className="w-full px-6 py-4 bg-white border border-slate-200 rounded-2xl text-sm font-bold focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all h-64 resize-none leading-relaxed"
                  value={jobDescription || ''}
                  onChange={(e) => setJobDescription(e.target.value)}
                />
              </div>

                <div className="flex gap-4">
                   <button 
                    onClick={handleAnalysedJob}
                    disabled={!targetJob || !jobDescription}
                    className="w-full py-4 bg-indigo-600 text-white rounded-2xl text-sm font-black hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-100 uppercase flex items-center justify-center gap-2 disabled:opacity-50"
                   >
                     Optimize with AI <Sparkles className="w-4 h-4" />
                   </button>
                </div>
           </div>

           <button onClick={() => setStep(3)} className="mt-12 text-slate-400 font-bold text-sm hover:text-indigo-600 transition-colors uppercase tracking-widest">
              Skip and go to editor
           </button>
        </div>
      )}

      {step === 3 && (
        <>
        {/* Navigation */}
        <nav className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-50 no-print">
            <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-lg shadow-indigo-100">
              <Sparkles className="w-5 h-5" />
            </div>
            <h1 className="text-lg font-black text-slate-900 tracking-tight uppercase">Jobsut</h1>
          </div>
          <div className="h-6 w-[1px] bg-slate-200 mx-2" />
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-sm font-bold text-slate-700">{optimizedCv?.personal_info?.job_title || 'New Resume'}</span>
            <Edit3 className="w-3.5 h-3.5 text-slate-400" />
          </div>
        </div>
          <div className="flex items-center gap-3">
            <Button onClick={handleSaveResume} variant="outline" className="h-9 px-4 rounded-full border-indigo-200 text-indigo-600 hover:bg-indigo-50">
              Save Changes
            </Button>
            <Button onClick={() => setAskAiVisible(true)} variant="ai" className="h-9 px-4 rounded-full">
              Ask JobSuit AI <Send className="w-3.5 h-3.5" />
            </Button>

          <Button onClick={() => window.print()} variant="secondary" className="h-9 px-4 rounded-full">
            <FileDown className="w-4 h-4" /> Download PDF
          </Button>
        </div>
      </nav>

        <div className="flex-1 flex overflow-hidden">
          {/* Left Panel */}
          <div 
            className="bg-white border-r border-slate-200 flex flex-col overflow-hidden shrink-0 no-print"
            style={{ width: `${leftPanelWidth}px` }}
          >
          {/* Tabs */}
          <div className="flex border-b border-slate-100 shrink-0 h-14">
            {activeMode === 'content' ? (
              <>
                <button 
                  onClick={() => setActiveTab('analysis')}
                  className={cn(
                    "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                    activeTab === 'analysis' ? "text-indigo-600 bg-white" : "text-slate-400 bg-slate-50/50 hover:text-slate-600"
                  )}
                >
                  Resume Analysis
                  {activeTab === 'analysis' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                </button>
                <button 
                  onClick={() => setActiveTab('edit')}
                  className={cn(
                    "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative",
                    activeTab === 'edit' ? "text-indigo-600 bg-white" : "text-slate-400 bg-slate-50/50 hover:text-slate-600"
                  )}
                >
                  Manual Editor
                  {activeTab === 'edit' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                </button>
              </>
            ) : (
              <>
                <button 
                  onClick={() => setActiveLayoutTab('settings')}
                  className={cn(
                    "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-2",
                    activeLayoutTab === 'settings' ? "text-indigo-600 bg-white" : "text-slate-400 bg-slate-50/50 hover:text-slate-600"
                  )}
                >
                  <Settings className="w-4 h-4" /> Settings
                  {activeLayoutTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                </button>
                <button 
                  onClick={() => setActiveLayoutTab('layout')}
                  className={cn(
                    "flex-1 py-4 text-[10px] font-black uppercase tracking-widest transition-all relative flex items-center justify-center gap-2",
                    activeLayoutTab === 'layout' ? "text-indigo-600 bg-white" : "text-slate-400 bg-slate-50/50 hover:text-slate-600"
                  )}
                >
                  <FileText className="w-4 h-4" /> Layout
                  {activeLayoutTab === 'layout' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600" />}
                </button>
              </>
            )}
          </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-4">
                {activeMode === 'content' ? (
                  activeTab === 'analysis' ? (
                    <div className="space-y-6">
                        {/* Analysis Content */}
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Job Description</label>
                            <Button 
                              onClick={handleAnalysedJob} 
                              variant="ai" 
                              className="h-8 px-4 rounded-xl text-[10px]"
                              disabled={!jobDescription || loading}
                            >
                              Run Analysis <Sparkles className="w-3 h-3" />
                            </Button>
                          </div>
                          <textarea 
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none transition-all h-32 resize-none leading-relaxed"
                            placeholder="Paste the job description here to optimize your resume..."
                            value={jobDescription || ''}
                            onChange={(e) => setJobDescription(e.target.value)}
                          />
                        </div>

                        {matchAnalysis && (
                          <div className="space-y-6">
                            {/* Match Score Card */}
                            <Card className="p-6 bg-gradient-to-br from-indigo-600 to-purple-700 text-white border-none shadow-lg shadow-indigo-100">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-black uppercase tracking-widest italic">Match Score</h3>
                                <ShieldCheck className="w-5 h-5 text-indigo-200" />
                              </div>
                              <div className="flex items-center gap-6">
                                <div className="relative w-20 h-20 flex items-center justify-center">
                                  <svg className="w-full h-full -rotate-90">
                                    <circle cx="40" cy="40" r="36" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                                    <motion.circle 
                                      cx="40" cy="40" r="36" fill="none" stroke="white" strokeWidth="8" 
                                      strokeDasharray="226.2"
                                      initial={{ strokeDashoffset: 226.2 }}
                                      animate={{ strokeDashoffset: 226.2 - (226.2 * (matchAnalysis.match_score || 0)) / 100 }}
                                      transition={{ duration: 1.5, ease: "easeOut" }}
                                    />
                                  </svg>
                                  <span className="absolute text-xl font-black">{matchAnalysis.match_score}%</span>
                                </div>
                                <div className="flex-1">
                                  <p className="text-[10px] font-bold text-indigo-100 uppercase tracking-widest mb-1">Status</p>
                                  <h4 className="text-lg font-black italic">
                                    {matchAnalysis.match_score >= 80 ? 'Excellent Match' : 
                                     matchAnalysis.match_score >= 60 ? 'Good Match' : 'Needs Improvement'}
                                  </h4>
                                </div>
                              </div>
                            </Card>

                            {/* Missing Keywords */}
                            <div className="space-y-3">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Missing Keywords</h3>
                              <div className="flex flex-wrap gap-2">
                                {(matchAnalysis.missing_keywords || []).map((keyword: string, i: number) => (
                                  <button 
                                    key={i}
                                    onClick={() => applyKeyword(keyword)}
                                    className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-[10px] font-black hover:bg-indigo-50 hover:border-indigo-200 transition-all flex items-center gap-2 group"
                                  >
                                    <Plus className="w-3 h-3 text-slate-400 group-hover:text-indigo-600" />
                                    {keyword}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Suggested Edits */}
                            <div className="space-y-4 pt-4 border-t border-slate-100">
                              <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">AI Suggested Edits</h3>
                              
                              {matchAnalysis.suggested_edits?.summary && (
                                <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-2xl space-y-3">
                                  <div className="flex items-center gap-2 text-indigo-600">
                                    <Sparkles className="w-4 h-4" />
                                    <h4 className="text-[10px] font-black uppercase tracking-widest">Summary Edit</h4>
                                  </div>
                                  <p className="text-xs font-bold text-slate-700 leading-relaxed">{matchAnalysis.suggested_edits.summary}</p>
                                  <Button onClick={() => applySuggestion('summary', matchAnalysis.suggested_edits.summary)} variant="ai" className="h-8 w-full text-[10px] rounded-xl">Apply Suggestion</Button>
                                </div>
                              )}

                              <div className="space-y-3">
                                {(matchAnalysis.suggested_edits?.experience || []).map((edit: string, i: number) => (
                                  <div key={i} className="p-4 bg-slate-50 border border-slate-100 rounded-2xl flex items-start gap-3">
                                    <div className="w-5 h-5 rounded-full bg-white border border-slate-200 flex items-center justify-center shrink-0 mt-0.5">
                                      <span className="text-[10px] font-black">{i + 1}</span>
                                    </div>
                                    <p className="text-xs font-bold text-slate-600 leading-relaxed">{edit}</p>
                                  </div>
                                ))}
                              </div>
                            </div>

                            {/* ATS Validation */}
                            <div className="space-y-3 pt-4 border-t border-slate-100">
                               <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">ATS Optimization Check</h3>
                               <div className="grid grid-cols-1 gap-2">
                                  {Object.entries(matchAnalysis.ats_validation || {}).map(([key, val]: [string, any], i) => (
                                    <div key={i} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl">
                                       <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">{key.replace(/_/g, ' ')}</span>
                                       <div className="flex items-center gap-2">
                                          <span className="text-[10px] font-bold text-slate-900">{val}</span>
                                          {val === 'Pass' || val === 'Optimal' ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> : <AlertCircle className="w-3.5 h-3.5 text-rose-500" />}
                                       </div>
                                    </div>
                                  ))}
                               </div>
                            </div>
                          </div>
                        )}

                    </div>
                  ) : (
                    <div className="space-y-8">
                      {/* Manual Edit Sections */}
                      <EditorSection 
                        icon={User} 
                        title="Personal Information" 
                        isOpen={openSections.includes('personal')}
                        onToggle={() => setOpenSections(prev => prev.includes('personal') ? prev.filter(s => s !== 'personal') : [...prev, 'personal'])}
                      >
                        <div className="flex flex-col gap-6">
                           <div className="flex items-center gap-4">
                              <div className="w-16 h-16 bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center relative group">
                                 {optimizedCv?.personal_info?.image ? (
                                   <img src={optimizedCv.personal_info.image} className="w-full h-full object-cover" />
                                 ) : (
                                   <User className="w-8 h-8 text-slate-400" />
                                 )}
                                 <button 
                                   onClick={() => photoInputRef.current?.click()}
                                   className="absolute inset-0 bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                                 >
                                    <Upload className="w-4 h-4" />
                                 </button>
                                 <input type="file" ref={photoInputRef} className="hidden" accept="image/*" onChange={handlePhotoUpload} />
                              </div>
                              <div className="flex-1">
                                 <h4 className="text-sm font-black italic mb-1">Profile Photo</h4>
                                 <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">JPG, PNG or SVG. Max 2MB.</p>
                              </div>
                           </div>
                               <div className="grid grid-cols-2 gap-4">
                                  {renderField('Full Name', ['personal_info', 'full_name'], optimizedCv?.personal_info?.full_name, false, 'John Doe')}
                                  {renderField('Professional Title', ['personal_info', 'job_title'], optimizedCv?.personal_info?.job_title, false, 'Software Engineer')}
                                  {renderField('Email', ['personal_info', 'email'], optimizedCv?.personal_info?.email, false, 'alex@example.com')}
                                  {renderField('Phone Number', ['personal_info', 'phone'], optimizedCv?.personal_info?.phone, false, '+1 234 567 890')}
                                  {renderField('LinkedIn', ['personal_info', 'linkedin'], optimizedCv?.personal_info?.linkedin, false, 'linkedin.com/in/username')}
                                  {renderField('City', ['personal_info', 'location'], optimizedCv?.personal_info?.location, false, 'New York, NY')}
                                  {renderField('GitHub', ['personal_info', 'github'], optimizedCv?.personal_info?.github, false, 'github.com/username')}
                                  {renderField('Portfolio/Website', ['personal_info', 'website'], optimizedCv?.personal_info?.website, false, 'www.yourportfolio.com')}
                                  {renderField('Address', ['personal_info', 'address'], optimizedCv?.personal_info?.address, false, '123 Street Name, Apt 4B')}
                               </div>
                        </div>
                      </EditorSection>
                      <EditorSection title="Professional Summary" icon={Wand2} isOpen={openSections.includes('summary')} onToggle={() => setOpenSections(prev => prev.includes('summary') ? prev.filter(s => s !== 'summary') : [...prev, 'summary'])}>
                     <div className="space-y-3">
                        {renderField("Summary", ['optimized_summary'], optimizedCv?.optimized_summary || optimizedCv?.personal_info?.summary, true)}
                        <Button onClick={() => refineWithAI(optimizedCv?.optimized_summary || optimizedCv?.personal_info?.summary, ['optimized_summary'], 'summary')} variant="ai" className="w-full h-10 rounded-xl text-xs">
                          Write with AI <Sparkles className="w-3.5 h-3.5" />
                        </Button>
                     </div>
                  </EditorSection>

                  <EditorSection title="Work Experience" icon={Briefcase} isOpen={openSections.includes('experience')} onToggle={() => setOpenSections(prev => prev.includes('experience') ? prev.filter(s => s !== 'experience') : [...prev, 'experience'])}>
                    <div className="space-y-6">
                      {(optimizedCv?.experience || []).map((exp: any, idx: number) => (
                        <div key={idx} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4 relative group">
                          <button onClick={() => removeItem('experience', idx)} className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-2 gap-4">
                            {renderField("Company", ['experience', idx, 'company'], exp.company)}
                            {renderField("Role", ['experience', idx, 'job_title'], exp.job_title)}
                            {renderField("Location", ['experience', idx, 'location'], exp.location)}
                            <div className="grid grid-cols-2 gap-2">
                               {renderField("Start Date", ['experience', idx, 'start_date'], exp.start_date)}
                               {renderField("End Date", ['experience', idx, 'end_date'], exp.end_date)}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                              <input type="checkbox" checked={!!exp.currently_work_here} onChange={(e) => updatePath(['experience', idx, 'currently_work_here'], e.target.checked)} className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/10" />
                             <label className="text-[10px] font-black uppercase text-slate-500">Currently work here</label>
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Responsibilities</label>
                             {(exp.bullets || []).map((bullet: string, bIdx: number) => (
                               <div key={bIdx} className="flex gap-2">
                                 <textarea 
                                    className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500/10 outline-none h-20 resize-none"
                                    value={bullet || ''}
                                    onChange={(e) => {
                                      const newBullets = [...exp.bullets];
                                      newBullets[bIdx] = e.target.value;
                                      updatePath(['experience', idx, 'bullets'], newBullets);
                                    }}
                                 />
                                 <button onClick={() => {
                                   const newBullets = [...exp.bullets];
                                   newBullets.splice(bIdx, 1);
                                   updatePath(['experience', idx, 'bullets'], newBullets);
                                 }} className="p-2 text-slate-300 hover:text-rose-500"><Minus className="w-4 h-4" /></button>
                               </div>
                             ))}
                             <div className="flex gap-2">
                                <Button variant="outline" className="flex-1 h-9 rounded-xl text-[10px]" onClick={() => {
                                  const newBullets = [...(exp.bullets || []), ""];
                                  updatePath(['experience', idx, 'bullets'], newBullets);
                                }}>
                                  <Plus className="w-3.5 h-3.5" /> Add Responsibility
                                </Button>
                                <Button variant="ai" className="flex-1 h-9 rounded-xl text-[10px]" onClick={() => refineWithAI(exp.bullets.join('\n'), ['experience', idx, 'bullets'], 'experience')}>
                                  <Sparkles className="w-3.5 h-3.5" /> Write with AI
                                </Button>
                             </div>
                          </div>
                        </div>
                      ))}
                      <Button onClick={() => addItem('experience', { company: '', job_title: '', bullets: [], start_date: '', end_date: '', location: '', currently_work_here: false })} variant="outline" className="w-full h-12 rounded-2xl border-dashed border-2 border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/30">
                        <PlusCircle className="w-5 h-5 mr-2" /> Add Work Experience
                      </Button>
                    </div>
                  </EditorSection>

                  <EditorSection title="Education" icon={GraduationCap} isOpen={openSections.includes('education')} onToggle={() => setOpenSections(prev => prev.includes('education') ? prev.filter(s => s !== 'education') : [...prev, 'education'])}>
                    <div className="space-y-4">
                      {(optimizedCv?.education || []).map((edu: any, idx: number) => (
                        <div key={idx} className="p-5 border border-slate-100 rounded-2xl bg-slate-50/50 space-y-4 relative group">
                           <button onClick={() => removeItem('education', idx)} className="absolute top-4 right-4 p-1.5 text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100">
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <div className="grid grid-cols-2 gap-4">
                            {renderField("Institution", ['education', idx, 'institution'], edu.institution)}
                            {renderField("Degree", ['education', idx, 'degree'], edu.degree)}
                            {renderField("Location", ['education', idx, 'location'], edu.location)}
                            {renderField("End Date", ['education', idx, 'end_date'], edu.end_date)}
                          </div>
                        </div>
                      ))}
                      <Button onClick={() => addItem('education', { institution: '', degree: '', end_date: '', location: '' })} variant="outline" className="w-full h-10 rounded-xl border-dashed">
                        <Plus className="w-4 h-4 mr-2" /> Add Education
                      </Button>
                    </div>
                  </EditorSection>

                  <EditorSection title="Skills" icon={Terminal} isOpen={openSections.includes('skills')} onToggle={() => setOpenSections(prev => prev.includes('skills') ? prev.filter(s => s !== 'skills') : [...prev, 'skills'])}>
                    <div className="space-y-6">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">General Skills</label>
                         <div className="flex flex-wrap gap-2">
                            {(optimizedCv?.skills || []).map((skill: string, idx: number) => (
                              <div key={idx} className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg flex items-center gap-2 text-xs font-bold group">
                                 {skill}
                                 <button onClick={() => {
                                   const newSkills = [...optimizedCv.skills];
                                   newSkills.splice(idx, 1);
                                   updatePath(['skills'], newSkills);
                                 }} className="text-slate-300 hover:text-rose-500 opacity-0 group-hover:opacity-100"><X className="w-3 h-3" /></button>
                              </div>
                            ))}
                            <Button variant="outline" className="h-8 px-3 rounded-lg text-[10px]" onClick={() => {
                               const skill = prompt("Enter skill name");
                               if (skill) updatePath(['skills'], [...(optimizedCv.skills || []), skill]);
                            }}>
                               <Plus className="w-3 h-3" /> Add Skill
                            </Button>
                         </div>
                      </div>
                    </div>
                  </EditorSection>
                </div>
              )
            ) : activeMode === 'layout' ? (
              <div className="space-y-8 pb-20">
                {activeLayoutTab === 'settings' ? (
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Body Size</label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
                            <button onClick={() => setLayoutSettings({...layoutSettings, fontSize: Math.max(50, layoutSettings.fontSize - 5)})} className="p-1 hover:bg-white rounded transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="text-[10px] font-black w-10 text-center">{layoutSettings.fontSize}%</span>
                            <button onClick={() => setLayoutSettings({...layoutSettings, fontSize: Math.min(200, layoutSettings.fontSize + 5)})} className="p-1 hover:bg-white rounded transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                      <input type="range" min="50" max="200" value={layoutSettings.fontSize} onChange={(e) => setLayoutSettings({...layoutSettings, fontSize: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-xs font-black text-slate-700 uppercase tracking-widest">Line Spacing</label>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-lg shadow-inner">
                            <button onClick={() => setLayoutSettings({...layoutSettings, lineSpacing: Math.max(80, layoutSettings.lineSpacing - 5)})} className="p-1 hover:bg-white rounded transition-colors"><Minus className="w-3.5 h-3.5" /></button>
                            <span className="text-[10px] font-black w-10 text-center">{layoutSettings.lineSpacing}%</span>
                            <button onClick={() => setLayoutSettings({...layoutSettings, lineSpacing: Math.min(200, layoutSettings.lineSpacing + 5)})} className="p-1 hover:bg-white rounded transition-colors"><Plus className="w-3.5 h-3.5" /></button>
                          </div>
                        </div>
                      </div>
                      <input type="range" min="80" max="200" value={layoutSettings.lineSpacing} onChange={(e) => setLayoutSettings({...layoutSettings, lineSpacing: parseInt(e.target.value)})} className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-10">
                    <div className="space-y-6 pt-8 border-t border-slate-100">
                       <div className="flex items-center gap-2">
                          <Settings className="w-4 h-4 text-indigo-600" />
                          <h3 className="text-sm font-black text-slate-900 uppercase">Margins & Paddings</h3>
                       </div>
                       <div className="space-y-6">
                          {[
                            { label: 'Top & Bottom', key: 'topBottom', unit: 'in', min: 0.1, max: 1, step: 0.1 },
                            { label: 'Left & Right', key: 'leftRight', unit: 'in', min: 0.1, max: 1, step: 0.1 },
                            { label: 'Between Sections', key: 'betweenSections', unit: 'pt', min: 0, max: 40, step: 1 },
                            { label: 'Between Titles & Content', key: 'betweenTitles', unit: 'pt', min: 0, max: 20, step: 1 },
                            { label: 'Between Content Blocks', key: 'betweenBlocks', unit: 'pt', min: 0, max: 20, step: 1 }
                          ].map((m) => (
                            <div key={m.key} className="space-y-2.5">
                               <div className="flex justify-between items-center">
                                  <label className="text-[10px] font-black text-slate-500 uppercase">{m.label}</label>
                                  <span className="text-[10px] font-black text-slate-900">{(layoutSettings.margins as any)[m.key]} {m.unit}</span>
                               </div>
                               <input 
                                 type="range" 
                                 min={m.min} 
                                 max={m.max} 
                                 step={m.step} 
                                 value={(layoutSettings.margins as any)[m.key]} 
                                 onChange={(e) => setLayoutSettings({
                                   ...layoutSettings, 
                                   margins: { ...layoutSettings.margins, [m.key]: parseFloat(e.target.value) }
                                 })}
                                 className="w-full h-1 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600" 
                               />
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        </div>

          {/* Resize Handle */}
          <div 
            onMouseDown={() => setIsResizing(true)}
            className="w-1.5 h-full hover:bg-indigo-400 cursor-col-resize transition-colors bg-slate-200 shrink-0 z-40 relative group no-print"
          >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-8 bg-white border border-slate-200 rounded-full flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm">
             <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
             <div className="w-0.5 h-3 bg-slate-300 rounded-full" />
          </div>
        </div>

          {/* Right Panel - Preview */}
          <div className="flex-1 bg-slate-100 flex flex-col relative overflow-hidden">
            {/* Toolbar */}
            <div className="h-16 bg-white border-b flex items-center justify-between px-8 shrink-0 z-20 no-print">
              <div className="flex items-center gap-6">
               <div className="flex items-center gap-2 p-1 bg-slate-50 border border-slate-200 rounded-xl">
                  <button onClick={() => setZoom(Math.max(50, zoom - 10))} className="p-2 hover:bg-white rounded-lg transition-colors"><Minus className="w-4 h-4" /></button>
                  <span className="text-xs font-black w-10 text-center">{zoom}%</span>
                  <button onClick={() => setZoom(Math.min(150, zoom + 10))} className="p-2 hover:bg-white rounded-lg transition-colors"><Plus className="w-4 h-4" /></button>
               </div>
               <div className="flex items-center gap-1">
                  <button onClick={undo} disabled={historyIndex <= 0} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all"><RotateCcw className="w-4 h-4 rotate-[-45deg]" /></button>
                  <button onClick={redo} disabled={historyIndex >= history.length - 1} className="p-2 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 disabled:opacity-30 transition-all"><RotateCcw className="w-4 h-4 scale-x-[-1] rotate-[45deg]" /></button>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <button 
                onClick={() => setIsTemplateModalOpen(true)}
                className={cn(
                  "h-10 px-6 rounded-xl text-xs font-black transition-all flex items-center gap-2",
                  isTemplateModalOpen ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                )}
               >
                 <Box className="w-4 h-4" /> Templates
               </button>
               <button 
                onClick={() => setActiveMode(activeMode === 'layout' ? 'content' : 'layout')}
                className={cn(
                  "h-10 px-6 rounded-xl text-xs font-black transition-all flex items-center gap-2",
                  activeMode === 'layout' ? "bg-indigo-600 text-white shadow-lg shadow-indigo-100" : "bg-indigo-50 text-indigo-600 hover:bg-indigo-100"
                )}
               >
                 <Palette className="w-4 h-4" /> Layout & Style
               </button>
            </div>

            <button onClick={() => window.print()} className="h-10 px-6 bg-slate-900 text-white rounded-xl text-xs font-black flex items-center gap-2 hover:bg-slate-800 transition-all shadow-xl shadow-slate-200">
               <FileDown className="w-4 h-4" /> Download PDF
            </button>
          </div>

            {/* Action Buttons above CV */}
            <div className="flex justify-center gap-3 py-6 shrink-0 no-print">
               <button 
                 onClick={acceptAllChanges}
                 className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 text-white rounded-full text-xs font-black shadow-lg shadow-emerald-100 hover:bg-emerald-700 transition-all transform active:scale-95"
               >
                <Check className="w-4 h-4" /> Accept Changes
             </button>
             <button 
               onClick={() => setShowChanges(!showChanges)}
               className={cn(
                 "flex items-center gap-2 px-6 py-2.5 rounded-full text-xs font-black shadow-lg transition-all transform active:scale-95",
                 showChanges ? "bg-indigo-100 text-indigo-700 shadow-indigo-200" : "bg-indigo-600 text-white shadow-indigo-100 hover:bg-indigo-700"
               )}
             >
                <Search className="w-4 h-4" /> {showChanges ? 'Hide Changes' : 'Show Changes'}
             </button>
             <button 
               onClick={declineAllChanges}
               className="flex items-center gap-2 px-6 py-2.5 bg-rose-600 text-white rounded-full text-xs font-black shadow-lg shadow-rose-100 hover:bg-rose-700 transition-all transform active:scale-95"
             >
                <X className="w-4 h-4" /> Decline Changes
             </button>
          </div>

          {/* Preview Area */}
          <div className="flex-1 overflow-auto p-12 custom-scrollbar flex justify-center items-start">
             <div 
               className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative origin-top transition-all duration-300 overflow-hidden"
               style={{ 
                 transform: `scale(${zoom / 100})`, 
                 width: layoutSettings.format.includes('A4') ? '210mm' : '215.9mm', 
                 minHeight: layoutSettings.format.includes('A4') ? '297mm' : '279.4mm', 
                 paddingTop: `${layoutSettings.margins.topBottom}in`,
                 paddingBottom: `${layoutSettings.margins.topBottom}in`,
                 paddingLeft: `${layoutSettings.margins.leftRight}in`,
                 paddingRight: `${layoutSettings.margins.leftRight}in`,
                 fontSize: `${(layoutSettings.fontSize / 100) * 11}pt`,
                 lineHeight: layoutSettings.lineSpacing / 100,
                 fontFamily: designStyle.typography.body_font
               }}
             >
                <div className={cn("space-y-1", {
                  'text-left': layoutSettings.headerAlignment === 'left',
                  'text-center': layoutSettings.headerAlignment === 'center',
                  'text-right': layoutSettings.headerAlignment === 'right'
                })} style={{ marginBottom: `${layoutSettings.margins.betweenSections}pt` }}>
                   <h1 className="text-[2.5em] font-black uppercase tracking-tight text-slate-900" style={{ marginBottom: `${layoutSettings.margins.betweenTitles / 2}pt` }}>
                    {highlightDiff(optimizedCv?.personal_info?.full_name, extractedCv?.personal_info?.full_name)}
                   </h1>
                   <p className="text-[0.9em] font-bold text-indigo-600 uppercase tracking-[0.2em]" style={{ marginBottom: `${layoutSettings.margins.betweenTitles}pt` }}>
                    {highlightDiff(optimizedCv?.personal_info?.job_title, extractedCv?.personal_info?.job_title)}
                   </p>
                   <div className={cn("flex flex-wrap gap-x-4 gap-y-1 text-[0.7em] font-bold text-slate-500 uppercase", {
                     'justify-start': layoutSettings.headerAlignment === 'left',
                     'justify-center': layoutSettings.headerAlignment === 'center',
                     'justify-end': layoutSettings.headerAlignment === 'right'
                   })}>
                      {optimizedCv?.personal_info?.email && <span className="flex items-center gap-1"><Mail className="w-[1.2em] h-[1.2em]" /> {optimizedCv.personal_info.email}</span>}
                      {optimizedCv?.personal_info?.phone && <span className="flex items-center gap-1"><Phone className="w-[1.2em] h-[1.2em]" /> {optimizedCv.personal_info.phone}</span>}
                      {optimizedCv?.personal_info?.location && <span className="flex items-center gap-1"><MapPin className="w-[1.2em] h-[1.2em]" /> {optimizedCv.personal_info.location}</span>}
                      {optimizedCv?.personal_info?.linkedin && <span className="flex items-center gap-1"><Linkedin className="w-[1.2em] h-[1.2em]" /> {optimizedCv.personal_info.linkedin}</span>}
                      {optimizedCv?.personal_info?.website && <span className="flex items-center gap-1"><Globe className="w-[1.2em] h-[1.2em]" /> {optimizedCv.personal_info.website}</span>}
                   </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: `${layoutSettings.margins.betweenSections}pt` }}>
                   <section>
                      <h2 className="text-[0.8em] font-black border-b-2 border-slate-900 uppercase tracking-widest text-slate-900" style={{ paddingBottom: '2pt', marginBottom: `${layoutSettings.margins.betweenTitles}pt` }}>Professional Summary</h2>
                      <p className="text-[0.8em] leading-relaxed text-slate-700 whitespace-pre-wrap">
                        {highlightDiff(
                          optimizedCv?.optimized_summary || optimizedCv?.personal_info?.summary,
                          extractedCv?.optimized_summary || extractedCv?.personal_info?.summary
                        )}
                      </p>
                   </section>

                   <section>
                      <h2 className="text-[0.8em] font-black border-b-2 border-slate-900 uppercase tracking-widest text-slate-900" style={{ paddingBottom: '2pt', marginBottom: `${layoutSettings.margins.betweenTitles}pt` }}>Experience</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: `${layoutSettings.margins.betweenBlocks}pt` }}>
                         {(optimizedCv?.experience || []).map((exp: any, i: number) => {
                           const originalExp = extractedCv?.experience?.[i];
                           return (
                             <div key={i} className="space-y-1">
                                <div className="flex justify-between items-baseline">
                                   <div>
                                      <h3 className="text-[0.85em] font-black text-slate-900">{highlightDiff(exp.company, originalExp?.company)}</h3>
                                      <p className="text-[0.8em] font-bold text-slate-600 italic">{highlightDiff(exp.job_title, originalExp?.job_title)}</p>
                                   </div>
                                   <div className={cn("text-right", { 'order-first': layoutSettings.dateAlignment === 'left' })}>
                                      <p className="text-[0.75em] font-black text-slate-900 uppercase">{exp.start_date} – {exp.currently_work_here ? 'Present' : exp.end_date}</p>
                                      <p className="text-[0.75em] font-bold text-slate-400">{exp.location}</p>
                                   </div>
                                </div>
                                <ul className="list-disc list-outside ml-4" style={{ marginTop: '4pt' }}>
                                   {(exp.bullets || []).map((bullet: string, j: number) => (
                                     <li key={j} className="text-[0.8em] leading-relaxed text-slate-700 pl-1">
                                      {highlightDiff(bullet, originalExp?.bullets?.[j])}
                                     </li>
                                   ))}
                                </ul>
                             </div>
                           );
                         })}
                      </div>
                   </section>

                   <section>
                      <h2 className="text-[0.8em] font-black border-b-2 border-slate-900 uppercase tracking-widest text-slate-900" style={{ paddingBottom: '2pt', marginBottom: `${layoutSettings.margins.betweenTitles}pt` }}>Education</h2>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: `${layoutSettings.margins.betweenBlocks}pt` }}>
                         {(optimizedCv?.education || []).map((edu: any, i: number) => {
                            const originalEdu = extractedCv?.education?.[i];
                            return (
                              <div key={i} className="flex justify-between items-baseline">
                                 <div>
                                    <h3 className="text-[0.85em] font-black text-slate-900">{highlightDiff(edu.institution, originalEdu?.institution)}</h3>
                                    <p className="text-[0.8em] font-bold text-slate-600 italic">{highlightDiff(edu.degree, originalEdu?.degree)}</p>
                                 </div>
                                 <div className={cn("text-right", { 'order-first': layoutSettings.dateAlignment === 'left' })}>
                                    <p className="text-[0.75em] font-black text-slate-900 uppercase">{edu.end_date}</p>
                                    <p className="text-[0.75em] font-bold text-slate-400">{edu.location}</p>
                                 </div>
                              </div>
                            );
                         })}
                      </div>
                   </section>

                   <section>
                      <h2 className="text-[0.8em] font-black border-b-2 border-slate-900 uppercase tracking-widest text-slate-900" style={{ paddingBottom: '2pt', marginBottom: `${layoutSettings.margins.betweenTitles}pt` }}>Skills</h2>
                      <div className={cn("gap-x-6 gap-y-2 flex flex-wrap")}>
                         {(optimizedCv?.skills || []).map((skill: string, i: number) => (
                            <div key={i} className="text-[0.8em] text-slate-700 font-medium">
                               <span className="font-black mr-1 text-slate-900">•</span> {highlightDiff(skill, extractedCv?.skills?.[i])}
                            </div>
                         ))}
                      </div>
                   </section>
                </div>
             </div>
          </div>
        </div>
        </div>
      </>
      )}

      {/* Template Modal */}
      <TemplateModal 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)} 
        recommendedTemplateId={matchAnalysis?.match_score > 90 ? 'standard' : (jobDescription.toLowerCase().includes('startup') ? 'minimalist' : 'professional')}
        onSelect={(id) => {
          setSelectedTemplateId(id);
          // Apply template-specific settings
            switch (id) {
              case 'standard':
                setLayoutSettings(prev => ({ ...prev, headerAlignment: 'center', skillsLayout: 'comma' }));
                setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.4' } });
                break;
              case 'hybrid':
                setLayoutSettings(prev => ({ ...prev, headerAlignment: 'left', skillsLayout: 'columns' }));
                setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.5' } });
                // We'll simulate the "Hybrid" look by setting specific margins if needed, 
                // but the renderer currently only supports a few layout flags.
                break;
              case 'modern':

              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'left', skillsLayout: 'columns' }));
              setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.5' } });
              break;
            case 'creative':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'left', skillsLayout: 'columns' }));
              setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.6' } });
              break;
            case 'classic':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'center', skillsLayout: 'comma' }));
              setDesignStyle({ typography: { body_font: 'Times New Roman, serif', heading_font: 'Times New Roman, serif', line_height: '1.4' } });
              break;
            case 'balanced':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'center', skillsLayout: 'columns' }));
              setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.5' } });
              break;
            case 'minimalist':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'left', skillsLayout: 'comma' }));
              setDesignStyle({ typography: { body_font: 'system-ui, sans-serif', heading_font: 'system-ui, sans-serif', line_height: '1.4' } });
              break;
            case 'professional':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'left', skillsLayout: 'columns' }));
              setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.4' } });
              break;
            case 'corporate':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'center', skillsLayout: 'columns' }));
              setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.4' } });
              break;
            case 'bold':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'left', skillsLayout: 'columns' }));
              setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.6' } });
              break;
            case 'slate':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'left', skillsLayout: 'columns' }));
              setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.5' } });
              break;
            case 'compact':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'center', skillsLayout: 'comma' }));
              setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.3' } });
              break;
            case 'coastal':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'left', skillsLayout: 'columns' }));
              setDesignStyle({ typography: { body_font: 'Inter, sans-serif', heading_font: 'Inter, sans-serif', line_height: '1.5' } });
              break;
            case 'executive':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'left', skillsLayout: 'columns' }));
              setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.4' } });
              break;
            case 'insight':
              setLayoutSettings(prev => ({ ...prev, headerAlignment: 'left', skillsLayout: 'columns' }));
              setDesignStyle({ typography: { body_font: 'Arial, sans-serif', heading_font: 'Arial, sans-serif', line_height: '1.4' } });
              break;
          }
          showToast(`Applied ${id.toUpperCase()} template!`);
        }}
        selectedId={selectedTemplateId} 
      />

      {/* AI Chat Drawer */}
      <AnimatePresence>
        {askAiVisible && (
          <motion.div 
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="fixed inset-y-0 right-0 w-[450px] bg-white border-l border-slate-200 z-[100] shadow-2xl flex flex-col"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-indigo-600 text-white">
               <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-md">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black italic leading-none">JobSuit Assistant</h2>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-indigo-100 mt-1">Powered by Advanced AI</p>
                  </div>
               </div>
               <button onClick={() => setAskAiVisible(false)} className="p-2 hover:bg-white/10 rounded-lg transition-colors">
                 <X className="w-6 h-6" />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
               {chatMessages.map((msg, i) => (
                 <div key={i} className={cn("flex flex-col max-w-[85%]", msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start")}>
                    <div className={cn(
                      "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-sm",
                      msg.role === 'user' ? "bg-indigo-600 text-white rounded-tr-none" : "bg-slate-50 text-slate-800 border border-slate-100 rounded-tl-none"
                    )}>
                       {msg.content}
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-300 mt-2 tracking-widest">{msg.role === 'user' ? 'You' : 'JobSuit AI'}</span>
                 </div>
               ))}
               {isChatLoading && (
                 <div className="flex items-center gap-3 text-indigo-600">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-indigo-600 rounded-full animate-bounce delay-200" />
                 </div>
               )}
            </div>

            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
               <div className="relative">
                  <input 
                    className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.5rem] pr-16 outline-none focus:ring-4 focus:ring-indigo-100 transition-all font-medium text-sm shadow-inner"
                    placeholder="Ask about your CV or the job..."
                    value={chatInput || ''}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleChat()}
                  />
                  <button 
                    onClick={handleChat}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-indigo-600 text-white rounded-full flex items-center justify-center hover:bg-indigo-700 transition-all shadow-lg"
                  >
                    <Send className="w-4 h-4" />
                  </button>
               </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 backdrop-blur-md border",
          toast.type === 'success' ? "bg-emerald-500/90 border-emerald-400 text-white" : "bg-indigo-600/90 border-indigo-500 text-white"
        )}>
          <span className="text-sm font-black tracking-tight">{toast.message}</span>
        </div>
      )}

      {/* Step Progress Info */}
      <div className="fixed bottom-6 left-6 z-50 no-print flex items-center gap-2 bg-white/80 backdrop-blur-sm border border-slate-200 px-4 py-2 rounded-full shadow-lg">
         <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
         <span className="text-[10px] font-black uppercase text-slate-500 tracking-widest">Editor Active • Step 3/3</span>
      </div>
    </main>
  );
}

export default function EditorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
      </div>
    }>
      <EditorContent />
    </Suspense>
  );
}
