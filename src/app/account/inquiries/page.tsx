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
  status: "pending" | "reviewing" | "quoted" | "confirmed" | "completed" | "cancelled" | string;
  createdAt: any;
  quotedPrice?: string | null;
  availability?: string | null;
  adminMessage?: string | null;
  respondedAt?: any | null;
}

export default function MyInquiriesPage() {
  const { user, profile, loading: authLoading } = useAuth();
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

  // Fetch customer inquiries with automatic background refresh
  useEffect(() => {
    if (!user?.uid) return;

    let active = true;

    const fetchInquiries = async () => {
      try {
        const q = query(
          collection(db, "inquiries"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedInquiries: Inquiry[] = [];
        
        querySnapshot.forEach((docSnap) => {
          fetchedInquiries.push({
            id: docSnap.id,
            ...docSnap.data()
          } as Inquiry);
        });

        // Sort by creation time descending
        fetchedInquiries.sort((a, b) => {
          const timeA = a.createdAt?.seconds || a.createdAt?.toMillis?.() || 0;
          const timeB = b.createdAt?.seconds || b.createdAt?.toMillis?.() || 0;
          return timeB - timeA;
        });

        if (active) {
          setInquiries(fetchedInquiries);
          setLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching inquiries:", err);
        if (active) {
          setError(
            language === 'en'
              ? "Unable to retrieve your inquiries. Please try again later."
              : "ඔබගේ විමසීම් ලබා ගැනීමට නොහැකි විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න."
          );
          setLoading(false);
        }
      }
    };

    fetchInquiries();
    const intervalId = setInterval(fetchInquiries, 8000);

    return () => {
      active = false;
      clearInterval(intervalId);
    };
  }, [user?.uid, language]);

  const getStatusMessage = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return language === 'en'
          ? "Your order has been confirmed by Queen's Bakery."
          : "ඔබගේ ඇණවුම ක්වීන්ස් බේකරිය විසින් තහවුරු කර ඇත.";
      case 'rejected':
      case 'declined':
      case 'cancelled':
        return language === 'en'
          ? "Unfortunately, your order could not be accepted at this time."
          : "කණගාටුයි, මේ අවස්ථාවේ දී ඔබගේ ඇණවුම පිළිගත නොහැකි විය.";
      case 'reviewing':
      case 'under_review':
        return language === 'en'
          ? "Your inquiry is currently being reviewed by our team."
          : "ඔබගේ විමසීම අපගේ කණ්ඩායම විසින් පරීක්ෂා කරමින් පවතී.";
      case 'quoted':
        return language === 'en'
          ? "Price quote generated. Please review response details below."
          : "මිල ගණන් ලබා දී ඇත. කරුණාකර පහත විස්තර බලන්න.";
      case 'completed':
        return language === 'en'
          ? "Your order has been completed. Thank you for choosing Queen's Bakery!"
          : "ඔබගේ ඇණවුම සම්පූර්ණ කර ඇත. ක්වීන්ස් බේකරිය තෝරා ගැනීම ගැන ස්තූතියි!";
      case 'pending':
      default:
        return language === 'en'
          ? "Your order is waiting for confirmation."
          : "ඔබගේ ඇණවුම තහවුරු කිරීම සඳහා බලාපොරොත්තුවෙන් පවතී.";
    }
  };

  const getStatusBadgeStyles = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-700/60';
      case 'reviewing':
      case 'under_review':
        return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-700/60';
      case 'quoted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-700/60';
      case 'confirmed':
        return 'bg-indigo-100 text-indigo-800 border-indigo-300 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-700/60';
      case 'completed':
        return 'bg-slate-200 text-slate-900 border-slate-300 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
      case 'cancelled':
      case 'declined':
        return 'bg-rose-100 text-rose-800 border-rose-300 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-700/60';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300 dark:bg-gray-800 dark:text-gray-300';
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
        <main className="flex-grow flex flex-col items-center justify-center py-24">
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
          
          {/* Header & Customer Name */}
          <div className="space-y-4">
            <Link
              href="/account"
              className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
              </svg>
              {language === 'en' ? 'Back to Account' : 'නැවත ගිණුම් පිටුවට'}
            </Link>
            
            <div className="space-y-2">
              <span className="text-xs font-semibold text-primary tracking-widest uppercase">
                {profile?.fullName || user.displayName ? `Account of ${profile?.fullName || user.displayName}` : 'Customer Inquiries'}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {language === 'en' ? 'My Inquiries & Price Quotes' : 'මගේ විමසීම් සහ මිල ගණන්'}
              </h1>
              <div className="h-1 w-12 bg-primary rounded-full mt-2" />
            </div>
          </div>

          {/* Main Error */}
          {error && (
            <div className="rounded-none bg-primary/10 border border-primary/20 p-4 text-xs font-semibold text-primary text-center">
              ⚠️ {error}
            </div>
          )}

          {/* List inquiries */}
          {inquiries.length === 0 ? (
            <div className="rounded-none border border-dashed border-border p-12 text-center space-y-4 bg-card">
              <div className="flex items-center justify-center w-16 h-16 rounded-none bg-accent/20 text-muted-foreground mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {language === 'en' ? "No Inquiries Submitted Yet" : "තවමත් විමසීම් කිසිවක් නැත"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {language === 'en' 
                  ? "Select bakes from our products catalog, add them to your inquiry cart, and receive price quotes directly." 
                  : "අපගේ නිෂ්පාදන පරීක්ෂා කර මිල ගණන් ලබා ගන්න."}
              </p>
              <Link href="/products" className="inline-block rounded-none bg-primary text-primary-foreground px-6 py-3 text-xs font-semibold hover:opacity-95 shadow-md">
                {language === 'en' ? "Browse Bakery Products" : "නිෂ්පාදන පරීක්ෂා කරන්න"}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {inquiries.map((inquiry) => (
                <div
                  key={inquiry.id}
                  className="bg-card border border-border/90 rounded-none shadow-md overflow-hidden"
                >
                  {/* Card Header details */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-accent/30 border-b border-border/60 gap-4">
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
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase rounded-none border ${getStatusBadgeStyles(inquiry.status)}`}>
                        {inquiry.status ? inquiry.status.replace('_', ' ') : 'PENDING'}
                      </span>
                    </div>
                  </div>

                  {/* Card Body details */}
                  <div className="p-6 space-y-6">
                    {/* Status Message Banner */}
                    <div className={`p-4 border rounded-none text-xs font-semibold flex items-center gap-3 ${
                      inquiry.status === 'confirmed'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
                        : inquiry.status === 'rejected' || inquiry.status === 'cancelled'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-700 dark:text-rose-300'
                        : 'bg-amber-500/10 border-amber-500/30 text-amber-800 dark:text-amber-300'
                    }`}>
                      <span className="text-base">
                        {inquiry.status === 'confirmed' ? '🎉' : inquiry.status === 'rejected' || inquiry.status === 'cancelled' ? '⚠️' : '⏳'}
                      </span>
                      <span>{getStatusMessage(inquiry.status)}</span>
                    </div>
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
                            <div className="w-14 h-14 rounded-none overflow-hidden bg-accent/20 flex-shrink-0 border border-border">
                              {typeof item.image === 'string' && item.image.trim() !== '' ? (
                                <img
                                  src={item.image.trim()}
                                  alt={item.name}
                                  className="w-full h-full object-cover rounded-none"
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
                                    <span className="text-[10px] bg-accent/60 px-2 py-0.5 rounded-none text-foreground font-medium border border-border/40">
                                      Size: {item.size}
                                    </span>
                                  )}
                                  {item.flavour && (
                                    <span className="text-[10px] bg-accent/60 px-2 py-0.5 rounded-none text-foreground font-medium border border-border/40">
                                      Flavour: {item.flavour}
                                    </span>
                                  )}
                                  {item.style && (
                                    <span className="text-[10px] bg-accent/60 px-2 py-0.5 rounded-none text-foreground font-medium border border-border/40">
                                      Style: {item.style}
                                    </span>
                                  )}
                                  {item.message && (
                                    <span className="text-[10px] border border-border px-2 py-0.5 rounded-none text-muted-foreground block w-full italic">
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
                          Contact Info
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
                            {language === 'en' ? 'Additional Customer Notes' : 'අමතර සටහන්'}
                          </span>
                          <p className="text-xs font-light text-foreground bg-accent/10 p-3 rounded-none border border-border/40 leading-relaxed whitespace-pre-wrap">
                            {inquiry.notes}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Admin Response Section */}
                    <div className="pt-4 border-t border-border/40 mt-4 space-y-3">
                      <span className="text-[10px] text-primary uppercase font-bold block tracking-wider font-semibold">
                        {language === 'en' ? "Bakery Response & Quoted Price" : "ක්වීන්ස් බේකරි පිළිතුර"}
                      </span>
                      
                      {inquiry.respondedAt || inquiry.quotedPrice || inquiry.adminMessage ? (
                        <div className="bg-primary/5 border border-primary/20 p-4 rounded-none space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                {language === 'en' ? "Quoted Price" : "ලබාදුන් මිල"}
                              </span>
                              <span className="text-sm font-serif font-bold text-primary">
                                {inquiry.quotedPrice || 'Pending Quote'}
                              </span>
                            </div>
                            
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                {language === 'en' ? "Availability" : "ලබාගත හැකි බව"}
                              </span>
                              <span className="text-xs font-semibold text-foreground">
                                {inquiry.availability || 'Available'}
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
                                {language === 'en' ? "Message from Bakery Staff" : "බේකරියෙන් පණිවිඩය"}
                              </span>
                              <p className="text-xs font-light text-foreground leading-relaxed whitespace-pre-wrap">
                                {inquiry.adminMessage}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div className="bg-accent/10 border border-border/40 p-4 rounded-none text-center">
                          <span className="text-xs text-muted-foreground font-light block">
                            ⏳ {language === 'en' ? "Awaiting response from Queen's Bakery team" : "ක්වීන්ස් බේකරි වෙතින් පිළිතුරක් බලාපොරොත්තුවෙන්"}
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
