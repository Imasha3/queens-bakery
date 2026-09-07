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
    <div className="flex flex-col h-full rounded-none overflow-hidden bg-card border border-border/80 shadow-xs hover:shadow-md transition-all duration-300 group hover:-translate-y-0.5">
      {/* Product Image Link - sharp square corners */}
      <Link href={`/products/${slug}`} className="relative aspect-[4/3] w-full overflow-hidden bg-accent/25 block rounded-none">
        <span className="absolute top-3 left-3 z-10 rounded-none bg-primary/95 text-primary-foreground px-2.5 py-1 text-[11px] font-semibold tracking-wide shadow-xs">
          {category}
        </span>
        {hasValidImage ? (
          <img
            src={validImageUrl}
            alt={name}
            className="h-full w-full object-cover transform scale-100 group-hover:scale-104 transition-transform duration-500 rounded-none"
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
      <div className="flex flex-col flex-grow p-5">
        <Link href={`/products/${slug}`} className="block">
          <h3 className="font-serif text-base md:text-lg font-bold text-foreground mb-1.5 leading-snug group-hover:text-primary transition-colors duration-200">
            {name}
          </h3>
        </Link>
        
        <p className="text-xs font-light text-muted-foreground mb-5 line-clamp-2 leading-relaxed">
          {description}
        </p>

        {/* Action Buttons - square rounded-none corners */}
        <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-border/60">
          <Link
            href={`/products/${slug}`}
            className="flex items-center justify-center rounded-none border border-border/80 hover:border-primary/50 text-xs font-semibold text-foreground hover:bg-accent/20 py-2.5 transition-all duration-200 text-center"
          >
            {t('products.viewDetails')}
          </Link>
          
          <button
            onClick={handleInquiryToggle}
            className={`flex items-center justify-center gap-1.5 rounded-none text-xs font-semibold py-2.5 transition-all duration-200 cursor-pointer ${
              isAdded
                ? 'bg-accent text-accent-foreground border border-primary/20 shadow-inner'
                : 'bg-primary text-primary-foreground shadow-xs hover:opacity-95'
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
