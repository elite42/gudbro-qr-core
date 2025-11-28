'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, BusinessPageQRData, QRResponse } from '@/lib/api/qr';

export default function CreateBusinessPageQRPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<QRResponse | null>(null);

  const [businessName, setBusinessName] = useState('');
  const [tagline, setTagline] = useState('');
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');
  const [address, setAddress] = useState('');

  const validateForm = (): string | null => {
    if (!businessName.trim()) {
      return 'Business name is required';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }

    if (website && !website.match(/^https?:\/\/.+/)) {
      return 'Website must start with http:// or https://';
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
      const data: BusinessPageQRData = {
        business_name: businessName.trim(),
        tagline: tagline.trim() || undefined,
        description: description.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        website: website.trim() || undefined,
        address: address.trim() || undefined,
      };

      const qrResult = await qrApi.createBusinessPage(data);
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
      setBusinessName('');
      setTagline('');
      setDescription('');
      setPhone('');
      setEmail('');
      setWebsite('');
      setAddress('');
    }, 0);
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `business-page-qr-${result.id}.png`;
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
                <h1 className="text-2xl font-bold text-black">Business Page QR Code</h1>
                <p className="text-sm text-gray-600">
                  Create a QR code with your business information
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-lg border border-indigo-200">
              <LucideIcons.Building2 className="w-5 h-5 text-indigo-600" />
              <span className="text-sm font-medium text-indigo-700">Standard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-black">Business Information</h2>

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
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Business Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={businessName}
                    onChange={(e) => setBusinessName(e.target.value)}
                    placeholder="Acme Corp"
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={tagline}
                    onChange={(e) => setTagline(e.target.value)}
                    placeholder="Your trusted partner since 2020"
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Description
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your business..."
                    rows={3}
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    maxLength={300}
                  />
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700">Contact Information</h3>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Phone
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LucideIcons.Phone className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                        disabled={loading || result !== null}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Email
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LucideIcons.Mail className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="contact@example.com"
                        disabled={loading || result !== null}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Website
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LucideIcons.Globe className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="url"
                        value={website}
                        onChange={(e) => setWebsite(e.target.value)}
                        placeholder="https://example.com"
                        disabled={loading || result !== null}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LucideIcons.MapPin className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        placeholder="123 Main St, City, Country"
                        disabled={loading || result !== null}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                        maxLength={200}
                      />
                    </div>
                  </div>
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
                    Scanning this QR code displays a mobile-friendly business page with all your
                    contact information. Perfect for storefront windows, business cards, and marketing materials!
                  </p>
                </div>
              </div>
            </div>
          </div>

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
                  <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 p-4 flex items-center justify-center">
                    <img
                      src={result.qr_image}
                      alt="Business Page QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Your Business Page QR code is ready
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gray-50 rounded-lg space-y-3 text-sm">
                    <div className="font-bold text-lg text-black">{businessName}</div>
                    {tagline && <div className="text-gray-600 italic">{tagline}</div>}
                    {description && <div className="text-gray-700 text-xs">{description}</div>}

                    <div className="pt-2 border-t border-gray-200 space-y-2">
                      {phone && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <LucideIcons.Phone className="w-3 h-3" />
                          <span className="text-xs">{phone}</span>
                        </div>
                      )}
                      {email && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <LucideIcons.Mail className="w-3 h-3" />
                          <span className="text-xs break-all">{email}</span>
                        </div>
                      )}
                      {website && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <LucideIcons.Globe className="w-3 h-3" />
                          <span className="text-xs break-all">{website}</span>
                        </div>
                      )}
                      {address && (
                        <div className="flex items-center gap-2 text-gray-700">
                          <LucideIcons.MapPin className="w-3 h-3" />
                          <span className="text-xs">{address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {result.short_url && (
                    <div className="text-xs">
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
