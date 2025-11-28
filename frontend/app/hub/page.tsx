'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import * as LucideIcons from 'lucide-react';
import { hubApi, Hub } from '@/lib/api/hub';

export default function HubListPage() {
  const router = useRouter();
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHubs();
  }, []);

  const loadHubs = async () => {
    try {
      setLoading(true);
      const result = await hubApi.getUserHubs(1, 50);
      setHubs(result.hubs);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to load hubs');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this Hub?')) return;

    try {
      await hubApi.deleteHub(id);
      setHubs(hubs.filter((h) => h.id !== id));
    } catch (err: any) {
      alert('Failed to delete hub: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LucideIcons.Loader2 className="w-8 h-8 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-black">My Hubs</h1>
              <p className="text-gray-600 mt-1">
                Manage your link-in-bio landing pages
              </p>
            </div>
            <Link
              href="/hub/create"
              className="px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
            >
              <LucideIcons.Plus className="w-5 h-5" />
              Create New Hub
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <LucideIcons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-800 font-medium">Error</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        )}

        {/* Empty state */}
        {hubs.length === 0 && !error && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <LucideIcons.Link className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold mb-2">No Hubs yet</h2>
            <p className="text-gray-600 mb-6">
              Create your first Hub to get started with link aggregation
            </p>
            <Link
              href="/hub/create"
              className="inline-flex items-center gap-2 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              <LucideIcons.Plus className="w-5 h-5" />
              Create Your First Hub
            </Link>
          </div>
        )}

        {/* Hubs Grid */}
        {hubs.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {hubs.map((hub) => (
              <div
                key={hub.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
              >
                {/* Hub preview */}
                <div
                  className="h-32 flex items-center justify-center p-6"
                  style={{ backgroundColor: hub.theme_json.backgroundColor }}
                >
                  {hub.logo_url ? (
                    <img
                      src={hub.logo_url}
                      alt={hub.title}
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: hub.theme_json.primaryColor }}
                    >
                      <LucideIcons.Link
                        className="w-8 h-8"
                        style={{ color: hub.theme_json.secondaryColor }}
                      />
                    </div>
                  )}
                </div>

                {/* Hub info */}
                <div className="p-6">
                  <h3 className="font-bold text-lg mb-1 truncate text-black">{hub.title}</h3>
                  {hub.subtitle && (
                    <p className="text-sm text-gray-600 mb-3 truncate">
                      {hub.subtitle}
                    </p>
                  )}

                  {/* Stats */}
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <LucideIcons.Eye className="w-4 h-4" />
                      <span>{hub.view_count || 0}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <LucideIcons.Link2 className="w-4 h-4" />
                      <span>{hub.links?.length || 0} links</span>
                    </div>
                  </div>

                  {/* Short URL */}
                  <div className="mb-4 p-2 bg-gray-100 rounded font-mono text-sm flex items-center justify-between">
                    <span className="truncate text-gray-800">/{hub.short_code}</span>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(
                          `${window.location.origin}/${hub.short_code}`
                        );
                        alert('URL copied!');
                      }}
                      className="p-1 hover:bg-gray-300 rounded text-gray-700"
                    >
                      <LucideIcons.Copy className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link
                      href={`/hub/${hub.id}/edit`}
                      className="flex-1 px-4 py-2 bg-black text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors text-center"
                    >
                      Edit
                    </Link>
                    <a
                      href={`/${hub.short_code}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <LucideIcons.ExternalLink className="w-4 h-4" />
                    </a>
                    <button
                      onClick={() => handleDelete(hub.id)}
                      className="px-4 py-2 border border-red-300 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 transition-colors"
                    >
                      <LucideIcons.Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
