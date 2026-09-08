'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { OrderJourneyIllustration } from '@/components/BakeryIllustrations';

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
      {/* Decorative background aura SVG elements */}
      <div className="absolute top-10 right-10 opacity-20 pointer-events-none -z-0">
        <svg width="240" height="240" viewBox="0 0 100 100" fill="none">
          <circle cx="50" cy="50" r="40" className="stroke-primary" strokeWidth="1" strokeDasharray="4 4" />
        </svg>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        
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

        {/* Balanced Grid: 5 Steps on Left / Large Illustration on Right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          
          {/* Left Column: 5 Steps Cards Stack */}
          <div className="lg:col-span-7 space-y-4">
            {steps.map((step, idx) => (
              <div
                key={step.num}
                className="relative flex flex-col sm:flex-row items-start sm:items-center gap-5 p-5 sm:p-6 rounded-none bg-card border border-border/80 shadow-sm hover:shadow-md hover:border-primary/50 transition-all duration-300 group"
              >
                {/* Step Number Badge */}
                <div className="flex-shrink-0 flex items-center justify-center w-12 h-12 rounded-none bg-primary/10 text-primary font-serif font-bold text-lg group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  {step.num}
                </div>

                {/* Icon & Title Container */}
                <div className="flex-grow space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-primary text-sm">{step.icon}</span>
                    <h3 className="font-serif text-base font-bold text-foreground group-hover:text-primary transition-colors">
                      {step.title}
                    </h3>
                  </div>
                  <p className="text-xs font-light text-muted-foreground leading-relaxed">
                    {step.desc}
                  </p>
                </div>

                {/* Optional Step Connector Line indicator */}
                {idx < steps.length - 1 && (
                  <div className="hidden sm:block absolute left-11 -bottom-4 w-[2px] h-4 bg-primary/20" />
                )}
              </div>
            ))}
          </div>

          {/* Right Column: Premium Bakery Order Illustration Card */}
          <div className="lg:col-span-5 flex flex-col items-center">
            <div className="w-full bg-card border border-border/80 p-6 sm:p-8 rounded-none shadow-md space-y-6 relative overflow-hidden group">
              
              {/* Illustration Title Banner */}
              <div className="flex items-center justify-between border-b border-border/60 pb-3">
                <span className="text-xs font-bold font-serif tracking-wider uppercase text-foreground">
                  🎂 Order Preparation Journey
                </span>
                <span className="text-[10px] font-semibold bg-primary/10 text-primary px-2.5 py-0.5 rounded-none border border-primary/20">
                  Queen's Bakery
                </span>
              </div>

              {/* Vector SVG Illustration */}
              <div className="w-full max-w-sm mx-auto transition-transform duration-500 group-hover:scale-102">
                <OrderJourneyIllustration />
              </div>

              {/* Decorative Quality Badges */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="flex items-center gap-2 p-3 bg-accent/20 border border-border/60 rounded-none text-xs text-foreground/90">
                  <span className="text-primary font-bold">✓</span>
                  <span>100% Fresh Daily</span>
                </div>
                <div className="flex items-center gap-2 p-3 bg-accent/20 border border-border/60 rounded-none text-xs text-foreground/90">
                  <span className="text-primary font-bold">✓</span>
                  <span>Handcrafted Bakes</span>
                </div>
              </div>

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
