/**
 * GS1 Digital Link Template
 * Generates QR codes for product identification (supply chain, retail, logistics)
 * GS1 standard for barcodes and product tracking
 */

export const gs1Template = {
  type: 'gs1',
  name: 'GS1 Digital Link',
  icon: '📦',
  description: 'Product identification for supply chain (B2B/Enterprise)',
  
  fields: [
    {
      name: 'gtin',
      label: 'GTIN (Global Trade Item Number)',
      type: 'text',
      required: true,
      placeholder: '09506000134352',
      hint: '8, 12, 13, or 14 digit product identifier',
      maxLength: 14,
      validation: (value) => {
        // GTIN can be 8, 12, 13, or 14 digits
        return /^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(value);
      }
    },
    {
      name: 'domain',
      label: 'Domain',
      type: 'text',
      required: true,
      placeholder: 'id.gs1.org',
      hint: 'GS1 resolver domain (typically id.gs1.org)',
      value: 'id.gs1.org'
    },
    {
      name: 'lot',
      label: 'Lot Number (optional)',
      type: 'text',
      required: false,
      placeholder: 'LOT123',
      maxLength: 20
    },
    {
      name: 'serialNumber',
      label: 'Serial Number (optional)',
      type: 'text',
      required: false,
      placeholder: 'SN123456',
      maxLength: 20
    },
    {
      name: 'expiryDate',
      label: 'Expiry Date (optional)',
      type: 'text',
      required: false,
      placeholder: 'YYMMDD (e.g., 251231)',
      maxLength: 6,
      hint: 'Format: YYMMDD'
    }
  ],

  generate: (data) => {
    const { gtin, domain, lot, serialNumber, expiryDate } = data;
    
    if (!gtin) {
      throw new Error('GTIN is required');
    }

    // Validate GTIN format
    if (!/^\d{8}$|^\d{12}$|^\d{13}$|^\d{14}$/.test(gtin)) {
      throw new Error('GTIN must be 8, 12, 13, or 14 digits');
    }

    // GS1 Digital Link format: https://id.gs1.org/01/GTIN
    let gs1Url = `https://${domain || 'id.gs1.org'}/01/${gtin}`;

    const params = [];
    
    if (lot) {
      params.push(`10=${encodeURIComponent(lot)}`);
    }
    
    if (serialNumber) {
      params.push(`21=${encodeURIComponent(serialNumber)}`);
    }
    
    if (expiryDate) {
      params.push(`17=${expiryDate}`);
    }

    if (params.length > 0) {
      gs1Url += '?' + params.join('&');
    }

    return gs1Url;
  },

  example: {
    gtin: '09506000134352',
    domain: 'id.gs1.org',
    lot: 'LOT2025A',
    serialNumber: 'SN123456789',
    expiryDate: '251231'
  },

  note: 'GS1 Digital Link is an enterprise-grade standard for product identification. Requires GS1 company prefix and product registration.'
};

