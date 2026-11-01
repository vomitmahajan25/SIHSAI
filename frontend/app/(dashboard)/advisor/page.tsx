'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Send,
  User,
  Sparkles,
  ExternalLink,
  ShieldAlert,
  Clock,
  CheckCircle,
  Lightbulb,
  Info,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { api } from '@/lib/api';
import { ChatMessage, ActionItem, SourceReference } from '@/types';
import Alert from '@/components/ui/Alert';

const PROMPT_SUGGESTIONS = [
  'How much net profit did I make this month?',
  'Which government scheme is most relevant for my enterprise?',
  'How can I reduce my business operating expenses?',
  'What should I check before taking a loan from a moneylender?',
  'How to plan stock and inventory before the upcoming festival?',
];

export default function AdvisorPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | undefined>(undefined);
  const [fallbackMode, setFallbackMode] = useState(false);
  const [disclaimer, setDisclaimer] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    // Initial greeting
    setMessages([
      {
        sender: 'assistant',
        content:
          'Namaste! I am your GramVikas AI Business Advisor. I have analyzed your business profile and Khata records. Ask me anything about your profit margins, cash flow, seasonal stock planning, or eligible government schemes like PM SVANidhi and PMMY MUDRA.',
        suggested_actions: [
          {
            title: 'Verify Daily Khata',
            description: 'Ensure all sales and supplier payments from today are logged in your Khata book.',
            impact: 'High',
            category: 'Cash Flow',
          },
        ],
      },
    ]);
  }, []);

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input;
    if (!textToSend.trim() || loading) return;

    const userMsg: ChatMessage = { sender: 'user', content: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await api.chatAdvisor({
        message: textToSend,
        conversation_id: conversationId,
      });

      setConversationId(res.conversation_id);
      setFallbackMode(res.is_fallback_mode);
      setDisclaimer(res.disclaimer);

      const assistantMsg: ChatMessage = {
        sender: 'assistant',
        content: res.message,
        sources: res.sources,
        suggested_actions: res.suggested_actions,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          content: 'I apologize, but I encountered an error connecting to the advisory engine. Please check your backend connection.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleNewConversation = () => {
    setConversationId(undefined);
    setMessages([
      {
        sender: 'assistant',
        content:
          'Starting a fresh advisory session! How can I assist your business growth today?',
      },
    ]);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col space-y-4">
      {/* Top Banner & Session Controls */}
      <div className="flex items-center justify-between pb-2 border-b border-stroke">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-forest flex items-center justify-center text-lime shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-ink-primary">AI Business Advisor</h2>
              {fallbackMode ? (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-300">
                  Deterministic Rule-Engine Mode
                </span>
              ) : (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                  Live Gemini AI Connected
                </span>
              )}
            </div>
            <p className="text-xs text-ink-secondary">
              Personalized for your business using verified backend financial telemetry
            </p>
          </div>
        </div>

        <button
          onClick={handleNewConversation}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-stroke bg-surface hover:bg-canvas text-xs font-semibold text-ink-primary transition-colors shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 text-sage" />
          <span>New Chat</span>
        </button>
      </div>

      {fallbackMode && (
        <Alert
          type="info"
          title="Transparent Fallback Mode Notice"
          message="External Gemini API key is not currently configured or reached on the backend. GramVikas AI is providing accurate, verified advisory using our built-in Deterministic Rural Business Rules Engine. (To enable Gemini LLM, set GEMINI_API_KEY in backend/.env)."
        />
      )}

      {/* Chat Messages Scroll Container */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-2xl bg-surface border border-stroke shadow-sm">
        {messages.map((msg, index) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={index}
              className={`flex gap-3 max-w-3xl ${isUser ? 'ml-auto flex-row-reverse' : ''}`}
            >
              {/* Avatar */}
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                  isUser
                    ? 'bg-sage text-white'
                    : 'bg-forest text-lime shadow-sm'
                }`}
              >
                {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              {/* Message Bubble */}
              <div
                className={`p-4 rounded-2xl text-xs md:text-sm leading-relaxed space-y-3 ${
                  isUser
                    ? 'bg-sage text-white rounded-tr-none'
                    : 'bg-canvas text-ink-primary border border-stroke rounded-tl-none'
                }`}
              >
                <div className="whitespace-pre-line">{msg.content}</div>

                {/* Structured Action Items */}
                {!isUser && msg.suggested_actions && msg.suggested_actions.length > 0 && (
                  <div className="pt-3 border-t border-stroke/70 space-y-2">
                    <div className="text-[11px] font-bold uppercase tracking-wider text-sage flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Suggested Action Items</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.suggested_actions.map((action, aIdx) => (
                        <div
                          key={aIdx}
                          className="p-2.5 bg-surface rounded-xl border border-stroke space-y-1 text-xs"
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-ink-primary">{action.title}</span>
                            <span
                              className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${
                                action.impact === 'High'
                                  ? 'bg-rose-100 text-rose-800'
                                  : 'bg-blue-100 text-blue-800'
                              }`}
                            >
                              {action.impact} Impact
                            </span>
                          </div>
                          <p className="text-[11px] text-ink-secondary leading-snug">
                            {action.description}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verified Source References */}
                {!isUser && msg.sources && msg.sources.length > 0 && (
                  <div className="pt-2 border-t border-stroke/70 text-[11px] text-ink-secondary space-y-1">
                    <span className="font-semibold text-ink-primary">Verified References:</span>
                    {msg.sources.map((src, sIdx) => (
                      <div key={sIdx} className="flex items-center gap-1.5">
                        <CheckCircle className="w-3 h-3 text-sage flex-shrink-0" />
                        <span>{src.title}</span>
                        {src.url && (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sage hover:underline flex items-center gap-0.5 font-medium ml-1"
                          >
                            <span>Official Portal</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex gap-3 max-w-xl">
            <div className="w-8 h-8 rounded-xl bg-forest text-lime flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 animate-pulse" />
            </div>
            <div className="p-4 rounded-2xl bg-canvas border border-stroke text-xs text-ink-secondary flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-sage" />
              <span>Analyzing financial profile and consulting business knowledge base...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Prompt Pills */}
      <div className="flex flex-wrap gap-2 pt-1">
        {PROMPT_SUGGESTIONS.map((suggestion, idx) => (
          <button
            key={idx}
            onClick={() => handleSend(suggestion)}
            className="text-[11px] font-medium px-3 py-1.5 rounded-full bg-surface border border-stroke text-ink-secondary hover:text-sage hover:border-sage transition-all shadow-2xs"
          >
            {suggestion}
          </button>
        ))}
      </div>

      {/* Input Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question in English, Hindi, or your regional business language..."
          className="flex-1 px-4 py-3 bg-surface border border-stroke rounded-xl text-xs md:text-sm focus:outline-none focus:ring-2 focus:ring-sage/30 focus:border-sage shadow-sm"
        />
        <button
          type="submit"
          disabled={loading || !input.trim()}
          className="px-5 py-3 rounded-xl bg-forest hover:bg-forest-light text-white text-xs md:text-sm font-semibold flex items-center gap-2 shadow-sm disabled:opacity-40 transition-colors"
        >
          <Send className="w-4 h-4 text-lime" />
          <span className="hidden sm:inline">Send</span>
        </button>
      </form>
    </div>
  );
}
