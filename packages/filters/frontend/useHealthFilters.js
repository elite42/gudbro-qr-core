// useHealthFilters.js
// React hook for managing all 4 filter layers
// Layer 1: Allergens (30), Layer 2: Intolerances (10), Layer 3: Diets (6), Layer 4: Spice Level

import { useState, useMemo } from 'react';
import { filterItems, getFilterStats } from '../backend/utils/healthFilters';

export function useHealthFilters(items = []) {
  const [selectedAllergens, setSelectedAllergens] = useState([]);
  const [selectedIntolerances, setSelectedIntolerances] = useState([]);
  const [selectedDietary, setSelectedDietary] = useState([]);
  const [maxSpiceLevel, setMaxSpiceLevel] = useState(null);

  // Build filters object
  const filters = useMemo(() => ({
    selectedAllergens,
    selectedIntolerances,
    selectedDietary,
    maxSpiceLevel
  }), [selectedAllergens, selectedIntolerances, selectedDietary, maxSpiceLevel]);

  // Apply filters
  const filteredItems = useMemo(() => {
    return filterItems(items, filters);
  }, [items, filters]);

  // Statistics
  const stats = useMemo(() => {
    return getFilterStats(items, filters);
  }, [items, filters]);

  // Clear all filters
  const clearAll = () => {
    setSelectedAllergens([]);
    setSelectedIntolerances([]);
    setSelectedDietary([]);
    setMaxSpiceLevel(null);
  };

  // Check if filters are active
  const hasActiveFilters = 
    selectedAllergens.length > 0 || 
    selectedIntolerances.length > 0 ||
    selectedDietary.length > 0 ||
    maxSpiceLevel !== null;

  return {
    // Filter states
    selectedAllergens,
    selectedIntolerances,
    selectedDietary,
    maxSpiceLevel,
    setSelectedAllergens,
    setSelectedIntolerances,
    setSelectedDietary,
    setMaxSpiceLevel,
    
    // Filtered data
    filteredItems,
    stats,
    
    // Actions
    clearAll,
    hasActiveFilters
  };
}
