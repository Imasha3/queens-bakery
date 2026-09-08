'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { subscribeCustomerNotifications, CustomerNotification } from '@/lib/notifications';

export default function AccountPage() {
  const { user, profile, loading, logout } = useAuth();
  const { language } = useApp();
  const router = useRouter();
  const [notifications, setNotifications] = useState<CustomerNotification[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (!user?.uid) return;
    const unsubscribe = subscribeCustomerNotifications(user.uid, (data) => {
      setNotifications(data);
    });
    return () => unsubscribe();
  }, [user?.uid]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
        <Navbar />
        <main className="flex-grow flex flex-col items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
            <span className="text-xs font-semibold text-muted-foreground tracking-widest uppercase animate-pulse">
              {language === 'en' ? 'Checking session...' : 'සැසිය පරීක්ෂා කරමින්...'}
            </span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!user) return null;

  const customerName = profile?.fullName || user.displayName || 'Guest Customer';
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">
              {language === 'en' ? 'Customer Account' : 'පාරිභෝගික ගිණුම'}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {language === 'en' ? `Welcome, ${customerName}` : `සාදරයෙන් පිළිගනිමු, ${customerName}`}
            </h1>
            <div className="h-1 w-12 bg-primary rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Customer Details Dashboard */}
            <div className="lg:col-span-8 bg-card border border-border p-6 sm:p-8 rounded-none shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-foreground border-b border-border/60 pb-3">
                {language === 'en' ? 'Profile Details' : 'පෞද්ගලික විස්තර'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">
                    {language === 'en' ? 'Full Name' : 'සම්පූර්ණ නම'}
                  </span>
                  <span className="text-sm font-bold text-foreground">
                    {customerName}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">
                    {language === 'en' ? 'Email Address' : 'විද්‍යුත් තැපෑල'}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {user.email}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">
                    {language === 'en' ? 'Mobile Phone' : 'දුරකථන අංකය'}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {profile?.phone || 'Not Provided'}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">
                    WhatsApp Number
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {profile?.whatsapp || 'Not Provided'}
                  </span>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="pt-6 border-t border-border/40">
                <span className="text-xs text-muted-foreground block mb-3 font-semibold uppercase">
                  Account Activity & Shortcuts
                </span>
                <div className="flex flex-wrap gap-3">
                  <Link href="/account/inquiries" className="rounded-none border border-border hover:border-primary/50 text-xs font-semibold text-foreground px-5 py-3 hover:bg-accent/20 transition-colors block text-center shadow-xs">
                    📋 My Inquiries & Quotes
                  </Link>
                  <Link href="/account/orders" className="rounded-none border border-border hover:border-primary/50 text-xs font-semibold text-foreground px-5 py-3 hover:bg-accent/20 transition-colors block text-center shadow-xs">
                    🎂 My Custom Orders
                  </Link>
                </div>
              </div>
            </div>

            {/* Side Menu & Notification Overview */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Notification Summary Card */}
              <div className="bg-card border border-border p-6 rounded-none shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-border/60 pb-3">
                  <span className="font-serif text-sm font-bold text-foreground">
                    Bakery Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="bg-rose-500 text-white text-[10px] font-bold px-2 py-0.5">
                      {unreadCount} Unread
                    </span>
                  )}
                </div>

                {notifications.length === 0 ? (
                  <p className="text-xs text-muted-foreground">
                    No active notifications. When our bakers reply to your inquiry or custom order, you will see updates here.
                  </p>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {notifications.slice(0, 3).map((n) => (
                      <Link
                        key={n.id}
                        href={n.targetType === 'customOrders' ? '/account/orders' : '/account/inquiries'}
                        className={`block p-3 border text-xs transition-colors ${
                          n.read ? 'bg-background/40 border-border/60' : 'bg-primary/10 border-primary/30 font-semibold'
                        }`}
                      >
                        <p className="font-bold text-foreground line-clamp-1">{n.title}</p>
                        <p className="text-muted-foreground line-clamp-1 text-[11px]">{n.message}</p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Logout Card */}
              <div className="bg-card border border-border p-6 rounded-none shadow-sm space-y-4">
                <span className="text-xs text-muted-foreground block font-semibold uppercase pb-2 border-b border-border/60">
                  Account Control
                </span>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center rounded-none bg-primary text-primary-foreground py-3 text-xs font-semibold hover:opacity-95 transition-opacity cursor-pointer"
                >
                  Logout
                </button>
              </div>

            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
