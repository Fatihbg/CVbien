import React from 'react';

interface CVDisplayProps {
  cvText: string;
}

export const CVDisplay: React.FC<CVDisplayProps> = ({ cvText }) => {
  // Parser le CV de manière simple et directe
  const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
  
  // Fonction pour formater le texte avec les balises <B> et supprimer TOUS les **
  const formatText = (text: string) => {
    // Supprimer TOUS les ** du texte (plusieurs méthodes pour être sûr)
    let cleanText = text
      .replace(/\*\*/g, '') // Supprime **
      .replace(/\*([^*]+)\*/g, '$1') // Supprime *texte*
      .replace(/\*([^*]*)\*/g, '$1') // Supprime *texte* même vide
      .replace(/\*+/g, '') // Supprime toute séquence de *
      .trim();
    
    return cleanText.split('<B>').map((part, index) => {
      if (index === 0) return part;
      const [boldText, rest] = part.split('</B>');
      return (
        <React.Fragment key={index}>
          <strong>{boldText}</strong>
          {rest}
        </React.Fragment>
      );
    });
  };

  // Fonction pour détecter les phrases de conclusion à supprimer
  const isConclusionPhrase = (line: string) => {
    const conclusionKeywords = [
      'merci', 'thank you', 'cordialement', 'sincerely', 'salutations', 'regards',
      'résultat', 'result', 'conclusion', 'en résumé', 'in summary', 'finalement',
      'pour finir', 'to conclude', 'ainsi', 'therefore', 'par conséquent', 'consequently',
      'n\'hésitez pas', 'don\'t hesitate', 'contactez-moi', 'contact me'
    ];
    
    const lowerLine = line.toLowerCase();
    return conclusionKeywords.some(keyword => lowerLine.includes(keyword));
  };

  // Fonction pour détecter si une ligne est un titre de section
  const isSectionTitle = (line: string) => {
    return line === 'PROFESSIONAL SUMMARY' || 
           line === 'EDUCATION' || 
           line === 'PROFESSIONAL EXPERIENCE' || 
           line === 'TECHNICAL SKILLS' || 
           line === 'CERTIFICATIONS & ACHIEVEMENTS' ||
           line === 'EXPERIENCE PROFESSIONNELLE' ||
           line === 'FORMATION' ||
           line === 'COMPETENCES' ||
           line === 'COMPÉTENCES';
  };

  return (
    <div style={{
      // Format A4 professionnel pour l'aperçu
      width: '100%',
      maxWidth: '600px',
      margin: '0 auto',
      backgroundColor: 'white',
      padding: '24px',
      fontFamily: 'Times New Roman, serif',
      fontSize: '11px',
      lineHeight: '1.4',
      color: '#2c3e50',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      border: '1px solid #e1e8ed',
      borderRadius: '12px',
      overflow: 'auto',
      maxHeight: '500px',
      position: 'relative'
    }}>
      {lines.map((line, index) => {
        // Ignorer les lignes vides
        if (!line || line.length === 0) return null;
        
        // Ignorer les phrases de conclusion
        if (isConclusionPhrase(line)) return null;
        
        // Header (nom en majuscules) - première ligne qui est un nom
        if (index === 0 && line.length > 3 && line.length < 50 && line === line.toUpperCase() && !line.includes('@') && !isSectionTitle(line)) {
          return (
            <div key={index} style={{
              textAlign: 'center',
              fontSize: '20px',
              fontWeight: 'bold',
              color: '#1a365d',
              marginBottom: '12px',
              letterSpacing: '1.2px',
              borderBottom: '2px solid #667eea',
              paddingBottom: '8px',
              position: 'relative'
            }}>
              {line}
            </div>
          );
        }
        
        // Contact (email, téléphone, etc.)
        if (line.includes('@') || line.includes('|') || line.includes('LinkedIn') || line.includes('http')) {
          return (
            <div key={index} style={{
              textAlign: 'center',
              fontSize: '11px',
              color: '#4a5568',
              marginBottom: '6px',
              fontWeight: '500'
            }}>
              {formatText(line)}
            </div>
          );
        }
        
        // Titre professionnel (ligne après le nom, pas une section)
        if (index === 1 && !line.includes('@') && !isSectionTitle(line) && !line.includes('PROFESSIONAL') && !line.includes('EXPERIENCE')) {
          return (
            <div key={index} style={{
              textAlign: 'center',
              fontSize: '15px',
              fontWeight: '600',
              color: '#2d3748',
              marginBottom: '16px',
              fontStyle: 'italic',
              letterSpacing: '0.5px'
            }}>
              {formatText(line)}
            </div>
          );
        }
        
        // Sections principales (en majuscules) - AFFICHER UNE LIGNE DE SÉPARATION
        if (isSectionTitle(line)) {
          return (
            <div key={index} style={{
              marginTop: '16px',
              marginBottom: '8px',
              borderTop: '1px solid #e2e8f0',
              paddingTop: '8px',
              position: 'relative'
            }}>
              <div style={{
                fontSize: '12px',
                fontWeight: 'bold',
                color: '#1a365d',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: '8px'
              }}>
                {line}
              </div>
            </div>
          );
        }
        
        // Contenu des sections
        if (line.length > 0) {
          // Puces
          if (line.startsWith('•') || line.startsWith('-')) {
            return (
              <div key={index} style={{
                fontSize: '11px',
                marginLeft: '16px',
                marginBottom: '4px',
                color: '#2d3748',
                lineHeight: '1.5',
                position: 'relative'
              }}>
                <span style={{
                  position: 'absolute',
                  left: '-12px',
                  color: '#667eea',
                  fontWeight: 'bold'
                }}>•</span>
                {formatText(line)}
              </div>
            );
          }
          
          // Texte normal
          return (
            <div key={index} style={{
              fontSize: '11px',
              marginBottom: '4px',
              color: '#2d3748',
              lineHeight: '1.5'
            }}>
              {formatText(line)}
            </div>
          );
        }
        
        return null;
      })}
    </div>
  );
};
