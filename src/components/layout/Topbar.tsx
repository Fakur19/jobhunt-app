import React from 'react';
import { useLocation } from 'react-router-dom';

const pageInfo: Record<string, { title: string; description: string }> = {
  '/': { title: 'Dashboard', description: 'Overview of your job search progress' },
  '/applications': { title: 'My Applications', description: 'Track your job applications and generate cover letters' },
  '/offers': { title: 'Offers Received', description: 'Manage your job offers and interview preparation' },
  '/resume': { title: 'Resume Builder', description: 'Create and refine your professional resume with AI' },
  '/avatar': { title: 'AI Avatar', description: 'Generate professional headshots for your resume' },
  '/assistant': { title: 'AI Assistant', description: 'Your personal job search companion' },
};

export const Topbar = () => {
  const location = useLocation();
  const info = pageInfo[location.pathname] || { title: 'JobHunt OS', description: '' };

  return (
    <header className="h-16 bg-white border-bottom border-slate-200 flex items-center px-8 justify-between sticky top-0 z-10">
      <div>
        <h2 className="text-xl font-semibold text-slate-900">{info.title}</h2>
        <p className="text-sm text-slate-500">{info.description}</p>
      </div>
      
      <div className="flex items-center gap-4">
        {/* Placeholder for notifications or search */}
      </div>
    </header>
  );
};
