'use client';

import React, { useState } from 'react';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  User,
  Mail,
  Palette,
  LogOut,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
  ShieldCheck,
  Database,
  Layers
} from 'lucide-react';

export default function SettingsPage() {
  const { user, theme, setThemePreference, logout, loading } = useAuth();
  const { success, info } = useToast();
  const [savingTheme, setSavingTheme] = useState(false);

  const handleThemeChange = async (selected: 'dark' | 'light' | 'system') => {
    setSavingTheme(true);
    await setThemePreference(selected);
    success(`Theme preference (${selected}) saved to database.`);
    setSavingTheme(false);
  };

  const handleSignOut = async () => {
    await logout();
    success('Signed out successfully.');
  };

  if (loading) return null;

  return (
    <AppShell projectName="Settings & Preferences">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Title Header */}
        <div className="pb-4 border-b border-light-border dark:border-dark-border">
          <h1 className="text-2xl font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary">
            Account Settings & Preferences
          </h1>
          <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
            Manage your developer profile, color theme preferences, and authentication session.
          </p>
        </div>

        {/* Profile Section */}
        <div className="p-6 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-light-border dark:border-dark-border">
            <User className="w-4 h-4 text-light-accent dark:text-dark-accent" />
            <h2 className="text-sm font-bold text-light-textPrimary dark:text-dark-textPrimary">
              Developer Profile
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1 font-mono">
                Full Name
              </label>
              <div className="px-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-elevated/60 dark:bg-dark-elevated/60 text-light-textPrimary dark:text-dark-textPrimary font-medium">
                {user?.name || 'Developer'}
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1 font-mono">
                Email Address
              </label>
              <div className="px-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-elevated/60 dark:bg-dark-elevated/60 text-light-textPrimary dark:text-dark-textPrimary font-medium">
                {user?.email || 'developer@company.com'}
              </div>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="mt-4 pt-4 border-t border-light-border dark:border-dark-border grid grid-cols-3 gap-3 text-center">
            <div className="p-3 rounded-lg bg-light-elevated/40 dark:bg-dark-elevated/40 border border-light-border dark:border-dark-border">
              <span className="text-base font-bold font-mono text-light-textPrimary dark:text-dark-textPrimary">
                {user?.stats?.projects ?? 1}
              </span>
              <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary">Active Projects</p>
            </div>
            <div className="p-3 rounded-lg bg-light-elevated/40 dark:bg-dark-elevated/40 border border-light-border dark:border-dark-border">
              <span className="text-base font-bold font-mono text-blue-500">
                {user?.stats?.conversions ?? 0}
              </span>
              <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary">Conversions</p>
            </div>
            <div className="p-3 rounded-lg bg-light-elevated/40 dark:bg-dark-elevated/40 border border-light-border dark:border-dark-border">
              <span className="text-base font-bold font-mono text-emerald-500">
                {user?.stats?.tests ?? 0}
              </span>
              <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary">Verified Tests</p>
            </div>
          </div>
        </div>

        {/* Appearance Section */}
        <div className="p-6 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2">
              <Palette className="w-4 h-4 text-light-accent dark:text-dark-accent" />
              <h2 className="text-sm font-bold text-light-textPrimary dark:text-dark-textPrimary">
                Appearance & Theme
              </h2>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-medium">
              Database Synced
            </span>
          </div>

          <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary leading-normal">
            Choose your preferred interface theme. Your choice is automatically persisted to the database and will be restored whenever you log in.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
            {/* Dark */}
            <button
              type="button"
              onClick={() => handleThemeChange('dark')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-3 ${
                theme === 'dark'
                  ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                  : 'border-light-border dark:border-dark-border hover:bg-light-elevated/60 dark:hover:bg-dark-elevated/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Moon className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-bold text-light-textPrimary dark:text-dark-textPrimary">Dark Theme</span>
                </div>
                {theme === 'dark' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#0F1319] border border-[#2B3440]" title="Background: #0F1319" />
                <span className="w-4 h-4 rounded bg-[#171C23] border border-[#2B3440]" title="Surface: #171C23" />
                <span className="w-4 h-4 rounded bg-[#6D8DFF]" title="Accent: #6D8DFF" />
                <span className="w-4 h-4 rounded bg-[#39B77A]" title="Success: #39B77A" />
              </div>
              <span className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary">
                Precision high-contrast dark mode
              </span>
            </button>

            {/* Light */}
            <button
              type="button"
              onClick={() => handleThemeChange('light')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-3 ${
                theme === 'light'
                  ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                  : 'border-light-border dark:border-dark-border hover:bg-light-elevated/60 dark:hover:bg-dark-elevated/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span className="text-xs font-bold text-light-textPrimary dark:text-dark-textPrimary">Light Theme</span>
                </div>
                {theme === 'light' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-[#F7F8FA] border border-[#DCE1E8]" title="Background: #F7F8FA" />
                <span className="w-4 h-4 rounded bg-[#FFFFFF] border border-[#DCE1E8]" title="Surface: #FFFFFF" />
                <span className="w-4 h-4 rounded bg-[#4169E1]" title="Accent: #4169E1" />
                <span className="w-4 h-4 rounded bg-[#218653]" title="Success: #218653" />
              </div>
              <span className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary">
                Calm technical light mode
              </span>
            </button>

            {/* System */}
            <button
              type="button"
              onClick={() => handleThemeChange('system')}
              className={`p-4 rounded-xl border text-left transition flex flex-col justify-between space-y-3 ${
                theme === 'system'
                  ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500'
                  : 'border-light-border dark:border-dark-border hover:bg-light-elevated/60 dark:hover:bg-dark-elevated/60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Monitor className="w-4 h-4 text-blue-500" />
                  <span className="text-xs font-bold text-light-textPrimary dark:text-dark-textPrimary">System Match</span>
                </div>
                {theme === 'system' && <CheckCircle2 className="w-3.5 h-3.5 text-blue-500" />}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-4 h-4 rounded bg-gradient-to-r from-[#0F1319] to-[#FFFFFF] border border-[#2B3440]" />
                <span className="w-4 h-4 rounded bg-blue-600" />
              </div>
              <span className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary">
                Synchronize with OS theme
              </span>
            </button>
          </div>
        </div>

        {/* Account & Security Section */}
        <div className="p-6 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
          <div className="flex items-center gap-2 pb-3 border-b border-light-border dark:border-dark-border">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h2 className="text-sm font-bold text-light-textPrimary dark:text-dark-textPrimary">
              Session & Security
            </h2>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold text-light-textPrimary dark:text-dark-textPrimary">
                Active Authenticated Session
              </p>
              <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary mt-0.5">
                JWT signed session token with secure cookie storage.
              </p>
            </div>

            <button
              onClick={handleSignOut}
              className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/30 hover:bg-rose-100 dark:hover:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded-lg transition flex items-center gap-2"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
