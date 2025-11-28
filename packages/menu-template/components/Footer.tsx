'use client';

import { VerticalConfig } from '../types';

interface FooterProps {
  config: VerticalConfig;
}

export function Footer({ config }: FooterProps) {
  const { business } = config;
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white py-6 mt-12">
      <div className="container mx-auto px-4 text-center">
        <p className="text-sm text-gray-400">
          © {currentYear} {business.name}. Powered by{' '}
          <span className="text-pink-400">Gudbro</span>
        </p>
      </div>
    </footer>
  );
}
