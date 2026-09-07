'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function DeliveryAreas() {
  const { t, language } = useApp();

  // Locations translated array
  const locations: string[] = t('delivery.locations');

  return (
    <section id="delivery" className="py-16 md:py-24 transition-colors duration-300 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-xs font-semibold text-primary border border-primary/20 tracking-wide uppercase">
            🚚 {language === 'en' ? 'Regional Delivery Only' : 'ප්‍රාදේශීය බෙදාහැරීම් පමණි'}
          </div>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {t('delivery.title')}
          </h2>
          <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full" />
          <p className="text-xs sm:text-sm font-light text-muted-foreground max-w-xl mx-auto pt-2 leading-relaxed">
            {language === 'en'
              ? "To ensure maximum freshness, custom gateaux quality, and safe hand-delivery, Queen's Bakery delivers exclusively to the 8 designated regional areas below."
              : "උසස්ම නැවුම්බව සහ ආරක්ෂිත භාරදීම තහවුරු කිරීම සඳහා, අපගේ සේවාව පහත සඳහන් ප්‍රදේශ 8 සඳහා පමණක් සීමා වේ."}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
          
          {/* Left Column: Sri Lanka Interactive Vector Map Card */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center p-6 sm:p-8 rounded-none bg-card border border-border/80 shadow-lg relative group">
            <div className="w-full flex items-center justify-between mb-4 border-b border-border/60 pb-3">
              <span className="text-xs font-bold text-foreground font-serif tracking-wider uppercase">
                🇱🇰 Sri Lanka Coverage Map
              </span>
              <span className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 px-2.5 py-0.5 rounded-none">
                Active Zone
              </span>
            </div>

            {/* Sri Lanka SVG Map Vector Illustration */}
            <div className="relative w-full aspect-[4/5] max-w-xs flex items-center justify-center py-2">
              <svg
                viewBox="0 0 300 450"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full filter drop-shadow-md transition-transform duration-500 group-hover:scale-102"
              >
                {/* Sri Lanka Island Outline Shape */}
                <path
                  d="M140 20 C160 35, 180 50, 185 80 C190 110, 205 130, 215 160 C225 190, 235 220, 230 250 C225 280, 210 310, 195 340 C180 370, 155 410, 135 425 C120 415, 105 385, 95 350 C85 320, 70 280, 75 240 C80 200, 90 170, 95 130 C100 90, 115 50, 140 20 Z"
                  className="fill-accent/40 stroke-primary/30"
                  strokeWidth="3"
                />

                {/* Regional Highlight Zone Pulse Effect (Gampaha/Puttalam Region) */}
                <ellipse
                  cx="105"
                  cy="210"
                  rx="38"
                  ry="48"
                  className="fill-primary/20 stroke-primary animate-pulse"
                  strokeWidth="2"
                  strokeDasharray="4 4"
                />

                {/* Location Pins & Labels on Map */}
                <g className="transition-transform duration-300">
                  {/* Negombo / Seeduwa / Katunayake Cluster */}
                  <circle cx="95" cy="200" r="6" className="fill-primary animate-ping opacity-75" />
                  <circle cx="95" cy="200" r="5" className="fill-primary" />
                  <text x="30" y="195" fill="currentColor" className="text-[11px] font-serif font-bold text-primary fill-current">
                    Negombo
                  </text>

                  {/* Katunayake / Seeduwa */}
                  <circle cx="102" cy="212" r="4" className="fill-primary" />
                  <text x="32" y="215" fill="currentColor" className="text-[10px] font-semibold text-foreground/90 fill-current">
                    Katunayake / Seeduwa
                  </text>

                  {/* Ja-Ela */}
                  <circle cx="108" cy="225" r="4" className="fill-primary" />
                  <text x="38" y="235" fill="currentColor" className="text-[10px] font-semibold text-foreground/90 fill-current">
                    Ja-Ela
                  </text>

                  {/* Minuwangoda */}
                  <circle cx="120" cy="205" r="4" className="fill-primary" />
                  <text x="128" y="208" fill="currentColor" className="text-[10px] font-semibold text-foreground/90 fill-current">
                    Minuwangoda
                  </text>

                  {/* Dankotuwa / Wennappuwa / Marawila */}
                  <circle cx="92" cy="180" r="4.5" className="fill-primary" />
                  <text x="25" y="178" fill="currentColor" className="text-[10px] font-semibold text-foreground/90 fill-current">
                    Marawila & Wennappuwa
                  </text>
                </g>
              </svg>
            </div>

            {/* Note banner */}
            <div className="mt-4 w-full rounded-none border border-primary/20 bg-accent/30 p-4 text-xs leading-relaxed text-foreground/90">
              <div className="flex gap-3 items-start">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-primary flex-shrink-0 mt-0.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12v-.008z" />
                </svg>
                <p>
                  <strong>Notice:</strong> {t('delivery.note')} {language === 'en' ? 'Island-wide delivery is NOT offered.' : 'දිවයින පුරා බෙදාහැරීම් සිදු නොකෙරේ.'}
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Location Cards Grid */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {locations.map((loc) => (
                <div
                  key={loc}
                  className="flex flex-col items-center justify-center p-6 rounded-none bg-card border border-border/80 shadow-md hover:border-primary/50 hover:shadow-xl transition-all duration-300 group hover:-translate-y-1"
                >
                  {/* Pin Icon */}
                  <div className="flex items-center justify-center w-12 h-12 rounded-none bg-primary/10 text-primary mb-3 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                    </svg>
                  </div>
                  <span className="font-serif text-sm md:text-base font-bold text-foreground text-center group-hover:text-primary transition-colors">
                    {loc}
                  </span>
                  <span className="text-[10px] text-muted-foreground mt-1">Direct Delivery</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
