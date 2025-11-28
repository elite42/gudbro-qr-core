import React from 'react';

const eyeStyles = [
  {
    id: 'square',
    name: 'Square',
    description: 'Classic square eyes',
    preview: (
      <svg viewBox="0 0 50 50" className="w-12 h-12">
        <rect x="5" y="5" width="40" height="40" fill="currentColor" />
        <rect x="15" y="15" width="20" height="20" fill="white" />
        <rect x="20" y="20" width="10" height="10" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'rounded',
    name: 'Rounded',
    description: 'Rounded corner eyes',
    preview: (
      <svg viewBox="0 0 50 50" className="w-12 h-12">
        <rect x="5" y="5" width="40" height="40" rx="8" fill="currentColor" />
        <rect x="15" y="15" width="20" height="20" rx="4" fill="white" />
        <rect x="20" y="20" width="10" height="10" rx="2" fill="currentColor" />
      </svg>
    )
  },
  {
    id: 'dot',
    name: 'Dot',
    description: 'Circular dot eyes',
    preview: (
      <svg viewBox="0 0 50 50" className="w-12 h-12">
        <circle cx="25" cy="25" r="20" fill="currentColor" />
        <circle cx="25" cy="25" r="12" fill="white" />
        <circle cx="25" cy="25" r="5" fill="currentColor" />
      </svg>
    )
  }
];

export default function EyeStyleSelector({ selected, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        Eye Style
      </label>

      <div className="grid grid-cols-3 gap-3">
        {eyeStyles.map((style) => {
          const isSelected = selected === style.id;

          return (
            <button
              key={style.id}
              type="button"
              onClick={() => onChange(style.id)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-lg border-2 
                transition-all hover:border-primary-500
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50 shadow-md' 
                  : 'border-gray-300 bg-white'
                }
              `}
            >
              <div className={isSelected ? 'text-primary-600' : 'text-gray-600'}>
                {style.preview}
              </div>
              <div className="text-center">
                <div className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                  {style.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {style.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
