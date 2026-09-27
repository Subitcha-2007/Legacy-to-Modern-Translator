'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  History as HistoryIcon,
  Search,
  Filter,
  ArrowRight,
  GitCompare,
  FileCheck2,
  Trash2,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowUpDown
} from 'lucide-react';

interface HistoryItem {
  id: string;
  projectId?: string;
  sourceLanguage: string;
  targetLanguage: string;
  strategy: string;
  aiMode: string;
  status: string;
  confidence: number;
  changesCount: number;
  createdAt: string;
  project?: {
    id: string;
    name: string;
  };
  _count?: {
    testCases: number;
  };
}

export default function HistoryPage() {
  const { user, loading } = useAuth();
  const { success, error: toastError } = useToast();
  const router = useRouter();

  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'confidence'>('newest');

  const fetchHistory = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/history?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setHistory(data.history);
        }
      }
    } catch (err) {
      console.error('Error fetching history:', err);
    } finally {
      setFetching(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this conversion record?')) return;

    try {
      const res = await fetch(`/api/conversions/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete');
      }
      success('Conversion record deleted.');
      fetchHistory();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const sortedHistory = [...history].sort((a, b) => {
    if (sortBy === 'newest') {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    if (sortBy === 'oldest') {
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    }
    if (sortBy === 'confidence') {
      return b.confidence - a.confidence;
    }
    return 0;
  });

  if (loading) return null;

  return (
    <AppShell projectName="Conversion History">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary">
              Conversion History
            </h1>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
              Audit log of all code transformations, behavioral verifications, and modernization runs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/workspace')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>New Conversion</span>
            </button>
          </div>
        </div>

        {/* Controls */}
        <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-light-textSecondary dark:text-dark-textSecondary absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search history by language or project name..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="COMPLETED">COMPLETED</option>
              <option value="ANALYZING">ANALYZING</option>
              <option value="FAILED">FAILED</option>
            </select>
          </div>

          {/* Sort */}
          <div className="sm:col-span-3">
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as any)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary font-medium"
            >
              <option value="newest">Sort: Newest First</option>
              <option value="oldest">Sort: Oldest First</option>
              <option value="confidence">Sort: Highest Confidence</option>
            </select>
          </div>
        </div>

        {/* History Table */}
        <div className="rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-light-elevated/60 dark:bg-dark-elevated/60 text-light-textSecondary dark:text-dark-textSecondary uppercase font-mono text-[11px] border-b border-light-border dark:border-dark-border">
                <tr>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Source</th>
                  <th className="px-4 py-3">Target</th>
                  <th className="px-4 py-3">Confidence</th>
                  <th className="px-4 py-3">Date</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-light-border dark:divide-dark-border">
                {fetching ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400 font-mono">
                      Loading conversion history from database...
                    </td>
                  </tr>
                ) : sortedHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-12 text-center text-slate-400">
                      No conversions in history yet. Convert legacy code in Workspace to generate history.
                    </td>
                  </tr>
                ) : (
                  sortedHistory.map(item => (
                    <tr key={item.id} className="hover:bg-light-elevated/50 dark:hover:bg-dark-elevated/50 transition">
                      <td className="px-4 py-3 font-medium text-light-textPrimary dark:text-dark-textPrimary">
                        <div className="flex flex-col">
                          <span>{item.project?.name || 'Quick Modernization'}</span>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {item.id.substring(0, 8)}</span>
                        </div>
                      </td>

                      <td className="px-4 py-3 font-mono text-amber-600 dark:text-amber-400">
                        {item.sourceLanguage}
                      </td>

                      <td className="px-4 py-3 font-mono text-blue-600 dark:text-blue-400">
                        {item.targetLanguage}
                      </td>

                      <td className="px-4 py-3 font-mono font-semibold text-emerald-600 dark:text-emerald-400">
                        {item.confidence}%
                      </td>

                      <td className="px-4 py-3 text-light-textSecondary dark:text-dark-textSecondary text-[11px]">
                        {new Date(item.createdAt).toLocaleString()}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>{item.status}</span>
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => router.push(`/diff/${item.id}`)}
                            title="View Diff"
                            className="p-1.5 rounded hover:bg-light-elevated dark:hover:bg-dark-elevated text-amber-500 hover:text-amber-600 transition"
                          >
                            <GitCompare className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => router.push('/tests')}
                            title="View Tests"
                            className="p-1.5 rounded hover:bg-light-elevated dark:hover:bg-dark-elevated text-emerald-500 hover:text-emerald-600 transition"
                          >
                            <FileCheck2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete Record"
                            className="p-1.5 rounded hover:bg-light-elevated dark:hover:bg-dark-elevated text-slate-400 hover:text-rose-500 transition"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
