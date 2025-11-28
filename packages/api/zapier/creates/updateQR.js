// Zapier Action - Update QR Code

module.exports = {
  key: 'update_qr',
  noun: 'QR Code',
  
  display: {
    label: 'Update QR Code',
    description: 'Updates an existing QR code (dynamic only).',
    important: false
  },
  
  operation: {
    // Input fields
    inputFields: [
      {
        key: 'qr_code_id',
        label: 'QR Code',
        helpText: 'The QR code to update',
        required: true,
        dynamic: 'qr_list.id.title'
      },
      {
        key: 'destination_url',
        label: 'New Destination URL',
        helpText: 'Update where the QR code redirects',
        required: false,
        type: 'string'
      },
      {
        key: 'title',
        label: 'New Title',
        required: false,
        type: 'string'
      },
      {
        key: 'is_active',
        label: 'Active Status',
        helpText: 'Activate or deactivate the QR code',
        required: false,
        type: 'boolean',
        choices: {
          true: 'Active',
          false: 'Inactive'
        }
      }
    ],
    
    // Perform the action
    perform: async (z, bundle) => {
      const qrCodeId = bundle.inputData.qr_code_id;
      
      // Build update payload (only include provided fields)
      const updateData = {};
      if (bundle.inputData.destination_url) {
        updateData.destination_url = bundle.inputData.destination_url;
      }
      if (bundle.inputData.title) {
        updateData.title = bundle.inputData.title;
      }
      if (bundle.inputData.is_active !== undefined) {
        updateData.is_active = bundle.inputData.is_active;
      }
      
      const response = await z.request({
        url: `https://api.qrplatform.com/v1/api/qr/${qrCodeId}`,
        method: 'PATCH',
        body: updateData
      });
      
      return response.data;
    },
    
    // Sample output
    sample: {
      id: 'qr_upd123',
      short_code: 'upd123',
      destination_url: 'https://new-url.com',
      title: 'Updated QR Code',
      is_active: true,
      updated_at: '2025-10-25T10:05:00Z'
    },
    
    // Output fields
    outputFields: [
      { key: 'id', label: 'QR Code ID' },
      { key: 'short_code', label: 'Short Code' },
      { key: 'destination_url', label: 'Destination URL' },
      { key: 'title', label: 'Title' },
      { key: 'is_active', label: 'Is Active', type: 'boolean' },
      { key: 'updated_at', label: 'Updated At', type: 'datetime' }
    ]
  }
};
