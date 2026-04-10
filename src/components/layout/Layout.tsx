import React, { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { useJob } from '../../context/JobContext';
import { Button } from '@/components/ui/button';
import { loginWithGoogle } from '../../firebase';
import { LogIn, Sparkles, Briefcase, FileText, Target, Menu } from 'lucide-react';

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, isAuthReady } = useJob();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (!isAuthReady) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center animate-pulse">
            <Briefcase className="w-6 h-6 text-white" />
          </div>
          <p className="text-slate-500 font-medium">Initializing JobHunt OS...</p>
        </div>
      </div>
    );
  }

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Login error:", error);
      // No toast here as sonner might not be mounted yet or visible in this view
      alert(`Login failed: ${error.message || 'Unknown error'}. Please ensure popups are allowed and third-party cookies are enabled.`);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen w-full flex flex-col lg:flex-row bg-white overflow-x-hidden">
        {/* Left Side: Hero */}
        <div className="flex-1 flex flex-col justify-center px-6 sm:px-12 lg:px-24 bg-slate-50 relative py-24 lg:py-0">
          <div className="absolute top-8 left-6 sm:top-12 sm:left-12 lg:left-24">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center">
                <Briefcase className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">JobHunt OS</span>
            </div>
          </div>
          <div className="max-w-xl mx-auto lg:mx-0">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wider mb-6">
              <Sparkles className="w-3 h-3" />
              AI-Powered Job Search
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-slate-900 leading-tight mb-6">
              Your entire job search, <span className="text-blue-600">organized.</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 mb-8 leading-relaxed">
              Track applications, generate tailored resumes, and prepare for interviews with your personal AI job search companion.
            </p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-12">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                  <FileText className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Tailored Resumes</h4>
                  <p className="text-sm text-slate-500">AI-generated for every job</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-100">
                  <Target className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Smart Tracking</h4>
                  <p className="text-sm text-slate-500">Never miss an interview</p>
                </div>
              </div>
            </div>

            <Button onClick={handleLogin} size="lg" className="w-full sm:w-auto h-14 px-8 text-lg gap-3 bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-200">
              <LogIn className="w-5 h-5" />
              Get Started with Google
            </Button>
          </div>
        </div>

        {/* Right Side: Visual */}
        <div className="hidden lg:flex flex-1 bg-blue-600 items-center justify-center p-12">
          <div className="relative w-full max-w-lg aspect-square bg-blue-500/20 rounded-full flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full animate-pulse" />
             <Briefcase className="w-48 h-48 text-white/20" />
             
             {/* Floating UI Elements */}
             <div className="absolute top-1/4 -left-12 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce" style={{ animationDuration: '3s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Resume Tailored!</p>
                    <p className="text-[10px] text-slate-500">98% Match Score</p>
                  </div>
                </div>
             </div>

             <div className="absolute bottom-1/4 -right-8 bg-white p-4 rounded-xl shadow-xl border border-slate-100 animate-bounce" style={{ animationDuration: '4s' }}>
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">New Interview</p>
                    <p className="text-[10px] text-slate-500">Tomorrow at 10:00 AM</p>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden relative">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block h-full">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-50 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div 
            className="w-64 h-full bg-white animate-in slide-in-from-left duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar onClose={() => setIsMobileMenuOpen(false)} />
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <Topbar onMenuClick={() => setIsMobileMenuOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-8">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
