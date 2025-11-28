'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, MultiURLQRData, QRResponse } from '@/lib/api/qr';

interface URLEntry {
  url: string;
  device?: 'ios' | 'android' | 'desktop';
  label?: string;
}

export default function CreateMultiURLQRPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<QRResponse | null>(null);

  const [routingType, setRoutingType] = useState<'device' | 'priority' | 'choice'>('device');
  const [defaultUrl, setDefaultUrl] = useState('');
  const [urls, setUrls] = useState<URLEntry[]>([
    { url: '', device: 'ios', label: '' },
  ]);

  const addURL = () => {
    setUrls([...urls, { url: '', device: 'ios', label: '' }]);
  };

  const removeURL = (index: number) => {
    setUrls(urls.filter((_, i) => i !== index));
  };

  const updateURL = (index: number, field: keyof URLEntry, value: string) => {
    const newUrls = [...urls];
    newUrls[index] = { ...newUrls[index], [field]: value };
    setUrls(newUrls);
  };

  const validateForm = (): string | null => {
    if (!defaultUrl.trim()) {
      return 'Default URL is required';
    }

    try {
      new URL(defaultUrl);
    } catch {
      return 'Default URL must be valid';
    }

    if (urls.length === 0) {
      return 'At least one URL is required';
    }

    for (const urlEntry of urls) {
      if (!urlEntry.url.trim()) {
        return 'All URL fields must be filled';
      }
      try {
        new URL(urlEntry.url);
      } catch {
        return 'All URLs must be valid';
      }
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setHasSubmitted(true);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: MultiURLQRData = {
        urls: urls.map((u, idx) => ({
          url: u.url.trim(),
          device: routingType === 'device' ? u.device : undefined,
          priority: routingType === 'priority' ? idx + 1 : undefined,
          label: u.label?.trim() || undefined,
        })),
        routing_type: routingType,
        default_url: defaultUrl.trim(),
      };

      const qrResult = await qrApi.createMultiURL(data);
      setResult(qrResult);
    } catch (err: any) {
      setError(err.message || 'Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    // Reset result first to hide the success panel
    setResult(null);

    // Then reset validation state and error in the next render cycle
    setTimeout(() => {
      setHasSubmitted(false);
      setError(null);
      setRoutingType('device');
      setDefaultUrl('');
      setUrls([{ url: '', device: 'ios', label: '' }]);
    }, 0);
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `multi-url-qr-${result.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/qr" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                <LucideIcons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-black">Multi-URL QR Code</h1>
                <p className="text-sm text-gray-600">
                  Create a smart QR code with device-based routing
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
              <LucideIcons.GitBranch className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Standard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-black">Multi-URL Configuration</h2>

              {/* Error message - only show after user has attempted to submit */}
              {error && hasSubmitted && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <LucideIcons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium text-sm">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Routing Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['device', 'priority', 'choice'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setRoutingType(type)}
                        disabled={loading || result !== null}
                        className={`
                          px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all
                          ${routingType === type
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {type === 'device' && 'Device'}
                        {type === 'priority' && 'Priority'}
                        {type === 'choice' && 'User Choice'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {routingType === 'device' && 'Route based on device type (iOS/Android/Desktop)'}
                    {routingType === 'priority' && 'Try URLs in order until one works'}
                    {routingType === 'choice' && 'Let user choose from a list'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Default/Fallback URL <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    value={defaultUrl}
                    onChange={(e) => setDefaultUrl(e.target.value)}
                    placeholder="https://example.com"
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used when no specific URL matches
                  </p>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      URL List <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addURL}
                      disabled={loading || result !== null || urls.length >= 5}
                      className="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <LucideIcons.Plus className="w-4 h-4" />
                      Add URL
                    </button>
                  </div>

                  {urls.map((urlEntry, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">URL {index + 1}</span>
                        {urls.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeURL(index)}
                            disabled={loading || result !== null}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            <LucideIcons.Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <input
                        type="url"
                        value={urlEntry.url}
                        onChange={(e) => updateURL(index, 'url', e.target.value)}
                        placeholder="https://example.com/page"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                      />

                      {routingType === 'device' && (
                        <select
                          value={urlEntry.device}
                          onChange={(e) => updateURL(index, 'device', e.target.value)}
                          disabled={loading || result !== null}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                        >
                          <option value="ios">iOS</option>
                          <option value="android">Android</option>
                          <option value="desktop">Desktop</option>
                        </select>
                      )}

                      {routingType === 'choice' && (
                        <input
                          type="text"
                          value={urlEntry.label || ''}
                          onChange={(e) => updateURL(index, 'label', e.target.value)}
                          placeholder="Label (e.g., 'Download for iOS')"
                          disabled={loading || result !== null}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                        />
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex gap-3 pt-4">
                  {!result ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <LucideIcons.Loader2 className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <LucideIcons.QrCode className="w-5 h-5" />
                          Generate QR Code
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <LucideIcons.RotateCcw className="w-5 h-5" />
                        Create Another
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <LucideIcons.Download className="w-5 h-5" />
                        Download
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <LucideIcons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm mb-1">How it works</h3>
                  <p className="text-blue-700 text-sm">
                    Smart routing directs users to different URLs based on their device or lets them choose.
                    Perfect for app downloads, cross-platform content, and A/B testing!
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-bold mb-4 text-black">Preview</h2>

              {!result ? (
                <div className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                  <LucideIcons.QrCode className="w-16 h-16 mb-3" />
                  <p className="text-sm font-medium text-center">QR code will appear here</p>
                  <p className="text-xs mt-1 text-center px-4">Configure URLs and click Generate</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 p-4 flex items-center justify-center">
                    <img
                      src={result.qr_image}
                      alt="Multi-URL QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Smart routing is active
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-gray-700">
                      <LucideIcons.GitBranch className="w-3 h-3" />
                      <span className="font-medium">Routing: {routingType}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-700">
                      <LucideIcons.Link className="w-3 h-3" />
                      <span className="font-medium">{urls.length} URLs configured</span>
                    </div>
                  </div>

                  {result.short_url && (
                    <div className="text-xs pt-2 border-t border-gray-200">
                      <p className="text-gray-500 mb-1">Short URL</p>
                      <a
                        href={result.short_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {result.short_url}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
