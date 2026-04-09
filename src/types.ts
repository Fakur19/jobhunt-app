export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Rejected' | 'Offer' | 'Withdrawn';

export interface Application {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  date: string;
  status: ApplicationStatus;
  jobDescription: string;
  coverLetter?: string;
}

export interface Offer {
  id: string;
  jobTitle: string;
  company: string;
  type: 'Invite' | 'Offer';
  stage: string;
  date: string;
  notes: string;
  cheatSheet?: string;
}

export interface ResumeData {
  name: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: {
    role: string;
    company: string;
    dates: string;
    responsibilities: string;
  }[];
  education: {
    degree: string;
    school: string;
    dates: string;
  }[];
  skills: string[];
  headshotUrl?: string;
}
