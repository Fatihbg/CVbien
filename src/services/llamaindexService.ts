// Simulation de LlamaIndex pour le navigateur
// import { Document, VectorStoreIndex, SimpleDirectoryReader, serviceContextFromDefaults } from 'llamaindex';

export interface ExtractedCVData {
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  experience: string[];
  education: string[];
  skills: string[];
  languages: string[];
  rawText: string;
}

export class LlamaIndexService {
  private static index: any | null = null;

  static async initializeIndex(cvText: string): Promise<any> {
    // LlamaIndex n'est pas compatible avec le navigateur
    // Utiliser l'extraction manuelle améliorée
    console.log('=== EXTRACTION MANUELLE AMÉLIORÉE ===');
    return null;
  }

  static async extractCVData(cvText: string): Promise<ExtractedCVData> {
    try {
      console.log('=== EXTRACTION INSPIRÉE DE LLAMAINDEX ===');
      
      // Utiliser l'extraction inspirée du code Python qui fonctionne
      return this.llamaindexInspiredExtraction(cvText);
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      
      // Fallback vers l'extraction basique
      return this.fallbackExtraction(cvText);
    }
  }

  private static llamaindexInspiredExtraction(cvText: string): ExtractedCVData {
    console.log('=== EXTRACTION INSPIRÉE DU CODE PYTHON ===');
    console.log('Texte CV à analyser:', cvText.substring(0, 500) + '...');
    
    const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
    
    const data: ExtractedCVData = {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      experience: [],
      education: [],
      skills: [],
      languages: [],
      rawText: cvText
    };

    let currentSection = '';
    let isHeader = true;
    let summaryLines: string[] = [];
    let experienceLines: string[] = [];
    let educationLines: string[] = [];
    let skillsLines: string[] = [];
    let languagesLines: string[] = [];

    // Phase 1: Extraction du header (nom, titre, contact)
    for (let i = 0; i < Math.min(10, lines?.length || 0); i++) {
      const line = lines[i];
      
      // Nom (généralement en majuscules en début de CV)
      if (!data.name && line && line.length > 3 && line.length < 50 && 
          line === line.toUpperCase() && !line.includes('@') && !line.includes('http') && 
          !line.toLowerCase().includes('cv') && !line.toLowerCase().includes('resume')) {
        data.name = line;
        console.log('Nom trouvé:', line);
        continue;
      }
      
      // Titre professionnel (après le nom)
      if (data.name && !data.title && line.length > 5 && line.length < 100 && 
          !line.includes('@') && !line.includes('http') && line !== data.name) {
        data.title = line;
        console.log('Titre trouvé:', line);
        continue;
      }
      
      // Email et téléphone (souvent sur la même ligne)
      if (line.includes('@') && !data.email) {
        data.email = line;
        console.log('Email trouvé:', line);
        
        // Extraire le téléphone de la même ligne si présent
        const phoneMatch = line.match(/[\+]?[0-9\s\-\(\)]{10,}/);
        if (phoneMatch && !data.phone) {
          data.phone = phoneMatch[0];
          console.log('Téléphone trouvé:', data.phone);
        }
        continue;
      }
      
      // Téléphone seul (si pas trouvé avec l'email)
      if (!data.phone && line.match(/[\+]?[0-9\s\-\(\)]{10,}/)) {
        data.phone = line;
        console.log('Téléphone trouvé:', line);
        continue;
      }
      
      // Localisation
      if (line.length > 3 && line.length < 50 && 
          (line.includes('France') || line.includes('Paris') || line.includes('Lyon') || 
           line.includes('UK') || line.includes('London') || line.includes('New York')) && 
          !data.location) {
        data.location = line;
        console.log('Localisation trouvée:', line);
        continue;
      }
    }

    // Phase 2: Extraction des sections principales
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      // Détecter les sections principales
      if (line.toLowerCase().includes('professional summary') || 
          line.toLowerCase().includes('résumé') || 
          line.toLowerCase().includes('summary') || 
          line.toLowerCase().includes('profil')) {
        currentSection = 'summary';
        isHeader = false;
        console.log('Section résumé détectée');
        continue;
      } else if (line.toLowerCase().includes('expérience') || 
                 line.toLowerCase().includes('experience') || 
                 line.toLowerCase().includes('professional experience')) {
        currentSection = 'experience';
        isHeader = false;
        console.log('Section expérience détectée');
        continue;
      } else if (line.toLowerCase().includes('formation') || 
                 line.toLowerCase().includes('éducation') || 
                 line.toLowerCase().includes('education') || 
                 line.toLowerCase().includes('academic')) {
        currentSection = 'education';
        isHeader = false;
        console.log('Section formation détectée');
        continue;
      } else if (line.toLowerCase().includes('compétences') || 
                 line.toLowerCase().includes('skills') || 
                 line.toLowerCase().includes('technical skills') ||
                 line.toLowerCase().includes('competences techniques')) {
        currentSection = 'skills';
        isHeader = false;
        console.log('Section compétences détectée');
        continue;
      } else if (line.toLowerCase().includes('langues') || 
                 line.toLowerCase().includes('languages')) {
        currentSection = 'languages';
        isHeader = false;
        console.log('Section langues détectée');
        continue;
      }
      
      // Extraire le contenu selon la section
      if (currentSection === 'summary' && line.length > 20) {
        summaryLines.push(line);
        console.log('Résumé ajouté:', line);
      } else if (currentSection === 'experience' && line.length > 10) {
        experienceLines.push(line);
        console.log('Expérience ajoutée:', line);
      } else if (currentSection === 'education' && line.length > 10) {
        educationLines.push(line);
        console.log('Formation ajoutée:', line);
      } else if (currentSection === 'skills' && line.length > 3) {
        // Diviser par virgules, points, tirets
        const skills = line.split(/[,•\-;]/).map(s => s.trim()).filter(s => s.length > 2);
        skillsLines.push(...skills);
        console.log('Compétences ajoutées:', skills);
      } else if (currentSection === 'languages' && line.length > 5) {
        languagesLines.push(line);
        console.log('Langue ajoutée:', line);
      }
    }

