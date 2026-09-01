'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function RegisterPage() {
  const { register } = useAuth();
  const { language } = useApp();
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validations
    if (!fullName || !email || !phone || !whatsapp || !password || !confirmPassword) {
      setError(language === 'en' ? 'All fields are required.' : 'සියලුම ක්ෂේත්‍ර අනිවාර්ය වේ.');
      return;
    }

    // Email regex validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError(language === 'en' ? 'Please enter a valid email address.' : 'කරුණාකර වලංගු විද්‍යුත් තැපැල් ලිපිනයක් ඇතුළත් කරන්න.');
      return;
    }

    if (password.length < 6) {
      setError(language === 'en' ? 'Password must be at least 6 characters.' : 'මුරපදය අවම වශයෙන් අක්ෂර 6ක් විය යුතුය.');
      return;
    }

    if (password !== confirmPassword) {
      setError(language === 'en' ? 'Passwords do not match.' : 'මුරපද නොගැලපේ.');
      return;
    }

    setLoading(true);
    try {
      await register(email, password, fullName, phone, whatsapp, language);
      router.push('/account');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/email-already-in-use') {
        setError(language === 'en' ? 'Email is already registered.' : 'මෙම විද්‍යුත් තැපෑල දැනටමත් ලියාපදිංචි කර ඇත.');
      } else {
        setError(err.message || 'Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-card border border-border p-8 rounded-3xl shadow-xl">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              {language === 'en' ? 'Create Account' : 'ගිණුමක් සාදන්න'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Register to manage inquiries and custom orders' : 'විමසීම් සහ ඇණවුම් සඳහා ගිණුමක් සාදන්න'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3.5 text-xs text-primary font-semibold text-center animate-in fade-in duration-200">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-4 rounded-md">
              {/* Full Name */}
              <div className="flex flex-col gap-1">
                <label htmlFor="reg-name" className="text-xs font-semibold text-foreground/95">
                  {language === 'en' ? 'Full Name' : 'සම්පූර්ණ නම'} *
                </label>
                <input
                  id="reg-name"
                  type="text"
                  required
                  placeholder="Jane Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1">
                <label htmlFor="reg-email" className="text-xs font-semibold text-foreground/95">
                  {language === 'en' ? 'Email Address' : 'විද්‍යුත් තැපෑල'} *
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              {/* Phone Details Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Mobile */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-phone" className="text-xs font-semibold text-foreground/95">
                    {language === 'en' ? 'Mobile Number' : 'දුරකථන අංකය'} *
                  </label>
                  <input
                    id="reg-phone"
                    type="tel"
                    required
                    placeholder="+94 7X XXX XXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>

                {/* WhatsApp */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-whatsapp" className="text-xs font-semibold text-foreground/95">
                    WhatsApp Number *
                  </label>
                  <input
                    id="reg-whatsapp"
                    type="tel"
                    required
                    placeholder="+94 7X XXX XXXX"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
              </div>

              {/* Passwords Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Password */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-pass" className="text-xs font-semibold text-foreground/95">
                    {language === 'en' ? 'Password' : 'මුරපදය'} *
                  </label>
                  <input
                    id="reg-pass"
                    type="password"
                    required
                    placeholder="••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>

                {/* Confirm Password */}
                <div className="flex flex-col gap-1">
                  <label htmlFor="reg-confirm" className="text-xs font-semibold text-foreground/95">
                    {language === 'en' ? 'Confirm Password' : 'මුරපදය තහවුරු කරන්න'} *
                  </label>
                  <input
                    id="reg-confirm"
                    type="password"
                    required
                    placeholder="••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center rounded-xl bg-primary text-primary-foreground py-4 text-xs font-semibold shadow-lg hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                  <span>{language === 'en' ? 'Creating Account...' : 'ගිණුම සකසමින්...'}</span>
                </div>
              ) : (
                <span>{language === 'en' ? 'Register' : 'ලියාපදිංචි වන්න'}</span>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="text-center pt-2">
            <span className="text-xs text-muted-foreground">
              {language === 'en' ? 'Already have an account? ' : 'දැනටමත් ගිණුමක් තිබේද? '}
              <Link href="/login" className="font-semibold text-primary hover:underline">
                {language === 'en' ? 'Login here' : 'මෙහි ඇතුල් වන්න'}
              </Link>
            </span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
