'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/context/AppContext';
import { fetchProductBySlug, Product } from '@/lib/products';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import InquiryModal from '@/components/InquiryModal';

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default function ProductDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const slug = resolvedParams.slug;

  const { addToInquiry, setInquiryModalOpen, t } = useApp();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // Gallery Active Image state
  const [activeImage, setActiveImage] = useState('');

  // Customize Options state
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedFlavour, setSelectedFlavour] = useState('');
  const [selectedStyle, setSelectedStyle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [addedAlert, setAddedAlert] = useState(false);

  // Load product by slug from Firestore
  useEffect(() => {
    async function loadProduct() {
      setLoading(true);
      const fetchedProduct = await fetchProductBySlug(slug);
      setProduct(fetchedProduct);
      setLoading(false);

      if (fetchedProduct) {
        const initialImg = (typeof fetchedProduct.image === 'string' && fetchedProduct.image.trim()) 
          || (fetchedProduct.images && fetchedProduct.images[0]) 
          || '';
        setActiveImage(initialImg);
        setSelectedSize(fetchedProduct.options?.sizes?.[0] || '');
        setSelectedFlavour(fetchedProduct.options?.flavours?.[0] || '');
        setSelectedStyle(fetchedProduct.options?.styles?.[0] || '');
      }
    }
    loadProduct();
  }, [slug]);

  const incrementQty = () => setQuantity((prev) => prev + 1);
  const decrementQty = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToInquiry = (openModalAfterAdding = false) => {
    if (!product) return;

    // Construct options object based on what's selected
    const options: Record<string, string> = {};
    if (selectedSize) options.size = selectedSize;
    if (selectedFlavour) options.flavour = selectedFlavour;
    if (selectedStyle) options.style = selectedStyle;
    if (customMessage) options.message = customMessage;

    const currentImg = (typeof activeImage === 'string' && activeImage.trim()) 
      || (typeof product.image === 'string' && product.image.trim()) 
      || '';

    addToInquiry({
      productId: product.id,
      name: product.name,
      category: product.category,
      image: currentImg,
      quantity,
      options
    });

    // Alert indicator
    setAddedAlert(true);
    setTimeout(() => setAddedAlert(false), 3000);

    if (openModalAfterAdding) {
      setInquiryModalOpen(true);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-20 text-center space-y-4">
          <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
          <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase animate-pulse">
            Loading Product Details...
          </span>
        </main>
        <Footer />
      </div>
    );
  }

  if (!product || product.active === false) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-20 text-center space-y-4">
          <h2 className="font-serif text-3xl font-bold">Product Not Found</h2>
          <p className="text-sm text-muted-foreground">The product you are looking for does not exist or is currently unavailable.</p>
          <Link href="/products" className="rounded-xl bg-primary text-primary-foreground px-6 py-2.5 text-xs font-semibold shadow-sm">
            Back to Products
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const hasOptions = product.options && (
    (product.options.sizes && product.options.sizes.length > 0) ||
    (product.options.flavours && product.options.flavours.length > 0) ||
    (product.options.styles && product.options.styles.length > 0) ||
    product.options.allowCustomMessage
  );

  const mainImgSrc = (typeof activeImage === 'string' && activeImage.trim()) 
    || (typeof product.image === 'string' && product.image.trim()) 
    || '';
  const hasMainImg = mainImgSrc !== '';

  const validGalleryImages = Array.isArray(product.images)
    ? product.images.filter(img => typeof img === 'string' && img.trim() !== '').map(img => img.trim())
    : [];

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          
          {/* Breadcrumbs */}
          <nav className="text-xs font-medium text-muted-foreground flex items-center gap-2">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <span>/</span>
            <Link href="/products" className="hover:text-primary transition-colors">Products</Link>
            <span>/</span>
            <span className="text-foreground font-semibold">{product.name}</span>
          </nav>

          {/* Product Showcase Split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            
            {/* Gallery Column */}
            <div className="lg:col-span-6 space-y-4">
              <div className="aspect-square w-full rounded-none overflow-hidden bg-accent/20 border border-border/80 shadow-md">
                {hasMainImg ? (
                  <img
                    src={mainImgSrc}
                    alt={product.name}
                    className="h-full w-full object-cover transition-all rounded-none"
                  />
                ) : (
                  <div className="h-full w-full flex flex-col items-center justify-center bg-accent/30 text-muted-foreground/60 p-4 text-center select-none">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2 opacity-70">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9 9 0 100-18 9 9 0 000 18zM12 8v4l3 3" />
                    </svg>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">Queen's Bakery</span>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {validGalleryImages.length > 1 && (
                <div className="flex gap-4 overflow-x-auto pb-2">
                  {validGalleryImages.map((img, idx) => {
                    const isSelected = mainImgSrc === img;
                    return (
                      <button
                        key={idx}
                        onClick={() => setActiveImage(img)}
                        className={`aspect-square w-20 flex-shrink-0 rounded-none overflow-hidden bg-accent/20 border-2 transition-all ${
                          isSelected ? 'border-primary scale-95 shadow-sm' : 'border-border hover:border-primary/40'
                        }`}
                      >
                        <img src={img} alt={`Thumbnail ${idx}`} className="h-full w-full object-cover rounded-none" />
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Configurator Column */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* Product title header */}
              <div className="space-y-3">
                <span className="inline-block rounded-full bg-primary/10 text-primary px-3.5 py-1.5 text-xs font-semibold tracking-wide border border-primary/20">
                  {product.category}
                </span>
                
                <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                  {product.name}
                </h1>
                
                <p className="text-sm font-light text-muted-foreground leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Custom Options Form */}
              <div className="bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
                <h3 className="font-serif text-base font-bold text-foreground border-b border-border/60 pb-3">
                  Customize Your Order
                </h3>

                {hasOptions && product.options && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Size Option */}
                    {product.options.sizes && product.options.sizes.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="option-size" className="text-xs font-semibold text-foreground/95">
                          Cake Size *
                        </label>
                        <select
                          id="option-size"
                          value={selectedSize}
                          onChange={(e) => setSelectedSize(e.target.value)}
                          className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                        >
                          {product.options.sizes.map((sz) => (
                            <option key={sz} value={sz}>{sz}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Flavour Option */}
                    {product.options.flavours && product.options.flavours.length > 0 && (
                      <div className="flex flex-col gap-1.5">
                        <label htmlFor="option-flavour" className="text-xs font-semibold text-foreground/95">
                          Select Flavour *
                        </label>
                        <select
                          id="option-flavour"
                          value={selectedFlavour}
                          onChange={(e) => setSelectedFlavour(e.target.value)}
                          className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                        >
                          {product.options.flavours.map((fl) => (
                            <option key={fl} value={fl}>{fl}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Bouquet Styles Option */}
                    {product.options.styles && product.options.styles.length > 0 && (
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label htmlFor="option-style" className="text-xs font-semibold text-foreground/95">
                          Wrapping Style *
                        </label>
                        <select
                          id="option-style"
                          value={selectedStyle}
                          onChange={(e) => setSelectedStyle(e.target.value)}
                          className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                        >
                          {product.options.styles.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {/* Custom Message Input */}
                    {product.options.allowCustomMessage && (
                      <div className="flex flex-col gap-1.5 sm:col-span-2">
                        <label htmlFor="option-message" className="text-xs font-semibold text-foreground/95">
                          Custom Message on Cake (Optional)
                        </label>
                        <input
                          id="option-message"
                          type="text"
                          maxLength={50}
                          placeholder="e.g. Happy Birthday Sarah!"
                          value={customMessage}
                          onChange={(e) => setCustomMessage(e.target.value)}
                          className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                        />
                        <span className="text-[10px] text-muted-foreground text-right">Max 50 characters</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Quantity and Action Buttons Row */}
                <div className="flex flex-col sm:flex-row gap-4 items-center border-t border-border/60 pt-6">
                  {/* Quantity Counter */}
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Qty:</span>
                    <div className="flex items-center rounded-xl bg-background border border-border p-1">
                      <button
                        onClick={decrementQty}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent text-foreground text-base font-bold transition-colors"
                      >
                        -
                      </button>
                      <span className="w-10 text-center text-xs font-bold text-foreground">
                        {quantity}
                      </span>
                      <button
                        onClick={incrementQty}
                        className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-accent text-foreground text-base font-bold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  {/* Add to Inquiry action */}
                  <button
                    onClick={() => handleAddToInquiry(false)}
                    className="w-full sm:flex-grow flex items-center justify-center rounded-xl bg-primary text-primary-foreground py-3.5 text-xs font-semibold shadow-md hover:opacity-95 transition-opacity duration-200"
                  >
                    Add to Inquiry
                  </button>
                </div>

                {/* Added Success alert badge */}
                {addedAlert && (
                  <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/25 p-3 text-center text-xs text-emerald-600 font-semibold animate-in fade-in slide-in-from-top-1 duration-200">
                    🍰 Selection added to your Inquiry Basket!
                  </div>
                )}

                {/* Immediate Price request CTA */}
                <div className="pt-2 border-t border-border/40">
                  <button
                    onClick={() => handleAddToInquiry(true)}
                    className="w-full flex items-center justify-center rounded-xl border border-primary/30 hover:border-primary bg-transparent text-foreground hover:bg-accent/15 py-3.5 text-xs font-semibold transition-all duration-300"
                  >
                    Request Price & Availability Now
                  </button>
                </div>
              </div>

              {/* Informative message warning no public prices */}
              <div className="rounded-2xl bg-accent/25 border border-primary/10 p-4 text-[11px] leading-relaxed text-muted-foreground flex gap-3">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4 text-primary flex-shrink-0">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 111.083.985l-.04.025a1.5 1.5 0 00-.577.493l-.024.035a2.25 2.25 0 00-.407 1.25h.008v.008h-.008v.007H12.75a.375.375 0 11-.75 0V15a2.25 2.25 0 00-.353-1.25H11.25a.375.375 0 110-.75zM12 9a.75.75 0 110-1.5.75.75 0 010 1.5z" />
                </svg>
                <p>
                  <strong>Note:</strong> Queen's Bakery does not display pricing publicly. Your request will be evaluated by our baking team against delivery slots and locations before sending a custom quote.
                </p>
              </div>

            </div>
          </div>

          {/* Long Description Area */}
          <div className="border-t border-border/60 pt-12 space-y-4">
            <h2 className="font-serif text-2xl font-bold text-foreground">
              Product Details
            </h2>
            <p className="text-sm font-light text-muted-foreground leading-relaxed max-w-4xl whitespace-pre-line">
              {product.longDescription || product.description}
            </p>
          </div>

        </div>
      </main>

      <Footer />
      <InquiryModal />
    </div>
  );
}
