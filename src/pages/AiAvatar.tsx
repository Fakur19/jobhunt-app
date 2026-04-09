import React, { useState } from 'react';
import { useJob } from '../context/JobContext';
import { generateAvatar } from '../services/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Sparkles, 
  Loader2, 
  Download, 
  CheckCircle2,
  Image as ImageIcon,
  User
} from 'lucide-react';
import { toast } from 'sonner';

const AiAvatar = () => {
  const { updateResume } = useJob();
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [style, setStyle] = useState('navy blue suit, natural lighting, plain background');

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!originalImage) {
      toast.error('Please upload a photo first.');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAvatar(originalImage, style);
      setGeneratedImage(result);
      toast.success('Professional headshot generated!');
    } catch (error: any) {
      console.error("Avatar generation error:", error);
      const message = error.message || 'Failed to generate headshot.';
      toast.error(`${message} Please try again.`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAttach = () => {
    if (generatedImage) {
      updateResume({ headshotUrl: generatedImage });
      toast.success('Headshot attached to your resume!');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Upload className="w-5 h-5 text-blue-600" />
              Upload Source Photo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div 
              className="aspect-square rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden cursor-pointer hover:bg-slate-100 transition-colors"
              onClick={() => document.getElementById('avatar-upload')?.click()}
            >
              {originalImage ? (
                <img src={originalImage} alt="Original" className="w-full h-full object-cover" />
              ) : (
                <div className="text-center p-8">
                  <User className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p className="text-sm text-slate-500 font-medium">Click to upload a selfie or portrait</p>
                  <p className="text-xs text-slate-400 mt-1">JPG, PNG up to 5MB</p>
                </div>
              )}
              <input 
                id="avatar-upload" 
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={handleUpload}
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Desired Style</label>
              <Input 
                value={style}
                onChange={e => setStyle(e.target.value)}
                placeholder="e.g. professional suit, office background..." 
              />
            </div>

            <Button 
              className="w-full gap-2 bg-blue-600 hover:bg-blue-700" 
              onClick={handleGenerate}
              disabled={isGenerating || !originalImage}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating Headshot...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Professional Headshot
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <ImageIcon className="w-5 h-5 text-emerald-600" />
              Generated Result
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="aspect-square rounded-xl border border-slate-200 bg-slate-50 flex flex-col items-center justify-center overflow-hidden">
              {generatedImage ? (
                <img src={generatedImage} alt="Generated" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              ) : (
                <div className="text-center p-8 text-slate-400">
                  <ImageIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                  <p className="text-sm">Your AI headshot will appear here</p>
                </div>
              )}
            </div>

            {generatedImage && (
              <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" className="gap-2" onClick={() => window.open(generatedImage, '_blank')}>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700" onClick={handleAttach}>
                  <CheckCircle2 className="w-4 h-4" />
                  Attach to Resume
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-100">
        <CardContent className="p-6 flex gap-4 items-start">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Sparkles className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-semibold text-blue-900">How it works</h4>
            <p className="text-sm text-blue-700 mt-1 leading-relaxed">
              Our AI analyzes your uploaded photo and transforms it into a professional headshot. 
              It adjusts lighting, clothing, and background while maintaining your facial features. 
              For best results, use a clear, well-lit photo looking directly at the camera.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AiAvatar;
