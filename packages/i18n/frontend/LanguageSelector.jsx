import React from 'react';
import { useTranslation } from './useTranslation';

const LANGUAGES = [
  { code: 'vn', name: 'Tiếng Việt', flag: '🇻🇳' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' },
  { code: 'cn', name: '中文', flag: '🇨🇳' },
  { code: 'en', name: 'English', flag: '🇺🇸' }
];

export default function LanguageSelector({ className = '' }) {
  const { language, changeLanguage, t } = useTranslation();

  return (
    <div className={`language-selector ${className}`}>
      <label className="language-label">
        {t('language.label')}
      </label>
      <select 
        value={language} 
        onChange={(e) => changeLanguage(e.target.value)}
        className="language-dropdown"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>
            {lang.flag} {lang.name}
          </option>
        ))}
      </select>

      <style jsx>{`
        .language-selector {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .language-label {
          font-size: 14px;
          color: #666;
        }

        .language-dropdown {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .language-dropdown:hover {
          border-color: #999;
        }

        .language-dropdown:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
