// ItemBadges.jsx
// Display allergen warnings and dietary badges for menu items

import React from 'react';
import { ALLERGENS, DIETARY_PREFERENCES } from '../../backend/utils/healthFilters';

export default function ItemBadges({ item, language = 'en', showAllergens = true, showDietary = true }) {
  const allergens = item.allergens || [];
  const dietaryFlags = item.dietary_flags || [];

  const renderAllergenBadges = () => {
    if (!showAllergens || allergens.length === 0) return null;

    return (
      <div className="allergen-badges">
        <span className="warning-label">⚠️ Contains:</span>
        {allergens.map(allergenId => {
          const allergen = ALLERGENS.find(a => a.id === allergenId);
          if (!allergen) return null;
          return (
            <span key={allergenId} className="allergen-badge" title={allergen.label[language]}>
              {allergen.icon} {allergen.label[language]}
            </span>
          );
        })}
      </div>
    );
  };

  const renderDietaryBadges = () => {
    if (!showDietary || dietaryFlags.length === 0) return null;

    return (
      <div className="dietary-badges">
        {dietaryFlags.map(dietaryId => {
          const dietary = DIETARY_PREFERENCES.find(d => d.id === dietaryId);
          if (!dietary) return null;
          return (
            <span 
              key={dietaryId} 
              className="dietary-badge" 
              style={{ backgroundColor: dietary.color }}
              title={dietary.label[language]}
            >
              {dietary.icon} {dietary.label[language]}
            </span>
          );
        })}
      </div>
    );
  };

  if (allergens.length === 0 && dietaryFlags.length === 0) {
    return null;
  }

  return (
    <div className="item-badges">
      {renderDietaryBadges()}
      {renderAllergenBadges()}

      <style jsx>{`
        .item-badges {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin: 8px 0;
        }
        .allergen-badges, .dietary-badges {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          align-items: center;
        }
        .warning-label {
          font-size: 11px;
          font-weight: 600;
          color: #ff5722;
        }
        .allergen-badge {
          padding: 2px 8px;
          background: #ffebe6;
          border: 1px solid #ff5722;
          border-radius: 12px;
          font-size: 11px;
          color: #d32f2f;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
        .dietary-badge {
          padding: 2px 8px;
          color: white;
          border-radius: 12px;
          font-size: 11px;
          font-weight: 500;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>
    </div>
  );
}
