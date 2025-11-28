// MenuItemSearch.jsx
// Search and filter menu items from centralized database

import React, { useState } from 'react';
import { useMenuItems, useCategories } from '../useMenuItems';
import MenuItemCard from './MenuItemCard';

export default function MenuItemSearch({ 
  language = 'en', 
  onItemSelect,
  showAddButton = false 
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedSubcategory, setSelectedSubcategory] = useState('');

  const { categories } = useCategories();
  const { items, loading, error } = useMenuItems({
    category: selectedCategory,
    subcategory: selectedSubcategory,
    search: searchQuery,
    language,
    limit: 50
  });

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    setSelectedSubcategory(''); // Reset subcategory
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const subcategories = selectedCategory 
    ? [...new Set(items.filter(i => i.category === selectedCategory).map(i => i.subcategory))]
    : [];

  return (
    <div className="menu-search">
      <div className="search-header">
        <h2>Browse Menu Items</h2>
        <p>Select items from our centralized database</p>
      </div>

      {/* Search Bar */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search items..."
          value={searchQuery}
          onChange={handleSearch}
          className="search-input"
        />
      </div>

      {/* Filters */}
      <div className="filters">
        {/* Category Filter */}
        <div className="filter-group">
          <label>Category:</label>
          <select 
            value={selectedCategory}
            onChange={(e) => handleCategoryChange(e.target.value)}
            className="filter-select"
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat.category} value={cat.category}>
                {cat.category} ({cat.item_count})
              </option>
            ))}
          </select>
        </div>

        {/* Subcategory Filter */}
        {selectedCategory && subcategories.length > 0 && (
          <div className="filter-group">
            <label>Subcategory:</label>
            <select 
              value={selectedSubcategory}
              onChange={(e) => setSelectedSubcategory(e.target.value)}
              className="filter-select"
            >
              <option value="">All Subcategories</option>
              {subcategories.map(sub => (
                <option key={sub} value={sub}>{sub}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Results */}
      <div className="results">
        {loading && <div className="loading">Loading items...</div>}
        
        {error && (
          <div className="error">
            Error loading items: {error}
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="no-results">
            No items found. Try different filters.
          </div>
        )}

        {!loading && items.length > 0 && (
          <>
            <div className="results-count">
              Found {items.length} items
            </div>
            <div className="items-grid">
              {items.map(item => (
                <MenuItemCard
                  key={item.id}
                  item={item}
                  language={language}
                  onSelect={onItemSelect}
                  showAddButton={showAddButton}
                  onAddToMenu={(item, modifiers, price) => {
                    if (onItemSelect) {
                      onItemSelect(item, { modifiers, price });
                    }
                  }}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        .menu-search {
          padding: 20px;
        }
        .search-header {
          margin-bottom: 24px;
        }
        .search-header h2 {
          margin: 0 0 8px 0;
        }
        .search-header p {
          color: #666;
          margin: 0;
        }
        .search-bar {
          margin-bottom: 16px;
        }
        .search-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #ddd;
          border-radius: 8px;
          font-size: 16px;
        }
        .search-input:focus {
          outline: none;
          border-color: #2196F3;
        }
        .filters {
          display: flex;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .filter-group {
          flex: 1;
          min-width: 200px;
        }
        .filter-group label {
          display: block;
          font-weight: 600;
          margin-bottom: 4px;
          font-size: 14px;
        }
        .filter-select {
          width: 100%;
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 14px;
        }
        .results {
          margin-top: 24px;
        }
        .results-count {
          font-weight: 600;
          margin-bottom: 16px;
          color: #666;
        }
        .items-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }
        .loading, .error, .no-results {
          padding: 40px;
          text-align: center;
          color: #666;
        }
        .error {
          color: #f44336;
        }
      `}</style>
    </div>
  );
}
