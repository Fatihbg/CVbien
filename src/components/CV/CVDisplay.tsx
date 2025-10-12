import React from 'react';
import { PDFGenerator } from '../../services/pdfGenerator';

interface CVDisplayProps {
  cvText: string;
  onDataParsed?: (parsedData: any) => void; // Callback pour exposer les données parsées
}

export const CVDisplay: React.FC<CVDisplayProps> = ({ cvText, onDataParsed }) => {
  // Parser le CV de manière simple et directe
  const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
  
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
  
  // Parser les données pour les exposer au PDF
  const parsedData = React.useMemo(() => {
    // Parser les données de manière structurée
    const name = lines.find(line => line.length > 3 && line.length < 50 && line === line.toUpperCase() && !line.includes('@') && !isSectionTitle(line)) || 'Nom Prénom';
    const contact = lines.find(line => line.includes('@') || line.match(/[\+]?[0-9\s\-\(\)]{10,}/)) || 'Contact';
    const contactIndex = lines.findIndex(line => line.includes('@') || line.match(/[\+]?[0-9\s\-\(\)]{10,}/));
    const title = contactIndex >= 0 && contactIndex + 1 < lines.length ? lines[contactIndex + 1] : 'Titre Professionnel';
    const summary = lines.find(line => line.length > 50 && line.length < 300 && 
      !line.includes('EXPERIENCE') && !line.includes('FORMATION') && 
      !line.includes('SKILLS') && !line.includes('CERTIFICATIONS')) || 'Résumé professionnel';
    
    // Parser les expériences
    const experience: Array<{company: string; position: string; period: string; description: string[]}> = [];
    const education: Array<{institution: string; degree: string; period: string; description: string}> = [];
    
    let currentSection = '';
    let currentExperience: any = null;
    let currentEducation: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Détecter les sections
      if (line.includes('EXPERIENCE') || line.includes('EXPÉRIENCE') || line.includes('EXPERIENCES') || line.includes('PROFESSIONAL EXPERIENCE')) {
        currentSection = 'experience';
        continue;
      }
      if (line.includes('EDUCATION') || line.includes('FORMATION') || line.includes('FORMATIONS') || line.includes('ACADEMIC BACKGROUND') || line.includes('ÉTUDES')) {
        currentSection = 'education';
        continue;
      }
      
      // Parser les expériences
      if (currentSection === 'experience') {
        if (line.includes('-') && line.includes('(') && line.includes(')')) {
          if (currentExperience) {
            experience.push(currentExperience);
          }
          const parts = line.split(' - ');
          if (parts.length >= 2) {
            const company = parts[0];
            const positionPeriod = parts[1];
            const periodMatch = positionPeriod.match(/\(([^)]+)\)/);
            const period = periodMatch ? periodMatch[1] : '';
            const position = positionPeriod.replace(/\([^)]+\)/, '').trim();
            
            currentExperience = {
              company,
              position,
              period,
              description: []
            };
          }
        }
        else if (line.includes(',') && line.includes('(') && line.includes(')')) {
          if (currentExperience) {
            experience.push(currentExperience);
          }
          const parts = line.split(',');
          if (parts.length >= 2) {
            const company = parts[0];
            const positionPeriod = parts.slice(1).join(',').trim();
            const periodMatch = positionPeriod.match(/\(([^)]+)\)/);
            const period = periodMatch ? periodMatch[1] : '';
            const position = positionPeriod.replace(/\([^)]+\)/, '').trim();
            
            currentExperience = {
              company,
              position,
              period,
              description: []
            };
          }
        }
        else if (currentExperience && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
          currentExperience.description.push(line.replace(/^[•\-*]\s*/, '').trim());
        }
        else if (currentExperience && line.length > 10 && !line.includes('(') && !line.includes('-')) {
          currentExperience.description.push(line.trim());
        }
      }
      
      // Parser les formations
      if (currentSection === 'education') {
        if (line.includes('-') && line.includes('(') && line.includes(')')) {
          if (currentEducation) {
            education.push(currentEducation);
          }
          const parts = line.split(' - ');
          if (parts.length >= 2) {
            const institution = parts[0];
            const degreePeriod = parts[1];
            const periodMatch = degreePeriod.match(/\(([^)]+)\)/);
            const period = periodMatch ? periodMatch[1] : '';
            const degree = degreePeriod.replace(/\([^)]+\)/, '').trim();
            
            currentEducation = {
              institution,
              degree,
              period,
              description: ''
            };
          }
        }
        else if (line.includes(',') && line.includes('(') && line.includes(')')) {
          if (currentEducation) {
            education.push(currentEducation);
          }
          const parts = line.split(',');
          if (parts.length >= 2) {
            const institution = parts[0];
            const degreePeriod = parts.slice(1).join(',').trim();
            const periodMatch = degreePeriod.match(/\(([^)]+)\)/);
            const period = periodMatch ? periodMatch[1] : '';
            const degree = degreePeriod.replace(/\([^)]+\)/, '').trim();
            
            currentEducation = {
              institution,
              degree,
              period,
              description: ''
            };
          }
        }
        else if (currentEducation && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
          if (currentEducation.description) {
            currentEducation.description += ' ' + line.replace(/^[•\-*]\s*/, '').trim();
          } else {
            currentEducation.description = line.replace(/^[•\-*]\s*/, '').trim();
          }
        }
        else if (currentEducation && line.length > 10 && !line.includes('(') && !line.includes('-')) {
          if (currentEducation.description) {
            currentEducation.description += ' ' + line.trim();
          } else {
            currentEducation.description = line.trim();
          }
        }
      }
    }
    
    if (currentExperience) experience.push(currentExperience);
    if (currentEducation) education.push(currentEducation);
    
    // Parser les compétences techniques
    let technicalSkills = '';
    const technicalSkillsPatterns = [
      /Compétences techniques\s*:?\s*([^•\n]+)/i,
      /Technical skills\s*:?\s*([^•\n]+)/i,
      /Compétences\s*:?\s*([^•\n]+)/i,
      /Skills\s*:?\s*([^•\n]+)/i,
      /Technologies\s*:?\s*([^•\n]+)/i,
      /Programming languages\s*:?\s*([^•\n]+)/i,
      /Langages de programmation\s*:?\s*([^•\n]+)/i,
      /Outils\s*:?\s*([^•\n]+)/i,
      /Tools\s*:?\s*([^•\n]+)/i
    ];
    
    for (const pattern of technicalSkillsPatterns) {
      const skillsMatch = cvText.match(pattern);
      if (skillsMatch && skillsMatch[1].trim()) {
        technicalSkills = skillsMatch[1].trim();
        break;
      }
    }
    
    // Parser les soft skills
    let softSkills = '';
    const softSkillsPatterns = [
      /Soft skills\s*:?\s*([^•\n]+)/i,
      /Compétences relationnelles\s*:?\s*([^•\n]+)/i,
      /Compétences comportementales\s*:?\s*([^•\n]+)/i,
      /Aptitudes\s*:?\s*([^•\n]+)/i,
      /Qualités\s*:?\s*([^•\n]+)/i,
      /Interpersonal skills\s*:?\s*([^•\n]+)/i,
      /Personal skills\s*:?\s*([^•\n]+)/i
    ];
    
    for (const pattern of softSkillsPatterns) {
      const softMatch = cvText.match(pattern);
      if (softMatch && softMatch[1].trim()) {
        softSkills = softMatch[1].trim();
        break;
      }
    }
    
    // Parser les certifications
    let certifications: string[] = [];
    const certPatterns = [
      /Certifications?\s*:?\s*([^•\n]+)/i,
      /Certificats?\s*:?\s*([^•\n]+)/i,
      /Certificat\s*:?\s*([^•\n]+)/i,
      /Qualifications?\s*:?\s*([^•\n]+)/i,
      /Formations?\s*certifiantes?\s*:?\s*([^•\n]+)/i
    ];
    
    for (const pattern of certPatterns) {
      const certMatch = cvText.match(pattern);
      if (certMatch && certMatch[1].trim()) {
        const certText = certMatch[1].trim();
        certifications = certText.split(/[,;]/).map(c => c.trim()).filter(c => c && c.length > 2);
        break;
      }
    }
    
    // Si aucun pattern ne fonctionne, chercher dans les lignes
    if (certifications.length === 0) {
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (line.toLowerCase().includes('certification') || line.toLowerCase().includes('certificat') || line.toLowerCase().includes('qualification')) {
          const colonIndex = line.indexOf(':');
          if (colonIndex !== -1) {
            const certText = line.substring(colonIndex + 1).trim();
            if (certText) {
              certifications = certText.split(/[,;]/).map(c => c.trim()).filter(c => c && c.length > 2);
              break;
            }
          }
        }
      }
    }
    
    return {
      name,
      contact,
      title,
      summary,
      experience,
      education,
      technicalSkills,
      softSkills,
      certifications,
      additionalInfo: ''
    };
  }, [cvText, lines]);
  
  // Exposer les données parsées via le callback
  React.useEffect(() => {
    if (onDataParsed) {
      onDataParsed(parsedData);
    }
  }, [parsedData, onDataParsed]);
  
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
        {parsedData.name}
      </div>

      {/* Contact */}
      <div style={{
        textAlign: 'center',
        fontSize: '11px',
        color: '#4a5568',
        marginBottom: '6px',
        fontWeight: '500'
      }}>
        {formatText(parsedData.contact)}
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
        {formatText(parsedData.title)}
      </div>

      {/* Résumé */}
      {parsedData.summary && (
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
            {formatText(parsedData.summary)}
          </div>
        </div>
      )}

      {/* Expériences */}
      {parsedData.experience && parsedData.experience.length > 0 && (
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
          {parsedData.experience.map((exp, index) => (
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
      {parsedData.education && parsedData.education.length > 0 && (
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
          {parsedData.education.map((edu, index) => (
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
      {parsedData.technicalSkills && (
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
            {formatText(parsedData.technicalSkills)}
          </div>
        </div>
      )}

      {/* Soft skills */}
      {parsedData.softSkills && (
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
            {formatText(parsedData.softSkills)}
          </div>
        </div>
      )}

      {/* Certifications */}
      {parsedData.certifications && parsedData.certifications.length > 0 && (
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
            {parsedData.certifications.map((cert, index) => (
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
