'use client';

import React from 'react';
import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  clickable?: boolean;
  variant?: 'light' | 'dark' | 'brand';
}

export default function Logo({
  size = 'md',
  showSubtitle = true,
  clickable = true,
  variant = 'brand'
}: LogoProps) {
  const sizeConfig = {
    sm: {
      badge: 'w-8 h-8 rounded-lg',
      smmText: 'text-sm font-black',
      cross: 'w-2 h-2',
      title: 'text-sm font-bold',
      subtitle: 'text-[10px]'
    },
    md: {
      badge: 'w-10 h-10 rounded-xl',
      smmText: 'text-base font-black',
      cross: 'w-2.5 h-2.5',
      title: 'text-base font-bold',
      subtitle: 'text-xs'
    },
    lg: {
      badge: 'w-12 h-12 rounded-xl',
      smmText: 'text-xl font-black',
      cross: 'w-3 h-3',
      title: 'text-lg font-bold',
      subtitle: 'text-xs'
    },
    xl: {
      badge: 'w-16 h-16 rounded-2xl',
      smmText: 'text-2xl font-black',
      cross: 'w-3.5 h-3.5',
      title: 'text-2xl font-bold',
      subtitle: 'text-sm'
    }
  };

  const current = sizeConfig[size];

  const content = (
    <div className="flex items-center gap-3">
      {/* SMM Medical Cross Badge */}
      <div
        className={`relative ${current.badge} bg-[#0F4C81] flex items-center justify-center text-white shadow-sm border border-cyan-200 shrink-0`}
      >
        <span className={`${current.smmText} tracking-tight leading-none`}>SMM</span>
        {/* Subtle medical cross icon accent */}
        <div className="absolute -top-1 -right-1 bg-cyan-400 text-white rounded-full p-0.5 shadow-xs">
          <svg
            className={`${current.cross}`}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </div>
      </div>

      {/* Brand Name Typography */}
      <div className="flex flex-col leading-tight">
        <span
          className={`${current.title} tracking-tight ${
            variant === 'light' ? 'text-white' : 'text-slate-900'
          }`}
        >
          Sakthimurugan Medical Agencies
        </span>
        {showSubtitle && (
          <span
            className={`${current.subtitle} font-medium ${
              variant === 'light' ? 'text-cyan-100' : 'text-slate-500'
            }`}
          >
            Wholesale Pharmaceutical Supplier • Erode, TN
          </span>
        )}
      </div>
    </div>
  );

  if (clickable) {
    return (
      <Link href="/" className="inline-flex items-center hover:opacity-95 transition-opacity">
        {content}
      </Link>
    );
  }

  return content;
}
