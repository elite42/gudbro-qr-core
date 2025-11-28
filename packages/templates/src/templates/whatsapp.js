/**
 * WhatsApp Template
 * Generates wa.me QR codes for WhatsApp chat
 */

export const whatsappTemplate = {
  type: 'whatsapp',
  name: 'WhatsApp',
  icon: '💬',
  description: 'Start a WhatsApp chat with pre-filled message',
  
  fields: [
    {
      name: 'phone',
      label: 'Phone Number (with country code)',
      type: 'tel',
      required: true,
      placeholder: '+39 123 456 7890',
      hint: 'Include country code without + or 00',
      validation: (value) => {
        const cleaned = value.replace(/[^\d]/g, '');
        return cleaned.length >= 10;
      }
    },
    {
      name: 'message',
      label: 'Pre-filled Message',
      type: 'textarea',
      required: false,
      placeholder: 'Hi! I scanned your QR code...',
      maxLength: 500
    }
  ],

  generate: (data) => {
    const { phone, message } = data;
    
    if (!phone) {
      throw new Error('Phone number is required');
    }

    // Clean phone number (remove all non-digits)
    const cleanedPhone = phone.replace(/[^\d]/g, '');

    let whatsappUrl = `https://wa.me/${cleanedPhone}`;

    if (message) {
      whatsappUrl += `?text=${encodeURIComponent(message)}`;
    }

    return whatsappUrl;
  },

  example: {
    phone: '+39 123 456 7890',
    message: 'Ciao! Ho scansionato il tuo QR code e vorrei maggiori informazioni.'
  }
};

