import React, { useState } from 'react';
import { useJob } from '../context/JobContext';
import { generateInterviewCheatSheet } from '../services/ai';
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
import { Plus, Loader2, FileText, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import ReactMarkdown from 'react-markdown';

const Offers = () => {
  const { offers, addOffer, updateOffer, updateApplication } = useJob();
  const [isAdding, setIsAdding] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<any>(null);

  const handleAcceptOffer = async (offer: any) => {
    try {
      await updateOffer(offer.id, { status: 'Accepted' });
      if (offer.applicationId) {
        await updateApplication(offer.applicationId, { status: 'Hired' });
      }
      toast.success('Congratulations on your new job!');
    } catch (error) {
      toast.error('Failed to update offer status.');
    }
  };

  const handleDeclineOffer = async (offer: any) => {
    try {
      await updateOffer(offer.id, { status: 'Declined' });
      if (offer.applicationId) {
        await updateApplication(offer.applicationId, { status: 'Offer Declined' });
      }
      toast.info('Offer declined.');
    } catch (error) {
      toast.error('Failed to update offer status.');
    }
  };

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
      await addOffer({ ...formData, cheatSheet, status: 'Pending' });
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
      await addOffer({ ...formData, status: 'Pending' });
      setIsAdding(false);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h3 className="text-lg font-semibold text-slate-900">Invitations & Offers</h3>
        <Dialog open={isAdding} onOpenChange={setIsAdding}>
          <DialogTrigger
            render={
              <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto">
                <Plus className="w-4 h-4" />
                Add Invite/Offer
              </Button>
            }
          />
          <DialogContent className="max-w-2xl w-[95vw] max-h-[95vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>New Invitation or Offer</DialogTitle>
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
              <Button type="submit" className="w-full h-12 bg-emerald-600 hover:bg-emerald-700" disabled={isGenerating}>
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
          <div className="hidden md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="pl-6">Job Title</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Stage</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offers.map((offer) => (
                  <TableRow key={offer.id}>
                    <TableCell className="font-medium pl-6">{offer.jobTitle}</TableCell>
                    <TableCell>{offer.company}</TableCell>
                    <TableCell>
                      <div className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        offer.type === 'Offer' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                      }`}>
                        {offer.type}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className={`inline-flex px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        offer.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 
                        offer.status === 'Declined' ? 'bg-red-100 text-red-700' : 
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {offer.status || 'Pending'}
                      </div>
                    </TableCell>
                    <TableCell>{offer.stage}</TableCell>
                    <TableCell>{offer.date}</TableCell>
                    <TableCell className="text-right pr-6">
                      <div className="flex justify-end gap-2">
                        {offer.type === 'Offer' && offer.status === 'Pending' && (
                          <div className="flex gap-1">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200"
                              onClick={() => handleAcceptOffer(offer)}
                            >
                              Accept
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="h-8 text-red-600 hover:text-red-700 hover:bg-red-50 border-red-200"
                              onClick={() => handleDeclineOffer(offer)}
                            >
                              Decline
                            </Button>
                          </div>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 gap-2"
                          onClick={() => setSelectedOffer(offer)}
                        >
                          <FileText className="w-4 h-4" />
                          <span className="hidden lg:inline">Prep Notes</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden divide-y divide-slate-100">
            {offers.map((offer) => (
              <div key={offer.id} className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-slate-900">{offer.jobTitle}</h3>
                    <p className="text-sm text-slate-500">{offer.company}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    offer.type === 'Offer' ? 'bg-emerald-100 text-emerald-700' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {offer.type}
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-500">{offer.stage} • {offer.date}</span>
                  <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                    offer.status === 'Accepted' ? 'bg-emerald-100 text-emerald-700' : 
                    offer.status === 'Declined' ? 'bg-red-100 text-red-700' : 
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {offer.status || 'Pending'}
                  </div>
                </div>
                <div className="flex gap-2 pt-1">
                  {offer.type === 'Offer' && (offer.status === 'Pending' || !offer.status) && (
                    <>
                      <Button 
                        variant="outline" 
                        className="flex-1 h-9 text-xs text-emerald-600 border-emerald-200"
                        onClick={() => handleAcceptOffer(offer)}
                      >
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        className="flex-1 h-9 text-xs text-red-600 border-red-200"
                        onClick={() => handleDeclineOffer(offer)}
                      >
                        Decline
                      </Button>
                    </>
                  )}
                  <Button 
                    variant="ghost" 
                    className="flex-1 h-9 text-xs gap-2 bg-slate-50"
                    onClick={() => setSelectedOffer(offer)}
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Prep Notes
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {offers.length === 0 && (
            <div className="text-center py-12 text-slate-500 text-sm italic">
              No invites or offers yet. Keep going!
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedOffer} onOpenChange={() => setSelectedOffer(null)}>
        <DialogContent className="max-w-3xl w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span className="truncate">Prep: {selectedOffer?.jobTitle}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 prose prose-slate max-w-none text-sm sm:text-base">
            <div className="p-4 sm:p-6 bg-slate-50 rounded-lg">
              <ReactMarkdown>{selectedOffer?.cheatSheet || "No cheat sheet generated."}</ReactMarkdown>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6">
            <Button variant="outline" onClick={() => {
              navigator.clipboard.writeText(selectedOffer?.cheatSheet || "");
              toast.success('Copied to clipboard!');
            }} className="w-full sm:w-auto">
              Copy to Clipboard
            </Button>
            <Button onClick={() => setSelectedOffer(null)} className="w-full sm:w-auto">Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Offers;
