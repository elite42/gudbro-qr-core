/**
 * QR Code Type Generators
 * Formats data for different QR code types (WiFi, vCard, Email, SMS, Event, etc.)
 *
 * References:
 * - WiFi QR: Android WiFi QR spec
 * - vCard: RFC 2426 (vCard 3.0)
 * - iCalendar: RFC 5545
 */

/**
 * Generate WiFi QR code string
 * Format: WIFI:T:<WPA|WEP|nopass>;S:<SSID>;P:<PASSWORD>;H:<true|false|blank>;;
 *
 * @param {Object} data - WiFi configuration
 * @param {string} data.ssid - Network SSID (required)
 * @param {string} data.password - Network password (required for WPA/WEP)
 * @param {string} data.encryption - Encryption type: WPA, WEP, nopass (default: WPA)
 * @param {boolean} data.hidden - Is network hidden? (default: false)
 * @returns {string} WiFi QR format string
 *
 * @example
 * generateWiFiQR({ ssid: 'MyWiFi', password: 'secret123', encryption: 'WPA' })
 * // Returns: "WIFI:T:WPA;S:MyWiFi;P:secret123;;"
 */
function generateWiFiQR(data) {
  const { ssid, password, encryption = 'WPA', hidden = false } = data;

  // Validation
  if (!ssid || ssid.trim() === '') {
    throw new Error('SSID is required');
  }

  // Validate encryption type
  const validEncryptions = ['WPA', 'WEP', 'nopass'];
  // Normalize encryption: uppercase for WPA/WEP, lowercase for nopass
  let encryptionType = encryption.toLowerCase();
  if (encryptionType === 'wpa' || encryptionType === 'wep') {
    encryptionType = encryptionType.toUpperCase();
  }

  if (!validEncryptions.includes(encryptionType)) {
    throw new Error(`Invalid encryption type. Must be one of: ${validEncryptions.join(', ')}`);
  }

  // Password required for WPA and WEP
  if ((encryptionType === 'WPA' || encryptionType === 'WEP') && !password) {
    throw new Error(`Password is required for ${encryptionType} encryption`);
  }

  // Escape special characters in SSID and password
  // WiFi QR format requires escaping: \ " ; , :
  const escapedSSID = escapeWiFiString(ssid);
  const escapedPassword = password ? escapeWiFiString(password) : '';

  // Build WiFi string
  let wifiString = `WIFI:T:${encryptionType};S:${escapedSSID};`;

  if (password && encryptionType !== 'nopass') {
    wifiString += `P:${escapedPassword};`;
  }

  if (hidden) {
    wifiString += 'H:true;';
  }

  wifiString += ';'; // Double semicolon terminates WiFi QR

  return wifiString;
}

/**
 * Escape special characters for WiFi QR format
 * Characters to escape: \ " ; , :
 *
 * @param {string} str - String to escape
 * @returns {string} Escaped string
 */
