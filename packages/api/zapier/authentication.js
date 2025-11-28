// Zapier Authentication - API Key Auth

module.exports = {
  type: 'custom',
  
  // Fields to collect from user
  fields: [
    {
      key: 'apiKey',
      label: 'API Key',
      required: true,
      type: 'string',
      helpText: 'Get your API key from QR Platform dashboard: Settings → API Keys',
      placeholder: 'qrp_live_...'
    }
  ],
  
  // Test the authentication
  test: async (z, bundle) => {
    // Make a request to verify the API key works
    const response = await z.request({
      url: 'https://api.qrplatform.com/v1/api/keys',
      headers: {
        'Authorization': `Bearer ${bundle.authData.apiKey}`
      }
    });
    
    // If we get here, the API key is valid
    // Return user info (optional)
    return {
      id: 'user_from_api_key',
      apiKey: bundle.authData.apiKey.substring(0, 12) + '...' // Masked
    };
  },
  
  // Add API key to all requests automatically
  connectionLabel: '{{apiKey}}',
  
  // Configure headers for all requests
  beforeRequest: [
    (request, z, bundle) => {
      request.headers = request.headers || {};
      request.headers['Authorization'] = `Bearer ${bundle.authData.apiKey}`;
      return request;
    }
  ]
};
