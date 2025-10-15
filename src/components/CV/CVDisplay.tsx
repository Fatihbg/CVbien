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
    const cleanLine = line.replace(/\*\*/g, '').trim();
    return cleanLine === 'PROFESSIONAL SUMMARY' || 
           cleanLine === 'EDUCATION' || 
           cleanLine === 'PROFESSIONAL EXPERIENCE' || 
           cleanLine === 'TECHNICAL SKILLS' || 
           cleanLine === 'CERTIFICATIONS & ACHIEVEMENTS' ||
           cleanLine === 'EXPERIENCE PROFESSIONNELLE' ||
           cleanLine === 'FORMATION' ||
           cleanLine === 'COMPETENCES' ||
           cleanLine === 'COMPÉTENCES' ||
           cleanLine.includes('EXPÉRIENCE PROFESSIONNELLE');
  };
  
  // Parser les données pour les exposer au PDF
  const parsedData = React.useMemo(() => {
    // Parser les données de manière structurée
    const name = lines.find(line => line.length > 3 && line.length < 50 && line === line.toUpperCase() && !line.includes('@') && !isSectionTitle(line)) || 'Nom Prénom';
    const contact = lines.find(line => line.includes('@') || line.match(/[\+]?[0-9\s\-\(\)]{10,}/)) || 'Contact';
    const contactIndex = lines.findIndex(line => line.includes('@') || line.match(/[\+]?[0-9\s\-\(\)]{10,}/));
    const title = contactIndex >= 0 && contactIndex + 1 < lines.length ? lines[contactIndex + 1] : 'Titre Professionnel';
    
    // Améliorer la détection du résumé - chercher après le nom/titre mais avant les sections
    let summary = '';
    let summaryStartIndex = Math.max(contactIndex + 2, 0);
    for (let i = summaryStartIndex; i < lines.length; i++) {
      const line = lines[i];
      if (isSectionTitle(line)) break;
      if (line.length > 50 && line.length < 500 && 
          !line.includes('This CV has been designed') && 
          !line.includes('CV has been designed') &&
          !line.includes('highlight competencies') &&
          !line.includes('relevant to the position') &&
          !line.includes('Sopra Steria') &&
          !line.includes('alignment with the qualifications') &&
          !line.includes('Strong interest') &&
          !line.includes('Intérêt pour l\'IA')) {
        summary = line;
        break;
      }
    }
    if (!summary) summary = 'Résumé professionnel';
    
    // Parser les expériences
    const experience: Array<{company: string; position: string; period: string; description: string[]}> = [];
    const education: Array<{institution: string; degree: string; period: string; description: string}> = [];
    
    let currentSection = '';
    let currentExperience: any = null;
    let currentEducation: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Détecter les sections (inclure les variantes en gras)
      const cleanLine = line.replace(/\*\*/g, '').trim();
      if (cleanLine.includes('EXPERIENCE') || cleanLine.includes('EXPÉRIENCE') || cleanLine.includes('EXPERIENCES') || cleanLine.includes('PROFESSIONAL EXPERIENCE')) {
        currentSection = 'experience';
        continue;
      }
      if (cleanLine.includes('EDUCATION') || cleanLine.includes('FORMATION') || cleanLine.includes('FORMATIONS') || cleanLine.includes('ACADEMIC BACKGROUND') || cleanLine.includes('ÉTUDES')) {
        currentSection = 'education';
        continue;
      }
      
      // Parser les expériences - AMÉLIORÉ pour format CV optimisé
      if (currentSection === 'experience') {
        // Format 1: **Position** (ligne en gras)
        if (line.startsWith('**') && line.endsWith('**')) {
          if (currentExperience) {
            experience.push(currentExperience);
          }
          const position = line.replace(/\*\*/g, '').trim();
          currentExperience = {
            company: '',
            position: position,
            period: '',
            description: []
          };
        }
        // Format 2: **Company (Period)** (ligne avec entreprise et dates)
        else if (line.startsWith('**') && line.includes('(') && line.includes(')')) {
          if (currentExperience) {
            const fullLine = line.replace(/\*\*/g, '').trim();
            const periodMatch = fullLine.match(/\(([^)]+)\)/);
            const period = periodMatch ? periodMatch[1].trim() : '';
            const company = fullLine.replace(/\([^)]+\)/, '').trim();
            
            currentExperience.company = company;
            currentExperience.period = period;
          }
        }
        // Format 3: Company - Position (Period) (format classique)
        else if ((line.includes('-') || line.includes(',')) && line.includes('(') && line.includes(')')) {
          if (currentExperience) {
            experience.push(currentExperience);
          }
          
          let company = '', position = '', period = '';
          
          // Essayer d'abord le format avec tiret
          if (line.includes(' - ')) {
            const parts = line.split(' - ');
            if (parts.length >= 2) {
              company = parts[0].trim();
              const positionPeriod = parts[1].trim();
              const periodMatch = positionPeriod.match(/\(([^)]+)\)/);
              period = periodMatch ? periodMatch[1].trim() : '';
              position = positionPeriod.replace(/\([^)]+\)/, '').trim();
            }
          }
          // Sinon essayer le format avec virgule
          else if (line.includes(',')) {
            const parts = line.split(',');
            if (parts.length >= 2) {
              company = parts[0].trim();
              const positionPeriod = parts.slice(1).join(',').trim();
              const periodMatch = positionPeriod.match(/\(([^)]+)\)/);
              period = periodMatch ? periodMatch[1].trim() : '';
              position = positionPeriod.replace(/\([^)]+\)/, '').trim();
            }
          }
          
          // Nettoyer les valeurs vides et créer l'expérience
          if (company && position && period) {
            currentExperience = {
              company: company,
              position: position,
              period: period,
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
    
    // Parser les certifications - AMÉLIORÉ
    let certifications: string[] = [];
    const certPatterns = [
      /Certifications?\s*:?\s*([^•\n]+)/i,
      /Certificats?\s*:?\s*([^•\n]+)/i,
      /Certificat\s*:?\s*([^•\n]+)/i,
      /Qualifications?\s*:?\s*([^•\n]+)/i,
      /Formations?\s*certifiantes?\s*:?\s*([^•\n]+)/i,
      /\*\*CERTIFIED\s+([^*]+)\*\*/gi,
      /\*\*CERTIFICAT\s+([^*]+)\*\*/gi,
      /•\s*CERTIFIED\s+([^•\n]+)/gi,
      /•\s*CERTIFICAT\s+([^•\n]+)/gi
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
      let inCertSection = false;
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const cleanLine = line.replace(/\*\*/g, '').trim();
        
        // Détecter le début de la section certifications
        if (cleanLine.includes('CERTIFICATIONS') || cleanLine.includes('ACHIEVEMENTS') || cleanLine.includes('CERTIFICATS')) {
          inCertSection = true;
          continue;
        }
        
        // Sortir de la section si on trouve un autre titre
        if (inCertSection && isSectionTitle(line)) {
          break;
        }
        
        // Collecter les certifications dans la section
        if (inCertSection && line.trim()) {
          // Gérer les puces (•) et les lignes normales
          const cert = line.replace(/^[•\-*]\s*/, '').trim();
          if (cert && cert.length > 5 && !cert.includes('---')) {
            certifications.push(cert);
          }
        }
        
        // Fallback: ligne avec "certification" dans le texte
        if (!inCertSection && (line.toLowerCase().includes('certification') || line.toLowerCase().includes('certificat') || line.toLowerCase().includes('qualification'))) {
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
    
    // Parser les langues - à mettre en bas
    let languages = '';
    const languagePatterns = [
      /Langues?\s*:?\s*([^•\n]+)/i,
      /Languages?\s*:?\s*([^•\n]+)/i,
      /Talen\s*:?\s*([^•\n]+)/i
    ];
    
    for (const pattern of languagePatterns) {
      const langMatch = cvText.match(pattern);
      if (langMatch && langMatch[1].trim()) {
        languages = langMatch[1].trim();
        break;
      }
    }
    
    // Parser les compétences techniques et soft skills pour les mettre dans infos additionnelles
    let additionalSkills = '';
    let technicalSkills = '';
    let softSkills = '';
    
    // Chercher les sections de compétences
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Compétences techniques - détection améliorée
      if (line.toLowerCase().includes('compétences techniques') || 
          line.toLowerCase().includes('technical skills') ||
          line.toLowerCase().includes('hard skills') ||
          line.toLowerCase().includes('skills')) {
        let skillsText = '';
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          if (isSectionTitle(nextLine)) break;
          if (nextLine.trim() && !nextLine.includes(':')) {
            skillsText += (skillsText ? ', ' : '') + nextLine.trim();
          }
        }
        if (skillsText) {
          technicalSkills = skillsText;
          additionalSkills += (additionalSkills ? ' | ' : '') + 'Compétences techniques: ' + skillsText;
        }
      }
      
      // Soft skills - détection améliorée
      if (line.toLowerCase().includes('soft skills') || 
          line.toLowerCase().includes('compétences relationnelles') ||
          line.toLowerCase().includes('compétences comportementales') ||
          line.toLowerCase().includes('compétences humaines')) {
        let skillsText = '';
        for (let j = i + 1; j < lines.length; j++) {
          const nextLine = lines[j];
          if (isSectionTitle(nextLine)) break;
          if (nextLine.trim() && !nextLine.includes(':')) {
            skillsText += (skillsText ? ', ' : '') + nextLine.trim();
          }
        }
        if (skillsText) {
          softSkills = skillsText;
          additionalSkills += (additionalSkills ? ' | ' : '') + 'Soft skills: ' + skillsText;
        }
      }
      
      // Détecter les soft skills dans le résumé professionnel, ADDITIONAL INFORMATION ou autres sections
      if (!softSkills && (line.toLowerCase().includes('collaboration') || 
                         line.toLowerCase().includes('communication') ||
                         line.toLowerCase().includes('leadership') ||
                         line.toLowerCase().includes('teamwork') ||
                         line.toLowerCase().includes('problem solving') ||
                         line.toLowerCase().includes('analytical') ||
                         line.toLowerCase().includes('proactive') ||
                         line.toLowerCase().includes('team collaboration') ||
                         line.toLowerCase().includes('leadership development') ||
                         line.toLowerCase().includes('strong interest in'))) {
        // Extraire les soft skills du contexte
        const softSkillsKeywords = ['collaboration', 'communication', 'leadership', 'teamwork', 'team collaboration', 'problem solving', 'analytical', 'proactive', 'resilient', 'adaptable', 'creative', 'leadership development'];
        const detectedSoftSkills = softSkillsKeywords.filter(skill => line.toLowerCase().includes(skill));
        if (detectedSoftSkills.length > 0) {
          softSkills = detectedSoftSkills.join(', ');
        }
      }
    }
    
    // Ajouter les langues en bas si elles existent
    if (languages) {
      additionalSkills += (additionalSkills ? ' | ' : '') + 'Langues: ' + languages;
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
      additionalInfo: additionalSkills
    };
  }, [cvText, lines]);
  
  // Exposer les données parsées via le callback
  React.useEffect(() => {
    if (onDataParsed && parsedData) {
      // Vérifier que les données parsées sont valides
      if (parsedData.name && parsedData.name !== 'Nom Prénom') {
        onDataParsed(parsedData);
      }
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
    
    // Supprimer les phrases d'adaptation du CV
    cleanText = cleanText
      .replace(/This CV has been designed to highlight competencies and experiences relevant to the position at Sopra Steria, ensuring alignment with the qualifications and skills sought in the job description\.?/gi, '')
      .replace(/CV has been designed to highlight competencies and experiences relevant to the position\.?/gi, '')
      .replace(/This CV highlights competencies and experiences relevant to the position\.?/gi, '')
      .replace(/highlighting competencies and experiences relevant to the position\.?/gi, '')
      .replace(/relevant to the position at Sopra Steria\.?/gi, '')
      .replace(/alignment with the qualifications and skills sought in the job description\.?/gi, '')
      .trim();
    
    // Enlever les parenthèses vides
    cleanText = cleanText.replace(/\(\s*\)/g, '').trim();
    
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
      'chez sopra steria', 'at sopra steria', 'sopra steria', 'compétences et expériences', 'skills and experiences',
      'this cv has been designed', 'cv has been designed', 'highlight competencies', 'relevant to the position',
      'alignment with the qualifications', 'sought in the job description'
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

      {/* Informations additionnelles */}
      {parsedData.additionalInfo && (
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
            INFORMATIONS ADDITIONNELLES
          </div>
          <div style={{
            fontSize: '11px',
            color: '#2d3748',
            lineHeight: '1.5'
          }}>
            {formatText(parsedData.additionalInfo)}
          </div>
        </div>
      )}
    </div>
  );
};
