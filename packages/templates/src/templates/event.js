/**
 * Event Template
 * Generates QR codes for calendar events (iCalendar format)
 */

export const eventTemplate = {
  type: 'event',
  name: 'Event',
  icon: '📅',
  description: 'Add calendar event with date, time, and location',
  
  fields: [
    {
      name: 'title',
      label: 'Event Title',
      type: 'text',
      required: true,
      placeholder: 'GUDBRO Launch Party',
      hint: 'Name of the event'
    },
    {
      name: 'location',
      label: 'Location',
      type: 'text',
      required: false,
      placeholder: 'Via Roma 1, Milano, Italy'
    },
    {
      name: 'description',
      label: 'Description',
      type: 'textarea',
      required: false,
      placeholder: 'Join us for the official launch...',
      maxLength: 500
    },
    {
      name: 'startDate',
      label: 'Start Date',
      type: 'date',
      required: true,
      hint: 'Event start date'
    },
    {
      name: 'startTime',
      label: 'Start Time',
      type: 'time',
      required: true,
      hint: 'Event start time'
    },
    {
      name: 'endDate',
      label: 'End Date',
      type: 'date',
      required: false,
      hint: 'Leave empty if same day'
    },
    {
      name: 'endTime',
      label: 'End Time',
      type: 'time',
      required: false,
      hint: 'Event end time'
    }
  ],

  generate: (data) => {
    const { title, location = '', description = '', startDate, startTime, endDate, endTime } = data;
    
    if (!title || !startDate || !startTime) {
      throw new Error('Title, start date, and start time are required');
    }

    // Format dates for iCalendar (YYYYMMDDTHHMMSS)
    const formatDateTime = (date, time) => {
      const d = new Date(`${date}T${time}`);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const hours = String(d.getHours()).padStart(2, '0');
      const minutes = String(d.getMinutes()).padStart(2, '0');
      return `${year}${month}${day}T${hours}${minutes}00`;
    };

    const dtStart = formatDateTime(startDate, startTime);
    const dtEnd = endDate && endTime 
      ? formatDateTime(endDate, endTime)
      : formatDateTime(startDate, endTime || startTime);

    // Build iCalendar VEVENT
    let ical = 'BEGIN:VEVENT\n';
    ical += `SUMMARY:${title}\n`;
    ical += `DTSTART:${dtStart}\n`;
    ical += `DTEND:${dtEnd}\n`;
    
    if (location) {
      ical += `LOCATION:${location}\n`;
    }
    
    if (description) {
      // Escape newlines in description
      const escapedDesc = description.replace(/\n/g, '\\n');
      ical += `DESCRIPTION:${escapedDesc}\n`;
    }
    
    ical += 'END:VEVENT';
    
    return ical;
  },

  example: {
    title: 'GUDBRO Launch Party',
    location: 'Via Roma 1, Milano, Italy',
    description: 'Join us for the official launch of GUDBRO QR Generator!',
    startDate: '2025-11-15',
    startTime: '18:00',
    endDate: '2025-11-15',
    endTime: '22:00'
  }
};

