import React, { useState, useRef, useEffect } from 'react';
import { Bot, Sparkles, Send, X, Plus, RefreshCw, ShoppingBag, PackageCheck, Trash2, ArrowRight, CheckCircle2 } from 'lucide-react';
import { aiService } from '../services/aiService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { AiChatMessage, Product } from '../types';
import { useNavigate } from 'react-router-dom';

export const AIChatWidget: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AiChatMessage[]>(() => {
    const saved = sessionStorage.getItem('shopai_chat_history');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [
      {
        id: '1',
        sender: 'assistant',
        text: 'Hello! I am your ShopAI AI Shopping Assistant. Ask me to track orders, build recipe ingredient bundles, recommend fresh groceries, or explain express pickup rules!',
        quickActions: [
          'Track My Order',
          'Paneer Butter Masala recipe',
          'Healthy breakfast under ₹300',
          'Express 1-Hour Pickup info'
        ],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
  });
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { addToCart } = useCart();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    sessionStorage.setItem('shopai_chat_history', JSON.stringify(messages));
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
        latestOrder: res.latestOrder,
        quickActions: res.quickActions,
        intent: res.intent,
        recipeTotalPrice: res.recipeTotalPrice,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err: any) {
      const fallbackMsg: AiChatMessage = {
        id: (Date.now() + 1).toString(),
        sender: 'assistant',
        text: 'I am temporarily experiencing connection issues, but you can browse our full fresh catalog anytime in the store shop page!',
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

  const handleAddAllToCart = (products: Product[]) => {
    let count = 0;
    products.forEach((p) => {
      addToCart(p.id, 1);
      count++;
    });
    showToast(`Added all ${count} items to your cart!`, 'success');
  };

  const handleClearChat = () => {
    const initial: AiChatMessage[] = [
      {
        id: Date.now().toString(),
        sender: 'assistant',
        text: 'Chat cleared! How can I assist your grocery shopping next?',
        quickActions: ['Track My Order', 'Paneer Butter Masala recipe', 'Fresh Fruits & Veggies'],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ];
    setMessages(initial);
    sessionStorage.removeItem('shopai_chat_history');
  };

  const lastAssistantMsg = [...messages].reverse().find(m => m.sender === 'assistant');
  const activeQuickChips = lastAssistantMsg?.quickActions || [
    'Track My Order',
    'Paneer Butter Masala recipe',
    'Healthy breakfast under ₹300',
    'Express 1-Hour Pickup info'
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
        <div className="w-[360px] sm:w-[420px] h-[540px] bg-white rounded-3xl shadow-2xl border border-slate-200/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
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
                <p className="text-[10px] text-slate-400">Order Tracking • Recipes • Smart Grocery Assistant</p>
              </div>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={handleClearChat}
                className="p-1.5 text-slate-400 hover:text-rose-300 rounded-xl transition hover:bg-white/10"
                title="Clear Chat History"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-xl transition hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-slate-50/50">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[88%] p-3.5 rounded-2xl text-xs space-y-2.5 shadow-sm ${
                    msg.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-br-none'
                      : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-none'
                  }`}
                >
                  <p className="leading-relaxed whitespace-pre-line">{msg.text}</p>

                  {/* Order Status Tracker Card */}
                  {msg.latestOrder && (
                    <div className="p-3 bg-emerald-50 border border-emerald-200/80 rounded-xl space-y-2 text-slate-800 mt-2">
                      <div className="flex items-center justify-between border-b border-emerald-200/60 pb-1.5">
                        <span className="font-extrabold text-[11px] text-emerald-900 flex items-center gap-1">
                          <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                          Order #{msg.latestOrder.orderNumber}
                        </span>
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase bg-emerald-600 text-white">
                          {msg.latestOrder.status}
                        </span>
                      </div>
                      <div className="text-[10px] space-y-1 text-slate-600">
                        <p><span className="font-semibold text-slate-700">Total:</span> ₹{msg.latestOrder.totalAmount}</p>
                        <p><span className="font-semibold text-slate-700">Type:</span> {msg.latestOrder.orderType?.replace('_', ' ')}</p>
                      </div>
                      <button
                        onClick={() => {
                          setIsOpen(false);
                          navigate('/orders');
                        }}
                        className="w-full py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[10px] font-bold flex items-center justify-center space-x-1 transition"
                      >
                        <span>View Order History</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  )}

                  {/* Recipe Bundle & Suggested Products Grid */}
                  {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                    <div className="pt-2.5 border-t border-slate-100 space-y-2 mt-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider flex items-center gap-1">
                          <ShoppingBag className="w-3 h-3" />
                          {msg.intent === 'RECIPE_BUNDLE' ? 'Recipe Ingredient Bundle' : 'Suggested Catalog Products'}
                        </span>
                        {msg.suggestedProducts.length > 1 && (
                          <button
                            onClick={() => handleAddAllToCart(msg.suggestedProducts!)}
                            className="text-[10px] font-bold text-emerald-600 hover:text-emerald-800 underline"
                          >
                            Add All ({msg.suggestedProducts.length})
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 gap-2">
                        {msg.suggestedProducts.slice(0, 4).map((p) => (
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
                                <p className="text-[10px] font-extrabold text-emerald-700">₹{p.effectivePrice} / {p.unit}</p>
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

                      {msg.intent === 'RECIPE_BUNDLE' && msg.recipeTotalPrice && (
                        <button
                          onClick={() => handleAddAllToCart(msg.suggestedProducts!)}
                          className="w-full py-2 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl text-[11px] font-extrabold flex items-center justify-center space-x-1.5 shadow hover:opacity-95 transition mt-1"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                          <span>Add Entire Recipe Bundle to Cart (₹{msg.recipeTotalPrice})</span>
                        </button>
                      )}
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
              <div className="flex items-center space-x-2 text-xs text-slate-500 bg-white p-3 rounded-2xl border border-slate-200/80 max-w-[70%] shadow-sm">
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
                <span>ShopAI is searching catalog & processing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Chips Bar */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 overflow-x-auto flex space-x-2 scrollbar-none">
            {activeQuickChips.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={isLoading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 hover:text-emerald-700 text-[10px] font-semibold text-slate-700 border border-slate-200/80 transition shadow-xs"
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
              placeholder="Ask ShopAI (e.g. track order, Paneer Butter Masala recipe)..."
              disabled={isLoading}
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:bg-white focus:border-emerald-500 outline-none transition"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white rounded-xl transition disabled:opacity-40 shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
