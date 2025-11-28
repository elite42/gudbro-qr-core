// MenuItemCard.jsx
// Displays menu item with photo, translations, and modifiers

import React, { useState } from 'react';
import { useCurrency } from '../../module-10-i18n/frontend/useCurrency';

export default function MenuItemCard({ 
  item, 
  language = 'en',
  onAddToMenu,
  showAddButton = false,
  onSelect
}) {
  const [selectedModifiers, setSelectedModifiers] = useState([]);
  const { format, convert, currency } = useCurrency();

  // Get translated name and description
  const name = item.name_translations?.[language] || item.name_translations?.en || 'N/A';
  const description = item.description_translations?.[language] || 
                      item.description_translations?.en || '';

  // Calculate total price with modifiers
  const basePrice = item.custom_price_vnd || item.base_price_vnd || item.final_price_vnd || 0;
  const modifierPrice = selectedModifiers.reduce((sum, mod) => sum + (mod.price_modifier || 0), 0);
  const totalPrice = basePrice + modifierPrice;

  // Convert and format price
  const displayPrice = format(convert(totalPrice, currency), currency);

  // Group modifiers by type
  const modifiersByType = (item.modifiers || []).reduce((acc, mod) => {
    if (!acc[mod.modifier_type]) {
      acc[mod.modifier_type] = [];
    }
    acc[mod.modifier_type].push(mod);
    return acc;
  }, {});

  const handleModifierChange = (modifierType, modifier) => {
    setSelectedModifiers(prev => {
      // Remove any existing modifier of this type
      const filtered = prev.filter(m => m.modifier_type !== modifierType);
      // Add new modifier
      return [...filtered, modifier];
    });
  };

  const handleAddToMenu = () => {
    if (onAddToMenu) {
      onAddToMenu(item, selectedModifiers, totalPrice);
    }
  };

  const renderAllergens = () => {
    if (!item.allergens || item.allergens.length === 0) return null;

    return (
      <div className="allergens">
        <span className="label">⚠️ Contains:</span>
        <span className="values">{item.allergens.join(', ')}</span>
      </div>
    );
  };

  const renderDietaryFlags = () => {
    if (!item.dietary_flags || item.dietary_flags.length === 0) return null;

    const flagEmojis = {
      vegan: '🌱',
      vegetarian: '🥕',
      halal: '☪️',
      kosher: '✡️',
      'gluten-free': '🌾',
      'dairy-free': '🥛'
    };

    return (
      <div className="dietary-flags">
        {item.dietary_flags.map(flag => (
          <span key={flag} className="badge" title={flag}>
            {flagEmojis[flag] || '✓'} {flag}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div 
      className="menu-item-card"
      onClick={() => onSelect && onSelect(item)}
      style={{ cursor: onSelect ? 'pointer' : 'default' }}
    >
      {item.photo_url && (
        <div className="item-photo">
          <img src={item.photo_url} alt={name} />
        </div>
      )}
      
      <div className="item-content">
        <div className="item-header">
          <h3 className="item-name">{name}</h3>
          <span className="item-price">{displayPrice}</span>
        </div>

        {description && (
          <p className="item-description">{description}</p>
        )}

        {item.category && (
          <div className="item-meta">
            <span className="category">{item.category}</span>
            {item.subcategory && (
              <span className="subcategory">{item.subcategory}</span>
            )}
          </div>
        )}

        {renderDietaryFlags()}
        {renderAllergens()}

        {/* Modifiers */}
        {Object.keys(modifiersByType).length > 0 && (
          <div className="modifiers">
            {Object.entries(modifiersByType).map(([type, mods]) => (
              <div key={type} className="modifier-group">
                <label className="modifier-label">{type}:</label>
                <div className="modifier-options">
                  {mods.map(mod => {
                    const modName = mod.name_translations?.[language] || 
                                   mod.name_translations?.en || 
                                   mod.modifier_value;
                    const modPrice = mod.price_modifier || 0;
                    const priceText = modPrice > 0 ? `+${format(convert(modPrice, currency), currency)}` :
                                     modPrice < 0 ? format(convert(modPrice, currency), currency) : '';

                    return (
                      <button
                        key={mod.id}
                        className={`modifier-btn ${mod.is_default ? 'default' : ''}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleModifierChange(type, mod);
                        }}
                      >
                        {modName} {priceText}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {showAddButton && (
          <button 
            className="add-to-menu-btn"
            onClick={(e) => {
              e.stopPropagation();
              handleAddToMenu();
            }}
          >
            + Add to Menu
          </button>
        )}

        {!item.is_available && (
          <div className="unavailable-badge">Currently Unavailable</div>
        )}
      </div>

      <style jsx>{`
        .menu-item-card {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          overflow: hidden;
          background: white;
          transition: box-shadow 0.2s;
        }
        .menu-item-card:hover {
          box-shadow: 0 2px 8px rgba(0,0,0,0.1);
        }
        .item-photo img {
          width: 100%;
          height: 200px;
          object-fit: cover;
        }
        .item-content {
          padding: 16px;
        }
        .item-header {
          display: flex;
          justify-content: space-between;
          align-items: start;
          margin-bottom: 8px;
        }
        .item-name {
          font-size: 18px;
          font-weight: 600;
          margin: 0;
        }
        .item-price {
          font-size: 16px;
          font-weight: 600;
          color: #2196F3;
        }
        .item-description {
          color: #666;
          font-size: 14px;
          margin: 8px 0;
        }
        .item-meta {
          display: flex;
          gap: 8px;
          margin: 8px 0;
          font-size: 12px;
        }
        .category, .subcategory {
          padding: 4px 8px;
          background: #f5f5f5;
          border-radius: 4px;
        }
        .dietary-flags {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
          margin: 8px 0;
        }
        .badge {
          padding: 2px 8px;
          background: #e8f5e9;
          border-radius: 12px;
          font-size: 11px;
        }
        .allergens {
          padding: 8px;
          background: #fff3e0;
          border-radius: 4px;
          font-size: 12px;
          margin: 8px 0;
        }
        .allergens .label {
          font-weight: 600;
          margin-right: 4px;
        }
        .modifiers {
          margin-top: 12px;
        }
        .modifier-group {
          margin-bottom: 8px;
        }
        .modifier-label {
          font-size: 12px;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
          text-transform: capitalize;
        }
        .modifier-options {
          display: flex;
          gap: 4px;
          flex-wrap: wrap;
        }
        .modifier-btn {
          padding: 4px 12px;
          border: 1px solid #ddd;
          border-radius: 16px;
          background: white;
          cursor: pointer;
          font-size: 12px;
        }
        .modifier-btn:hover {
          background: #f5f5f5;
        }
        .modifier-btn.default {
          border-color: #2196F3;
          color: #2196F3;
        }
        .add-to-menu-btn {
          width: 100%;
          padding: 10px;
          background: #2196F3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 12px;
          font-weight: 600;
        }
        .add-to-menu-btn:hover {
          background: #1976D2;
        }
        .unavailable-badge {
          background: #f44336;
          color: white;
          padding: 4px 8px;
          border-radius: 4px;
          text-align: center;
          font-size: 12px;
          margin-top: 8px;
        }
      `}</style>
    </div>
  );
}
