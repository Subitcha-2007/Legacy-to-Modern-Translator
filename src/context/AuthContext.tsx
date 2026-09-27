'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  theme: string;
  stats?: {
    projects: number;
    conversions: number;
    tests: number;
  };
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  theme: string;
  setThemePreference: (theme: 'dark' | 'light' | 'system') => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: { name: string; email: string; password: string; confirmPassword: string }) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [theme, setTheme] = useState<string>('dark');
  const router = useRouter();
  const pathname = usePathname();

  const applyThemeToDOM = (selectedTheme: string) => {
    let activeDark = false;
    if (selectedTheme === 'dark') {
      activeDark = true;
    } else if (selectedTheme === 'light') {
      activeDark = false;
    } else if (typeof window !== 'undefined') {
      activeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }

    if (activeDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
          const savedTheme = data.user.theme || 'dark';
          setTheme(savedTheme);
          applyThemeToDOM(savedTheme);
          return;
        }
      }
      setUser(null);
    } catch (err) {
      console.error('Error checking authentication:', err);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Protected route guard
  useEffect(() => {
    if (!loading) {
      const isPublicPath = pathname === '/' || pathname === '/login' || pathname === '/register';
      if (!user && !isPublicPath) {
        router.push('/');
      }
    }
  }, [user, loading, pathname, router]);

  const setThemePreference = async (newTheme: 'dark' | 'light' | 'system') => {
    setTheme(newTheme);
    applyThemeToDOM(newTheme);

    if (user) {
      setUser(prev => (prev ? { ...prev, theme: newTheme } : null));
      try {
        await fetch('/api/preferences', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ theme: newTheme }),
        });
      } catch (err) {
        console.error('Failed to update theme in database:', err);
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to sign in.' };
      }

      setUser(data.user);
      const userTheme = data.user.theme || 'dark';
      setTheme(userTheme);
      applyThemeToDOM(userTheme);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const register = async (formData: { name: string; email: string; password: string; confirmPassword: string }) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to create account.' };
      }

      setUser(data.user);
      const userTheme = data.user.theme || 'dark';
      setTheme(userTheme);
      applyThemeToDOM(userTheme);
      return { success: true };
    } catch (err) {
      return { success: false, error: 'Network error. Please try again.' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        theme,
        setThemePreference,
        login,
        register,
        logout,
        refreshUser: fetchUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
