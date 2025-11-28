'use client';

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, FeedbackFormQRData, QRResponse } from '@/lib/api/qr';

interface Question {
  id: string;
  type: 'text' | 'rating' | 'choice' | 'yesno';
  question: string;
  required?: boolean;
  options?: string[];
}

export default function CreateFeedbackFormQRPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [result, setResult] = useState<QRResponse | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [submitUrl, setSubmitUrl] = useState('');
  const [questions, setQuestions] = useState<Question[]>([
    { id: '1', type: 'rating', question: '', required: true },
  ]);

  const addQuestion = () => {
    const newId = (Math.max(...questions.map(q => parseInt(q.id))) + 1).toString();
    setQuestions([...questions, { id: newId, type: 'text', question: '', required: false }]);
  };

  const removeQuestion = (id: string) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  const updateQuestion = (id: string, field: keyof Question, value: any) => {
    setQuestions(questions.map(q =>
      q.id === id ? { ...q, [field]: value } : q
    ));
  };

  const addOption = (questionId: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId) {
        return { ...q, options: [...(q.options || []), ''] };
      }
      return q;
    }));
  };

  const updateOption = (questionId: string, optionIndex: number, value: string) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        const newOptions = [...q.options];
        newOptions[optionIndex] = value;
        return { ...q, options: newOptions };
      }
      return q;
    }));
  };

  const removeOption = (questionId: string, optionIndex: number) => {
    setQuestions(questions.map(q => {
      if (q.id === questionId && q.options) {
        return { ...q, options: q.options.filter((_, i) => i !== optionIndex) };
      }
      return q;
    }));
  };

  const validateForm = (): string | null => {
    if (!title.trim()) {
      return 'Form title is required';
    }

    if (questions.length === 0) {
      return 'At least one question is required';
    }

    for (const q of questions) {
      if (!q.question.trim()) {
        return 'All questions must have text';
      }
      if (q.type === 'choice' && (!q.options || q.options.length < 2)) {
        return 'Choice questions must have at least 2 options';
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
      const data: FeedbackFormQRData = {
        title: title.trim(),
        description: description.trim() || undefined,
        questions: questions.map(q => ({
          id: q.id,
          type: q.type,
          question: q.question.trim(),
          required: q.required,
          options: q.type === 'choice' ? q.options?.filter(o => o.trim()) : undefined,
        })),
        submit_url: submitUrl.trim() || undefined,
      };

      const qrResult = await qrApi.createFeedbackForm(data);
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
      setDescription('');
      setSubmitUrl('');
      setQuestions([{ id: '1', type: 'rating', question: '', required: true }]);
    }, 0);
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `feedback-form-qr-${result.id}.png`;
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
                <h1 className="text-2xl font-bold text-black">Feedback Form QR Code</h1>
                <p className="text-sm text-gray-600">
                  Create a customer survey or feedback form
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 bg-teal-50 rounded-lg border border-teal-200">
              <LucideIcons.MessageSquareText className="w-5 h-5 text-teal-600" />
              <span className="text-sm font-medium text-teal-700">Standard</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-black">Form Configuration</h2>

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
                    Form Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Customer Satisfaction Survey"
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
                    placeholder="We value your feedback..."
                    rows={2}
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black resize-none disabled:bg-gray-50 disabled:text-gray-500"
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2 text-gray-700">
                    Submit URL (Optional)
                  </label>
                  <input
                    type="url"
                    value={submitUrl}
                    onChange={(e) => setSubmitUrl(e.target.value)}
                    placeholder="https://example.com/api/feedback"
                    disabled={loading || result !== null}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-50 disabled:text-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Webhook endpoint to receive form submissions
                  </p>
                </div>

                <div className="space-y-3 pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <label className="block text-sm font-medium text-gray-700">
                      Questions <span className="text-red-500">*</span>
                    </label>
                    <button
                      type="button"
                      onClick={addQuestion}
                      disabled={loading || result !== null || questions.length >= 10}
                      className="px-3 py-1.5 bg-black text-white text-sm rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-1"
                    >
                      <LucideIcons.Plus className="w-4 h-4" />
                      Add Question
                    </button>
                  </div>

                  {questions.map((question, index) => (
                    <div key={question.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">Question {index + 1}</span>
                        {questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(question.id)}
                            disabled={loading || result !== null}
                            className="text-red-600 hover:text-red-700 disabled:opacity-50"
                          >
                            <LucideIcons.Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <select
                        value={question.type}
                        onChange={(e) => updateQuestion(question.id, 'type', e.target.value as Question['type'])}
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                      >
                        <option value="text">Text Input</option>
                        <option value="rating">Rating (1-5 stars)</option>
                        <option value="choice">Multiple Choice</option>
                        <option value="yesno">Yes/No</option>
                      </select>

                      <input
                        type="text"
                        value={question.question}
                        onChange={(e) => updateQuestion(question.id, 'question', e.target.value)}
                        placeholder="Enter your question here..."
                        disabled={loading || result !== null}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 disabled:text-gray-500 text-sm"
                        maxLength={200}
                      />

                      {question.type === 'choice' && (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-gray-600">Options</span>
                            <button
                              type="button"
                              onClick={() => addOption(question.id)}
                              disabled={loading || result !== null || (question.options?.length || 0) >= 5}
                              className="text-xs px-2 py-1 bg-gray-700 text-white rounded hover:bg-gray-800 disabled:opacity-50"
                            >
                              + Option
                            </button>
                          </div>
                          {question.options?.map((option, optIdx) => (
                            <div key={optIdx} className="flex gap-2">
                              <input
                                type="text"
                                value={option}
                                onChange={(e) => updateOption(question.id, optIdx, e.target.value)}
                                placeholder={`Option ${optIdx + 1}`}
                                disabled={loading || result !== null}
                                className="flex-1 px-3 py-1.5 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black disabled:bg-gray-100 text-xs"
                              />
                              {(question.options?.length || 0) > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(question.id, optIdx)}
                                  disabled={loading || result !== null}
                                  className="text-red-600 hover:text-red-700"
                                >
                                  <LucideIcons.X className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      )}

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={question.required || false}
                          onChange={(e) => updateQuestion(question.id, 'required', e.target.checked)}
                          disabled={loading || result !== null}
                          className="w-4 h-4 rounded border-gray-300 text-black focus:ring-black"
                        />
                        <span className="text-xs text-gray-600">Required question</span>
                      </label>
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
                    Customers scan this QR code to access your feedback form. Perfect for restaurants,
                    retail stores, events, and customer service!
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
                  <p className="text-xs mt-1 text-center px-4">Configure form and click Generate</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 p-4 flex items-center justify-center">
                    <img
                      src={result.qr_image}
                      alt="Feedback Form QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">
                        Your Feedback Form is ready
                      </p>
                    </div>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="font-medium text-black">{title}</div>
                    {description && <div className="text-gray-600">{description}</div>}
                    <div className="flex items-center gap-2 text-gray-700 pt-2">
                      <LucideIcons.List className="w-3 h-3" />
                      <span>{questions.length} question{questions.length !== 1 && 's'}</span>
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
