'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  ArrowRightLeft,
  Lock,
  Mail,
  User,
  CheckCircle2,
  Cpu,
  FileCheck2,
  GitCompare,
  Database,
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

export default function HomePage() {
  const { user, login, register, loading } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // If already authenticated, redirect to workspace
  useEffect(() => {
    if (!loading && user) {
      router.push('/workspace');
    }
  }, [user, loading, router]);

  const calculatePasswordStrength = (pwd: string) => {
    if (!pwd) return 0;
    let score = 0;
    if (pwd.length >= 6) score += 25;
    if (pwd.length >= 10) score += 25;
    if (/[A-Z]/.test(pwd)) score += 25;
    if (/[0-9!@#$%^&*]/.test(pwd)) score += 25;
    return score;
  };

  const strength = calculatePasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (mode === 'signup') {
      if (!name.trim()) {
        setFormError('Please enter your full name.');
        return;
      }
      if (!email.trim() || !email.includes('@')) {
        setFormError('Please provide a valid email address.');
        return;
      }
      if (password.length < 6) {
        setFormError('Password must be at least 6 characters.');
        return;
      }
      if (password !== confirmPassword) {
        setFormError('Passwords do not match.');
        return;
      }

      setSubmitting(true);
      const res = await register({ name, email, password, confirmPassword });
      setSubmitting(false);

      if (res.success) {
        success('Account created successfully! Welcome to Legacy → Modern.');
        router.push('/workspace');
      } else {
        setFormError(res.error || 'Failed to create account.');
        toastError(res.error || 'Registration failed.');
      }
    } else {
      if (!email.trim() || !password) {
        setFormError('Please enter both email and password.');
        return;
      }

      setSubmitting(true);
      const res = await login(email, password);
      setSubmitting(false);

      if (res.success) {
        success('Signed in successfully.');
        router.push('/workspace');
      } else {
        setFormError(res.error || 'Invalid credentials.');
        toastError(res.error || 'Invalid credentials.');
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg dark:bg-dark-bg">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 animate-pulse flex items-center justify-center text-white">
            <ArrowRightLeft className="w-4 h-4 animate-spin" />
          </div>
          <p className="text-xs font-mono text-light-textSecondary dark:text-dark-textSecondary">
            Initializing secure workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-between bg-light-bg dark:bg-dark-bg text-light-textPrimary dark:text-dark-textPrimary">
      {/* Top minimal bar */}
      <header className="px-6 py-4 flex items-center justify-between border-b border-light-border dark:border-dark-border bg-light-surface/60 dark:bg-dark-surface/60 backdrop-blur-md sticky top-0 z-20">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-sm">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-sm tracking-tight text-light-textPrimary dark:text-dark-textPrimary">Legacy</span>
            <span className="text-light-accent dark:text-dark-accent font-mono font-bold text-xs">→</span>
            <span className="font-semibold text-sm tracking-tight text-light-accent dark:text-dark-accent">Modern</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setMode('signin');
              setFormError(null);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              mode === 'signin'
                ? 'bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary border border-light-border dark:border-dark-border'
                : 'text-light-textSecondary dark:text-dark-textSecondary hover:text-light-textPrimary'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setFormError(null);
            }}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              mode === 'signup'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary hover:bg-light-border dark:hover:bg-dark-border'
            }`}
          >
            Create Account
          </button>
        </div>
      </header>

      {/* Main hero & auth container */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 py-8 md:py-16 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left column: Value Proposition & Product Identity */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-blue-500/20 bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-mono font-medium">
            <Zap className="w-3.5 h-3.5" />
            <span>AI-Assisted Legacy Migration Engine</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary leading-tight">
            Transform legacy code into modern, <span className="text-light-accent dark:text-dark-accent">production-ready</span> applications.
          </h1>

          <p className="text-sm md:text-base text-light-textSecondary dark:text-dark-textSecondary leading-relaxed max-w-xl">
            Modernize jQuery, AngularJS, ES5 callbacks, and legacy architectures into type-safe React + TypeScript with automated behavioral test verification.
          </p>

          {/* Value Props Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
            <div className="p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-light-textPrimary dark:text-dark-textPrimary">
                <Cpu className="w-4 h-4 text-light-accent dark:text-dark-accent" />
                <span>AST & AI Code Synthesis</span>
              </div>
              <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary leading-normal">
                Converts DOM mutation and callbacks into React hooks, state models, and async/await.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-light-textPrimary dark:text-dark-textPrimary">
                <FileCheck2 className="w-4 h-4 text-emerald-500" />
                <span>Behavioral Test Harness</span>
              </div>
              <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary leading-normal">
                Auto-generates unit and behavioral test suites to guarantee behavioral parity.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-light-textPrimary dark:text-dark-textPrimary">
                <GitCompare className="w-4 h-4 text-amber-500" />
                <span>Clean Code Diff Viewer</span>
              </div>
              <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary leading-normal">
                Review side-by-side modifications with syntax highlighting and deprecated API flags.
              </p>
            </div>

            <div className="p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-semibold text-light-textPrimary dark:text-dark-textPrimary">
                <Database className="w-4 h-4 text-indigo-500" />
                <span>Full Relational Persistence</span>
              </div>
              <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary leading-normal">
                Every project, conversion, test run, and theme preference is securely saved in Prisma ORM.
              </p>
            </div>
          </div>
        </div>

        {/* Right column: Authentication Card */}
        <div className="lg:col-span-5">
          <div className="p-6 md:p-8 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-2xl relative overflow-hidden">
            <div className="mb-6 space-y-1">
              <h2 className="text-xl font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary">
                {mode === 'signup' ? 'Create developer account' : 'Sign in to workspace'}
              </h2>
              <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                {mode === 'signup'
                  ? 'Get started with AI-driven legacy code modernization.'
                  : 'Enter your credentials to access your saved conversions.'}
              </p>
            </div>

            {/* Error Message */}
            {formError && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium">
                {formError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-light-textSecondary dark:text-dark-textSecondary absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-light-textSecondary dark:text-dark-textSecondary absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="developer@company.com"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-light-textSecondary dark:text-dark-textSecondary absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                {mode === 'signup' && password && (
                  <div className="mt-2 space-y-1">
                    <div className="w-full h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          strength < 50 ? 'bg-rose-500 w-1/3' : strength < 100 ? 'bg-amber-500 w-2/3' : 'bg-emerald-500 w-full'
                        }`}
                      />
                    </div>
                    <span className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary">
                      Password strength: {strength < 50 ? 'Weak' : strength < 100 ? 'Moderate' : 'Strong'}
                    </span>
                  </div>
                )}
              </div>

              {mode === 'signup' && (
                <div>
                  <label className="block text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1.5">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-light-textSecondary dark:text-dark-textSecondary absolute left-3 top-2.5" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={e => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2.5 px-4 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing securely...</span>
                  </>
                ) : (
                  <>
                    <span>{mode === 'signup' ? 'Create Account & Launch' : 'Sign In to Workspace'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-light-border dark:border-dark-border text-center">
              <button
                type="button"
                onClick={() => {
                  setMode(mode === 'signin' ? 'signup' : 'signin');
                  setFormError(null);
                }}
                className="text-xs text-light-accent dark:text-dark-accent hover:underline font-medium"
              >
                {mode === 'signin'
                  ? "Don't have an account? Create one now"
                  : 'Already registered? Sign in here'}
              </button>
            </div>

            <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px] text-light-textSecondary dark:text-dark-textSecondary">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Bcrypt hashed & JWT token authentication</span>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="px-6 py-4 border-t border-light-border dark:border-dark-border text-center text-xs text-light-textSecondary dark:text-dark-textSecondary">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Legacy → Modern AI Migration Platform © 2026. Production Full-Stack Edition.</span>
          <div className="flex items-center gap-4 text-[11px] font-mono">
            <span>Next.js 14 App Router</span>
            <span>•</span>
            <span>Prisma ORM</span>
            <span>•</span>
            <span>Relational SQLite</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
