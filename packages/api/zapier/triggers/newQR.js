// Zapier Trigger - New QR Code Created

module.exports = {
  key: 'new_qr',
  noun: 'QR Code',
  
  display: {
    label: 'New QR Code',
    description: 'Triggers when a new QR code is created.',
    important: true
  },
  
  operation: {
    // How to fetch new QR codes (polling)
    perform: async (z, bundle) => {
      const response = await z.request({
        url: 'https://api.qrplatform.com/v1/api/qr',
        params: {
          limit: 100,
          sort: 'desc'
        }
      });
      
      return response.data.qr_codes || [];
    },
    
    // Sample data for testing
    sample: {
      id: 'qr_789ghi',
      short_code: 'xyz789',
      short_url: 'https://qr.me/xyz789',
      destination_url: 'https://example.com/product',
      title: 'Product QR Code',
      type: 'dynamic',
      total_scans: 0,
      is_active: true,
      created_at: '2025-10-25T10:00:00Z'
    },
    
    // Output fields definition
    outputFields: [
      { key: 'id', label: 'QR Code ID' },
      { key: 'short_code', label: 'Short Code' },
      { key: 'short_url', label: 'Short URL' },
      { key: 'destination_url', label: 'Destination URL' },
      { key: 'title', label: 'Title' },
      { key: 'type', label: 'Type' },
      { key: 'total_scans', label: 'Total Scans', type: 'integer' },
      { key: 'is_active', label: 'Is Active', type: 'boolean' },
      { key: 'created_at', label: 'Created At', type: 'datetime' }
    ]
  }
};
