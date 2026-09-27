'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Code2,
  FolderGit2,
  PlusCircle,
  FileCheck2,
  GitCompare,
  History,
  Settings as SettingsIcon,
  X
} from 'lucide-react';

interface SidebarProps {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen = false, onCloseMobile }) => {
  const pathname = usePathname();

  const navSections = [
    {
      title: 'WORKSPACE',
      items: [
        { label: 'New Conversion', href: '/workspace', icon: PlusCircle, isAction: true },
        { label: 'Current Workspace', href: '/workspace', icon: Code2 },
        { label: 'Saved Projects', href: '/projects', icon: FolderGit2 },
      ],
    },
    {
      title: 'TOOLS',
      items: [
        { label: 'Converter', href: '/workspace', icon: Code2 },
        { label: 'Test Generator', href: '/tests', icon: FileCheck2 },
        { label: 'Diff Viewer', href: '/diff', icon: GitCompare },
      ],
    },
    {
      title: 'ACTIVITY',
      items: [
        { label: 'History', href: '/history', icon: History },
      ],
    },
    {
      title: 'ACCOUNT',
      items: [
        { label: 'Settings', href: '/settings', icon: SettingsIcon },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-light-surface dark:bg-dark-surface border-r border-light-border dark:border-dark-border select-none">
      {/* Mobile Drawer Header */}
      {mobileOpen && (
        <div className="flex items-center justify-between p-4 border-b border-light-border dark:border-dark-border md:hidden">
          <span className="text-xs font-semibold uppercase tracking-wider text-light-textSecondary dark:text-dark-textSecondary">
            Navigation Menu
          </span>
          <button
            onClick={onCloseMobile}
            className="p-1 rounded hover:bg-light-elevated dark:hover:bg-dark-elevated text-light-textSecondary dark:text-dark-textSecondary"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Sections */}
      <div className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            <h4 className="px-3 text-[11px] font-semibold tracking-wider text-light-textSecondary/80 dark:text-dark-textSecondary/80 uppercase font-mono">
              {section.title}
            </h4>
            <div className="space-y-0.5 pt-1">
              {section.items.map((item, itemIdx) => {
                // Determine active state
                const isActive = item.href === '/diff' 
                  ? pathname.startsWith('/diff') 
                  : pathname === item.href;
                
                const IconComponent = item.icon;

                return (
                  <Link
                    key={itemIdx}
                    href={item.href}
                    onClick={() => {
                      if (onCloseMobile) onCloseMobile();
                    }}
                    className={`group relative flex items-center gap-3 px-3 py-2 rounded-md text-xs font-medium transition duration-fast ${
                      isActive
                        ? 'bg-light-elevated dark:bg-dark-elevated text-light-accent dark:text-dark-accent active-nav-indicator'
                        : 'text-light-textSecondary dark:text-dark-textSecondary hover:text-light-textPrimary dark:hover:text-dark-textPrimary hover:bg-light-elevated/60 dark:hover:bg-dark-elevated/60'
                    }`}
                  >
                    <IconComponent
                      className={`w-4 h-4 shrink-0 transition-colors ${
                        isActive
                          ? 'text-light-accent dark:text-dark-accent'
                          : 'text-light-textSecondary dark:text-dark-textSecondary group-hover:text-light-textPrimary dark:group-hover:text-dark-textPrimary'
                      }`}
                    />
                    <span className="truncate">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Sidebar Footer Metadata */}
      <div className="p-3 border-t border-light-border dark:border-dark-border">
        <div className="p-2.5 rounded-lg bg-light-elevated/50 dark:bg-dark-elevated/50 border border-light-border dark:border-dark-border space-y-1">
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-light-textSecondary dark:text-dark-textSecondary">Engine Version</span>
            <span className="font-mono text-[10px] text-light-accent dark:text-dark-accent font-semibold">v2.4.0</span>
          </div>
          <div className="flex items-center justify-between text-[11px]">
            <span className="text-light-textSecondary dark:text-dark-textSecondary">Relational DB</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Synced</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-[240px] shrink-0 h-[calc(100vh-64px)] sticky top-[64px]">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={onCloseMobile} />
          <div className="relative w-[260px] max-w-[80vw] h-full z-50">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
