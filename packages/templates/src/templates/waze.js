/**
 * Waze Template
 * Generates QR codes for Waze navigation
 */

export const wazeTemplate = {
  type: 'waze',
  name: 'Waze Navigation',
  icon: '🗺️',
  description: 'Navigate with Waze app',
  
  fields: [
    {
      name: 'latitude',
      label: 'Latitude',
      type: 'number',
      required: true,
      placeholder: '45.4642',
      step: '0.000001',
      hint: 'Latitude coordinate (e.g., 45.4642 for Milan)'
    },
    {
      name: 'longitude',
      label: 'Longitude',
      type: 'number',
      required: true,
      placeholder: '9.1900',
      step: '0.000001',
      hint: 'Longitude coordinate (e.g., 9.1900 for Milan)'
    },
    {
      name: 'locationName',
      label: 'Location Name (optional)',
      type: 'text',
      required: false,
      placeholder: 'Duomo di Milano',
      maxLength: 100
    }
  ],

  generate: (data) => {
    const { latitude, longitude, locationName } = data;
    
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    // Validate coordinates
    if (latitude < -90 || latitude > 90) {
      throw new Error('Latitude must be between -90 and 90');
    }
    
    if (longitude < -180 || longitude > 180) {
      throw new Error('Longitude must be between -180 and 180');
    }

    // Waze URL format: https://waze.com/ul?ll=LAT,LON&navigate=yes
    let wazeUrl = `https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`;
    
    if (locationName) {
      wazeUrl += `&q=${encodeURIComponent(locationName)}`;
    }

    return wazeUrl;
  },

  example: {
    latitude: 45.4642,
    longitude: 9.1900,
    locationName: 'Duomo di Milano'
  }
};

