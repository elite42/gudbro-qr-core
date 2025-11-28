// Module 9: HubRenderer.jsx - PWA Landing Page Component

import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import * as LucideIcons from 'lucide-react';

export default function HubRenderer() {
  const { shortCode } = useParams();
  const [searchParams] = useSearchParams();
  const [hub, setHub] = useState(null);
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [passwordRequired, setPasswordRequired] = useState(false);
  const [password, setPassword] = useState('');
  const [installPrompt, setInstallPrompt] = useState(null);
  const [showInstallButton, setShowInstallButton] = useState(false);

  // Register Service Worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('SW registered:', registration.scope);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                // New version available
                if (confirm('New version available! Reload to update?')) {
                  window.location.reload();
                }
              }
            });
          });
        })
        .catch((err) => console.error('SW registration failed:', err));
    }
  }, []);

  // PWA Install Prompt
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setInstallPrompt(e);
      setShowInstallButton(true);
    };
    
    window.addEventListener('beforeinstallprompt', handler);
    
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallButton(false);
    }
    
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setShowInstallButton(false);
    }
    
    setInstallPrompt(null);
  };

  useEffect(() => {
    loadHub();
  }, [shortCode]);

  const loadHub = async (pwd = null) => {
    try {
      setLoading(true);
      const url = `/api/${shortCode}${pwd ? `?password=${pwd}` : ''}`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.status === 401 && data.passwordProtected) {
        setPasswordRequired(true);
        setLoading(false);
        return;
      }

      if (!response.ok) throw new Error(data.error || 'Hub not found');

      setHub(data.hub);
      setLinks(data.links);
      setPasswordRequired(false);
      setLoading(false);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    loadHub(password);
  };

  const handleLinkClick = async (linkId, url) => {
    // Track click
    try {
      await fetch(`/api/${shortCode}/link/${linkId}/click`, { method: 'POST' });
    } catch (err) {
      console.error('Track click failed:', err);
    }

    // Open link
    window.open(url, '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (passwordRequired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
          <h2 className="text-2xl font-bold text-center mb-6">Password Protected</h2>
          <form onSubmit={handlePasswordSubmit}>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition"
            >
              Submit
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Oops!</h1>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!hub) return null;

  const theme = hub.theme || {};
  const {
    primaryColor = '#000000',
    backgroundColor = '#ffffff',
    textColor = '#333333',
    fontFamily = 'Inter',
    borderRadius = '8px',
    buttonStyle = 'solid'
  } = theme;

  return (
    <div
      className="min-h-screen py-8 px-4"
      style={{
        backgroundColor,
        color: textColor,
        fontFamily
      }}
    >
      {/* PWA & SEO Meta Tags */}
      <Helmet>
        <title>{hub.meta_title || hub.title}</title>
        <meta name="description" content={hub.meta_description || hub.description} />
        <link rel="icon" href={hub.favicon_url} />
        
        {/* PWA */}
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content={theme.primaryColor || '#000000'} />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content={hub.title} />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
        
        {/* OG Tags */}
        <meta property="og:title" content={hub.meta_title || hub.title} />
        <meta property="og:description" content={hub.meta_description || hub.description} />
        <meta property="og:image" content={hub.cover_image_url || hub.logo_url} />
        <meta property="og:type" content="website" />
      </Helmet>

      <div className="max-w-2xl mx-auto">
        {/* PWA Install Button */}
        {showInstallButton && (
          <div className="fixed top-4 right-4 z-50">
            <button
              onClick={handleInstallClick}
              className="bg-white shadow-lg rounded-full px-4 py-2 flex items-center gap-2 hover:shadow-xl transition"
              style={{ color: theme.primaryColor || '#000000' }}
            >
              <LucideIcons.Download size={20} />
              <span className="font-medium">Install App</span>
            </button>
          </div>
        )}
        {/* Cover Image */}
        {hub.cover_image_url && (
          <div className="mb-8 -mx-4">
            <img
              src={hub.cover_image_url}
              alt={hub.title}
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Logo */}
        {hub.logo_url && (
          <div className="flex justify-center mb-6">
            <img
              src={hub.logo_url}
              alt={hub.title}
              className="w-24 h-24 rounded-full object-cover shadow-lg"
            />
          </div>
        )}

        {/* Title & Subtitle */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">{hub.title}</h1>
          {hub.subtitle && (
            <p className="text-lg opacity-80">{hub.subtitle}</p>
          )}
          {hub.description && (
            <p className="mt-4 opacity-70">{hub.description}</p>
          )}
        </div>

        {/* Links */}
        <div className="space-y-4">
          {links.map((link) => (
            <LinkButton
              key={link.id}
              link={link}
              onClick={() => handleLinkClick(link.id, link.url)}
              theme={{
                primaryColor,
                borderRadius,
                buttonStyle: link.button_style || buttonStyle
              }}
            />
          ))}
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-sm opacity-60">
          <p>Powered by QR Platform</p>
        </div>
      </div>
    </div>
  );
}

function LinkButton({ link, onClick, theme }) {
  const { primaryColor, borderRadius, buttonStyle } = theme;
  const Icon = LucideIcons[link.icon] || LucideIcons.Link;

  const getButtonStyles = () => {
    const baseStyles = {
      borderRadius,
      transition: 'all 0.2s'
    };

    const color = link.color || primaryColor;
    const bgColor = link.background_color;

    if (buttonStyle === 'solid') {
      return {
        ...baseStyles,
        backgroundColor: bgColor || color,
        color: '#ffffff',
        border: 'none'
      };
    } else if (buttonStyle === 'outline') {
      return {
        ...baseStyles,
        backgroundColor: 'transparent',
        color: color,
        border: `2px solid ${color}`
      };
    } else { // minimal
      return {
        ...baseStyles,
        backgroundColor: 'rgba(0,0,0,0.05)',
        color: color,
        border: 'none'
      };
    }
  };

  return (
    <button
      onClick={onClick}
      style={getButtonStyles()}
      className={`
        w-full px-6 py-4 flex items-center justify-center gap-3
        font-medium text-lg hover:scale-105 active:scale-95
        ${link.is_featured ? 'shadow-lg' : 'shadow-md'}
      `}
    >
      {link.icon && <Icon size={24} />}
      <span>{link.label}</span>
    </button>
  );
}

// Template-specific layouts (optional enhancement)
export function RestaurantTemplate({ hub, links, onLinkClick }) {
  // Custom layout for restaurants
  return (
    <div className="restaurant-theme">
      {/* ... custom restaurant layout ... */}
    </div>
  );
}

export function HotelTemplate({ hub, links, onLinkClick }) {
  // Custom layout for hotels
  return (
    <div className="hotel-theme">
      {/* ... custom hotel layout ... */}
    </div>
  );
}

// Export template map for dynamic loading
export const TEMPLATE_COMPONENTS = {
  restaurant: RestaurantTemplate,
  hotel: HotelTemplate,
  // Add more as needed
  default: HubRenderer
};
