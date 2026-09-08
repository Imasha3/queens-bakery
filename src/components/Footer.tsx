'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import Logo from './Logo';

export default function Footer() {
  const { t, socialSettings, setInquiryModalOpen, language } = useApp();

  const navLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.products'), href: '/products' },
    { label: t('nav.creations'), href: '/our-creations' },
    { label: t('nav.customOrders'), href: '/custom-orders' },
    { label: t('nav.delivery'), href: '/delivery' },
    { label: t('nav.contact'), href: '/contact' },
  ];

  const deliveryList = [
    'Negombo',
    'Seeduwa',
    'Katunayake',
    'Ja-Ela',
    'Minuwangoda',
    'Dankotuwa',
    'Wennappuwa',
    'Marawila',
  ];

  return (
    <footer className="bg-card/95 border-t-2 border-primary/20 dark:bg-card/95 mt-auto transition-colors duration-300 relative overflow-hidden shadow-inner">
      {/* Top Gradient Line */}
      <div className="h-1 w-full bg-gradient-to-r from-primary/30 via-primary to-primary/30" />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-12">
          
          {/* Brand Info Column (4 cols) */}
          <div className="lg:col-span-4 space-y-5 text-center md:text-left">
            <Link href="/" className="inline-block">
              <Logo />
            </Link>
            <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed max-w-sm mx-auto md:mx-0">
              {t('footer.tagline')}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="inline-flex items-center gap-2 bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 px-4 py-2.5 text-xs font-semibold transition-all duration-200 rounded-none cursor-pointer"
              >
                <span>💬</span>
                <span>{t('hero.requestPrice')}</span>
              </button>
            </div>
          </div>

          {/* Navigation Links Column (3 cols) */}
          <div className="lg:col-span-3 space-y-4 text-center md:text-left">
            <h4 className="font-serif text-sm font-bold text-foreground tracking-wider uppercase border-b border-border/60 pb-2 inline-block md:block">
              {t('footer.quickLinks')}
            </h4>
            <ul className="grid grid-cols-2 gap-2 text-xs font-medium text-foreground/80">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="hover:text-primary transition-colors duration-200 block py-1"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Delivery Coverage Column (3 cols) */}
          <div className="lg:col-span-3 space-y-4 text-center md:text-left">
            <h4 className="font-serif text-sm font-bold text-foreground tracking-wider uppercase border-b border-border/60 pb-2 inline-block md:block">
              🚚 {language === 'en' ? 'Delivery Areas' : 'බෙදාහරින ප්‍රදේශ'}
            </h4>
            <div className="flex flex-wrap gap-1.5 justify-center md:justify-start">
              {deliveryList.map((area) => (
                <span
                  key={area}
                  className="text-[11px] font-medium bg-accent/50 text-foreground/90 border border-border/80 rounded-none px-2.5 py-1"
                >
                  {area}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-muted-foreground/80 pt-1">
              *Regional delivery only
            </p>
          </div>

          {/* Socials & Connect Column (2 cols) */}
          <div className="lg:col-span-2 space-y-4 text-center md:text-left">
            <h4 className="font-serif text-sm font-bold text-foreground tracking-wider uppercase border-b border-border/60 pb-2 inline-block md:block">
              {t('footer.followUs')}
            </h4>
            
            <div className="flex flex-col gap-2.5 items-center md:items-start text-xs font-medium text-foreground/80">
              {socialSettings?.facebook && (
                <a
                  href={socialSettings.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <span>🌐</span>
                  <span>Facebook</span>
                </a>
              )}
              {socialSettings?.tiktok && (
                <a
                  href={socialSettings.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <span>🎵</span>
                  <span>TikTok</span>
                </a>
              )}
              {socialSettings?.whatsapp && (
                <a
                  href={socialSettings.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 hover:text-primary transition-colors"
                >
                  <span>💬</span>
                  <span>WhatsApp</span>
                </a>
              )}
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/60 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left text-xs font-light text-muted-foreground">
          <p>
            &copy; {new Date().getFullYear()} Queen's Bakery. {t('footer.rights')}
          </p>
          <div className="flex items-center gap-4 text-[11px]">
            <span>Negombo, Sri Lanka</span>
            <span>•</span>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact Support</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
