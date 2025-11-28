'use client';

import * as LucideIcons from 'lucide-react';
import { Hub, HubLink, HubTheme } from '@/lib/api/hub';

interface HubPreviewProps {
  hub: Partial<Hub> & { theme_json: HubTheme };
  links?: HubLink[];
}

export default function HubPreview({ hub, links = [] }: HubPreviewProps) {
  // Get icon component
  const getIcon = (iconName: string) => {
    const IconComponent =
      LucideIcons[iconName as keyof typeof LucideIcons] || LucideIcons.Link;
    return IconComponent as React.ComponentType<any>;
  };

  // Get button styles based on theme
  const getButtonClassName = (theme: HubTheme): string => {
    const baseClasses = 'w-full px-6 py-4 font-medium transition-all text-center flex items-center justify-center gap-3';

    const borderRadius = theme.borderRadius || '8px';

    switch (theme.buttonStyle) {
      case 'outline':
        return `${baseClasses} bg-transparent border-2`;
      case 'minimal':
        return `${baseClasses} bg-transparent hover:bg-opacity-10`;
      case 'solid':
      default:
        return `${baseClasses} shadow-sm hover:shadow-md`;
    }
  };

  const getButtonStyle = (theme: HubTheme): React.CSSProperties => {
    const borderRadius = theme.borderRadius || '8px';

    switch (theme.buttonStyle) {
      case 'outline':
        return {
          borderColor: theme.primaryColor,
          color: theme.primaryColor,
          borderRadius,
        };
      case 'minimal':
        return {
          color: theme.primaryColor,
          borderRadius,
        };
      case 'solid':
      default:
        return {
          backgroundColor: theme.primaryColor,
          color: theme.secondaryColor,
          borderRadius,
        };
    }
  };

  const activeLinks = links.filter((link) => link.is_active);

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-100 p-4">
      {/* Mobile Preview Frame */}
      <div className="relative w-full max-w-sm">
        {/* Phone Frame */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-gray-800">
          {/* Status Bar */}
          <div className="bg-gray-800 text-white text-xs px-6 py-2 flex items-center justify-between">
            <span>9:41</span>
            <div className="flex items-center gap-1">
              <LucideIcons.Wifi className="w-3 h-3" />
              <LucideIcons.Signal className="w-3 h-3" />
              <LucideIcons.Battery className="w-3 h-3" />
            </div>
          </div>

          {/* Hub Content */}
          <div
            className="overflow-y-auto"
            style={{
              backgroundColor: hub.theme_json.backgroundColor,
              color: hub.theme_json.textColor,
              fontFamily: hub.theme_json.fontFamily || 'Inter',
              maxHeight: '640px',
            }}
          >
            {/* Header Section */}
            <div className="px-6 pt-12 pb-6 text-center">
              {/* Logo or Icon */}
              <div className="mb-6 flex justify-center">
                {hub.logo_url ? (
                  <img
                    src={hub.logo_url}
                    alt={hub.title || 'Logo'}
                    className="w-24 h-24 rounded-full object-cover border-4"
                    style={{ borderColor: hub.theme_json.primaryColor }}
                  />
                ) : (
                  <div
                    className="w-24 h-24 rounded-full flex items-center justify-center border-4"
                    style={{
                      backgroundColor: hub.theme_json.primaryColor,
                      borderColor: hub.theme_json.primaryColor,
                    }}
                  >
                    <LucideIcons.Link
                      className="w-12 h-12"
                      style={{ color: hub.theme_json.secondaryColor }}
                    />
                  </div>
                )}
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold mb-2">
                {hub.title || 'Your Hub Title'}
              </h1>

              {/* Subtitle */}
              {hub.subtitle && (
                <p className="text-lg opacity-80 mb-3">{hub.subtitle}</p>
              )}

              {/* Description */}
              {hub.description && (
                <p className="text-sm opacity-70 max-w-md mx-auto">
                  {hub.description}
                </p>
              )}
            </div>

            {/* Links Section */}
            <div className="px-6 pb-12 space-y-3">
              {activeLinks.length === 0 ? (
                <div className="text-center py-12 opacity-50">
                  <LucideIcons.Link className="w-12 h-12 mx-auto mb-3" />
                  <p className="text-sm">No links added yet</p>
                  <p className="text-xs mt-1">
                    Add links to see them appear here
                  </p>
                </div>
              ) : (
                activeLinks
                  .sort((a, b) => (a.display_order ?? 0) - (b.display_order ?? 0))
                  .map((link) => {
                    const Icon = getIcon(link.icon);
                    return (
                      <button
                        key={link.id}
                        className={getButtonClassName(hub.theme_json)}
                        style={getButtonStyle(hub.theme_json)}
                        disabled
                      >
                        <Icon className="w-5 h-5 flex-shrink-0" />
                        <span className="flex-1 text-left truncate">
                          {link.label}
                        </span>
                        <LucideIcons.ExternalLink className="w-4 h-4 flex-shrink-0 opacity-50" />
                      </button>
                    );
                  })
              )}
            </div>

            {/* Footer */}
            <div className="px-6 pb-8 text-center">
              <div className="flex items-center justify-center gap-2 opacity-40">
                <LucideIcons.Zap className="w-3 h-3" />
                <p className="text-xs">Powered by QR Platform</p>
              </div>
            </div>
          </div>

          {/* Home Indicator */}
          <div className="bg-gray-800 py-2 flex justify-center">
            <div className="w-32 h-1 bg-gray-600 rounded-full" />
          </div>
        </div>

        {/* Preview Label */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-3 py-1 rounded-full shadow-lg">
          Live Preview
        </div>
      </div>
    </div>
  );
}
