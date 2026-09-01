'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { Review } from '@/locales/translations';

export default function SocialSection() {
  const { t, socialSettings } = useApp();

  const reviews: Review[] = t('trust.reviews');

  const hasSocialLinks = Boolean(socialSettings?.facebook || socialSettings?.tiktok || socialSettings?.whatsapp);

  return (
    <section className="py-16 md:py-24 transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-20">
        
        {/* Reviews Section */}
        <div>
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {t('trust.title')}
            </h2>
            <div className="h-1 w-12 bg-primary mx-auto mt-4 rounded-full" />
            <p className="text-sm font-light text-muted-foreground mt-4">
              Real feedback from local inquiries and deliveries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews.map((rev) => (
              <div
                key={rev.name}
                className="flex flex-col justify-between p-8 rounded-2xl bg-card border border-border shadow-sm hover:shadow-md transition-shadow duration-300 relative"
              >
                {/* Quote decoration */}
                <span className="absolute top-4 right-6 text-7xl font-serif text-primary/10 select-none pointer-events-none">
                  “
                </span>

                <div className="space-y-4">
                  {/* Static Heart Icons - Premium Touch */}
                  <div className="flex gap-1 text-primary">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                        <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                      </svg>
                    ))}
                  </div>

                  <p className="text-sm font-light text-foreground/95 italic leading-relaxed">
                    "{rev.review}"
                  </p>
                </div>

                <div className="border-t border-border/60 pt-4 mt-6">
                  <h4 className="font-serif text-sm font-bold text-foreground">
                    {rev.name}
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    📍 {rev.location}, Sri Lanka
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Social Media Link cards */}
        {hasSocialLinks && (
          <div className="border-t border-border/60 pt-16">
            <div className="rounded-3xl bg-accent/10 border border-border/80 p-8 md:p-12 text-center max-w-4xl mx-auto space-y-6">
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground">
                {t('social.title')}
              </h3>
              <p className="text-sm font-light text-muted-foreground max-w-xl mx-auto leading-relaxed">
                {t('social.subtitle')}
              </p>
              
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                {/* Facebook Button */}
                {socialSettings?.facebook && (
                  <a
                    href={socialSettings.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl bg-card border border-border hover:border-primary/50 text-sm font-semibold text-foreground px-8 py-3.5 shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto justify-center"
                  >
                    {/* Facebook SVG Logo */}
                    <svg className="w-5 h-5 text-blue-600 fill-current" viewBox="0 0 24 24">
                      <path d="M9 8H7v3h2v9h4v-9h3.625L16 8h-3V7c0-.5.5-1 1-1h2V3h-3c-2.5 0-4 1.5-4 4v1z"/>
                    </svg>
                    Facebook
                  </a>
                )}

                {/* TikTok Button */}
                {socialSettings?.tiktok && (
                  <a
                    href={socialSettings.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl bg-card border border-border hover:border-primary/50 text-sm font-semibold text-foreground px-8 py-3.5 shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto justify-center"
                  >
                    {/* TikTok SVG Logo */}
                    <svg className="w-5 h-5 text-foreground fill-current" viewBox="0 0 24 24">
                      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.82.97 1.97 1.65 3.23 1.94V10.2c-1.19-.17-2.33-.7-3.23-1.48-.68-.58-1.22-1.33-1.57-2.18v8.61c.07 2.11-.84 4.19-2.43 5.56-1.74 1.5-4.22 2.05-6.49 1.43-2.55-.7-4.54-2.88-4.99-5.5-.6-3.48 1.42-7.01 4.79-7.97.74-.21 1.52-.27 2.28-.18v4.06c-.84-.19-1.74.03-2.37.62-.73.69-.97 1.8-.57 2.72.4 1 1.48 1.62 2.54 1.46 1.13-.17 1.94-1.18 1.91-2.32V.02z"/>
                    </svg>
                    TikTok
                  </a>
                )}

                {/* WhatsApp Button */}
                {socialSettings?.whatsapp && (
                  <a
                    href={socialSettings.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl bg-card border border-border hover:border-primary/50 text-sm font-semibold text-foreground px-8 py-3.5 shadow-sm hover:shadow-md transition-all duration-300 w-full sm:w-auto justify-center"
                  >
                    {/* WhatsApp SVG Logo */}
                    <svg className="w-5 h-5 text-emerald-500 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/>
                    </svg>
                    WhatsApp
                  </a>
                )}
              </div>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
