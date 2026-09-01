'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  const { adminUser, isAdmin, loading, adminLogin, error: authError, setError } = useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  // If already logged in as authorized admin, redirect to dashboard
  useEffect(() => {
    if (!loading && adminUser && isAdmin) {
      router.push('/admin');
    }
  }, [adminUser, isAdmin, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    setError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setLocalLoading(true);
    try {
      await adminLogin(email, password);
      router.push('/admin');
    } catch (err: any) {
      console.error('Admin login error:', err);
      setLocalError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLocalLoading(false);
    }
  };

  const activeError = localError || authError;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 rounded-none shadow-2xl space-y-8">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="scale-110 pointer-events-none">
            <Logo />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
              Admin Portal
            </h2>
            <p className="text-xs text-slate-400">
              Sign in to manage orders, bakes and customer messages
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {activeError && (
            <div className="rounded-none bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400 font-semibold text-center animate-in fade-in duration-200">
              ⚠️ {activeError}
            </div>
          )}

          <div className="space-y-4">
            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">
                Email Address *
              </label>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="admin@queensbakery.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                className="rounded-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                disabled={localLoading || loading}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-pass" className="text-xs font-semibold text-slate-300">
                Password *
              </label>
              <input
                id="admin-pass"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setError('');
                }}
                className="rounded-none border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
                disabled={localLoading || loading}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={localLoading || loading}
            className="w-full flex items-center justify-center rounded-none bg-primary text-primary-foreground py-4 text-xs font-semibold hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
          >
            {localLoading || loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Authenticating Admin...</span>
              </div>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center pt-2">
          <a href="/" className="text-xs font-semibold text-slate-400 hover:text-white transition-colors">
            ← Return to Queen's Bakery Store
          </a>
        </div>

      </div>
    </div>
  );
}