    // Construire les données finales
    data.summary = summaryLines.join(' ').trim();
    data.experience = experienceLines;
    data.education = educationLines;
    data.skills = skillsLines;
    data.languages = languagesLines;

    console.log('Données extraites (inspirées LlamaIndex):', data);
    return data;
  }

  private static advancedManualExtraction(cvText: string): ExtractedCVData {
    console.log('=== EXTRACTION MANUELLE AVANCÉE ===');
    console.log('Texte CV à analyser:', cvText.substring(0, 500) + '...');
    
    const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
    
    const data: ExtractedCVData = {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      experience: [],
      education: [],
      skills: [],
      languages: [],
      rawText: cvText
    };

    let currentSection = '';
    let isHeader = true;
    let summaryLines: string[] = [];

    lines.forEach((line, index) => {
      console.log(`Ligne ${index}: "${line}"`);
      
      // Header (nom, titre, contact) - généralement les 5-10 premières lignes
      if (isHeader && index < 10) {
        // Nom (généralement en majuscules en début de CV)
        if (!data.name && line.length > 3 && line.length < 50 && 
            line === line.toUpperCase() && !line.includes('@') && !line.includes('http') && 
            !line.toLowerCase().includes('cv') && !line.toLowerCase().includes('resume')) {
          data.name = line;
          console.log('Nom trouvé:', line);
        }
        
        // Titre professionnel
        if (data.name && !data.title && line.length > 5 && line.length < 100 && 
            !line.includes('@') && !line.includes('http') && line !== data.name) {
          data.title = line;
          console.log('Titre trouvé:', line);
        }
        
        // Email
        if (line.includes('@') && !data.email) {
          data.email = line;
          console.log('Email trouvé:', line);
        }
        
        // Téléphone
        if (line.match(/[\+]?[0-9\s\-\(\)]{10,}/) && !data.phone) {
          data.phone = line;
          console.log('Téléphone trouvé:', line);
        }
        
        // Localisation
        if (line.length > 3 && line.length < 50 && 
            (line.includes('France') || line.includes('Paris') || line.includes('Lyon') || 
             line.includes('UK') || line.includes('London') || line.includes('New York')) && 
            !data.location) {
          data.location = line;
          console.log('Localisation trouvée:', line);
        }
      }
      
      // Détecter la fin du header (première section majeure)
      if (isHeader && (line.toLowerCase().includes('expérience') || 
                       line.toLowerCase().includes('experience') ||
                       line.toLowerCase().includes('formation') ||
                       line.toLowerCase().includes('éducation') ||
                       line.toLowerCase().includes('education') ||
                       line.toLowerCase().includes('compétences') ||
                       line.toLowerCase().includes('skills') ||
                       line.toLowerCase().includes('professional summary'))) {
        isHeader = false;
        currentSection = line.toLowerCase().includes('expérience') || line.toLowerCase().includes('experience') ? 'experience' :
                        line.toLowerCase().includes('formation') || line.toLowerCase().includes('éducation') || line.toLowerCase().includes('education') ? 'education' :
                        line.toLowerCase().includes('compétences') || line.toLowerCase().includes('skills') ? 'skills' :
                        line.toLowerCase().includes('professional summary') ? 'summary' : '';
      }
      
      // Sections
      if (line.toLowerCase().includes('expérience') || line.toLowerCase().includes('experience') || 
          line.toLowerCase().includes('professional experience')) {
        currentSection = 'experience';
        console.log('Section expérience détectée');
      } else if (line.toLowerCase().includes('formation') || line.toLowerCase().includes('éducation') || 
                 line.toLowerCase().includes('education') || line.toLowerCase().includes('academic')) {
        currentSection = 'education';
        console.log('Section formation détectée');
      } else if (line.toLowerCase().includes('compétences') || line.toLowerCase().includes('skills') || 
                 line.toLowerCase().includes('technical skills')) {
        currentSection = 'skills';
        console.log('Section compétences détectée');
      } else if (line.toLowerCase().includes('langues') || line.toLowerCase().includes('languages')) {
        currentSection = 'languages';
        console.log('Section langues détectée');
      } else if (line.toLowerCase().includes('résumé') || line.toLowerCase().includes('summary') || 
                 line.toLowerCase().includes('profil') || line.toLowerCase().includes('profile') ||
                 line.toLowerCase().includes('professional summary')) {
        currentSection = 'summary';
        console.log('Section résumé détectée');
      }
      
      // Contenu des sections
      if (currentSection === 'experience' && line.length > 10) {
        data.experience.push(line);
        console.log('Expérience ajoutée:', line);
      } else if (currentSection === 'education' && line.length > 10) {
        data.education.push(line);
        console.log('Formation ajoutée:', line);
      } else if (currentSection === 'skills' && line.length > 3) {
        // Diviser par virgules, points, tirets
        const skills = line.split(/[,•\-;]/).map(s => s.trim()).filter(s => s.length > 2);
        data.skills.push(...skills);
        console.log('Compétences ajoutées:', skills);
      } else if (currentSection === 'languages' && line.length > 5) {
        data.languages.push(line);
        console.log('Langue ajoutée:', line);
      } else if (currentSection === 'summary' && line.length > 20) {
        summaryLines.push(line);
        console.log('Résumé ajouté:', line);
      }
    });

    // Construire le résumé
    data.summary = summaryLines.join(' ').trim();

    console.log('Données extraites:', data);
    return data;
  }


  private static fallbackExtraction(cvText: string): ExtractedCVData {
    console.log('Utilisation de l\'extraction de fallback');
    
    const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
    
    const data: ExtractedCVData = {
      name: '',
      title: '',
      email: '',
      phone: '',
      location: '',
      summary: '',
      experience: [],
      education: [],
      skills: [],
      languages: [],
      rawText: cvText
    };

    let currentSection = '';
    let isHeader = true;

    lines.forEach((line, index) => {
      // Header (nom, titre, contact)
      if (isHeader && index < 10) {
        if (!data.name && line.length > 3 && line.length < 50 && 
            line === line.toUpperCase() && !line.includes('@')) {
          data.name = line;
        }
        
        if (data.name && !data.title && line.length > 5 && line.length < 100 && 
            !line.includes('@') && line !== data.name) {
          data.title = line;
        }
        
        if (line.includes('@') && !data.email) {
          data.email = line;
        }
        
        if (line.match(/[\+]?[0-9\s\-\(\)]{10,}/) && !data.phone) {
          data.phone = line;
        }
        
        if (line.includes('France') || line.includes('Paris') || line.includes('Lyon')) {
          data.location = line;
        }
      }

      // Détecter les sections
      if (line.toLowerCase().includes('expérience') || line.toLowerCase().includes('experience')) {
        currentSection = 'experience';
        isHeader = false;
      } else if (line.toLowerCase().includes('formation') || line.toLowerCase().includes('éducation')) {
        currentSection = 'education';
        isHeader = false;
      } else if (line.toLowerCase().includes('compétences') || line.toLowerCase().includes('skills')) {
        currentSection = 'skills';
        isHeader = false;
      } else if (line.toLowerCase().includes('langues') || line.toLowerCase().includes('languages')) {
        currentSection = 'languages';
        isHeader = false;
      } else if (line.toLowerCase().includes('résumé') || line.toLowerCase().includes('summary')) {
        currentSection = 'summary';
        isHeader = false;
      }

      // Contenu des sections
      if (currentSection === 'experience' && line.length > 10) {
        data.experience.push(line);
      } else if (currentSection === 'education' && line.length > 10) {
        data.education.push(line);
      } else if (currentSection === 'skills' && line.length > 3) {
        const skills = line.split(/[,•\-;]/).map(s => s.trim()).filter(s => s.length > 2);
        data.skills.push(...skills);
      } else if (currentSection === 'languages' && line.length > 5) {
        data.languages.push(line);
      } else if (currentSection === 'summary' && line.length > 20) {
        data.summary += line + ' ';
      }
    });

    return data;
  }
}
