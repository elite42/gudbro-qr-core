/**
 * WiFi Template
 * Generates QR codes for WiFi network connection
 */

export const wifiTemplate = {
  type: 'wifi',
  name: 'WiFi',
  icon: '📶',
  description: 'WiFi network credentials for automatic connection',
  
  fields: [
    {
      name: 'ssid',
      label: 'Network Name (SSID)',
      type: 'text',
      required: true,
      placeholder: 'MyWiFiNetwork',
      hint: 'The name of your WiFi network'
    },
    {
      name: 'password',
      label: 'Password',
      type: 'text',
      required: false,
      placeholder: 'mypassword123',
      hint: 'Leave empty for open networks'
    },
    {
      name: 'encryption',
      label: 'Security Type',
      type: 'select',
      required: true,
      options: [
        { value: 'WPA', label: 'WPA/WPA2' },
        { value: 'WEP', label: 'WEP' },
        { value: 'nopass', label: 'None (Open Network)' }
      ],
      hint: 'Most modern networks use WPA/WPA2'
    },
    {
      name: 'hidden',
      label: 'Hidden Network',
      type: 'select',
      required: false,
      options: [
        { value: 'false', label: 'No' },
        { value: 'true', label: 'Yes' }
      ],
      hint: 'Is this a hidden network?'
    }
  ],

  generate: (data) => {
    const { ssid, password, encryption = 'WPA', hidden = 'false' } = data;
    
    if (!ssid) {
      throw new Error('SSID is required');
    }

    if (encryption !== 'nopass' && !password) {
      throw new Error('Password is required for secured networks');
    }

    // WiFi QR code format: WIFI:T:WPA;S:SSID;P:password;H:false;;
    const escapedSSID = ssid.replace(/[\\;,:]/g, '\\$&');
    const escapedPassword = password ? password.replace(/[\\;,:]/g, '\\$&') : '';
    
    let wifiString = `WIFI:T:${encryption};S:${escapedSSID};`;
    
    if (encryption !== 'nopass' && escapedPassword) {
      wifiString += `P:${escapedPassword};`;
    }
    
    if (hidden === 'true') {
      wifiString += 'H:true;';
    }
    
    wifiString += ';';
    
    return wifiString;
  },

  example: {
    ssid: 'GUDBRO_Office',
    password: 'SecurePass123!',
    encryption: 'WPA',
    hidden: 'false'
  }
};

