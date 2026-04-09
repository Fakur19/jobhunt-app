import React, { useState, useRef, useEffect } from 'react';
import { useJob } from '../context/JobContext';
import { chatWithAssistant } from '../services/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageSquare, 
  Send, 
  User, 
  Bot, 
  Loader2,
  Sparkles,
  RefreshCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const AiAssistant = () => {
  const { applications, offers, resume } = useJob();
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'assistant', 
      content: "Hi! I'm your JobHunt OS Assistant. I have access to your applications, offers, and resume. How can I help you today?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const context = {
      applications: applications.map(a => ({ title: a.jobTitle, company: a.company, date: a.date, status: a.status })),
      offers: offers.map(o => ({ title: o.jobTitle, company: o.company, type: o.type, stage: o.stage })),
      resumeSummary: resume.summary,
      skills: resume.skills
    };

    try {
      const history = messages.map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.content }));
      history.push({ role: 'user', content: userMessage });
      
      const response = await chatWithAssistant(history, context);
      setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'assistant', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "Summarize my current applications",
    "How can I improve my resume skills?",
    "Help me prepare for an interview",
    "What patterns do you see in my search?"
  ];

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-12rem)] flex flex-col gap-6">
      <Card className="flex-1 flex flex-col overflow-hidden">
        <CardHeader className="border-b bg-slate-50/50 py-4">
          <CardTitle className="text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI Job Companion
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col">
          <div className="flex-1 overflow-y-auto p-6 space-y-6" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={cn(
                "flex gap-4 max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}>
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
                  m.role === 'user' ? "bg-blue-600" : "bg-slate-100"
                )}>
                  {m.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4 text-slate-600" />}
                </div>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed",
                  m.role === 'user' 
                    ? "bg-blue-600 text-white rounded-tr-none" 
                    : "bg-slate-100 text-slate-800 rounded-tl-none prose prose-slate prose-sm max-w-none"
                )}>
                  {m.role === 'assistant' ? (
                    <ReactMarkdown>{m.content}</ReactMarkdown>
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex gap-4 mr-auto">
                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-slate-600" />
                </div>
                <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  <span className="text-sm text-slate-400">Thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-4 border-t bg-white">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2 no-scrollbar">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <Input 
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Ask me anything about your job search..." 
                className="flex-1"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700">
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-purple-50 border-purple-100">
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-600" />
            <p className="text-xs font-medium text-purple-900">Context Aware</p>
            <p className="text-[10px] text-purple-700">I know your current applications and skills.</p>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100">
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <MessageSquare className="w-5 h-5 text-blue-600" />
            <p className="text-xs font-medium text-blue-900">Interview Prep</p>
            <p className="text-[10px] text-blue-700">Ask for mock questions or company research.</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100">
          <CardContent className="p-4 flex flex-col items-center text-center gap-2">
            <RefreshCcw className="w-5 h-5 text-emerald-600" />
            <p className="text-xs font-medium text-emerald-900">Always Ready</p>
            <p className="text-[10px] text-emerald-700">Available 24/7 to guide your career journey.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AiAssistant;
