'use client';

import React from 'react';

interface LogoProps {
  className?: string;
  heightClass?: string;
}

export default function Logo({ className = '', heightClass = 'h-12 sm:h-14 md:h-16' }: LogoProps) {
  return (
    <div className={`flex items-center justify-center group cursor-pointer ${className}`}>
      <div className="relative flex items-center justify-center p-1 rounded-2xl transition-all duration-300">
        <img
          src="/logo.png"
          alt="Queen's Bakery Logo"
          className={`${heightClass} w-auto max-w-full object-contain filter drop-shadow-sm transition-transform duration-300 group-hover:scale-105`}
          loading="eager"
        />
      </div>
    </div>
  );
}
