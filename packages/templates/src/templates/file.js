/**
 * File Template
 * Generates QR codes for any file type (PDF, images, videos, documents)
 */

export const fileTemplate = {
  type: 'file',
  name: 'File Upload',
  icon: '📁',
  description: 'Upload any file (PDF, image, video, document)',
  
  fields: [
    {
      name: 'fileUrl',
      label: 'File URL',
      type: 'text',
      required: true,
      placeholder: 'https://example.com/file.pdf',
      hint: 'Upload your file first, then paste the URL here. Supports: PDF, JPEG, PNG, MP4, Excel, Word, etc.',
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
      name: 'fileName',
      label: 'File Name (optional)',
      type: 'text',
      required: false,
      placeholder: 'document.pdf',
      maxLength: 100
    },
    {
      name: 'fileType',
      label: 'File Type',
      type: 'select',
      required: false,
      options: [
        { value: 'pdf', label: 'PDF Document' },
        { value: 'image', label: 'Image (JPEG, PNG, GIF)' },
        { value: 'video', label: 'Video (MP4, MOV)' },
        { value: 'document', label: 'Document (Word, Excel, PPT)' },
        { value: 'other', label: 'Other' }
      ]
    }
  ],

  generate: (data) => {
    const { fileUrl } = data;
    
    if (!fileUrl) {
      throw new Error('File URL is required');
    }

    // Validate URL
    try {
      new URL(fileUrl);
    } catch {
      throw new Error('Invalid URL');
    }

    return fileUrl;
  },

  example: {
    fileUrl: 'https://example.com/presentation.pptx',
    fileName: 'Product Presentation 2025',
    fileType: 'document'
  }
};

