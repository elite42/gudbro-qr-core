/**
 * QR Types Unit Tests
 * Tests for WiFi, vCard, Email, SMS, Event, and Social QR generators
 */

const {
  generateWiFiQR,
  generateVCardQR,
  generateEmailQR,
  generateSMSQR,
  generateEventQR,
  generateSocialQR,
  escapeWiFiString
} = require('../utils/qrTypes');

describe('WiFi QR Generation', () => {
  test('should generate valid WPA WiFi QR string', () => {
    const result = generateWiFiQR({
      ssid: 'MyNetwork',
      password: 'SecurePass123',
      encryption: 'WPA'
    });

    expect(result).toBe('WIFI:T:WPA;S:MyNetwork;P:SecurePass123;;');
  });

  test('should generate WEP WiFi QR string', () => {
    const result = generateWiFiQR({
      ssid: 'OldNetwork',
      password: 'pass',
      encryption: 'WEP'
    });

    expect(result).toBe('WIFI:T:WEP;S:OldNetwork;P:pass;;');
  });

  test('should generate open network (nopass) WiFi QR', () => {
    const result = generateWiFiQR({
      ssid: 'FreeWiFi',
      encryption: 'nopass'
    });

    expect(result).toBe('WIFI:T:nopass;S:FreeWiFi;;');
  });

  test('should handle hidden network flag', () => {
    const result = generateWiFiQR({
      ssid: 'HiddenNet',
      password: 'secret',
      encryption: 'WPA',
      hidden: true
    });

    expect(result).toBe('WIFI:T:WPA;S:HiddenNet;P:secret;H:true;;');
  });

  test('should escape special characters in SSID', () => {
    const result = generateWiFiQR({
      ssid: 'Test;Network:Name',
      password: 'pass',
      encryption: 'WPA'
    });

    expect(result).toContain('S:Test\\;Network\\:Name');
  });

  test('should escape special characters in password', () => {
    const result = generateWiFiQR({
      ssid: 'Network',
      password: 'pass;word:123',
      encryption: 'WPA'
    });

    expect(result).toContain('P:pass\\;word\\:123');
  });

  test('should throw error if SSID is missing', () => {
    expect(() => {
      generateWiFiQR({ password: 'test' });
    }).toThrow('SSID is required');
  });

  test('should throw error if password is missing for WPA', () => {
    expect(() => {
      generateWiFiQR({ ssid: 'Test', encryption: 'WPA' });
    }).toThrow('Password is required for WPA encryption');
  });

  test('should throw error for invalid encryption type', () => {
    expect(() => {
      generateWiFiQR({ ssid: 'Test', encryption: 'INVALID' });
    }).toThrow('Invalid encryption type');
  });

  test('should default to WPA encryption', () => {
    const result = generateWiFiQR({
      ssid: 'DefaultNet',
      password: 'pass'
    });

    expect(result).toContain('T:WPA');
  });
});

describe('escapeWiFiString', () => {
  test('should escape backslash', () => {
    expect(escapeWiFiString('test\\value')).toBe('test\\\\value');
  });

  test('should escape double quotes', () => {
    expect(escapeWiFiString('test"value')).toBe('test\\"value');
  });

  test('should escape semicolon', () => {
    expect(escapeWiFiString('test;value')).toBe('test\\;value');
  });

  test('should escape comma', () => {
    expect(escapeWiFiString('test,value')).toBe('test\\,value');
  });

  test('should escape colon', () => {
    expect(escapeWiFiString('test:value')).toBe('test\\:value');
  });

  test('should escape multiple special characters', () => {
    expect(escapeWiFiString('test;:,"\\')).toBe('test\\;\\:\\,\\"\\\\');
  });
});

