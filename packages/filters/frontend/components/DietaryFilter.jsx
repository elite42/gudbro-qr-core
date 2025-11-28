// DietaryFilter.jsx
// Filter menu items by dietary preferences

import React from 'react';
import { DIETARY_PREFERENCES } from '../../backend/utils/healthFilters';

export default function DietaryFilter({ 
  selectedDietary = [], 
  onChange,
  language = 'en',
  layout = 'grid' // 'grid' or 'compact'
}) {
  const handleToggle = (dietaryId) => {
    const newSelection = selectedDietary.includes(dietaryId)
      ? selectedDietary.filter(id => id !== dietaryId)
      : [...selectedDietary, dietaryId];
    
    onChange(newSelection);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const isSelected = (dietaryId) => selectedDietary.includes(dietaryId);

  return (
    <div className="dietary-filter">
      <div className="filter-header">
        <h3>✨ Dietary Preferences</h3>
        {selectedDietary.length > 0 && (
          <button onClick={handleClearAll} className="clear-btn">
            Clear ({selectedDietary.length})
          </button>
        )}
      </div>

      <div className={`dietary-list ${layout}`}>
        {DIETARY_PREFERENCES.map(dietary => (
          <button
            key={dietary.id}
            className={`dietary-btn ${isSelected(dietary.id) ? 'selected' : ''}`}
            onClick={() => handleToggle(dietary.id)}
            aria-pressed={isSelected(dietary.id)}
            style={{
              '--dietary-color': dietary.color
            }}
          >
            <span className="icon">{dietary.icon}</span>
            <span className="label">{dietary.label[language]}</span>
            {isSelected(dietary.id) && <span className="check">✓</span>}
          </button>
        ))}
      </div>

      {selectedDietary.length > 0 && (
        <div className="active-filters">
          <strong>Showing only:</strong> {selectedDietary.map(id => {
            const dietary = DIETARY_PREFERENCES.find(d => d.id === id);
            return dietary ? `${dietary.icon} ${dietary.label[language]}` : id;
          }).join(', ')}
        </div>
      )}

      <style jsx>{`
        .dietary-filter {
          padding: 16px;
          background: #fff;
          border-radius: 8px;
          border: 1px solid #e0e0e0;
        }
        .filter-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .filter-header h3 {
          margin: 0;
          font-size: 16px;
          font-weight: 600;
        }
        .clear-btn {
          padding: 4px 12px;
          background: #f5f5f5;
          border: 1px solid #ddd;
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
        }
        .clear-btn:hover {
          background: #e0e0e0;
        }
        .dietary-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .dietary-list.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
        .dietary-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 8px 12px;
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 6px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 13px;
        }
        .dietary-btn:hover {
          border-color: var(--dietary-color);
          background: color-mix(in srgb, var(--dietary-color) 10%, white);
        }
        .dietary-btn.selected {
          border-color: var(--dietary-color);
          background: color-mix(in srgb, var(--dietary-color) 15%, white);
          font-weight: 600;
        }
        .dietary-btn .icon {
          font-size: 18px;
        }
        .dietary-btn .check {
          margin-left: auto;
          color: var(--dietary-color);
          font-weight: bold;
        }
        .active-filters {
          margin-top: 12px;
          padding: 8px 12px;
          background: #e8f5e9;
          border-radius: 4px;
          font-size: 12px;
          border-left: 3px solid #4caf50;
        }
        .active-filters strong {
          display: block;
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
