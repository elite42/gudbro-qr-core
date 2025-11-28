# Claude Code - Best Practices per Implementazione

**Scopo:** Linee guida tecniche OBBLIGATORIE per implementazione feature
**Audience:** Claude Code
**Leggere:** SEMPRE prima di implementare qualsiasi feature frontend

---

## 📋 INDICE RAPIDO

1. [Pattern QR Forms](#1-pattern-qr-forms-obbligatorio)
2. [TypeScript Rules](#2-typescript-rules)
3. [State Management](#3-state-management)
4. [Error Handling](#4-error-handling)
5. [API Client](#5-api-client-pattern)
6. [Validation](#6-form-validation)
7. [Testing](#7-testing)
8. [Checklist](#8-checklist-implementazione)
9. [Esempi Codice](#9-esempi-codice-completi)
10. [Anti-Patterns](#10-anti-patterns-da-evitare)

---

## 1. PATTERN QR FORMS (OBBLIGATORIO)

**TUTTI i 19 form QR seguono questa struttura. NON deviare.**

### 1.1 File Structure

```
/app/qr/create/{type}/page.tsx
```

### 1.2 Component Template

```typescript
'use client'; // ✅ SEMPRE client component

import { useState } from 'react';
import Link from 'next/link';
import * as LucideIcons from 'lucide-react';
import { qrApi, {Type}QRData, QRResponse } from '@/lib/api/qr';

export default function Create{Type}QRPage() {
  // ============= SECTION 1: STATE =============
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<QRResponse | null>(null);

  // Form-specific fields
  const [field1, setField1] = useState('');
  const [field2, setField2] = useState('');

  // ============= SECTION 2: VALIDATION =============
  const validateForm = (): string | null => {
    if (!field1.trim()) {
      return 'Field 1 is required';
    }
    // Type-specific validation...
    return null;
  };

  // ============= SECTION 3: HANDLERS =============
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data: {Type}QRData = {
        field1: field1.trim(),
        field2: field2.trim() || undefined,
      };
      const qrResult = await qrApi.create{Type}(data);
      setResult(qrResult);
    } catch (err: any) {
      setError(err.message || 'Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setField1('');
    setField2('');
    setResult(null);
    setError(null);
  };

  const handleDownload = () => {
    if (!result) return;
    const link = document.createElement('a');
    link.href = result.qr_image;
    link.download = `{type}-qr-${result.id}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ============= SECTION 4: RENDER =============
  return (
    <div className="min-h-screen bg-gray-50">
      {/* HEADER */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/qr" className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-700">
                <LucideIcons.ArrowLeft className="w-5 h-5" />
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-black">{Type} QR Code</h1>
                <p className="text-sm text-gray-600">Description here</p>
              </div>
            </div>
            {/* Badge */}
            <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 rounded-lg border border-blue-200">
              <LucideIcons.Icon className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Category</span>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN - TWO COLUMNS */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

          {/* COLUMN 1: FORM */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6">
              <h2 className="text-lg font-bold mb-4 text-black">Form Title</h2>

              {/* ERROR DISPLAY */}
              {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                  <LucideIcons.AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="text-red-800 font-medium text-sm">Error</p>
                    <p className="text-red-600 text-sm">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Form fields go here */}

                {/* SUBMIT/RESET BUTTONS */}
                <div className="flex gap-3 pt-4">
                  {!result ? (
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <LucideIcons.Loader2 className="w-5 h-5 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <LucideIcons.QrCode className="w-5 h-5" />
                          Generate QR Code
                        </>
                      )}
                    </button>
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleReset}
                        className="flex-1 px-6 py-3 border border-gray-300 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                      >
                        <LucideIcons.RotateCcw className="w-5 h-5" />
                        Create Another
                      </button>
                      <button
                        type="button"
                        onClick={handleDownload}
                        className="flex-1 px-6 py-3 bg-black text-white rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
                      >
                        <LucideIcons.Download className="w-5 h-5" />
                        Download
                      </button>
                    </>
                  )}
                </div>
              </form>
            </div>

            {/* INFO BOX (optional) */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-start gap-3">
                <LucideIcons.Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-semibold text-blue-900 text-sm mb-1">How it works</h3>
                  <p className="text-blue-700 text-sm">Description...</p>
                </div>
              </div>
            </div>
          </div>

          {/* COLUMN 2: PREVIEW */}
          <div>
            <div className="bg-white rounded-xl border border-gray-200 p-6 sticky top-8">
              <h2 className="text-lg font-bold mb-4 text-black">Preview</h2>

              {!result ? (
                <div className="aspect-square bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400">
                  <LucideIcons.QrCode className="w-16 h-16 mb-3" />
                  <p className="text-sm font-medium">QR code will appear here</p>
                  <p className="text-xs mt-1">Fill in the form and click Generate</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="aspect-square bg-white rounded-lg border-2 border-gray-200 p-4 flex items-center justify-center">
                    <img
                      src={result.qr_image}
                      alt="{Type} QR Code"
                      className="w-full h-full object-contain"
                    />
                  </div>

                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                    <LucideIcons.CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-green-800 font-medium text-sm">QR Code Generated!</p>
                      <p className="text-green-600 text-sm mt-1">Your QR code is ready</p>
                    </div>
                  </div>

                  {result.short_url && (
                    <div className="text-xs">
                      <p className="text-gray-500 mb-1">Short URL</p>
                      <a
                        href={result.short_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline break-all"
                      >
                        {result.short_url}
                      </a>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

### 1.3 Files di Riferimento

**Form Semplice:**
```
/app/qr/create/sms/page.tsx
/app/qr/create/email/page.tsx
```

**Form con Array Dinamici:**
```
/app/qr/create/multi-url/page.tsx
/app/qr/create/feedback-form/page.tsx
```

**Form con API Call Aggiuntiva:**
```
/app/qr/create/vietqr/page.tsx (carica banche con useEffect)
```

---

## 2. TYPESCRIPT RULES

### 2.1 Strict Mode OBBLIGATORIO

```typescript
// ✅ CORRETTO - explicit types
interface FormData {
  phone: string;
  message: string;
}

const handleSubmit = async (data: FormData): Promise<void> => {
  // ...
};

// ❌ MAI usare any
const handleSubmit = async (data: any) => { };

// ❌ MAI usare implicit any
const handleSubmit = async (data) => { };
```

### 2.2 Interfaces vs Types

```typescript
// ✅ PREFERIRE interfaces per oggetti
export interface SMSQRData {
  phone: string;
  message: string;
}

// ✅ Types per union/literal
export type QRType = 'wifi' | 'vcard' | 'sms';
export type Status = 'idle' | 'loading' | 'success' | 'error';

// ✅ Optional fields con ?
export interface WiFiQRData {
  ssid: string;
  password?: string;  // Optional
  encryption: 'WPA' | 'WEP' | 'nopass';
}
```

### 2.3 React Component Types

```typescript
// ✅ Props interface
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'secondary';
}

export function Button({ children, onClick, disabled, variant = 'primary' }: ButtonProps) {
  // ...
}

// ✅ Event handlers
const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  setValue(e.target.value);
};

const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
  e.preventDefault();
};
```

---

## 3. STATE MANAGEMENT

### 3.1 useState per Form Fields

```typescript
// ✅ CORRETTO - separare state per campo
const [phone, setPhone] = useState('');
const [message, setMessage] = useState('');
const [loading, setLoading] = useState(false);
const [error, setError] = useState<string | null>(null);

// ❌ EVITARE - oggetto singolo
const [formData, setFormData] = useState({
  phone: '',
  message: '',
  loading: false,
  error: null,
}); // Complica updates
```

### 3.2 Array State (Multi-URL, Feedback Form)

```typescript
// ✅ CORRETTO - interface per entry
interface URLEntry {
  url: string;
  device?: 'ios' | 'android' | 'desktop';
  label?: string;
}

const [urls, setUrls] = useState<URLEntry[]>([
  { url: '', device: 'ios', label: '' }
]);

// Add entry
const addURL = () => {
  setUrls([...urls, { url: '', device: 'ios', label: '' }]);
};

// Remove entry
const removeURL = (index: number) => {
  setUrls(urls.filter((_, i) => i !== index));
};

// Update specific field (IMMUTABILE)
const updateURL = (index: number, field: keyof URLEntry, value: string) => {
  const newUrls = [...urls];
  newUrls[index] = { ...newUrls[index], [field]: value };
  setUrls(newUrls);
};
```

### 3.3 useEffect per API Calls

```typescript
// ✅ CORRETTO - fetch data on mount
useEffect(() => {
  const loadBanks = async () => {
    try {
      const response = await qrApi.getVietQRBanks();
      setBanks(response.banks || []);
    } catch (err) {
      console.error('Failed to load banks:', err);
      // Fallback data
      setBanks(FALLBACK_BANKS);
    }
  };
  loadBanks();
}, []); // Empty deps = run once

// ❌ EVITARE - fetch in render
export default function Page() {
  fetch('/api/data'); // SBAGLIATO - loop infinito!
}
```

---

## 4. ERROR HANDLING

### 4.1 Pattern Standard

```typescript
// ✅ CORRETTO - error state + user feedback
const [error, setError] = useState<string | null>(null);

try {
  const result = await qrApi.createSMS(data);
  setResult(result);
  setError(null); // Clear previous errors
} catch (err: any) {
  const errorMessage = err.message || 'Failed to create QR code';
  setError(errorMessage);
  console.error('QR creation error:', err);
}

// ❌ EVITARE - silent errors
try {
  const result = await qrApi.createSMS(data);
} catch (err) {
  // Niente... utente non sa che è fallito
}
```

### 4.2 Error Display UI

```tsx
{error && (
  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
    <div>
      <p className="text-red-800 font-medium text-sm">Error</p>
      <p className="text-red-600 text-sm">{error}</p>
    </div>
  </div>
)}
```

---

## 5. API CLIENT PATTERN

### 5.1 Struttura `/lib/api/qr.ts`

```typescript
const QR_API_URL = process.env.NEXT_PUBLIC_QR_ENGINE_URL || 'http://localhost:3001';

// Generic helper
async function apiCall<T>(
  endpoint: string,
  method: string = 'GET',
  data?: any
): Promise<T> {
  const url = `${QR_API_URL}${endpoint}`;
  const options: RequestInit = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  if (data && method !== 'GET') {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API Error: ${response.status}`);
  }

  return response.json();
}

// Interface per tipo
export interface SMSQRData {
  phone: string;
  message: string;
}

// Metodo API
export const qrApi = {
  createSMS: (data: SMSQRData) =>
    apiCall<QRResponse>('/api/qr/sms', 'POST', data),

  // ... altri 18 tipi
};
```

### 5.2 Aggiungere Nuovo Tipo

```typescript
// 1. Aggiungere interface
export interface NewTypeQRData {
  field1: string;
  field2?: string;
}

// 2. Aggiungere metodo in qrApi
export const qrApi = {
  // ... existing
  createNewType: (data: NewTypeQRData) =>
    apiCall<QRResponse>('/api/qr/new-type', 'POST', data),
};
```

---

## 6. FORM VALIDATION

### 6.1 Client-Side Validation OBBLIGATORIA

```typescript
// ✅ CORRETTO - validazione esplicita PRIMA di API call
const validateForm = (): string | null => {
  // Required fields
  if (!phone.trim()) {
    return 'Phone number is required';
  }

  // Format validation
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
  if (!/^\+?[\d]{10,15}$/.test(cleanPhone)) {
    return 'Please enter a valid phone number (10-15 digits)';
  }

  // Length validation
  if (message.length > 160) {
    return 'Message must be 160 characters or less';
  }

  return null; // No errors
};

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  const validationError = validateForm();
  if (validationError) {
    setError(validationError);
    return; // STOP - non chiamare API
  }

  // Procedi con API...
};
```

### 6.2 Esempi Validation Common

```typescript
// Email
const isValidEmail = (email: string): boolean => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

// URL
const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

// Phone (international)
const isValidPhone = (phone: string): boolean => {
  const clean = phone.replace(/[\s\-\(\)]/g, '');
  return /^\+?[\d]{10,15}$/.test(clean);
};
```

---

## 7. TESTING

### 7.1 E2E Tests con Playwright

**File:** `/tests/qr-forms.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test('SMS QR - Complete flow', async ({ page }) => {
  // 1. Navigate
  await page.goto('http://localhost:3000/qr/create/sms');

  // 2. Fill form
  await page.fill('input[placeholder*="phone"]', '+1234567890');
  await page.fill('textarea', 'Test message');

  // 3. Submit
  await page.click('button:has-text("Generate QR Code")');

  // 4. Wait for result
  await page.waitForSelector('img[alt*="QR"]', { timeout: 10000 });

  // 5. Verify
  await expect(page.locator('text=QR Code Generated!')).toBeVisible();
  await expect(page.locator('button:has-text("Download")')).toBeVisible();
});
```

### 7.2 Aggiungere Nuovo Test

```typescript
test('NewType QR - Complete flow', async ({ page }) => {
  await page.goto('http://localhost:3000/qr/create/new-type');

  // Fill specific fields
  await page.fill('input[name="field1"]', 'value1');

  // Submit
  await page.click('button:has-text("Generate QR Code")');

  // Verify
  await page.waitForSelector('img[alt*="QR"]');
  await expect(page.locator('text=QR Code Generated!')).toBeVisible();

  // Screenshot
  await page.screenshot({ path: 'test-results/new-type-result.png' });
});
```

---

## 8. CHECKLIST IMPLEMENTAZIONE

### 8.1 Per Nuove Pagine QR

**Prima di iniziare:**
- [ ] Leggere questo documento COMPLETAMENTE
- [ ] Leggere pagina di riferimento (`sms/page.tsx`)
- [ ] Identificare se form è semplice o complesso (array)

**Durante implementazione:**
- [ ] Creare interface in `/lib/api/qr.ts`
- [ ] Aggiungere metodo in `qrApi`
- [ ] Creare `/app/qr/create/{type}/page.tsx`
- [ ] Seguire ESATTAMENTE template Section 1
- [ ] Implementare validation client-side
- [ ] Testare form manualmente
- [ ] Aggiungere tipo a `/app/qr/page.tsx`
- [ ] Aggiungere E2E test in `/tests/qr-forms.spec.ts`

**Prima di commit:**
- [ ] Verificare TypeScript (no errori)
- [ ] Rimuovere console.log() di debug
- [ ] Testare responsive (mobile)
- [ ] Verificare error handling funziona
- [ ] Verificare success state mostra QR

---

## 9. ESEMPI CODICE COMPLETI

### 9.1 Form Field Component

```tsx
interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  icon?: React.ComponentType<any>;
}

export function FormInput({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  required = false,
  disabled = false,
  error,
  icon: Icon,
}: FormInputProps) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-gray-700">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        {Icon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Icon className="w-5 h-5 text-gray-400" />
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={`
            w-full px-4 py-3 border rounded-lg
            focus:outline-none focus:ring-2 focus:ring-black
            disabled:bg-gray-50 disabled:text-gray-500
            ${Icon ? 'pl-10' : ''}
            ${error ? 'border-red-300' : 'border-gray-300'}
          `}
        />
      </div>
      {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
    </div>
  );
}
```

### 9.2 Custom Hook per QR Mutations

```typescript
import { useState } from 'react';
import { QRResponse } from '@/lib/api/qr';

export function useQRMutation<T>(
  mutationFn: (data: T) => Promise<QRResponse>
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<QRResponse | null>(null);

  const mutate = async (input: T) => {
    setLoading(true);
    setError(null);

    try {
      const result = await mutationFn(input);
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to create QR code');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setData(null);
    setError(null);
  };

  return { mutate, reset, loading, error, data };
}

// Usage
const { mutate, loading, error, data } = useQRMutation(qrApi.createSMS);
```

---

## 10. ANTI-PATTERNS DA EVITARE

### ❌ 1. Non Usare `any`

```typescript
// ❌ SBAGLIATO
const handleSubmit = (data: any) => { };

// ✅ CORRETTO
interface FormData { phone: string; }
const handleSubmit = (data: FormData) => { };
```

### ❌ 2. Non Ignorare Errori

```typescript
// ❌ SBAGLIATO
try {
  await api.call();
} catch (e) {
  // Silent
}

// ✅ CORRETTO
try {
  await api.call();
} catch (err: any) {
  setError(err.message);
  console.error('API error:', err);
}
```

### ❌ 3. Non Mutare State Direttamente

```typescript
// ❌ SBAGLIATO
urls[0] = newUrl;
setUrls(urls);

// ✅ CORRETTO
const newUrls = [...urls];
newUrls[0] = newUrl;
setUrls(newUrls);
```

### ❌ 4. Non API Calls in Render

```typescript
// ❌ SBAGLIATO
export default function Page() {
  fetch('/api/data'); // Loop infinito!
}

// ✅ CORRETTO
export default function Page() {
  useEffect(() => {
    fetch('/api/data');
  }, []);
}
```

### ❌ 5. Non Duplicare Codice

```typescript
// ❌ SBAGLIATO - stesso codice in 3 posti
<div className="p-4 bg-red-50">Error: {error1}</div>
<div className="p-4 bg-red-50">Error: {error2}</div>
<div className="p-4 bg-red-50">Error: {error3}</div>

// ✅ CORRETTO - componente riusabile
<ErrorAlert message={error1} />
<ErrorAlert message={error2} />
<ErrorAlert message={error3} />
```

---

## 11. TROUBLESHOOTING

### Problema: "Module not found"

**Causa:** Path alias non configurato

**Fix:** Verifica `tsconfig.json`:
```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./*"]
    }
  }
}
```

### Problema: TypeScript Errors con API

**Causa:** Interface non matcha backend

**Fix:** Ispeziona response e aggiorna interface:
```typescript
console.log('Backend response:', response);

export interface QRResponse {
  id: string;
  qr_image: string;
  short_url?: string; // Opzionale se backend non sempre ritorna
}
```

### Problema: Tailwind Classes Non Funzionano

**Causa:** Classe dinamica non in allowlist

**Fix:**
```typescript
// ❌ SBAGLIATO
<div className={`text-${color}-600`}> // Non funziona!

// ✅ CORRETTO
<div className={color === 'red' ? 'text-red-600' : 'text-blue-600'}>
```

---

## 12. RISORSE RAPIDE

### File di Riferimento

**Forms:**
- Semplice: `/app/qr/create/sms/page.tsx`
- Con array: `/app/qr/create/multi-url/page.tsx`
- Con nested objects: `/app/qr/create/feedback-form/page.tsx`
- Con useEffect: `/app/qr/create/vietqr/page.tsx`

**API:**
- Client completo: `/lib/api/qr.ts`

**Tests:**
- E2E: `/tests/qr-forms.spec.ts`

### Pattern Quick Reference

**useState:**
```typescript
const [value, setValue] = useState<Type>(initialValue);
```

**useEffect (mount only):**
```typescript
useEffect(() => { /* code */ }, []);
```

**Array update:**
```typescript
setArray([...array, newItem]);
setArray(array.filter((_, i) => i !== index));
```

**Object update:**
```typescript
setObject({ ...object, field: newValue });
```

---

## RIEPILOGO

### ✅ SEMPRE

1. Seguire template Section 1 ESATTAMENTE
2. TypeScript strict (no `any`)
3. Validazione client-side PRIMA di API
4. Error handling con user feedback
5. Loading states durante API calls
6. Success state con QR preview + download
7. Reset functionality
8. Two-column layout (form | preview)
9. Responsive design (mobile-first)
10. Testare manualmente prima di commit

### ❌ MAI

1. Usare `any` type
2. Ignorare errori silenziosamente
3. Mutare state direttamente
4. API calls in render
5. Duplicare codice
6. Dimenticare validazione
7. Inline styles (usare Tailwind)
8. Deviare dal pattern standard

### 🎯 Obiettivo

**Consistency First** - Se 19 form seguono lo stesso pattern, il 20° DEVE fare lo stesso.

---

**Creato:** 4 Novembre 2025
**Versione:** 1.0
**Prossima Revisione:** Dopo refactoring con `<QRFormLayout>` component
