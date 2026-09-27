'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  GitCompare,
  ArrowRight,
  Copy,
  Check,
  CheckCircle2,
  FileCode2,
  Code2,
  Sparkles,
  Layers
} from 'lucide-react';

interface DiffData {
  id: string;
  projectName: string;
  sourceLanguage: string;
  targetLanguage: string;
  legacyCode: string;
  modernCode: string;
  legacyLines: string[];
  modernLines: string[];
  changesCount: number;
  deprecatedCount: number;
  depsCount: number;
  confidence: number;
  insights: string[];
  createdAt: string;
}

export default function DiffDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading } = useAuth();
  const { success, error: toastError } = useToast();

  const [diffData, setDiffData] = useState<DiffData | null>(null);
  const [fetching, setFetching] = useState(true);
  const [copiedModern, setCopiedModern] = useState(false);

  const conversionId = (params?.id as string) || 'latest';

  useEffect(() => {
    async function fetchDiff() {
      try {
        const res = await fetch(`/api/diff/${conversionId}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.diff) {
            setDiffData(data.diff);
            return;
          }
        }
        setDiffData(null);
      } catch (err) {
        console.error('Error fetching diff:', err);
      } finally {
        setFetching(false);
      }
    }
    fetchDiff();
  }, [conversionId]);

  const handleCopyModern = () => {
    if (!diffData) return;
    navigator.clipboard.writeText(diffData.modernCode);
    setCopiedModern(true);
    success('Modern code copied.');
    setTimeout(() => setCopiedModern(false), 2000);
  };

  if (loading) return null;

  return (
    <AppShell projectName="Code Changes Diff">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Title Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary">
              Code Changes
            </h1>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
              Review exactly what changed during modernization.
            </p>
          </div>

          {diffData && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyModern}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary transition flex items-center gap-1.5"
              >
                {copiedModern ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy Modern Code</span>
              </button>
              <button
                onClick={() => router.push('/workspace')}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Open Workspace</span>
              </button>
            </div>
          )}
        </div>

        {fetching ? (
          <div className="py-16 text-center text-xs font-mono text-slate-400">
            Loading code diff from database...
          </div>
        ) : !diffData ? (
          <div className="p-12 rounded-xl border border-dashed border-light-border dark:border-dark-border text-center space-y-4 max-w-lg mx-auto">
            <GitCompare className="w-8 h-8 text-amber-500 mx-auto" />
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-light-textPrimary dark:text-dark-textPrimary">No Diff Available</h3>
              <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                Execute a code conversion in Workspace to view detailed code diffs.
              </p>
            </div>
            <button
              onClick={() => router.push('/workspace')}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
            >
              Go to Workspace
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Diff Summary Bar */}
            <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <span className="text-[10px] uppercase font-mono text-light-textSecondary dark:text-dark-textSecondary font-semibold">
                  Source Framework
                </span>
                <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 font-mono mt-0.5">
                  {diffData.sourceLanguage}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-light-textSecondary dark:text-dark-textSecondary font-semibold">
                  Target Framework
                </span>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 font-mono mt-0.5">
                  {diffData.targetLanguage}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-light-textSecondary dark:text-dark-textSecondary font-semibold">
                  Total Changes
                </span>
                <p className="text-xs font-bold text-light-textPrimary dark:text-dark-textPrimary font-mono mt-0.5">
                  {diffData.changesCount} Refactors ({diffData.deprecatedCount} Deprecated)
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-mono text-light-textSecondary dark:text-dark-textSecondary font-semibold">
                  Equivalence Confidence
                </span>
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 font-mono mt-0.5">
                  {diffData.confidence}% Verified
                </p>
              </div>
            </div>

            {/* Side-by-Side Subtle Diff Viewer */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
              {/* Left: Legacy Code */}
              <div className="flex flex-col rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm overflow-hidden min-h-[500px]">
                <div className="h-[44px] px-4 border-b border-light-border dark:border-dark-border bg-amber-500/5 dark:bg-amber-950/20 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <FileCode2 className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-light-textPrimary dark:text-dark-textPrimary">
                      Legacy Original
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    {diffData.legacyLines.length} lines
                  </span>
                </div>

                <div className="flex-1 p-3 font-mono text-xs overflow-y-auto leading-5 space-y-0.5 bg-light-surface dark:bg-dark-surface">
                  {diffData.legacyLines.map((line, idx) => {
                    const isLegacyChanged =
                      line.includes('$') ||
                      line.includes('var ') ||
                      line.includes('XMLHttpRequest') ||
                      line.includes('function(') ||
                      line.includes('alert(');

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 px-2 py-0.5 rounded ${
                          isLegacyChanged
                            ? 'bg-amber-500/10 dark:bg-amber-950/30 text-amber-900 dark:text-amber-200 border-l-2 border-amber-500'
                            : 'text-light-textSecondary dark:text-dark-textSecondary'
                        }`}
                      >
                        <span className="w-6 text-right select-none text-slate-400 dark:text-slate-600 text-[11px]">
                          {idx + 1}
                        </span>
                        <pre className="flex-1 whitespace-pre-wrap font-mono">{line || ' '}</pre>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Right: Modern Code */}
              <div className="flex flex-col rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm overflow-hidden min-h-[500px]">
                <div className="h-[44px] px-4 border-b border-light-border dark:border-dark-border bg-emerald-500/5 dark:bg-emerald-950/20 flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-emerald-500" />
                    <span className="text-xs font-bold text-light-textPrimary dark:text-dark-textPrimary">
                      Modern Output
                    </span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    {diffData.modernLines.length} lines
                  </span>
                </div>

                <div className="flex-1 p-3 font-mono text-xs overflow-y-auto leading-5 space-y-0.5 bg-light-surface dark:bg-dark-surface">
                  {diffData.modernLines.map((line, idx) => {
                    const isModernHighlight =
                      line.includes('import ') ||
                      line.includes('interface ') ||
                      line.includes('useState') ||
                      line.includes('useCallback') ||
                      line.includes('async ') ||
                      line.includes('React.FC');

                    return (
                      <div
                        key={idx}
                        className={`flex items-start gap-3 px-2 py-0.5 rounded ${
                          isModernHighlight
                            ? 'bg-emerald-500/10 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-200 border-l-2 border-emerald-500'
                            : 'text-light-textPrimary dark:text-dark-textPrimary'
                        }`}
                      >
                        <span className="w-6 text-right select-none text-slate-400 dark:text-slate-600 text-[11px]">
                          {idx + 1}
                        </span>
                        <pre className="flex-1 whitespace-pre-wrap font-mono">{line || ' '}</pre>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Insights Checklist */}
            {diffData.insights && diffData.insights.length > 0 && (
              <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-2">
                <h3 className="text-xs font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary font-mono">
                  Applied Refactoring Rules
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                  {diffData.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-light-textPrimary dark:text-dark-textPrimary">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