describe('vCard QR Generation', () => {
  test('should generate basic vCard', () => {
    const result = generateVCardQR({
      firstName: 'John',
      lastName: 'Doe'
    });

    expect(result).toContain('BEGIN:VCARD');
    expect(result).toContain('VERSION:3.0');
    expect(result).toContain('FN:John Doe');
    expect(result).toContain('N:Doe;John;;;');
    expect(result).toContain('END:VCARD');
  });

  test('should include phone number', () => {
    const result = generateVCardQR({
      firstName: 'John',
      phone: '+1234567890'
    });

    expect(result).toContain('TEL:+1234567890');
  });

  test('should include email', () => {
    const result = generateVCardQR({
      firstName: 'John',
      email: 'john@example.com'
    });

    expect(result).toContain('EMAIL:john@example.com');
  });

  test('should include company and title', () => {
    const result = generateVCardQR({
      firstName: 'John',
      company: 'Acme Inc',
      title: 'CEO'
    });

    expect(result).toContain('ORG:Acme Inc');
    expect(result).toContain('TITLE:CEO');
  });

  test('should include address', () => {
    const result = generateVCardQR({
      firstName: 'John',
      address: '123 Main St, City'
    });

    expect(result).toContain('ADR:;;123 Main St, City;;;;');
  });

  test('should include website', () => {
    const result = generateVCardQR({
      firstName: 'John',
      website: 'https://example.com'
    });

    expect(result).toContain('URL:https://example.com');
  });

  test('should include note', () => {
    const result = generateVCardQR({
      firstName: 'John',
      note: 'Important contact'
    });

    expect(result).toContain('NOTE:Important contact');
  });

  test('should throw error if firstName is missing', () => {
    expect(() => {
      generateVCardQR({ lastName: 'Doe' });
    }).toThrow('First name is required');
  });

  test('should handle firstName only', () => {
    const result = generateVCardQR({
      firstName: 'John'
    });

    expect(result).toContain('FN:John ');
    expect(result).toContain('N:;John;;;');
  });
});

describe('Email QR Generation', () => {
  test('should generate mailto link', () => {
    const result = generateEmailQR({
      email: 'test@example.com'
    });

    expect(result).toBe('mailto:test@example.com');
  });

  test('should include subject', () => {
    const result = generateEmailQR({
      email: 'test@example.com',
      subject: 'Hello World'
    });

    expect(result).toBe('mailto:test@example.com?subject=Hello%20World');
  });

  test('should include body', () => {
    const result = generateEmailQR({
      email: 'test@example.com',
      body: 'Message content'
    });

    expect(result).toBe('mailto:test@example.com?body=Message%20content');
  });

  test('should include subject and body', () => {
    const result = generateEmailQR({
      email: 'test@example.com',
      subject: 'Subject',
      body: 'Body text'
    });

    expect(result).toBe('mailto:test@example.com?subject=Subject&body=Body%20text');
  });

  test('should encode special characters', () => {
    const result = generateEmailQR({
      email: 'test@example.com',
      subject: 'Test & Special'
    });

    expect(result).toContain('subject=Test%20%26%20Special');
  });

  test('should throw error for invalid email', () => {
    expect(() => {
      generateEmailQR({ email: 'invalid-email' });
    }).toThrow('Valid email address is required');
  });

  test('should throw error if email is missing', () => {
    expect(() => {
      generateEmailQR({ subject: 'Test' });
    }).toThrow('Valid email address is required');
  });
});

describe('SMS QR Generation', () => {
  test('should generate sms link', () => {
    const result = generateSMSQR({
      phone: '+1234567890'
    });

    expect(result).toBe('sms:+1234567890');
  });

  test('should include message', () => {
    const result = generateSMSQR({
      phone: '+1234567890',
      message: 'Hello there'
    });

    expect(result).toBe('sms:+1234567890?body=Hello%20there');
  });

  test('should encode special characters in message', () => {
    const result = generateSMSQR({
      phone: '+1234567890',
      message: 'Test & Special'
    });

    expect(result).toContain('body=Test%20%26%20Special');
  });

  test('should throw error if phone is missing', () => {
    expect(() => {
      generateSMSQR({ message: 'Test' });
    }).toThrow('Phone number is required');
  });

  test('should throw error for empty phone', () => {
    expect(() => {
      generateSMSQR({ phone: '' });
    }).toThrow('Phone number is required');
  });
});

