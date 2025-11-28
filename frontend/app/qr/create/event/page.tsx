'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, EventQRData, QRResponse } from '@/lib/api/qr';

export default function CreateEventQRPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<QRResponse | null>(null);

  // Form fields
  const [title, setTitle] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endDate, setEndDate] = useState('');
  const [endTime, setEndTime] = useState('');
  const [allDay, setAllDay] = useState(false);

  // Form validation
  const validateForm = (): string | null => {
    if (!title.trim()) {
      return 'Event title is required';
    }

    if (!startDate) {
      return 'Start date is required';
    }

    if (!allDay && !startTime) {
      return 'Start time is required (or check "All-day event")';
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
      // Combine date and time into ISO 8601 format
      const startDateTime = allDay
        ? new Date(startDate).toISOString()
        : new Date(`${startDate}T${startTime}`).toISOString();

      const endDateTime = endDate
        ? allDay
          ? new Date(endDate).toISOString()
          : endTime
            ? new Date(`${endDate}T${endTime}`).toISOString()
            : new Date(`${endDate}T23:59`).toISOString()
        : undefined;

      const data: EventQRData = {
        title: title.trim(),
        location: location.trim() || undefined,
        description: description.trim() || undefined,
        start_date: startDateTime,
        end_date: endDateTime,
        all_day: allDay || undefined,
      };

      const qrResult = await qrApi.createEvent(data);
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
      setTitle('');
      setLocation('');
      setDescription('');
      setStartDate('');
      setStartTime('');
      setEndDate('');
      setEndTime('');
      setAllDay(false);
    }, 0);
  };

  // Download QR code
  const handleDownload = () => {
    if (!result) return;

    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `event-qr-${result.id}.png`;
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
                <h1 className="text-2xl font-bold text-black">Calendar Event QR Code</h1>
                <p className="text-sm text-gray-600">
                  Create a QR code for calendar event (iCalendar format)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 px-4 py-2 bg-orange-50 rounded-lg border border-orange-200">
              <LucideIcons.Calendar className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Essential</span>
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
              <h2 className="text-lg font-bold mb-4 text-black">Event Details</h2>

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
                {/* Event Title */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Event Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Team Meeting"
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                    maxLength={200}
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Location (Optional)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <LucideIcons.MapPin className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="123 Main St, New York"
                      disabled={loading || result !== null}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      maxLength={200}
                    />
                  </div>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Description (Optional)
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Event details and agenda..."
                    rows={3}
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    maxLength={500}
                  />
                </div>

                {/* All-day toggle */}
                <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                  <input
                    type="checkbox"
                    id="allDay"
                    checked={allDay}
                    onChange={(e) => setAllDay(e.target.checked)}
                    disabled={loading || result !== null}
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-black focus:ring-black disabled:opacity-50"
                  />
                  <div className="flex-1">
                    <label htmlFor="allDay" className="block text-sm font-medium text-gray-700 cursor-pointer">
                      All-day event
                    </label>
                    <p className="text-xs text-gray-500 mt-0.5">
                      No specific time, runs for the entire day
                    </p>
                  </div>
                </div>

                {/* Start Date & Time */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Start Date & Time <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      disabled={loading || result !== null}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {!allDay && (
                      <input
                        type="time"
                        value={startTime}
                        onChange={(e) => setStartTime(e.target.value)}
                        disabled={loading || result !== null}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    )}
                  </div>
                </div>

                {/* End Date & Time */}
                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    End Date & Time (Optional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      disabled={loading || result !== null}
                      className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                    />
                    {!allDay && (
                      <input
                        type="time"
                        value={endTime}
                        onChange={(e) => setEndTime(e.target.value)}
                        disabled={loading || result !== null}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                      />
                    )}
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
                    Scanning this QR code will prompt users to add the event to their calendar app
                    (Google Calendar, Apple Calendar, Outlook, etc.) in iCalendar (.ics) format.
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
                      alt="Event QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  {/* Success Message */}
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Your Event QR code is ready to use
                      </p>
                    </div>
                  </div>

                  {/* QR Details */}
                  <div className="space-y-3 text-sm">
                    <div className="flex items-start gap-2">
                      <LucideIcons.Calendar className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Event</p>
                        <p className="text-black font-medium">{title}</p>
                      </div>
                    </div>
                    {location && (
                      <div className="flex items-start gap-2">
                        <LucideIcons.MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs">Location</p>
                          <p className="text-black">{location}</p>
                        </div>
                      </div>
                    )}
                    <div className="flex items-start gap-2">
                      <LucideIcons.Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-gray-500 text-xs">Start</p>
                        <p className="text-black">
                          {new Date(startDate + (startTime ? `T${startTime}` : '')).toLocaleDateString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })}
                          {!allDay && startTime && (
                            <span className="text-gray-600"> at {startTime}</span>
                          )}
                        </p>
                      </div>
                    </div>
                    {endDate && (
                      <div className="flex items-start gap-2">
                        <LucideIcons.Clock className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                          <p className="text-gray-500 text-xs">End</p>
                          <p className="text-black">
                            {new Date(endDate + (endTime ? `T${endTime}` : '')).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })}
                            {!allDay && endTime && (
                              <span className="text-gray-600"> at {endTime}</span>
                            )}
                          </p>
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
