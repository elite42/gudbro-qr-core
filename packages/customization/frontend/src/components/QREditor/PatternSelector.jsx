import React from 'react';
import { FiSquare, FiCircle } from 'react-icons/fi';
import { BsSquareHalf } from 'react-icons/bs';

const patterns = [
  {
    id: 'squares',
    name: 'Squares',
    description: 'Classic square modules',
    icon: FiSquare
  },
  {
    id: 'dots',
    name: 'Dots',
    description: 'Circular dots pattern',
    icon: FiCircle
  },
  {
    id: 'rounded',
    name: 'Rounded',
    description: 'Rounded square modules',
    icon: BsSquareHalf
  }
];

export default function PatternSelector({ selected, onChange }) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        QR Pattern
      </label>

      <div className="grid grid-cols-3 gap-3">
        {patterns.map((pattern) => {
          const Icon = pattern.icon;
          const isSelected = selected === pattern.id;

          return (
            <button
              key={pattern.id}
              type="button"
              onClick={() => onChange(pattern.id)}
              className={`
                flex flex-col items-center gap-2 p-4 rounded-lg border-2 
                transition-all hover:border-primary-500
                ${isSelected 
                  ? 'border-primary-500 bg-primary-50 shadow-md' 
                  : 'border-gray-300 bg-white'
                }
              `}
            >
              <Icon 
                className={`w-8 h-8 ${isSelected ? 'text-primary-600' : 'text-gray-600'}`} 
              />
              <div className="text-center">
                <div className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-700'}`}>
                  {pattern.name}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {pattern.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
