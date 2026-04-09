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
      </aside>
      );
      };
