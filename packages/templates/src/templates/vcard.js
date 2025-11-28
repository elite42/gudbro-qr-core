/**
 * vCard Template
 * Generates QR codes for business cards (vCard 3.0 format)
 */

export const vcardTemplate = {
  type: 'vcard',
  name: 'vCard',
  icon: '👤',
  description: 'Digital business card (standard vCard format)',
  
  fields: [
    {
      name: 'firstName',
      label: 'First Name',
      type: 'text',
      required: true,
      placeholder: 'Mario'
    },
    {
      name: 'lastName',
      label: 'Last Name',
      type: 'text',
      required: true,
      placeholder: 'Rossi'
    },
    {
      name: 'organization',
      label: 'Organization',
      type: 'text',
      required: false,
      placeholder: 'GUDBRO Inc.'
    },
    {
      name: 'title',
      label: 'Job Title',
      type: 'text',
      required: false,
      placeholder: 'CEO'
    },
    {
      name: 'phone',
      label: 'Phone',
      type: 'tel',
      required: false,
      placeholder: '+39 123 456 7890'
    },
    {
      name: 'email',
      label: 'Email',
      type: 'email',
      required: false,
      placeholder: 'mario@gudbro.com'
    },
    {
      name: 'website',
      label: 'Website',
      type: 'text',
      required: false,
      placeholder: 'https://gudbro.com'
    },
    {
      name: 'address',
      label: 'Address',
      type: 'text',
      required: false,
      placeholder: 'Via Roma 1, Milano, Italy'
    }
  ],

  generate: (data) => {
    const { firstName, lastName, organization, title, phone, email, website, address } = data;
    
    if (!firstName || !lastName) {
      throw new Error('First name and last name are required');
    }

    // Build vCard 3.0 format
    let vcard = 'BEGIN:VCARD\n';
    vcard += 'VERSION:3.0\n';
    vcard += `N:${lastName};${firstName};;;\n`;
    vcard += `FN:${firstName} ${lastName}\n`;
    
    if (organization) {
      vcard += `ORG:${organization}\n`;
    }
    
    if (title) {
      vcard += `TITLE:${title}\n`;
    }
    
    if (phone) {
      vcard += `TEL;TYPE=WORK,VOICE:${phone}\n`;
    }
    
    if (email) {
      vcard += `EMAIL;TYPE=INTERNET,WORK:${email}\n`;
    }
    
    if (website) {
      vcard += `URL:${website}\n`;
    }
    
    if (address) {
      vcard += `ADR;TYPE=WORK:;;${address};;;;\n`;
    }
    
    vcard += 'END:VCARD';
    
    return vcard;
  },

  example: {
    firstName: 'Mario',
    lastName: 'Rossi',
    organization: 'GUDBRO Inc.',
    title: 'CEO',
    phone: '+39 123 456 7890',
    email: 'mario@gudbro.com',
    website: 'https://gudbro.com',
    address: 'Via Roma 1, Milano, Italy'
  }
};

