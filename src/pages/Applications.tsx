import React, { useState } from 'react';
import { useJob } from '../context/JobContext';
import { generateCoverLetter, generateTailoredResume } from '../services/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import { FileText, Plus, Loader2, Eye, Edit2, Sparkles, FileUser } from 'lucide-react';
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
      // Generate both assets in parallel for efficiency
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
      toast.error('Failed to tailor resume. Please check your internet connection and try again.');
    } finally {
      setIsTailoring(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-6">
          <h3 className="text-lg font-semibold text-slate-900">Applications</h3>
          <div className="flex bg-slate-100 p-1 rounded-lg">
            <button 
              onClick={() => setActiveTab('active')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'active' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Active ({applications.filter(a => activeStatuses.includes(a.status)).length})
            </button>
            <button 
              onClick={() => setActiveTab('inactive')}
              className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${
                activeTab === 'inactive' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Archive ({applications.filter(a => !activeStatuses.includes(a.status)).length})
            </button>
          </div>
        </div>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger
            render={
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                Add Application
              </Button>
            }
          />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Job Application</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-2 gap-4">
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
              <Button type="submit" className="w-full" disabled={isGenerating}>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Job Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApps.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.jobTitle}</TableCell>
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
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
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
              {filteredApps.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    {activeTab === 'active' 
                      ? "No active applications. Add your first one to get started!" 
                      : "No archived applications."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={!!editingApp} onOpenChange={() => setEditingApp(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Application</DialogTitle>
          </DialogHeader>
          {editingApp && (
            <form onSubmit={handleUpdate} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
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
              <Button type="submit" className="w-full">Update Application</Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Cover Letter Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={() => setSelectedApp(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Cover Letter for {selectedApp?.jobTitle} at {selectedApp?.company}</DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-6 bg-slate-50 rounded-lg whitespace-pre-wrap font-serif text-slate-800 leading-relaxed">
            {selectedApp?.coverLetter || "No cover letter generated for this application."}
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(selectedApp?.coverLetter || "");
              toast.success('Copied to clipboard!');
            }}>
              Copy to Clipboard
            </Button>
            <Button onClick={() => setSelectedApp(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tailored Resume Dialog */}
      <Dialog open={!!viewingResume} onOpenChange={() => setViewingResume(null)}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-hidden flex flex-col p-0">
          <DialogHeader className="p-6 bg-white border-b shrink-0">
            <DialogTitle>Tailored Resume for {viewingResume?.jobTitle} at {viewingResume?.company}</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-slate-100">
            {viewingResume?.tailoredResume && (
              <ResumePreview data={viewingResume.tailoredResume} paper />
            )}
          </div>
          <div className="flex justify-end gap-2 p-6 bg-white border-t shrink-0">
            <Button variant="outline" onClick={() => toast.info('Export to PDF coming soon!')}>
              Download PDF
            </Button>
            <Button onClick={() => setViewingResume(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Applications;
