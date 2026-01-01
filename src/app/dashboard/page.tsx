'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  FileText, Briefcase, Mail, Settings, CreditCard, HelpCircle, MessageSquare, 
  Sparkles, Search, PlusCircle, Minus, Plus, RotateCcw, Edit3, Target, Copy, Trash2, ChevronRight,
  ShieldCheck
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Card, SidebarItem, USER_EXAMPLE_DATA, cn } from '@/components/ResumeComponents';
import { TemplateModal } from '@/components/TemplateModal';

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<'base' | 'tailored'>('base');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSidebar, setActiveSidebar] = useState('My Resumes');
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const resumeGridRef = useRef<HTMLDivElement>(null);

  const [resumes, setResumes] = useState<any[]>([]);
  const [jobs, setJobs] = useState<any[]>([]);
  const [coverLetters, setCoverLetters] = useState<any[]>([]);

    // Load from localStorage on mount
    useEffect(() => {
      const savedResumes = localStorage.getItem('resumes');
      const savedJobs = localStorage.getItem('jobs');
      const savedCoverLetters = localStorage.getItem('cover_letters');

      if (savedResumes) {
        try {
          const parsed = JSON.parse(savedResumes);
          // Deduplicate by ID just in case and ensure IDs are strings/numbers consistently
          const unique = parsed.filter((v: any, i: number, a: any[]) => 
            a.findIndex(t => String(t.id) === String(v.id)) === i
          );
          setResumes(unique);
        } catch (e) {
          setResumes([]);
        }
      } else {
      // Default resumes if none saved
      const defaults = [
        {
          id: 1,
          title: 'Ingénieur logiciel',
          subtitle: 'Job Title: Ingénieur logiciel PHP/React',
          type: 'base',
          data: USER_EXAMPLE_DATA,
          updatedAt: new Date().toISOString()
        },
        {
          id: 2,
          title: 'Développeur .NET',
          subtitle: 'Job Title: Ingénieur en informatique',
          type: 'base',
          data: USER_EXAMPLE_DATA,
          updatedAt: new Date().toISOString()
        }
      ];
      setResumes(defaults);
      localStorage.setItem('resumes', JSON.stringify(defaults));
    }

    if (savedJobs) {
      setJobs(JSON.parse(savedJobs));
    } else {
      const defaults = [
        { id: 1, title: 'Senior Frontend Developer', company: 'TechNova', location: 'Remote', salary: '$120k - $150k', match: 85 },
        { id: 2, title: 'Full Stack Engineer', company: 'CloudScale', location: 'San Francisco, CA', salary: '$140k - $180k', match: 72 },
        { id: 3, title: 'Product Designer', company: 'CreativePulse', location: 'New York, NY', salary: '$110k - $140k', match: 45 },
      ];
      setJobs(defaults);
      localStorage.setItem('jobs', JSON.stringify(defaults));
    }

    if (savedCoverLetters) {
      setCoverLetters(JSON.parse(savedCoverLetters));
    } else {
      const defaults = [
        { id: 1, title: 'Cover Letter - TechNova', date: '2023-12-20', target: 'Senior Frontend Developer' },
        { id: 2, title: 'Generic Tech Cover Letter', date: '2023-11-15', target: 'Software Engineer' },
      ];
      setCoverLetters(defaults);
      localStorage.setItem('cover_letters', JSON.stringify(defaults));
    }
  }, []);

  // Sync to localStorage
  useEffect(() => {
    if (resumes.length > 0) localStorage.setItem('resumes', JSON.stringify(resumes));
  }, [resumes]);

  useEffect(() => {
    if (jobs.length > 0) localStorage.setItem('jobs', JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    if (coverLetters.length > 0) localStorage.setItem('cover_letters', JSON.stringify(coverLetters));
  }, [coverLetters]);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const filteredResumes = resumes
    .filter(r => 
      r.type === activeTab && 
      (r.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
       r.subtitle.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .filter((v: any, i: number, a: any[]) => a.findIndex(t => String(t.id) === String(v.id)) === i);

  const handleDeleteResume = (id: number) => {
    const updated = resumes.filter(r => r.id !== id);
    setResumes(updated);
    localStorage.setItem('resumes', JSON.stringify(updated));
    showToast('Resume deleted successfully.');
  };

    const handleDuplicateResume = (resume: any) => {
      const newResume = {
        ...resume,
        id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
        title: `${resume.title} (Copy)`,
        updatedAt: new Date().toISOString()
      };
      const updated = [...resumes, newResume];
      setResumes(updated);
      localStorage.setItem('resumes', JSON.stringify(updated));
      showToast('Resume duplicated.');
    };

  const handleEditResume = (resume: any) => {
    router.push(`/editor?id=${resume.id}`);
  };

  const handleAnalyzeResume = (resume: any) => {
    router.push(`/editor?id=${resume.id}&mode=tailor&tab=analysis`);
  };

  const handleTailorResume = (resume: any) => {
    router.push(`/editor?id=${resume.id}&mode=tailor`);
  };

  const handleAddJob = () => {
    const title = prompt("Job Title:");
    const company = prompt("Company:");
    if (!title || !company) return;
    
    const newJob = {
      id: Date.now(),
      title,
      company,
      location: 'Remote',
      salary: 'TBD',
      match: Math.floor(Math.random() * 40) + 50
    };
    const updated = [...jobs, newJob];
    setJobs(updated);
    localStorage.setItem('jobs', JSON.stringify(updated));
    showToast('Job added successfully.');
  };

  const handleDeleteJob = (id: number) => {
    const updated = jobs.filter(j => j.id !== id);
    setJobs(updated);
    localStorage.setItem('jobs', JSON.stringify(updated));
    showToast('Job removed.');
  };

  const [profile, setProfile] = useState({
    name: 'Alexander Pierce',
    email: 'alex.pierce@example.com',
    plan: 'Premium'
  });

  return (
    <div ref={containerRef} className="flex h-screen font-sans overflow-hidden relative bg-slate-50">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-slate-200 flex flex-col relative z-20">
        <div className="p-8 flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-100">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-black tracking-tighter text-slate-900 uppercase italic">Jobsut</span>
        </div>

        <nav className="flex-1 px-6 space-y-2">
          <SidebarItem icon={FileText} label="My Resumes" active={activeSidebar === 'My Resumes'} onClick={() => setActiveSidebar('My Resumes')} />
          <SidebarItem icon={ShieldCheck} label="Resume Analysis" active={activeSidebar === 'Resume Analysis'} onClick={() => {
            const lastResume = resumes[0];
            if (lastResume) handleAnalyzeResume(lastResume);
            else showToast('Please create a resume first.', 'info');
          }} />
          <SidebarItem icon={Briefcase} label="My Jobs" active={activeSidebar === 'My Jobs'} onClick={() => setActiveSidebar('My Jobs')} />
          <SidebarItem icon={Mail} label="My Cover Letters" active={activeSidebar === 'My Cover Letters'} onClick={() => setActiveSidebar('My Cover Letters')} />
          <div className="py-6 border-t border-slate-100 mt-4" />
          <SidebarItem icon={Settings} label="Account Settings" active={activeSidebar === 'Account Settings'} onClick={() => setActiveSidebar('Account Settings')} />
          <SidebarItem icon={CreditCard} label="Usage & Billing" active={activeSidebar === 'Usage & Billing'} onClick={() => setActiveSidebar('Usage & Billing')} />
          <div className="py-6 border-t border-slate-100" />
          <SidebarItem icon={HelpCircle} label="Help/ Report a bug" active={activeSidebar === 'Help'} onClick={() => { setActiveSidebar('Help'); showToast('Help desk coming soon!'); }} />
          <SidebarItem icon={MessageSquare} label="Join Discord Community" onClick={() => window.open('https://discord.com', '_blank')} />
        </nav>

        <div className="p-6">
          <div className="bg-indigo-600 rounded-2xl p-6 text-white relative overflow-hidden shadow-xl shadow-indigo-100">
            <div className="relative z-10">
              <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Current Plan</p>
              <h4 className="text-lg font-black mb-4 italic">Premium Pro</h4>
              <button className="w-full py-2.5 bg-white/20 hover:bg-white/30 rounded-xl text-xs font-black transition-all">
                Upgrade Now
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto custom-scrollbar p-12 relative z-10">
        {activeSidebar === 'My Resumes' && (
          <div className="max-w-6xl mx-auto">
            {/* Header Info Boxes */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              <motion.div 
                whileHover={{ y: -5 }}
                className="header-card group p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm transition-all"
              >
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300">
                  <FileText className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 italic tracking-tight">Base Resume</h3>
                <p className="text-slate-500 font-bold mb-8 leading-relaxed text-sm">
                  Your master profile. Create one for each major role you're targeting. Our AI uses this as the foundation for all tailoring.
                </p>
                <button 
                  onClick={() => setIsTemplateModalOpen(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 text-white rounded-xl text-sm font-black hover:bg-indigo-700 transition-all active:scale-95"
                >
                  <PlusCircle className="w-5 h-5" /> Create Master Resume
                </button>
              </motion.div>

              <motion.div 
                whileHover={{ y: -5 }}
                className="header-card group p-10 bg-white border border-slate-200 rounded-[32px] shadow-sm transition-all"
              >
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center mb-8 group-hover:bg-emerald-600 group-hover:text-white transition-all duration-300">
                  <Target className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 mb-3 italic tracking-tight">Tailored Resume</h3>
                <p className="text-slate-500 font-bold mb-8 leading-relaxed text-sm">
                  AI-optimized for specific job descriptions. Increase your interview chances by matching keywords and skills perfectly.
                </p>
                <button 
                  onClick={() => setActiveTab('base')}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-black hover:bg-slate-800 transition-all active:scale-95"
                >
                  <Search className="w-5 h-5" /> Tailor a Resume
                </button>
              </motion.div>
            </div>

            {/* Tabs & Search */}
            <div className="mb-10 flex items-center justify-between">
              <div className="flex bg-slate-200 p-1.5 rounded-2xl">
                <button 
                  onClick={() => setActiveTab('base')}
                  className={cn(
                    "px-8 py-3 text-sm font-black rounded-xl transition-all",
                    activeTab === 'base' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Base Resumes
                </button>
                <button 
                  onClick={() => setActiveTab('tailored')}
                  className={cn(
                    "px-8 py-3 text-sm font-black rounded-xl transition-all",
                    activeTab === 'tailored' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                  )}
                >
                  Tailored
                </button>
              </div>

              <div className="relative w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input 
                  type="text"
                  placeholder="Search your library..."
                  className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 transition-all font-bold text-sm outline-none"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>

            {/* Resume Grid */}
            <div ref={resumeGridRef} className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {filteredResumes.map(resume => (
                <motion.div
                  key={resume.id}
                  whileHover={{ y: -5 }}
                >
                  <Card className="resume-card p-8 flex gap-8 hover:shadow-xl transition-all duration-300 border border-slate-200 bg-white group overflow-visible relative">
                    <div className="w-40 h-56 bg-slate-50 rounded-2xl border border-slate-100 flex-shrink-0 overflow-hidden group-hover:border-indigo-100 transition-colors duration-300">
                      <div className="w-full h-full bg-white p-5 flex flex-col gap-2 opacity-60 group-hover:opacity-100 transition-opacity">
                        <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                        <div className="h-2 w-1/2 bg-slate-100 rounded-full" />
                        <div className="mt-6 h-1.5 w-full bg-slate-50 rounded-full" />
                        <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                        <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                        <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                        <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                        <div className="h-1.5 w-full bg-slate-50 rounded-full" />
                      </div>
                    </div>

                    <div className="flex-1 py-2 flex flex-col">
                      <div className="mb-6">
                        <div className="flex items-center gap-2 mb-2">
                           <span className="px-2 py-1 bg-indigo-50 text-indigo-600 text-[9px] font-black uppercase rounded-md">Master</span>
                           <span className="text-[10px] font-bold text-slate-400 italic">Updated 2d ago</span>
                        </div>
                        <h4 className="text-xl font-black text-slate-900 mb-1 leading-tight">{resume.title}</h4>
                        <p className="text-xs font-bold text-slate-400 italic line-clamp-2">{resume.subtitle}</p>
                      </div>
                      
                      <div className="space-y-3 mt-auto">
                        <button 
                          onClick={() => handleEditResume(resume)}
                          className="w-full flex items-center justify-center gap-2 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-lg shadow-slate-200 transform active:scale-95"
                        >
                          <Edit3 className="w-4 h-4" /> Edit Resume
                        </button>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            onClick={() => handleAnalyzeResume(resume)}
                            className="flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black hover:bg-indigo-700 transition-all transform active:scale-95 shadow-lg shadow-indigo-100"
                          >
                            <ShieldCheck className="w-4 h-4" /> Analyze
                          </button>
                          <button 
                            onClick={() => handleTailorResume(resume)}
                            className="flex items-center justify-center gap-2 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black hover:bg-indigo-600 hover:text-white transition-all transform active:scale-95 border border-indigo-100"
                          >
                            <Target className="w-4 h-4" /> Tailor
                          </button>
                        </div>
                        <div className="relative group/more mt-3">
                             <button className="w-full flex items-center justify-center gap-2 py-3 bg-slate-50 text-slate-600 rounded-xl text-[10px] font-black hover:bg-slate-200 transition-all">
                                More...
                             </button>
                             <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 hidden group-hover/more:block z-30">
                                <button 
                                  onClick={() => handleDuplicateResume(resume)}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-indigo-50 rounded-lg text-xs font-bold text-slate-600 transition-colors"
                                >
                                  <Copy className="w-4 h-4" /> Duplicate
                                </button>
                                <button 
                                  onClick={() => handleDeleteResume(resume.id)}
                                  className="w-full flex items-center gap-3 px-4 py-2 hover:bg-rose-50 rounded-lg text-xs font-bold text-rose-500 transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" /> Delete
                                </button>
                             </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeSidebar === 'My Jobs' && (
          <div className="max-w-6xl mx-auto">
            <div className="flex items-end justify-between mb-16">
              <div>
                <h2 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-4">Job Pipeline</h2>
                <p className="text-slate-500 font-bold text-lg">Your mission control for job applications.</p>
              </div>
              <button 
                onClick={handleAddJob}
                className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95"
              >
                <PlusCircle className="w-6 h-6" /> Track New Job
              </button>
            </div>

            <div className="grid gap-6">
              {jobs.map(job => (
                <motion.div
                  key={job.id}
                  whileHover={{ x: 10 }}
                  className="group"
                >
                  <Card className="p-8 flex items-center justify-between border border-slate-200 bg-white hover:bg-slate-50 transition-all duration-300 rounded-[28px] shadow-sm">
                    <div className="flex items-center gap-8">
                      <div className="w-16 h-16 bg-slate-100 rounded-3xl flex items-center justify-center text-indigo-600 font-black text-2xl group-hover:scale-110 transition-transform duration-300 border border-slate-200">
                        {job.company[0]}
                      </div>
                      <div>
                        <h3 className="text-2xl font-black text-slate-900 tracking-tight italic">{job.title}</h3>
                        <div className="flex items-center gap-5 mt-2">
                          <span className="text-sm font-black text-slate-400 uppercase tracking-widest">{job.company}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full" />
                          <span className="text-sm font-bold text-slate-500">{job.location}</span>
                          <span className="px-3 py-1 bg-emerald-50 text-emerald-600 text-[10px] font-black rounded-lg">{job.salary}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-10">
                      <div className="text-right">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-32 h-3 bg-slate-200 rounded-full overflow-hidden p-0.5">
                            <motion.div 
                              initial={{ width: 0 }}
                              animate={{ width: `${job.match}%` }}
                              transition={{ duration: 1.5, ease: "circOut" }}
                              className="h-full bg-indigo-600 rounded-full" 
                            />
                          </div>
                          <span className="text-sm font-black text-indigo-600">{job.match}%</span>
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Match Rating</p>
                      </div>
                      
                      <div className="flex gap-3">
                        <button className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all shadow-lg group-hover:-translate-y-1">
                          Optimize <ChevronRight className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteJob(job.id)}
                          className="p-3 bg-white text-slate-400 rounded-xl hover:text-rose-500 hover:bg-rose-50 transition-all border border-slate-100"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* ... Rest of the sections ... */}
        {activeSidebar === 'My Cover Letters' && (
          <div className="max-w-6xl mx-auto">
             <div className="flex items-end justify-between mb-16">
              <div>
                <h2 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-4">Letters</h2>
                <p className="text-slate-500 font-bold text-lg">Tailored cover letters that get read.</p>
              </div>
              <button className="flex items-center gap-3 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1">
                <PlusCircle className="w-6 h-6" /> New Letter
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {coverLetters.map(cl => (
                <motion.div
                  key={cl.id}
                  whileHover={{ y: -10 }}
                >
                  <Card className="p-8 border border-slate-200 bg-white hover:shadow-xl transition-all duration-300 rounded-[32px] group overflow-hidden">
                    <div className="aspect-[3/4] bg-slate-50 rounded-[24px] mb-8 p-6 border border-slate-100 flex flex-col gap-3 opacity-50 group-hover:opacity-100 transition-all overflow-hidden shadow-inner group-hover:scale-[1.02] duration-300">
                      <div className="h-2 w-full bg-slate-200 rounded-full" />
                      <div className="h-2 w-full bg-slate-200 rounded-full" />
                      <div className="h-2 w-3/4 bg-slate-200 rounded-full" />
                      <div className="mt-8 h-1.5 w-full bg-slate-100 rounded-full" />
                      <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                      <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                      <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                      <div className="h-1.5 w-full bg-slate-100 rounded-full" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-1 italic tracking-tight">{cl.title}</h3>
                    <p className="text-xs font-bold text-slate-400 mb-8 italic">Target: {cl.target}</p>
                    <div className="flex gap-3">
                      <button className="flex-1 py-3 bg-slate-900 text-white rounded-xl text-xs font-black hover:bg-slate-800 transition-all">
                        Edit
                      </button>
                      <button className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-all">
                        <Copy className="w-5 h-5" />
                      </button>
                      <button className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {activeSidebar === 'Account Settings' && (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-5xl font-black text-slate-900 uppercase italic tracking-tighter leading-none mb-16">Settings</h2>
            
            <div className="space-y-10">
              <Card className="p-10 border border-slate-200 bg-white rounded-[32px]">
                <h3 className="text-xl font-black text-slate-900 mb-8 italic tracking-tight">Profile Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Full Name</label>
                    <input 
                      type="text" 
                      value={profile.name}
                      onChange={(e) => setProfile({...profile, name: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold text-sm focus:ring-4 focus:ring-indigo-500/10 focus:bg-white transition-all outline-none"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Email Address</label>
                    <input 
                      type="email" 
                      value={profile.email}
                      disabled
                      className="w-full px-6 py-4 bg-slate-100 border-none rounded-2xl font-bold text-sm text-slate-400 cursor-not-allowed"
                    />
                  </div>
                </div>
                <button className="mt-10 px-8 py-4 bg-indigo-600 text-white rounded-2xl font-black text-sm transition-all hover:bg-indigo-700 active:scale-95 shadow-lg shadow-indigo-100">
                  Save Settings
                </button>
              </Card>

              <Card className="p-10 border-none bg-indigo-600 text-white rounded-[32px] shadow-lg shadow-indigo-100 relative overflow-hidden">
                <div className="relative z-10 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                       <Sparkles className="w-5 h-5 text-indigo-200" />
                       <h3 className="text-2xl font-black italic tracking-tight">Premium Membership</h3>
                    </div>
                    <p className="text-indigo-100 font-bold text-lg">Next renewal: Dec 25, 2026</p>
                  </div>
                  <button className="px-8 py-4 bg-white text-indigo-600 rounded-2xl font-black text-sm hover:bg-indigo-50 transition-all shadow-xl">
                    Manage Subscription
                  </button>
                </div>
              </Card>

              <Card className="p-10 border border-rose-100 bg-rose-50 rounded-[32px]">
                <h3 className="text-xl font-black text-rose-900 mb-2 italic">Danger Zone</h3>
                <p className="text-rose-500 font-bold mb-8">This action is irreversible. All your data will be permanently deleted.</p>
                <button className="px-8 py-4 bg-rose-500 text-white rounded-2xl font-black text-sm hover:bg-rose-600 transition-all active:scale-95">
                  Terminate Account
                </button>
              </Card>
            </div>
          </div>
        )}

        {activeSidebar === 'Usage & Billing' && (
          <div className="max-w-4xl mx-auto py-20 text-center">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-indigo-50"
             >
                <CreditCard className="w-12 h-12" />
             </motion.div>
             <h2 className="text-5xl font-black mb-6 uppercase italic tracking-tighter">{activeSidebar}</h2>
             <p className="text-slate-400 font-bold text-xl max-w-sm mx-auto mb-12">Portal currently in maintenance. Please check back later.</p>
             <button onClick={() => setActiveSidebar('My Resumes')} className="bg-slate-900 text-white px-10 py-4 rounded-2xl font-black shadow-lg transition-all hover:-translate-y-1 active:scale-95">
                Return Home
             </button>
          </div>
        )}

        {activeSidebar === 'Help' && (
          <div className="max-w-4xl mx-auto py-20 text-center">
             <motion.div 
               initial={{ scale: 0 }}
               animate={{ scale: 1 }}
               className="w-24 h-24 bg-indigo-50 text-indigo-600 rounded-[32px] flex items-center justify-center mx-auto mb-10 shadow-lg shadow-indigo-50"
             >
                <HelpCircle className="w-12 h-12" />
             </motion.div>
             <h2 className="text-5xl font-black mb-6 uppercase italic tracking-tighter">{activeSidebar}</h2>
             <p className="text-slate-400 font-bold text-xl max-w-sm mx-auto mb-12">Need assistance? Our AI support is online 24/7.</p>
             <button onClick={() => setActiveSidebar('My Resumes')} className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-black shadow-lg shadow-indigo-100 transition-all hover:-translate-y-1 active:scale-95">
                Contact Support
             </button>
          </div>
        )}
      </main>


      {/* Template Modal */}
      <TemplateModal 
        isOpen={isTemplateModalOpen} 
        onClose={() => setIsTemplateModalOpen(false)} 
        onSelect={(id) => {
          router.push(`/editor?template=${id}`);
        }} 
      />

      {/* Toast */}
      {toast && (
        <div className={cn(
          "fixed bottom-8 left-1/2 -translate-x-1/2 z-[100] px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border",
          toast.type === 'success' ? "bg-emerald-500 border-emerald-400 text-white" :
          toast.type === 'error' ? "bg-rose-500 border-rose-400 text-white" :
          "bg-indigo-600 border-indigo-500 text-white"
        )}>
          <span className="text-sm font-black tracking-tight">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
