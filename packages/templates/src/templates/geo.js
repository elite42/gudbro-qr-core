/**
 * Geolocation Template
 * Generates Google Maps QR codes
 */

export const geoTemplate = {
  type: 'geo',
  name: 'Location',
  icon: '📍',
  description: 'Open a location in Google Maps',
  
  fields: [
    {
      name: 'latitude',
      label: 'Latitude',
      type: 'number',
      required: true,
      placeholder: '41.9028',
      step: 'any',
      validation: (value) => {
        const lat = parseFloat(value);
        return !isNaN(lat) && lat >= -90 && lat <= 90;
      }
    },
    {
      name: 'longitude',
      label: 'Longitude',
      type: 'number',
      required: true,
      placeholder: '12.4964',
      step: 'any',
      validation: (value) => {
        const lng = parseFloat(value);
        return !isNaN(lng) && lng >= -180 && lng <= 180;
      }
    },
    {
      name: 'label',
      label: 'Location Name (optional)',
      type: 'text',
      required: false,
      placeholder: 'Colosseo, Roma',
      maxLength: 100
    }
  ],

  generate: (data) => {
    const { latitude, longitude, label } = data;
    
    if (!latitude || !longitude) {
      throw new Error('Latitude and longitude are required');
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      throw new Error('Invalid coordinates');
    }

    // Google Maps URL format
    let mapsUrl = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;

    if (label) {
      mapsUrl += `&query_place_id=${encodeURIComponent(label)}`;
    }

    return mapsUrl;
  },

  example: {
    latitude: '41.9028',
    longitude: '12.4964',
    label: 'Colosseo, Roma, Italia'
  }
};

