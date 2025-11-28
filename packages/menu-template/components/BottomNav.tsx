'use client';

// Bottom Navigation Component - Updated
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { VerticalConfig } from '../types';

interface NavItem {
  href: string;
  icon: React.ReactNode;
  label: string;
  isCenter?: boolean;
}

interface BottomNavProps {
  config: VerticalConfig;
  items?: NavItem[];
}

/**
 * Default nav items for different verticals
 * These can be overridden by passing custom items prop
 */
const getDefaultNavItems = (vertical: string): NavItem[] => {
  const commonItems = {
    home: {
      href: '/',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      ),
      label: 'Home'
    },
    search: {
      href: '/search',
      icon: (
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      label: 'Search'
    }
  };

  if (vertical === 'wellness' || vertical === 'spa') {
    return [
      commonItems.home,
      {
        href: '/services',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        ),
        label: 'Servizi'
      },
      {
        href: '/packages',
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        ),
        label: 'Pacchetti',
        isCenter: true
      },
      {
        href: '/promotions',
        icon: (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        ),
        label: 'Promo'
      },
      commonItems.search
    ];
  }

  if (vertical === 'restaurant' || vertical === 'coffeeshop' || vertical === 'bar') {
    return [
      commonItems.home,
      {
        href: '/menu',
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        ),
        label: 'Menu'
      },
      {
        href: '/cart',
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        ),
        label: 'Cart',
        isCenter: true
      },
      {
        href: '/offers',
        icon: (
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
        ),
        label: 'Deals'
      }
    ];
  }

  // Default fallback
  return [
    commonItems.home,
    {
      href: '/browse',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
        </svg>
      ),
      label: 'Browse',
      isCenter: true
    },
    commonItems.search
  ];
};

export function BottomNav({ config, items }: BottomNavProps) {
  const pathname = usePathname();
  const navItems = items || getDefaultNavItems(config.vertical);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Show nav when scrolling up, hide when scrolling down
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [lastScrollY]);

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 w-full bg-white border-t-2 border-gray-200 shadow-lg z-[9999] transition-transform duration-300 ease-in-out"
      style={{
        transform: isVisible ? 'translateY(0)' : 'translateY(100%)'
      }}
    >
      <div className="flex items-center justify-around h-20 px-4 max-w-screen-xl mx-auto">
        {navItems.map((item, index) => {
          const isActive = pathname === item.href ||
            (item.href !== '/' && pathname?.startsWith(item.href));

          return (
            <Link
              key={index}
              href={item.href}
              className="flex items-center justify-center flex-1 h-full"
            >
              {item.isCenter ? (
                <div
                  className="flex items-center justify-center w-16 h-16 -mt-8 rounded-full shadow-xl"
                  style={{
                    background: 'linear-gradient(135deg, #f6bc26 0%, #0170B9 100%)'
                  }}
                >
                  <div className="text-white">
                    {item.icon}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 bg-red-500 p-2 rounded">
                  <div className="text-black">
                    {item.icon}
                  </div>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
