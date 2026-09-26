'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Lock, Mail, Building, ArrowRight, ShieldCheck, CheckCircle2, AlertCircle } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check your credentials.');
      }

      login(data.token, data.user);

      if (data.user.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/');
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fillCredentials = (userEmail: string, userPass: string) => {
    setEmail(userEmail);
    setPassword(userPass);
    setError(null);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-3xl shadow-xl border border-slate-200">
        {/* Brand Header */}
        <div className="text-center">
          <div className="w-16 h-16 bg-smm-blue rounded-2xl mx-auto flex items-center justify-center shadow-lg border-2 border-smm-mint/60 mb-4">
            <div className="flex flex-col items-center justify-center leading-none">
              <span className="text-white font-black text-2xl">SMM</span>
              <span className="text-[10px] text-smm-mint font-bold tracking-widest mt-0.5">ERODE</span>
            </div>
          </div>
          <h2 className="text-2xl font-black text-smm-blue tracking-tight">
            Sakthimurugan Medical Agencies
          </h2>
          <p className="text-xs text-slate-500 font-semibold mt-1">
            Wholesale B2B Pharmacy Portal • Sign In
          </p>
        </div>

        {/* Demo Fast-Login Buttons */}
        <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200 space-y-2">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider text-center">
            One-Click Demo Credentials:
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => fillCredentials('erode_pharmacy@gmail.com', 'Retailer@123')}
              className="bg-white hover:bg-emerald-50 hover:border-emerald-300 border border-slate-200 p-2 rounded-xl text-left transition"
            >
              <div className="font-bold text-slate-900">Erode Medicals</div>
              <div className="text-[10px] text-emerald-700 font-semibold">Approved Retailer</div>
            </button>

            <button
              type="button"
              onClick={() => fillCredentials('admin@sakthimurugan.com', 'Admin@123')}
              className="bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 p-2 rounded-xl text-left transition"
            >
              <div className="font-bold text-slate-900">Wholesale Admin</div>
              <div className="text-[10px] text-smm-blue font-semibold">Manager / Owner</div>
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 p-3.5 rounded-xl flex items-center gap-2.5 text-xs text-rose-800">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Registered Email ID
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="pharmacy@gmail.com"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-smm-blue focus:bg-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase mb-1">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-smm-blue focus:bg-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-smm-blue hover:bg-smm-blue-dark disabled:bg-slate-400 text-white font-bold py-3 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-md shadow-blue-900/20"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <>
                <span>Sign In to Wholesale Portal</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-500">
            Don&apos;t have a registered wholesale account yet?{' '}
            <Link href="/register" className="font-bold text-smm-blue hover:underline">
              Register Retail Shop
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
