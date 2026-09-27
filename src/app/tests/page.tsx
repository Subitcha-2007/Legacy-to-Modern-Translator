'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  FileCheck2,
  Play,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  Copy,
  Wrench,
  X,
  Sparkles,
  RefreshCw,
  Code2
} from 'lucide-react';

interface TestCaseItem {
  id: string;
  testName: string;
  type: string;
  status: 'PASS' | 'FAIL' | 'RUNNING' | 'SKIPPED';
  duration: string;
  scenario: string;
  expectedResult: string;
  actualResult: string;
  testCode: string;
  createdAt: string;
  conversion?: {
    id: string;
    sourceLanguage: string;
    targetLanguage: string;
    project?: { id: string; name: string };
  };
}

export default function TestsPage() {
  const { user, loading } = useAuth();
  const { success, error: toastError, info } = useToast();

  const [tests, setTests] = useState<TestCaseItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedTest, setSelectedTest] = useState<TestCaseItem | null>(null);
  const [runningAll, setRunningAll] = useState(false);
  const [runningIndividual, setRunningIndividual] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const fetchTests = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== 'ALL') params.append('type', typeFilter);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);

      const res = await fetch(`/api/tests?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setTests(data.testCases);
          if (selectedTest) {
            const updatedSelected = data.testCases.find((t: TestCaseItem) => t.id === selectedTest.id);
            if (updatedSelected) setSelectedTest(updatedSelected);
          }
        }
      }
    } catch (err) {
      console.error('Error loading tests:', err);
    } finally {
      setFetching(false);
    }
  }, [typeFilter, statusFilter, selectedTest]);

  useEffect(() => {
    fetchTests();
  }, [typeFilter, statusFilter]);

  const handleRunAll = async () => {
    setRunningAll(true);
    info('Executing complete behavioral test suite in background...');
    try {
      const res = await fetch('/api/tests', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to execute test suite');
      }
      success(data.message || 'All test suites executed with 100% pass rate.');
      fetchTests();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Error executing test suite');
    } finally {
      setRunningAll(false);
    }
  };

  const handleRunIndividual = async (id: string) => {
    setRunningIndividual(true);
    try {
      const res = await fetch(`/api/tests/${id}/run`, { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Execution failed');
      }
      success(data.message || 'Test passed.');
      fetchTests();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Run failed');
    } finally {
      setRunningIndividual(false);
    }
  };

  const handleFixAutomatically = async (id: string) => {
    try {
      const res = await fetch(`/api/tests/${id}/run`, { method: 'PUT' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Auto-fix failed');
      }
      success('Test case auto-fixed and verified.');
      fetchTests();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Fix error');
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    success('Test code copied to clipboard.');
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const filteredTests = tests.filter(t => {
    const matchesSearch =
      t.testName.toLowerCase().includes(search.toLowerCase()) ||
      t.scenario.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  if (loading) return null;

  return (
    <AppShell projectName="Generated Test Cases">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary">
              Generated Test Cases
            </h1>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
              Automatically generated tests to verify behavioral equivalence.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleRunAll}
              disabled={runningAll || tests.length === 0}
              className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-2"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{runningAll ? 'Executing Suite...' : 'Run All Tests'}</span>
            </button>
          </div>
        </div>

        {/* Controls Bar */}
        <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm grid grid-cols-1 sm:grid-cols-12 gap-3 items-center">
          {/* Search */}
          <div className="sm:col-span-6 relative">
            <Search className="w-4 h-4 text-light-textSecondary dark:text-dark-textSecondary absolute left-3 top-2.5" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search tests by name, scenario, or ID..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {/* Type Filter */}
          <div className="sm:col-span-3">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary font-medium"
            >
              <option value="ALL">All Test Types</option>
              <option value="Unit">Unit Tests</option>
              <option value="Behavioral">Behavioral Tests</option>
              <option value="Integration">Integration Tests</option>
              <option value="Regression">Regression Tests</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="sm:col-span-3">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="w-full text-xs px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="PASS">PASS</option>
              <option value="FAIL">FAIL</option>
              <option value="RUNNING">RUNNING</option>
              <option value="SKIPPED">SKIPPED</option>
            </select>
          </div>
        </div>

        {/* Tests Table and Detail Panel Split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Tests Table (7 or 12 cols depending on selection) */}
          <div className={`${selectedTest ? 'lg:col-span-7' : 'lg:col-span-12'} rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm overflow-hidden transition-all`}>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-light-elevated/60 dark:bg-dark-elevated/60 text-light-textSecondary dark:text-dark-textSecondary uppercase font-mono text-[11px] border-b border-light-border dark:border-dark-border">
                  <tr>
                    <th className="px-4 py-3">ID</th>
                    <th className="px-4 py-3">Test</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Duration</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-light-border dark:divide-dark-border">
                  {fetching ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-mono">
                        Loading test cases from database...
                      </td>
                    </tr>
                  ) : filteredTests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-slate-400">
                        No test cases found. Modernize code in Workspace to generate tests.
                      </td>
                    </tr>
                  ) : (
                    filteredTests.map(tc => {
                      const isSelected = selectedTest?.id === tc.id;
                      return (
                        <tr
                          key={tc.id}
                          onClick={() => setSelectedTest(tc)}
                          className={`cursor-pointer transition-colors ${
                            isSelected
                              ? 'bg-blue-500/10 dark:bg-blue-950/30'
                              : 'hover:bg-light-elevated/50 dark:hover:bg-dark-elevated/50'
                          }`}
                        >
                          <td className="px-4 py-3 font-mono text-slate-400 text-[10px]">
                            {tc.id.substring(0, 8)}
                          </td>
                          <td className="px-4 py-3 font-medium text-light-textPrimary dark:text-dark-textPrimary">
                            <span className="truncate block max-w-[220px]">{tc.testName}</span>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block px-2 py-0.5 text-[10px] rounded font-medium bg-light-elevated dark:bg-dark-elevated text-light-textSecondary dark:text-dark-textSecondary border border-light-border dark:border-dark-border font-mono">
                              {tc.type}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                                tc.status === 'PASS'
                                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                                  : tc.status === 'FAIL'
                                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                                  : tc.status === 'RUNNING'
                                  ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                                  : 'bg-slate-500/10 text-slate-400'
                              }`}
                            >
                              {tc.status === 'PASS' && <CheckCircle2 className="w-3 h-3" />}
                              {tc.status === 'FAIL' && <XCircle className="w-3 h-3" />}
                              {tc.status === 'RUNNING' && <Clock className="w-3 h-3 animate-spin" />}
                              <span>{tc.status}</span>
                            </span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                            {tc.duration}
                          </td>
                          <td className="px-4 py-3 text-right">
                            <button
                              type="button"
                              onClick={e => {
                                e.stopPropagation();
                                handleRunIndividual(tc.id);
                              }}
                              title="Run Test"
                              className="px-2.5 py-1 rounded bg-light-elevated dark:bg-dark-elevated hover:bg-light-accent/10 dark:hover:bg-dark-accent/10 text-light-accent dark:text-dark-accent font-medium text-[11px] transition"
                            >
                              Run Test
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right-Side Test Detail Panel (5 cols) */}
          {selectedTest && (
            <div className="lg:col-span-5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-xl p-5 space-y-4 animate-in slide-in-from-right-4">
              <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
                <div>
                  <h3 className="text-sm font-bold text-light-textPrimary dark:text-dark-textPrimary">
                    Test Case Details
                  </h3>
                  <p className="text-[10px] font-mono text-slate-400">ID: {selectedTest.id}</p>
                </div>
                <button
                  onClick={() => setSelectedTest(null)}
                  className="p-1 rounded hover:bg-light-elevated dark:hover:bg-dark-elevated text-slate-400 hover:text-light-textPrimary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Scenario */}
              <div className="space-y-1">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary font-mono">
                  Scenario
                </span>
                <p className="text-xs text-light-textPrimary dark:text-dark-textPrimary bg-light-elevated/60 dark:bg-dark-elevated/60 p-2.5 rounded-lg border border-light-border dark:border-dark-border">
                  {selectedTest.scenario}
                </p>
              </div>

              {/* Expected vs Actual */}
              <div className="grid grid-cols-1 gap-3">
                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 font-mono">
                    Expected Result
                  </span>
                  <p className="text-xs text-light-textPrimary dark:text-dark-textPrimary bg-emerald-500/5 dark:bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/20">
                    {selectedTest.expectedResult}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400 font-mono">
                    Actual Result
                  </span>
                  <p className="text-xs text-light-textPrimary dark:text-dark-textPrimary bg-light-elevated/60 dark:bg-dark-elevated/60 p-2.5 rounded-lg border border-light-border dark:border-dark-border">
                    {selectedTest.actualResult}
                  </p>
                </div>
              </div>

              {/* Generated Test Code */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary font-mono">
                    Generated Test Code
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopyCode(selectedTest.testCode)}
                    className="text-[11px] text-light-accent dark:text-dark-accent hover:underline flex items-center gap-1 font-medium"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedCode ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-dark-bg text-dark-textPrimary border border-dark-border font-mono text-[11px] max-h-48 overflow-y-auto whitespace-pre leading-5">
                  {selectedTest.testCode}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2 border-t border-light-border dark:border-dark-border">
                <button
                  type="button"
                  onClick={() => handleRunIndividual(selectedTest.id)}
                  disabled={runningIndividual}
                  className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Run Test</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleFixAutomatically(selectedTest.id)}
                  className="py-2 px-3 text-xs font-medium rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated hover:bg-light-border dark:hover:bg-dark-border text-light-textPrimary dark:text-dark-textPrimary transition flex items-center gap-1.5"
                >
                  <Wrench className="w-3.5 h-3.5 text-amber-500" />
                  <span>Fix Automatically</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
