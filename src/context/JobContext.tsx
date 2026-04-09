import React, { createContext, useContext, useState, useEffect } from 'react';
import { Application, Offer, ResumeData } from '../types';

interface JobContextType {
  applications: Application[];
  addApplication: (app: Omit<Application, 'id'>) => void;
  updateApplication: (id: string, app: Partial<Application>) => void;
  offers: Offer[];
  addOffer: (offer: Omit<Offer, 'id'>) => void;
  resume: ResumeData;
  updateResume: (data: Partial<ResumeData>) => void;
}

const JobContext = createContext<JobContextType | undefined>(undefined);

const INITIAL_RESUME: ResumeData = {
  name: '',
  email: '',
  phone: '',
  location: '',
  summary: '',
  experience: [],
  education: [],
  skills: [],
};

export const JobProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // In a real app, these would be fetched from a database (e.g., Firestore)
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem('jobhunt_applications');
    return saved ? JSON.parse(saved) : [];
  });

  const [offers, setOffers] = useState<Offer[]>(() => {
    const saved = localStorage.getItem('jobhunt_offers');
    return saved ? JSON.parse(saved) : [];
  });

  const [resume, setResume] = useState<ResumeData>(() => {
    const saved = localStorage.getItem('jobhunt_resume');
    return saved ? JSON.parse(saved) : INITIAL_RESUME;
  });

  useEffect(() => {
    localStorage.setItem('jobhunt_applications', JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem('jobhunt_offers', JSON.stringify(offers));
  }, [offers]);

  useEffect(() => {
    localStorage.setItem('jobhunt_resume', JSON.stringify(resume));
  }, [resume]);

  const addApplication = (app: Omit<Application, 'id'>) => {
    const newApp = { ...app, id: crypto.randomUUID() };
    setApplications(prev => [newApp, ...prev]);
  };

  const updateApplication = (id: string, app: Partial<Application>) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, ...app } : a));
  };

  const addOffer = (offer: Omit<Offer, 'id'>) => {
    const newOffer = { ...offer, id: crypto.randomUUID() };
    setOffers(prev => [newOffer, ...prev]);
  };

  const updateResume = (data: Partial<ResumeData>) => {
    setResume(prev => ({ ...prev, ...data }));
  };

  return (
    <JobContext.Provider value={{
      applications,
      addApplication,
      updateApplication,
      offers,
      addOffer,
      resume,
      updateResume,
    }}>
      {children}
    </JobContext.Provider>
  );
};

export const useJob = () => {
  const context = useContext(JobContext);
  if (!context) throw new Error('useJob must be used within a JobProvider');
  return context;
};
