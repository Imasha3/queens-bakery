'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function HeroSection() {
  const { t, setInquiryModalOpen } = useApp();

  return (
    <section id="home" className="relative overflow-hidden py-12 md:py-20 lg:py-24 transition-colors duration-300">
      {/* Background glow highlights */}
      <div className="absolute top-10 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute bottom-10 right-10 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Hero text content */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-xs font-semibold text-primary border border-primary/20 tracking-wide uppercase shadow-xs">
              <span>✨</span>
              <span>{t('hero.subtitle')}</span>
            </div>
            
            <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.08] transition-all">
              {t('hero.title')}
            </h1>
            
            <p className="text-base sm:text-lg md:text-xl font-light text-muted-foreground max-w-xl leading-relaxed">
              {t('hero.description')}
            </p>

            {/* Feature Highlights Bar */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md pt-2 border-y border-border/60 py-4 my-2">
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <span className="font-serif text-lg md:text-xl font-bold text-primary">100%</span>
                <span className="text-[11px] font-light text-muted-foreground">Fresh Daily</span>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left border-x border-border/60 px-3">
                <span className="font-serif text-lg md:text-xl font-bold text-primary">Custom</span>
                <span className="text-[11px] font-light text-muted-foreground">Designs</span>
              </div>
              <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
                <span className="font-serif text-lg md:text-xl font-bold text-primary">Regional</span>
                <span className="text-[11px] font-light text-muted-foreground">Delivery</span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
              <a
                href="#products"
                className="flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {t('hero.explore')}
              </a>
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="flex items-center justify-center rounded-xl border-2 border-primary/30 hover:border-primary/60 bg-transparent px-8 py-4 text-base font-semibold text-foreground hover:bg-accent/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {t('hero.requestPrice')}
              </button>
            </div>
          </div>

          {/* Hero image showcase */}
          <div className="lg:col-span-6 flex justify-center w-full relative">
            <div className="relative w-full max-w-lg lg:max-w-none aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/5] rounded-none overflow-hidden shadow-2xl border-4 border-card/90 dark:border-card/30 transition-all duration-500 group">
              {/* Overlay styling for premium feel */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-50 group-hover:opacity-30 transition-opacity duration-300 z-10" />
              
              <img
                src="/hero-bakery.jpg"
                alt="Queen's Bakery Desserts Showcase"
                className="h-full w-full object-cover transform scale-105 group-hover:scale-100 transition-transform duration-700 rounded-none"
                loading="eager"
              />

              {/* Decorative Glass Badge 1 - Bottom Left */}
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto z-20 flex items-center gap-3 rounded-none bg-background/80 backdrop-blur-md p-3.5 border border-white/20 shadow-lg text-left">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-primary text-primary-foreground font-serif font-bold text-lg">
                  🎂
                </div>
                <div>
                  <p className="font-serif text-xs font-bold text-foreground">Artisanal Bakery & Gateaux</p>
                  <p className="text-[11px] text-muted-foreground">Baked with love in Sri Lanka</p>
                </div>
              </div>

              {/* Decorative Glass Badge 2 - Top Right */}
              <div className="hidden sm:flex absolute top-4 right-4 z-20 items-center gap-2 rounded-full bg-background/85 backdrop-blur-md px-3.5 py-1.5 border border-white/20 shadow-md">
                <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-semibold text-foreground">Orders Open</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
