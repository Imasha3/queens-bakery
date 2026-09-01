'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

interface CategoryCardProps {
  image: string;
  name: string;
  description: string;
  href: string;
}

export default function CategoryCard({ image, name, description, href }: CategoryCardProps) {
  const { t } = useApp();

  return (
    <div className="flex flex-col h-full rounded-2xl overflow-hidden bg-card border border-border/80 shadow-md hover:shadow-xl transition-all duration-300 group hover:-translate-y-1">
      {/* Category Image */}
      <div className="relative aspect-square w-full overflow-hidden bg-accent/20">
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-10" />
        {typeof image === 'string' && image.trim() !== '' ? (
          <img
            src={image.trim()}
            alt={name}
            className="h-full w-full object-cover transform scale-100 group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center bg-accent/30 text-muted-foreground/60 p-4 text-center">
            <span className="text-xs font-semibold uppercase tracking-wider">Queen's Bakery</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="flex flex-col flex-grow p-6">
        <h3 className="font-serif text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors duration-200">
          {name}
        </h3>
        <p className="text-sm font-light text-muted-foreground mb-6 line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Explore Button */}
        <div className="mt-auto">
          <a
            href={href}
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary group/btn hover:opacity-80 transition-opacity duration-200"
          >
            {t('categories.exploreBtn')}
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2.5}
              stroke="currentColor"
              className="w-4 h-4 transform group-hover/btn:translate-x-1 transition-transform duration-200"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
