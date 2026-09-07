'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';

export default function HowToOrder() {
  const { t, language } = useApp();

  const steps = [
    {
      num: "01",
      title: language === 'en' ? "Browse Products" : "නිෂ්පාදන ගවේෂණය",
      desc: language === 'en'
        ? "Explore cakes, savouries, desserts, flower bouquets and other available creations in our catalog."
        : "අපගේ කේක්, සේවරි, ඩෙසර්ට් සහ මල් කළඹ එකතුවන් නරඹන්න.",
      badge: "Step 1",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
      )
    },
    {
      num: "02",
      title: language === 'en' ? "Add to Inquiry" : "විමසීම් ලැයිස්තුවට එක් කිරීම",
      desc: language === 'en'
        ? "Select the products you are interested in and add them to your custom inquiry basket."
        : "ඔබට අවශ්‍ය කෑම වර්ග සහ ප්‍රමාණ විමසීම් ලැයිස්තුවට එක් කර ගන්න.",
      badge: "Step 2",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
        </svg>
      )
    },
    {
      num: "03",
      title: language === 'en' ? "Submit Your Request" : "විස්තර ලබා දීම",
      desc: language === 'en'
        ? "Provide your preferred date, delivery location and special customization notes."
        : "අවශ්‍ය දිනය, බෙදාහැරීමේ ස්ථානය සහ විශේෂ අවශ්‍යතා සඳහන් කරන්න.",
      badge: "Step 3",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
        </svg>
      )
    },
    {
      num: "04",
      title: language === 'en' ? "Receive Confirmation" : "තහවුරු කිරීම සහ මිල ගණන්",
      desc: language === 'en'
        ? "Queen's Bakery team reviews your request and contacts you with custom pricing and availability."
        : "අපගේ කණ්ඩායම දිනය පරීක්ෂා කර ඔබව සම්බන්ධ කර ගනිමින් මිල ගණන් තහවුරු කරයි.",
      badge: "Step 4",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
        </svg>
      )
    },
    {
      num: "05",
      title: language === 'en' ? "Order Preparation" : "ආහාර පිළියෙල කිරීම",
      desc: language === 'en'
        ? "Once confirmed, our master bakers prepare your fresh bakes for your scheduled celebration."
        : "තහවුරු කිරීමෙන් පසු, තෝරාගත් දිනයට නැවුම්ව ආහාර පිළියෙල කරනු ලැබේ.",
      badge: "Step 5",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.8} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    }
  ];

  return (
    <section className="py-16 md:py-24 bg-accent/30 transition-colors duration-300 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
          <span className="text-xs font-semibold text-primary tracking-widest uppercase">
            {language === 'en' ? 'Simple Inquiry Process' : 'පහසු ඇණවුම් පියවර'}
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            {t('howToOrder.title')}
          </h2>
          <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full" />
          <p className="text-xs sm:text-sm font-light text-muted-foreground pt-2 max-w-md mx-auto">
            {language === 'en'
              ? 'We operate on a custom quote & availability model to ensure every cake & savoury order is fresh.'
              : 'අපගේ සෑම ආහාරයක්ම නැවුම්ව සැකසීමට විමසීම් පදනම් කරගත් ක්‍රමවේදයක් භාවිතා කෙරේ.'}
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {steps.map((step, idx) => (
            <div
              key={step.num}
              className="relative flex flex-col items-center text-center p-6 rounded-none bg-card border border-border/80 shadow-md hover:shadow-xl hover:border-primary/50 transition-all duration-300 group hover:-translate-y-1"
            >
              {/* Step Connection Line (for desktop) */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute top-14 -right-4 w-8 h-[2px] bg-primary/20 z-10" />
              )}

              {/* Number Pill */}
              <div className="absolute top-4 right-4 rounded-none bg-primary/10 text-primary text-[10px] font-bold px-2.5 py-0.5 border border-primary/20">
                {step.num}
              </div>

              {/* Icon Container */}
              <div className="flex items-center justify-center w-14 h-14 rounded-none bg-primary/10 text-primary mb-5 group-hover:bg-primary group-hover:text-primary-foreground group-hover:scale-110 transition-all duration-300 shadow-sm">
                {step.icon}
              </div>

              {/* Step Content */}
              <h3 className="font-serif text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {step.title}
              </h3>
              
              <p className="text-xs font-light text-muted-foreground leading-relaxed">
                {step.desc}
              </p>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
