import React, { useState } from 'react';
import { useJob } from '../context/JobContext';
import { refineResume, parseResume } from '../services/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Upload, 
  Loader2,
  Mail,
  Phone,
  MapPin,
  User
} from 'lucide-react';
import { toast } from 'sonner';

import { ResumePreview } from '../components/ResumePreview';

const ResumeBuilder = () => {
  const { resume, updateResume } = useJob();
  const [isRefining, setIsRefining] = useState(false);
  const [isParsing, setIsParsing] = useState(false);

  const handleAddExperience = () => {
    updateResume({
      experience: [
        ...resume.experience,
        { role: '', company: '', dates: '', responsibilities: '' }
      ]
    });
  };

  const handleRemoveExperience = (index: number) => {
    updateResume({
      experience: resume.experience.filter((_, i) => i !== index)
    });
  };

  const handleUpdateExperience = (index: number, field: string, value: string) => {
    const newExp = [...resume.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    updateResume({ experience: newExp });
  };

  const handleAddEducation = () => {
    updateResume({
      education: [
        ...resume.education,
        { degree: '', school: '', dates: '' }
      ]
    });
  };

  const handleRemoveEducation = (index: number) => {
    updateResume({
      education: resume.education.filter((_, i) => i !== index)
    });
  };

  const handleUpdateEducation = (index: number, field: string, value: string) => {
    const newEdu = [...resume.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    updateResume({ education: newEdu });
  };

  const handleRefine = async () => {
    setIsRefining(true);
    try {
      const refined = await refineResume(resume);
      updateResume(refined);
      toast.success('Resume refined by AI!');
    } catch (error) {
      toast.error('Failed to refine resume.');
    } finally {
      setIsRefining(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsParsing(true);
      const toastId = toast.loading('AI is parsing your resume...');
      try {
        const parsedData = await parseResume(file);
        updateResume(parsedData);
        toast.success('Resume parsed and imported successfully!', { id: toastId });
      } catch (error) {
        console.error("Parsing error:", error);
        toast.error('Failed to parse resume. Please try a different file format.', { id: toastId });
      } finally {
        setIsParsing(false);
        // Reset input
        e.target.value = '';
      }
    }
  };

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 h-full overflow-hidden">
      {/* Form Section */}
      <div className="space-y-6 overflow-y-auto pr-4 pb-12">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Resume Details</h3>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={() => document.getElementById('resume-upload')?.click()} disabled={isParsing}>
              {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {isParsing ? 'Parsing...' : 'Import'}
              <input 
                id="resume-upload" 
                type="file" 
                className="hidden" 
                accept=".pdf,.doc,.docx,.txt"
                onChange={handleFileUpload}
              />
            </Button>
            <Button size="sm" className="gap-2 bg-purple-600 hover:bg-purple-700" onClick={handleRefine} disabled={isRefining || isParsing}>
              {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              AI Refine
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input 
                  value={resume.name} 
                  onChange={e => updateResume({ name: e.target.value })}
                  placeholder="John Doe" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input 
                  value={resume.email} 
                  onChange={e => updateResume({ email: e.target.value })}
                  placeholder="john@example.com" 
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Phone</label>
                <Input 
                  value={resume.phone} 
                  onChange={e => updateResume({ phone: e.target.value })}
                  placeholder="+1 234 567 890" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Location</label>
                <Input 
                  value={resume.location} 
                  onChange={e => updateResume({ location: e.target.value })}
                  placeholder="New York, NY" 
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Professional Summary</label>
              <Textarea 
                value={resume.summary} 
                onChange={e => updateResume({ summary: e.target.value })}
                className="h-24"
                placeholder="Brief summary of your career and key strengths..." 
              />
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Experience</h4>
            <Button variant="ghost" size="sm" onClick={handleAddExperience} className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          {resume.experience.map((exp, index) => (
            <Card key={index}>
              <CardContent className="p-6 space-y-4 relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-600"
                  onClick={() => handleRemoveExperience(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <Input 
                      value={exp.role} 
                      onChange={e => handleUpdateExperience(index, 'role', e.target.value)}
                      placeholder="Senior Developer" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Company</label>
                    <Input 
                      value={exp.company} 
                      onChange={e => handleUpdateExperience(index, 'company', e.target.value)}
                      placeholder="Tech Corp" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dates</label>
                  <Input 
                    value={exp.dates} 
                    onChange={e => handleUpdateExperience(index, 'dates', e.target.value)}
                    placeholder="Jan 2020 - Present" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Responsibilities & Achievements</label>
                  <Textarea 
                    value={exp.responsibilities} 
                    onChange={e => handleUpdateExperience(index, 'responsibilities', e.target.value)}
                    className="h-24"
                    placeholder="Describe your role and impact..." 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Education</h4>
            <Button variant="ghost" size="sm" onClick={handleAddEducation} className="gap-1">
              <Plus className="w-4 h-4" /> Add
            </Button>
          </div>
          {resume.education.map((edu, index) => (
            <Card key={index}>
              <CardContent className="p-6 space-y-4 relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="absolute top-2 right-2 text-slate-400 hover:text-red-600"
                  onClick={() => handleRemoveEducation(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Degree</label>
                    <Input 
                      value={edu.degree} 
                      onChange={e => handleUpdateEducation(index, 'degree', e.target.value)}
                      placeholder="BS Computer Science" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">School</label>
                    <Input 
                      value={edu.school} 
                      onChange={e => handleUpdateEducation(index, 'school', e.target.value)}
                      placeholder="State University" 
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Dates</label>
                  <Input 
                    value={edu.dates} 
                    onChange={e => handleUpdateEducation(index, 'dates', e.target.value)}
                    placeholder="2016 - 2020" 
                  />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="space-y-4">
          <h4 className="font-medium">Skills</h4>
          <Card>
            <CardContent className="p-6">
              <Textarea 
                value={resume.skills.join(', ')} 
                onChange={e => updateResume({ skills: e.target.value.split(',').map(s => s.trim()).filter(s => s) })}
                placeholder="React, TypeScript, Node.js, AWS..." 
              />
              <p className="text-xs text-slate-500 mt-2">Separate skills with commas.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Section */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col sticky top-0 h-full">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wider">Live Preview</span>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => toast.info('Export to PDF coming soon!')}>
            <Download className="w-4 h-4" />
            Export PDF
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-12 font-serif text-slate-900 bg-white">
          <ResumePreview data={resume} />
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
