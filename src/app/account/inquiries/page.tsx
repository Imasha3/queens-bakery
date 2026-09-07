'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { db } from '@/lib/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore/lite';

interface InquiryItem {
  productId: string;
  name: string;
  category: string;
  image: string;
  quantity: number;
  size?: string | null;
  flavour?: string | null;
  message?: string | null;
  style?: string | null;
}

interface Inquiry {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  mobile: string;
  whatsapp: string;
  items: InquiryItem[];
  notes: string;
  requestedDate: string;
  deliveryLocation: string;
  status: "pending" | "reviewing" | "quoted" | "confirmed" | "completed" | "cancelled";
  createdAt: any; // Firestore Timestamp
  quotedPrice?: string | null;
  availability?: string | null;
  adminMessage?: string | null;
  respondedAt?: any | null;
}

export default function MyInquiriesPage() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useApp();
  const router = useRouter();

  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch inquiries
  useEffect(() => {
    if (!user) return;

    const fetchInquiries = async () => {
      try {
        const q = query(
          collection(db, "inquiries"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedInquiries: Inquiry[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedInquiries.push({
            id: doc.id,
            ...doc.data()
          } as Inquiry);
        });

        // Sort inquiries by creation time client-side to prevent Firestore Index requirement errors
        fetchedInquiries.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA; // Descending
        });

        setInquiries(fetchedInquiries);
      } catch (err: any) {
        console.error("Error fetching inquiries:", err);
        setError(
          language === 'en'
            ? "Unable to retrieve your inquiries. Please try again later."
            : "ඔබගේ විමසීම් ලබා ගැනීමට නොහැකි විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchInquiries();
  }, [user, language]);

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50';
      case 'quoted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50';
      case 'completed':
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800/50';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return 'N/A';
    const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return dateObj.toLocaleDateString(language === 'en' ? 'en-US' : 'si-LK', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (authLoading || (loading && inquiries.length === 0)) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase animate-pulse">
              {language === 'en' ? 'Loading inquiries...' : 'විමසීම් ලැයිස්තුව ලෝඩ් වෙමින්...'}
            </span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header & Back Link */}
          <div className="space-y-4">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {language === 'en' ? 'Back to Dashboard' : 'නැවත ගිණුම් පිටුවට'}
            </Link>
            
            <div className="space-y-2">
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">
                {language === 'en' ? 'Price & Availability Requests' : 'මිල ගණන් සහ තිබේදැයි විමසීම්'}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {language === 'en' ? 'My Inquiries' : 'මගේ විමසීම්'}
              </h1>
              <div className="h-1 w-12 bg-primary rounded-full mt-2" />
            </div>
          </div>

          {/* Main Error */}
          {error && (
            <div className="rounded-xl bg-primary/10 border border-primary/20 p-4 text-xs font-semibold text-primary text-center">
              ⚠️ {error}
            </div>
          )}

          {/* List inquiries */}
          {inquiries.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-4 bg-card">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-muted-foreground mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {language === 'en' ? "No Inquiries Yet" : "තවමත් විමසීම් කිසිවක් නැත"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {language === 'en' 
                  ? "Select delicious bakes from our store, add them to your inquiry cart, and request quotation prices." 
                  : "අපගේ වෙළඳසැලෙන් රසවත් නිෂ්පාදන තෝරාගෙන මිල ගණන් ඉල්ලුම් කරන්න."}
              </p>
              <Link href="/products" className="inline-block rounded-xl bg-primary text-primary-foreground px-6 py-3 text-xs font-semibold hover:opacity-95 shadow-md">
                {language === 'en' ? "Browse Products" : "නිෂ්පාදන පරීක්ෂා කරන්න"}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden"
                >
                  {/* Card Header details */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-accent/25 border-b border-border/60 gap-4">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                        {language === 'en' ? 'Submitted On' : 'ඉදිරිපත් කළ දිනය'}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {formatTimestamp(inquiry.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block sm:text-right">
                          {language === 'en' ? 'Requested Delivery Date' : 'අවශ්‍ය දිනය'}
                        </span>
                        <span className="text-xs font-semibold text-foreground sm:text-right block">
                          {inquiry.requestedDate || 'N/A'}
                        </span>
                      </div>
                      
                      {/* Status badge */}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${getStatusBadgeStyles(inquiry.status)}`}>
                        {inquiry.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Body details */}
                  <div className="p-6 space-y-6">
                    {/* Items List */}
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                        {language === 'en' ? 'Selected Items' : 'තෝරාගත් ද්‍රව්‍ය'}
                      </h4>
                      
                      <div className="divide-y divide-border/60">
                        {inquiry.items.map((item, itemIdx) => (
                          <div
                            key={itemIdx}
                            className="flex gap-4 py-3 first:pt-0 last:pb-0 items-start"
                          >
                            {/* Product Square Image */}
                            <div className="w-14 h-14 rounded-xl overflow-hidden bg-accent/20 flex-shrink-0 border border-border">
                              {typeof item.image === 'string' && item.image.trim() !== '' ? (
                                <img
                                  src={item.image.trim()}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-xl"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-accent/40 text-muted-foreground/60 text-[9px] font-bold uppercase tracking-tighter">
                                  QB
                                </div>
                              )}
                            </div>

                            {/* Options descriptions */}
                            <div className="flex-grow space-y-1">
                              <div className="flex justify-between items-start gap-4">
                                <h5 className="text-xs font-bold text-foreground">
                                  {item.name}
                                </h5>
                                <span className="text-xs font-semibold text-muted-foreground">
                                  x{item.quantity}
                                </span>
                              </div>
                              <p className="text-[10px] text-muted-foreground font-light">
                                {item.category}
                              </p>

                              {/* Selected options block */}
                              {(item.size || item.flavour || item.message || item.style) && (
                                <div className="flex flex-wrap gap-x-3 gap-y-1 pt-1">
                                  {item.size && (
                                    <span className="text-[10px] bg-accent px-2 py-0.5 rounded text-foreground font-medium">
                                      Size: {item.size}
                                    </span>
                                  )}
                                  {item.flavour && (
                                    <span className="text-[10px] bg-accent px-2 py-0.5 rounded text-foreground font-medium">
                                      Flavour: {item.flavour}
                                    </span>
                                  )}
                                  {item.style && (
                                    <span className="text-[10px] bg-accent px-2 py-0.5 rounded text-foreground font-medium">
                                      Style: {item.style}
                                    </span>
                                  )}
                                  {item.message && (
                                    <span className="text-[10px] border border-border px-2 py-0.5 rounded text-muted-foreground block w-full italic">
                                      "{item.message}"
                                    </span>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Delivery & Notes Details */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-border/40">
                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                          {language === 'en' ? 'Delivery Location' : 'බෙදාහැරීමේ ස්ථානය'}
                        </span>
                        <span className="text-xs font-semibold text-foreground">
                          {inquiry.deliveryLocation || 'N/A'}
                        </span>
                      </div>

                      <div className="space-y-1">
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                          Contact Details
                        </span>
                        <span className="text-xs font-medium text-foreground block">
                          Phone: {inquiry.mobile}
                        </span>
                        {inquiry.whatsapp && inquiry.whatsapp !== inquiry.mobile && (
                          <span className="text-xs font-medium text-foreground block">
                            WhatsApp: {inquiry.whatsapp}
                          </span>
                        )}
                      </div>

                      {inquiry.notes && (
                        <div className="sm:col-span-2 space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                            {language === 'en' ? 'Additional Notes' : 'අමතර සටහන්'}
                          </span>
                          <p className="text-xs font-light text-foreground bg-accent/10 p-3 rounded-2xl border border-border/40 leading-relaxed whitespace-pre-wrap">
                            {inquiry.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Admin Response Section */}
                    <div className="pt-4 border-t border-border/40 mt-4 space-y-3">
                      <span className="text-[10px] text-primary uppercase font-bold block tracking-wider font-semibold">
                        {language === 'en' ? "Bakery Response" : "ක්වීන්ස් බේකරි පිළිතුර"}
                      </span>
                      
                      {inquiry.respondedAt ? (
                        <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                {language === 'en' ? "Quoted Price" : "ලබාදුන් මිල"}
                              </span>
                              <span className="text-sm font-serif font-semibold text-primary">
                                {inquiry.quotedPrice || 'N/A'}
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                {language === 'en' ? "Availability" : "ලබාගත හැකි බව"}
                              </span>
                              <span className="text-xs font-semibold text-foreground">
                                {inquiry.availability || 'N/A'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                {language === 'en' ? "Responded On" : "පිළිතුරු දුන් දිනය"}
                              </span>
                              <span className="text-xs font-semibold text-foreground">
                                {formatTimestamp(inquiry.respondedAt)}
                              </span>
                            </div>
                          </div>

                          {inquiry.adminMessage && (
                            <div className="space-y-1 pt-2 border-t border-border/40">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                {language === 'en' ? "Message from Bakery" : "බේකරියෙන් පණිවිඩය"}
                              </span>
                              <p className="text-xs font-light text-foreground leading-relaxed whitespace-pre-wrap">
                                {inquiry.adminMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-accent/10 border border-border/40 p-4 rounded-2xl text-center">
                          <span className="text-xs text-muted-foreground font-light block">
                            ⏳ {language === 'en' ? "Awaiting response from Queen's Bakery" : "ක්වීන්ස් බේකරි වෙතින් පිළිතුරක් බලාපොරොත්තුවෙන්"}
                          </span>
                        </div>
                      )}
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </main>

      <Footer />
    </div>
  );
}
