'use client';

import React, { useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

interface AppShellProps {
  children: React.ReactNode;
  projectName?: string;
}

export const AppShell: React.FC<AppShellProps> = ({ children, projectName }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-light-bg dark:bg-dark-bg text-light-textPrimary dark:text-dark-textPrimary">
      <Header
        currentProjectName={projectName}
        onOpenMobileMenu={() => setMobileMenuOpen(true)}
      />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar
          mobileOpen={mobileMenuOpen}
          onCloseMobile={() => setMobileMenuOpen(false)}
        />
        <main className="flex-1 overflow-y-auto min-w-0 pb-16">
          {children}
        </main>
      </div>
    </div>
  );
};
