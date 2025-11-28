/**
 * MECARD Template
 * Generates QR codes for lightweight business cards (MECARD format)
 * Simpler alternative to vCard with fewer fields
 */

export const mecardTemplate = {
  type: 'mecard',
  name: 'MECARD',
  icon: '👤',
  description: 'Lightweight business card (simpler than vCard)',
  
  fields: [
    {
      name: 'name',
      label: 'Full Name',
      type: 'text',
      required: true,
      placeholder: 'Mario Rossi',
      maxLength: 100
    },
    {
      name: 'phone',
      label: 'Phone Number',
      type: 'tel',
      required: false,
      placeholder: '+39 123 456 7890'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: false,
      placeholder: 'mario@example.com',
      validation: (value) => {
        if (!value) return true;
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      }
    },
    {
      name: 'url',
      label: 'Website (optional)',
      type: 'url',
      required: false,
      placeholder: 'https://example.com',
      validation: (value) => {
        if (!value) return true;
        try {
          new URL(value);
          return true;
        } catch {
          return false;
        }
      }
    },
    {
      name: 'address',
      label: 'Address (optional)',
      type: 'text',
      required: false,
      placeholder: 'Via Roma 123, Milano, Italia',
      maxLength: 200
    }
  ],

  generate: (data) => {
    const { name, phone, email, url, address } = data;
    
    if (!name) {
      throw new Error('Name is required');
    }

    // MECARD format: MECARD:N:Name;TEL:Phone;EMAIL:Email;URL:Website;ADR:Address;;
    let mecard = `MECARD:N:${name}`;
    
    if (phone) {
      // Remove spaces and special characters from phone
      const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
      mecard += `;TEL:${cleanPhone}`;
    }
    
    if (email) {
      mecard += `;EMAIL:${email}`;
    }
    
    if (url) {
      mecard += `;URL:${url}`;
    }
    
    if (address) {
      mecard += `;ADR:${address}`;
    }
    
    mecard += ';;';

    return mecard;
  },

  example: {
    name: 'Mario Rossi',
    phone: '+39 123 456 7890',
    email: 'mario.rossi@example.com',
    url: 'https://mariorossi.com',
    address: 'Via Roma 123, 20100 Milano, Italia'
  }
};

