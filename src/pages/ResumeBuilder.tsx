import React, { useState, useRef } from 'react';
import { useJob } from '../context/JobContext';
import { refineResume, parseResume } from '../services/ai';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { 
  Plus, 
  Trash2, 
  Sparkles, 
  Download, 
  Upload, 
  Loader2,
  Eye,
  Camera,
  X,
  Move,
  Maximize2
} from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';

import { ResumePreview } from '../components/ResumePreview';

const ResumeBuilder = () => {
  const { resume, updateResume } = useJob();
  const [isRefining, setIsRefining] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const desktopPreviewRef = useRef<HTMLDivElement>(null);
  const mobilePreviewRef = useRef<HTMLDivElement>(null);

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
        toast.success('Resume parsed successfully!', { id: toastId });
      } catch (error) {
        console.error("Parsing error:", error);
        toast.error('Failed to parse resume.', { id: toastId });
      } finally {
        setIsParsing(false);
        e.target.value = '';
      }
    }
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target?.result as string;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_WIDTH = 600;
          const MAX_HEIGHT = 600;
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
          resolve(dataUrl);
        };
        img.onerror = reject;
      };
      reader.onerror = reject;
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const toastId = toast.loading('Optimizing photo...');
      try {
        const compressedBase64 = await compressImage(file);
        await updateResume({ 
          headshotUrl: compressedBase64,
          headshotSettings: { scale: 1, x: 0, y: 0 }
        });
        toast.success('Photo updated!', { id: toastId });
      } catch (error) {
        console.error('Photo optimization error:', error);
        toast.error('Failed to process photo.', { id: toastId });
      }
    }
  };

  const handleUpdatePhotoSetting = (field: 'scale' | 'x' | 'y', value: number) => {
    updateResume({
      headshotSettings: {
        ...(resume.headshotSettings || { scale: 1, x: 0, y: 0 }),
        [field]: value
      }
    });
  };

  const handleExportPDF = async (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return;
    
    setIsExporting(true);
    const toastId = toast.loading('Generating PDF...');
    
    try {
      const originalElement = ref.current;
      
      // Use toPng from html-to-image as it handles modern CSS (like oklch) much better than html2canvas
      const dataUrl = await toPng(originalElement, { 
        backgroundColor: '#ffffff',
        pixelRatio: 2,
        // Ensure fonts and styles are fully loaded
        skipAutoScale: true,
        cacheBust: true,
      });
      
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'pt',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      // Calculate image dimensions to fit on A4 while maintaining aspect ratio
      const img = new Image();
      img.src = dataUrl;
      await new Promise(resolve => img.onload = resolve);
      
      const imgWidth = img.width;
      const imgHeight = img.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      
      const finalWidth = imgWidth * ratio;
      const finalHeight = imgHeight * ratio;
      const imgX = (pdfWidth - finalWidth) / 2;
      const imgY = Math.max(0, (pdfHeight - finalHeight) / 2);
      
      pdf.addImage(dataUrl, 'PNG', imgX, imgY, finalWidth, finalHeight);
      pdf.save(`${resume.name || 'resume'}.pdf`);
      toast.success('PDF downloaded!', { id: toastId });
    } catch (error) {
      console.error('PDF generation error:', error);
      toast.error('Failed to generate PDF.', { id: toastId });
    } finally {
      setIsExporting(false);
    }
  };

  const ResumeForm = (
    <div className="space-y-6 pb-24 lg:pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold">Resume Details</h3>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" size="sm" className="flex-1 sm:flex-none gap-2" onClick={() => document.getElementById('resume-upload')?.click()} disabled={isParsing}>
            {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
            <span className="hidden sm:inline">{isParsing ? 'Parsing...' : 'Import'}</span>
            <span className="sm:hidden">Import</span>
            <input 
              id="resume-upload" 
              type="file" 
              className="hidden" 
              accept=".pdf,.doc,.docx,.txt"
              onChange={handleFileUpload}
            />
          </Button>
          <Button size="sm" className="flex-1 sm:flex-none gap-2 bg-purple-600 hover:bg-purple-700" onClick={handleRefine} disabled={isRefining || isParsing}>
            {isRefining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            Refine
          </Button>
          <Button variant="outline" size="sm" className="lg:hidden flex-1 gap-2" onClick={() => setIsPreviewOpen(true)}>
            <Eye className="w-4 h-4" />
            Preview
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-4 sm:p-6 space-y-4">
          <div className="flex flex-col sm:flex-row gap-6 items-start">
            <div className="shrink-0 mx-auto sm:mx-0">
              <div className="relative group">
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl bg-slate-100 border-2 border-dashed border-slate-200 overflow-hidden flex items-center justify-center relative">
                  {resume.headshotUrl ? (
                    <div className="w-full h-full relative">
                      <img 
                        src={resume.headshotUrl} 
                        alt="Headshot" 
                        className="absolute w-full h-full object-contain origin-center" 
                        style={{
                          transform: `scale(${resume.headshotSettings?.scale || 1}) translate(${resume.headshotSettings?.x || 0}%, ${resume.headshotSettings?.y || 0}%)`
                        }}
                      />
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          updateResume({ headshotUrl: '', headshotSettings: { scale: 1, x: 0, y: 0 } });
                        }}
                        className="absolute top-1 right-1 p-1 bg-white/80 rounded-full text-red-500 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm z-10"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-400">
                      <Camera className="w-6 h-6" />
                      <span className="text-[10px] font-medium">Add Photo</span>
                    </div>
                  )}
                  <input 
                    type="file" 
                    className="absolute inset-0 opacity-0 cursor-pointer" 
                    accept="image/*"
                    onChange={handlePhotoUpload}
                  />
                </div>
              </div>

              {resume.headshotUrl && (
                <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-3 w-full sm:w-32">
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Maximize2 className="w-3 h-3" /> Zoom
                    </label>
                    <input 
                      type="range" 
                      min="0.1" max="3" step="0.1"
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={resume.headshotSettings?.scale || 1}
                      onChange={(e) => handleUpdatePhotoSetting('scale', parseFloat(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Move className="w-3 h-3" /> Position X
                    </label>
                    <input 
                      type="range" 
                      min="-100" max="100" step="1"
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={resume.headshotSettings?.x || 0}
                      onChange={(e) => handleUpdatePhotoSetting('x', parseInt(e.target.value))}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                      <Move className="w-3 h-3" /> Position Y
                    </label>
                    <input 
                      type="range" 
                      min="-100" max="100" step="1"
                      className="w-full h-1 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                      value={resume.headshotSettings?.y || 0}
                      onChange={(e) => handleUpdatePhotoSetting('y', parseInt(e.target.value))}
                    />
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex-1 w-full space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Full Name</label>
                  <Input 
                    value={resume.name} 
                    onChange={e => updateResume({ name: e.target.value })}
                    placeholder="John Doe" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Email</label>
                  <Input 
                    value={resume.email} 
                    onChange={e => updateResume({ email: e.target.value })}
                    placeholder="john@example.com" 
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Phone</label>
                  <Input 
                    value={resume.phone} 
                    onChange={e => updateResume({ phone: e.target.value })}
                    placeholder="+1 234 567 890" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Location</label>
                  <Input 
                    value={resume.location} 
                    onChange={e => updateResume({ location: e.target.value })}
                    placeholder="New York, NY" 
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-700">Professional Summary</label>
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
          <h4 className="font-medium text-slate-900">Experience</h4>
          <Button variant="ghost" size="sm" onClick={handleAddExperience} className="gap-1 text-blue-600">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
        {resume.experience.map((exp, index) => (
          <Card key={index} className="relative group">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-slate-300 hover:text-red-600 transition-colors"
                onClick={() => handleRemoveExperience(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 sm:pt-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Role</label>
                  <Input 
                    value={exp.role} 
                    onChange={e => handleUpdateExperience(index, 'role', e.target.value)}
                    placeholder="Senior Developer" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Company</label>
                  <Input 
                    value={exp.company} 
                    onChange={e => handleUpdateExperience(index, 'company', e.target.value)}
                    placeholder="Tech Corp" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Dates</label>
                <Input 
                  value={exp.dates} 
                  onChange={e => handleUpdateExperience(index, 'dates', e.target.value)}
                  placeholder="Jan 2020 - Present" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Responsibilities</label>
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
          <h4 className="font-medium text-slate-900">Education</h4>
          <Button variant="ghost" size="sm" onClick={handleAddEducation} className="gap-1 text-blue-600">
            <Plus className="w-4 h-4" /> Add
          </Button>
        </div>
        {resume.education.map((edu, index) => (
          <Card key={index} className="relative">
            <CardContent className="p-4 sm:p-6 space-y-4">
              <Button 
                variant="ghost" 
                size="icon" 
                className="absolute top-2 right-2 text-slate-300 hover:text-red-600"
                onClick={() => handleRemoveEducation(index)}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 sm:pt-0">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Degree</label>
                  <Input 
                    value={edu.degree} 
                    onChange={e => handleUpdateEducation(index, 'degree', e.target.value)}
                    placeholder="BS Computer Science" 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">School</label>
                  <Input 
                    value={edu.school} 
                    onChange={e => handleUpdateEducation(index, 'school', e.target.value)}
                    placeholder="State University" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Dates</label>
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
        <h4 className="font-medium text-slate-900">Skills</h4>
        <Card>
          <CardContent className="p-4 sm:p-6">
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
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {/* Form Section */}
      <div className="lg:overflow-y-auto lg:pr-4">
        {ResumeForm}
      </div>

      {/* Preview Section (Desktop) */}
      <div className="hidden lg:flex flex-col bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden sticky top-0 h-[calc(100vh-12rem)]">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Live Preview</span>
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2" 
            onClick={() => handleExportPDF(desktopPreviewRef)}
            disabled={isExporting}
          >
            {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            Export PDF
          </Button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-8 bg-white">
          <div ref={desktopPreviewRef}>
            <ResumePreview data={resume} />
          </div>
        </div>
      </div>

      {/* Mobile Preview Dialog */}
      <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <DialogContent className="max-w-[95vw] w-full max-h-[95vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-4 border-b shrink-0">
            <DialogTitle>Resume Preview</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto bg-slate-100">
            <div ref={mobilePreviewRef}>
              <ResumePreview data={resume} paper />
            </div>
          </div>
          <div className="p-4 border-t bg-white flex gap-2">
            <Button 
              variant="outline" 
              className="flex-1 gap-2" 
              onClick={() => handleExportPDF(mobilePreviewRef)}
              disabled={isExporting}
            >
              {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              Download PDF
            </Button>
            <Button className="flex-1" onClick={() => setIsPreviewOpen(false)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ResumeBuilder;
