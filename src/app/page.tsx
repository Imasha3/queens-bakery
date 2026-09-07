'use client';

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { fetchActiveProducts, Product } from '@/lib/products';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import CategoryCard from '@/components/CategoryCard';
import ProductCard from '@/components/ProductCard';
import HowToOrder from '@/components/HowToOrder';
import DeliveryAreas from '@/components/DeliveryAreas';
import CustomOrderCTA from '@/components/CustomOrderCTA';
import SocialSection from '@/components/SocialSection';
import WhatsAppCTA from '@/components/WhatsAppCTA';
import Footer from '@/components/Footer';
import InquiryModal from '@/components/InquiryModal';
import CreationsSection from '@/components/CreationsSection';
import { fetchCategories, Category, resolveCategoryCoverImage } from '@/lib/categories';
import { testFirebaseConnection } from '@/lib/firebase-test';

export default function Home() {
  const { t } = useApp();
  const [popularChoices, setPopularChoices] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  // Dynamic Categories from Firestore
  const [categoriesList, setCategoriesList] = useState<any[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  useEffect(() => {
    testFirebaseConnection();
  }, []);

  // Fetch active products & categories from Firestore
  useEffect(() => {
    async function loadHomeData() {
      setLoadingProducts(true);
      setLoadingCategories(true);

      try {
        const [prods, fetchedCats] = await Promise.all([
          fetchActiveProducts(),
          fetchCategories(),
        ]);

        setPopularChoices(prods.slice(0, 4));
        setLoadingProducts(false);

        const mapped = fetchedCats.map((cat) => {
          const coverImg = resolveCategoryCoverImage(cat, prods);
          return {
            id: cat.id,
            name: cat.name,
            description: cat.description || `Explore Queen's Bakery ${cat.name} collection`,
            image: coverImg,
            href: `/products?category=${encodeURIComponent(cat.name)}`,
          };
        });

        setCategoriesList(mapped);
      } catch (err) {
        console.error('Error loading home data:', err);
      } finally {
        setLoadingCategories(false);
      }
    }
    loadHomeData();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header / Navbar */}
      <Navbar />

      {/* Main Content Layout */}
      <main className="flex-grow">
        {/* 1. Hero Section */}
        <HeroSection />

        {/* 2. Categories Section */}
        <section id="categories" className="py-16 md:py-24 bg-card transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">
                Browse Collections
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2">
                {t('categories.title')}
              </h2>
              <div className="h-1 w-12 bg-primary mx-auto mt-4 rounded-full" />
            </div>

            {loadingCategories ? (
              <div className="flex flex-col items-center justify-center py-12">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
                <span className="text-xs font-semibold text-muted-foreground uppercase animate-pulse">
                  Loading Categories...
                </span>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {categoriesList.map((cat) => (
                  <CategoryCard
                    key={cat.id}
                    image={cat.image}
                    name={cat.name}
                    description={cat.description}
                    href={cat.href}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 3. Featured Products Section */}
        <section id="products" className="py-16 md:py-24 transition-colors duration-300">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">
                Featured Bakes
              </span>
              <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mt-2">
                {t('products.title')}
              </h2>
              <div className="h-1 w-12 bg-primary mx-auto mt-4 rounded-full" />
              <p className="text-xs font-light text-muted-foreground mt-3 max-w-md mx-auto">
                Hover or click View Details to inspect our ingredients. Prices and availability are provided upon inquiry request.
              </p>
            </div>

            {loadingProducts ? (
              <div className="flex flex-col items-center justify-center py-16 bg-card rounded-3xl border border-border/80">
                <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
                <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase animate-pulse">
                  Loading Featured Bakes...
                </span>
              </div>
            ) : popularChoices.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-3xl border border-dashed border-border/80">
                <p className="text-xs text-muted-foreground">Our featured products will be available shortly.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {popularChoices.map((prod) => (
                  <ProductCard
                    key={prod.id}
                    id={prod.id}
                    slug={prod.slug}
                    image={prod.image}
                    name={prod.name}
                    category={prod.category}
                    description={prod.description}
                  />
                ))}
              </div>
            )}
          </div>
        </section>

        {/* 4. Our Creations Carousel Showcase */}
        <CreationsSection />

        {/* 5. How To Order Section */}
        <HowToOrder />

        {/* 5. Delivery Areas Section */}
        <DeliveryAreas />

        {/* 6. Custom Orders CTA Section */}
        <CustomOrderCTA />

        {/* 7. Social Section (Trust Reviews & Social Follow buttons) */}
        <SocialSection />

        {/* 8. WhatsApp CTA Section */}
        <WhatsAppCTA />
      </main>

      {/* 9. Footer Section */}
      <Footer />

      {/* Inquiry Dialog Modal */}
      <InquiryModal />
    </div>
  );
}
