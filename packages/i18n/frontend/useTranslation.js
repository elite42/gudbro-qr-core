import { useState, useEffect } from 'react';

const SUPPORTED_LANGUAGES = ['vn', 'ko', 'cn', 'en'];

export function useTranslation() {
  const [language, setLanguage] = useState('en');
  const [translations, setTranslations] = useState({});

  useEffect(() => {
    const cookieLang = document.cookie
      .split('; ')
      .find(row => row.startsWith('lang='))
      ?.split('=')[1];

    const browserLang = navigator.language.split('-')[0];
    
    const detectedLang = cookieLang || 
      (SUPPORTED_LANGUAGES.includes(browserLang) ? browserLang : 'en');

    setLanguage(detectedLang);
    loadTranslations(detectedLang);
  }, []);

  const loadTranslations = async (lang) => {
    try {
      const response = await fetch(`/api/i18n/${lang}`);
      const data = await response.json();
      setTranslations(data);
    } catch (error) {
      console.error('Failed to load translations:', error);
    }
  };

  const changeLanguage = (newLang) => {
    if (!SUPPORTED_LANGUAGES.includes(newLang)) return;
    
    setLanguage(newLang);
    loadTranslations(newLang);
    
    document.cookie = `lang=${newLang}; max-age=31536000; path=/`;
  };

  const t = (key, params = {}) => {
    const keys = key.split('.');
    let value = translations;

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        break;
      }
    }

    if (!value) return key;

    if (typeof value === 'string' && Object.keys(params).length > 0) {
      Object.keys(params).forEach(param => {
        value = value.replace(new RegExp(`{{${param}}}`, 'g'), params[param]);
      });
    }

    return value;
  };

  return { t, language, changeLanguage };
}
