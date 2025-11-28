// Zapier Trigger - New QR Scan

module.exports = {
  key: 'new_scan',
  noun: 'Scan',
  
  display: {
    label: 'New QR Scan',
    description: 'Triggers when a QR code is scanned.',
    important: true
  },
  
  operation: {
    // Input fields for configuration
    inputFields: [
      {
        key: 'qr_code_id',
        label: 'QR Code',
        helpText: 'Only trigger for scans of this specific QR code (optional)',
        dynamic: 'qr_list.id.title',
        required: false
      }
    ],
    
    // How to fetch new scans (polling)
    perform: async (z, bundle) => {
      const params = {
        limit: 100,
        sort: 'desc'
      };
      
      // Filter by specific QR code if provided
      if (bundle.inputData.qr_code_id) {
        params.qr_code_id = bundle.inputData.qr_code_id;
      }
      
      const response = await z.request({
        url: 'https://api.qrplatform.com/v1/api/scans/recent',
        params
      });
      
      return response.data;
    },
    
    // Sample data for testing
    sample: {
      id: 'scan_123abc',
      qr_code_id: 'qr_456def',
      short_code: 'abc123',
      destination_url: 'https://example.com',
      scanned_at: '2025-10-25T10:00:00Z',
      country: 'US',
      city: 'New York',
      device_type: 'mobile',
      os: 'iOS',
      browser: 'Safari',
      ip_address: '192.168.1.1'
    },
    
    // Output fields definition
    outputFields: [
      { key: 'id', label: 'Scan ID' },
      { key: 'qr_code_id', label: 'QR Code ID' },
      { key: 'short_code', label: 'Short Code' },
      { key: 'destination_url', label: 'Destination URL' },
      { key: 'scanned_at', label: 'Scanned At', type: 'datetime' },
      { key: 'country', label: 'Country' },
      { key: 'city', label: 'City' },
      { key: 'device_type', label: 'Device Type' },
      { key: 'os', label: 'Operating System' },
      { key: 'browser', label: 'Browser' }
    ]
  }
};
