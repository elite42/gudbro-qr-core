import React, { useState, useEffect } from 'react';
import { FiDownload, FiRefreshCw } from 'react-icons/fi';
import { generatePreview, downloadQR } from '../../utils/api';
import toast from 'react-hot-toast';

export default function QRPreview({ data, design }) {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    if (!data) return;

    const generatePreviewDebounced = setTimeout(async () => {
      setIsLoading(true);
      try {
        const preview = await generatePreview(data, design);
        setPreviewUrl(preview);
      } catch (error) {
        console.error('Preview error:', error);
        toast.error('Failed to generate preview');
      } finally {
        setIsLoading(false);
      }
    }, 500); // Debounce 500ms

    return () => clearTimeout(generatePreviewDebounced);
  }, [data, design]);

  const handleDownload = async (format) => {
    setIsDownloading(true);
    try {
      await downloadQR(data, design, format);
      toast.success(`Downloaded as ${format.toUpperCase()}`);
    } catch (error) {
      console.error('Download error:', error);
      toast.error('Failed to download QR code');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-medium text-gray-700">
          Live Preview
        </label>
        {isLoading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <FiRefreshCw className="w-4 h-4 animate-spin" />
            Updating...
          </div>
        )}
      </div>

      {/* Preview container */}
      <div className="bg-white border-2 border-gray-300 rounded-lg p-8 flex items-center justify-center min-h-[400px]">
        {previewUrl ? (
          <img
            src={previewUrl}
            alt="QR Code Preview"
            className={`max-w-full h-auto ${isLoading ? 'opacity-50' : ''}`}
          />
        ) : (
          <div className="text-center text-gray-400">
            <div className="w-64 h-64 border-4 border-dashed border-gray-300 rounded-lg flex items-center justify-center mb-4">
              <span className="text-6xl">QR</span>
            </div>
            <p className="text-sm">Enter data to generate preview</p>
          </div>
        )}
      </div>

      {/* Download buttons */}
      {previewUrl && (
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Download High Resolution
          </label>
          
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleDownload('png')}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <FiDownload />
              PNG
            </button>

            <button
              onClick={() => handleDownload('svg')}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <FiDownload />
              SVG
            </button>

            <button
              onClick={() => handleDownload('pdf')}
              disabled={isDownloading}
              className="flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              <FiDownload />
              PDF
            </button>
          </div>

          <p className="text-xs text-gray-500">
            High resolution downloads are 1000x1000px (PNG) or vector (SVG/PDF)
          </p>
        </div>
      )}

      {/* QR Info */}
      {previewUrl && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Error Correction:</span>
            <span className="font-medium">{design.errorCorrectionLevel || 'M'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Pattern:</span>
            <span className="font-medium capitalize">{design.pattern || 'squares'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Eye Style:</span>
            <span className="font-medium capitalize">{design.eyeStyle || 'square'}</span>
          </div>
          {design.logo && (
            <div className="flex justify-between">
              <span className="text-gray-600">Logo:</span>
              <span className="font-medium text-green-600">✓ Included</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
