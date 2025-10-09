import React from 'react';
import { PDFGenerator } from '../../services/pdfGenerator';

interface CVDisplayProps {
  cvText: string;
}

export const CVDisplay: React.FC<CVDisplayProps> = ({ cvText }) => {
  // Utiliser le même parsing que le PDF pour garantir la cohérence
  const parsedCV = PDFGenerator.parseCVManually(cvText);
  
  // Parser le CV de manière simple et directe (fallback)
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
      'n\'hésitez pas', 'don\'t hesitate', 'contactez-moi', 'contact me',
      'ce cv est optimisé', 'this cv is optimized', 'optimisé pour tenir', 'optimized to fit',
      'reflète mes compétences', 'reflects my skills', 'pertinentes pour le poste', 'relevant for the position',
      'chez sopra steria', 'at sopra steria', 'sopra steria', 'compétences et expériences', 'skills and experiences'
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

  // Utiliser les données parsées pour l'affichage
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
      {/* Header - Nom */}
      <div style={{
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
        {parsedCV.name}
      </div>

      {/* Contact */}
      <div style={{
        textAlign: 'center',
        fontSize: '11px',
        color: '#4a5568',
        marginBottom: '6px',
        fontWeight: '500'
      }}>
        {formatText(parsedCV.contact)}
      </div>

      {/* Titre professionnel */}
      <div style={{
        textAlign: 'center',
        fontSize: '15px',
        fontWeight: '600',
        color: '#2d3748',
        marginBottom: '16px',
        fontStyle: 'italic',
        letterSpacing: '0.5px'
      }}>
        {formatText(parsedCV.title)}
      </div>

      {/* Résumé */}
      {parsedCV.summary && (
        <div style={{
          marginBottom: '16px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '8px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#1a365d',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            PROFESSIONAL SUMMARY
          </div>
          <div style={{
            fontSize: '11px',
            color: '#2d3748',
            lineHeight: '1.5'
          }}>
            {formatText(parsedCV.summary)}
          </div>
        </div>
      )}

      {/* Expériences */}
      {parsedCV.experience && parsedCV.experience.length > 0 && (
        <div style={{
          marginBottom: '16px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '8px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#1a365d',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            PROFESSIONAL EXPERIENCE
          </div>
          {parsedCV.experience.map((exp, index) => (
            <div key={index} style={{ marginBottom: '12px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '4px'
              }}>
                {exp.company} - {exp.position} ({exp.period})
              </div>
              {exp.description && exp.description.map((desc, descIndex) => (
                <div key={descIndex} style={{
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
                  {formatText(desc)}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Formation */}
      {parsedCV.education && parsedCV.education.length > 0 && (
        <div style={{
          marginBottom: '16px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '8px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#1a365d',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            EDUCATION
          </div>
          {parsedCV.education.map((edu, index) => (
            <div key={index} style={{ marginBottom: '8px' }}>
              <div style={{
                fontSize: '11px',
                fontWeight: 'bold',
                color: '#2d3748',
                marginBottom: '4px'
              }}>
                {edu.institution} - {edu.degree} ({edu.period})
              </div>
              {edu.description && (
                <div style={{
                  fontSize: '11px',
                  color: '#2d3748',
                  lineHeight: '1.5'
                }}>
                  {formatText(edu.description)}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Compétences techniques */}
      {parsedCV.technicalSkills && (
        <div style={{
          marginBottom: '16px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '8px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#1a365d',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            TECHNICAL SKILLS
          </div>
          <div style={{
            fontSize: '11px',
            color: '#2d3748',
            lineHeight: '1.5'
          }}>
            {formatText(parsedCV.technicalSkills)}
          </div>
        </div>
      )}

      {/* Soft skills */}
      {parsedCV.softSkills && (
        <div style={{
          marginBottom: '16px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '8px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#1a365d',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            SOFT SKILLS
          </div>
          <div style={{
            fontSize: '11px',
            color: '#2d3748',
            lineHeight: '1.5'
          }}>
            {formatText(parsedCV.softSkills)}
          </div>
        </div>
      )}

      {/* Certifications */}
      {parsedCV.certifications && parsedCV.certifications.length > 0 && (
        <div style={{
          marginBottom: '16px',
          borderTop: '1px solid #e2e8f0',
          paddingTop: '8px'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 'bold',
            color: '#1a365d',
            textTransform: 'uppercase',
            letterSpacing: '1px',
            marginBottom: '8px'
          }}>
            CERTIFICATIONS & ACHIEVEMENTS
          </div>
          <div style={{
            fontSize: '11px',
            color: '#2d3748',
            lineHeight: '1.5'
          }}>
            {parsedCV.certifications.map((cert, index) => (
              <div key={index} style={{ marginBottom: '4px' }}>
                <strong>{formatText(cert)}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
