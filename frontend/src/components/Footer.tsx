import React from 'react';
import { Bot, ShieldCheck, Heart, Clock, Truck, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 text-xs border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-3">
            <div className="flex items-center space-x-2 text-white">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center text-slate-950 font-bold">
                <Bot className="w-5 h-5" />
              </div>
              <span className="text-base font-extrabold tracking-tight">
                Shop<span className="text-emerald-400">AI</span> Platform
              </span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed">
              Next-generation AI-powered grocery & e-commerce platform. Smart conversational assistance, natural language search, and 1-hour store pickup.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Quick Navigation</h4>
            <ul className="space-y-2">
              <li><Link to="/shop" className="hover:text-emerald-400 transition">Shop Catalog</Link></li>
              <li><Link to="/shop?category=1" className="hover:text-emerald-400 transition">Fruits & Vegetables</Link></li>
              <li><Link to="/shop?category=2" className="hover:text-emerald-400 transition">Dairy & Bakery</Link></li>
              <li><Link to="/shop?category=3" className="hover:text-emerald-400 transition">Snacks & Beverages</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link to="/orders" className="hover:text-emerald-400 transition">Track Orders</Link></li>
              <li><Link to="/orders" className="hover:text-emerald-400 transition">7-Day Easy Returns</Link></li>
              <li><Link to="/profile" className="hover:text-emerald-400 transition">Account Settings</Link></li>
              <li><span className="text-slate-500">Support: +91 9552145895</span></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white uppercase text-[11px] tracking-wider mb-3">ShopAI Promise</h4>
            <div className="space-y-2 text-[11px]">
              <div className="flex items-center space-x-2 text-slate-300">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span>1-Hour Express Store Pickup</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Truck className="w-4 h-4 text-teal-400" />
                <span>Free Home Delivery above ₹500</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Conversational Recommendations</span>
              </div>
              <div className="flex items-center space-x-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>100% Quality Assured Produce</span>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-[11px] gap-4">
          <p>© 2026 ShopAI Retail Technologies Inc. All rights reserved.</p>
          <div className="flex items-center space-x-1">
            <span>Powered by ShopAI MongoDB & AI Engine</span>
            <Heart className="w-3 h-3 text-rose-500 inline fill-rose-500" />
          </div>
        </div>
      </div>
    </footer>
  );
};
