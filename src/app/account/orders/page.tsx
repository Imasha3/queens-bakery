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

interface CustomOrder {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  mobile: string;
  whatsapp: string;
  notes?: string;
  requirements?: string;
  requestedDate: string;
  deliveryLocation: string;
  referenceImage?: string | null;
  status: "pending" | "reviewing" | "accepted" | "in progress" | "completed" | "rejected";
  quotedPrice?: string | null;
  adminMessage?: string | null;
  createdAt: any; // Firestore Timestamp
  updatedAt?: any;
  respondedAt?: any;
}

export default function MyOrdersPage() {
  const { user, loading: authLoading } = useAuth();
  const { language } = useApp();
  const router = useRouter();

  const [orders, setOrders] = useState<CustomOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Redirect if not logged in
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Fetch custom orders
  useEffect(() => {
    if (!user) return;

    const fetchOrders = async () => {
      try {
        const q = query(
          collection(db, "customOrders"),
          where("userId", "==", user.uid)
        );
        const querySnapshot = await getDocs(q);
        const fetchedOrders: CustomOrder[] = [];
        
        querySnapshot.forEach((doc) => {
          fetchedOrders.push({
            id: doc.id,
            ...doc.data()
          } as CustomOrder);
        });

        // Sort custom orders client-side by creation time to avoid Index requirement errors
        fetchedOrders.sort((a, b) => {
          const timeA = a.createdAt?.seconds || 0;
          const timeB = b.createdAt?.seconds || 0;
          return timeB - timeA; // Descending
        });

        setOrders(fetchedOrders);
      } catch (err: any) {
        console.error("Error fetching custom orders:", err);
        setError(
          language === 'en'
            ? "Unable to retrieve your custom orders. Please try again later."
            : "ඔබගේ විශේෂ ඇණවුම් ලබා ගැනීමට නොහැකි විය. කරුණාකර පසුව නැවත උත්සාහ කරන්න."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user, language]);

  const getStatusBadgeStyles = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/50';
      case 'reviewing':
        return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800/50';
      case 'accepted':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/50';
      case 'in progress':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/50';
      case 'completed':
        return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700/50';
      case 'rejected':
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

  if (authLoading || (loading && orders.length === 0)) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase animate-pulse">
              {language === 'en' ? 'Loading orders...' : 'විශේෂ ඇණවුම් ලෝඩ් වෙමින්...'}
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
                {language === 'en' ? 'Bespoke Order Customizations' : 'විශේෂ ඇණවුම් විස්තර'}
              </span>
              <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
                {language === 'en' ? 'My Custom Orders' : 'මගේ විශේෂ ඇණවුම්'}
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

          {/* List custom orders */}
          {orders.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border p-12 text-center space-y-4 bg-card">
              <div className="flex items-center justify-center w-16 h-16 rounded-full bg-accent/20 text-muted-foreground mx-auto">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 10.5v6m3-3H9m12-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="font-serif text-lg font-bold text-foreground">
                {language === 'en' ? "No Custom Orders Yet" : "තවමත් විශේෂ ඇණවුම් කිසිවක් නැත"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
                {language === 'en' 
                  ? "Looking for something unique? Request bespoke cake designs, parties package themes, or flower arrangements." 
                  : "ඔබටම අනන්‍ය වූ කේක් මෝස්තර හෝ වෙනත් විශේෂිත දේ අප වෙතින් ඇණවුම් කරන්න."}
              </p>
              <Link href="/custom-orders" className="inline-block rounded-xl bg-primary text-primary-foreground px-6 py-3 text-xs font-semibold hover:opacity-95 shadow-md">
                {language === 'en' ? "Request Custom Order" : "විශේෂ ඇණවුමක් ඉල්ලන්න"}
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="bg-card border border-border rounded-3xl shadow-sm overflow-hidden"
                >
                  {/* Card Header details */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-6 bg-accent/25 border-b border-border/60 gap-4">
                    <div>
                      <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                        {language === 'en' ? 'Submitted On' : 'ඉදිරිපත් කළ දිනය'}
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {formatTimestamp(order.createdAt)}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 items-center">
                      <div>
                        <span className="text-[10px] text-muted-foreground uppercase font-bold block sm:text-right">
                          {language === 'en' ? 'Requested Date' : 'අවශ්‍ය දිනය'}
                        </span>
                        <span className="text-xs font-semibold text-foreground sm:text-right block">
                          {order.requestedDate || 'N/A'}
                        </span>
                      </div>
                      
                      {/* Status badge */}
                      <span className={`inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase rounded-full border ${getStatusBadgeStyles(order.status)}`}>
                        {order.status}
                      </span>
                    </div>
                  </div>

                  {/* Card Body details */}
                  <div className="p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                      
                      {/* Description & Reference Image */}
                      <div className="md:col-span-8 space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                            {language === 'en' ? 'Design Requirements' : 'නිර්මාණ අවශ්‍යතා'}
                          </h4>
                          <p className="text-xs font-light text-foreground bg-accent/5 p-4 border border-border/60 rounded-2xl leading-relaxed whitespace-pre-wrap">
                            {order.requirements || order.notes || (order as any).details || 'No description provided.'}
                          </p>
                        </div>

                        {order.referenceImage && (
                          <div>
                            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                              {language === 'en' ? 'Reference Image' : 'නිර්දේශිත ඡායාරූපය'}
                            </h4>
                            <div className="max-w-xs bg-accent/20 border border-border rounded-none overflow-hidden">
                              <img
                                src={order.referenceImage}
                                alt="Reference Design"
                                className="w-full h-auto object-cover rounded-none"
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Location & Contact */}
                      <div className="md:col-span-4 space-y-4 md:border-l md:border-border/40 md:pl-6">
                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                            {language === 'en' ? 'Location' : 'ස්ථානය'}
                          </span>
                          <span className="text-xs font-semibold text-foreground">
                            {order.deliveryLocation || (order as any).pickupLocation || (order as any).location || 'N/A'}
                          </span>
                        </div>

                        <div className="space-y-1">
                          <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                            Contact Details
                          </span>
                          <span className="text-xs font-medium text-foreground block">
                            Phone: {order.mobile || (order as any).phone || 'N/A'}
                          </span>
                          {(order.whatsapp || (order as any).whatsappNumber) && (order.whatsapp || (order as any).whatsappNumber) !== (order.mobile || (order as any).phone) && (
                            <span className="text-xs font-medium text-foreground block">
                              WhatsApp: {order.whatsapp || (order as any).whatsappNumber}
                            </span>
                          )}
                        </div>
                      </div>

                    </div>

                    {/* Admin Response Section */}
                    <div className="pt-4 border-t border-border/40 mt-4 space-y-3">
                      <span className="text-[10px] text-primary uppercase font-bold block tracking-wider font-semibold">
                        {language === 'en' ? "Bakery Response" : "ක්වීන්ස් බේකරි පිළිතුර"}
                      </span>
                      
                      {order.respondedAt ? (
                        <div className="bg-primary/5 border border-primary/10 p-4 rounded-2xl space-y-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                {language === 'en' ? "Quoted Price" : "ලබාදුන් මිල"}
                              </span>
                              <span className="text-sm font-serif font-semibold text-primary">
                                {order.quotedPrice || 'N/A'}
                              </span>
                            </div>

                            <div>
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                {language === 'en' ? "Last Updated On" : "අවසන් වරට යාවත්කාලීන කලේ"}
                              </span>
                              <span className="text-xs font-semibold text-foreground">
                                {formatTimestamp(order.respondedAt || order.updatedAt)}
                              </span>
                            </div>
                          </div>

                          {order.adminMessage && (
                            <div className="space-y-1 pt-2 border-t border-border/40">
                              <span className="text-[10px] text-muted-foreground uppercase font-bold block">
                                {language === 'en' ? "Message from Bakery" : "බේකරියෙන් පණිවිඩය"}
                              </span>
                              <p className="text-xs font-light text-foreground leading-relaxed whitespace-pre-wrap">
                                {order.adminMessage}
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
