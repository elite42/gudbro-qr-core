/**
 * Image Gallery Template
 * Generates QR codes for image galleries (multiple images)
 */

export const galleryTemplate = {
  type: 'gallery',
  name: 'Image Gallery',
  icon: '🖼️',
  description: 'Multiple images in one QR code',
  
  fields: [
    {
      name: 'galleryUrl',
      label: 'Gallery URL',
      type: 'text',
      required: true,
      placeholder: 'https://example.com/gallery',
      hint: 'URL to your image gallery page (Google Photos, Flickr, custom gallery)',
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
      label: 'Gallery Title (optional)',
      type: 'text',
      required: false,
      placeholder: 'My Photo Gallery',
      maxLength: 100
    },
    {
      name: 'description',
      label: 'Description (optional)',
      type: 'textarea',
      required: false,
      placeholder: 'Description of your gallery...',
      maxLength: 200
    }
  ],

  generate: (data) => {
    const { galleryUrl } = data;
    
    if (!galleryUrl) {
      throw new Error('Gallery URL is required');
    }

    // Validate URL
    try {
      new URL(galleryUrl);
    } catch {
      throw new Error('Invalid URL');
    }

    return galleryUrl;
  },

  example: {
    galleryUrl: 'https://photos.google.com/share/example',
    title: 'Product Catalog 2025',
    description: 'Browse our latest collection'
  }
};

