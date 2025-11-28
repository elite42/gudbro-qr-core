'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, WiFiQRData, QRResponse } from '@/lib/api/qr';

export default function CreateWiFiQRPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<QRResponse | null>(null);

  // Form fields
  const [ssid, setSsid] = useState('');
  const [password, setPassword] = useState('');
  const [encryption, setEncryption] = useState<'WPA' | 'WEP' | 'nopass'>('WPA');
  const [hidden, setHidden] = useState(false);

  // Form validation
  const validateForm = (): string | null => {
    if (!ssid.trim()) {
      return 'Network name (SSID) is required';
    }

    if (encryption !== 'nopass' && !password.trim()) {
      return 'Password is required for secured networks';
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
      const data: WiFiQRData = {
        ssid: ssid.trim(),
        password: encryption !== 'nopass' ? password.trim() : undefined,
        encryption,
        hidden: hidden || undefined,
      };

      const qrResult = await qrApi.createWiFi(data);
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
      setSsid('');
      setPassword('');
      setEncryption('WPA');
      setHidden(false);
    }, 0);
  };

  // Download QR code
  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `wifi-qr-${result.id}.png`;
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
                <h1 className="text-2xl font-bold text-black">WiFi QR Code</h1>
                <p className="text-sm text-gray-600">
                  Create a QR code for instant WiFi connection
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-purple-50 rounded-lg border border-purple-200">
              <LucideIcons.Wifi className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Essential</span>
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
              <h2 className="text-lg font-bold mb-4 text-black">WiFi Network Details</h2>

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
                {/* SSID */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Network Name (SSID) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LucideIcons.Wifi className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={ssid}
                      onChange={(e) => setSsid(e.target.value)}
                      placeholder="My WiFi Network"
                      disabled={loading || result !== null}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      maxLength={32}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    The WiFi network name (case-sensitive)
                  </p>
                </div>

                {/* Encryption Type */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Security Type <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['WPA', 'WEP', 'nopass'] as const).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEncryption(type)}
                        disabled={loading || result !== null}
                        className={`
                          px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all
                          ${encryption === type
                            ? 'border-black bg-black text-white'
                            : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                          }
                          disabled:opacity-50 disabled:cursor-not-allowed
                        `}
                      >
                        {type === 'WPA' && 'WPA/WPA2'}
                        {type === 'WEP' && 'WEP'}
                        {type === 'nopass' && 'None'}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Most modern WiFi networks use WPA/WPA2
                  </p>
                </div>

                {/* Password */}
                {encryption !== 'nopass' && (
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LucideIcons.Lock className="w-5 h-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter WiFi password"
                        disabled={loading || result !== null}
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 font-mono text-sm"
                        maxLength={63}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Network password (case-sensitive)
                    </p>
                  </div>
                )}

                {/* Hidden Network */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="hidden"
                    checked={hidden}
                    onChange={(e) => setHidden(e.target.checked)}
                    disabled={loading || result !== null}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <label htmlFor="hidden" className="block text-sm font-medium text-gray-700 cursor-pointer">
                      Hidden Network
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Check this if your WiFi network is hidden
                    </p>
                  </div>
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
                    Guests can scan this QR code with their phone camera to instantly connect
                    to your WiFi network - no manual password entry needed! Works on iOS (11+)
                    and Android (10+).
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
                      alt="WiFi QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Success Message */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Your WiFi QR code is ready to use
                      </p>
                    </div>
                  </div>

                  {/* QR Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <LucideIcons.Wifi className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Network Name</p>
                        <p className="text-black font-medium font-mono">{ssid}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <LucideIcons.Shield className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Security</p>
                        <p className="text-black">
                          {encryption === 'WPA' && 'WPA/WPA2'}
                          {encryption === 'WEP' && 'WEP'}
                          {encryption === 'nopass' && 'None (Open Network)'}
                        </p>
                      </div>
                    </div>
                    {encryption !== 'nopass' && (
                      <div className="flex items-start gap-2">
                        <LucideIcons.Lock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs">Password</p>
                          <p className="text-black font-mono text-sm break-all">{password}</p>
                        </div>
                      </div>
                    )}
                    {hidden && (
                      <div className="flex items-start gap-2">
                        <LucideIcons.EyeOff className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs">Network Visibility</p>
                          <p className="text-black">Hidden Network</p>
                        </div>
                      </div>
                    )}
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
