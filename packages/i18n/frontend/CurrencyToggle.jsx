import React, { useState, useEffect } from 'react';

const CURRENCIES = [
  { code: 'VND', symbol: '₫', name: 'Vietnamese Dong' },
  { code: 'KRW', symbol: '₩', name: 'Korean Won' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' }
];

export default function CurrencyToggle({ className = '' }) {
  const [currency, setCurrency] = useState('VND');
  const [rates, setRates] = useState({});

  useEffect(() => {
    const saved = localStorage.getItem('currency');
    if (saved) setCurrency(saved);
    fetchRates();
  }, []);

  const fetchRates = async () => {
    try {
      const response = await fetch('/api/currency/rates');
      const data = await response.json();
      setRates(data.rates);
    } catch (error) {
      console.error('Failed to fetch rates:', error);
    }
  };

  const handleChange = (newCurrency) => {
    setCurrency(newCurrency);
    localStorage.setItem('currency', newCurrency);
    
    window.dispatchEvent(new CustomEvent('currencyChange', { 
      detail: { currency: newCurrency, rates } 
    }));
  };

  return (
    <div className={`currency-toggle ${className}`}>
      <label className="currency-label">Currency</label>
      <select 
        value={currency} 
        onChange={(e) => handleChange(e.target.value)}
        className="currency-dropdown"
      >
        {CURRENCIES.map(curr => (
          <option key={curr.code} value={curr.code}>
            {curr.symbol} {curr.code}
          </option>
        ))}
      </select>

      <style jsx>{`
        .currency-toggle {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .currency-label {
          font-size: 14px;
          color: #666;
        }

        .currency-dropdown {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          font-size: 14px;
          cursor: pointer;
          transition: border-color 0.2s;
        }

        .currency-dropdown:hover {
          border-color: #999;
        }

        .currency-dropdown:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
