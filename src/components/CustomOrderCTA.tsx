'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function CustomOrderCTA() {
  const { t, setInquiryModalOpen } = useApp();

  const points = t('custom.points');

  return (
    <section id="custom-orders" className="py-16 md:py-24 bg-accent/20 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-card border border-border shadow-xl p-8 md:p-12 lg:p-16">
          {/* Subtle background overlay blobs */}
          <div className="absolute top-0 right-0 -z-10 h-72 w-72 rounded-full bg-primary/5 blur-3xl" />
          <div className="absolute bottom-0 left-0 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
            {/* CTA Copy Column */}
            <div className="lg:col-span-7 space-y-6">
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">
                ✨ Bespoke Creations
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground leading-tight">
                {t('custom.title')}
              </h2>
              <p className="text-sm font-light text-muted-foreground leading-relaxed">
                {t('custom.description')}
              </p>
              
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="inline-flex items-center justify-center rounded-xl bg-primary px-8 py-4 text-sm font-semibold text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                {t('custom.button')}
              </button>
            </div>

            {/* Checklist Grid Column */}
            <div className="lg:col-span-5">
              <div className="grid grid-cols-1 gap-4">
                {points.map((pt: string) => (
                  <div
                    key={pt}
                    className="flex items-start gap-4 p-4 rounded-xl bg-background/50 border border-border/80"
                  >
                    {/* Sparkle icon checkmark */}
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v18M3 12h18M5.25 5.25l13.5 13.5M18.75 5.25L5.25 18.75" />
                      </svg>
                    </div>
                    <div className="space-y-1">
                      <h4 className="font-serif text-sm font-bold text-foreground">
                        {pt}
                      </h4>
                      <p className="text-xs font-light text-muted-foreground">
                        Customized size, theme flavor, and delivery timing.
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
