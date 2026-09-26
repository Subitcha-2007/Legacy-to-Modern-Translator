'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface User {
  id: number;
  role: 'RETAILER' | 'ADMIN';
  shopName?: string;
  ownerName: string;
  email: string;
  phone: string;
  dlNumber?: string;
  gstNumber?: string;
  isApproved: boolean;
  creditLimit: number;
  currentBalance: number;
  address?: string;
  pincode?: string;
}

export interface DemoUserOption {
  id: number;
  role: 'RETAILER' | 'ADMIN';
  shopName: string;
  ownerName: string;
  email: string;
  phone?: string;
  isApproved: boolean;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  demoUsers: DemoUserOption[];
  login: (token: string, userData: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  fetchDemoUsers: () => Promise<void>;
  switchDemoUser: (userId: number) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [demoUsers, setDemoUsers] = useState<DemoUserOption[]>([]);

  const fetchCurrentUser = useCallback(async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${authToken}` }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        localStorage.setItem('smm_user', JSON.stringify(data.user));
      } else {
        logout();
      }
    } catch (e) {
      console.error('Failed to fetch user:', e);
    }
  }, []);

  const fetchDemoUsers = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/demo-retailers');
      if (res.ok) {
        const data = await res.json();
        const list: DemoUserOption[] = [];
        if (data.admin) {
          list.push({
            id: data.admin.id,
            role: data.admin.role,
            shopName: 'Sakthimurugan Central Wholesale Depot',
            ownerName: data.admin.ownerName || 'Admin Desk',
            email: data.admin.email,
            isApproved: true,
            creditLimit: 0,
            currentBalance: 0,
            availableCredit: 0
          });
        }
        if (Array.isArray(data.retailers)) {
          list.push(...data.retailers);
        }
        setDemoUsers(list);
      }
    } catch (err) {
      console.error('Failed to fetch demo users list:', err);
    }
  }, []);

  useEffect(() => {
    const initAuth = async () => {
      await fetchDemoUsers();

      const savedToken = localStorage.getItem('smm_token');
      const savedUser = localStorage.getItem('smm_user');
      if (savedToken && savedUser) {
        try {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          await fetchCurrentUser(savedToken);
        } catch (err) {
          localStorage.removeItem('smm_token');
          localStorage.removeItem('smm_user');
        }
      } else {
        // Default to first approved retailer if available
        try {
          const res = await fetch('/api/admin/demo-retailers');
          if (res.ok) {
            const data = await res.json();
            const approved = data.retailers?.find((r: any) => r.isApproved);
            if (approved) {
              await switchDemoUser(approved.id);
            }
          }
        } catch (e) {
          console.error('Initial default retailer switch error:', e);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [fetchCurrentUser, fetchDemoUsers]);

  const login = (newToken: string, userData: User) => {
    setToken(newToken);
    setUser(userData);
    localStorage.setItem('smm_token', newToken);
    localStorage.setItem('smm_user', JSON.stringify(userData));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('smm_token');
    localStorage.removeItem('smm_user');
  };

  const refreshUser = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
    await fetchDemoUsers();
  };

  // Connects directly to backend database via demoLogin
  const switchDemoUser = async (userId: number): Promise<boolean> => {
    try {
      const res = await fetch('/api/auth/demo-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });

      if (res.ok) {
        const data = await res.json();
        login(data.token, data.user);
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error switching demo user:', err);
      return false;
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        demoUsers,
        login,
        logout,
        refreshUser,
        fetchDemoUsers,
        switchDemoUser
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
