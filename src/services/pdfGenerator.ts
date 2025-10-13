import { config } from '../config/environment';

interface CVParsedData {
  name: string;
  contact: string;
  title: string;
  summary: string;
  experience: Array<{
    company: string;
    position: string;
    period: string;
    description: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    period: string;
    description: string;
  }>;
  technicalSkills: string;
  softSkills: string;
  certifications: string[];
  additionalInfo: string;
}

export class PDFGenerator {
  // Fonction pour détecter la langue de l'offre d'emploi
  private static detectJobDescriptionLanguage(jobDescription: string): string {
    console.log('🌍 DÉTECTION LANGUE OFFRE (AMÉLIORÉE):', jobDescription);
    
    // Extraire le texte de l'objet jobDescription si nécessaire
    let textToAnalyze = '';
    if (typeof jobDescription === 'string') {
      textToAnalyze = jobDescription;
    } else if (jobDescription && typeof jobDescription === 'object') {
      // Si c'est un objet, essayer d'extraire description ou title
      textToAnalyze = (jobDescription as any).description || (jobDescription as any).title || JSON.stringify(jobDescription);
    }
    
    console.log('📝 Texte à analyser (premiers 200 chars):', textToAnalyze.substring(0, 200));
    
    const lowerText = textToAnalyze.toLowerCase();
    
    // Mots-clés anglais - ÉTENDUS
    const englishKeywords = [
      'experience', 'skills', 'requirements', 'responsibilities', 'education', 'degree', 'bachelor', 'master', 'phd', 
      'years', 'required', 'preferred', 'knowledge', 'ability', 'team', 'work', 'project', 'development', 'management', 
      'analysis', 'communication', 'english', 'fluent', 'native', 'speaking', 'written', 'language', 'proficiency',
      'candidate', 'position', 'role', 'company', 'industry', 'sector', 'business', 'professional', 'career',
      'salary', 'benefits', 'location', 'remote', 'office', 'full-time', 'part-time', 'contract', 'permanent',
      'interview', 'application', 'resume', 'cv', 'qualifications', 'background', 'profile', 'expertise',
      'looking for', 'mission', 'profile', 'candidate', 'team'
    ];
    
    // Mots-clés français - ÉTENDUS
    const frenchKeywords = [
      'expérience', 'compétences', 'exigences', 'responsabilités', 'formation', 'diplôme', 'licence', 'master', 'doctorat',
      'années', 'requis', 'préféré', 'connaissance', 'capacité', 'équipe', 'travail', 'projet', 'développement', 'gestion',
      'analyse', 'communication', 'français', 'courant', 'natif', 'parlé', 'écrit', 'langue', 'maîtrise',
      'candidat', 'poste', 'rôle', 'entreprise', 'secteur', 'business', 'professionnel', 'carrière',
      'salaire', 'avantages', 'lieu', 'télétravail', 'bureau', 'temps plein', 'temps partiel', 'contrat', 'permanent',
      'entretien', 'candidature', 'cv', 'qualifications', 'profil', 'expertise',
      'recherche', 'mission', 'équipe'
    ];
    
    // Mots-clés néerlandais - ÉTENDUS
    const dutchKeywords = [
      'ervaring', 'vaardigheden', 'vereisten', 'verantwoordelijkheden', 'opleiding', 'diploma', 'bachelor', 'master', 'doctoraat',
      'jaren', 'vereist', 'voorkeur', 'kennis', 'vaardigheid', 'team', 'werk', 'project', 'ontwikkeling', 'beheer',
      'analyse', 'communicatie', 'nederlands', 'vloeiend', 'moedertaal', 'gesproken', 'geschreven', 'taal', 'beheersing',
      'kandidaat', 'functie', 'rol', 'bedrijf', 'industrie', 'sector', 'zakelijk', 'professioneel', 'carrière',
      'salaris', 'voordelen', 'locatie', 'thuiswerk', 'kantoor', 'voltijds', 'deeltijds', 'contract', 'vast',
      'sollicitatie', 'aanvraag', 'cv', 'kwalificaties', 'achtergrond', 'profiel', 'expertise',
      'zoeken', 'missie', 'team'
    ];
    
    let englishCount = 0;
    let frenchCount = 0;
    let dutchCount = 0;
    
    // Compter les occurrences de chaque langue
    englishKeywords.forEach(keyword => {
      const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      englishCount += matches;
    });
    
    frenchKeywords.forEach(keyword => {
      const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      frenchCount += matches;
    });
    
    dutchKeywords.forEach(keyword => {
      const matches = (lowerText.match(new RegExp(keyword, 'g')) || []).length;
      dutchCount += matches;
    });
    
    console.log('📊 COMPTEURS LANGUE DÉTAILLÉS:', { 
      english: englishCount, 
      french: frenchCount, 
      dutch: dutchCount,
      totalChars: textToAnalyze.length 
    });
    
    // Logique de détection améliorée
    const totalMatches = englishCount + frenchCount + dutchCount;
    const threshold = Math.max(1, Math.floor(totalMatches * 0.3)); // Au moins 30% des mots-clés
    
    console.log('🎯 Seuil minimum:', threshold);
    
    if (englishCount >= threshold && englishCount > frenchCount && englishCount > dutchCount) {
      console.log('🇺🇸 LANGUE DÉTECTÉE: ANGLAIS');
      return 'english';
    } else if (dutchCount >= threshold && dutchCount > frenchCount && dutchCount > englishCount) {
      console.log('🇳🇱 LANGUE DÉTECTÉE: NÉERLANDAIS');
      return 'dutch';
    } else if (frenchCount >= threshold && frenchCount > englishCount && frenchCount > dutchCount) {
      console.log('🇫🇷 LANGUE DÉTECTÉE: FRANÇAIS');
      return 'french';
    } else {
      // Fallback : analyser les premiers mots pour détecter la langue
      const firstWords = lowerText.split(' ').slice(0, 20).join(' ');
      console.log('🔄 Fallback - Premiers mots:', firstWords);
      
      if (firstWords.includes('the ') || firstWords.includes('and ') || firstWords.includes('of ') || firstWords.includes('in ')) {
        console.log('🇺🇸 FALLBACK: ANGLAIS détecté');
        return 'english';
      } else if (firstWords.includes('de ') || firstWords.includes('het ') || firstWords.includes('en ') || firstWords.includes('van ')) {
        console.log('🇳🇱 FALLBACK: NÉERLANDAIS détecté');
        return 'dutch';
      } else {
        console.log('🇫🇷 FALLBACK: FRANÇAIS (par défaut)');
        return 'french';
      }
    }
  }

