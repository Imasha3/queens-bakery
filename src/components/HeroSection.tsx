'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function HeroSection() {
  const { t, setInquiryModalOpen } = useApp();

  return (
    <section id="home" className="relative overflow-hidden py-16 lg:py-24 transition-colors duration-300">
      {/* Background glow highlights */}
      <div className="absolute top-1/4 left-10 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute bottom-1/4 right-10 -z-10 h-80 w-80 rounded-full bg-accent/20 blur-3xl dark:bg-accent/5" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Hero text content */}
          <div className="lg:col-span-7 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary border border-primary/20 tracking-wide uppercase">
              ✨ {t('hero.subtitle')}
            </div>
            
            <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-foreground leading-[1.1] transition-all">
              {t('hero.title')}
            </h1>
            
            <p className="text-lg md:text-xl font-light text-muted-foreground max-w-2xl leading-relaxed">
              {t('hero.description')}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <a
                href="#products"
                className="flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {t('hero.explore')}
              </a>
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="flex items-center justify-center rounded-xl border-2 border-primary/30 hover:border-primary/60 bg-transparent px-8 py-4 text-base font-semibold text-foreground hover:bg-accent/10 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                {t('hero.requestPrice')}
              </button>
            </div>
          </div>

          {/* Hero image showcase */}
          <div className="lg:col-span-5 flex justify-center w-full">
            <div className="relative w-full max-w-md lg:max-w-none aspect-[4/3] sm:aspect-square lg:aspect-[5/6] rounded-3xl overflow-hidden shadow-2xl border-4 border-card/80 dark:border-card/20 rotate-1 hover:rotate-0 transition-all duration-500 group">
              {/* Overlay styling for premium feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300 z-10" />
              
              {/* Premium image placeholder using generated asset */}
              <img
                src="/hero-bakery.jpg"
                alt="Queen's Bakery Desserts Collage"
                className="h-full w-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700"
                loading="eager"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
