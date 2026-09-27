'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/AppShell';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import {
  FolderGit2,
  Plus,
  Trash2,
  Edit2,
  ArrowRight,
  Sparkles,
  Calendar,
  Layers,
  Code2,
  Check,
  X
} from 'lucide-react';

interface ProjectItem {
  id: string;
  name: string;
  description?: string;
  sourceLanguage: string;
  targetLanguage: string;
  createdAt: string;
  updatedAt: string;
  _count?: {
    conversions: number;
  };
}

export default function ProjectsPage() {
  const { user, loading } = useAuth();
  const { success, error: toastError, info } = useToast();
  const router = useRouter();

  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [fetching, setFetching] = useState(true);
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<ProjectItem | null>(null);

  // Form states
  const [projectName, setProjectName] = useState('');
  const [projectDesc, setProjectDesc] = useState('');
  const [sourceLang, setSourceLang] = useState('jQuery / JavaScript');
  const [targetLang, setTargetLang] = useState('React + TypeScript');
  const [submitting, setSubmitting] = useState(false);
  const [loadingDemo, setLoadingDemo] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      const res = await fetch('/api/projects');
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setProjects(data.projects);
        }
      }
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setFetching(false);
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectName.trim()) {
      toastError('Please enter a project name.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDesc.trim(),
          sourceLanguage: sourceLang,
          targetLanguage: targetLang,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to create project');
      }

      success(`Project "${data.project.name}" created successfully.`);
      setCreateModalOpen(false);
      setProjectName('');
      setProjectDesc('');
      fetchProjects();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Error creating project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject || !projectName.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/projects/${editingProject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: projectName.trim(),
          description: projectDesc.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to update project');
      }

      success('Project updated.');
      setEditingProject(null);
      setProjectName('');
      setProjectDesc('');
      fetchProjects();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Error updating project');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProject = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete project "${name}"?`)) return;

    try {
      const res = await fetch(`/api/projects/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete');
      }
      success(`Project "${name}" deleted.`);
      fetchProjects();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Delete failed');
    }
  };

  const handleLoadDemo = async () => {
    setLoadingDemo(true);
    try {
      const res = await fetch('/api/projects/demo', { method: 'POST' });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to load demo data');
      }
      success('Enterprise demo project and test suites loaded into database.');
      fetchProjects();
    } catch (err) {
      toastError(err instanceof Error ? err.message : 'Demo load error');
    } finally {
      setLoadingDemo(false);
    }
  };

  if (loading) return null;

  return (
    <AppShell projectName="Saved Projects">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-light-border dark:border-dark-border">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-light-textPrimary dark:text-dark-textPrimary">
              Saved Projects
            </h1>
            <p className="text-xs sm:text-sm text-light-textSecondary dark:text-dark-textSecondary mt-1">
              Organize and manage your legacy migration repositories, conversions, and test suites.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadDemo}
              disabled={loadingDemo}
              className="px-3 py-2 text-xs font-medium rounded-lg border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary transition flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{loadingDemo ? 'Loading Demo...' : 'Load Demo Project'}</span>
            </button>

            <button
              onClick={() => {
                setProjectName('');
                setProjectDesc('');
                setCreateModalOpen(true);
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 active:bg-blue-800 rounded-lg shadow-sm transition flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        {fetching ? (
          <div className="py-12 flex justify-center text-xs font-mono text-slate-400">
            Loading saved projects from database...
          </div>
        ) : projects.length === 0 ? (
          /* Empty State */
          <div className="p-12 rounded-xl border border-dashed border-light-border dark:border-dark-border text-center space-y-4 max-w-lg mx-auto">
            <div className="w-12 h-12 rounded-full bg-light-elevated dark:bg-dark-elevated text-light-textSecondary dark:text-dark-textSecondary flex items-center justify-center mx-auto">
              <FolderGit2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-sm font-semibold text-light-textPrimary dark:text-dark-textPrimary">No projects found</h3>
              <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary">
                Create a new project or load the enterprise demo suite to get started.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setCreateModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
              >
                Create First Project
              </button>
              <button
                onClick={handleLoadDemo}
                className="px-4 py-2 text-xs font-medium rounded-lg border border-light-border dark:border-dark-border hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary transition"
              >
                Load Demo Project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {projects.map(proj => (
              <div
                key={proj.id}
                className="p-5 rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface shadow-sm hover:border-blue-500/50 transition-all flex flex-col justify-between space-y-4 group"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                        <FolderGit2 className="w-4 h-4" />
                      </div>
                      <h3 className="text-sm font-bold text-light-textPrimary dark:text-dark-textPrimary truncate max-w-[180px]">
                        {proj.name}
                      </h3>
                    </div>

                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingProject(proj);
                          setProjectName(proj.name);
                          setProjectDesc(proj.description || '');
                        }}
                        title="Edit Project"
                        className="p-1 rounded hover:bg-light-elevated dark:hover:bg-dark-elevated text-slate-400 hover:text-light-textPrimary"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteProject(proj.id, proj.name)}
                        title="Delete Project"
                        className="p-1 rounded hover:bg-light-elevated dark:hover:bg-dark-elevated text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-light-textSecondary dark:text-dark-textSecondary line-clamp-2">
                    {proj.description || 'No description provided.'}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-light-border dark:border-dark-border text-xs">
                  <div className="flex items-center justify-between text-[11px] text-light-textSecondary dark:text-dark-textSecondary font-mono">
                    <span>{proj.sourceLanguage} → {proj.targetLanguage.split(' ')[0]}</span>
                    <span>{proj._count?.conversions || 0} conversions</span>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[10px] text-slate-400">
                      {new Date(proj.createdAt).toLocaleDateString()}
                    </span>
                    <button
                      onClick={() => router.push('/workspace')}
                      className="px-3 py-1.5 text-xs font-semibold text-light-accent dark:text-dark-accent bg-light-elevated dark:bg-dark-elevated hover:bg-light-accent/10 rounded-md transition flex items-center gap-1"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Create / Edit Modal */}
        {(createModalOpen || editingProject) && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="max-w-md w-full rounded-xl border border-light-border dark:border-dark-border bg-light-surface dark:bg-dark-surface p-6 shadow-2xl space-y-4 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between pb-3 border-b border-light-border dark:border-dark-border">
                <h3 className="text-base font-bold text-light-textPrimary dark:text-dark-textPrimary">
                  {editingProject ? 'Edit Project' : 'Create New Project'}
                </h3>
                <button
                  onClick={() => {
                    setCreateModalOpen(false);
                    setEditingProject(null);
                  }}
                  className="p-1 rounded hover:bg-light-elevated dark:hover:bg-dark-elevated text-slate-400 hover:text-light-textPrimary"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={editingProject ? handleUpdateProject : handleCreateProject} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1.5">
                    Project Name
                  </label>
                  <input
                    type="text"
                    required
                    value={projectName}
                    onChange={e => setProjectName(e.target.value)}
                    placeholder="e.g. Legacy Checkout Migration"
                    className="w-full px-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-light-textSecondary dark:text-dark-textSecondary mb-1.5">
                    Description
                  </label>
                  <textarea
                    rows={3}
                    value={projectDesc}
                    onChange={e => setProjectDesc(e.target.value)}
                    placeholder="Brief description of legacy code module and goals..."
                    className="w-full px-3 py-2 text-xs rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  />
                </div>

                {!editingProject && (
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-light-textSecondary dark:text-dark-textSecondary mb-1 font-mono">
                        Source
                      </label>
                      <select
                        value={sourceLang}
                        onChange={e => setSourceLang(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary"
                      >
                        <option value="jQuery / JavaScript">jQuery / JavaScript</option>
                        <option value="Legacy ES5 Callbacks">Legacy ES5 Callbacks</option>
                        <option value="AngularJS 1.x">AngularJS 1.x</option>
                        <option value="Backbone.js">Backbone.js</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-semibold uppercase text-light-textSecondary dark:text-dark-textSecondary mb-1 font-mono">
                        Target
                      </label>
                      <select
                        value={targetLang}
                        onChange={e => setTargetLang(e.target.value)}
                        className="w-full text-xs px-3 py-2 rounded-lg border border-light-border dark:border-dark-border bg-light-elevated dark:bg-dark-elevated text-light-textPrimary dark:text-dark-textPrimary"
                      >
                        <option value="React + TypeScript">React + TypeScript</option>
                        <option value="Next.js 14 App Router">Next.js 14 App Router</option>
                        <option value="Modern Node/Express TS">Modern Node/Express TS</option>
                      </select>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-light-border dark:border-dark-border">
                  <button
                    type="button"
                    onClick={() => {
                      setCreateModalOpen(false);
                      setEditingProject(null);
                    }}
                    className="px-4 py-2 text-xs font-medium rounded-lg border border-light-border dark:border-dark-border text-light-textSecondary dark:text-dark-textSecondary hover:bg-light-elevated dark:hover:bg-dark-elevated transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-lg transition"
                  >
                    {submitting ? 'Saving...' : editingProject ? 'Update Project' : 'Create Project'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