function escapeWiFiString(str) {
  return str
    .replace(/\\/g, '\\\\')  // Backslash must be escaped first
    .replace(/"/g, '\\"')    // Double quote
    .replace(/;/g, '\\;')    // Semicolon
    .replace(/,/g, '\\,')    // Comma
    .replace(/:/g, '\\:');   // Colon
}

/**
 * Generate vCard QR code string (Version 3.0)
 * Used for contact information
 *
 * @param {Object} data - Contact information
 * @param {string} data.firstName - First name (required)
 * @param {string} data.lastName - Last name (optional)
 * @param {string} data.phone - Phone number (optional)
 * @param {string} data.email - Email address (optional)
 * @param {string} data.company - Company/Organization (optional)
 * @param {string} data.title - Job title (optional)
 * @param {string} data.address - Physical address (optional)
 * @param {string} data.website - Website URL (optional)
 * @returns {string} vCard 3.0 format string
 *
 * @example
 * generateVCardQR({
 *   firstName: 'John',
 *   lastName: 'Doe',
 *   phone: '+1234567890',
 *   email: 'john@example.com'
 * })
 */
function generateVCardQR(data) {
  const {
    firstName,
    lastName = '',
    phone,
    email,
    company,
    title,
    address,
    website,
    note
  } = data;

  // Validation
  if (!firstName || firstName.trim() === '') {
    throw new Error('First name is required');
  }

  // Build vCard 3.0
  let vcard = 'BEGIN:VCARD\n';
  vcard += 'VERSION:3.0\n';
  vcard += `FN:${firstName} ${lastName}\n`;
  vcard += `N:${lastName};${firstName};;;\n`;

  if (phone) {
    vcard += `TEL:${phone}\n`;
  }

  if (email) {
    vcard += `EMAIL:${email}\n`;
  }

  if (company) {
    vcard += `ORG:${company}\n`;
  }

  if (title) {
    vcard += `TITLE:${title}\n`;
  }

  if (address) {
    vcard += `ADR:;;${address};;;;\n`;
  }

  if (website) {
    vcard += `URL:${website}\n`;
  }

  if (note) {
    vcard += `NOTE:${note}\n`;
  }

  vcard += 'END:VCARD';

  return vcard;
}

/**
 * Generate Email QR code string
 * Format: mailto:email@example.com?subject=Subject&body=Body
 *
 * @param {Object} data - Email configuration
 * @param {string} data.email - Recipient email (required)
 * @param {string} data.subject - Email subject (optional)
 * @param {string} data.body - Email body (optional)
 * @returns {string} mailto: URI
 *
 * @example
 * generateEmailQR({ email: 'hello@example.com', subject: 'Hello' })
 * // Returns: "mailto:hello@example.com?subject=Hello"
 */
function generateEmailQR(data) {
  const { email, subject, body } = data;

  // Validation
  if (!email || !isValidEmail(email)) {
    throw new Error('Valid email address is required');
  }

  let mailtoURI = `mailto:${email}`;
  const params = [];

  if (subject) {
    params.push(`subject=${encodeURIComponent(subject)}`);
  }

  if (body) {
    params.push(`body=${encodeURIComponent(body)}`);
  }

  if (params.length > 0) {
    mailtoURI += `?${params.join('&')}`;
  }

  return mailtoURI;
}

/**
 * Generate SMS QR code string
 * Format: sms:+1234567890?body=Message
 *
 * @param {Object} data - SMS configuration
 * @param {string} data.phone - Phone number (required)
 * @param {string} data.message - SMS message (optional)
 * @returns {string} sms: URI
 *
 * @example
 * generateSMSQR({ phone: '+1234567890', message: 'Hello!' })
 * // Returns: "sms:+1234567890?body=Hello!"
 */
function generateSMSQR(data) {
  const { phone, message } = data;

  // Validation
  if (!phone || phone.trim() === '') {
    throw new Error('Phone number is required');
  }

  let smsURI = `sms:${phone}`;

  if (message) {
    smsURI += `?body=${encodeURIComponent(message)}`;
  }

  return smsURI;
}

/**
 * Generate Event (iCalendar) QR code string
 * Format: iCalendar format for calendar events
 *
 * @param {Object} data - Event configuration
 * @param {string} data.title - Event title (required)
 * @param {Date|string} data.start - Start date/time (required)
 * @param {Date|string} data.end - End date/time (required)
 * @param {string} data.location - Event location (optional)
 * @param {string} data.description - Event description (optional)
 * @returns {string} iCalendar format string
 *
 * @example
 * generateEventQR({
 *   title: 'Meeting',
 *   start: '2025-01-15T10:00:00',
 *   end: '2025-01-15T11:00:00',
 *   location: 'Office'
 * })
 */
function generateEventQR(data) {
  const { title, start, end, location, description } = data;

  // Validation
  if (!title || title.trim() === '') {
    throw new Error('Event title is required');
  }

  if (!start || !end) {
    throw new Error('Event start and end times are required');
  }

  // Convert dates to iCalendar format (YYYYMMDDTHHMMSS)
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  };

  const startFormatted = formatDate(start);
  const endFormatted = formatDate(end);

  // Build iCalendar
  let ical = 'BEGIN:VCALENDAR\n';
  ical += 'VERSION:2.0\n';
  ical += 'BEGIN:VEVENT\n';
  ical += `SUMMARY:${title}\n`;
  ical += `DTSTART:${startFormatted}\n`;
  ical += `DTEND:${endFormatted}\n`;

  if (location) {
    ical += `LOCATION:${location}\n`;
  }

  if (description) {
    ical += `DESCRIPTION:${description}\n`;
  }

  ical += 'END:VEVENT\n';
  ical += 'END:VCALENDAR';

  return ical;
}

/**
 * Generate Social Media Link QR code
 * Direct link to social media profile
 *
 * @param {Object} data - Social media configuration
 * @param {string} data.platform - Platform name (instagram, facebook, twitter, linkedin, tiktok)
 * @param {string} data.username - Username/handle (required)
 * @returns {string} Social media URL
 *
 * @example
 * generateSocialQR({ platform: 'instagram', username: 'myaccount' })
 * // Returns: "https://instagram.com/myaccount"
 */
function generateSocialQR(data) {
  const { platform, username } = data;

  // Validation
  if (!platform || !username) {
    throw new Error('Platform and username are required');
  }

  const platformURLs = {
    instagram: `https://instagram.com/${username}`,
    facebook: `https://facebook.com/${username}`,
    twitter: `https://twitter.com/${username}`,
    x: `https://x.com/${username}`,
    linkedin: `https://linkedin.com/in/${username}`,
    tiktok: `https://tiktok.com/@${username}`,
    youtube: `https://youtube.com/@${username}`,
    github: `https://github.com/${username}`
  };

  const url = platformURLs[platform.toLowerCase()];

  if (!url) {
    throw new Error(`Unsupported platform. Supported: ${Object.keys(platformURLs).join(', ')}`);
  }

  return url;
}

/**
 * Simple email validation
 * @param {string} email - Email to validate
 * @returns {boolean}
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

module.exports = {
  generateWiFiQR,
  generateVCardQR,
  generateEmailQR,
  generateSMSQR,
  generateEventQR,
  generateSocialQR,
  escapeWiFiString
};
