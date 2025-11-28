'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { hubApi, Hub, HubTheme, CreateLinkData } from '@/lib/api/hub';
import LinkEditor from '@/components/hub/LinkEditor';
import HubPreview from '@/components/hub/HubPreview';

type TabType = 'info' | 'theme' | 'links' | 'preview';

export default function EditHubPage() {
  const params = useParams();
  const router = useRouter();
  const hubId = params.id as string;

  const [hub, setHub] = useState<Hub | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TabType>('info');

  // Form state
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [description, setDescription] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [theme, setTheme] = useState<HubTheme>({
    primaryColor: '#000000',
    secondaryColor: '#ffffff',
    backgroundColor: '#ffffff',
    textColor: '#000000',
    fontFamily: 'Inter',
    borderRadius: '8px',
    buttonStyle: 'solid',
  });

  useEffect(() => {
    loadHub();
  }, [hubId]);

  const loadHub = async () => {
    try {
      setLoading(true);
      const data = await hubApi.getHub(hubId);
      setHub(data);
      setTitle(data.title);
      setSubtitle(data.subtitle || '');
      setDescription(data.description || '');
      setLogoUrl(data.logo_url || '');
      setTheme(data.theme_json);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load hub');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveInfo = async () => {
    try {
      setSaving(true);
      const updated = await hubApi.updateHub(hubId, {
        title,
        subtitle: subtitle || undefined,
        description: description || undefined,
        logo_url: logoUrl || undefined,
      });
      setHub(updated);
      alert('Basic info saved!');
    } catch (err: any) {
      alert('Failed to save: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleSaveTheme = async () => {
    try {
      setSaving(true);
      const updated = await hubApi.updateHub(hubId, { theme: theme });
      setHub(updated);
      alert('Theme saved!');
    } catch (err: any) {
      alert('Failed to save theme: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAddLink = async (data: CreateLinkData) => {
    const link = await hubApi.addLink(hubId, data);
    if (hub) {
      setHub({ ...hub, links: [...(hub.links || []), link] });
    }
  };

  const handleUpdateLink = async (
    linkId: string,
    data: Partial<CreateLinkData>
  ) => {
    const updated = await hubApi.updateLink(hubId, linkId, data);
    if (hub) {
      setHub({
        ...hub,
        links: hub.links?.map((l) => (l.id === linkId ? updated : l)),
      });
    }
  };

  const handleDeleteLink = async (linkId: string) => {
    await hubApi.deleteLink(hubId, linkId);
    if (hub) {
      setHub({
        ...hub,
        links: hub.links?.filter((l) => l.id !== linkId),
      });
    }
  };

  const handleReorderLinks = async (linkIds: string[]) => {
    await hubApi.reorderLinks(hubId, linkIds);
    // Reload hub to get updated display_order from server
    await loadHub();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LucideIcons.Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (error || !hub) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <LucideIcons.AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-600" />
          <h2 className="text-xl font-semibold mb-2">Error Loading Hub</h2>
          <p className="text-gray-600 mb-6">{error || 'Hub not found'}</p>
          <Link
            href="/hub"
            className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors inline-block"
          >
            Back to Hubs
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: keyof typeof LucideIcons }[] =
    [
      { id: 'info', label: 'Basic Info', icon: 'Info' },
      { id: 'theme', label: 'Theme', icon: 'Palette' },
      { id: 'links', label: 'Links', icon: 'Link' },
      { id: 'preview', label: 'Preview', icon: 'Eye' },
    ];

  const currentHub = {
    ...hub,
    title,
    subtitle,
    description,
    logo_url: logoUrl,
    theme_json: theme,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/hub"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
              >
                <LucideIcons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-xl font-bold">Edit Hub</h1>
                <p className="text-sm text-gray-600">{hub.title}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Live */}
              <a
                href={`/${hub.short_code}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
              >
                <LucideIcons.ExternalLink className="w-4 h-4" />
                View Live
              </a>

              {/* Copy URL */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/${hub.short_code}`
                  );
                  alert('URL copied to clipboard!');
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 text-gray-700"
              >
                <LucideIcons.Copy className="w-4 h-4" />
                Copy URL
              </button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon =
                LucideIcons[tab.icon as keyof typeof LucideIcons] ||
                LucideIcons.Circle;
              const IconComponent = Icon as React.ComponentType<any>;

              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <IconComponent className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Editor */}
          <div className="lg:col-span-2 space-y-6">
            {/* Basic Info Tab */}
            {activeTab === 'info' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Basic Information</h2>

                  <div className="space-y-4">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Title *
                      </label>
                      <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Your Hub Name"
                      />
                    </div>

                    {/* Subtitle */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Subtitle
                      </label>
                      <input
                        type="text"
                        value={subtitle}
                        onChange={(e) => setSubtitle(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="A short tagline"
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Description
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="Tell visitors about your hub"
                      />
                    </div>

                    {/* Logo URL */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={logoUrl}
                        onChange={(e) => setLogoUrl(e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                        placeholder="https://example.com/logo.png"
                      />
                      {logoUrl && (
                        <div className="mt-2 flex items-center gap-2">
                          <img
                            src={logoUrl}
                            alt="Logo preview"
                            className="w-12 h-12 rounded-lg object-cover border border-gray-200"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                          <span className="text-xs text-gray-500">
                            Logo preview
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleSaveInfo}
                      disabled={saving || !title.trim()}
                      className="w-full px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <LucideIcons.Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <LucideIcons.Save className="w-5 h-5" />
                          Save Changes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Theme Tab */}
            {activeTab === 'theme' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold mb-4">Theme Customization</h2>

                  <div className="space-y-4">
                    {/* Colors Grid */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Primary Color */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Primary Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={theme.primaryColor}
                            onChange={(e) =>
                              setTheme({ ...theme, primaryColor: e.target.value })
                            }
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={theme.primaryColor}
                            onChange={(e) =>
                              setTheme({ ...theme, primaryColor: e.target.value })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>

                      {/* Secondary Color */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Secondary Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={theme.secondaryColor}
                            onChange={(e) =>
                              setTheme({
                                ...theme,
                                secondaryColor: e.target.value,
                              })
                            }
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={theme.secondaryColor}
                            onChange={(e) =>
                              setTheme({
                                ...theme,
                                secondaryColor: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>

                      {/* Background Color */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Background Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={theme.backgroundColor}
                            onChange={(e) =>
                              setTheme({
                                ...theme,
                                backgroundColor: e.target.value,
                              })
                            }
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={theme.backgroundColor}
                            onChange={(e) =>
                              setTheme({
                                ...theme,
                                backgroundColor: e.target.value,
                              })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>

                      {/* Text Color */}
                      <div>
                        <label className="block text-sm font-medium mb-2">
                          Text Color
                        </label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={theme.textColor}
                            onChange={(e) =>
                              setTheme({ ...theme, textColor: e.target.value })
                            }
                            className="w-16 h-10 rounded border border-gray-300 cursor-pointer"
                          />
                          <input
                            type="text"
                            value={theme.textColor}
                            onChange={(e) =>
                              setTheme({ ...theme, textColor: e.target.value })
                            }
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Font Family */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Font Family
                      </label>
                      <select
                        value={theme.fontFamily}
                        onChange={(e) =>
                          setTheme({ ...theme, fontFamily: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent"
                      >
                        <option value="Inter">Inter</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="Lato">Lato</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                      </select>
                    </div>

                    {/* Border Radius */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Border Radius
                      </label>
                      <input
                        type="text"
                        value={theme.borderRadius}
                        onChange={(e) =>
                          setTheme({ ...theme, borderRadius: e.target.value })
                        }
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-black focus:border-transparent font-mono text-sm"
                        placeholder="8px"
                      />
                    </div>

                    {/* Button Style */}
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        Button Style
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['solid', 'outline', 'minimal'] as const).map(
                          (style) => (
                            <button
                              key={style}
                              onClick={() =>
                                setTheme({ ...theme, buttonStyle: style })
                              }
                              className={`px-4 py-2 rounded-lg border-2 text-sm font-medium transition-colors ${
                                theme.buttonStyle === style
                                  ? 'border-black bg-black text-white'
                                  : 'border-gray-200 hover:border-gray-300 text-gray-700'
                              }`}
                            >
                              {style.charAt(0).toUpperCase() + style.slice(1)}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    {/* Save Button */}
                    <button
                      onClick={handleSaveTheme}
                      disabled={saving}
                      className="w-full px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {saving ? (
                        <>
                          <LucideIcons.Loader2 className="w-5 h-5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <LucideIcons.Save className="w-5 h-5" />
                          Save Theme
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Links Tab */}
            {activeTab === 'links' && (
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <LinkEditor
                  links={hub.links || []}
                  onAddLink={handleAddLink}
                  onUpdateLink={handleUpdateLink}
                  onDeleteLink={handleDeleteLink}
                  onReorderLinks={handleReorderLinks}
                />
              </div>
            )}

            {/* Preview Tab (Mobile Only) */}
            {activeTab === 'preview' && (
              <div className="lg:hidden bg-white rounded-xl border border-gray-200 p-6">
                <HubPreview hub={currentHub} links={hub.links} />
              </div>
            )}
          </div>

          {/* Right Column - Live Preview (Desktop Only) */}
          <div className="hidden lg:block lg:col-span-1">
            <div className="sticky top-24">
              <div className="bg-white rounded-xl border border-gray-200 p-6">
                <HubPreview hub={currentHub} links={hub.links} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
