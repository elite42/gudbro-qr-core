/**
 * Restaurant Menu Template
 * Generates QR codes for restaurant menus
 */

export const menuTemplate = {
  type: 'menu',
  name: 'Restaurant Menu',
  icon: '🍽️',
  description: 'Digital menu for restaurants and cafes',
  
  fields: [
    {
      name: 'menuUrl',
      label: 'Menu URL',
      type: 'text',
      required: true,
      placeholder: 'https://example.com/menu.pdf',
      hint: 'URL to your menu (PDF, image, or webpage)',
      validation: (value) => {
        try {
          const url = new URL(value);
          return url.protocol === 'http:' || url.protocol === 'https:';
        } catch {
          return false;
        }
      }
    },
    {
      name: 'restaurantName',
      label: 'Restaurant Name (optional)',
      type: 'text',
      required: false,
      placeholder: 'Ristorante Bella Vista',
      maxLength: 100
    },
    {
      name: 'menuType',
      label: 'Menu Type (optional)',
      type: 'select',
      required: false,
      options: [
        { value: 'full', label: 'Full Menu' },
        { value: 'lunch', label: 'Lunch Menu' },
        { value: 'dinner', label: 'Dinner Menu' },
        { value: 'drinks', label: 'Drinks Menu' },
        { value: 'desserts', label: 'Desserts Menu' }
      ]
    }
  ],

  generate: (data) => {
    const { menuUrl } = data;
    
    if (!menuUrl) {
      throw new Error('Menu URL is required');
    }

    // Validate URL
    try {
      new URL(menuUrl);
    } catch {
      throw new Error('Invalid URL');
    }

    return menuUrl;
  },

  example: {
    menuUrl: 'https://example.com/menu.pdf',
    restaurantName: 'Trattoria Roma',
    menuType: 'full'
  }
};

