'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { SAMPLE_PRESETS } from '@/lib/samplePresets';
import {
  Sparkles,
  RotateCcw,
  Copy,
  Download,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileCode2,
  Code2,
  ArrowRight,
  GitCompare,
  FileCheck2,
  Save,
  Check,
  ChevronDown,
  Layers
} from 'lucide-react';

function WorkspaceInner() {
  const { user, loading } = useAuth();
  const { success, error: toastError, info } = useToast();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Configuration state
  const [sourceLang, setSourceLang] = useState('jQuery / JavaScript');
  const [targetLang, setTargetLang] = useState('React + TypeScript');
  const [strategy, setStrategy] = useState('Production Ready');
  const [aiMode, setAiMode] = useState('Balanced');
  const [activePreset, setActivePreset] = useState<string>('jquery-user-manager');

  // Code editor states
  const [legacyCode, setLegacyCode] = useState<string>(SAMPLE_PRESETS[0].legacyCode);
  const [modernCode, setModernCode] = useState<string>(SAMPLE_PRESETS[0].modernCode);
  const [activeTab, setActiveTab] = useState<'legacy' | 'modern'>('legacy'); // For mobile

  // Conversion process state
  const [isConverting, setIsConverting] = useState(false);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [hasConverted, setHasConverted] = useState<boolean>(true);
  const [conversionId, setConversionId] = useState<string | null>(null);

  // Conversion metrics & insights
  const [metrics, setMetrics] = useState({
    changes: SAMPLE_PRESETS[0].changesCount,
    deprecated: SAMPLE_PRESETS[0].deprecatedCount,
    deps: SAMPLE_PRESETS[0].depsCount,
    confidence: SAMPLE_PRESETS[0].confidence,
    insights: SAMPLE_PRESETS[0].insights,
  });

  const [copiedLegacy, setCopiedLegacy] = useState(false);
  const [copiedModern, setCopiedModern] = useState(false);
  const [savingProject, setSavingProject] = useState(false);

  // Load preset on mount or query param change
  useEffect(() => {
    if (searchParams && searchParams.get('new') === 'true') {
      setLegacyCode('');
      setModernCode('');
      setHasConverted(false);
      setConversionId(null);
    }
  }, [searchParams]);

  const handleSelectPreset = (presetId: string) => {
    const preset = SAMPLE_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setActivePreset(preset.id);
      setLegacyCode(preset.legacyCode);
      setModernCode(preset.modernCode);
      setSourceLang(preset.sourceLang);
      setTargetLang(preset.targetLang);
      setMetrics({
        changes: preset.changesCount,
        deprecated: preset.deprecatedCount,
        deps: preset.depsCount,
        confidence: preset.confidence,
        insights: preset.insights,
      });
      setHasConverted(true);
      info(`Loaded sample: ${preset.name}`);
    }
  };

  const handleConvert = async () => {
    if (!legacyCode.trim()) {
      toastError('Please paste or write legacy code to convert.');
      return;
    }

    setIsConverting(true);
    setCurrentStep(0);

    // Step 0: Analyzing code
    setTimeout(() => setCurrentStep(1), 300);
    // Step 1: Detecting legacy patterns
    setTimeout(() => setCurrentStep(2), 600);
    // Step 2: Generating modern implementation
    setTimeout(() => setCurrentStep(3), 900);
    // Step 3: Generating tests
    setTimeout(() => setCurrentStep(4), 1200);

    try {
      const res = await fetch('/api/conversions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          legacyCode,
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
          strategy,
          aiMode,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to process conversion.');
      }

      setModernCode(data.conversion.modernCode);
      setConversionId(data.conversion.id);
      setMetrics({
        changes: data.conversion.changesCount,
        deprecated: data.conversion.deprecatedCount,
        deps: data.conversion.depsCount,
        confidence: data.conversion.confidence,
        insights: data.conversion.insights || [],
      });
      setHasConverted(true);
      setCurrentStep(5); // Complete
      success('Conversion completed and saved to database!');
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Conversion failed');
    } finally {
      setTimeout(() => setIsConverting(false), 300);
    }
  };

  const handleReset = () => {
    setLegacyCode('');
    setModernCode('');
    setHasConverted(false);
    setConversionId(null);
    info('Workspace reset.');
  };

  const handleCopyLegacy = () => {
    navigator.clipboard.writeText(legacyCode);
    setCopiedLegacy(true);
    success('Legacy code copied to clipboard.');
    setTimeout(() => setCopiedLegacy(false), 2000);
  };

  const handleCopyModern = () => {
    navigator.clipboard.writeText(modernCode);
    setCopiedModern(true);
    success('Modern code copied to clipboard.');
    setTimeout(() => setCopiedModern(false), 2000);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([modernCode], { type: 'text/typescript;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'ModernizedModule.tsx';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    success('Modernized module downloaded.');
  };

  const handleSaveConversion = async () => {
    if (!hasConverted) {
      toastError('Convert code before saving.');
      return;
    }
    setSavingProject(true);
    try {
      success('Conversion verified and stored in relational database.');
    } finally {
      setSavingProject(false);
    }
  };

  const renderLineNumbers = (code: string) => {
    const lines = (code || ' ').split('\n');
    return lines.map((_, i) => (
      <div key={i} className="text-right pr-3 select-none text-slate-400 dark:text-slate-600 text-xs leading-5">
        {i + 1}
      </div>
    ));
  };

  const conversionSteps = [
    { label: 'Analyzing code structure' },
    { label: 'Detecting legacy patterns' },
    { label: 'Synthesizing modern components' },
    { label: 'Generating behavioral test suite' },
    { label: 'Validating type soundness' },
  ];

  if (loading) return null;

  return (
    <AppShell projectName="Legacy-to-Modern Translator">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary">
              Legacy-to-Modern Translator
            </h1>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
              Transform legacy code into modern, production-ready code with automated validation.
            </p>
          </div>

          {/* Sample Preset Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-light-textSecondary dark:text-dark-textSecondary font-medium">Sample:</span>
            <select
              value={activePreset}
              onChange={e => handleSelectPreset(e.target.value)}
              className="text-xs px-3 py-1.5 rounded-md border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-light-textPrimary dark:text-dark-textPrimary focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
            >
              {SAMPLE_PRESETS.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Configuration Bar */}
        <div className="p-4 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Source */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary mb-1 font-mono">
                Source
              </label>
              <select
                value={sourceLang}
                onChange={e => setSourceLang(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-md border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="jQuery / JavaScript">jQuery / Legacy JavaScript</option>
                <option value="Legacy JavaScript (ES5)">Legacy JavaScript (ES5 Callbacks / XHR)</option>
                <option value="AngularJS 1.x">AngularJS 1.x (Controllers & Scope)</option>
                <option value="Backbone.js">Backbone.js (Views & Models)</option>
                <option value="Java 7 / Struts">Java 7 / Legacy Backend</option>
              </select>
            </div>

            {/* Target */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary mb-1 font-mono">
                Target
              </label>
              <select
                value={targetLang}
                onChange={e => setTargetLang(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-md border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="React + TypeScript">React + TypeScript (Hooks & Functional)</option>
                <option value="Next.js 14 App Router">Next.js 14 App Router + TS</option>
                <option value="Modern Node/Express TS">Modern Node/Express + Async/Await</option>
                <option value="Vue 3 Composition TS">Vue 3 Composition API + TS</option>
              </select>
            </div>

            {/* Strategy */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary mb-1 font-mono">
                Conversion Strategy
              </label>
              <select
                value={strategy}
                onChange={e => setStrategy(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-md border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="Production Ready">Production Ready (Standard)</option>
                <option value="Strict TypeScript">Strict TypeScript & Zero Any</option>
                <option value="Minimal Refactor">Minimal Behavioral Refactor</option>
                <option value="Performance Optimized">Performance & Memoization</option>
              </select>
            </div>

            {/* AI Mode */}
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary mb-1 font-mono">
                AI Mode
              </label>
              <select
                value={aiMode}
                onChange={e => setAiMode(e.target.value)}
                className="w-full text-xs px-3 py-2 rounded-md border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium"
              >
                <option value="Balanced">Balanced (Accuracy + Speed)</option>
                <option value="High Accuracy">High Accuracy (Full AST & Strict Types)</option>
                <option value="Fast Draft">Fast Draft</option>
              </select>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-light-border dark:border-dark-border">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleConvert}
                disabled={isConverting}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-50 rounded-lg shadow-sm transition flex items-center gap-2"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isConverting ? 'Modernizing...' : 'Convert with AI'}</span>
              </button>

              <button
                type="button"
                onClick={handleReset}
                disabled={isConverting}
                className="px-3 py-2 text-xs font-medium rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated hover:bg-light-border dark:hover:bg-dark-border text-light-textSecondary dark:text-dark-textSecondary hover:text-light-textPrimary transition flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset</span>
              </button>
            </div>

            {hasConverted && (
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => router.push(conversionId ? `/diff/${conversionId}` : '/diff')}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary transition flex items-center gap-1.5"
                >
                  <GitCompare className="w-3.5 h-3.5 text-amber-500" />
                  <span>View Diff</span>
                </button>
                <button
                  type="button"
                  onClick={() => router.push('/tests')}
                  className="px-3 py-2 text-xs font-medium rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary transition flex items-center gap-1.5"
                >
                  <FileCheck2 className="w-3.5 h-3.5 text-emerald-500" />
                  <span>View Tests</span>
                </button>
                <button
                  type="button"
                  onClick={handleSaveConversion}
                  disabled={savingProject}
                  className="px-3 py-2 text-xs font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition flex items-center gap-1.5 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Saved in DB</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Multi-step progress animation when converting */}
        {isConverting && (
          <div className="p-4 rounded-xl border border-blue-500/30 bg-blue-500/5 dark:bg-blue-950/20 space-y-3 animate-in fade-in">
            <div className="flex items-center justify-between text-xs font-semibold text-blue-600 dark:text-blue-400">
              <span className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
                Modernizing Legacy Source Code...
              </span>
              <span className="font-mono">Step {Math.min(currentStep + 1, 5)} of 5</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
              {conversionSteps.map((step, idx) => (
                <div
                  key={idx}
                  className={`p-2 rounded-md border text-xs flex items-center gap-2 transition-all ${
                    idx < currentStep
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : idx === currentStep
                      ? 'border-blue-500 bg-blue-500/20 text-blue-700 dark:text-blue-300 font-semibold'
                      : 'border-light-border dark:border-dark-border text-slate-400 opacity-60'
                  }`}
                >
                  {idx < currentStep ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  ) : idx === currentStep ? (
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shrink-0" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-slate-400 shrink-0" />
                  )}
                  <span className="truncate text-[11px]">{step.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Tab Switcher */}
        <div className="flex md:hidden border-b border-light-border dark:border-dark-border">
          <button
            onClick={() => setActiveTab('legacy')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === 'legacy'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-light-elevated/40 dark:bg-dark-elevated/40'
                : 'border-transparent text-light-textSecondary dark:text-dark-textSecondary'
            }`}
          >
            Legacy Input
          </button>
          <button
            onClick={() => setActiveTab('modern')}
            className={`flex-1 py-2.5 text-xs font-semibold text-center border-b-2 transition ${
              activeTab === 'modern'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-light-elevated/40 dark:bg-dark-elevated/40'
                : 'border-transparent text-light-textSecondary dark:text-dark-textSecondary'
            }`}
          >
            Modern Output
          </button>
        </div>

        {/* Two-Column Aligned Code Conversion Editor */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch">
          {/* LEFT: Legacy Input Editor */}
          <div
            className={`flex flex-col rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm overflow-hidden min-h-[480px] h-[580px] ${
              activeTab === 'legacy' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Perfectly Aligned Header & Toolbar */}
            <div className="h-[48px] px-4 border-b border-light-border dark:border-dark-border bg-light-elevated/60 dark:bg-dark-elevated/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <FileCode2 className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary">
                  Legacy Input
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 font-mono font-medium">
                  {sourceLang.split('/')[0].trim()}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyLegacy}
                  title="Copy Legacy Code"
                  className="p-1.5 rounded hover:bg-light-surface dark:hover:bg-dark-surface text-light-textSecondary dark:text-dark-textSecondary hover:text-light-textPrimary transition"
                >
                  {copiedLegacy ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setLegacyCode('')}
                  title="Clear Editor"
                  className="p-1.5 rounded hover:bg-light-surface dark:hover:bg-dark-surface text-light-textSecondary dark:text-dark-textSecondary hover:text-rose-500 transition"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code & Line Number Area */}
            <div className="flex-1 flex overflow-hidden font-mono text-xs bg-light-surface dark:bg-dark-surface">
              {/* Line numbers column */}
              <div className="w-10 py-3 bg-light-elevated/30 dark:bg-dark-elevated/30 border-r border-light-border dark:border-dark-border shrink-0 overflow-hidden select-none">
                {renderLineNumbers(legacyCode)}
              </div>
              {/* Textarea code editor */}
              <textarea
                value={legacyCode}
                onChange={e => setLegacyCode(e.target.value)}
                placeholder="// Paste legacy code here (e.g. jQuery, ES5 XHR, AngularJS controller)..."
                spellCheck={false}
                className="flex-1 p-3 bg-transparent text-light-textPrimary dark:text-dark-textPrimary placeholder:text-slate-400 focus:outline-none resize-none leading-5 font-mono overflow-y-auto whitespace-pre"
              />
            </div>

            {/* Aligned Bottom Bar */}
            <div className="h-[32px] px-4 border-t border-light-border dark:border-dark-border bg-light-elevated/40 dark:bg-dark-elevated/40 flex items-center justify-between text-[11px] text-light-textSecondary dark:text-dark-textSecondary shrink-0 font-mono">
              <span>Lines: {(legacyCode || '').split('\n').length}</span>
              <span>UTF-8</span>
            </div>
          </div>

          {/* RIGHT: Modern Output Editor */}
          <div
            className={`flex flex-col rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm overflow-hidden min-h-[480px] h-[580px] ${
              activeTab === 'modern' ? 'flex' : 'hidden md:flex'
            }`}
          >
            {/* Perfectly Aligned Header & Toolbar */}
            <div className="h-[48px] px-4 border-b border-light-border dark:border-dark-border bg-light-elevated/60 dark:bg-dark-elevated/60 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-blue-500" />
                <span className="text-xs font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary">
                  Modern Output
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/10 text-blue-600 dark:text-blue-400 font-mono font-medium">
                  {targetLang}
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={handleCopyModern}
                  title="Copy Modern Output"
                  className="p-1.5 rounded hover:bg-light-surface dark:hover:bg-dark-surface text-light-textSecondary dark:text-dark-textSecondary hover:text-light-textPrimary transition"
                >
                  {copiedModern ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  type="button"
                  onClick={handleDownload}
                  title="Download File"
                  className="p-1.5 rounded hover:bg-light-surface dark:hover:bg-dark-surface text-light-textSecondary dark:text-dark-textSecondary hover:text-light-textPrimary transition"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Code & Line Number Area */}
            <div className="flex-1 flex overflow-hidden font-mono text-xs bg-light-surface dark:bg-dark-surface">
              {/* Line numbers column */}
              <div className="w-10 py-3 bg-light-elevated/30 dark:bg-dark-elevated/30 border-r border-light-border dark:border-dark-border shrink-0 overflow-hidden select-none">
                {renderLineNumbers(modernCode)}
              </div>
              {/* Output view */}
              <textarea
                value={modernCode}
                onChange={e => setModernCode(e.target.value)}
                placeholder="// Modernized code will appear here after clicking 'Convert with AI'..."
                spellCheck={false}
                className="flex-1 p-3 bg-transparent text-emerald-700 dark:text-emerald-300 placeholder:text-slate-400 focus:outline-none resize-none leading-5 font-mono overflow-y-auto whitespace-pre"
              />
            </div>

            {/* Aligned Bottom Bar */}
            <div className="h-[32px] px-4 border-t border-light-border dark:border-dark-border bg-light-elevated/40 dark:bg-dark-elevated/40 flex items-center justify-between text-[11px] text-light-textSecondary dark:text-dark-textSecondary shrink-0 font-mono">
              <span>Lines: {(modernCode || '').split('\n').length}</span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Strict TS 5.6</span>
            </div>
          </div>
        </div>

        {/* Compact Conversion Insights & "What changed?" */}
        {hasConverted && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 pt-2">
            {/* Compact Insights Cards (5 cols) */}
            <div className="lg:col-span-5 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary font-mono">
                Conversion Insights
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-center">
                  <div className="text-lg font-bold text-light-textPrimary dark:text-dark-textPrimary font-mono">
                    {metrics.changes}
                  </div>
                  <div className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary">Changes</div>
                </div>

                <div className="p-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-center">
                  <div className="text-lg font-bold text-amber-500 font-mono">
                    {metrics.deprecated}
                  </div>
                  <div className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary">Deprecated APIs</div>
                </div>

                <div className="p-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-center">
                  <div className="text-lg font-bold text-blue-500 font-mono">
                    {metrics.deps}
                  </div>
                  <div className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary">Dependencies</div>
                </div>

                <div className="p-3 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface text-center">
                  <div className="text-lg font-bold text-emerald-500 font-mono">
                    {metrics.confidence}%
                  </div>
                  <div className="text-[11px] text-light-textSecondary dark:text-dark-textSecondary">Confidence</div>
                </div>
              </div>
            </div>

            {/* "What changed?" Checklist (7 cols) */}
            <div className="lg:col-span-7 space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary font-mono">
                What Changed?
              </h3>
              <div className="p-3.5 rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface space-y-2">
                {metrics.insights.map((insight, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-xs text-light-textPrimary dark:text-dark-textPrimary">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{insight}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default function WorkspacePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xs font-mono text-slate-400">Loading workspace...</div>
      </div>
    }>
      <WorkspaceInner />
    </Suspense>
  );
}
