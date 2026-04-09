import React, { useState } from 'react';
import { useJob } from '../context/JobContext';
import { generateCoverLetter } from '../services/ai';
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
import { FileText, Plus, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import { ApplicationStatus } from '../types';

const Applications = () => {
  const { applications, addApplication, resume } = useJob();
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedApp, setSelectedApp] = useState<any>(null);

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
    setIsGenerating(true);
    
    try {
      const coverLetter = await generateCoverLetter(resume, formData.jobDescription);
      addApplication({ ...formData, coverLetter });
      toast.success('Application added and cover letter generated!');
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
      toast.error('Failed to generate cover letter, but application was saved.');
      addApplication(formData);
      setIsAdding(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">All Applications</h3>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Application
            </Button>
          </DialogTrigger>
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
                    Generating Cover Letter...
                  </>
                ) : (
                  'Save Application'
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
              {applications.map((app) => (
                <TableRow key={app.id}>
                  <TableCell className="font-medium">{app.jobTitle}</TableCell>
                  <TableCell>{app.company}</TableCell>
                  <TableCell>{app.date}</TableCell>
                  <TableCell>
                    <div className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      app.status === 'Offer' ? 'bg-emerald-100 text-emerald-700' :
                      app.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      app.status === 'Interviewing' ? 'bg-blue-100 text-blue-700' :
                      'bg-slate-100 text-slate-700'
                    }`}>
                      {app.status}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setSelectedApp(app)}
                    >
                      <Eye className="w-4 h-4" />
                      View Letter
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {applications.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-12 text-slate-500">
                    No applications found. Add your first one to get started!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

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
    </div>
  );
};

export default Applications;
