// AllergenFilter.jsx
// Filter menu items by allergens

import React from 'react';
import { ALLERGENS } from '../../backend/utils/healthFilters';

export default function AllergenFilter({ 
  selectedAllergens = [], 
  onChange,
  language = 'en',
  layout = 'grid' // 'grid' or 'compact'
}) {
  const handleToggle = (allergenId) => {
    const newSelection = selectedAllergens.includes(allergenId)
      ? selectedAllergens.filter(id => id !== allergenId)
      : [...selectedAllergens, allergenId];
    
    onChange(newSelection);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const isSelected = (allergenId) => selectedAllergens.includes(allergenId);

  return (
    <div className="allergen-filter">
      <div className="filter-header">
        <h3>⚠️ Exclude Allergens</h3>
        {selectedAllergens.length > 0 && (
          <button onClick={handleClearAll} className="clear-btn">
            Clear ({selectedAllergens.length})
          </button>
        )}
      </div>

      <div className={`allergen-list ${layout}`}>
        {ALLERGENS.map(allergen => (
          <button
            key={allergen.id}
            className={`allergen-btn ${isSelected(allergen.id) ? 'selected' : ''}`}
            onClick={() => handleToggle(allergen.id)}
            aria-pressed={isSelected(allergen.id)}
          >
            <span className="icon">{allergen.icon}</span>
            <span className="label">{allergen.label[language]}</span>
            {isSelected(allergen.id) && <span className="check">✓</span>}
          </button>
        ))}
      </div>

      {selectedAllergens.length > 0 && (
        <div className="active-filters">
          <strong>Excluding:</strong> {selectedAllergens.map(id => {
            const allergen = ALLERGENS.find(a => a.id === id);
            return allergen ? `${allergen.icon} ${allergen.label[language]}` : id;
          }).join(', ')}
        </div>
      )}

      <style jsx>{`
        .allergen-filter {
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
        .allergen-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .allergen-list.grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
        }
        .allergen-btn {
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
        .allergen-btn:hover {
          border-color: #ff9800;
          background: #fff8f0;
        }
        .allergen-btn.selected {
          border-color: #ff5722;
          background: #ffebe6;
          font-weight: 600;
        }
        .allergen-btn .icon {
          font-size: 18px;
        }
        .allergen-btn .check {
          margin-left: auto;
          color: #ff5722;
          font-weight: bold;
        }
        .active-filters {
          margin-top: 12px;
          padding: 8px 12px;
          background: #fff3e0;
          border-radius: 4px;
          font-size: 12px;
          border-left: 3px solid #ff9800;
        }
        .active-filters strong {
          display: block;
          margin-bottom: 4px;
        }
      `}</style>
    </div>
  );
}
