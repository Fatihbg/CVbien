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
  languages: string;
  additionalInfo: string;
  hasLanguagesInEducation?: boolean;
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
    
    // Nettoyer le texte en supprimant les phrases d'adaptation et éléments indésirables
    let cleanedText = cvText;
    
    // Supprimer les phrases d'adaptation courantes
    const adaptationPhrases = [
      /This CV is structured to align with the job description provided[^.]*\./gi,
      /Ce CV a été structuré pour correspondre à la description du poste[^.]*\./gi,
      /This CV has been designed to align[^.]*\./gi,
      /Ce CV a été conçu pour correspondre[^.]*\./gi,
      /focusing on relevant skills and experiences that match the requirements[^.]*\./gi,
      /en me concentrant sur les compétences et expériences pertinentes[^.]*\./gi,
      /Committed to continuous learning and professional development[^.]*\./gi,
      /Engagé dans l'apprentissage continu et le développement professionnel[^.]*\./gi,
      /This CV aligns with the qualifications sought by Sopra Steria[^.]*\./gi,
      /Ce CV correspond aux qualifications recherchées par Sopra Steria[^.]*\./gi,
      /showcasing my relevant skills and experiences[^.]*\./gi,
      /mettant en valeur mes compétences et expériences pertinentes[^.]*\./gi,
      /This CV showcases my qualifications and readiness for a role in consulting[^.]*\./gi,
      /Ce CV met en valeur mes qualifications et ma préparation pour un rôle de consultant[^.]*\./gi,
      /aligning with the expectations outlined in the job description[^.]*\./gi,
      /en alignement avec les attentes décrites dans la description du poste[^.]*\./gi,
      /provided by Sopra Steria[^.]*\./gi,
      /fournie par Sopra Steria[^.]*\./gi,
      /This CV is tailored to highlight qualifications and experiences relevant to the position at Sopra Steria[^.]*\./gi,
      /Ce CV est conçu pour mettre en valeur les qualifications et expériences pertinentes pour le poste chez Sopra Steria[^.]*\./gi,
      /ensuring alignment with the job's requirements[^.]*\./gi,
      /en assurant l'alignement avec les exigences du poste[^.]*\./gi,
      /This CV is designed to align with the requirements of the Consulting Business Line at Sopra Steria[^.]*\./gi,
      /Ce CV est conçu pour correspondre aux exigences de la ligne de conseil chez Sopra Steria[^.]*\./gi,
      /showcasing relevant skills and experiences to support a successful application[^.]*\./gi,
      /mettant en valeur les compétences et expériences pertinentes pour soutenir une candidature réussie[^.]*\./gi
    ];
    
    adaptationPhrases.forEach(phrase => {
      cleanedText = cleanedText.replace(phrase, '');
    });
    
    // Supprimer les liens dupliqués du texte (garder seulement l'URL dans les parenthèses)
    const linkPatterns = [
      /\*\*LinkedIn:\*\*\s*\[[^\]]+\]\([^)]+\)\s*\(\)?\s*/gi,
      /\*\*Portfolio:\*\*\s*\[[^\]]+\]\([^)]+\)\s*\(\)?\s*/gi,
      /\*\*Agency Website:\*\*\s*\[[^\]]+\]\([^)]+\)\s*\(\)?\s*/gi,
      /LinkedIn:\s*\[[^\]]+\]\([^)]+\)\s*\(\)?\s*/gi,
      /Portfolio:\s*\[[^\]]+\]\([^)]+\)\s*\(\)?\s*/gi,
      /Agency Website:\s*\[[^\]]+\]\([^)]+\)\s*\(\)?\s*/gi,
      /Website:\s*\[[^\]]+\]\([^)]+\)\s*/gi,
      /\[cvbien\.dev\]\(https:\/\/cvbien\.dev\)/gi,
      /\[dagence\.be\]\(https:\/\/dagence\.be\)/gi
    ];
    
    linkPatterns.forEach(pattern => {
      cleanedText = cleanedText.replace(pattern, '');
    });
    
    // Supprimer les lignes bizarres avec des % et des ()
    cleanedText = cleanedText.replace(/[%]+\s*\(\)?\s*/g, '');
    cleanedText = cleanedText.replace(/[%]+\s*/g, '');
    
    // Supprimer les parenthèses vides
    cleanedText = cleanedText.replace(/\(\s*\)/g, '');
    
    const lines = cleanedText.split('\n').map(line => line.trim()).filter(line => line);
    console.log('📝 Nombre de lignes après nettoyage:', lines.length);
    
    // Trouver le nom (première ligne en majuscules)
    const name = lines.find(line => line.length > 3 && line.length < 50 && line === line.toUpperCase()) || 'Nom Prénom';
    
    // Trouver le contact (ligne avec @ ou téléphone)
    let contact = lines.find(line => line.includes('@') || line.match(/[\+]?[0-9\s\-\(\)]{10,}/)) || 'Contact';
    
    // Extraire les liens du texte original pour les ajouter au contact
    const extractedLinks: string[] = [];
    
    // Chercher les liens LinkedIn, Portfolio, Agency Website dans le texte original
    const linkMatches = [
      { pattern: /\[([^\]]+)\]\(https:\/\/www\.linkedin\.com\/in\/[^)]+\)/gi, prefix: '[LinkedIn]' },
      { pattern: /\[([^\]]+)\]\(https:\/\/cvbien\.dev\)/gi, prefix: '[https://cvbien.dev]' },
      { pattern: /\[([^\]]+)\]\(https:\/\/dagence\.be\)/gi, prefix: '[https://dagence.be]' }
    ];
    
    linkMatches.forEach(({ pattern, prefix }) => {
      const matches = cvText.match(pattern);
      if (matches) {
        extractedLinks.push(prefix);
      }
    });
    
    // Ajouter les liens au contact s'ils existent (éviter la duplication)
    if (extractedLinks.length > 0) {
      // Vérifier si les liens ne sont pas déjà présents dans le contact
      const existingLinks = extractedLinks.filter(link => contact.includes(link.replace(/\[|\]/g, '')));
      const newLinks = extractedLinks.filter(link => !contact.includes(link.replace(/\[|\]/g, '')));
      
      if (newLinks.length > 0) {
        contact += ' | ' + newLinks.join(' | ');
      }
    }
    
    // Nettoyer les liens dupliqués dans le contact - VERSION ROBUSTE
    const linkRegex = /\[([^\]]+)\]\([^)]+\)/g;
    const allLinks = contact.match(linkRegex) || [];
    
    // Extraire les URLs uniques (pas les liens complets)
    const uniqueUrls = new Set<string>();
    allLinks.forEach((link: string) => {
      const urlMatch = link.match(/\(([^)]+)\)/);
      if (urlMatch) {
        uniqueUrls.add(urlMatch[1]);
      }
    });
    
    // Reconstruire le contact sans doublons
    let cleanContact = contact;
    
    // Supprimer tous les liens existants
    cleanContact = cleanContact.replace(/\[([^\]]+)\]\([^)]+\)/g, '');
    
    // Ajouter seulement les URLs uniques
    if (uniqueUrls.size > 0) {
      const baseContact = cleanContact.replace(/\|\s*$/, '').trim();
      const uniqueLinksArray = Array.from(uniqueUrls).map(url => `[${url}]`);
      cleanContact = baseContact + ' | ' + uniqueLinksArray.join(' | ');
    }
    
    // Nettoyer les espaces et séparateurs multiples
    cleanContact = cleanContact.replace(/\|\s*\|/g, '|').replace(/\s+/g, ' ').trim();
    contact = cleanContact;
    
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
        line.includes('EDUCATION') || line.includes('COMPETENCES') ||
        line.includes('ACADEMIC') || line.includes('ADDITIONAL')
      )) {
        break;
      }
      
      // Si c'est un paragraphe long et cohérent, c'est probablement le résumé
      if (line.length > 50 && line.length < 500 && 
          !line.includes('•') && !line.includes('-') && 
          !line.includes('(') && !line.includes(')') &&
          !line.includes('**') &&
          line.includes(' ') && line.includes('.')) {
        summary = line;
        break;
      }
    }
    
    // Si pas de résumé trouvé, chercher dans le texte original
    if (!summary) {
      const summaryPatterns = [
        /Driven by[^.]*\./i,
        /Motivated by[^.]*\./i,
        /Passionate about[^.]*\./i,
        /I am a[^.]*\./i,
        /I have[^.]*\./i
      ];
      
      for (const pattern of summaryPatterns) {
        const match = cvText.match(pattern);
        if (match && match[0].length > 20) {
          summary = match[0];
          break;
        }
      }
    }
    
    if (!summary) {
      summary = 'Professional with experience in business analysis and IT development.';
    }
    
    // Parser les expériences - AMÉLIORÉ pour préserver TOUT le contenu
    const experience: Array<{company: string; position: string; period: string; description: string[]}> = [];
    const education: Array<{institution: string; degree: string; period: string; description: string}> = [];
    
    let currentSection = '';
    let currentExperience: any = null;
    let currentEducation: any = null;
    let currentSkills = '';
    let currentCertifications: string[] = [];
    let currentLanguages = '';
    let currentSoftSkills = '';
    
    // Variables pour éviter les duplications
    let hasSkillsInEducation = false;
    let hasLanguagesInEducation = false;
    
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
      if (cleanLine.includes('SKILLS') || cleanLine.includes('COMPETENCES') || cleanLine.includes('COMPÉTENCES') || cleanLine.includes('TECHNICAL SKILLS') || cleanLine.includes('SOFT SKILLS')) {
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
          const cleanDesc = line.replace(/^[•\-*]\s*/, '').trim();
          // Éviter d'ajouter les langues/skills dans les descriptions d'expérience
          if (!cleanDesc.toLowerCase().includes('languages:') && 
              !cleanDesc.toLowerCase().includes('langues:') &&
              !cleanDesc.toLowerCase().includes('skills:') &&
              !cleanDesc.toLowerCase().includes('compétences:')) {
            currentExperience.description.push(cleanDesc);
          }
        }
        // Lignes de description sans puce
        else if (currentExperience && line.length > 10 && !line.includes('(') && !line.includes('-') && !line.includes('**')) {
          // Éviter d'ajouter les langues/skills dans les descriptions d'expérience
          if (!line.toLowerCase().includes('languages:') && 
              !line.toLowerCase().includes('langues:') &&
              !line.toLowerCase().includes('skills:') &&
              !line.toLowerCase().includes('compétences:')) {
            currentExperience.description.push(line.trim());
          }
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
          const cleanLine = line.replace(/^[•\-*]\s*/, '').trim();
          
          // Séparer les skills/langues de la description académique - IGNORER complètement
          if (cleanLine.toLowerCase().includes('languages:') || cleanLine.toLowerCase().includes('langues:')) {
            if (!hasLanguagesInEducation) {
              currentLanguages = cleanLine;
              hasLanguagesInEducation = true;
            }
            // NE PAS ajouter aux descriptions académiques - IGNORER complètement
            continue; // Passer à l'itération suivante
          } else if (cleanLine.toLowerCase().includes('skills:') || cleanLine.toLowerCase().includes('compétences:')) {
            if (!hasSkillsInEducation) {
              currentSkills = cleanLine;
              hasSkillsInEducation = true;
            }
            // NE PAS ajouter aux descriptions académiques - IGNORER complètement
            continue; // Passer à l'itération suivante
          } else {
            // C'est une vraie description académique - nettoyer avant d'ajouter
            let academicDesc = cleanLine;
            // Supprimer les phrases d'adaptation des descriptions académiques
            academicDesc = academicDesc.replace(/This CV aligns with the qualifications[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/showcasing my relevant skills[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/This CV showcases my qualifications and readiness[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/aligning with the expectations outlined[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/provided by Sopra Steria[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/This CV is tailored to highlight qualifications[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/ensuring alignment with the job's requirements[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/This CV is designed to align with the requirements of the Consulting Business Line[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/showcasing relevant skills and experiences to support a successful application[^.]*\./gi, '');
            
            if (academicDesc.trim()) {
              if (currentEducation.description) {
                currentEducation.description += ' ' + academicDesc;
              } else {
                currentEducation.description = academicDesc;
              }
            }
          }
        }
        // Lignes de description sans puce
        else if (currentEducation && line.length > 10 && !line.includes('(') && !line.includes('-')) {
          // Séparer les skills/langues de la description académique - IGNORER complètement
          if (line.toLowerCase().includes('languages:') || line.toLowerCase().includes('langues:')) {
            if (!hasLanguagesInEducation) {
              currentLanguages = line.trim();
              hasLanguagesInEducation = true;
            }
            // NE PAS ajouter aux descriptions académiques - IGNORER complètement
            continue; // Passer à l'itération suivante
          } else if (line.toLowerCase().includes('skills:') || line.toLowerCase().includes('compétences:')) {
            if (!hasSkillsInEducation) {
              currentSkills = line.trim();
              hasSkillsInEducation = true;
            }
            // NE PAS ajouter aux descriptions académiques - IGNORER complètement
            continue; // Passer à l'itération suivante
          } else {
            // C'est une vraie description académique - nettoyer avant d'ajouter
            let academicDesc = line.trim();
            // Supprimer les phrases d'adaptation des descriptions académiques
            academicDesc = academicDesc.replace(/This CV aligns with the qualifications[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/showcasing my relevant skills[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/This CV showcases my qualifications and readiness[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/aligning with the expectations outlined[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/provided by Sopra Steria[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/This CV is tailored to highlight qualifications[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/ensuring alignment with the job's requirements[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/This CV is designed to align with the requirements of the Consulting Business Line[^.]*\./gi, '');
            academicDesc = academicDesc.replace(/showcasing relevant skills and experiences to support a successful application[^.]*\./gi, '');
            
            if (academicDesc.trim()) {
              if (currentEducation.description) {
                currentEducation.description += ' ' + academicDesc;
              } else {
                currentEducation.description = academicDesc;
              }
            }
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
                  if (languagesText && !currentLanguages) {
                    currentLanguages = `Langues: ${languagesText}`;
                  }
                }
              } else if (content.toLowerCase().includes('soft skills') || content.toLowerCase().includes('compétences comportementales') || content.toLowerCase().includes('aptitudes')) {
                // Extraire les soft skills après les deux points
                const colonIndex = content.indexOf(':');
                if (colonIndex !== -1) {
                  const softSkillsText = content.substring(colonIndex + 1).trim();
                  if (softSkillsText && !currentSoftSkills) {
                    currentSoftSkills = softSkillsText;
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
                // Contenu général, l'ajouter aux compétences techniques
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
    
    // Nettoyer et organiser les compétences
    let technicalSkills = currentSkills || '';
    
    // Nettoyer les compétences techniques pour éviter les duplications
    if (technicalSkills) {
      // Supprimer les phrases d'adaptation
      technicalSkills = technicalSkills.replace(/This CV is structured to align[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/focusing on relevant skills[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/Strong interest in AI[^.]*\./gi, '');
      
      // Supprimer le contenu du résumé professionnel qui pourrait être mélangé
      technicalSkills = technicalSkills.replace(/tout en sortant de ma zone de confort[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/Je combine rigueur analytique[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/Mon expérience en tant que Business Analyst[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/This CV showcases my qualifications and readiness[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/aligning with the expectations outlined[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/provided by Sopra Steria[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/This CV is tailored to highlight qualifications[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/ensuring alignment with the job's requirements[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/This CV is designed to align with the requirements of the Consulting Business Line[^.]*\./gi, '');
      technicalSkills = technicalSkills.replace(/showcasing relevant skills and experiences to support a successful application[^.]*\./gi, '');
      
      // Séparer les langues des compétences techniques si elles sont mélangées
      if (technicalSkills.includes('Langues:') || technicalSkills.includes('Languages:')) {
        const langMatch = technicalSkills.match(/(.*?)(Langues?|Languages?):\s*([^|]+)/i);
        if (langMatch) {
          technicalSkills = langMatch[1].trim();
          if (!currentLanguages) {
            currentLanguages = `Langues: ${langMatch[3].trim()}`;
          }
        }
      }
      
      // Nettoyer les espaces et virgules multiples
      technicalSkills = technicalSkills.replace(/\s+/g, ' ').replace(/,\s*,/g, ',').trim();
    }
    
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
        const skillsMatch = cleanedText.match(pattern);
        if (skillsMatch && skillsMatch[1].trim()) {
          technicalSkills = skillsMatch[1].trim();
          break;
        }
      }
    }
    
    // Soft skills - utiliser les données collectées ou détecter
    let softSkills = currentSoftSkills || '';
    
    // Si pas de soft skills collectés, détecter dans le texte
    if (!softSkills) {
      // Mots-clés de soft skills à rechercher
      const softSkillsKeywords = [
        'analytical rigor', 'rigueur analytique', 'entrepreneurial spirit', 'esprit entrepreneurial',
        'technological curiosity', 'curiosité technologique', 'teamwork', 'travail en équipe',
        'communication', 'leadership', 'problem solving', 'résolution de problèmes',
        'adaptability', 'adaptabilité', 'creativity', 'créativité', 'innovation'
      ];
      
      // Chercher les soft skills dans le texte
      const foundSoftSkills = softSkillsKeywords.filter(keyword => 
        cleanedText.toLowerCase().includes(keyword.toLowerCase())
      );
      
      if (foundSoftSkills.length > 0) {
        softSkills = foundSoftSkills.join(', ');
      } else {
        // Fallback sur regex si pas trouvé
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
          const softMatch = cleanedText.match(pattern);
          if (softMatch && softMatch[1].trim()) {
            softSkills = softMatch[1].trim();
            break;
          }
        }
      }
    }
    
    // Organiser les langues - utiliser les données collectées ou détecter
    let languages = currentLanguages || '';
    
    // Si pas de langues collectées, détecter dans le texte
    if (!languages) {
      const languagePatterns = [
        /Langues?\s*:?\s*([^•\n]+)/i,
        /Languages?\s*:?\s*([^•\n]+)/i,
        /Talen?\s*:?\s*([^•\n]+)/i
      ];
      
      for (const pattern of languagePatterns) {
        const langMatch = cleanedText.match(pattern);
        if (langMatch && langMatch[1].trim()) {
          languages = `Langues: ${langMatch[1].trim()}`;
          break;
        }
      }
    }
    
    // Nettoyer les langues
    if (languages) {
      languages = languages.replace(/Langues?\s*:?\s*/i, 'Langues: ');
      languages = languages.replace(/Languages?\s*:?\s*/i, 'Langues: ');
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
    console.log('  - Soft skills détectés:', softSkills ? '✅' : '❌');
    console.log('  - Soft skills contenu:', softSkills);
    console.log('  - Certifications collectées:', certifications.length);
    console.log('  - Certifications contenu:', certifications);
    
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
      languages,
      additionalInfo: '',
      hasLanguagesInEducation
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
        // Gérer les pages multiples
        if (currentY > pageHeight - 20) {
          doc.addPage();
          currentY = margin;
        }
        
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) {
            doc.addPage();
            currentY = margin;
          }
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
      
      // Fonction pour ajouter du texte sans ligne horizontale automatique
      const addTextNoLine = (text: string, fontSize: number = 10, isBold: boolean = false, isCenter: boolean = false, color: string = '#000000') => {
        if (currentY > pageHeight - 20) return;
        
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
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

      // Générer le PDF avec les données parsées - ORDRE EXACT
      // 1. PRENOM NOM
      addText(parsedData.name, 18.3, true, true, '#1a365d');
      currentY += 5;
      
      // 2. CONTACT (avec liens uniques)
      let contactText = parsedData.contact;
      addText(contactText, 10.3, false, true, '#4a5568');
      currentY += 3;
      
      // 3. POSTE
      addText(parsedData.title, 12.3, false, true, '#2d3748');
      currentY += 8;
      
      // 4. RÉSUMÉ PROFESSIONNEL
      if (parsedData.summary) {
        const summaryTitle = translateSectionTitle('PROFESSIONAL SUMMARY');
        addText(summaryTitle, 12.3, true, false, '#1a365d');
        addHorizontalLine(currentY - 2);
        addText(parsedData.summary, 10.3, false, false, '#2d3748');
        currentY += 5;
      }
      
      // 5. EXPÉRIENCES PROFESSIONNELLES
      if (parsedData.experience && parsedData.experience.length > 0) {
        const expTitle = translateSectionTitle('EXPÉRIENCE PROFESSIONNELLE');
        addText(expTitle, 12.3, true, false, '#1a365d');
        addHorizontalLine(currentY - 2);
        
        parsedData.experience.forEach((exp: any) => {
          // Nettoyer le nom de l'entreprise pour enlever les liens
          const cleanCompany = exp.company.replace(/\[https?:\/\/[^\]]+\]\s*/, '').replace(/\s*\(https?:\/\/[^)]+\)/, '').trim();
          const cleanPeriod = exp.period.replace(/\(\)/, '').trim();
          addText(`${cleanCompany} - ${exp.position} (${cleanPeriod})`, 10.3, true, false, '#2d3748');
          currentY += 2;
          
          exp.description.forEach((desc: string) => {
            // Corriger les pourcentages manquants (35, 40, 25 -> 35%, 40%, 25%)
            let cleanDesc = desc;
            // Ajouter % après les nombres suivis de mots-clés d'amélioration
            cleanDesc = cleanDesc.replace(/(\d+)(?!\s*%|\d)(\s+(through|increase|improved|improvement|growth|reduction|enhanced|achieving|achieved))/gi, '$1%$2');
            // Ajouter % après "by X" (ex: "by 25" -> "by 25%")
            cleanDesc = cleanDesc.replace(/by\s+(\d+)(?!\s*%)/gi, 'by $1%');
            // Ajouter % après les nombres en fin de phrase (ex: "efficiency by 25." -> "efficiency by 25%.")
            cleanDesc = cleanDesc.replace(/(\d+)(\s*[.,;])/g, '$1%$2');
            addText(`• ${cleanDesc}`, 10.3, false, false, '#2d3748');
            currentY += 1;
          });
          currentY += 3;
        });
      }
      
      // 6. FORMATION
      if (parsedData.education && parsedData.education.length > 0) {
        const eduTitle = translateSectionTitle('FORMATION');
        addText(eduTitle, 12.3, true, false, '#1a365d');
        addHorizontalLine(currentY - 2);
        
        parsedData.education.forEach((edu: any) => {
          // Nettoyer la période pour enlever les parenthèses vides
          const cleanPeriod = edu.period.replace(/\(\)/, '').trim();
          addText(`${edu.institution} - ${edu.degree} (${cleanPeriod})`, 10.3, true, false, '#2d3748');
          currentY += 2;
          
          if (edu.description) {
            let cleanDescription = edu.description;
            // Supprimer les skills/langues de la description académique - VERSION ROBUSTE
            cleanDescription = cleanDescription.replace(/\s*Languages?:[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*Langues?:[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*Skills?:[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*Compétences?:[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*•\s*Languages?:[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*•\s*Langues?:[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*•\s*Skills?:[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*•\s*Compétences?:[^.]*\.?/gi, '');
            // Supprimer les lignes qui commencent par "- Languages:" ou "- Langues:"
            cleanDescription = cleanDescription.replace(/^\s*-\s*(Languages?|Langues?):[^\n]*$/gm, '');
            cleanDescription = cleanDescription.replace(/\s*Strong interest[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*Committed to continuous learning[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*Engagé dans l'apprentissage[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*This CV aligns with the qualifications[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*showcasing my relevant skills[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*This CV showcases my qualifications and readiness[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*aligning with the expectations outlined[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*provided by Sopra Steria[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*This CV is tailored to highlight qualifications[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*ensuring alignment with the job's requirements[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*This CV is designed to align with the requirements of the Consulting Business Line[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.replace(/\s*showcasing relevant skills and experiences to support a successful application[^.]*\.?/gi, '');
            cleanDescription = cleanDescription.trim();
            
            if (cleanDescription) {
              addTextNoLine(cleanDescription, 10.3, false, false, '#2d3748');
              currentY += 1;
            }
          }
          currentY += 3;
        });
      }
      
      // 7. INFORMATIONS ADDITIONNELLES (Skills, Soft Skills, Certifications, Langues)
      if (parsedData.technicalSkills || parsedData.softSkills || (parsedData.certifications && parsedData.certifications.length > 0)) {
        const addInfoTitle = translateSectionTitle('INFORMATIONS ADDITIONNELLES');
        addText(addInfoTitle, 12.3, true, false, '#1a365d');
        addHorizontalLine(currentY - 2);
        
        // Compétences techniques (éviter la duplication)
        if (parsedData.technicalSkills && !parsedData.technicalSkills.includes('Langues:') && !parsedData.technicalSkills.includes('Languages:')) {
          const techLabel = detectedLanguage === 'english' ? 'Skills:' : 
                           detectedLanguage === 'dutch' ? 'Vaardigheden:' : 'Compétences:';
          // Nettoyer le contenu pour éviter les duplications
          let cleanSkills = parsedData.technicalSkills;
          if (cleanSkills.includes('Strong interest')) {
            cleanSkills = cleanSkills.split('Strong interest')[0].trim();
          }
          // Supprimer les labels dupliqués au début
          cleanSkills = cleanSkills.replace(/^(Skills?|Compétences?|Vaardigheden?):\s*/i, '').trim();
          addText(`${techLabel} ${cleanSkills}`, 10.3, false, false, '#2d3748');
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
          addTextNoLine(`${certLabel} ${certText}`, 10.3, false, false, '#2d3748');
          currentY += 3;
        }
        
        // Langues (séparées des compétences techniques) - UNIQUEMENT si elles existent
        if (parsedData.languages && parsedData.languages.trim()) {
          const langLabel = detectedLanguage === 'english' ? 'Languages:' : 
                           detectedLanguage === 'dutch' ? 'Talen:' : 'Langues:';
          const cleanLanguages = parsedData.languages.replace(/^Langues?\s*:?\s*/i, '').replace(/^Languages?\s*:?\s*/i, '').trim();
          if (cleanLanguages) {
            addText(`${langLabel} ${cleanLanguages}`, 10.3, false, false, '#2d3748');
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
      
      // Créer le PDF directement avec le texte du CV (format simplifié)
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const pageHeight = doc.internal.pageSize.height;
      const margin = 20;
      const maxWidth = pageWidth - (margin * 2);
      
      let currentY = margin;
      
      // Fonction pour ajouter du texte avec gestion des pages multiples
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, isCenter: boolean = false, color: string = '#000000') => {
        // Gérer les pages multiples
        if (currentY > pageHeight - 20) {
          doc.addPage();
          currentY = margin;
        }
        
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) {
            doc.addPage();
            currentY = margin;
          }
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
      const addHorizontalLine = (y: number) => {
        doc.setDrawColor(0, 0, 0);
        doc.setLineWidth(0.3);
        doc.line(margin, y, pageWidth - margin, y);
      };
      
      // Parser le CV ligne par ligne
      const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        
        // Nom en gras et centré
        if (line.startsWith('**') && line.endsWith('**') && i < 3) {
          const name = line.replace(/\*\*/g, '').trim();
          addText(name, 16, true, true, '#1a365d');
          currentY += 5;
        }
        // Contact
        else if (line.includes('@') || line.match(/[\+]?[0-9\s\-\(\)]{10,}/)) {
          addText(line, 10, false, true, '#2d3748');
          currentY += 3;
        }
        // Titre professionnel
        else if (line.startsWith('**') && line.endsWith('**') && i > 2) {
          const title = line.replace(/\*\*/g, '').trim();
          addText(title, 12, true, true, '#2d3748');
          currentY += 5;
        }
        // Titres de sections
        else if (line.includes('EXPERIENCE') || line.includes('EDUCATION') || line.includes('CERTIFICATIONS') || line.includes('ADDITIONAL') || line.includes('SOFT SKILLS')) {
          addHorizontalLine(currentY + 3);
          currentY += 8;
          addText(line, 12, true, false, '#1a365d');
          addHorizontalLine(currentY + 3);
          currentY += 5;
        }
        // Lignes de séparation
        else if (line.includes('---')) {
          addHorizontalLine(currentY);
          currentY += 3;
        }
        // Positions en gras
        else if (line.startsWith('**') && line.endsWith('**')) {
          const position = line.replace(/\*\*/g, '').trim();
          addText(position, 11, true, false, '#2d3748');
          currentY += 2;
        }
        // Entreprises avec dates
        else if (line.includes('(') && line.includes(')') && !line.includes('•')) {
          addText(line, 10, false, false, '#2d3748');
          currentY += 2;
        }
        // Points avec puces
        else if (line.startsWith('•')) {
          const content = line.replace(/^•\s*/, '').trim();
          // Corriger les pourcentages manquants
          const correctedContent = content.replace(/(\d+)(?!\s*%)(?=\s*(through|increase|improvement|growth|reduction|by))/gi, '$1%');
          addText(`• ${correctedContent}`, 10, false, false, '#2d3748');
          currentY += 1;
        }
        // Texte normal
        else if (line.length > 0) {
          addText(line, 10, false, false, '#2d3748');
          currentY += 1;
        }
        
        // Espacement entre les sections
        if (line.includes('EXPERIENCE') || line.includes('EDUCATION') || line.includes('CERTIFICATIONS') || line.includes('SOFT SKILLS')) {
          currentY += 3;
        }
      }
      
      // Générer un nom de fichier dynamique si non fourni
      let finalFilename = filename;
      if (!finalFilename) {
        const nameMatch = cvText.match(/^\*\*([^*]+)\*\*/);
        const name = nameMatch ? nameMatch[1].toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') : 'cv';
        
        // Utiliser localStorage pour compter les téléchargements
        const storageKey = `cv-download-count-${name}`;
        const currentCount = parseInt(localStorage.getItem(storageKey) || '0') + 1;
        localStorage.setItem(storageKey, currentCount.toString());
        
        const timestamp = new Date().toISOString().split('T')[0];
        finalFilename = `${name}-cv-optimized-${timestamp}-v${currentCount}.pdf`;
      }
      
      // Sauvegarder le PDF
      doc.save(finalFilename);
      
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
        // Gérer les pages multiples
        if (currentY > pageHeight - 20) {
          doc.addPage();
          currentY = margin;
        }
        
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) {
            doc.addPage();
            currentY = margin;
          }
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
      
      // Contact avec les liens
      let contactText = parsedCV.contact;
      
      // Ajouter les liens des entreprises si disponibles
      const links: string[] = [];
      if (parsedCV.experience) {
        parsedCV.experience.forEach((exp: any) => {
          if (exp.company.toLowerCase().includes('cvbien')) {
            links.push('[https://cvbien.dev]');
          }
          if (exp.company.toLowerCase().includes('dagence')) {
            links.push('[https://dagence.be]');
          }
        });
      }
      
      if (links.length > 0) {
        contactText += ' | ' + links.join(' | ');
      }
      
      addText(contactText, 10.3, false, true, '#000000'); // 10.0 -> 10.3 (+0.3pt)
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
          // Ajouter les certifications en gras avec phrases explicatives
          const certText = parsedCV.certifications.map(cert => {
            // Ajouter une phrase explicative si la certification n'en a pas déjà
            if (!cert.includes('certification') && !cert.includes('certified') && !cert.includes('certificat')) {
              return `${cert} (Certification professionnelle)`;
            }
            return cert;
          }).join(', ');
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
          if (languages.length > 0 && !parsedCV.hasLanguagesInEducation) {
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