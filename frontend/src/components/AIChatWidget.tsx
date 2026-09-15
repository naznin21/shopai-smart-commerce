import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, Plus, RefreshCw } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AiChatMessage, Product } from '../types';

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      id: '1',
      sender: 'assistant',
      text: 'Hello! I am your ShopAI Shopping Assistant. Ask me for grocery recommendations, healthy meal plans, or budget options!',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || input).trim();
    if (!text || isLoading) return;

    const userMsg: AiChatMessage = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await aiService.chat({
        message: text,
        userEmail: user?.email,
      });

      const assistantMsg: AiChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: res.reply,
        suggestedProducts: res.suggestedProducts,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const fallbackMsg: AiChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I am temporarily experiencing connection issues, but you can browse our full catalog anytime in the store shop page!',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = (product: Product) => {
    addToCart(product.id, 1);
    showToast(`Added '${product.name}' to cart!`, 'success');
  };

  const quickChips = [
    'Healthy breakfast under ₹300',
    'Recommend dairy & bakery',
    'Fresh fruits & vegetables',
    'Express delivery guidelines',
  ];

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2.5 px-4 py-3.5 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 text-white rounded-full shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 group border border-white/20"
        >
          <div className="relative">
            <Bot className="w-6 h-6 animate-pulse" />
            <Sparkles className="w-3 h-3 text-amber-300 absolute -top-1 -right-1" />
          </div>
          <span className="font-extrabold text-xs tracking-wide">ShopAI Assistant</span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="w-[360px] sm:w-[400px] h-[520px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 p-4 text-white flex items-center justify-between shadow-md">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-300">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm flex items-center space-x-1.5">
                  <span>ShopAI Assistant</span>
                  <span className="bg-emerald-500/30 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold uppercase border border-emerald-400/30">
                    Live
                  </span>
                </h3>
                <p className="text-[10px] text-slate-400">Powered by ShopAI Heuristic & LLM Engine</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 text-slate-400 hover:text-white rounded-xl transition hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] p-3.5 rounded-2xl text-xs space-y-2 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                  {/* Suggested Products Grid inside Chat */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="pt-2 border-t border-slate-100 space-y-2 mt-2">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 tracking-wider block">
                        Matching Product Suggestions:
                      </span>
                      <div className="grid grid-cols-1 gap-2">
                        {msg.suggestedProducts.slice(0, 3).map((p) => (
                          <div
                            key={p.id}
                            className="flex items-center justify-between p-2 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/80 transition"
                          >
                            <div className="flex items-center space-x-2 truncate">
                              <img
                                src={p.imageUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=100'}
                                alt={p.name}
                                className="w-9 h-9 rounded-lg object-cover border border-slate-200 flex-shrink-0"
                              />
                              <div className="truncate">
                                <p className="font-bold text-slate-800 text-[11px] truncate">{p.name}</p>
                                <p className="text-[10px] font-extrabold text-emerald-700">₹{p.effectivePrice}</p>
                              </div>
                            </div>
                            <button
                              onClick={() => handleAddToCart(p)}
                              className="p-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition flex-shrink-0 ml-2"
                              title="Add to Cart"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={`text-[9px] block text-right font-medium ${
                      msg.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200/80 max-w-[70%]">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>ShopAI is thinking...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips */}
          <div className="px-3 py-2 bg-white border-t border-slate-100 overflow-x-auto flex space-x-2 scrollbar-none">
            {quickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-[10px] font-semibold text-slate-600 border border-slate-200/80 transition"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Footer */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 bg-white border-t border-slate-100 flex items-center space-x-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask ShopAI (e.g. healthy snacks under ₹300)..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl transition disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
