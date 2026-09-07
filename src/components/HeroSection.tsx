'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { galleryData } from '@/data/gallery';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore/lite';

export default function HeroSection() {
  const { t, setInquiryModalOpen } = useApp();
  const [images, setImages] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    const fetchCreations = async () => {
      try {
        const q = query(
          collection(db, 'creations'),
          where('active', '==', true)
        );
        const snap = await getDocs(q);
        if (snap.size > 0) {
          const fetchedImages: string[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            const itemImages = Array.isArray(data.images)
              ? data.images
              : [data.imageUrl || data.image || ''];
            itemImages.forEach((img: string) => {
              if (typeof img === 'string' && img.trim() !== '') {
                fetchedImages.push(img.trim());
              }
            });
          });
          if (fetchedImages.length > 0) {
            setImages(fetchedImages);
            return;
          }
        }
      } catch (err) {
        console.error('Error loading creations for Hero:', err);
      }

      // Fallback to galleryData static images
      const fallbackImages: string[] = [];
      galleryData.forEach((item) => {
        item.images.forEach((img) => {
          if (typeof img === 'string' && img.trim() !== '') {
            fallbackImages.push(img.trim());
          }
        });
      });
      setImages(fallbackImages.length > 0 ? fallbackImages : ['/hero-bakery.jpg']);
    };

    fetchCreations();
  }, []);

  // Auto-play dynamic transition every 3.5 seconds
  useEffect(() => {
    if (isPaused || images.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [images.length, isPaused]);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <section id="home" className="relative overflow-hidden py-12 md:py-20 lg:py-24 transition-colors duration-300">
      {/* Background glow highlights */}
      <div className="absolute top-10 left-1/4 -z-10 h-96 w-96 rounded-full bg-primary/10 blur-[100px]" />
      <div className="absolute bottom-10 right-10 -z-10 h-96 w-96 rounded-full bg-primary/5 blur-[120px]" />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Hero text content */}
          <div className="lg:col-span-6 flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
            <div className="inline-flex items-center gap-2 rounded-none bg-primary/10 px-4 py-2 text-xs font-semibold text-primary border border-primary/20 tracking-wide uppercase shadow-xs">
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
                className="flex items-center justify-center rounded-none bg-primary px-8 py-4 text-base font-semibold text-primary-foreground shadow-lg hover:shadow-primary/30 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {t('hero.explore')}
              </a>
              <button
                onClick={() => setInquiryModalOpen(true)}
                className="flex items-center justify-center rounded-none border-2 border-primary/30 hover:border-primary/60 bg-transparent px-8 py-4 text-base font-semibold text-foreground hover:bg-accent/20 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
              >
                {t('hero.requestPrice')}
              </button>
            </div>
          </div>

          {/* Dynamic Creative Hero Image Showcase */}
          <div className="lg:col-span-6 flex flex-col items-center w-full relative space-y-4">
            
            {/* Main Showcase Frame */}
            <div
              className="relative w-full max-w-lg lg:max-w-none aspect-[4/3] sm:aspect-[16/11] lg:aspect-[4/5] rounded-none overflow-hidden shadow-2xl border-4 border-card/90 dark:border-card/30 transition-all duration-500 group bg-black/40"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Dynamic Image Cross-Fade Stack */}
              {images.map((imgUrl, idx) => {
                const isActive = idx === currentIndex;
                return (
                  <img
                    key={imgUrl + idx}
                    src={imgUrl}
                    alt={`Queen's Bakery Creation ${idx + 1}`}
                    className={`absolute inset-0 h-full w-full object-cover transition-all duration-1000 rounded-none transform ${
                      isActive ? 'opacity-100 scale-105 z-10' : 'opacity-0 scale-100 z-0'
                    }`}
                    loading={idx === 0 ? 'eager' : 'lazy'}
                  />
                );
              })}

              {/* Gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent z-20 pointer-events-none" />

              {/* Top Left Live Badge */}
              <div className="absolute top-4 left-4 z-30 flex items-center gap-2 rounded-none bg-background/85 backdrop-blur-md px-3.5 py-1.5 border border-white/20 shadow-md">
                <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-[11px] font-semibold tracking-wider text-foreground uppercase">
                  Featured Creations
                </span>
              </div>

              {/* Top Right Counter Badge */}
              {images.length > 0 && (
                <div className="absolute top-4 right-4 z-30 flex items-center gap-1.5 rounded-none bg-black/60 backdrop-blur-md px-3 py-1 border border-white/20 text-white text-xs font-mono">
                  <span className="font-bold text-primary">{String(currentIndex + 1).padStart(2, '0')}</span>
                  <span className="text-white/50">/</span>
                  <span>{String(images.length).padStart(2, '0')}</span>
                </div>
              )}

              {/* Left/Right Arrow Controls */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={handlePrev}
                    className="absolute left-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-none bg-background/70 backdrop-blur-md text-foreground border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-primary-foreground cursor-pointer shadow-lg"
                    aria-label="Previous image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
                    </svg>
                  </button>
                  <button
                    onClick={handleNext}
                    className="absolute right-3 top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center rounded-none bg-background/70 backdrop-blur-md text-foreground border border-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 hover:bg-primary hover:text-primary-foreground cursor-pointer shadow-lg"
                    aria-label="Next image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
                    </svg>
                  </button>
                </>
              )}

              {/* Bottom Glass Content Card & Progress Indicator */}
              <div className="absolute bottom-4 left-4 right-4 z-30 flex flex-col gap-3 rounded-none bg-background/85 backdrop-blur-md p-4 border border-white/20 shadow-xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-none bg-primary text-primary-foreground font-serif font-bold text-lg">
                      🎂
                    </div>
                    <div>
                      <p className="font-serif text-xs md:text-sm font-bold text-foreground">Artisanal Bakery & Gateaux</p>
                      <p className="text-[11px] text-muted-foreground">Handcrafted with premium ingredients</p>
                    </div>
                  </div>

                  <Link
                    href="/our-creations"
                    className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary/80 transition-colors underline-offset-4 hover:underline"
                  >
                    <span>View All</span>
                    <span>➔</span>
                  </Link>
                </div>

                {/* Progress bar line */}
                {images.length > 1 && (
                  <div className="w-full bg-border/60 h-1 rounded-none overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-500"
                      style={{ width: `${((currentIndex + 1) / images.length) * 100}%` }}
                    />
                  </div>
                )}
              </div>

            </div>

            {/* Interactive Dynamic Thumbnail Ribbon */}
            {images.length > 1 && (
              <div className="flex items-center justify-center gap-2 overflow-x-auto w-full max-w-lg lg:max-w-none py-1 scrollbar-none">
                {images.slice(0, 7).map((imgUrl, idx) => (
                  <button
                    key={imgUrl + idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative h-12 w-16 sm:h-14 sm:w-20 shrink-0 rounded-none overflow-hidden border-2 transition-all duration-300 cursor-pointer ${
                      idx === currentIndex
                        ? 'border-primary scale-105 shadow-md ring-2 ring-primary/40'
                        : 'border-border/60 opacity-60 hover:opacity-100 hover:border-primary/50'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="h-full w-full object-cover rounded-none"
                    />
                  </button>
                ))}
                
                {images.length > 7 && (
                  <Link
                    href="/our-creations"
                    className="flex h-12 w-16 sm:h-14 sm:w-20 shrink-0 items-center justify-center rounded-none border border-dashed border-border/80 bg-accent/20 text-xs font-semibold text-muted-foreground hover:text-primary hover:border-primary transition-colors text-center px-1"
                  >
                    +{images.length - 7} More
                  </Link>
                )}
              </div>
            )}

          </div>

        </div>
      </div>
    </section>
  );
}
