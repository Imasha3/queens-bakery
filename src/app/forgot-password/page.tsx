'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useApp } from '@/context/AppContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();
  const { language } = useApp();

  const [email, setEmail] = useState('');
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);

    if (!email) {
      setError(language === 'en' ? 'Please enter your email address.' : 'කරුණාකර විද්‍යුත් තැපෑල ඇතුළත් කරන්න.');
      return;
    }

    setLoading(true);
    try {
      await resetPassword(email);
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setError(language === 'en' ? 'No user found with this email address.' : 'මෙම විද්‍යුත් තැපෑලට අදාළ පරිශීලකයෙකු හමු නොවීය.');
      } else {
        setError(err.message || 'Error sending password reset link. Please try again.');
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
              {language === 'en' ? 'Reset Password' : 'මුරපදය නැවත සකසන්න'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {language === 'en' ? 'Enter your email to receive a password reset link' : 'මුරපදය නැවත සැකසීමේ සබැඳිය ලබා ගැනීමට විද්‍යුත් තැපෑල ඇතුළත් කරන්න'}
            </p>
          </div>

          {/* Form */}
          {success ? (
            <div className="space-y-6 py-4 text-center">
              <div className="rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4 text-xs text-emerald-600 font-semibold leading-relaxed animate-in fade-in duration-200">
                ✔️ {language === 'en' ? 'Password reset link sent! Check your email inbox.' : 'මුරපදය නැවත සැකසීමේ සබැඳිය සාර්ථකව විද්‍යුත් තැපෑලට යවන ලදී. ඔබගේ විද්‍යුත් තැපෑල පරීක්ෂා කරන්න.'}
              </div>
              <Link href="/login" className="block w-full text-center rounded-xl bg-primary text-primary-foreground py-3.5 text-xs font-semibold shadow-md">
                {language === 'en' ? 'Return to Login' : 'නැවත ඇතුල් වීමට යන්න'}
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="rounded-xl bg-primary/10 border border-primary/20 p-3.5 text-xs text-primary font-semibold text-center animate-in fade-in duration-200">
                  ⚠️ {error}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label htmlFor="reset-email" className="text-xs font-semibold text-foreground/95">
                  {language === 'en' ? 'Email Address' : 'විද්‍යුත් තැපෑල'} *
                </label>
                <input
                  id="reset-email"
                  type="email"
                  required
                  placeholder="jane@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="rounded-xl border border-border bg-background px-4 py-3 text-xs text-foreground focus:outline-none focus:border-primary/60 transition-colors"
                />
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
                    <span>{language === 'en' ? 'Sending Link...' : 'සබැඳිය යවමින්...'}</span>
                  </div>
                ) : (
                  <span>{language === 'en' ? 'Send Reset Link' : 'සබැඳිය එවන්න'}</span>
                )}
              </button>
            </form>
          )}

          {/* Return link */}
          <div className="text-center pt-2">
            <Link href="/login" className="text-xs font-semibold text-primary hover:underline">
              {language === 'en' ? 'Back to Login' : 'නැවත ඇතුල් වීමට'}
            </Link>
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
