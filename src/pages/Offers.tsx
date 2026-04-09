import React, { useState } from 'react';
import { useJob } from '../context/JobContext';
import { generateInterviewCheatSheet } from '../services/ai';
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
import { Trophy, Plus, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const Offers = () => {
  const { offers, addOffer } = useJob();
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const [formData, setFormData] = useState({
    jobTitle: '',
    company: '',
    type: 'Invite' as 'Invite' | 'Offer',
    stage: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    
    try {
      const cheatSheet = await generateInterviewCheatSheet(formData.jobTitle, formData.company, formData.notes);
      await addOffer({ ...formData, cheatSheet });
      toast.success('Offer/Invite added and interview cheat sheet generated!');
      setIsAdding(false);
      setFormData({
        jobTitle: '',
        company: '',
        type: 'Invite',
        stage: '',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      });
    } catch (error) {
      toast.error('Failed to generate cheat sheet, but record was saved.');
      await addOffer(formData);
      setIsAdding(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-slate-900">Invitations & Offers</h3>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger
            render={
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                <Plus className="w-4 h-4" />
                Add Invite/Offer
              </Button>
            }
          />
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>New Invitation or Offer</DialogTitle>
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
                  <label className="text-sm font-medium">Type</label>
                  <Select 
                    value={formData.type} 
                    onValueChange={(v: 'Invite' | 'Offer') => setFormData(prev => ({ ...prev, type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Invite">Interview Invite</SelectItem>
                      <SelectItem value="Offer">Job Offer</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Stage / Status</label>
                  <Input 
                    required 
                    value={formData.stage}
                    onChange={e => setFormData(prev => ({ ...prev, stage: e.target.value }))}
                    placeholder="e.g. Onsite, Final Round, Signed" 
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Input 
                  type="date" 
                  required 
                  value={formData.date}
                  onChange={e => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Role Description / Notes</label>
                <Textarea 
                  required 
                  className="h-32"
                  value={formData.notes}
                  onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Paste the role description or any notes about the offer/invite..." 
                />
              </div>
              <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700" disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating Cheat Sheet...
                  </>
                ) : (
                  'Save Entry'
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
                <TableHead>Type</TableHead>
                <TableHead>Stage</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {offers.map((offer) => (
                <TableRow key={offer.id}>
                  <TableCell className="font-medium">{offer.jobTitle}</TableCell>
                  <TableCell>{offer.company}</TableCell>
                  <TableCell>
                    <div className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      offer.type === 'Offer' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                    }`}>
                      {offer.type}
                    </div>
                  </TableCell>
                  <TableCell>{offer.stage}</TableCell>
                  <TableCell>{offer.date}</TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="gap-2"
                      onClick={() => setSelectedOffer(offer)}
                    >
                      <FileText className="w-4 h-4" />
                      Prep Notes
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {offers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-slate-500">
                    No invites or offers yet. Keep going!
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              Interview Prep: {selectedOffer?.jobTitle} at {selectedOffer?.company}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 prose prose-slate max-w-none">
            <div className="p-6 bg-slate-50 rounded-lg">
              <ReactMarkdown>{selectedOffer?.cheatSheet || "No cheat sheet generated."}</ReactMarkdown>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(selectedOffer?.cheatSheet || "");
              toast.success('Copied to clipboard!');
            }}>
              Copy to Clipboard
            </Button>
            <Button onClick={() => setSelectedOffer(null)}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Offers;
