'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function LoginPage() {
  const { login } = useAuth();
  const { language } = useApp();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError(language === 'en' ? 'Please fill in all fields.' : 'කරුණාකර සියලුම තොරතුරු ඇතුළත් කරන්න.');
      return;
    }

    setLoading(true);
    try {
      await login(email, password);
      router.push('/account');
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setError(language === 'en' ? 'Invalid email or password.' : 'වැරදි විද්‍යුත් තැපෑලක් හෝ මුරපදයක්.');
      } else {
        setError(err.message || 'Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground transition-colors duration-300">
      <Navbar />

      <main className="flex-grow flex items-center justify-center py-16 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md space-y-8 bg-card border border-border p-8 rounded-3xl shadow-xl">
          
          {/* Header */}
          <div className="text-center space-y-2">
            <h2 className="font-serif text-3xl font-bold tracking-tight text-foreground">
              {language === 'en' ? 'Login' : 'ඇතුල් වන්න'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Log in to view inquiries and custom orders' : 'ඇණවුම් සහ විමසීම් බැලීම සඳහා ගිණුමට ඇතුල් වන්න'}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-xl bg-primary/10 border border-primary/20 p-3.5 text-xs text-primary font-semibold text-center animate-in fade-in duration-200">
                ⚠️ {error}
              </div>
            )}

            <div className="space-y-4">
              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="login-email" className="text-xs font-semibold text-foreground/95">
                  {language === 'en' ? 'Email Address' : 'විද්‍යුත් තැපෑල'} *
                </label>
                <input
                  id="login-email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <div className="flex justify-between items-center">
                  <label htmlFor="login-pass" className="text-xs font-semibold text-foreground/95">
                    {language === 'en' ? 'Password' : 'මුරපදය'} *
                  </label>
                  <Link href="/forgot-password" className="text-[10px] text-primary font-semibold hover:underline">
                    {language === 'en' ? 'Forgot Password?' : 'මුරපදය අමතකද?'}
                  </Link>
                </div>
                <input
                  id="login-pass"
                  type="password"
                  required
                  placeholder="••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
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
                  <span>{language === 'en' ? 'Logging in...' : 'ඇතුල් වෙමින්...'}</span>
                </div>
              ) : (
                <span>{language === 'en' ? 'Login' : 'ඇතුල් වන්න'}</span>
              )}
            </button>
          </form>

          {/* Registration Redirect Link */}
          <div className="text-center pt-2">
            <span className="text-xs text-muted-foreground">
              {language === 'en' ? "Don't have an account? " : "ගිණුමක් නොමැතිද? "}
              <Link href="/register" className="font-semibold text-primary hover:underline">
                {language === 'en' ? 'Create one' : 'ගිණුමක් සාදන්න'}
              </Link>
            </span>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
