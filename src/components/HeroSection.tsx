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
    <section
      id="home"
      className="relative overflow-hidden min-h-[600px] md:min-h-[680px] lg:min-h-[740px] flex items-center justify-center transition-colors duration-300"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* 1. Background Animated Image Slideshow */}
      <div className="absolute inset-0 -z-20 overflow-hidden bg-[#160B0E]">
        {images.map((imgUrl, idx) => {
          const isActive = idx === currentIndex;
          return (
            <div
              key={imgUrl + idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
              }`}
            >
              <img
                src={imgUrl}
                alt={`Queen's Bakery Creation ${idx + 1}`}
                className={`h-full w-full object-cover object-center transition-transform duration-[7000ms] ease-out motion-reduce:transform-none ${
                  isActive ? 'scale-105' : 'scale-100'
                }`}
                loading={idx === 0 ? 'eager' : 'lazy'}
              />
            </div>
          );
        })}
      </div>

      {/* 2. Layered Multi-Stop Dark & Warm Cocoa Gradient Overlays */}
      <div className="absolute inset-0 -z-10 bg-black/60 pointer-events-none" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-r from-black/90 via-black/75 to-black/50 pointer-events-none" />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-[#160B0E] via-transparent to-black/70 pointer-events-none" />

      {/* 3. Foreground Hero Text & Call to Action Content */}
      <div className="relative z-20 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-20 md:py-28 lg:py-32 w-full">
        <div className="max-w-2xl sm:max-w-3xl flex flex-col items-center lg:items-start text-center lg:text-left space-y-6 md:space-y-8">
          
          {/* Subtitle Badge */}
          <div className="inline-flex items-center gap-2 rounded-none bg-black/40 backdrop-blur-md px-4 py-2 text-xs font-semibold text-rose-200 border border-white/20 tracking-wide uppercase shadow-sm">
            <span>✨</span>
            <span>{t('hero.subtitle')}</span>
          </div>
          
          {/* Main Title */}
          <h1 className="font-serif text-4xl sm:text-6xl lg:text-7xl font-bold tracking-tight text-white leading-[1.08] drop-shadow-md">
            {t('hero.title')}
          </h1>
          
          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl font-light text-stone-200 max-w-2xl leading-relaxed drop-shadow-sm">
            {t('hero.description')}
          </p>

          {/* Feature Highlights Bar */}
          <div className="grid grid-cols-3 gap-3 w-full max-w-lg bg-black/40 backdrop-blur-md border border-white/20 p-4 my-2 shadow-lg">
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="font-serif text-lg md:text-xl font-bold text-primary">100%</span>
              <span className="text-[11px] font-medium text-stone-300">Fresh Daily</span>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left border-x border-white/20 px-3">
              <span className="font-serif text-lg md:text-xl font-bold text-primary">Custom</span>
              <span className="text-[11px] font-medium text-stone-300">Designs</span>
            </div>
            <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
              <span className="font-serif text-lg md:text-xl font-bold text-primary">Regional</span>
              <span className="text-[11px] font-medium text-stone-300">Delivery</span>
            </div>
          </div>

          {/* Call to Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto pt-2">
            <a
              href="#products"
              className="flex items-center justify-center rounded-none bg-primary hover:bg-primary/90 text-white px-8 py-4 text-base font-semibold shadow-xl hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {t('hero.explore')}
            </a>
            <button
              onClick={() => setInquiryModalOpen(true)}
              className="flex items-center justify-center rounded-none border-2 border-white/30 hover:border-white/70 bg-black/30 hover:bg-black/50 text-white px-8 py-4 text-base font-semibold backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              {t('hero.requestPrice')}
            </button>
          </div>

        </div>
      </div>

      {/* 4. Slideshow Controls & Dot Indicators */}
      {images.length > 1 && (
        <div className="absolute bottom-6 right-6 sm:right-10 z-20 flex items-center gap-3 bg-black/50 backdrop-blur-md px-4 py-2 border border-white/20">
          <button
            onClick={handlePrev}
            className="text-stone-300 hover:text-white transition-colors p-1"
            aria-label="Previous background image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Slide Dots */}
          <div className="flex items-center gap-1.5">
            {images.slice(0, 7).map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                aria-label={`Jump to slide ${idx + 1}`}
                className={`h-2 transition-all duration-300 rounded-none cursor-pointer ${
                  idx === currentIndex
                    ? 'w-6 bg-primary'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="text-stone-300 hover:text-white transition-colors p-1"
            aria-label="Next background image"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
