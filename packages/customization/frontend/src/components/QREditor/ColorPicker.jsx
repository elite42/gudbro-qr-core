import React, { useState } from 'react';
import { SketchPicker } from 'react-color';

export default function ColorPicker({ label, color, onChange, showContrast = false, otherColor = null }) {
  const [showPicker, setShowPicker] = useState(false);

  const handleColorChange = (newColor) => {
    onChange(newColor.hex);
  };

  // Calculate contrast if needed
  const getContrastRatio = () => {
    if (!showContrast || !otherColor) return null;
    
    // Simplified contrast calculation
    const luminance = (hex) => {
      const rgb = parseInt(hex.slice(1), 16);
      const r = (rgb >> 16) & 0xff;
      const g = (rgb >> 8) & 0xff;
      const b = (rgb >> 0) & 0xff;
      return (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    };

    const l1 = luminance(color);
    const l2 = luminance(otherColor);
    const ratio = (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
    
    return {
      ratio: ratio.toFixed(2),
      level: ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'Fail'
    };
  };

  const contrast = getContrastRatio();

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      
      <div className="flex items-center gap-3">
        {/* Color preview */}
        <button
          type="button"
          className="w-12 h-12 rounded-lg border-2 border-gray-300 shadow-sm hover:border-primary-500 transition-colors"
          style={{ backgroundColor: color }}
          onClick={() => setShowPicker(!showPicker)}
        />

        {/* Hex input */}
        <input
          type="text"
          value={color}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          placeholder="#000000"
          maxLength={7}
        />

        {/* Contrast indicator */}
        {contrast && (
          <div className={`px-3 py-1 rounded text-sm font-medium ${
            contrast.level === 'AAA' ? 'bg-green-100 text-green-800' :
            contrast.level === 'AA' ? 'bg-yellow-100 text-yellow-800' :
            'bg-red-100 text-red-800'
          }`}>
            {contrast.level} ({contrast.ratio}:1)
          </div>
        )}
      </div>

      {/* Color picker popup */}
      {showPicker && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowPicker(false)}
          />
          <div className="absolute z-20 mt-2">
            <SketchPicker
              color={color}
              onChange={handleColorChange}
              onChangeComplete={handleColorChange}
            />
          </div>
        </>
      )}
    </div>
  );
}
