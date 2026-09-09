import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, Stethoscope, User, HelpCircle, Bot } from 'lucide-react';
import { aiConfigApi } from '../../api/aiConfig';

interface ChatMessage {
  role: 'assistant' | 'user';
  content: string;
}

interface HealthAssistantWidgetProps {
  isOpen: boolean;
  onClose: () => void;
}

const QUICK_QUESTIONS = [
  'What is the typical cost for a Knee Replacement in Mumbai?',
  'How much is covered under insurance for Gallbladder surgery?',
  'What are the best accredited cardiac hospitals in Delhi?',
  'Can you explain the difference between Surgeon Fee and OT Charges?'
];

export const HealthAssistantWidget: React.FC<HealthAssistantWidgetProps> = ({ isOpen, onClose }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your Virtual Health & Surgical Counselor. How can I assist you today with surgical package costs, hospital accreditations, or medical insurance questions?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const handleSend = async (queryText?: string) => {
    const textToSend = queryText || input;
    if (!textToSend.trim() || isLoading) return;

    const userMessage: ChatMessage = { role: 'user', content: textToSend };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    try {
      const res = await aiConfigApi.chatAssistant(updatedMessages, textToSend);
      setMessages([...updatedMessages, { role: 'assistant', content: res.reply }]);
    } catch (err: any) {
      setMessages([
        ...updatedMessages,
        {
          role: 'assistant',
          content: 'I apologize, but I am currently unable to reach the counselor service. Please try again shortly.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center sm:items-end sm:justify-end p-2 sm:p-6 bg-slate-950/60 backdrop-blur-sm sm:bg-transparent pointer-events-none">
      <div className="pointer-events-auto glass-panel border border-sky-400/40 rounded-3xl shadow-[0_0_50px_rgba(56,189,248,0.2)] w-full max-w-lg h-[min(620px,calc(100dvh-1.5rem))] sm:h-[600px] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5 duration-300 backdrop-blur-3xl bg-[#07152b]/95">
        {/* Header */}
        <div className="bg-[#061224]/90 text-white p-4 sm:p-4.5 flex items-center justify-between border-b border-sky-400/20">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-white shadow-[0_0_15px_rgba(56,189,248,0.35)] flex-shrink-0 border border-sky-300/30">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-extrabold text-white tracking-tight">
                  Virtual Health & Surgical Counselor
                </h3>
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              </div>
              <p className="text-[11px] text-slate-400">
                Instant answers regarding surgical costs, packages & doctors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-sky-500/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Log */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-[#050f20]/75 backdrop-blur-md">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex items-start gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center text-white flex-shrink-0 text-xs font-bold shadow-[0_0_10px_rgba(56,189,248,0.3)]">
                    <Stethoscope className="w-3.5 h-3.5" />
                  </div>
                )}
                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    isUser
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-tr-none shadow-[0_0_20px_rgba(56,189,248,0.25)] border border-sky-300/30 font-medium'
                      : 'bg-[#0a1e3b]/85 border border-sky-400/25 text-slate-200 rounded-tl-none shadow-xs prose prose-invert prose-xs'
                  }`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  {msg.content}
                </div>
                {isUser && (
                  <div className="w-7 h-7 rounded-xl bg-slate-800 border border-sky-400/30 flex items-center justify-center text-cyan-300 flex-shrink-0 text-xs shadow-xs">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-slate-300 italic p-3 bg-[#0a1e3b]/85 rounded-2xl border border-sky-400/25 shadow-xs w-fit">
              <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
              <span>Counselor is analyzing your medical query...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick-Question Chips */}
        <div className="p-3 bg-[#061224]/90 border-t border-sky-400/15 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5 pb-1.5">
            <HelpCircle className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 flex-shrink-0">
              Suggested Questions:
            </span>
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar py-0.5">
            {QUICK_QUESTIONS.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSend(q)}
                disabled={isLoading}
                className="text-[11px] font-medium whitespace-nowrap bg-sky-950/60 hover:bg-sky-900/60 text-cyan-200 hover:text-white px-3 py-1.5 rounded-xl border border-sky-400/30 transition-all flex-shrink-0 hover:scale-[1.02] active:scale-[0.98]"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="p-3 bg-[#061224]/95 border-t border-sky-400/15 flex items-center gap-2"
        >
          <input
            type="text"
            placeholder="Ask about surgery expenses, city estimates..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-xs glass-input rounded-xl focus:outline-none transition-all text-white placeholder-slate-400 border border-sky-400/30 bg-[#071a36]/80 focus:border-cyan-400 focus:shadow-[0_0_15px_rgba(56,189,248,0.2)]"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="w-10 h-10 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-40 text-white flex items-center justify-center transition-all shadow-[0_0_15px_rgba(56,189,248,0.3)] active:scale-95 border border-sky-300/30"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

