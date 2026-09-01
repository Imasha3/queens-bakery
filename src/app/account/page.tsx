'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function AccountPage() {
  const { user, profile, loading, logout } = useAuth();
  const { language } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

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
        <main className="flex-grow flex flex-col items-center justify-center">
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

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
          
          {/* Header */}
          <div className="space-y-2">
            <span className="text-xs font-semibold text-primary tracking-widest uppercase">
              {language === 'en' ? 'Customer Space' : 'පාරිභෝගික ගිණුම'}
            </span>
            <h1 className="font-serif text-3xl md:text-4xl font-bold tracking-tight text-foreground">
              {language === 'en' ? 'My Account' : 'මගේ ගිණුම'}
            </h1>
            <div className="h-1 w-12 bg-primary rounded-full mt-2" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Customer Details Dashboard */}
            <div className="lg:col-span-8 bg-card border border-border p-6 sm:p-8 rounded-3xl shadow-sm space-y-6">
              <h3 className="font-serif text-lg font-bold text-foreground border-b border-border/60 pb-3">
                {language === 'en' ? 'Profile Information' : 'පෞද්ගලික විස්තර'}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <span className="text-xs text-muted-foreground font-semibold uppercase block">
                    {language === 'en' ? 'Full Name' : 'සම්පූර්ණ නම'}
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {profile?.fullName || user.displayName || 'Guest Customer'}
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
                    {language === 'en' ? 'Mobile Number' : 'දුරකථන අංකය'}
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

              {/* simulated options */}
              <div className="pt-6 border-t border-border/40">
                <span className="text-xs text-muted-foreground block mb-3 font-semibold uppercase">
                  Quick Actions
                </span>
                <div className="flex flex-wrap gap-3">
                  <Link href="/account/inquiries" className="rounded-xl border border-border hover:border-primary/50 text-xs font-semibold text-foreground px-5 py-3 hover:bg-accent/10 transition-colors block text-center">
                    📋 My Inquiries
                  </Link>
                  <Link href="/account/orders" className="rounded-xl border border-border hover:border-primary/50 text-xs font-semibold text-foreground px-5 py-3 hover:bg-accent/10 transition-colors block text-center">
                    🎂 My Orders
                  </Link>
                  <button onClick={() => alert("Profile edits will be available soon!")} className="rounded-xl border border-border hover:border-primary/50 text-xs font-semibold text-foreground px-5 py-3 hover:bg-accent/10 transition-colors">
                    ⚙️ Edit Profile
                  </button>
                </div>
              </div>
            </div>

            {/* Side Menu */}
            <div className="lg:col-span-4 bg-card border border-border p-6 rounded-3xl shadow-sm space-y-4">
              <span className="text-xs text-muted-foreground block font-semibold uppercase pb-2 border-b border-border/60">
                Account Control
              </span>
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center rounded-xl bg-primary text-primary-foreground py-3 text-xs font-semibold hover:opacity-95 transition-opacity"
              >
                Logout
              </button>
            </div>

          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
