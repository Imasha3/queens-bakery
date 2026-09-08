'use client';

import React from 'react';

// Premium Bakery Order Journey Illustration
export function OrderJourneyIllustration({ className = "w-full h-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="cake-grad-1" x1="100" y1="100" x2="400" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.04" />
        </linearGradient>
        <linearGradient id="gold-grad-1" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fef08a" />
          <stop offset="100%" stopColor="#fde047" />
        </linearGradient>
      </defs>

      {/* Decorative background aura circles */}
      <circle cx="250" cy="210" r="180" fill="url(#cake-grad-1)" />
      <circle cx="390" cy="90" r="45" className="fill-primary/10 animate-pulse" />
      <circle cx="90" cy="320" r="60" className="fill-primary/10" />

      {/* Bakery Stand Base */}
      <ellipse cx="250" cy="360" rx="140" ry="22" className="fill-muted-foreground/20" />
      <path d="M160 355 C160 340, 340 340, 340 355 L320 365 C320 375, 180 375, 180 365 Z" className="fill-card stroke-primary/30" strokeWidth="2" />
      <rect x="235" y="315" width="30" height="40" rx="2" className="fill-primary/25 stroke-primary/50" strokeWidth="1.5" />
      <ellipse cx="250" cy="315" rx="110" ry="16" className="fill-card stroke-primary/40" strokeWidth="2" />

      {/* 3-Tiered Celebration Cake */}
      {/* Tier 1 (Bottom) */}
      <path d="M165 240 L165 305 C165 315, 335 315, 335 305 L335 240 Z" className="fill-primary/15 stroke-primary/50" strokeWidth="2" />
      <ellipse cx="250" cy="240" rx="85" ry="14" className="fill-card stroke-primary/40" strokeWidth="2" />
      {/* Frosting Drips Tier 1 */}
      <path d="M165 240 Q175 258 185 240 Q195 262 205 240 Q215 255 225 240 Q235 265 245 240 Q255 255 265 240 Q275 262 285 240 Q295 255 305 240 Q315 260 325 240 Q330 250 335 240" fill="none" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />

      {/* Tier 2 (Middle) */}
      <path d="M185 175 L185 232 C185 240, 315 240, 315 232 L315 175 Z" className="fill-card stroke-primary/60" strokeWidth="2" />
      <ellipse cx="250" cy="175" rx="65" ry="12" className="fill-primary/20 stroke-primary/40" strokeWidth="2" />
      {/* Decorative Dots on Tier 2 */}
      <circle cx="210" cy="205" r="4" className="fill-primary" />
      <circle cx="230" cy="210" r="4" className="fill-primary" />
      <circle cx="250" cy="212" r="4" className="fill-primary" />
      <circle cx="270" cy="210" r="4" className="fill-primary" />
      <circle cx="290" cy="205" r="4" className="fill-primary" />

      {/* Tier 3 (Top) */}
      <path d="M205 120 L205 168 C205 174, 295 174, 295 168 L295 120 Z" className="fill-primary/25 stroke-primary" strokeWidth="2" />
      <ellipse cx="250" cy="120" rx="45" ry="9" className="fill-card stroke-primary" strokeWidth="2" />

      {/* Cake Topper - Crown & Candle */}
      <path d="M238 115 L242 95 L250 105 L258 95 L262 115 Z" className="fill-primary stroke-primary" strokeWidth="1.5" strokeLinejoin="round" />
      <circle cx="242" cy="92" r="2.5" fill="#facc15" />
      <circle cx="250" cy="102" r="2.5" fill="#facc15" />
      <circle cx="258" cy="92" r="2.5" fill="#facc15" />
      <path d="M250 92 L250 72" className="stroke-amber-500" strokeWidth="2.5" strokeLinecap="round" />
      {/* Flame */}
      <path d="M250 72 Q245 64 250 55 Q255 64 250 72 Z" fill="url(#gold-grad-1)" className="animate-pulse" />

      {/* Left Side Floating Order Checklist Parchment */}
      <g className="filter drop-shadow-lg transform -rotate-6">
        <rect x="45" y="100" width="105" height="135" rx="2" className="fill-card stroke-primary/50" strokeWidth="2" />
        <path d="M60 120 L135 120" className="stroke-primary" strokeWidth="3" strokeLinecap="round" />
        
        {/* Checkmarks */}
        <circle cx="68" cy="142" r="7" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
        <path d="M65 142 L67 144 L71 140" fill="none" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
        <path d="M82 142 L135 142" className="stroke-muted-foreground/60" strokeWidth="2.5" strokeLinecap="round" />

        <circle cx="68" cy="167" r="7" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
        <path d="M65 167 L67 169 L71 165" fill="none" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
        <path d="M82 167 L130 167" className="stroke-muted-foreground/60" strokeWidth="2.5" strokeLinecap="round" />

        <circle cx="68" cy="192" r="7" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />
        <path d="M65 192 L67 194 L71 190" fill="none" className="stroke-primary" strokeWidth="2" strokeLinecap="round" />
        <path d="M82 192 L125 192" className="stroke-muted-foreground/60" strokeWidth="2.5" strokeLinecap="round" />
      </g>

      {/* Right Side Floating Bakery Gift Box */}
      <g className="filter drop-shadow-lg transform rotate-6">
        <rect x="350" y="220" width="100" height="85" rx="2" className="fill-primary/20 stroke-primary" strokeWidth="2" />
        <path d="M340 210 L460 210 L460 225 L340 225 Z" className="fill-primary stroke-primary" strokeWidth="1.5" />
        <rect x="392" y="210" width="16" height="95" className="fill-primary/80" />
        <path d="M380 195 C360 180, 390 205, 400 208 C410 205, 440 180, 420 195 C410 202, 390 202, 380 195 Z" className="fill-primary stroke-primary/80" strokeWidth="1.5" />
        <circle cx="400" cy="208" r="5" fill="#facc15" />
      </g>

      {/* Floating Sparkle Accents */}
      <text x="65" y="75" className="fill-primary text-xl font-bold font-serif">✦</text>
      <text x="415" y="135" className="fill-primary text-lg font-bold font-serif">✦</text>
    </svg>
  );
}

