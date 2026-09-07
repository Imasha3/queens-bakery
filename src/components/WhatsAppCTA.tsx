'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function WhatsAppCTA() {
  const { t, socialSettings } = useApp();

  const whatsappUrl = socialSettings?.whatsapp;

  if (!whatsappUrl) {
    return null;
  }

  return (
    <section className="py-12 md:py-16 bg-card border-y border-border transition-colors duration-300">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-6">
        
        {/* WhatsApp Icon Banner */}
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-500">
          {/* WhatsApp SVG Logo */}
          <svg className="w-8 h-8 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.463L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.786 1.452 5.586 0 10.132-4.547 10.136-10.13.002-2.709-1.051-5.253-2.966-7.17C16.628 1.371 14.09.315 11.393.315c-5.592 0-10.14 4.549-10.144 10.135-.002 1.848.494 3.655 1.437 5.248L1.72 21.04l5.34-1.4a9.745 9.745 0 00-.413-.486z"/>
          </svg>
        </div>

        <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
          {t('whatsapp.title')}
        </h3>
        
        <p className="text-sm font-light text-muted-foreground max-w-lg mx-auto leading-relaxed">
          {t('whatsapp.description')}
        </p>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2.5 rounded-none bg-emerald-500 text-white font-semibold px-8 py-3.5 shadow-md shadow-emerald-500/10 hover:bg-emerald-600 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
        >
          <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.513 2.262 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.504-5.714-1.463L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.786 1.452 5.586 0 10.132-4.547 10.136-10.13.002-2.709-1.051-5.253-2.966-7.17C16.628 1.371 14.09.315 11.393.315c-5.592 0-10.14 4.549-10.144 10.135-.002 1.848.494 3.655 1.437 5.248L1.72 21.04l5.34-1.4a9.745 9.745 0 00-.413-.486z"/>
          </svg>
          {t('whatsapp.button')}
        </a>

      </div>
    </section>
  );
}
