// Zapier Action - Create QR Code

module.exports = {
  key: 'create_qr',
  noun: 'QR Code',
  
  display: {
    label: 'Create QR Code',
    description: 'Creates a new QR code.',
    important: true
  },
  
  operation: {
    // Input fields
    inputFields: [
      {
        key: 'destination_url',
        label: 'Destination URL',
        helpText: 'The URL where the QR code will redirect',
        required: true,
        type: 'string',
        placeholder: 'https://example.com'
      },
      {
        key: 'title',
        label: 'Title',
        helpText: 'A name for your QR code',
        required: false,
        type: 'string'
      },
      {
        key: 'type',
        label: 'QR Type',
        helpText: 'Dynamic QR codes can be edited after creation',
        required: false,
        type: 'string',
        choices: {
          static: 'Static',
          dynamic: 'Dynamic'
        },
        default: 'dynamic'
      },
      {
        key: 'folder',
        label: 'Folder',
        helpText: 'Organize your QR code in a folder',
        required: false,
        type: 'string'
      }
    ],
    
    // Perform the action
    perform: async (z, bundle) => {
      const response = await z.request({
        url: 'https://api.qrplatform.com/v1/api/qr',
        method: 'POST',
        body: {
          destination_url: bundle.inputData.destination_url,
          title: bundle.inputData.title,
          type: bundle.inputData.type || 'dynamic',
          folder: bundle.inputData.folder
        }
      });
      
      return response.data;
    },
    
    // Sample output
    sample: {
      id: 'qr_new123',
      short_code: 'new123',
      short_url: 'https://qr.me/new123',
      destination_url: 'https://example.com',
      title: 'New QR Code',
      type: 'dynamic',
      qr_image: 'data:image/png;base64,...',
      created_at: '2025-10-25T10:00:00Z'
    },
    
    // Output fields
    outputFields: [
      { key: 'id', label: 'QR Code ID' },
      { key: 'short_code', label: 'Short Code' },
      { key: 'short_url', label: 'Short URL' },
      { key: 'destination_url', label: 'Destination URL' },
      { key: 'title', label: 'Title' },
      { key: 'qr_image', label: 'QR Image (Base64)' },
      { key: 'created_at', label: 'Created At', type: 'datetime' }
    ]
  }
};
