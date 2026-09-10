'use client';

import React from 'react';

// Celebration Cake SVG for Admin Dashboard Hero & Accents
export function CelebrationCakeSVG({ className = "w-24 h-24" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Plate */}
      <ellipse cx="60" cy="100" rx="48" ry="8" fill="#e2e8f0" fillOpacity="0.1" stroke="#ec4899" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* Bottom Layer */}
      <rect x="25" y="65" width="70" height="30" rx="4" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
      <path d="M25 75 Q32 82 40 75 Q48 82 56 75 Q64 82 72 75 Q80 82 88 75 Q95 82 95 75" fill="none" stroke="#f472b6" strokeWidth="2.5" strokeLinecap="round" />
      {/* Middle Layer */}
      <rect x="35" y="42" width="50" height="23" rx="3" fill="#0f172a" stroke="#ec4899" strokeWidth="2" />
      <path d="M35 50 Q41 55 48 50 Q55 55 62 50 Q69 55 76 50 Q83 55 85 50" fill="none" stroke="#fb7185" strokeWidth="2" strokeLinecap="round" />
      {/* Top Layer / Frosting */}
      <path d="M40 42 C40 38 45 35 60 35 C75 35 80 38 80 42 Z" fill="#ec4899" fillOpacity="0.3" stroke="#ec4899" strokeWidth="1.5" />
      {/* Candles */}
      <line x1="48" y1="35" x2="48" y2="22" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="48" cy="18" r="3" fill="#fbbf24" className="animate-pulse" />
      <line x1="60" y1="35" x2="60" y2="18" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="60" cy="14" r="3.5" fill="#fbbf24" className="animate-pulse" />
      <line x1="72" y1="35" x2="72" y2="22" stroke="#f43f5e" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="72" cy="18" r="3" fill="#fbbf24" className="animate-pulse" />
      {/* Berries / Cherries */}
      <circle cx="38" cy="42" r="3.5" fill="#e11d48" />
      <circle cx="82" cy="42" r="3.5" fill="#e11d48" />
      {/* Sparkles */}
      <path d="M18 45 L20 40 L22 45 L27 47 L22 49 L20 54 L18 49 L13 47 Z" fill="#fbbf24" fillOpacity="0.8" />
      <path d="M98 30 L99 26 L100 30 L104 31 L100 32 L99 36 L98 32 L94 31 Z" fill="#fbbf24" fillOpacity="0.8" />
    </svg>
  );
}

// Cupcake SVG Accent
export function CupcakeSVG({ className = "w-12 h-12" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      {/* Cup Wrapper */}
      <path d="M16 36 L20 56 C20 57.5 21.5 58 23 58 L41 58 C42.5 58 44 57.5 44 56 L48 36 Z" fill="#1e293b" stroke="#ec4899" strokeWidth="2" />
      <line x1="24" y1="36" x2="26" y2="58" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="32" y1="36" x2="32" y2="58" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.4" />
      <line x1="40" y1="36" x2="38" y2="58" stroke="#ec4899" strokeWidth="1" strokeOpacity="0.4" />
      {/* Frosting Swirl */}
      <path d="M14 36 C14 28 20 24 24 24 C24 20 29 16 32 16 C35 16 40 20 40 24 C44 24 50 28 50 36 Z" fill="#f472b6" fillOpacity="0.3" stroke="#f472b6" strokeWidth="2" />
      {/* Cherry on top */}
      <circle cx="32" cy="12" r="4" fill="#e11d48" />
      <path d="M32 8 C34 4 38 4 40 2" stroke="#e11d48" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

// Chef Hat SVG Accent
export function ChefHatSVG({ className = "w-6 h-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M6 13.8a4.5 4.5 0 1 1 .9-8.7 5 5 0 0 1 10.2 0 4.5 4.5 0 1 1 .9 8.7" />
      <path d="M6 14h12v4a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1v-4z" />
      <line x1="6" y1="17" x2="18" y2="17" />
    </svg>
  );
}

// Premium Bakery Order Journey Illustration (How to Order Page)
export function OrderJourneyIllustration({ className = "w-full h-auto" }: { className?: string }) {
  return (
    <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <defs>
        <linearGradient id="bg-grad-1" x1="0" y1="0" x2="500" y2="400" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.12" />
          <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="gold-grad-1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#f59e0b" />
          <stop offset="100%" stopColor="#fbbf24" />
        </linearGradient>
      </defs>

      {/* Background Glow */}
      <circle cx="250" cy="200" r="170" fill="url(#bg-grad-1)" />

      {/* Dotted Order Connection Line */}
      <path d="M80 300 Q 250 150 420 300" fill="none" stroke="var(--primary)" strokeWidth="2.5" strokeDasharray="6 6" opacity="0.4" />

      {/* Centerpiece: Celebration Cake */}
      <g className="filter drop-shadow-xl">
        {/* Cake Stand Base */}
        <ellipse cx="250" cy="285" rx="75" ry="14" fill="#e2e8f0" className="fill-muted stroke-primary/30" strokeWidth="1.5" />
        <path d="M242 285 L240 320 L260 320 L258 285 Z" className="fill-primary/20 stroke-primary/40" strokeWidth="1.5" />
        <ellipse cx="250" cy="320" rx="35" ry="8" className="fill-primary/30 stroke-primary/50" strokeWidth="1.5" />

        {/* Cake Tier 1 (Bottom) */}
        <rect x="185" y="210" width="130" height="70" rx="4" className="fill-card stroke-primary" strokeWidth="2" />
        <path d="M185 235 C 215 250, 285 250, 315 235" fill="none" className="stroke-primary/40" strokeWidth="2" />
        {/* Frosting Drips */}
        <path d="M185 210 Q 195 230 205 210 Q 215 225 225 210 Q 235 235 245 210 Q 255 225 265 210 Q 275 235 285 210 Q 295 225 305 210 Q 315 230 315 210 Z" className="fill-primary/20 stroke-primary" strokeWidth="1.5" />

        {/* Cake Tier 2 (Top) */}
        <rect x="205" y="150" width="90" height="60" rx="3" className="fill-card stroke-primary" strokeWidth="2" />
        <path d="M205 150 Q 215 168 225 150 Q 235 165 245 150 Q 255 170 265 150 Q 275 165 285 150 Q 295 168 295 150 Z" className="fill-primary/30 stroke-primary" strokeWidth="1.5" />

        {/* Decorative Berries & Topper Candle */}
        <circle cx="215" cy="150" r="5" fill="#f43f5e" />
        <circle cx="285" cy="150" r="5" fill="#f43f5e" />
        <circle cx="242" cy="92" r="2.5" fill="#facc15" />
        <circle cx="250" cy="102" r="2.5" fill="#facc15" />
        <circle cx="258" cy="92" r="2.5" fill="#facc15" />
        <path d="M250 92 L250 72" className="stroke-amber-500" strokeWidth="2.5" strokeLinecap="round" />
        {/* Flame */}
        <path d="M250 72 Q245 64 250 55 Q255 64 250 72 Z" fill="url(#gold-grad-1)" className="animate-pulse" />
      </g>

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

// Premium Bakery Contact & Customer Care Illustration (Contact Page)
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

