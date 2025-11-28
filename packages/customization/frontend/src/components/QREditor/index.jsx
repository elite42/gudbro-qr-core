import React, { useState } from 'react';
import ColorPicker from './ColorPicker';
import PatternSelector from './PatternSelector';
import EyeStyleSelector from './EyeStyleSelector';
import LogoUploader from './LogoUploader';
import QRPreview from './QRPreview';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';

const defaultDesign = {
  foreground: '#000000',
  background: '#FFFFFF',
  pattern: 'squares',
  eyeStyle: 'square',
  errorCorrectionLevel: 'M',
  margin: 4,
  logo: null
};

export default function QREditor({ initialData = '', initialDesign = defaultDesign, onSave }) {
  const [data, setData] = useState(initialData);
  const [design, setDesign] = useState({ ...defaultDesign, ...initialDesign });

  const updateDesign = (key, value) => {
    setDesign(prev => ({ ...prev, [key]: value }));
  };

  const handleSaveTemplate = () => {
    if (!data) {
      toast.error('Please enter data for the QR code');
      return;
    }

    const templateName = prompt('Enter template name:');
    if (!templateName) return;

    if (onSave) {
      onSave({ name: templateName, design });
      toast.success('Template saved!');
    }
  };

  const handleReset = () => {
    if (confirm('Reset to default design?')) {
      setDesign(defaultDesign);
      toast.success('Design reset');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Left Panel: Editor Controls */}
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Customize QR Code</h2>

          {/* Data Input */}
          <div className="space-y-2 mb-6">
            <label className="block text-sm font-medium text-gray-700">
              QR Code Data *
            </label>
            <input
              type="text"
              value={data}
              onChange={(e) => setData(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
            />
            <p className="text-xs text-gray-500">
              Enter URL, text, or any data you want to encode
            </p>
          </div>

          {/* Color Section */}
          <div className="space-y-4 mb-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2">
              Colors
            </h3>
            
            <ColorPicker
              label="Foreground Color"
              color={design.foreground}
              onChange={(color) => updateDesign('foreground', color)}
              showContrast={true}
              otherColor={design.background}
            />

            <ColorPicker
              label="Background Color"
              color={design.background}
              onChange={(color) => updateDesign('background', color)}
              showContrast={true}
              otherColor={design.foreground}
            />
          </div>

          {/* Pattern Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
              Style
            </h3>
            <PatternSelector
              selected={design.pattern}
              onChange={(pattern) => updateDesign('pattern', pattern)}
            />
          </div>

          {/* Eye Style Section */}
          <div className="mb-6">
            <EyeStyleSelector
              selected={design.eyeStyle}
              onChange={(eyeStyle) => updateDesign('eyeStyle', eyeStyle)}
            />
          </div>

          {/* Logo Section */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
              Branding
            </h3>
            <LogoUploader
              logo={design.logo}
              onLogoChange={(logo) => updateDesign('logo', logo)}
              onLogoRemove={() => updateDesign('logo', null)}
            />
          </div>

          {/* Advanced Options */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 border-b pb-2 mb-4">
              Advanced
            </h3>
            
            <div className="space-y-4">
              {/* Error Correction Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Error Correction Level
                </label>
                <select
                  value={design.errorCorrectionLevel}
                  onChange={(e) => updateDesign('errorCorrectionLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500"
                >
                  <option value="L">Low (7%)</option>
                  <option value="M">Medium (15%) - Recommended</option>
                  <option value="Q">Quartile (25%)</option>
                  <option value="H">High (30%) - Best for logos</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Higher levels allow more damage tolerance but create denser codes
                </p>
              </div>

              {/* Margin */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Margin: {design.margin}
                </label>
                <input
                  type="range"
                  min="0"
                  max="10"
                  value={design.margin}
                  onChange={(e) => updateDesign('margin', parseInt(e.target.value))}
                  className="w-full"
                />
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleSaveTemplate}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
            >
              <FiSave />
              Save as Template
            </button>

            <button
              onClick={handleReset}
              className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Right Panel: Preview */}
      <div className="lg:sticky lg:top-8 h-fit">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <QRPreview data={data} design={design} />
        </div>
      </div>
    </div>
  );
}
