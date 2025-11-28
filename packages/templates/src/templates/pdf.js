/**
 * PDF Template
 * Generates QR codes for PDF file uploads
 */

export const pdfTemplate = {
  type: 'pdf',
  name: 'PDF Document',
  icon: '📄',
  description: 'Upload PDF and generate QR code',
  
  fields: [
    {
      name: 'fileUrl',
      label: 'PDF URL',
      type: 'text',
      required: true,
      placeholder: 'https://example.com/document.pdf',
      hint: 'Upload your PDF file first, then paste the URL here',
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
      name: 'title',
      label: 'Document Title (optional)',
      type: 'text',
      required: false,
      placeholder: 'My Document',
      maxLength: 100
    }
  ],

  generate: (data) => {
    const { fileUrl } = data;
    
    if (!fileUrl) {
      throw new Error('PDF URL is required');
    }

    // Validate URL
    try {
      new URL(fileUrl);
    } catch {
      throw new Error('Invalid URL');
    }

    // Return the PDF URL directly
    return fileUrl;
  },

  example: {
    fileUrl: 'https://example.com/brochure.pdf',
    title: 'Product Brochure 2025'
  }
};

