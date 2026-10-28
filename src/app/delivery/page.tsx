'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import HowToOrder from '@/components/HowToOrder';
import DeliveryAreas from '@/components/DeliveryAreas';
import InquiryModal from '@/components/InquiryModal';

export default function DeliveryPage() {
  return (
    <div className="flex flex-col min-h-screen w-full max-w-full overflow-x-hidden bg-background text-foreground transition-colors duration-300">
      <Navbar />
      <main className="flex-grow w-full max-w-full">
        <HowToOrder />
        <DeliveryAreas />
      </main>
      <Footer />
      <InquiryModal />
    </div>
  );
}
