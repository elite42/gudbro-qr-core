// useMenuItems Hook
// React hook for menu items with translation support

import { useState, useEffect, useCallback } from 'react';

export function useMenuItems(filters = {}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      
      if (filters.category) params.append('category', filters.category);
      if (filters.subcategory) params.append('subcategory', filters.subcategory);
      if (filters.language) params.append('language', filters.language);
      if (filters.search) params.append('search', filters.search);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);

      const response = await fetch(`/api/menu/items?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch items');
      }

      const data = await response.json();
      setItems(data.items);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching menu items:', err);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  return { items, loading, error, refetch: fetchItems };
}

export function useMenuItem(itemId, language = 'en') {
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!itemId) return;

    const fetchItem = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/menu/items/${itemId}?language=${language}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch item');
        }

        const data = await response.json();
        setItem(data);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching menu item:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchItem();
  }, [itemId, language]);

  return { item, loading, error };
}

export function useRestaurantMenu(restaurantId, language = 'en') {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchMenu = useCallback(async () => {
    if (!restaurantId) return;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/menu/restaurant/${restaurantId}/items?language=${language}`
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch restaurant menu');
      }

      const data = await response.json();
      setItems(data.items);
    } catch (err) {
      setError(err.message);
      console.error('Error fetching restaurant menu:', err);
    } finally {
      setLoading(false);
    }
  }, [restaurantId, language]);

  useEffect(() => {
    fetchMenu();
  }, [fetchMenu]);

  const addItem = async (sharedItemId, customizations = {}) => {
    try {
      const response = await fetch(`/api/menu/restaurant/${restaurantId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sharedItemId, ...customizations })
      });

      if (!response.ok) {
        throw new Error('Failed to add item');
      }

      await fetchMenu(); // Refresh menu
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const updateItem = async (restaurantItemId, updates) => {
    try {
      const response = await fetch(`/api/menu/restaurant/items/${restaurantItemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Failed to update item');
      }

      await fetchMenu(); // Refresh menu
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const removeItem = async (restaurantItemId) => {
    try {
      const response = await fetch(`/api/menu/restaurant/items/${restaurantItemId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove item');
      }

      await fetchMenu(); // Refresh menu
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  const toggleAvailability = async (restaurantItemId, isAvailable) => {
    try {
      const response = await fetch(
        `/api/menu/restaurant/items/${restaurantItemId}/availability`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ isAvailable })
        }
      );

      if (!response.ok) {
        throw new Error('Failed to toggle availability');
      }

      await fetchMenu(); // Refresh menu
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  return {
    items,
    loading,
    error,
    refetch: fetchMenu,
    addItem,
    updateItem,
    removeItem,
    toggleAvailability
  };
}

export function useCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await fetch('/api/menu/categories');
        if (!response.ok) throw new Error('Failed to fetch categories');
        const data = await response.json();
        setCategories(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
}
