# Module 7: Content Templates - Implementation Guide

> **For Developers:** Complete guide to integrate Module 7 into your QR code generator project

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Installation](#installation)
3. [Quick Start](#quick-start)
4. [Integration Steps](#integration-steps)
5. [Frontend Integration](#frontend-integration)
6. [Backend Integration](#backend-integration)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

---

## Overview

**Module 7: Content Templates** provides 25 pre-built QR code templates for various use cases:
- **9 Original templates** (Email, Phone, WhatsApp, Geo, Social, Video, App Store, Payment, Review)
- **4 TIER 1 templates** (Text, PDF, Link in Bio, Audio)
- **6 TIER 2 templates** (File, Gallery, Google Form, Menu, Coupon, MECARD)
- **6 TIER 3 templates** (Bitcoin, Waze, Feedback, Landing Page, Multi URL, GS1)

---

## Installation

### Option 1: NPM Package (Recommended)

```bash
cd your-project
pnpm add file:../module-7-content-templates
```

### Option 2: Copy Files

```bash
cp -r module-7-content-templates/src your-project/lib/content-templates
```

---

## Quick Start

```javascript
import { generateQRData, templates } from '@gudbro/content-templates';

// Generate QR data
const qrData = generateQRData('email', {
  email: 'hello@example.com',
  subject: 'Contact',
  body: 'Hi there!'
});

console.log(qrData);
// Output: "mailto:hello@example.com?subject=Contact&body=Hi%20there!"
```

---

## Integration Steps

### Step 1: Install Module

```bash
cd /home/ubuntu/gudbro-qr-generator
pnpm add file:../module-7-content-templates
```

### Step 2: Import in Frontend

**File:** `client/src/components/QRCustomizer.tsx`

```typescript
import { templates, generateQRData } from '@gudbro/content-templates';

// Get all template types
const templateTypes = Object.keys(templates);

// Render template selector
<select onChange={(e) => setTemplateType(e.target.value)}>
  {templateTypes.map(type => (
    <option key={type} value={type}>
      {templates[type].icon} {templates[type].name}
    </option>
  ))}
</select>

// Render dynamic form fields based on selected template
{templates[selectedTemplate].fields.map(field => (
  <div key={field.name}>
    <label>{field.label}</label>
    {field.type === 'textarea' ? (
      <textarea 
        name={field.name}
        placeholder={field.placeholder}
        required={field.required}
        maxLength={field.maxLength}
      />
    ) : (
      <input
        type={field.type}
        name={field.name}
        placeholder={field.placeholder}
        required={field.required}
        maxLength={field.maxLength}
      />
    )}
    {field.hint && <small>{field.hint}</small>}
  </div>
))}

// Generate QR data
const handleGenerate = () => {
  const qrData = generateQRData(selectedTemplate, formData);
  // Pass qrData to QR code generator
};
```

### Step 3: Backend Integration (Optional)

**File:** `server/routers/qrCustom.ts`

```typescript
import { generateQRData, validateTemplate } from '@gudbro/content-templates';

export const qrCustomRouter = router({
  generate: publicProcedure
    .input(z.object({
      template: z.string(),
      data: z.record(z.any())
    }))
    .mutation(async ({ input }) => {
      // Validate template data
      const validation = validateTemplate(input.template, input.data);
      if (!validation.valid) {
        throw new Error(validation.errors.join(', '));
      }

      // Generate QR data
      const qrData = generateQRData(input.template, input.data);

      // Generate QR code image
      const qrCode = await QRCode.toDataURL(qrData);

      return { qrCode, qrData };
    })
});
```

---

## Frontend Integration

### Full Example: QRCustomizer Component

```typescript
import React, { useState } from 'react';
import { templates, generateQRData } from '@gudbro/content-templates';
import QRCode from 'qrcode';

export function QRCustomizer() {
  const [selectedTemplate, setSelectedTemplate] = useState('url');
  const [formData, setFormData] = useState({});
  const [qrImage, setQrImage] = useState('');

  const template = templates[selectedTemplate];

  const handleInputChange = (fieldName: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldName]: value }));
  };

  const handleGenerate = async () => {
    try {
      // Generate QR data using Module 7
      const qrData = generateQRData(selectedTemplate, formData);

      // Generate QR code image
      const qrCodeImage = await QRCode.toDataURL(qrData, {
        width: 1000,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });

      setQrImage(qrCodeImage);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div>
      {/* Template Selector */}
      <select 
        value={selectedTemplate}
        onChange={(e) => setSelectedTemplate(e.target.value)}
      >
        {Object.keys(templates).map(type => (
          <option key={type} value={type}>
            {templates[type].icon} {templates[type].name}
          </option>
        ))}
      </select>

      {/* Dynamic Form Fields */}
      {template.fields.map(field => (
        <div key={field.name}>
          <label>{field.label}</label>
          {field.type === 'select' ? (
            <select
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              required={field.required}
            >
              <option value="">Select...</option>
              {field.options?.map(opt => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          ) : field.type === 'textarea' ? (
            <textarea
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              maxLength={field.maxLength}
            />
          ) : (
            <input
              type={field.type}
              value={formData[field.name] || ''}
              onChange={(e) => handleInputChange(field.name, e.target.value)}
              placeholder={field.placeholder}
              required={field.required}
              maxLength={field.maxLength}
            />
          )}
          {field.hint && <small>{field.hint}</small>}
        </div>
      ))}

      {/* Generate Button */}
      <button onClick={handleGenerate}>
        Generate QR Code
      </button>

      {/* QR Code Preview */}
      {qrImage && (
        <div>
          <img src={qrImage} alt="QR Code" />
          <button onClick={() => {
            const link = document.createElement('a');
            link.download = `qr-${selectedTemplate}.png`;
            link.href = qrImage;
            link.click();
          }}>
            Download PNG
          </button>
        </div>
      )}
    </div>
  );
}
```

---

## Backend Integration

### tRPC Router Example

```typescript
import { router, publicProcedure } from '../trpc';
import { z } from 'zod';
import { generateQRData, validateTemplate } from '@gudbro/content-templates';
import QRCode from 'qrcode';

export const qrRouter = router({
  generateFromTemplate: publicProcedure
    .input(z.object({
      template: z.string(),
      data: z.record(z.any()),
      options: z.object({
        width: z.number().optional(),
        margin: z.number().optional(),
        color: z.object({
          dark: z.string().optional(),
          light: z.string().optional()
        }).optional()
      }).optional()
    }))
    .mutation(async ({ input }) => {
      // Validate template data
      const validation = validateTemplate(input.template, input.data);
      if (!validation.valid) {
        throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
      }

      // Generate QR data
      const qrData = generateQRData(input.template, input.data);

      // Generate QR code buffer
      const qrBuffer = await QRCode.toBuffer(qrData, {
        width: input.options?.width || 1000,
        margin: input.options?.margin || 2,
        color: {
          dark: input.options?.color?.dark || '#000000',
          light: input.options?.color?.light || '#FFFFFF'
        }
      });

      // Upload to S3 or return base64
      const base64 = qrBuffer.toString('base64');

      return {
        qrData,
        qrImage: `data:image/png;base64,${base64}`,
        template: input.template
      };
    })
});
```

---

## Testing

### Unit Tests

```javascript
import { generateQRData, validateTemplate } from '@gudbro/content-templates';

describe('Module 7: Content Templates', () => {
  test('Email template generates mailto link', () => {
    const result = generateQRData('email', {
      email: 'test@example.com',
      subject: 'Hello',
      body: 'Test message'
    });
    
    expect(result).toContain('mailto:test@example.com');
    expect(result).toContain('subject=Hello');
  });

  test('Validation catches missing required fields', () => {
    const validation = validateTemplate('email', {});
    
    expect(validation.valid).toBe(false);
    expect(validation.errors).toContain('Email address is required');
  });

  test('WhatsApp template formats phone correctly', () => {
    const result = generateQRData('whatsapp', {
      phone: '+39 123 456 7890',
      message: 'Ciao!'
    });
    
    expect(result).toContain('wa.me/39123456789');
  });
});
```

---

## Troubleshooting

### Common Issues

**1. "Template not found" error**

```javascript
// Check if template exists
import { getTemplateTypes } from '@gudbro/content-templates';
console.log(getTemplateTypes()); // List all available templates
```

**2. Validation fails**

```javascript
// Debug validation
import { validateTemplate } from '@gudbro/content-templates';
const validation = validateTemplate('email', yourData);
console.log(validation.errors); // See what's wrong
```

**3. Generated QR data is incorrect**

```javascript
// Test template generation
import { generateQRData } from '@gudbro/content-templates';
const qrData = generateQRData('email', {
  email: 'test@example.com'
});
console.log(qrData); // Should be: mailto:test@example.com
```

---

## Best Practices

1. **Always validate before generating**
   ```javascript
   const validation = validateTemplate(type, data);
   if (!validation.valid) {
     // Show errors to user
     return;
   }
   const qrData = generateQRData(type, data);
   ```

2. **Handle errors gracefully**
   ```javascript
   try {
     const qrData = generateQRData(type, data);
   } catch (error) {
     console.error('QR generation failed:', error.message);
     // Show user-friendly error
   }
   ```

3. **Use template examples for testing**
   ```javascript
   import { templates } from '@gudbro/content-templates';
   const exampleData = templates.email.example;
   const qrData = generateQRData('email', exampleData);
   ```

---

## Support

For issues or questions:
- Check the [README.md](./README.md) for API reference
- Review [examples/usage.js](./examples/usage.js) for code samples
- Open an issue on GitHub

---

**Module 7 Version:** 1.0.0  
**Last Updated:** 2025-10-29  
**License:** MIT

