'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, CouponQRData, QRResponse } from '@/lib/api/qr';

export default function CreateCouponQRPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<QRResponse | null>(null);

  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [discountType, setDiscountType] = useState<'percentage' | 'fixed' | 'bogo'>('percentage');
  const [discountValue, setDiscountValue] = useState('');
  const [validFrom, setValidFrom] = useState('');
  const [validUntil, setValidUntil] = useState('');
  const [terms, setTerms] = useState('');

  const validateForm = (): string | null => {
    if (!title.trim()) {
      return 'Coupon title is required';
    }

    if (!code.trim()) {
      return 'Coupon code is required';
    }

    if (discountValue && (isNaN(Number(discountValue)) || Number(discountValue) <= 0)) {
      return 'Discount value must be a positive number';
    }

    if (discountType === 'percentage' && discountValue && Number(discountValue) > 100) {
      return 'Percentage discount cannot exceed 100%';
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
      const data: CouponQRData = {
        title: title.trim(),
        code: code.trim(),
        description: description.trim() || undefined,
        discount_type: discountType || undefined,
        discount_value: discountValue ? Number(discountValue) : undefined,
        valid_from: validFrom || undefined,
        valid_until: validUntil || undefined,
        terms: terms.trim() || undefined,
      };

      const qrResult = await qrApi.createCoupon(data);
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
      setTitle('');
      setCode('');
      setDescription('');
      setDiscountType('percentage');
      setDiscountValue('');
      setValidFrom('');
      setValidUntil('');
      setTerms('');
    }, 0);
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `coupon-qr-${result.id}.png`;
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
                <h1 className="text-2xl font-bold text-black">Coupon QR Code</h1>
                <p className="text-sm text-gray-600">
                  Create a digital discount voucher or coupon
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
              <LucideIcons.Ticket className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Standard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-black">Coupon Details</h2>

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
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Coupon Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="50% Off All Items"
                      disabled={loading || result !== null}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      maxLength={100}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Coupon Code <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="SAVE50"
                      disabled={loading || result !== null}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 font-mono uppercase text-lg"
                      maxLength={20}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Valid on all products..."
                      rows={2}
                      disabled={loading || result !== null}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-50 disabled:text-gray-500"
                      maxLength={200}
                    />
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Discount Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Discount Type
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['percentage', 'fixed', 'bogo'] as const).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setDiscountType(type)}
                          disabled={loading || result !== null}
                          className={`
                            px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all
                            ${discountType === type
                              ? 'border-black bg-black text-white'
                              : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                            }
                            disabled:opacity-50 disabled:cursor-not-allowed
                          `}
                        >
                          {type === 'percentage' && '% Off'}
                          {type === 'fixed' && '$ Off'}
                          {type === 'bogo' && 'BOGO'}
                        </button>
                      ))}
                    </div>
                  </div>

                  {discountType !== 'bogo' && (
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Discount Value
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={discountValue}
                          onChange={(e) => setDiscountValue(e.target.value)}
                          placeholder={discountType === 'percentage' ? '50' : '10'}
                          step={discountType === 'percentage' ? '1' : '0.01'}
                          min="0"
                          max={discountType === 'percentage' ? '100' : undefined}
                          disabled={loading || result !== null}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-500">
                          {discountType === 'percentage' ? '%' : '$'}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Validity Period
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Valid From
                      </label>
                      <input
                        type="date"
                        value={validFrom}
                        onChange={(e) => setValidFrom(e.target.value)}
                        disabled={loading || result !== null}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Valid Until
                      </label>
                      <input
                        type="date"
                        value={validUntil}
                        onChange={(e) => setValidUntil(e.target.value)}
                        disabled={loading || result !== null}
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Terms & Conditions
                  </label>
                  <textarea
                    value={terms}
                    onChange={(e) => setTerms(e.target.value)}
                    placeholder="One per customer. Not combinable with other offers..."
                    rows={3}
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    maxLength={300}
                  />
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
                    Scanning this QR code displays the coupon details. Perfect for in-store promotions,
                    email campaigns, and social media marketing!
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
                  <p className="text-xs mt-1 text-center px-4">Fill in the form and click Generate</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 p-4 flex items-center justify-center">
                    <img
                      src={result.qr_image}
                      alt="Coupon QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Your Coupon QR code is ready
                      </p>
                    </div>
                  </div>

                  <div className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-dashed border-orange-300 space-y-3">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-900">{title}</div>
                      <div className="text-3xl font-mono font-bold text-orange-700 mt-2 tracking-wider">{code}</div>
                    </div>
                    {(discountValue || discountType === 'bogo') && (
                      <div className="text-center py-2 bg-white/50 rounded text-orange-900 font-semibold">
                        {discountType === 'bogo' && 'Buy One Get One Free'}
                        {discountType === 'percentage' && `${discountValue}% OFF`}
                        {discountType === 'fixed' && `$${discountValue} OFF`}
                      </div>
                    )}
                    {(validFrom || validUntil) && (
                      <div className="text-xs text-orange-700 text-center">
                        Valid: {validFrom && new Date(validFrom).toLocaleDateString()}
                        {validFrom && validUntil && ' - '}
                        {validUntil && new Date(validUntil).toLocaleDateString()}
                      </div>
                    )}
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
