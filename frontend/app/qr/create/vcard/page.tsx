'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, VCardQRData, QRResponse } from '@/lib/api/qr';

export default function CreateVCardQRPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<QRResponse | null>(null);

  // Form fields - Personal Info
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [organization, setOrganization] = useState('');
  const [jobTitle, setJobTitle] = useState('');

  // Contact Info
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [mobile, setMobile] = useState('');
  const [fax, setFax] = useState('');
  const [website, setWebsite] = useState('');

  // Address Info
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [zip, setZip] = useState('');
  const [country, setCountry] = useState('');
  const [note, setNote] = useState('');

  // Form validation
  const validateForm = (): string | null => {
    if (!firstName.trim() && !lastName.trim()) {
      return 'At least first name or last name is required';
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return 'Please enter a valid email address';
    }

    if (website && !website.match(/^https?:\/\/.+/)) {
      return 'Website must start with http:// or https://';
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
      const data: VCardQRData = {
        first_name: firstName.trim(),
        last_name: lastName.trim(),
        organization: organization.trim() || undefined,
        title: jobTitle.trim() || undefined,
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        mobile: mobile.trim() || undefined,
        fax: fax.trim() || undefined,
        website: website.trim() || undefined,
        address: address.trim() || undefined,
        city: city.trim() || undefined,
        state: state.trim() || undefined,
        zip: zip.trim() || undefined,
        country: country.trim() || undefined,
        note: note.trim() || undefined,
      };

      const qrResult = await qrApi.createVCard(data);
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
      setFirstName('');
      setLastName('');
      setOrganization('');
      setJobTitle('');
      setEmail('');
      setPhone('');
      setMobile('');
      setFax('');
      setWebsite('');
      setAddress('');
      setCity('');
      setState('');
      setZip('');
      setCountry('');
      setNote('');
    }, 0);
  };

  // Download QR code
  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `vcard-qr-${result.id}.png`;
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
                <h1 className="text-2xl font-bold text-black">vCard Contact QR Code</h1>
                <p className="text-sm text-gray-600">
                  Create a digital business card QR code
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg border border-green-200">
              <LucideIcons.User className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Essential</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Form (spans 2 columns) */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-black">Contact Information</h2>

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
                {/* Personal Info Section */}
                <div className="space-y-4">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        First Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="John"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Last Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Doe"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Organization
                      </label>
                      <input
                        type="text"
                        value={organization}
                        onChange={(e) => setOrganization(e.target.value)}
                        placeholder="Acme Inc."
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Job Title
                      </label>
                      <input
                        type="text"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="CEO"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Contact Info Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Contact Details
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Email
                    </label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="john@example.com"
                      disabled={loading || result !== null}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1234567890"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Mobile
                      </label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        placeholder="+1234567890"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Fax
                      </label>
                      <input
                        type="tel"
                        value={fax}
                        onChange={(e) => setFax(e.target.value)}
                        placeholder="+1234567890"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://example.com"
                      disabled={loading || result !== null}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                    />
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-4 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
                    Address
                  </h3>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St"
                      disabled={loading || result !== null}
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        City
                      </label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="New York"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        State/Province
                      </label>
                      <input
                        type="text"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        placeholder="NY"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        ZIP/Postal Code
                      </label>
                      <input
                        type="text"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        placeholder="10001"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-2 text-gray-700">
                        Country
                      </label>
                      <input
                        type="text"
                        value={country}
                        onChange={(e) => setCountry(e.target.value)}
                        placeholder="USA"
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                      />
                    </div>
                  </div>
                </div>

                {/* Notes Section */}
                <div className="pt-4 border-t border-gray-200">
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Notes
                  </label>
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Additional information..."
                    rows={2}
                    disabled={loading || result !== null}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-50 disabled:text-gray-500 text-sm"
                    maxLength={200}
                  />
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
                    Scanning this QR code will prompt users to save the contact information
                    directly to their phone's contacts app. Perfect for networking events,
                    business cards, and trade shows!
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preview */}
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
                  {/* QR Code Image */}
                  <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 p-4 flex items-center justify-center">
                    <img
                      src={result.qr_image}
                      alt="vCard QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Success Message */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Your vCard QR code is ready
                      </p>
                    </div>
                  </div>

                  {/* Contact Card Preview */}
                  <div className="p-4 bg-gray-50 rounded-lg space-y-2 text-sm">
                    <div className="font-bold text-base text-black">
                      {firstName} {lastName}
                    </div>
                    {jobTitle && <div className="text-gray-600">{jobTitle}</div>}
                    {organization && <div className="text-gray-600">{organization}</div>}
                    {email && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <LucideIcons.Mail className="w-3 h-3" />
                        {email}
                      </div>
                    )}
                    {(phone || mobile) && (
                      <div className="flex items-center gap-2 text-gray-700">
                        <LucideIcons.Phone className="w-3 h-3" />
                        {phone || mobile}
                      </div>
                    )}
                    {website && (
                      <div className="flex items-center gap-2 text-gray-700 break-all">
                        <LucideIcons.Globe className="w-3 h-3 flex-shrink-0" />
                        {website}
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
