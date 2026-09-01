'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { galleryData, GalleryItemData } from '@/data/gallery';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InquiryModal from '@/components/InquiryModal';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore/lite';

// Reusable Gallery Item Card with Hover Zoom and Image Cycling logic
interface GalleryCardProps {
  item: GalleryItemData;
  onClick: () => void;
}

function GalleryCard({ item, onClick }: GalleryCardProps) {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!isHovered || item.images.length <= 1) return;

    // Cycle images every 1.5 seconds on hover
    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % item.images.length);
    }, 1500);

    return () => clearInterval(interval);
  }, [isHovered, item.images]);

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setCurrentIdx(0); // Reset back to first image when leaving
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`relative w-full ${item.aspectRatio} overflow-hidden cursor-pointer bg-accent/25 border border-border/80 shadow-sm hover:shadow-lg transition-all duration-300 rounded-none group mb-4`}
    >
      {/* Dark tint overlay on hover */}
      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition-colors duration-500 z-10" />

      {/* Render images absolutely to enable cross-fade transitions */}
      {item.images.filter(img => typeof img === 'string' && img.trim() !== '').map((img, idx) => {
        const isCurrent = idx === currentIdx;
        return (
          <img
            key={img}
            src={img.trim()}
            alt="Queen's Bakery Creation"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 rounded-none transform scale-100 group-hover:scale-105 ${
              isCurrent ? 'opacity-100 z-20' : 'opacity-0 z-0'
            }`}
            loading="lazy"
          />
        );
      })}
    </div>
  );
}

export default function OurCreationsPage() {
  const { language } = useApp();
  
  // Load active creations from Firestore with static galleryData fallback
  const [items, setItems] = useState<GalleryItemData[]>([]);
  const [activeIdx, setActiveIdx] = useState<number | null>(null);

  useEffect(() => {
    const fetchCreations = async () => {
      try {
        const q = query(
          collection(db, "creations"),
          where("active", "==", true)
        );
        const snap = await getDocs(q);
        if (snap.size > 0) {
          const fetched: GalleryItemData[] = [];
          snap.forEach((doc) => {
            const data = doc.data();
            fetched.push({
              id: doc.id,
              images: Array.isArray(data.images) ? data.images : [data.imageUrl || data.image || ""],
              aspectRatio: data.aspectRatio || "aspect-[1/1]"
            });
          });
          setItems(fetched);
        } else {
          setItems(galleryData); // Fallback if no active creations in database
        }
      } catch (err) {
        console.error("Error loading creations from Firestore:", err);
        setItems(galleryData); // Fallback on error
      }
    };

    fetchCreations();
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (activeIdx === null) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveIdx(null);
      } else if (e.key === 'ArrowRight') {
        setActiveIdx((prev) => (prev !== null ? (prev + 1) % items.length : null));
      } else if (e.key === 'ArrowLeft') {
        setActiveIdx((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeIdx, items.length]);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-4">
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">
              {language === 'en' ? 'Visual Gallery' : 'ඡායාරූප ගැලරිය'}
            </span>
            <h1 className="font-serif text-4xl md:text-5xl font-bold tracking-tight text-foreground">
              {language === 'en' ? 'Our Creations' : 'අපගේ නිර්මාණ'}
            </h1>
            <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full" />
          </div>

          {/* Masonry Columns Layout */}
          <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-4 space-y-0">
            {items.map((item, idx) => (
              <div key={item.id} className="break-inside-avoid">
                <GalleryCard
                  item={item}
                  onClick={() => setActiveIdx(idx)}
                />
              </div>
            ))}
          </div>

        </div>
      </main>

      <Footer />
      <InquiryModal />

      {/* Lightbox / Modal Preview */}
      {activeIdx !== null && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
          
          {/* Backdrop Close click */}
          <div className="absolute inset-0" onClick={() => setActiveIdx(null)} />

          {/* Close button X */}
          <button
            onClick={() => setActiveIdx(null)}
            className="absolute top-6 right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close Preview"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Left Arrow */}
          <button
            onClick={() => setActiveIdx((prev) => (prev !== null ? (prev - 1 + items.length) % items.length : null))}
            className="absolute left-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Previous Creation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
            </svg>
          </button>

          {/* Centered Image display */}
          <div className="relative max-w-4xl max-h-[80vh] aspect-auto z-40 animate-in zoom-in-95 duration-200">
            {typeof items[activeIdx]?.images?.[0] === 'string' && items[activeIdx].images[0].trim() !== '' ? (
              <img
                src={items[activeIdx].images[0].trim()} // Always display primary image in full-screen view
                alt="Queen's Bakery Creation Large Preview"
                className="max-w-full max-h-[80vh] object-contain rounded-none border border-white/10 shadow-2xl bg-black"
              />
            ) : null}
          </div>

          {/* Right Arrow */}
          <button
            onClick={() => setActiveIdx((prev) => (prev !== null ? (prev + 1) % items.length : null))}
            className="absolute right-6 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Next Creation"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
            </svg>
          </button>

        </div>
      )}
    </div>
  );
}
