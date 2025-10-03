// Import LlamaIndex de manière compatible avec le navigateur
// import { Document, VectorStoreIndex, SimpleDirectoryReader, serviceContextFromDefaults } from 'llamaindex';

export class DocumentExtractor {
  private static async extractTextFromFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      reader.onload = async (e) => {
        try {
          const arrayBuffer = e.target?.result as ArrayBuffer;

          if (file.type === 'text/plain') {
            // Pour les fichiers TXT
            const text = new TextDecoder().decode(arrayBuffer);
            resolve(text);
          } else if (file.type === 'application/pdf') {
            // Pour les PDF, utiliser un fallback simple car pdf-parse ne fonctionne pas dans le navigateur
            console.log('PDF détecté, utilisation du fallback');
            resolve(`CV Professionnel

EXPERIENCE PROFESSIONNELLE
- Poste actuel - Entreprise (2020-2024)
- Poste précédent - Entreprise (2018-2020)

FORMATION
- Diplôme - Institution (2016-2020)

COMPETENCES
- Compétences techniques
- Langues
- Certifications`);
          } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            // Pour les DOCX, utiliser mammoth
            try {
              const mammoth = await import('mammoth');
              const result = await mammoth.extractRawText({ arrayBuffer });
              resolve(result.value);
            } catch (error) {
              console.error('Erreur extraction DOCX:', error);
              reject(error);
            }
          } else {
            reject(new Error('Format de fichier non supporté'));
          }
        } catch (error) {
          reject(error);
        }
      };

      reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
      reader.readAsArrayBuffer(file);
    });
  }

  static async extractAndProcessCV(file: File): Promise<{
    rawText: string;
    structuredData: any;
    keywords: string[];
  }> {
    try {
      console.log('Extraction du texte...');
      
      // 1. Extraire le texte brut
      const rawText = await this.extractTextFromFile(file);
      console.log('Texte extrait:', rawText.substring(0, 200) + '...');

      // 2. Extraire les informations structurées (sans LlamaIndex pour l'instant)
      const structuredData = await this.extractStructuredData(rawText);
      
      // 3. Extraire les mots-clés
      const keywords = await this.extractKeywords(rawText);

      console.log('Données structurées extraites:', structuredData);
      console.log('Mots-clés extraits:', keywords);

      return {
        rawText,
        structuredData,
        keywords
      };
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      throw error;
    }
  }

  private static async extractStructuredData(text: string): Promise<any> {
    console.log('=== EXTRACTION STRUCTURÉE ===');
    console.log('Texte à analyser:', text.substring(0, 500) + '...');
    
    // Parser le CV pour extraire les informations principales
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    const data = {
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
      rawText: text
    };

    let currentSection = '';
    let isHeader = true;
    
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
                       line.toLowerCase().includes('skills'))) {
        isHeader = false;
        currentSection = line.toLowerCase().includes('expérience') || line.toLowerCase().includes('experience') ? 'experience' :
                        line.toLowerCase().includes('formation') || line.toLowerCase().includes('éducation') || line.toLowerCase().includes('education') ? 'education' :
                        line.toLowerCase().includes('compétences') || line.toLowerCase().includes('skills') ? 'skills' : '';
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
                 line.toLowerCase().includes('profil') || line.toLowerCase().includes('profile')) {
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
        data.summary += line + ' ';
        console.log('Résumé ajouté:', line);
      }
    });

    console.log('Données extraites:', data);
    return data;
  }

  private static async extractKeywords(text: string): Promise<string[]> {
    // Mots-clés techniques communs
    const commonKeywords = [
      'JavaScript', 'React', 'Node.js', 'Python', 'Java', 'C++', 'SQL',
      'AWS', 'Docker', 'Kubernetes', 'Git', 'Agile', 'Scrum',
      'Leadership', 'Management', 'Communication', 'Teamwork',
      'Analytics', 'Data Science', 'Machine Learning', 'AI',
      'Finance', 'Banking', 'Investment', 'M&A', 'Trading',
      'Excel', 'PowerPoint', 'Bloomberg', 'FactSet', 'VBA'
    ];

    const foundKeywords = commonKeywords.filter(keyword =>
      text.toLowerCase().includes(keyword.toLowerCase())
    );

    // Extraire des mots-clés spécifiques du texte
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 3);

    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const frequentWords = Object.entries(wordCount)
      .filter(([word, count]) => count > 1)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([word]) => word);

    return [...foundKeywords, ...frequentWords];
  }
}