  // Utiliser l'IA pour parser le CV
  private static async parseCVWithAI(cvText: string, jobDescription: string = ''): Promise<CVParsedData> {
    try {
      console.log('🤖 Utilisation de l\'IA pour parser le CV...');
      
      // Détecter la langue de l'offre d'emploi
      const jobLanguage = this.detectJobDescriptionLanguage(jobDescription);
      console.log('🌍 Langue détectée pour le PDF:', jobLanguage);
      
      const response = await fetch(`${config.API_BASE_URL}/optimize-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv_content: cvText,
          job_description: jobDescription,
          target_language: jobLanguage,
          instructions: "CRITICAL: Preserve ALL content from original CV. ZERO TOLERANCE for content removal. Translate everything to match job offer language."
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur backend: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ CV parsé par l\'IA:', result);
      
      if (result.success && result.optimized_cv) {
        // Parser le CV optimisé pour le convertir en structure CVParsedData
        return this.parseCVManually(result.optimized_cv);
      } else {
        throw new Error('Réponse backend invalide');
      }
      
    } catch (error) {
      console.error('❌ Erreur parsing IA, fallback manuel:', error);
      return this.parseCVManually(cvText);
    }
  }

  // Fallback: parsing manuel amélioré
  public static parseCVManually(cvText: string): CVParsedData {
    console.log('🔍 Parsing manuel du CV...');
    console.log('📄 Texte CV reçu (premiers 500 caractères):', cvText.substring(0, 500));
    console.log('📄 Texte CV reçu (derniers 500 caractères):', cvText.substring(Math.max(0, cvText.length - 500)));
    const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
    console.log('📝 Nombre de lignes:', lines.length);
    
    // Trouver le nom (première ligne en majuscules)
    const name = lines.find(line => line.length > 3 && line.length < 50 && line === line.toUpperCase()) || 'Nom Prénom';
    
    // Trouver le contact (ligne avec @ ou téléphone)
    const contact = lines.find(line => line.includes('@') || line.match(/[\+]?[0-9\s\-\(\)]{10,}/)) || 'Contact';
    
    // Trouver le titre (ligne après le contact)
    const contactIndex = lines.findIndex(line => line.includes('@') || line.match(/[\+]?[0-9\s\-\(\)]{10,}/));
    const title = contactIndex >= 0 && contactIndex + 1 < lines.length ? lines[contactIndex + 1] : 'Titre Professionnel';
    
    // Trouver le résumé - chercher après le titre mais avant les sections
    let summary = '';
    let summaryStartIndex = Math.max(contactIndex + 2, 0);
    
    // Chercher un paragraphe long qui n'est pas une section
    for (let i = summaryStartIndex; i < lines.length; i++) {
      const line = lines[i];
      
      // Arrêter si on trouve une section
      if (line.includes('**') && (
        line.includes('EXPERIENCE') || line.includes('FORMATION') || 
        line.includes('SKILLS') || line.includes('CERTIFICATIONS') ||
        line.includes('EDUCATION') || line.includes('COMPETENCES')
      )) {
        break;
      }
      
      // Si c'est un paragraphe long et cohérent, c'est probablement le résumé
      if (line.length > 50 && line.length < 500 && 
          !line.includes('•') && !line.includes('-') && 
          !line.includes('(') && !line.includes(')') &&
          line.includes(' ') && line.includes('.')) {
        summary = line;
        break;
      }
    }
    
    if (!summary) {
      summary = 'Résumé professionnel';
    }
    
    // Parser les expériences - AMÉLIORÉ pour préserver TOUT le contenu
    const experience: Array<{company: string; position: string; period: string; description: string[]}> = [];
    const education: Array<{institution: string; degree: string; period: string; description: string}> = [];
    
    let currentSection = '';
    let currentExperience: any = null;
    let currentEducation: any = null;
    let currentSkills = '';
    let currentCertifications: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Détecter les sections avec plus de variantes (avec ou sans **)
      const cleanLine = line.replace(/\*\*/g, '').trim();
      
      if (cleanLine.includes('EXPERIENCE') || cleanLine.includes('EXPÉRIENCE') || cleanLine.includes('EXPERIENCES') || cleanLine.includes('PROFESSIONAL EXPERIENCE')) {
        currentSection = 'experience';
        continue;
      }
      if (cleanLine.includes('EDUCATION') || cleanLine.includes('FORMATION') || cleanLine.includes('FORMATIONS') || cleanLine.includes('ACADEMIC BACKGROUND') || cleanLine.includes('ÉTUDES')) {
        currentSection = 'education';
        continue;
      }
      if (cleanLine.includes('SKILLS') || cleanLine.includes('COMPETENCES') || cleanLine.includes('COMPÉTENCES') || cleanLine.includes('TECHNICAL SKILLS')) {
        currentSection = 'skills';
        continue;
      }
      if (cleanLine.includes('CERTIFICATIONS') || cleanLine.includes('ACHIEVEMENTS') || cleanLine.includes('CERTIFICATS')) {
        currentSection = 'certifications';
        continue;
      }
      if (cleanLine.includes('INFORMATIONS ADDITIONNELLES') || cleanLine.includes('ADDITIONAL INFORMATION') || cleanLine.includes('INFORMATIONS COMPLÉMENTAIRES')) {
        currentSection = 'additional';
        continue;
      }
      
      // Parser les expériences - Gérer le format **Position** et **Company (Period)**
      if (currentSection === 'experience') {
        // Format avec **Position** (ligne avec double astérisques)
        if (line.includes('**') && line.match(/\*\*[^*]+\*\*/)) {
          if (currentExperience) {
            experience.push(currentExperience);
          }
          const position = line.replace(/\*\*/g, '').trim();
          currentExperience = {
            company: '',
            position,
            period: '',
            description: []
          };
        }
        // Format avec **Company (Period)** - ligne suivante après **Position**
        else if (currentExperience && currentExperience.position && !currentExperience.company && line.includes('(') && line.includes(')')) {
          const periodMatch = line.match(/\(([^)]+)\)/);
          const period = periodMatch ? periodMatch[1] : '';
          const company = line.replace(/\([^)]+\)/, '').trim().replace(/\*\*/g, '').trim();
          currentExperience.company = company;
          currentExperience.period = period;
        }
        // Format standard: Company - Position (Period)
        else if (line.includes('-') && line.includes('(') && line.includes(')')) {
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
        // Format alternatif pour Erasmus, stages, etc. : Company, Position (Period)
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
        // Lignes de description pour l'expérience courante
        else if (currentExperience && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
          currentExperience.description.push(line.replace(/^[•\-*]\s*/, '').trim());
        }
        // Lignes de description sans puce
        else if (currentExperience && line.length > 10 && !line.includes('(') && !line.includes('-') && !line.includes('**')) {
          currentExperience.description.push(line.trim());
        }
      }
      
      // Parser les formations - Gérer le format **Degree** et **Institution (Period)**
      if (currentSection === 'education') {
        // Format avec **Degree** (ligne avec double astérisques)
        if (line.includes('**') && line.match(/\*\*[^*]+\*\*/)) {
          if (currentEducation) {
            education.push(currentEducation);
          }
          const degree = line.replace(/\*\*/g, '').trim();
          currentEducation = {
            institution: '',
            degree,
            period: '',
            description: ''
          };
        }
        // Format avec **Institution (Period)** - ligne suivante après **Degree**
        else if (currentEducation && currentEducation.degree && !currentEducation.institution && line.includes('(') && line.includes(')')) {
          const periodMatch = line.match(/\(([^)]+)\)/);
          const period = periodMatch ? periodMatch[1] : '';
          const institution = line.replace(/\([^)]+\)/, '').trim().replace(/\*\*/g, '').trim();
          currentEducation.institution = institution;
          currentEducation.period = period;
        }
        // Format standard: Institution - Degree (Period)
        else if (line.includes('-') && line.includes('(') && line.includes(')')) {
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
        // Format alternatif: Institution, Degree (Period)
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
        // Lignes de description pour la formation courante
        else if (currentEducation && (line.startsWith('•') || line.startsWith('-') || line.startsWith('*'))) {
          if (currentEducation.description) {
            currentEducation.description += ' ' + line.replace(/^[•\-*]\s*/, '').trim();
          } else {
            currentEducation.description = line.replace(/^[•\-*]\s*/, '').trim();
          }
        }
        // Lignes de description sans puce
        else if (currentEducation && line.length > 10 && !line.includes('(') && !line.includes('-')) {
          if (currentEducation.description) {
            currentEducation.description += ' ' + line.trim();
          } else {
            currentEducation.description = line.trim();
          }
        }
      }
      
      // Parser les compétences techniques dans la section skills
      if (currentSection === 'skills') {
        // Ignorer les lignes vides et les titres de section
        if (line.trim() && !line.includes('**') && !line.includes('SKILLS')) {
          if (currentSkills) {
            currentSkills += ' ' + line.trim();
          } else {
            currentSkills = line.trim();
          }
        }
      }
      
      // Parser les certifications dans la section certifications
      if (currentSection === 'certifications') {
        // Ignorer les lignes vides et les titres de section
        if (line.trim() && !line.includes('**') && !line.includes('CERTIFICATIONS') && !line.includes('ACHIEVEMENTS')) {
          // Si c'est une ligne avec des puces, extraire chaque certification
          if (line.includes('•') || line.includes('-') || line.includes('*')) {
            const cert = line.replace(/^[•\-*]\s*/, '').trim();
            if (cert) {
              currentCertifications.push(cert);
            }
          } else if (line.length > 5) {
            // Si c'est une ligne de texte, l'ajouter comme certification
            currentCertifications.push(line.trim());
          }
        }
      }
      
      // Parser les informations additionnelles (compétences, langues, intérêts)
      if (currentSection === 'additional') {
        // Ignorer les lignes vides et les titres de section
        if (line.trim() && !line.includes('**') && !line.includes('INFORMATIONS ADDITIONNELLES')) {
          // Si c'est une ligne avec des puces, extraire le contenu
          if (line.includes('•') || line.includes('-') || line.includes('*')) {
            const content = line.replace(/^[•\-*]\s*/, '').trim();
            if (content) {
              // Détecter le type de contenu
              if (content.toLowerCase().includes('compétences') || content.toLowerCase().includes('skills')) {
                // Extraire les compétences après les deux points
                const colonIndex = content.indexOf(':');
                if (colonIndex !== -1) {
                  const skillsText = content.substring(colonIndex + 1).trim();
                  if (skillsText && !currentSkills) {
                    currentSkills = skillsText;
                  }
                }
              } else if (content.toLowerCase().includes('langues') || content.toLowerCase().includes('languages')) {
                // Extraire les langues après les deux points
                const colonIndex = content.indexOf(':');
                if (colonIndex !== -1) {
                  const languagesText = content.substring(colonIndex + 1).trim();
                  if (languagesText) {
                    // Stocker les langues dans une variable séparée
                    if (!currentSkills.includes('Langues:')) {
                      currentSkills += (currentSkills ? ' | ' : '') + `Langues: ${languagesText}`;
                    }
                  }
                }
              } else if (content.toLowerCase().includes('intérêt') || content.toLowerCase().includes('interest')) {
                // Extraire les intérêts après les deux points
                const colonIndex = content.indexOf(':');
                if (colonIndex !== -1) {
                  const interestText = content.substring(colonIndex + 1).trim();
                  if (interestText && !currentSkills.includes('Intérêts:')) {
                    currentSkills += (currentSkills ? ' | ' : '') + `Intérêts: ${interestText}`;
                  }
                }
              } else {
                // Contenu général, l'ajouter aux compétences
                if (!currentSkills.includes(content)) {
                  currentSkills += (currentSkills ? ' ' : '') + content;
                }
              }
            }
          }
        }
      }
    }
    
    if (currentExperience) experience.push(currentExperience);
    if (currentEducation) education.push(currentEducation);
    
    // Utiliser les compétences collectées dans la boucle ou fallback sur regex
    let technicalSkills = currentSkills || '';
    
    // Si pas de compétences dans la section skills, essayer les regex comme fallback
    if (!technicalSkills) {
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
    }
    
    // Soft skills - utiliser regex pour l'instant
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
    
    // Utiliser les certifications collectées dans la boucle ou fallback sur regex
    let certifications: string[] = currentCertifications || [];
    
    console.log('🔍 Recherche des certifications dans le texte...');
    console.log('📋 Certifications collectées dans la boucle:', certifications);
    
    // Si pas de certifications dans la section certifications, essayer les regex comme fallback
    if (certifications.length === 0) {
      console.log('🔍 Fallback sur regex pour les certifications...');
      
      // Chercher différentes variantes de section certifications
      const certPatterns = [
        /Certifications?\s*:?\s*([^•\n]+)/i,
        /Certificats?\s*:?\s*([^•\n]+)/i,
        /Certificat\s*:?\s*([^•\n]+)/i,
        /Qualifications?\s*:?\s*([^•\n]+)/i,
        /Formations?\s*certifiantes?\s*:?\s*([^•\n]+)/i
      ];
      
      for (let i = 0; i < certPatterns.length; i++) {
        const pattern = certPatterns[i];
        console.log(`🔍 Test pattern ${i + 1}:`, pattern);
        const certMatch = cvText.match(pattern);
        if (certMatch && certMatch[1].trim()) {
          console.log('✅ Certifications trouvées avec pattern', i + 1, ':', certMatch[1]);
          const certText = certMatch[1].trim();
          // Diviser par virgules, points-virgules, ou retours à la ligne
          certifications = certText.split(/[,;]/).map(c => c.trim()).filter(c => c && c.length > 2);
          console.log('📋 Certifications parsées:', certifications);
          break;
        } else {
          console.log('❌ Pattern', i + 1, 'ne correspond pas');
        }
      }
      
      // Si aucun pattern ne fonctionne, chercher dans les lignes
      if (certifications.length === 0) {
        console.log('🔍 Recherche manuelle dans les lignes...');
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line.toLowerCase().includes('certification') || line.toLowerCase().includes('certificat') || line.toLowerCase().includes('qualification')) {
            console.log('🎯 Ligne avec certification trouvée:', line);
            // Extraire le contenu après les deux points
            const colonIndex = line.indexOf(':');
            if (colonIndex !== -1) {
              const certText = line.substring(colonIndex + 1).trim();
              if (certText) {
                certifications = certText.split(/[,;]/).map(c => c.trim()).filter(c => c && c.length > 2);
                console.log('📋 Certifications extraites manuellement:', certifications);
                break;
              }
            }
          }
        }
      }
    }
    
    console.log('📊 Données parsées (PRÉSERVATION TOTALE):', {
      experiences: experience.length,
      educations: education.length,
      technicalSkills: technicalSkills.length > 0 ? '✅ Présent' : '❌ Vide',
      technicalSkillsContent: technicalSkills.substring(0, 100) + (technicalSkills.length > 100 ? '...' : ''),
      softSkills: softSkills.length > 0 ? '✅ Présent' : '❌ Vide',
      certifications: certifications.length,
      certText: certifications.join(', ')
    });
    
    console.log('🔍 INFORMATIONS ADDITIONNELLES parsées:');
    console.log('  - Compétences techniques collectées:', currentSkills ? '✅' : '❌');
    console.log('  - Contenu:', currentSkills);
    
    // Log détaillé des expériences
    if (experience.length > 0) {
      console.log('📋 Expériences détectées:', experience.map(exp => `${exp.company} - ${exp.position} (${exp.period})`));
    }
    
    // Log détaillé des formations
    if (education.length > 0) {
      console.log('🎓 Formations détectées:', education.map(edu => `${edu.institution} - ${edu.degree} (${edu.period})`));
    }
    
    // Log des compétences
    if (technicalSkills) {
      console.log('💻 Compétences techniques:', technicalSkills.substring(0, 100) + (technicalSkills.length > 100 ? '...' : ''));
    }
    if (softSkills) {
      console.log('🤝 Soft skills:', softSkills.substring(0, 100) + (softSkills.length > 100 ? '...' : ''));
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
  }

  // Nouvelle fonction qui utilise les données parsées de l'aperçu
  static async generateCVPDFFromParsedData(parsedData: any, jobDescription: string = '', filename?: string): Promise<void> {
    try {
      console.log('=== GÉNÉRATION PDF AVEC DONNÉES PARSÉES ===');
      console.log('Parsed Data:', parsedData);
      console.log('Job Description length:', jobDescription.length);
      
      // Générer un nom de fichier dynamique si non fourni
      let finalFilename = filename;
      if (!finalFilename) {
        const name = parsedData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // Utiliser localStorage pour compter les téléchargements
        const storageKey = `cv-download-count-${name}`;
        const currentCount = parseInt(localStorage.getItem(storageKey) || '0') + 1;
        localStorage.setItem(storageKey, currentCount.toString());
        
        finalFilename = `${name}-cv-${currentCount}.pdf`;
      }
      
      const { default: jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Utiliser les données parsées directement - copier la logique de generateCVPDF
      // Configuration
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const maxWidth = pageWidth - (2 * margin);
      let currentY = margin;

      // Fonction pour ajouter du texte
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, isCenter: boolean = false, color: string = '#000000') => {
        if (currentY > pageHeight - 20) return;
        
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('calibri', 'bold');
        } else {
          doc.setFont('calibri', 'normal');
        }
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) return;
          let xPos = margin;
          let align: any = 'left';
          
          if (isCenter) {
            xPos = pageWidth / 2;
            align = 'center';
          }
          
          doc.text(line, xPos, currentY, { align });
          currentY += fontSize * 0.4;
        });
      };

      // Fonction pour ajouter une ligne horizontale
      const addHorizontalLine = (titleY: number) => {
        if (currentY > pageHeight - 20) return;
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(margin, titleY + 0.5, pageWidth - margin, titleY + 0.5);
        currentY = titleY + 7;
      };

      // Fonction pour détecter la langue
      const detectJobDescriptionLanguage = (jobDesc: string): string => {
        const frenchKeywords = ['recherche', 'poste', 'entreprise', 'expérience', 'compétences', 'mission', 'profil', 'candidat', 'équipe', 'développement'];
        const englishKeywords = ['looking for', 'position', 'company', 'experience', 'skills', 'mission', 'profile', 'candidate', 'team', 'development'];
        const dutchKeywords = ['zoeken', 'functie', 'bedrijf', 'ervaring', 'vaardigheden', 'missie', 'profiel', 'kandidaat', 'team', 'ontwikkeling'];
        
        const lowerJobDesc = jobDesc.toLowerCase();
        
        const frenchCount = frenchKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
        const englishCount = englishKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
        const dutchCount = dutchKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
        
        if (dutchCount > frenchCount && dutchCount > englishCount) {
          return 'dutch';
        } else if (englishCount > frenchCount && englishCount > dutchCount) {
          return 'english';
        } else {
          return 'french';
        }
      };

      // Détecter la langue
      let detectedLanguage = 'french';
      if (jobDescription) {
        let jobDescText = '';
        if (typeof jobDescription === 'string') {
          jobDescText = jobDescription;
        } else if (jobDescription && typeof jobDescription === 'object') {
          jobDescText = (jobDescription as any).description || (jobDescription as any).title || JSON.stringify(jobDescription);
        }
        detectedLanguage = detectJobDescriptionLanguage(jobDescText);
      }

      // Fonction pour traduire les titres
      const translateSectionTitle = (title: string): string => {
        const translations: any = {
          'EXPÉRIENCE PROFESSIONNELLE': {
            'french': 'EXPÉRIENCE PROFESSIONNELLE',
            'english': 'PROFESSIONAL EXPERIENCE',
            'dutch': 'WERKERVARING'
          },
          'FORMATION': {
            'french': 'FORMATION',
            'english': 'EDUCATION',
            'dutch': 'OPLEIDING'
          },
          'COMPÉTENCES TECHNIQUES': {
            'french': 'COMPÉTENCES TECHNIQUES',
            'english': 'TECHNICAL SKILLS',
            'dutch': 'TECHNISCHE VAARDIGHEDEN'
          },
          'CERTIFICATIONS': {
            'french': 'CERTIFICATIONS',
            'english': 'CERTIFICATIONS',
            'dutch': 'CERTIFICERINGEN'
          }
        };
        
        return translations[title]?.[detectedLanguage] || title;
      };

      // Générer le PDF avec les données parsées
      // Header - Nom
      addText(parsedData.name, 18.3, true, true, '#1a365d');
      currentY += 5;
      
      // Contact
      addText(parsedData.contact, 10.3, false, true, '#4a5568');
      currentY += 3;
      
      // Titre professionnel
      addText(parsedData.title, 12.3, false, true, '#2d3748');
      currentY += 8;
      
      // Résumé
      if (parsedData.summary) {
        const summaryTitle = translateSectionTitle('PROFESSIONAL SUMMARY');
        addText(summaryTitle, 12.3, true, false, '#1a365d');
        addHorizontalLine(currentY - 2);
        addText(parsedData.summary, 10.3, false, false, '#2d3748');
        currentY += 5;
      }
      
      // Expériences
      if (parsedData.experience && parsedData.experience.length > 0) {
        const expTitle = translateSectionTitle('EXPÉRIENCE PROFESSIONNELLE');
        addText(expTitle, 12.3, true, false, '#1a365d');
        addHorizontalLine(currentY - 2);
        
        parsedData.experience.forEach((exp: any) => {
          addText(`${exp.company} - ${exp.position} (${exp.period})`, 10.3, true, false, '#2d3748');
          currentY += 2;
          
          exp.description.forEach((desc: string) => {
            addText(`• ${desc}`, 10.3, false, false, '#2d3748');
            currentY += 1;
          });
          currentY += 3;
        });
      }
      
      // Formation
      if (parsedData.education && parsedData.education.length > 0) {
        const eduTitle = translateSectionTitle('FORMATION');
        addText(eduTitle, 12.3, true, false, '#1a365d');
        addHorizontalLine(currentY - 2);
        
        parsedData.education.forEach((edu: any) => {
          addText(`${edu.institution} - ${edu.degree} (${edu.period})`, 10.3, true, false, '#2d3748');
          currentY += 2;
          
          if (edu.description) {
            addText(edu.description, 10.3, false, false, '#2d3748');
            currentY += 1;
          }
          currentY += 3;
        });
      }
      
      // INFORMATIONS ADDITIONNELLES (Skills, Soft Skills, Certifications, Langues)
      if (parsedData.technicalSkills || parsedData.softSkills || (parsedData.certifications && parsedData.certifications.length > 0)) {
        const addInfoTitle = translateSectionTitle('INFORMATIONS ADDITIONNELLES');
        addText(addInfoTitle, 12.3, true, false, '#1a365d');
        addHorizontalLine(currentY - 2);
        
        // Compétences techniques
        if (parsedData.technicalSkills) {
          const techLabel = detectedLanguage === 'english' ? 'Skills:' : 
                           detectedLanguage === 'dutch' ? 'Vaardigheden:' : 'Compétences:';
          addText(`${techLabel} ${parsedData.technicalSkills}`, 10.3, false, false, '#2d3748');
          currentY += 3;
        }
        
        // Soft skills
        if (parsedData.softSkills) {
          const softLabel = detectedLanguage === 'english' ? 'Soft Skills:' : 
                           detectedLanguage === 'dutch' ? 'Zachte Vaardigheden:' : 'Compétences comportementales:';
          addText(`${softLabel} ${parsedData.softSkills}`, 10.3, false, false, '#2d3748');
          currentY += 3;
        }
        
        // Certifications
        if (parsedData.certifications && parsedData.certifications.length > 0) {
          const certLabel = detectedLanguage === 'english' ? 'Certifications:' : 
                           detectedLanguage === 'dutch' ? 'Certificeringen:' : 'Certifications:';
          const certText = parsedData.certifications.join(', ');
          addText(`${certLabel} ${certText}`, 10.3, false, false, '#2d3748');
          currentY += 3;
        }
        
        // Langues (si disponibles dans les compétences techniques)
        if (parsedData.technicalSkills && parsedData.technicalSkills.includes('Langues:')) {
          const langLabel = detectedLanguage === 'english' ? 'Languages:' : 
                           detectedLanguage === 'dutch' ? 'Talen:' : 'Langues:';
          const langMatch = parsedData.technicalSkills.match(/Langues:\s*([^|]+)/);
          if (langMatch) {
            addText(`${langLabel} ${langMatch[1].trim()}`, 10.3, false, false, '#2d3748');
            currentY += 3;
          }
        }
        
        currentY += 5;
      }
      
      // Sauvegarder le PDF
      doc.save(finalFilename);
      
      console.log('✅ PDF généré avec succès avec données parsées');
    } catch (error) {
      console.error('❌ Erreur génération PDF avec données parsées:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }

  static async generateCVPDF(cvText: string, jobDescription: string = '', filename?: string): Promise<void> {
    try {
      console.log('=== GÉNÉRATION PDF DIRECTE (SANS IA) ===');
      console.log('CV Text length:', cvText.length);
      console.log('Job Description length:', jobDescription.length);
      
      // Parser le CV directement sans IA - utiliser le texte brut de la partie Éditer
      const parsedCV = this.parseCVManually(cvText);
      
      // Utiliser la même logique que generateCVPDFFromParsedData qui fonctionne bien
      await this.generateCVPDFFromParsedData(parsedCV, jobDescription, filename);
      
      console.log('✅ PDF généré avec succès - données directes de la partie Éditer (sans IA)');
    } catch (error) {
      console.error('❌ Erreur génération PDF directe:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }

  // Ancienne fonction generateCVPDF complexe - gardée pour référence mais plus utilisée
  static async generateCVPDF_OLD(cvText: string, jobDescription: string = '', filename?: string): Promise<void> {
    try {
      console.log('=== GÉNÉRATION PDF AVEC IA (ANCIENNE VERSION) ===');
      console.log('CV Text length:', cvText.length);
      console.log('Job Description length:', jobDescription.length);
      
      // Parser le CV avec l'IA en incluant la description du job
      const parsedCV = await this.parseCVWithAI(cvText, jobDescription);
      
      // Générer un nom de fichier dynamique si non fourni
      let finalFilename = filename;
      if (!finalFilename) {
        const name = parsedCV.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // Utiliser localStorage pour compter les téléchargements
        const storageKey = `cv-download-count-${name}`;
        const currentCount = parseInt(localStorage.getItem(storageKey) || '0') + 1;
        localStorage.setItem(storageKey, currentCount.toString());
        
        finalFilename = `${name}-cv-${currentCount}.pdf`;
      }
      
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configuration
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const maxWidth = pageWidth - (2 * margin);
      let currentY = margin;

      // Fonction pour ajouter du texte
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, isCenter: boolean = false, color: string = '#000000') => {
        if (currentY > pageHeight - 20) return;
        
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('calibri', 'bold');
        } else {
          doc.setFont('calibri', 'normal');
        }
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) return;
          let xPos = margin;
          let align: any = 'left';
          
          if (isCenter) {
            xPos = pageWidth / 2;
            align = 'center';
          }
          
          doc.text(line, xPos, currentY, { align });
          currentY += fontSize * 0.4;
        });
      };

      // Fonction pour ajouter une ligne horizontale DIRECTEMENT SOUS LE TITRE
      const addHorizontalLine = (titleY: number) => {
        if (currentY > pageHeight - 20) return;
        doc.setDrawColor(0, 0, 0); // Noir
        doc.setLineWidth(0.3); // Réduit de 0.5 à 0.3 pour des lignes plus fines
        // Placer la ligne DIRECTEMENT sous le titre (utiliser la position du titre)
        doc.line(margin, titleY + 0.5, pageWidth - margin, titleY + 0.5);
        currentY = titleY + 7; // Encore plus d'espace après la ligne pour séparer du contenu
      };

      // Fonction pour détecter la langue de l'offre d'emploi (copiée localement)
      const detectJobDescriptionLanguage = (jobDesc: string): string => {
        const frenchKeywords = ['recherche', 'poste', 'entreprise', 'expérience', 'compétences', 'mission', 'profil', 'candidat', 'équipe', 'développement'];
        const englishKeywords = ['looking for', 'position', 'company', 'experience', 'skills', 'mission', 'profile', 'candidate', 'team', 'development'];
        const dutchKeywords = ['zoeken', 'functie', 'bedrijf', 'ervaring', 'vaardigheden', 'missie', 'profiel', 'kandidaat', 'team', 'ontwikkeling'];
        
        const lowerJobDesc = jobDesc.toLowerCase();
        
        const frenchCount = frenchKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
        const englishCount = englishKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
        const dutchCount = dutchKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
        
        if (dutchCount > frenchCount && dutchCount > englishCount) {
          return 'dutch';
        } else if (englishCount > frenchCount && englishCount > dutchCount) {
          return 'english';
        } else {
          return 'french'; // Par défaut français
        }
      };

      // Fonction pour traduire les titres selon la langue
      const translateSectionTitle = (title: string): string => {
        const translations = {
          'EXPÉRIENCE PROFESSIONNELLE': {
            'french': 'EXPÉRIENCE PROFESSIONNELLE',
            'english': 'PROFESSIONAL EXPERIENCE',
            'dutch': 'WERKERVARING'
          },
          'FORMATION': {
            'french': 'FORMATION',
            'english': 'EDUCATION',
            'dutch': 'OPLEIDING'
          },
          'COMPÉTENCES TECHNIQUES': {
            'french': 'COMPÉTENCES TECHNIQUES',
            'english': 'TECHNICAL SKILLS',
            'dutch': 'TECHNISCHE VAARDIGHEDEN'
          },
          'CERTIFICATIONS': {
            'french': 'CERTIFICATIONS',
            'english': 'CERTIFICATIONS',
            'dutch': 'CERTIFICERINGEN'
          },
          'INFORMATIONS ADDITIONNELLES': {
            'french': 'INFORMATIONS ADDITIONNELLES',
            'english': 'ADDITIONAL INFORMATION',
            'dutch': 'AANVULLENDE INFORMATIE'
          }
        };
        
        console.log('🔍 PDF Language Debug - Raw jobDescription:', jobDescription);
        console.log('🔍 PDF Language Debug - Extracted text:', jobDescText);
        
        console.log('🔍 PDF Language Detection:', {
          jobDescText: jobDescText.substring(0, 100) + '...',
          detectedLanguage,
          title,
          translatedTitle: translations[title]?.[detectedLanguage]
        });
        
        return translations[title]?.[detectedLanguage] || title;
      };

      // Détecter la langue une seule fois au début
      const jobDescText = typeof jobDescription === 'string' 
        ? jobDescription 
        : ((jobDescription as any)?.description || (jobDescription as any)?.title || '');
      
      const detectedLanguage = detectJobDescriptionLanguage(jobDescText);
      console.log('🌍 Langue détectée pour le PDF:', detectedLanguage);

      // Fonction pour traduire les soft skills selon la langue - AMÉLIORÉE
      const translateSoftSkills = (softSkills: string): string => {
        console.log('🔄 Traduction soft skills - Langue:', detectedLanguage, 'Original:', softSkills);
        
        const commonSoftSkills = {
          'french': {
            'Esprit d\'équipe': 'Teamwork',
            'Communication': 'Communication',
            'Analyse': 'Analysis',
            'Créativité': 'Creativity',
            'Adaptabilité': 'Adaptability',
            'Leadership': 'Leadership',
            'Gestion du temps': 'Time Management',
            'Résolution de problèmes': 'Problem Solving',
            'Travail en équipe': 'Teamwork',
            'Collaboration': 'Collaboration',
            'Innovation': 'Innovation',
            'Persévérance': 'Perseverance',
            'Autonomie': 'Autonomy',
            'Rigueur': 'Rigor',
            'Polyvalence': 'Versatility',
            'Empathie': 'Empathy',
            'Négociation': 'Negotiation',
            'Formation': 'Training',
            'Mentorat': 'Mentoring'
          },
          'english': {
            'Teamwork': 'Teamwork',
            'Communication': 'Communication',
            'Analysis': 'Analysis',
            'Creativity': 'Creativity',
            'Adaptability': 'Adaptability',
            'Leadership': 'Leadership',
            'Time Management': 'Time Management',
            'Problem Solving': 'Problem Solving',
            'Collaboration': 'Collaboration',
            'Innovation': 'Innovation',
            'Perseverance': 'Perseverance',
            'Autonomy': 'Autonomy',
            'Rigor': 'Rigor',
            'Versatility': 'Versatility',
            'Empathy': 'Empathy',
            'Negotiation': 'Negotiation',
            'Training': 'Training',
            'Mentoring': 'Mentoring'
          },
          'dutch': {
            'Teamwork': 'Teamwerk',
            'Communication': 'Communicatie',
            'Analysis': 'Analyse',
            'Creativity': 'Creativiteit',
            'Adaptability': 'Aanpassingsvermogen',
            'Leadership': 'Leiderschap',
            'Time Management': 'Tijdbeheer',
            'Problem Solving': 'Probleemoplossing',
            'Collaboration': 'Samenwerking',
            'Innovation': 'Innovatie',
            'Perseverance': 'Doorzettingsvermogen',
            'Autonomy': 'Autonomie',
            'Rigor': 'Stiptheid',
            'Versatility': 'Veelzijdigheid',
            'Empathy': 'Empathie',
            'Negotiation': 'Onderhandeling',
            'Training': 'Opleiding',
            'Mentoring': 'Mentoring'
          }
        };
        
        let translatedSkills = softSkills;
        
        // Traduire selon la langue détectée
        if (detectedLanguage === 'english') {
          Object.entries(commonSoftSkills.french).forEach(([french, english]) => {
            translatedSkills = translatedSkills.replace(new RegExp(french.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), english);
          });
        } else if (detectedLanguage === 'dutch') {
          Object.entries(commonSoftSkills.french).forEach(([french, dutch]) => {
            const dutchTranslation = commonSoftSkills.dutch[french] || french;
            translatedSkills = translatedSkills.replace(new RegExp(french.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi'), dutchTranslation);
          });
        }
        
        console.log('✅ Soft skills traduits:', translatedSkills);
        return translatedSkills;
      };

      // === GÉNÉRATION PDF AVEC DONNÉES STRUCTURÉES ===
      
      // 1. HEADER - Nom, Contact, Titre
      addText(parsedCV.name, 18.3, true, true, '#000000'); // 18.0 -> 18.3 (+0.3pt)
      currentY += 3;
      
      addText(parsedCV.contact, 10.3, false, true, '#000000'); // 10.0 -> 10.3 (+0.3pt)
      currentY += 2; // Augmenté de 1 à 2 pour plus d'espace
      
      addText(parsedCV.title, 14.3, true, true, '#000000'); // 14.0 -> 14.3 (+0.3pt)
      currentY += 4;
      
      // 2. RÉSUMÉ PROFESSIONNEL
      if (parsedCV.summary && parsedCV.summary.trim()) {
        addText(parsedCV.summary, 10.3, false, false, '#000000'); // 10.0 -> 10.3 (+0.3pt)
        currentY += 3;
      }
      
      // 3. EXPÉRIENCE PROFESSIONNELLE
      if (parsedCV.experience && parsedCV.experience.length > 0) {
        currentY += 4;
        const titleY = currentY;
        addText(translateSectionTitle('EXPÉRIENCE PROFESSIONNELLE'), 12.3, true, false, '#000000'); // 12.0 -> 12.3 (+0.3pt)
        addHorizontalLine(titleY);
        
        parsedCV.experience.forEach(exp => {
          // Entreprise et poste sur une ligne
          const companyPosition = `${exp.company} - ${exp.position} (${exp.period})`;
          addText(companyPosition, 11.3, true, false, '#000000'); // 11.0 -> 11.3 (+0.3pt)
          currentY += 1;
          
          // Descriptions avec bullet points
          exp.description.forEach(desc => {
            addText(`• ${desc}`, 10.3, false, false, '#000000'); // 10.0 -> 10.3 (+0.3pt)
            currentY += 2.5;
          });
          currentY += 1;
        });
      }
      
      // 4. FORMATION
      if (parsedCV.education && parsedCV.education.length > 0) {
        currentY += 4;
        const titleY = currentY;
        addText(translateSectionTitle('FORMATION'), 12.3, true, false, '#000000'); // 12.0 -> 12.3 (+0.3pt)
        addHorizontalLine(titleY);
        
        parsedCV.education.forEach(edu => {
          // Institution et diplôme sur une ligne
          const institutionDegree = `${edu.institution} - ${edu.degree} (${edu.period})`;
          addText(institutionDegree, 11.3, true, false, '#000000'); // 11.0 -> 11.3 (+0.3pt)
          currentY += 1;
          
          // Description
          if (edu.description) {
            addText(`• ${edu.description}`, 10.3, false, false, '#000000'); // 10.0 -> 10.3 (+0.3pt)
            currentY += 2.5;
          }
          currentY += 1;
        });
      }
      
      // 5. CERTIFICATIONS (déplacées vers informations additionnelles)
      
      // 6. INFORMATIONS ADDITIONNELLES
      if (parsedCV.technicalSkills || parsedCV.softSkills || parsedCV.additionalInfo || parsedCV.certifications.length > 0) {
        currentY += 4;
        const titleY = currentY;
        addText(translateSectionTitle('INFORMATIONS ADDITIONNELLES'), 12.3, true, false, '#000000'); // 12.0 -> 12.3 (+0.3pt)
        addHorizontalLine(titleY);
        
        if (parsedCV.technicalSkills) {
          // Traduire le label selon la langue
          const techSkillsLabel = detectedLanguage === 'english' ? 'Technical skills' : 
                                 detectedLanguage === 'dutch' ? 'Technische vaardigheden' : 
                                 'Compétences techniques';
          addText(`• ${techSkillsLabel} : ${parsedCV.technicalSkills}`, 10.3, false, false, '#000000'); // 10.0 -> 10.3 (+0.3pt)
          currentY += 2.5;
        }
        
        if (parsedCV.softSkills) {
          const translatedSoftSkills = translateSoftSkills(parsedCV.softSkills);
          addText(`• Soft skills : ${translatedSoftSkills}`, 10.3, false, false, '#000000'); // 10.0 -> 10.3 (+0.3pt)
          currentY += 2.5;
        }
        
        if (parsedCV.certifications && parsedCV.certifications.length > 0) {
          console.log('🎯 AFFICHAGE CERTIFICATIONS dans PDF:', parsedCV.certifications);
          
          // Traduire le label selon la langue
          const certLabel = detectedLanguage === 'english' ? 'Certifications' : 
                           detectedLanguage === 'dutch' ? 'Certificeringen' : 
                           'Certifications';
          
          addText(`• ${certLabel} : `, 10.3, false, false, '#000000'); // 10.0 -> 10.3 (+0.3pt)
          // Ajouter les certifications en gras
          const certText = parsedCV.certifications.join(', ');
          console.log('🎯 Texte certifications à afficher:', certText);
          doc.setFont(undefined, 'bold');
          addText(certText, 10.3, false, false, '#000000'); // 10.0 -> 10.3 (+0.3pt)
          doc.setFont(undefined, 'normal'); // Remettre en normal
          currentY += 2.5;
        } else {
          console.log('❌ AUCUNE certification à afficher dans le PDF');
          console.log('🔍 parsedCV.certifications:', parsedCV.certifications);
        }
        
        if (parsedCV.additionalInfo) {
          // Séparer les langues du reste des informations additionnelles
          const infoParts = parsedCV.additionalInfo.split(',');
          const languages = infoParts.filter(part => 
            part.toLowerCase().includes('français') || 
            part.toLowerCase().includes('anglais') || 
            part.toLowerCase().includes('espagnol') || 
            part.toLowerCase().includes('allemand') || 
            part.toLowerCase().includes('italien') || 
            part.toLowerCase().includes('néerlandais') || 
            part.toLowerCase().includes('turc') ||
            part.toLowerCase().includes('bilingue') ||
            part.toLowerCase().includes('c1') ||
            part.toLowerCase().includes('c2') ||
            part.toLowerCase().includes('b1') ||
            part.toLowerCase().includes('b2')
          );
          const otherInfo = infoParts.filter(part => !languages.includes(part));
          
          // Afficher les autres informations d'abord
          if (otherInfo.length > 0) {
            addText(`• ${otherInfo.join(', ')}`, 10.3, false, false, '#000000'); // 10.0 -> 10.3 (+0.3pt)
            currentY += 2.5;
          }
          
          // Afficher les langues en gras en dernier (sans ** et sans duplication "langues")
          if (languages.length > 0) {
            const cleanLanguages = languages.map(lang => 
              lang.replace(/\*\*/g, '').replace(/langues?\s*:?\s*/gi, '').trim()
            ).join(', ');
            addText(`• Langues : ${cleanLanguages}`, 10.3, true, false, '#000000'); // 10.0 -> 10.3 (+0.3pt)
            currentY += 2.5;
          }
        }
      }

      doc.save(finalFilename);
      console.log('✅ PDF généré avec succès (ancienne version):', finalFilename);
      
    } catch (error) {
      console.error('❌ Erreur génération PDF (ancienne version):', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}