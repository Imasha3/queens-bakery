'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { fetchActiveProducts, Product } from '@/lib/products';
import { fetchCategories } from '@/lib/categories';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ProductCard from '@/components/ProductCard';
import InquiryModal from '@/components/InquiryModal';

function ProductsContent() {
  const { t } = useApp();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  // Dynamic Categories list from Firestore
  const [categories, setCategories] = useState<string[]>([
    'All',
    'Cakes',
    'Savoury Items',
    'Desserts',
    'Flower Bouquets',
    'Party Packages',
  ]);

  // Fetch active products & categories from Firestore
  useEffect(() => {
    async function loadProductsAndCategories() {
      setLoading(true);
      try {
        const [data, fetchedCats] = await Promise.all([
          fetchActiveProducts(),
          fetchCategories(),
        ]);
        setProducts(data);
        if (fetchedCats && fetchedCats.length > 0) {
          const names = fetchedCats.map((c) => c.name);
          setCategories(['All', ...names]);
        }
      } catch (err) {
        console.error('Error loading products or categories:', err);
      } finally {
        setLoading(false);
      }
    }
    loadProductsAndCategories();
  }, []);

  // Normalize category string for robust matching (handling spelling & casing variations like Savoury/Savory)
  const normalizeCat = (str: string) => {
    if (!str) return '';
    return str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '')
      .replace('savoury', 'savory')
      .replace('dessertitems', 'desserts');
  };

  // Set active category filter from query parameters if present
  useEffect(() => {
    const categoryParam = searchParams.get('category');
    if (categoryParam) {
      const paramNorm = normalizeCat(categoryParam);
      const matched = categories.find((c) => normalizeCat(c) === paramNorm);
      if (matched) {
        setSelectedCategory(matched);
      } else {
        setSelectedCategory(categoryParam);
      }
    }
  }, [searchParams, categories]);

  // Filter products based on category and search query
  const filteredProducts = products.filter((product) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      normalizeCat(product.category) === normalizeCat(selectedCategory);
    const matchesSearch =
      (product.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (product.description || '').toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          
          {/* Header */}
          <div className="text-center max-w-3xl mx-auto space-y-3">
            <h1 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-foreground">
              Our Products
            </h1>
            <p className="text-xs sm:text-sm font-light text-muted-foreground leading-relaxed">
              Browse our creations and select the items you are interested in. Prices and availability are provided upon inquiry request.
            </p>
            <div className="h-1 w-12 bg-primary mx-auto mt-2 rounded-full" />
          </div>

          {/* Filters & Search Controls - Clean, moderately rounded-xl container */}
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-card border border-border/80 p-5 rounded-xl shadow-xs">
            {/* Search Input - rounded-lg */}
            <div className="relative w-full md:max-w-xs">
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-border/80 bg-background px-4 py-2.5 pl-9 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
              />
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="absolute left-3 top-3 w-4 h-4 text-muted-foreground"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.637 10.637z" />
              </svg>
            </div>

            {/* Category Filters - rounded-lg buttons */}
            <div className="flex flex-wrap gap-2 w-full md:w-auto justify-start md:justify-end">
              {categories.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-lg px-3.5 py-2 text-xs font-semibold tracking-wide border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? 'bg-primary text-primary-foreground border-primary shadow-xs'
                        : 'bg-background hover:bg-accent/40 border-border/80 text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Products Grid / Loading State / Empty State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 bg-card rounded-xl border border-border/80">
              <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-3" />
              <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase animate-pulse">
                Loading Bakes...
              </span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-20 bg-card rounded-xl border border-dashed border-border/80">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="w-12 h-12 text-muted-foreground/60 mx-auto mb-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.182 16.318A4.486 4.486 0 0012.016 15a4.486 4.486 0 00-3.198 1.318M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z" />
              </svg>
              <h3 className="font-serif text-lg font-bold text-foreground">No products found</h3>
              <p className="text-xs text-muted-foreground mt-1">Try refining your search or changing the active category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
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
      </main>

      <Footer />
      <InquiryModal />
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col justify-between">
        <div className="sticky top-0 z-40 w-full h-20 border-b border-border bg-background" />
        <div className="flex-grow flex items-center justify-center bg-background">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase animate-pulse">Loading Bakes...</span>
          </div>
        </div>
        <div className="w-full h-64 border-t border-border bg-card" />
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
