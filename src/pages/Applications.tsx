import React, { useState } from 'react';
import { useJob } from '../context/JobContext';
import { generateCoverLetter, generateTailoredResume } from '../services/ai';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileText, Plus, Loader2, Edit2, Sparkles, FileUser } from 'lucide-react';
import { toast } from 'sonner';
import { ApplicationStatus, Application } from '../types';
import { ResumePreview } from '../components/ResumePreview';

const Applications = () => {
  const { applications, addApplication, updateApplication, resume } = useJob();
  const [isAdding, setIsAdding] = useState(false);
  const [editingApp, setEditingApp] = useState<Application | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isTailoring, setIsTailoring] = useState(false);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [viewingResume, setViewingResume] = useState<Application | null>(null);
  const [activeTab, setActiveTab] = useState<'active' | 'inactive'>('active');

  const activeStatuses: ApplicationStatus[] = ['Applied', 'Interviewing', 'Offer'];
  const filteredApps = applications.filter(app => 
    activeTab === 'active' 
      ? activeStatuses.includes(app.status)
      : !activeStatuses.includes(app.status)
  );

  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    location: '',
    date: new Date().toISOString().split('T')[0],
    status: 'Applied' as ApplicationStatus,
    jobDescription: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!resume.name || resume.experience.length === 0) {
      toast.error('Please complete your base resume in the Resume Builder first.');
      return;
    }

    setIsGenerating(true);
    
    try {
      const [coverLetter, tailoredResume] = await Promise.all([
        generateCoverLetter(resume, formData.jobTitle, formData.company, formData.jobDescription),
        generateTailoredResume(resume, formData.jobDescription)
      ]);

      addApplication({ ...formData, coverLetter, tailoredResume });
      toast.success('Application saved with AI-tailored resume and cover letter!');
      setIsAdding(false);
      setFormData({
        jobTitle: '',
        company: '',
        location: '',
        date: new Date().toISOString().split('T')[0],
        status: 'Applied',
        jobDescription: '',
      });
    } catch (error) {
      console.error("AI Generation Error:", error);
      toast.error('Failed to generate AI assets, but application was saved.');
      await addApplication(formData);
      setIsAdding(false);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editingApp) {
      await updateApplication(editingApp.id, editingApp);
      toast.success('Application updated!');
      setEditingApp(null);
    }
  };

  const handleTailorResume = async (app: Application) => {
    if (!resume.name || resume.experience.length === 0) {
      toast.error('Please fill in your base resume first (Name and at least one Experience).');
      return;
    }
    setIsTailoring(true);
    try {
      const tailored = await generateTailoredResume(resume, app.jobDescription);
      await updateApplication(app.id, { tailoredResume: tailored });
      toast.success('Resume tailored for this job!');
    } catch (error) {
      console.error("Tailoring error:", error);
      toast.error('Failed to tailor resume.');
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex bg-slate-100 p-1 rounded-lg w-full sm:w-auto">
          <button 
            onClick={() => setActiveTab('active')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'active' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Active ({applications.filter(a => activeStatuses.includes(a.status)).length})
          </button>
          <button 
            onClick={() => setActiveTab('inactive')}
            className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
              activeTab === 'inactive' 
                ? 'bg-white text-blue-600 shadow-sm' 
                : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            Archive ({applications.filter(a => !activeStatuses.includes(a.status)).length})
          </button>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger
            render={
              <Button className="gap-2 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Add Application
              </Button>
            }
          />
          <DialogContent className="max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Job Application</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Title</label>
                  <Input 
                    required 
                    value={formData.jobTitle}
                    onChange={e => setFormData(prev => ({ ...prev, jobTitle: e.target.value }))}
                    placeholder="Software Engineer" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Input 
                    required 
                    value={formData.company}
                    onChange={e => setFormData(prev => ({ ...prev, company: e.target.value }))}
                    placeholder="Google" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Location</label>
                  <Input 
                    required 
                    value={formData.location}
                    onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))}
                    placeholder="Mountain View, CA" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Date Applied</label>
                  <Input 
                    type="date" 
                    required 
                    value={formData.date}
                    onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={formData.status} 
                  onValueChange={(v: ApplicationStatus) => setFormData(prev => ({ ...prev, status: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Hired">Hired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Job Description</label>
                <Textarea 
                  required 
                  className="h-32"
                  value={formData.jobDescription}
                  onChange={e => setFormData(prev => ({ ...prev, jobDescription: e.target.value }))}
                  placeholder="Paste the full job description here..." 
                />
              </div>
              <Button type="submit" className="w-full h-12" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating AI Assets...
                  </>
                ) : (
                  'Save & Tailor with AI'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredApps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell className="font-medium pl-6">{app.jobTitle}</TableCell>
                    <TableCell>{app.company}</TableCell>
                    <TableCell>{app.date}</TableCell>
                    <TableCell>
                      <div className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        app.status === 'Hired' ? 'bg-emerald-100 text-emerald-700' :
                        app.status === 'Offer' ? 'bg-blue-100 text-blue-700' :
                        app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                        app.status === 'Interviewing' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {app.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-1">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setEditingApp(app)}
                          title="Edit Application"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => setSelectedApp(app)}
                          title="View Cover Letter"
                        >
                          <FileText className="w-4 h-4" />
                        </Button>
                        {app.tailoredResume ? (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setViewingResume(app)}
                            title="View Tailored Resume"
                            className="text-purple-600"
                          >
                            <FileUser className="w-4 h-4" />
                          </Button>
                        ) : (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleTailorResume(app)}
                            disabled={isTailoring}
                            title="Tailor Resume with AI"
                          >
                            {isTailoring ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-slate-100">
            {filteredApps.map((app) => (
              <div key={app.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{app.jobTitle}</h3>
                    <p className="text-sm text-slate-500">{app.company}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    app.status === 'Hired' ? 'bg-emerald-100 text-emerald-700' :
                    app.status === 'Offer' ? 'bg-blue-100 text-blue-700' :
                    app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                    app.status === 'Interviewing' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {app.status}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Applied on {app.date}</span>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setEditingApp(app)}>
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setSelectedApp(app)}>
                      <FileText className="w-3.5 h-3.5" />
                    </Button>
                    {app.tailoredResume ? (
                      <Button variant="outline" size="icon" className="h-8 w-8 text-purple-600" onClick={() => setViewingResume(app)}>
                        <FileUser className="w-3.5 h-3.5" />
                      </Button>
                    ) : (
                      <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleTailorResume(app)} disabled={isTailoring}>
                        {isTailoring ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredApps.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm">
              {activeTab === 'active' 
                ? "No active applications. Add your first one to get started!" 
                : "No archived applications."}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingApp} onOpenChange={() => setEditingApp(null)}>
        <DialogContent className="max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          {editingApp && (
            <form onSubmit={handleUpdate} className="space-y-4 mt-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Job Title</label>
                  <Input 
                    required 
                    value={editingApp.jobTitle}
                    onChange={e => setEditingApp(prev => prev ? ({ ...prev, jobTitle: e.target.value }) : null)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Company</label>
                  <Input 
                    required 
                    value={editingApp.company}
                    onChange={e => setEditingApp(prev => prev ? ({ ...prev, company: e.target.value }) : null)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select 
                  value={editingApp.status} 
                  onValueChange={(v: ApplicationStatus) => setEditingApp(prev => prev ? ({ ...prev, status: v }) : null)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Applied">Applied</SelectItem>
                    <SelectItem value="Interviewing">Interviewing</SelectItem>
                    <SelectItem value="Rejected">Rejected</SelectItem>
                    <SelectItem value="Offer">Offer</SelectItem>
                    <SelectItem value="Hired">Hired</SelectItem>
                    <SelectItem value="Withdrawn">Withdrawn</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full h-12">Update Application</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Cover Letter Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[95vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cover Letter for {selectedApp?.jobTitle} at {selectedApp?.company}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-4 sm:p-6 bg-slate-50 rounded-lg whitespace-pre-wrap font-serif text-slate-800 leading-relaxed text-sm sm:text-base">
            {selectedApp?.coverLetter || "No cover letter generated for this application."}
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(selectedApp?.coverLetter || "");
              toast.success('Copied to clipboard!');
            }} className="w-full sm:w-auto">
              Copy to Clipboard
            </Button>
            <Button onClick={() => setSelectedApp(null)} className="w-full sm:w-auto">Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tailored Resume Dialog */}
      <Dialog open={!!viewingResume} onOpenChange={() => setViewingResume(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-4 sm:p-6 bg-white border-b shrink-0">
            <DialogTitle className="text-base sm:text-lg truncate pr-8">Tailored Resume for {viewingResume?.jobTitle}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-slate-100">
            {viewingResume?.tailoredResume && (
              <ResumePreview data={viewingResume.tailoredResume} paper />
            )}
          </div>
          <div className="flex justify-end gap-2 p-4 sm:p-6 bg-white border-t shrink-0">
            <Button variant="outline" onClick={() => toast.info('Export to PDF coming soon!')} className="flex-1 sm:flex-none">
              Download PDF
            </Button>
            <Button onClick={() => setViewingResume(null)} className="flex-1 sm:flex-none">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
