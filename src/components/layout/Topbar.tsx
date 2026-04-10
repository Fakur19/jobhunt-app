import React from 'react';
import { useLocation } from 'react-router-dom';
import { useJob } from '../../context/JobContext';
import { loginWithGoogle, logout } from '../../firebase';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User, Menu } from 'lucide-react';
import { toast } from 'sonner';

const pageInfo: Record<string, { title: string; description: string }> = {
  '/': { title: 'Dashboard', description: 'Overview of your job search progress' },
  '/applications': { title: 'My Applications', description: 'Track your job applications and generate cover letters' },
  '/offers': { title: 'Offers Received', description: 'Manage your job offers and interview preparation' },
  '/resume': { title: 'Resume Builder', description: 'Create and refine your professional resume with AI' },
  '/avatar': { title: 'AI Avatar', description: 'Generate professional headshots for your resume' },
  '/assistant': { title: 'AI Assistant', description: 'Your personal job search companion' },
};

interface TopbarProps {
  onMenuClick?: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuClick }) => {
  const location = useLocation();
  const { user, isAuthReady } = useJob();
  const info = pageInfo[location.pathname] || { title: 'JobHunt OS', description: '' };

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error(`Login failed: ${error.message || 'Unknown error'}. Please ensure popups are allowed and third-party cookies are enabled.`);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center px-4 lg:px-8 justify-between sticky top-0 z-10">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="lg:hidden" onClick={onMenuClick}>
          <Menu className="w-5 h-5" />
        </Button>
        <div className="hidden sm:block">
          <h2 className="text-xl font-semibold text-slate-900">{info.title}</h2>
          <p className="text-sm text-slate-500 line-clamp-1">{info.description}</p>
        </div>
        <div className="sm:hidden font-bold text-slate-900">
          {info.title}
        </div>
      </div>
      
      <div className="flex items-center gap-2 sm:gap-4">
        {!isAuthReady ? (
          <div className="w-8 h-8 rounded-full bg-slate-100 animate-pulse" />
        ) : user ? (
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {user.photoURL ? (
                <img src={user.photoURL} alt={user.displayName || ''} className="w-8 h-8 rounded-full border border-slate-200" />
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
              )}
              <span className="text-sm font-medium text-slate-700 hidden sm:inline-block">
                {user.displayName}
              </span>
            </div>
            <Button variant="ghost" size="sm" onClick={logout} className="gap-2 text-slate-500 hover:text-red-600">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        ) : (
          <Button onClick={handleLogin} className="gap-2 bg-blue-600 hover:bg-blue-700">
            <LogIn className="w-4 h-4" />
            Login with Google
          </Button>
        )}
      </div>
    </header>
  );
};
