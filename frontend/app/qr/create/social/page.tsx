'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, SocialQRData, QRResponse } from '@/lib/api/qr';

const SOCIAL_PLATFORMS = [
  { id: 'instagram' as const, name: 'Instagram', icon: 'Instagram', placeholder: 'username', color: 'bg-pink-500' },
  { id: 'facebook' as const, name: 'Facebook', icon: 'Facebook', placeholder: 'username', color: 'bg-blue-600' },
  { id: 'twitter' as const, name: 'Twitter/X', icon: 'Twitter', placeholder: 'username', color: 'bg-black' },
  { id: 'linkedin' as const, name: 'LinkedIn', icon: 'Linkedin', placeholder: 'company or in/username', color: 'bg-blue-700' },
  { id: 'youtube' as const, name: 'YouTube', icon: 'Youtube', placeholder: '@channel', color: 'bg-red-600' },
  { id: 'tiktok' as const, name: 'TikTok', icon: 'Music', placeholder: '@username', color: 'bg-black' },
  { id: 'snapchat' as const, name: 'Snapchat', icon: 'Ghost', placeholder: 'username', color: 'bg-yellow-400' },
  { id: 'pinterest' as const, name: 'Pinterest', icon: 'Pin', placeholder: 'username', color: 'bg-red-600' },
];

export default function CreateSocialQRPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<QRResponse | null>(null);

  // Form fields
  const [platform, setPlatform] = useState<SocialQRData['platform']>('instagram');
  const [username, setUsername] = useState('');

  const selectedPlatform = SOCIAL_PLATFORMS.find(p => p.id === platform)!;

  // Form validation
  const validateForm = (): string | null => {
    if (!username.trim()) {
      return 'Username/handle is required';
    }

    // Remove @ if user added it
    const cleanUsername = username.trim().replace(/^@/, '');
    if (cleanUsername.length < 1) {
      return 'Please enter a valid username';
    }

    return null;
  };

  // Handle form submission
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
      const data: SocialQRData = {
        platform,
        username: username.trim().replace(/^@/, ''), // Remove @ prefix if added
      };

      const qrResult = await qrApi.createSocial(data);
      setResult(qrResult);
    } catch (err: any) {
      setError(err.message || 'Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  // Reset form
  const handleReset = () => {
    // Reset result first to hide the success panel
    setResult(null);

    // Then reset validation state and error in the next render cycle
    setTimeout(() => {
      setHasSubmitted(false);
      setError(null);
      setUsername('');
    }, 0);
  };

  // Download QR code
  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `social-${platform}-qr-${result.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link
                href="/qr"
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700"
              >
                <LucideIcons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-black">Social Media QR Code</h1>
                <p className="text-sm text-gray-600">
                  Create a QR code linking to your social media profile
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-pink-50 rounded-lg border border-pink-200">
              <LucideIcons.Share2 className="w-5 h-5 text-pink-600" />
              <span className="text-sm font-medium text-pink-700">Essential</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-black">Social Profile Details</h2>

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

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Platform Selection */}
                <div>
                  <label className="block text-sm font-medium mb-3 text-gray-700">
                    Social Platform <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {SOCIAL_PLATFORMS.map((plat) => {
                      const Icon = LucideIcons[plat.icon as keyof typeof LucideIcons] as React.ComponentType<any>;
                      const isSelected = platform === plat.id;

                      return (
                        <button
                          key={plat.id}
                          type="button"
                          onClick={() => setPlatform(plat.id)}
                          disabled={loading || result !== null}
                          className={`
                            px-3 py-3 rounded-lg border-2 font-medium text-sm transition-all flex items-center gap-2
                            ${isSelected
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          <Icon className="w-4 h-4" />
                          {plat.name}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Username */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Username / Handle <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      {(() => {
                        const Icon = LucideIcons[selectedPlatform.icon as keyof typeof LucideIcons] as React.ComponentType<any>;
                        return <Icon className="w-5 h-5 text-gray-400" />;
                      })()}
                    </div>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder={selectedPlatform.placeholder}
                      disabled={loading || result !== null}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      maxLength={100}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Enter your {selectedPlatform.name} username (@ symbol optional)
                  </p>
                </div>

                {/* Platform-specific help text */}
                <div className="p-3 bg-gray-50 rounded-lg text-xs text-gray-600">
                  <strong className="text-gray-700">Tip:</strong>
                  {platform === 'linkedin' && ' For personal profiles use "in/username", for companies use "company/name"'}
                  {platform === 'youtube' && ' Use your @channel handle or channel name'}
                  {platform === 'instagram' && ' Your Instagram username without the @ symbol'}
                  {platform === 'facebook' && ' Your Facebook profile username or page name'}
                  {platform === 'twitter' && ' Your Twitter/X username'}
                  {platform === 'tiktok' && ' Your TikTok username'}
                  {platform === 'snapchat' && ' Your Snapchat username'}
                  {platform === 'pinterest' && ' Your Pinterest username'}
                </div>

                {/* Submit Buttons */}
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

            {/* Info Box */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <LucideIcons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm mb-1">How it works</h3>
                  <p className="text-blue-700 text-sm">
                    When scanned, this QR code opens your social media profile directly in the
                    platform's app (if installed) or web browser. Perfect for business cards,
                    posters, or product packaging!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-bold mb-4 text-black">Preview</h2>

              {!result ? (
                <div className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                  <LucideIcons.QrCode className="w-16 h-16 mb-3" />
                  <p className="text-sm font-medium">QR code will appear here</p>
                  <p className="text-xs mt-1">Fill in the form and click Generate</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* QR Code Image */}
                  <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 p-4 flex items-center justify-center">
                    <img
                      src={result.qr_image}
                      alt="Social Media QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Success Message */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Your {selectedPlatform.name} QR code is ready to use
                      </p>
                    </div>
                  </div>

                  {/* QR Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      {(() => {
                        const Icon = LucideIcons[selectedPlatform.icon as keyof typeof LucideIcons] as React.ComponentType<any>;
                        return <Icon className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />;
                      })()}
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Platform</p>
                        <div className="flex items-center gap-2">
                          <div className={`w-3 h-3 rounded-full ${selectedPlatform.color}`} />
                          <p className="text-black font-medium">{selectedPlatform.name}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <LucideIcons.User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Username</p>
                        <p className="text-black font-medium">@{username.replace(/^@/, '')}</p>
                      </div>
                    </div>
                    {result.short_url && (
                      <div className="flex items-start gap-2">
                        <LucideIcons.Link className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs">Short URL</p>
                          <a
                            href={result.short_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline break-all"
                          >
                            {result.short_url}
                          </a>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
