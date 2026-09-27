'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  Sun,
  Moon,
  HelpCircle,
  Bell,
  User as UserIcon,
  LogOut,
  Settings as SettingsIcon,
  Layers,
  ArrowRightLeft,
  CheckCircle2,
  FolderGit2
} from 'lucide-react';

interface HeaderProps {
  currentProjectName?: string;
  onOpenMobileMenu?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ currentProjectName = 'Default Workspace Project', onOpenMobileMenu }) => {
  const { user, theme, setThemePreference, logout } = useAuth();
  const { success, info } = useToast();
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setNotificationsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setThemePreference(nextTheme);
    info(`Switched to ${nextTheme} theme.`);
  };

  const handleSignOut = async () => {
    await logout();
    success('Signed out successfully.');
  };

  return (
    <header className="h-[64px] border-b border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface px-4 md:px-6 flex items-center justify-between sticky top-0 z-30 transition-colors">
      {/* Left: Logo */}
      <div className="flex items-center gap-3">
        {onOpenMobileMenu && (
          <button
            onClick={onOpenMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-textSecondary dark:text-dark-textSecondary"
            aria-label="Toggle navigation menu"
          >
            <Layers className="w-5 h-5" />
          </button>
        )}
        <Link href="/workspace" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm group-hover:scale-105 transition-transform">
            <ArrowRightLeft className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-light-textPrimary dark:text-dark-textPrimary">Legacy</span>
              <span className="text-light-accent dark:text-dark-accent font-mono font-bold text-xs">→</span>
              <span className="font-semibold text-sm tracking-tight text-light-accent dark:text-dark-accent">Modern</span>
            </div>
            <span className="text-[10px] text-light-textSecondary dark:text-dark-textSecondary font-mono tracking-wider uppercase -mt-0.5">
              AI Code Platform
            </span>
          </div>
        </Link>
      </div>

      {/* Center: Current Workspace / Project */}
      <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-md border border-light-border dark:border-dark-border bg-light-elevated/60 dark:bg-dark-elevated/60">
        <FolderGit2 className="w-3.5 h-3.5 text-light-accent dark:text-dark-accent shrink-0" />
        <span className="text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary">Workspace:</span>
        <span className="text-xs font-semibold text-light-textPrimary dark:text-dark-textPrimary truncate max-w-[200px]">
          {currentProjectName}
        </span>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 md:gap-3">
        {/* Theme Switcher */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className="p-2 rounded-md hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-textSecondary dark:text-dark-textSecondary hover:text-light-textPrimary dark:hover:text-dark-textPrimary transition"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* Help Modal Trigger */}
        <button
          onClick={() => setHelpOpen(true)}
          title="Platform Guidance & Architecture"
          className="p-2 rounded-md hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-textSecondary dark:text-dark-textSecondary hover:text-light-textPrimary dark:hover:text-dark-textPrimary transition"
        >
          <HelpCircle className="w-4 h-4" />
        </button>

        {/* Notifications Popover */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotificationsOpen(!notificationsOpen)}
            title="System Notifications"
            className="p-2 rounded-md hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-textSecondary dark:text-dark-textSecondary hover:text-light-textPrimary dark:hover:text-dark-textPrimary transition relative"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-light-accent dark:bg-dark-accent"></span>
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 mt-2 w-80 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2 border-b border-light-border dark:border-dark-border flex items-center justify-between">
                <span className="text-xs font-semibold text-light-textPrimary dark:text-dark-textPrimary">System Notifications</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-light-accent/10 dark:bg-dark-accent/10 text-light-accent dark:text-dark-accent font-medium">Live</span>
              </div>
              <div className="divide-y divide-light-border dark:divide-dark-border text-xs">
                <div className="p-3 hover:bg-light-elevated/50 dark:hover:bg-dark-elevated/50 transition flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-light-textPrimary dark:text-dark-textPrimary">AI Engine Online</p>
                    <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary mt-0.5">
                      Modernization AST synthesizer and test runner ready.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Just now</span>
                  </div>
                </div>
                <div className="p-3 hover:bg-light-elevated/50 dark:hover:bg-dark-elevated/50 transition flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-light-textPrimary dark:text-dark-textPrimary">Database Connected</p>
                    <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary mt-0.5">
                      Prisma ORM SQLite relational tables active.
                    </p>
                    <span className="text-[10px] text-slate-400 mt-1 block">Active</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setProfileOpen(!profileOpen)}
            className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-lg border border-light-border dark:border-dark-border hover:bg-light-elevated dark:hover:bg-dark-elevated transition"
          >
            <div className="w-6 h-6 rounded-full bg-light-accent/20 dark:bg-dark-accent/20 text-light-accent dark:text-dark-accent flex items-center justify-center font-semibold text-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <span className="text-xs font-medium text-light-textPrimary dark:text-dark-textPrimary max-w-[120px] truncate hidden md:inline-block">
              {user?.name || 'Account'}
            </span>
          </button>

          {profileOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-xl py-2 z-50 animate-in fade-in zoom-in-95">
              <div className="px-4 py-2.5 border-b border-light-border dark:border-dark-border">
                <p className="text-xs font-semibold text-light-textPrimary dark:text-dark-textPrimary truncate">{user?.name}</p>
                <p className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary truncate">{user?.email}</p>
              </div>

              <div className="py-1">
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-light-textPrimary dark:text-dark-textPrimary hover:bg-light-elevated dark:hover:bg-dark-elevated transition"
                >
                  <UserIcon className="w-3.5 h-3.5 text-light-textSecondary dark:text-dark-textSecondary" />
                  <span>Profile Overview</span>
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2.5 px-4 py-2 text-xs text-light-textPrimary dark:text-dark-textPrimary hover:bg-light-elevated dark:hover:bg-dark-elevated transition"
                >
                  <SettingsIcon className="w-3.5 h-3.5 text-light-textSecondary dark:text-dark-textSecondary" />
                  <span>Settings & Preferences</span>
                </Link>
              </div>

              <div className="pt-1 border-t border-light-border dark:border-dark-border">
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition text-left"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Help Modal */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="max-w-md w-full rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
              <h3 className="text-base font-semibold text-light-textPrimary dark:text-dark-textPrimary">Legacy → Modern Guide</h3>
              <button
                onClick={() => setHelpOpen(false)}
                className="text-xs text-light-textSecondary dark:text-dark-textSecondary hover:text-light-textPrimary dark:hover:text-dark-textPrimary"
              >
                Close ✕
              </button>
            </div>
            <div className="space-y-3 text-xs text-light-textSecondary dark:text-dark-textSecondary leading-relaxed">
              <p>
                <strong className="text-light-textPrimary dark:text-dark-textPrimary">1. Code Modernization:</strong> Paste legacy code (jQuery, Backbone, old ES5 JS, XHR) on the Left editor, pick your target language, and click <span className="text-light-accent dark:text-dark-accent font-medium">Convert with AI</span>.
              </p>
              <p>
                <strong className="text-light-textPrimary dark:text-dark-textPrimary">2. Behavioral Verification:</strong> Automatically generated test cases ensure behavioral equivalence between legacy and modern code.
              </p>
              <p>
                <strong className="text-light-textPrimary dark:text-dark-textPrimary">3. Code Diff & History:</strong> Review line-by-line diffs and view all past conversions stored securely in your relational database.
              </p>
            </div>
            <button
              onClick={() => setHelpOpen(false)}
              className="w-full py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
