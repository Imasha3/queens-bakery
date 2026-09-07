'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { galleryData, GalleryItemData } from '@/data/gallery';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore/lite';

export default function CreationsSection() {
  const { language } = useApp();
  const [items, setItems] = useState<GalleryItemData[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Fetch active creations from Firestore with static fallback
  useEffect(() => {
    const fetchCreations = async () => {
      try {
        const q = query(
          collection(db, 'creations'),
          where('active', '==', true)
        );
        const snap = await getDocs(q);
        if (snap.size > 0) {
          const fetched: GalleryItemData[] = [];
          snap.forEach((docSnap) => {
            const data = docSnap.data();
            fetched.push({
              id: docSnap.id,
              images: Array.isArray(data.images)
                ? data.images
                : [data.imageUrl || data.image || ''],
              aspectRatio: data.aspectRatio || 'aspect-[4/3]',
            });
          });
          setItems(fetched);
        } else {
          setItems(galleryData);
        }
      } catch (err) {
        console.error('Error loading creations from Firestore:', err);
        setItems(galleryData);
      }
    };

    fetchCreations();
  }, []);

  // Autoplay slow horizontal scroll (paused on hover)
  useEffect(() => {
    if (isHovered || items.length === 0) return;

    const interval = setInterval(() => {
      if (scrollRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
        const maxScroll = scrollWidth - clientWidth;
        const nextScroll = scrollLeft + 340;

        if (nextScroll >= maxScroll - 10) {
          scrollRef.current.scrollTo({ left: 0, behavior: 'smooth' });
        } else {
          scrollRef.current.scrollTo({ left: nextScroll, behavior: 'smooth' });
        }
      }
    }, 3800);

    return () => clearInterval(interval);
  }, [isHovered, items.length]);

  const handleScrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -360, behavior: 'smooth' });
    }
  };

  const handleScrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 360, behavior: 'smooth' });
    }
  };

  return (
    <section
      id="creations"
      className="py-16 md:py-24 bg-card/60 transition-colors duration-300 relative overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Section Header with Arrows */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-12 gap-6">
          <div className="text-center sm:text-left space-y-2 max-w-2xl">
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">
              {language === 'en' ? 'Artisanal Gallery' : 'ඡායාරූප ගැලරිය'}
            </span>
            <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
              {language === 'en' ? 'Our Creations' : 'අපගේ නිර්මාණ'}
            </h2>
            <p className="text-xs md:text-sm font-light text-muted-foreground">
              {language === 'en'
                ? 'Handcrafted custom gateaux, delicate savouries, and celebration arrangements.'
                : 'අපගේ විශේෂ නිර්මාණ සහ අලංකාර බේකරි නිෂ්පාදන.'}
            </p>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleScrollLeft}
              className="flex items-center justify-center w-11 h-11 rounded-full border border-border/80 bg-background hover:bg-accent text-foreground transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
              aria-label="Previous Creation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
            </button>
            <button
              onClick={handleScrollRight}
              className="flex items-center justify-center w-11 h-11 rounded-full border border-border/80 bg-background hover:bg-accent text-foreground transition-all duration-200 shadow-sm active:scale-95 cursor-pointer"
              aria-label="Next Creation"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Container */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-none pb-4 pt-1 snap-x snap-mandatory touch-pan-x"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((item, idx) => {
            const primaryImg =
              Array.isArray(item.images) && item.images.length > 0 && typeof item.images[0] === 'string'
                ? item.images[0].trim()
                : '';

            if (!primaryImg) return null;

            return (
              <div
                key={item.id || idx}
                onClick={() => setActiveIdx(idx)}
                className="flex-shrink-0 w-72 sm:w-80 md:w-96 aspect-[4/3] rounded-none overflow-hidden bg-accent/20 border border-border/80 shadow-md hover:shadow-xl transition-all duration-500 group cursor-pointer relative snap-start hover:-translate-y-1"
              >
                {/* Gradient tint */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-300 z-10" />

                <img
                  src={primaryImg}
                  alt="Queen's Bakery Creation"
                  className="w-full h-full object-cover transform scale-100 group-hover:scale-108 transition-transform duration-700 rounded-none"
                  loading="lazy"
                />

                {/* Corner Hover Icon */}
                <div className="absolute bottom-4 right-4 z-20 flex h-9 w-9 items-center justify-center rounded-none bg-background/80 backdrop-blur-md text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                  </svg>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Lightbox / Modal Preview */}
      {activeIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="absolute inset-0" onClick={() => setActiveIdx(null)} />

          <button
            onClick={() => setActiveIdx(null)}
            className="absolute top-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          <button
            onClick={() => setActiveIdx((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null))}
            className="absolute left-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Previous Creation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          <div className="relative max-w-4xl max-h-[85vh] z-40 p-2">
            {typeof items[activeIdx]?.images?.[0] === 'string' && items[activeIdx].images[0].trim() !== '' ? (
              <img
                src={items[activeIdx].images[0].trim()}
                alt="Queen's Bakery Creation Large Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-none border border-white/10 shadow-2xl bg-black"
              />
            ) : null}
          </div>

          <button
            onClick={() => setActiveIdx((prev) => (prev !== null ? (prev + 1) % items.length : null))}
            className="absolute right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Next Creation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>
        </div>
      )}
    </section>
  );
}
