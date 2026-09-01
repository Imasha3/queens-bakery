'use client';

import React from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import Logo from './Logo';

export default function Footer() {
  const { t, socialSettings } = useApp();

  const quickLinks = [
    { label: t('nav.home'), href: '/' },
    { label: t('nav.products'), href: '/products' },
    { label: t('nav.creations'), href: '/our-creations' },
    { label: t('nav.customOrders'), href: '/custom-orders' },
    { label: t('nav.delivery'), href: '/delivery' },
    { label: t('nav.contact'), href: '/contact' },
  ];

  const hasSocialLinks = Boolean(socialSettings?.facebook || socialSettings?.tiktok || socialSettings?.whatsapp);

  return (
    <footer className="bg-card border-t border-border mt-auto transition-colors duration-300">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12">
          
          {/* Brand Info Column */}
          <div className="md:col-span-6 space-y-4">
            <Link href="/">
              <Logo />
            </Link>
            <p className="text-sm font-light text-muted-foreground max-w-sm leading-relaxed">
              {t('footer.tagline')}
            </p>
          </div>

          {/* Quick Links Column */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-serif text-sm font-bold text-foreground tracking-wider uppercase">
              {t('footer.quickLinks')}
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-xs font-light text-muted-foreground hover:text-primary transition-colors duration-200"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Socials & Contacts Column */}
          {hasSocialLinks && (
            <div className="md:col-span-3 space-y-4">
              <h4 className="font-serif text-sm font-bold text-foreground tracking-wider uppercase">
                {t('footer.followUs')}
              </h4>
              <ul className="space-y-2">
                {socialSettings?.facebook && (
                  <li>
                    <a
                      href={socialSettings.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-light text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      Facebook
                    </a>
                  </li>
                )}
                {socialSettings?.tiktok && (
                  <li>
                    <a
                      href={socialSettings.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-light text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      TikTok
                    </a>
                  </li>
                )}
                {socialSettings?.whatsapp && (
                  <li>
                    <a
                      href={socialSettings.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-xs font-light text-muted-foreground hover:text-primary transition-colors duration-200"
                    >
                      WhatsApp
                    </a>
                  </li>
                )}
              </ul>
            </div>
          )}

        </div>

        {/* Bottom Bar */}
        <div className="mt-12 border-t border-border/60 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
          <p className="text-[11px] font-light text-muted-foreground">
            &copy; {new Date().getFullYear()} Queen's Bakery. {t('footer.rights')}
          </p>
          <div className="text-[10px] font-light text-muted-foreground/60 font-medium">
            Negombo, Sri Lanka
          </div>
        </div>
      </div>
    </footer>
  );
}
