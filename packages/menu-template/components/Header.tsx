'use client';

import Link from 'next/link';
import { VerticalConfig } from '../types';

interface HeaderProps {
  config: VerticalConfig;
  showBackButton?: boolean;
  backHref?: string;
  variant?: 'default' | 'minimal';
  showCartIcon?: boolean;
  cartCount?: number;
  showSelectionsIcon?: boolean;
  selectionsCount?: number;
  showAccountIcon?: boolean;
  onCartClick?: () => void;
  onSelectionsClick?: () => void;
  onAccountClick?: () => void;
}

export function Header({
  config,
  showBackButton = false,
  backHref = '/',
  variant = 'default',
  showCartIcon = false,
  cartCount = 0,
  showSelectionsIcon = false,
  selectionsCount = 0,
  showAccountIcon = false,
  onCartClick,
  onSelectionsClick,
  onAccountClick
}: HeaderProps) {
  const { business } = config;

  if (variant === 'minimal') {
    // Minimal header: logo + name + icons (no tagline)
    return (
      <header className="bg-gradient-to-r from-pink-50 via-purple-50 to-pink-50 shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between gap-4">
            {/* Logo + Name (Left) */}
            <Link href="/" className="flex items-center gap-3 flex-1">
              {business.logo && (
                <img
                  src={business.logo}
                  alt={business.name}
                  className="w-10 h-10 rounded-full object-cover shadow-md flex-shrink-0"
                />
              )}
              <h1 className="text-xl font-bold text-pink-600 truncate">{business.name}</h1>
            </Link>

            {/* Icons (Right) */}
            {(showCartIcon || showSelectionsIcon || showAccountIcon || showBackButton) && (
              <div className="flex items-center gap-2 flex-shrink-0">
                {/* Back Button */}
                {showBackButton && (
                  <Link href={backHref} className="text-gray-600 hover:text-pink-600 text-sm">
                    ← Indietro
                  </Link>
                )}

                {/* Cart Icon */}
                {showCartIcon && (
                  <button
                    onClick={onCartClick}
                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Cart"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    {/* Cart Badge */}
                    {cartCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-lg border-2 border-white">
                        {cartCount > 9 ? '9+' : cartCount}
                      </div>
                    )}
                  </button>
                )}

                {/* Selections Icon (Clipboard/Notepad) */}
                {showSelectionsIcon && (
                  <button
                    onClick={onSelectionsClick}
                    className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Selections"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    {/* Selections Badge */}
                    {selectionsCount > 0 && (
                      <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-lg border-2 border-white">
                        {selectionsCount > 9 ? '9+' : selectionsCount}
                      </div>
                    )}
                  </button>
                )}

                {/* Account Icon */}
                {showAccountIcon && (
                  <button
                    onClick={onAccountClick}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    aria-label="Account"
                  >
                    <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </header>
    );
  }

  // Default header with logo + name + tagline + optional cart/account icons
  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Logo + Name (Left/Center) */}
          <div className="flex items-center gap-3 flex-1">
            {business.logo && (
              <img
                src={business.logo}
                alt={business.name}
                className="w-12 h-12 rounded-full object-cover shadow-md flex-shrink-0"
              />
            )}
            <div className="min-w-0 flex-1">
              <h1 className="text-xl font-bold text-pink-600 truncate">{business.name}</h1>
              {business.tagline && (
                <p className="text-xs text-gray-600 truncate">{business.tagline}</p>
              )}
            </div>
          </div>

          {/* Icons (Right) */}
          {(showCartIcon || showSelectionsIcon || showAccountIcon) && (
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Cart Icon */}
              {showCartIcon && (
                <button
                  onClick={onCartClick}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Cart"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  {/* Cart Badge */}
                  {cartCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-green-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-lg border-2 border-white">
                      {cartCount > 9 ? '9+' : cartCount}
                    </div>
                  )}
                </button>
              )}

              {/* Selections Icon (Clipboard/Notepad) */}
              {showSelectionsIcon && (
                <button
                  onClick={onSelectionsClick}
                  className="relative p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Selections"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  {/* Selections Badge */}
                  {selectionsCount > 0 && (
                    <div className="absolute -top-1 -right-1 bg-blue-500 text-white text-xs font-bold rounded-full min-w-[20px] h-5 px-1.5 flex items-center justify-center shadow-lg border-2 border-white">
                      {selectionsCount > 9 ? '9+' : selectionsCount}
                    </div>
                  )}
                </button>
              )}

              {/* Account Icon */}
              {showAccountIcon && (
                <button
                  onClick={onAccountClick}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  aria-label="Account"
                >
                  <svg className="w-6 h-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
