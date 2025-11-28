import React from 'react';
import { INTOLERANCES } from '../../backend/utils/healthFilters';

/**
 * IntoleranceFilter Component
 * Layer 2: 10 Intolerances (Health & Comfort)
 * Critical for Asia tourism (87.8% lactose intolerance)
 */
const IntoleranceFilter = ({ 
  selectedIntolerances = [], 
  onChange, 
  language = 'en',
  showSeverity = true,
  showPrevalence = false 
}) => {
  const handleToggle = (intoleranceId) => {
    const newSelected = selectedIntolerances.includes(intoleranceId)
      ? selectedIntolerances.filter(id => id !== intoleranceId)
      : [...selectedIntolerances, intoleranceId];
    
    onChange(newSelected);
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return '#f44336';
      case 'medium': return '#ff9800';
      case 'low': return '#ffc107';
      default: return '#9e9e9e';
    }
  };

  return (
    <div className="intolerance-filter">
      <h3 className="filter-title">
        {language === 'vn' && 'Không dung nạp'}
        {language === 'ko' && '불내증'}
        {language === 'cn' && '不耐受'}
        {language === 'en' && 'Intolerances'}
        <span className="filter-count">({selectedIntolerances.length}/10)</span>
      </h3>
      
      <div className="filter-grid">
        {INTOLERANCES.map(intolerance => {
          const isSelected = selectedIntolerances.includes(intolerance.id);
          
          return (
            <button
              key={intolerance.id}
              className={`filter-button ${isSelected ? 'selected' : ''}`}
              onClick={() => handleToggle(intolerance.id)}
              title={intolerance.label[language]}
              style={{
                borderColor: isSelected ? getSeverityColor(intolerance.severity) : '#ddd',
                backgroundColor: isSelected ? `${getSeverityColor(intolerance.severity)}20` : 'white'
              }}
            >
              <span className="filter-icon">{intolerance.icon}</span>
              <span className="filter-label">{intolerance.label[language]}</span>
              
              {showSeverity && (
                <span 
                  className="severity-badge"
                  style={{ 
                    backgroundColor: getSeverityColor(intolerance.severity),
                    color: 'white',
                    fontSize: '10px',
                    padding: '2px 6px',
                    borderRadius: '3px',
                    marginTop: '4px'
                  }}
                >
                  {intolerance.severity}
                </span>
              )}
              
              {showPrevalence && (
                <span className="prevalence-text" style={{ fontSize: '11px', color: '#666' }}>
                  {intolerance.prevalence}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {selectedIntolerances.length > 0 && (
        <button 
          className="clear-button"
          onClick={() => onChange([])}
          style={{
            marginTop: '12px',
            padding: '8px 16px',
            border: '1px solid #ddd',
            borderRadius: '4px',
            background: 'white',
            cursor: 'pointer'
          }}
        >
          {language === 'vn' && 'Xóa tất cả'}
          {language === 'ko' && '모두 지우기'}
          {language === 'cn' && '清除全部'}
          {language === 'en' && 'Clear All'}
        </button>
      )}

      <style jsx>{`
        .intolerance-filter {
          margin: 20px 0;
        }

        .filter-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .filter-count {
          font-size: 14px;
          color: #666;
          font-weight: 400;
        }

        .filter-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
          gap: 12px;
        }

        .filter-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 12px 8px;
          border: 2px solid #ddd;
          border-radius: 8px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
          min-height: 80px;
        }

        .filter-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .filter-button.selected {
          font-weight: 600;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .filter-icon {
          font-size: 28px;
          margin-bottom: 6px;
        }

        .filter-label {
          font-size: 13px;
          text-align: center;
          line-height: 1.2;
        }

        .clear-button:hover {
          background: #f5f5f5;
        }
      `}</style>
    </div>
  );
};

export default IntoleranceFilter;