describe('Event QR Generation', () => {
  test('should generate basic iCalendar event', () => {
    const result = generateEventQR({
      title: 'Meeting',
      start: '2025-01-15T10:00:00Z',
      end: '2025-01-15T11:00:00Z'
    });

    expect(result).toContain('BEGIN:VCALENDAR');
    expect(result).toContain('VERSION:2.0');
    expect(result).toContain('BEGIN:VEVENT');
    expect(result).toContain('SUMMARY:Meeting');
    expect(result).toContain('DTSTART:20250115T100000Z');
    expect(result).toContain('DTEND:20250115T110000Z');
    expect(result).toContain('END:VEVENT');
    expect(result).toContain('END:VCALENDAR');
  });

  test('should include location', () => {
    const result = generateEventQR({
      title: 'Meeting',
      start: '2025-01-15T10:00:00Z',
      end: '2025-01-15T11:00:00Z',
      location: 'Conference Room A'
    });

    expect(result).toContain('LOCATION:Conference Room A');
  });

  test('should include description', () => {
    const result = generateEventQR({
      title: 'Meeting',
      start: '2025-01-15T10:00:00Z',
      end: '2025-01-15T11:00:00Z',
      description: 'Quarterly review'
    });

    expect(result).toContain('DESCRIPTION:Quarterly review');
  });

  test('should throw error if title is missing', () => {
    expect(() => {
      generateEventQR({
        start: '2025-01-15T10:00:00Z',
        end: '2025-01-15T11:00:00Z'
      });
    }).toThrow('Event title is required');
  });

  test('should throw error if start is missing', () => {
    expect(() => {
      generateEventQR({
        title: 'Meeting',
        end: '2025-01-15T11:00:00Z'
      });
    }).toThrow('Event start and end times are required');
  });

  test('should throw error if end is missing', () => {
    expect(() => {
      generateEventQR({
        title: 'Meeting',
        start: '2025-01-15T10:00:00Z'
      });
    }).toThrow('Event start and end times are required');
  });
});

describe('Social Media QR Generation', () => {
  test('should generate Instagram URL', () => {
    const result = generateSocialQR({
      platform: 'instagram',
      username: 'myaccount'
    });

    expect(result).toBe('https://instagram.com/myaccount');
  });

  test('should generate Facebook URL', () => {
    const result = generateSocialQR({
      platform: 'facebook',
      username: 'mypage'
    });

    expect(result).toBe('https://facebook.com/mypage');
  });

  test('should generate Twitter URL', () => {
    const result = generateSocialQR({
      platform: 'twitter',
      username: 'myhandle'
    });

    expect(result).toBe('https://twitter.com/myhandle');
  });

  test('should generate X (Twitter) URL', () => {
    const result = generateSocialQR({
      platform: 'x',
      username: 'myhandle'
    });

    expect(result).toBe('https://x.com/myhandle');
  });

  test('should generate LinkedIn URL', () => {
    const result = generateSocialQR({
      platform: 'linkedin',
      username: 'myprofile'
    });

    expect(result).toBe('https://linkedin.com/in/myprofile');
  });

  test('should generate TikTok URL', () => {
    const result = generateSocialQR({
      platform: 'tiktok',
      username: 'mychannel'
    });

    expect(result).toBe('https://tiktok.com/@mychannel');
  });

  test('should generate YouTube URL', () => {
    const result = generateSocialQR({
      platform: 'youtube',
      username: 'mychannel'
    });

    expect(result).toBe('https://youtube.com/@mychannel');
  });

  test('should generate GitHub URL', () => {
    const result = generateSocialQR({
      platform: 'github',
      username: 'myrepo'
    });

    expect(result).toBe('https://github.com/myrepo');
  });

  test('should throw error for unsupported platform', () => {
    expect(() => {
      generateSocialQR({
        platform: 'unsupported',
        username: 'test'
      });
    }).toThrow('Unsupported platform');
  });

  test('should throw error if platform is missing', () => {
    expect(() => {
      generateSocialQR({
        username: 'test'
      });
    }).toThrow('Platform and username are required');
  });

  test('should throw error if username is missing', () => {
    expect(() => {
      generateSocialQR({
        platform: 'instagram'
      });
    }).toThrow('Platform and username are required');
  });

  test('should handle case-insensitive platform names', () => {
    const result = generateSocialQR({
      platform: 'InStAgRaM',
      username: 'test'
    });

    expect(result).toBe('https://instagram.com/test');
  });
});
