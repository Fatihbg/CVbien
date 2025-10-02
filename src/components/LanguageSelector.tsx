import React from 'react';
import { useTranslation } from '../hooks/useTranslation';

interface LanguageSelectorProps {
  compact?: boolean;
  style?: React.CSSProperties;
}

/**
 * Composant de sélection de langue
 */
export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ compact = false, style }) => {
  const { language, changeLanguage } = useTranslation();

  const handleLanguageChange = (newLang: string) => {
    changeLanguage(newLang);
  };

  if (compact) {
    return (
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '8px 12px',
          background: 'rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(20px)',
          borderRadius: '12px',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          transition: 'all 0.3s ease',
          ...style
        }}
        onClick={() => handleLanguageChange(language === 'fr' ? 'en' : 'fr')}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
        }}
      >
        <div style={{
          width: '16px',
          height: '16px',
          borderRadius: '50%',
          background: language === 'fr' ? '#3b82f6' : '#10b981',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '10px',
          fontWeight: 'bold',
          color: 'white'
        }}>
          {language === 'fr' ? 'FR' : 'EN'}
        </div>
        <span style={{ 
          fontSize: '12px', 
          color: 'var(--text-secondary)', 
          fontWeight: '500' 
        }}>
          {language === 'fr' ? 'Français' : 'English'}
        </span>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '8px 16px',
      background: 'rgba(255, 255, 255, 0.1)',
      backdropFilter: 'blur(20px)',
      borderRadius: '16px',
      border: '1px solid rgba(255, 255, 255, 0.2)',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      ...style
    }}
    onClick={() => handleLanguageChange(language === 'fr' ? 'en' : 'fr')}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
    }}
    >
      <div style={{
        width: '20px',
        height: '20px',
        borderRadius: '50%',
        background: language === 'fr' ? '#3b82f6' : '#10b981',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '12px',
        fontWeight: 'bold',
        color: 'white'
      }}>
        {language === 'fr' ? 'FR' : 'EN'}
      </div>
      <span style={{ 
        fontSize: '14px', 
        color: 'var(--text-secondary)', 
        fontWeight: '500' 
      }}>
        {language === 'fr' ? 'Français' : 'English'}
      </span>
      <div style={{
        fontSize: '12px',
        color: 'var(--text-secondary)',
        opacity: 0.7
      }}>
        {language === 'fr' ? '→ EN' : '→ FR'}
      </div>
    </div>
  );
};
