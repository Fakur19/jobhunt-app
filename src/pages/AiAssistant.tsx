import React, { useState, useRef, useEffect } from 'react';
import { useJob } from '../context/JobContext';
import { chatWithAssistant } from '../services/ai';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
    "Summarize my applications",
    "Improve my resume skills",
    "Interview preparation tips",
    "Job search patterns"
  ];

  return (
    <div className="max-w-4xl mx-auto flex flex-col gap-6 h-[calc(100vh-8rem)] lg:h-[calc(100vh-12rem)] pb-4">
      <Card className="flex-1 flex flex-col overflow-hidden min-h-0">
        <CardHeader className="border-b bg-slate-50/50 py-3 sm:py-4 px-4 sm:px-6 shrink-0">
          <CardTitle className="text-base sm:text-lg font-semibold flex items-center gap-2">
            <Bot className="w-5 h-5 text-blue-600" />
            AI Job Companion
          </CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6 scrollbar-thin scrollbar-thumb-slate-200" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={cn(
                "flex gap-3 sm:gap-4 max-w-[95%] sm:max-w-[85%]",
                m.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
              )}>
                <div className={cn(
                  "w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
                  m.role === 'user' ? "bg-blue-600" : "bg-slate-100"
                )}>
                  {m.role === 'user' ? <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" /> : <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />}
                </div>
                <div className={cn(
                  "p-3 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed shadow-sm",
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
              <div className="flex gap-3 sm:gap-4 mr-auto max-w-[90%]">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                  <Bot className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-slate-600" />
                </div>
                <div className="bg-slate-100 p-3 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-slate-400" />
                  <span className="text-xs sm:text-sm text-slate-400 font-medium">Assistant is thinking...</span>
                </div>
              </div>
            )}
          </div>

          <div className="p-3 sm:p-4 border-t bg-white shrink-0">
            <div className="flex gap-2 mb-3 overflow-x-auto pb-2 no-scrollbar scroll-smooth">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-50 border border-slate-200 text-[10px] sm:text-xs text-slate-600 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-colors shadow-sm"
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
                placeholder="Ask me anything..." 
                className="flex-1 text-sm sm:text-base h-10 sm:h-12 focus-visible:ring-blue-500"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 w-10 sm:w-12 h-10 sm:h-12 p-0 shrink-0">
                <Send className="w-4 h-4 sm:w-5 sm:h-5" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 pb-4">
        <Card className="bg-purple-50 border-purple-100 shadow-none">
          <CardContent className="p-3 flex items-start sm:flex-col sm:items-center text-left sm:text-center gap-3 sm:gap-2">
            <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-purple-900 uppercase tracking-wider">Context Aware</p>
              <p className="text-[9px] sm:text-[10px] text-purple-700 font-medium mt-0.5 sm:mt-0">Knows your applications & skills.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-blue-50 border-blue-100 shadow-none">
          <CardContent className="p-3 flex items-start sm:flex-col sm:items-center text-left sm:text-center gap-3 sm:gap-2">
            <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-blue-900 uppercase tracking-wider">Interview Prep</p>
              <p className="text-[9px] sm:text-[10px] text-blue-700 font-medium mt-0.5 sm:mt-0">Mock questions & research.</p>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-emerald-100 shadow-none">
          <CardContent className="p-3 flex items-start sm:flex-col sm:items-center text-left sm:text-center gap-3 sm:gap-2">
            <RefreshCcw className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-600 shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-[10px] sm:text-xs font-bold text-emerald-900 uppercase tracking-wider">Always Ready</p>
              <p className="text-[9px] sm:text-[10px] text-emerald-700 font-medium mt-0.5 sm:mt-0">Available 24/7 to guide you.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AiAssistant;
