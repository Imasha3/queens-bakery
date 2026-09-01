'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function DeliveryAreas() {
  const { t } = useApp();

  // Locations translated array
  const locations: string[] = t('delivery.locations');

  return (
    <section id="delivery" className="py-16 md:py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Column */}
          <div className="lg:col-span-5 space-y-6">
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary border border-primary/20 tracking-wide uppercase">
              🚚 Area Coverage
            </div>
            
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground leading-tight">
              {t('delivery.title')}
            </h2>
            
            <p className="text-sm font-light text-muted-foreground leading-relaxed">
              We bake fresh to order and hand-deliver to selected areas to preserve quality and presentation. Select your location during inquiry to verify scheduling.
            </p>

            {/* Note banner */}
            <div className="rounded-xl border border-primary/20 bg-accent/20 p-4 text-xs leading-relaxed text-foreground/90">
              <div className="flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" />
                </svg>
                <p>
                  <strong>Important:</strong> {t('delivery.note')}
                </p>
              </div>
            </div>
          </div>

          {/* Right Locations Grid Column */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {locations.map((loc) => (
                <div
                  key={loc}
                  className="flex flex-col items-center justify-center p-5 rounded-2xl bg-card border border-border shadow-sm hover:border-primary/40 hover:shadow-md transition-all duration-300 group"
                >
                  {/* Small Map Pin Icon */}
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-accent text-primary mb-3 group-hover:scale-110 transition-transform duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <span className="font-serif text-sm font-bold text-foreground text-center">
                    {loc}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
