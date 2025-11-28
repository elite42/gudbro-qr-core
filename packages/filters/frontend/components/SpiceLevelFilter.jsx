import React from 'react';
import { SPICE_LEVELS } from '../../backend/utils/healthFilters';

/**
 * SpiceLevelFilter Component
 * Layer 4: Spice Level (Comfort - Critical for Vietnamese cuisine)
 * Shows items up to selected maximum spice level
 */
const SpiceLevelFilter = ({ 
  maxSpiceLevel = null, 
  onChange, 
  language = 'en' 
}) => {
  const handleSelect = (spiceLevelId) => {
    // Toggle: if same level clicked, clear filter
    onChange(maxSpiceLevel === spiceLevelId ? null : spiceLevelId);
  };

  return (
    <div className="spice-level-filter">
      <h3 className="filter-title">
        {language === 'vn' && 'Mức độ cay tối đa'}
        {language === 'ko' && '최대 매운맛'}
        {language === 'cn' && '最大辣度'}
        {language === 'en' && 'Maximum Spice Level'}
      </h3>
      
      <p className="filter-description">
        {language === 'vn' && 'Chọn mức độ cay tối đa bạn có thể chịu được'}
        {language === 'ko' && '견딜 수 있는 최대 매운맛을 선택하세요'}
        {language === 'cn' && '选择您能承受的最大辣度'}
        {language === 'en' && 'Select maximum spice level you can handle'}
      </p>

      <div className="spice-level-grid">
        {SPICE_LEVELS.map(level => {
          const isSelected = maxSpiceLevel === level.id;
          const isIncluded = maxSpiceLevel && level.level <= (SPICE_LEVELS.find(s => s.id === maxSpiceLevel)?.level || 0);
          
          return (
            <button
              key={level.id}
              className={`spice-button ${isSelected ? 'selected' : ''} ${isIncluded && !isSelected ? 'included' : ''}`}
              onClick={() => handleSelect(level.id)}
              title={level.label[language]}
              style={{
                borderColor: isSelected ? level.color : (isIncluded ? `${level.color}80` : '#ddd'),
                backgroundColor: isSelected ? `${level.color}30` : (isIncluded ? `${level.color}10` : 'white'),
                opacity: isIncluded || !maxSpiceLevel ? 1 : 0.5
              }}
            >
              <span className="spice-icon" style={{ fontSize: '32px' }}>{level.icon}</span>
              <span className="spice-label" style={{ fontWeight: isSelected ? '600' : '400' }}>
                {level.label[language]}
              </span>
              <div 
                className="spice-bar"
                style={{
                  width: '100%',
                  height: '4px',
                  background: `linear-gradient(to right, ${level.color} ${level.level * 25}%, #eee ${level.level * 25}%)`,
                  borderRadius: '2px',
                  marginTop: '8px'
                }}
              />
            </button>
          );
        })}
      </div>

      {maxSpiceLevel && (
        <div className="selection-info" style={{ marginTop: '12px', padding: '12px', background: '#f5f5f5', borderRadius: '6px' }}>
          <p style={{ margin: 0, fontSize: '14px', color: '#666' }}>
            {language === 'vn' && `Hiển thị các món từ Không cay đến ${SPICE_LEVELS.find(s => s.id === maxSpiceLevel)?.label[language]}`}
            {language === 'ko' && `안 매움부터 ${SPICE_LEVELS.find(s => s.id === maxSpiceLevel)?.label[language]}까지 표시`}
            {language === 'cn' && `显示从不辣到${SPICE_LEVELS.find(s => s.id === maxSpiceLevel)?.label[language]}的菜品`}
            {language === 'en' && `Showing dishes from No Spice to ${SPICE_LEVELS.find(s => s.id === maxSpiceLevel)?.label[language]}`}
          </p>
          <button 
            className="clear-button"
            onClick={() => onChange(null)}
            style={{
              marginTop: '8px',
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '4px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '13px'
            }}
          >
            {language === 'vn' && 'Xóa bộ lọc'}
            {language === 'ko' && '필터 지우기'}
            {language === 'cn' && '清除过滤器'}
            {language === 'en' && 'Clear Filter'}
          </button>
        </div>
      )}

      <style jsx>{`
        .spice-level-filter {
          margin: 20px 0;
        }

        .filter-title {
          font-size: 18px;
          font-weight: 600;
          margin-bottom: 8px;
        }

        .filter-description {
          font-size: 13px;
          color: #666;
          margin-bottom: 16px;
        }

        .spice-level-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
          gap: 12px;
        }

        .spice-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 16px 12px;
          border: 2px solid #ddd;
          border-radius: 12px;
          background: white;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .spice-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        .spice-button.selected {
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
          transform: scale(1.05);
        }

        .spice-button.included {
          border-style: dashed;
        }

        .spice-label {
          font-size: 12px;
          text-align: center;
          margin-top: 6px;
        }

        .clear-button:hover {
          background: #fafafa;
          border-color: #999;
        }
      `}</style>
    </div>
  );
};

export default SpiceLevelFilter;
