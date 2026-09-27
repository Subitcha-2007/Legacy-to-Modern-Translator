import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import { ToastProvider } from '@/context/ToastContext';

export const metadata: Metadata = {
  title: 'Legacy → Modern | AI-Powered Code Modernization Platform',
  description: 'Transform legacy code into modern, production-ready applications with AI-assisted modernization, automated behavioral test verification, and AST analysis.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-light-bg dark:bg-dark-bg text-light-textPrimary dark:text-dark-textPrimary antialiased selection:bg-blue-500/20 selection:text-blue-500">
        <AuthProvider>
          <ToastProvider>
            {children}
          </ToastProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
