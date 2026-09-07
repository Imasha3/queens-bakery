'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';

interface ProductCardProps {
  id: string;
  slug: string;
  image: string;
  name: string;
  category: string;
  description: string;
}

export default function ProductCard({ id, slug, image, name, category, description }: ProductCardProps) {
  const { inquiryCart, addToInquiry, removeFromInquiry, t } = useApp();
  
  const isAdded = inquiryCart.some((item) => item.productId === id);
  const hasValidImage = typeof image === 'string' && image.trim() !== '';
  const validImageUrl = hasValidImage ? image.trim() : '';

  const handleInquiryToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isAdded) {
      const existingItem = inquiryCart.find((item) => item.productId === id);
      if (existingItem) {
        removeFromInquiry(existingItem.id);
      }
    } else {
      addToInquiry({
        productId: id,
        name,
        category,
        image: validImageUrl,
        quantity: 1,
        options: {}
      });
    }
  };

  return (
    <div className="flex flex-col h-full rounded-2xl md:rounded-3xl overflow-hidden bg-card border border-border/80 shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      {/* Product Image Link */}
      <Link href={`/products/${slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-accent/25 block">
        <span className="absolute top-3 left-3 z-10 rounded-full bg-primary/95 text-primary-foreground px-3.5 py-1 text-[11px] font-semibold tracking-wide shadow-md backdrop-blur-xs">
          {category}
        </span>
        {hasValidImage ? (
          <img
            src={validImageUrl}
            alt={name}
            className="h-full w-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex flex-col items-center justify-center bg-accent/30 text-muted-foreground/60 p-4 text-center select-none">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mb-1 opacity-70">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 8v4l3 3" />
            </svg>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70">Queen's Bakery</span>
          </div>
        )}
      </Link>

      {/* Product Content */}
      <div className="flex flex-col flex-grow p-6">
        <Link href={`/products/${slug}`} className="block">
          <h3 className="font-serif text-lg md:text-xl font-bold text-foreground mb-2 leading-snug group-hover:text-primary transition-colors duration-200">
            {name}
          </h3>
        </Link>
        
        <p className="text-xs md:text-sm font-light text-muted-foreground mb-6 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons */}
        <div className="mt-auto grid grid-cols-2 gap-2.5 pt-3 border-t border-border/60">
          <Link
            href={`/products/${slug}`}
            className="flex items-center justify-center rounded-xl border border-border/80 hover:border-primary/50 text-xs font-semibold text-foreground hover:bg-accent/20 py-3 transition-all duration-200 text-center"
          >
            {t('products.viewDetails')}
          </Link>
          
          <button
            onClick={handleInquiryToggle}
            className={`flex items-center justify-center gap-1.5 rounded-xl text-xs font-semibold py-3 transition-all duration-200 cursor-pointer ${
              isAdded
                ? 'bg-accent text-accent-foreground border border-primary/20 shadow-inner'
                : 'bg-primary text-primary-foreground shadow-md hover:opacity-95'
            }`}
          >
            {isAdded ? (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                {t('products.addedToInquiry')}
              </>
            ) : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
                {t('products.addToInquiry')}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
