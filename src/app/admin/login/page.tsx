'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/AdminAuthContext';
import Logo from '@/components/Logo';

export default function AdminLoginPage() {
  const { adminLogin, error, loading } = useAdminAuth();
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');

    if (!email || !password) {
      setLocalError('Please enter both email and password.');
      return;
    }

    setSubmitting(false);
    try {
      await adminLogin(email, password);
      // On success, redirect to dashboard
      router.push('/admin');
    } catch (err: any) {
      console.error('Admin login component catch:', err);
      // Fallback message if context didn't set a clear message
      if (!error) {
        setLocalError(err.message || 'Authentication failed.');
      }
    }
  };

  const activeError = localError || error;

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 p-8 md:p-10 rounded-3xl shadow-2xl space-y-8">
        
        {/* Header / Logo */}
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="scale-110 pointer-events-none">
            <Logo />
          </div>
          <div className="space-y-1">
            <h2 className="font-serif text-2xl font-bold tracking-tight text-white">
              Admin Portal
            </h2>
            <p className="text-xs text-slate-400 font-light">
              Queen's Bakery Management Console
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          
          {activeError && (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/20 p-3.5 text-xs text-rose-400 font-semibold text-center animate-in fade-in duration-200">
              ⚠️ {activeError}
            </div>
          )}

          <div className="space-y-4">
            {/* Email field */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="admin-email" className="text-xs font-semibold text-slate-300">
                Admin Email
              </label>
              <input
                id="admin-email"
                type="email"
                required
                placeholder="admin@queensbakery.lk"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>

            {/* Password field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center justify-between">
                <label htmlFor="admin-password" className="text-xs font-semibold text-slate-300">
                  Password
                </label>
              </div>
              <input
                id="admin-password"
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="rounded-xl border border-slate-800 bg-slate-950 px-4 py-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-primary transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full flex items-center justify-center rounded-xl bg-primary text-primary-foreground py-4 text-xs font-semibold hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-md"
          >
            {submitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded-full border-2 border-primary-foreground border-t-transparent animate-spin" />
                <span>Authenticating...</span>
              </div>
            ) : (
              <span>Sign In to Admin Portal</span>
            )}
          </button>

        </form>

        <div className="text-center pt-2">
          <p className="text-[11px] font-light text-slate-500">
            Protected area. Authorized personnel only.
          </p>
        </div>

      </div>
    </div>
  );
}
