'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, VietQRData, QRResponse } from '@/lib/api/qr';

export default function CreateVietQRPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QRResponse | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [banks, setBanks] = useState<any[]>([]);
  const [loadingBanks, setLoadingBanks] = useState(true);

  const [bankCode, setBankCode] = useState('');
  const [bankSearch, setBankSearch] = useState('');
  const [bankDropdownOpen, setBankDropdownOpen] = useState(false);
  const bankDropdownRef = useRef<HTMLDivElement>(null);

  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');

  // Load banks on mount
  useEffect(() => {
    const loadBanks = async () => {
      try {
        const response = await qrApi.getVietQRBanks();
        setBanks(response.banks || []);
        // Leave bank field empty on initial load
      } catch (err) {
        console.error('Failed to load banks:', err);
        // Fallback banks with official logos
        setBanks([
          { code: 'VCB', name: 'Vietcombank', logo: 'https://cdn.vietqr.io/img/VCB.png' },
          { code: 'TCB', name: 'Techcombank', logo: 'https://cdn.vietqr.io/img/TCB.png' },
          { code: 'MB', name: 'MB Bank', logo: 'https://cdn.vietqr.io/img/MB.png' },
          { code: 'VPB', name: 'VPBank', logo: 'https://cdn.vietqr.io/img/VPB.png' },
          { code: 'ACB', name: 'ACB', logo: 'https://cdn.vietqr.io/img/ACB.png' },
        ]);
      } finally {
        setLoadingBanks(false);
      }
    };

    loadBanks();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (bankDropdownRef.current && !bankDropdownRef.current.contains(event.target as Node)) {
        setBankDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter banks based on search
  const filteredBanks = banks.filter(bank => {
    const searchLower = bankSearch.toLowerCase();
    const bankName = (bank.name || bank.shortName || '').toLowerCase();
    const bankCode = (bank.code || bank.bin || '').toLowerCase();
    return bankName.includes(searchLower) || bankCode.includes(searchLower);
  });

  // Handle bank selection
  const handleBankSelect = (bank: any) => {
    setBankCode(bank.code || bank.bin);
    setBankSearch(`${bank.name || bank.shortName} (${bank.code || bank.bin})`);
    setBankDropdownOpen(false);
  };

  // Handle search input change
  const handleBankSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankSearch(e.target.value);
    setBankDropdownOpen(true);
  };

  // Handle input focus - clear search to show all banks
  const handleBankSearchFocus = () => {
    setBankDropdownOpen(true);
    // If a bank is selected, clear the search to show all banks
    if (bankCode && bankSearch) {
      setBankSearch('');
    }
  };

  // Quick amount buttons handler
  const addQuickAmount = (value: number) => {
    const currentAmount = amount ? Number(amount.replace(/,/g, '')) : 0;
    const newAmount = currentAmount + value;
    setAmount(formatNumber(newAmount));
  };

  // Format number with thousand separators
  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-US');
  };

  // Handle amount input with formatting
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/,/g, ''); // Remove commas
    if (value === '' || /^\d+$/.test(value)) {
      setAmount(value === '' ? '' : formatNumber(Number(value)));
    }
  };

  // Handle account number input (digits only)
  const handleAccountNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    setAccountNumber(value);
  };

  const validateForm = (): string | null => {
    if (!bankCode) {
      return 'Bank selection is required';
    }

    if (!accountNumber.trim()) {
      return 'Account number is required';
    }

    // Validate account number length (9-14 digits for Vietnamese banks)
    const cleanAccountNumber = accountNumber.replace(/\D/g, '');
    if (cleanAccountNumber.length < 9 || cleanAccountNumber.length > 14) {
      return 'Account number must be 9-14 digits';
    }

    if (!accountName.trim()) {
      return 'Account name is required';
    }

    if (amount) {
      const numAmount = Number(amount.replace(/,/g, ''));
      if (isNaN(numAmount) || numAmount <= 0) {
        return 'Amount must be a positive number';
      }
      // Validate amount is multiple of 1000
      if (numAmount % 1000 !== 0) {
        return 'Amount must be a multiple of 1,000 VND';
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
      const data: VietQRData = {
        bank_code: bankCode,
        account_number: accountNumber.trim(),
        account_name: accountName.trim(),
        amount: amount ? Number(amount.replace(/,/g, '')) : undefined,
        description: description.trim() || undefined,
      };

      const qrResult = await qrApi.createVietQR(data);
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
      // Clear bank selection
      setBankCode('');
      setBankSearch('');
      setAccountNumber('');
      setAccountName('');
      setAmount('');
      setDescription('');
      setBankDropdownOpen(false);
    }, 0);
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `vietqr-${result.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedBank = banks.find(b => (b.code || b.bin) === bankCode);

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
                <h1 className="text-2xl font-bold text-black">VietQR Code</h1>
                <p className="text-sm text-gray-600">
                  Create a QR code for Vietnam bank transfers (23 banks supported)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-red-50 rounded-lg border border-red-200">
              <LucideIcons.Banknote className="w-5 h-5 text-red-600" />
              <span className="text-sm font-medium text-red-700">Asia-Pacific</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-black">Bank Account Details</h2>

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
                    Bank <span className="text-red-500">*</span>
                  </label>
                  {loadingBanks ? (
                    <div className="flex items-center justify-center py-8 text-gray-400">
                      <LucideIcons.Loader2 className="w-6 h-6 animate-spin" />
                      <span className="ml-2 text-sm">Loading banks...</span>
                    </div>
                  ) : (
                    <div ref={bankDropdownRef} className="relative">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          {bankCode && bankSearch && banks.find(b => (b.code || b.bin) === bankCode)?.logo ? (
                            <div className="w-6 h-6 bg-gray-100 rounded flex items-center justify-center p-0.5">
                              <img
                                src={banks.find(b => (b.code || b.bin) === bankCode)?.logo}
                                alt="Bank logo"
                                className="w-full h-full object-contain"
                              />
                            </div>
                          ) : (
                            <LucideIcons.Building className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <input
                          type="text"
                          value={bankSearch}
                          onChange={handleBankSearchChange}
                          onFocus={handleBankSearchFocus}
                          placeholder="Search bank..."
                          disabled={loading || result !== null}
                          className="w-full pl-10 pr-20 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                        />
                        <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setBankDropdownOpen(!bankDropdownOpen)}
                            disabled={loading || result !== null}
                            className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50"
                            title="Show all banks"
                          >
                            {bankDropdownOpen ? (
                              <LucideIcons.ChevronUp className="w-4 h-4" />
                            ) : (
                              <LucideIcons.ChevronDown className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Dropdown - Show all banks if search is empty or show filtered */}
                      {bankDropdownOpen && (bankSearch === '' ? banks.length > 0 : filteredBanks.length > 0) && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                          {(bankSearch === '' ? banks : filteredBanks).map((bank) => (
                            <button
                              key={bank.code || bank.bin}
                              type="button"
                              onClick={() => handleBankSelect(bank)}
                              className="w-full px-4 py-3 text-left hover:bg-gray-100 flex items-center justify-between group transition-colors"
                            >
                              <div className="flex items-center gap-3">
                                {bank.logo ? (
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center p-1.5 flex-shrink-0">
                                    <img
                                      src={bank.logo}
                                      alt={bank.name || bank.shortName}
                                      className="w-full h-full object-contain"
                                      onError={(e) => {
                                        // Fallback to building icon if logo fails to load
                                        e.currentTarget.parentElement!.innerHTML = '<svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"></path></svg>';
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <LucideIcons.Building className="w-6 h-6 text-gray-400 group-hover:text-gray-600" />
                                  </div>
                                )}
                                <div className="flex-1">
                                  <p className="text-sm font-medium text-gray-900">
                                    {bank.name || bank.shortName}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {bank.code || bank.bin}
                                  </p>
                                </div>
                              </div>
                              {bankCode === (bank.code || bank.bin) && (
                                <LucideIcons.Check className="w-4 h-4 text-green-600" />
                              )}
                            </button>
                          ))}
                        </div>
                      )}

                      {/* No results */}
                      {bankDropdownOpen && bankSearch && filteredBanks.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
                          <div className="flex items-center gap-2 text-gray-500">
                            <LucideIcons.Search className="w-4 h-4" />
                            <p className="text-sm">No banks found matching "{bankSearch}"</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                  <p className="text-xs text-gray-500 mt-1">
                    Type to search from 23 Vietnamese banks
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Account Number <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LucideIcons.CreditCard className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={accountNumber}
                      onChange={handleAccountNumberChange}
                      placeholder="1234567890"
                      disabled={loading || result !== null}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Account Name <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LucideIcons.User className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={accountName}
                      onChange={(e) => setAccountName(e.target.value)}
                      placeholder="NGUYEN VAN A"
                      disabled={loading || result !== null}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 uppercase"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Full name as registered with the bank
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Amount (VND) (Optional)
                  </label>

                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LucideIcons.Coins className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="500,000"
                      disabled={loading || result !== null}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>

                  {/* Quick amount buttons - All below input */}
                  <div className="grid grid-cols-4 gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => addQuickAmount(1000)}
                      disabled={loading || result !== null}
                      className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      1K
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickAmount(10000)}
                      disabled={loading || result !== null}
                      className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      10K
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickAmount(50000)}
                      disabled={loading || result !== null}
                      className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      50K
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickAmount(100000)}
                      disabled={loading || result !== null}
                      className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      100K
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickAmount(500000)}
                      disabled={loading || result !== null}
                      className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      500K
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickAmount(1000000)}
                      disabled={loading || result !== null}
                      className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      1M
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickAmount(5000000)}
                      disabled={loading || result !== null}
                      className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      5M
                    </button>
                    <button
                      type="button"
                      onClick={() => addQuickAmount(10000000)}
                      disabled={loading || result !== null}
                      className="px-3 py-2 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      10M
                    </button>
                  </div>

                  <p className="text-xs text-gray-500 mt-2">
                    Leave blank for customer-entered amount. Must be multiples of 1,000 VND.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Transfer Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Payment for..."
                    rows={2}
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    maxLength={100}
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
                    VietQR is Vietnam's universal QR payment standard. Customers can scan with any
                    banking app from 23+ Vietnamese banks to transfer money instantly.
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
                      alt="VietQR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Your VietQR code is ready to use
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <LucideIcons.Building className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Bank</p>
                        <p className="text-black font-medium">
                          {selectedBank?.name || selectedBank?.shortName}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <LucideIcons.CreditCard className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Account</p>
                        <p className="text-black font-medium font-mono">{accountNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <LucideIcons.User className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Name</p>
                        <p className="text-black font-medium">{accountName}</p>
                      </div>
                    </div>
                    {amount && (
                      <div className="flex items-start gap-2">
                        <LucideIcons.Coins className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs">Amount</p>
                          <p className="text-black font-medium">
                            {Number(amount).toLocaleString('vi-VN')} đ
                          </p>
                        </div>
                      </div>
                    )}
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
