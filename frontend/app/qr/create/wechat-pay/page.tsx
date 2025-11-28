'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, WeChatPayQRData, QRResponse } from '@/lib/api/qr';

export default function CreateWeChatPayQRPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<QRResponse | null>(null);

  const [merchantId, setMerchantId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState<'CNY' | 'VND'>('CNY');
  const [description, setDescription] = useState('');

  const validateForm = (): string | null => {
    if (!merchantId.trim()) {
      return 'Merchant ID is required';
    }

    if (amount && (isNaN(Number(amount)) || Number(amount) <= 0)) {
      return 'Amount must be a positive number';
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
      const data: WeChatPayQRData = {
        merchant_id: merchantId.trim(),
        amount: amount ? Number(amount) : undefined,
        currency: currency || undefined,
        description: description.trim() || undefined,
      };

      const qrResult = await qrApi.createWeChatPay(data);
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
      setMerchantId('');
      setAmount('');
      setCurrency('CNY');
      setDescription('');
    }, 0);
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `wechat-pay-qr-${result.id}.png`;
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
                <h1 className="text-2xl font-bold text-black">WeChat Pay QR Code</h1>
                <p className="text-sm text-gray-600">
                  Create a QR code for WeChat Pay payment system (1.3B+ users)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <LucideIcons.CreditCard className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Asia-Pacific</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-black">Payment Details</h2>

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
                    Merchant ID <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LucideIcons.Store className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={merchantId}
                      onChange={(e) => setMerchantId(e.target.value)}
                      placeholder="1234567890"
                      disabled={loading || result !== null}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Your WeChat Pay merchant identifier
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Currency
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setCurrency('CNY')}
                      disabled={loading || result !== null}
                      className={`
                        px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all
                        ${currency === 'CNY'
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      🇨🇳 CNY (¥)
                    </button>
                    <button
                      type="button"
                      onClick={() => setCurrency('VND')}
                      disabled={loading || result !== null}
                      className={`
                        px-4 py-3 rounded-lg border-2 font-medium text-sm transition-all
                        ${currency === 'VND'
                          ? 'border-black bg-black text-white'
                          : 'border-gray-300 bg-white text-gray-700 hover:border-gray-400'
                        }
                        disabled:opacity-50 disabled:cursor-not-allowed
                      `}
                    >
                      🇻🇳 VND (₫)
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Amount (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LucideIcons.Coins className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="100.00"
                      step="0.01"
                      min="0"
                      disabled={loading || result !== null}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Leave blank for customer-entered amount
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Payment for..."
                    rows={3}
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    maxLength={200}
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
                    Customers scan this QR code with WeChat to make a payment. Widely used in China
                    and across Asia. Perfect for retail stores, restaurants, and street vendors.
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
                      alt="WeChat Pay QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Your WeChat Pay QR code is ready
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <LucideIcons.Store className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Merchant ID</p>
                        <p className="text-black font-medium">{merchantId}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <LucideIcons.Coins className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Amount</p>
                        <p className="text-black font-medium">
                          {amount ? (
                            <>
                              {currency === 'CNY' ? '¥' : '₫'} {Number(amount).toLocaleString()}
                            </>
                          ) : (
                            'Customer enters amount'
                          )}
                        </p>
                      </div>
                    </div>
                    {description && (
                      <div className="flex items-start gap-2">
                        <LucideIcons.FileText className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs">Description</p>
                          <p className="text-black">{description}</p>
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
