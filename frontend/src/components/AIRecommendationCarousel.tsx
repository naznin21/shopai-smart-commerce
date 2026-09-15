import React, { useEffect, useState } from 'react';
import { Product } from '../types';
import { aiService } from '../services/aiService';
import { ProductCard } from './ProductCard';
import { Sparkles, Bot } from 'lucide-react';

interface AIRecommendationCarouselProps {
  productId?: string;
  categoryId?: string;
}

export const AIRecommendationCarousel: React.FC<AIRecommendationCarouselProps> = ({
  productId,
  categoryId,
}) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [title, setTitle] = useState<string>('ShopAI Smart Picks');
  const [subtitle, setSubtitle] = useState<string>('Contextual recommendations for your kitchen');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    aiService
      .getRecommendations({ productId, categoryId })
      .then((res) => {
        setProducts(res.products);
        if (res.title) setTitle(res.title);
        if (res.subtitle) setSubtitle(res.subtitle);
      })
      .catch((err) => {
        console.error('Failed to load AI recommendations', err);
      })
      .finally(() => setLoading(false));
  }, [productId, categoryId]);

  if (loading) {
    return (
      <div className="py-6 flex justify-center">
        <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (products.length === 0) return null;

  return (
    <section className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shadow-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-extrabold uppercase tracking-wider text-emerald-600">
                AI Powered Insights
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">{title}</h2>
            <p className="text-xs text-slate-500">{subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </section>
  );
};
