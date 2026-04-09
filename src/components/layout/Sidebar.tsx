import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Briefcase, 
  FileText, 
  UserCircle, 
  MessageSquare, 
  Trophy,
  LogOut
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
  { icon: Briefcase, label: 'My Applications', path: '/applications' },
  { icon: Trophy, label: 'Offers Received', path: '/offers' },
  { icon: FileText, label: 'Resume Builder', path: '/resume' },
  { icon: UserCircle, label: 'AI Avatar', path: '/avatar' },
  { icon: MessageSquare, label: 'AI Assistant', path: '/assistant' },
];

export const Sidebar = () => {
  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <Briefcase className="w-8 h-8 text-blue-600" />
          JobHunt OS
        </h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => cn(
              "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
              isActive 
                ? "bg-blue-50 text-blue-700" 
                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
            )}
          >
            <item.icon className="w-5 h-5" />
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200">
        <div className="flex items-center gap-3 px-4 py-3 text-slate-500 text-sm">
          <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
            <UserCircle className="w-5 h-5" />
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="font-medium text-slate-900 truncate">Demo User</p>
            <p className="text-xs truncate">demo@example.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
};