// Premium Bakery Contact & Customer Care Illustration
export function ContactShowcaseIllustration({ className = "w-full h-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 420" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bg-grad-contact-1" x1="0" y1="0" x2="500" y2="420" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.15" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.03" />
        </linearGradient>
      </defs>

      {/* Background Soft Circle */}
      <circle cx="250" cy="210" r="175" fill="url(#bg-grad-contact-1)" />

      {/* Bakery Shop Counter Display Stand */}
      <rect x="70" y="280" width="360" height="90" rx="2" className="fill-card stroke-primary/40" strokeWidth="2" />
      <rect x="60" y="270" width="380" height="15" rx="1" className="fill-primary/20 stroke-primary/50" strokeWidth="1.5" />
      <path d="M100 285 L400 285" className="stroke-border/80" strokeWidth="2" strokeDasharray="6 6" />

      {/* Glass Dome / Cloche Display on Counter Left */}
      <ellipse cx="160" cy="265" rx="55" ry="10" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
      <rect x="135" y="230" width="50" height="35" rx="2" className="fill-primary/30 stroke-primary" strokeWidth="1.5" />
      <ellipse cx="160" cy="230" rx="25" ry="6" className="fill-card stroke-primary" strokeWidth="1.5" />
      <circle cx="160" cy="222" r="4" fill="#f43f5e" />
      <path d="M105 265 C105 180, 215 180, 215 265 Z" className="fill-primary/5 stroke-primary/40" strokeWidth="2" />
      <circle cx="160" cy="180" r="8" className="fill-primary/40 stroke-primary" strokeWidth="1.5" />

      {/* Cupcake Stand on Right */}
      <rect x="310" y="240" width="60" height="30" rx="2" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
      {/* Cupcake 1 */}
      <path d="M305 240 L310 220 L325 220 L330 240 Z" className="fill-amber-900/20 stroke-primary/60" strokeWidth="1.5" />
      <path d="M305 220 Q317.5 200 330 220 Z" className="fill-primary/40 stroke-primary" strokeWidth="1.5" />
      <circle cx="317.5" cy="205" r="3" fill="#f43f5e" />

      {/* Cupcake 2 */}
      <path d="M345 240 L350 220 L365 220 L370 240 Z" className="fill-amber-900/20 stroke-primary/60" strokeWidth="1.5" />
      <path d="M345 220 Q357.5 200 370 220 Z" className="fill-primary/40 stroke-primary" strokeWidth="1.5" />
      <circle cx="357.5" cy="205" r="3" fill="#f43f5e" />

      {/* Center Floating Customer Service & Inquiry Card */}
      <g className="filter drop-shadow-xl">
        <rect x="180" y="80" width="140" height="110" rx="2" className="fill-card stroke-primary" strokeWidth="2" />
        <path d="M180 80 L320 80 L320 112 L180 112 Z" className="fill-primary/10" />

        {/* Envelope Icon */}
        <circle cx="250" cy="128" r="22" className="fill-primary" />
        <path d="M238 121 L250 131 L262 121 M238 135 L262 135" fill="none" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* Text lines */}
        <rect x="205" y="160" width="90" height="6" rx="1" className="fill-primary/80" />
        <rect x="220" y="172" width="60" height="5" rx="1" className="fill-muted-foreground/40" />
      </g>

      {/* Chat Speech Bubbles */}
      <g className="filter drop-shadow-md">
        <rect x="65" y="70" width="95" height="45" rx="2" className="fill-primary" />
        <path d="M95 115 L85 128 L105 115 Z" className="fill-primary" />
        <text x="77" y="97" fill="#ffffff" className="text-[11px] font-serif font-bold">Inquire Now</text>
      </g>

      <g className="filter drop-shadow-md">
        <rect x="340" y="100" width="95" height="45" rx="2" className="fill-card stroke-primary/60" strokeWidth="1.5" />
        <path d="M360 145 L350 155 L370 145 Z" className="fill-card stroke-primary/60" strokeWidth="1.5" />
        <text x="352" y="127" className="fill-primary text-[11px] font-sans font-semibold">Fresh Bakes 🍰</text>
      </g>

      {/* Floating Sparkles & Hearts */}
      <path d="M245 40 Q250 30 255 40 Q265 45 255 50 Q250 60 245 50 Q235 45 245 40 Z" fill="#facc15" />
      <path d="M410 40 Q413 32 417 40 Q425 43 417 47 Q413 55 410 47 Q402 43 410 40 Z" className="fill-primary" />
    </svg>
  );
}

// Decorative Whisk & Rolling Pin Icon Accent
export function WhiskRollingPinIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M4 20L10 14M20 4L14 10" className="stroke-current" strokeWidth="1.8" strokeLinecap="round" />
      <rect x="8.5" y="8.5" width="7" height="7" transform="rotate(45 12 12)" className="fill-current opacity-20 stroke-current" strokeWidth="1.5" />
    </svg>
  );
}

// Decorative Bakery Box Icon Accent
export function BakeryBoxIcon({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M3 8L12 3L21 8V18L12 21L3 18V8Z" className="stroke-current" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M12 3V21M3 8L12 13L21 8" className="stroke-current" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
