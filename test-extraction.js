// Test de l'extraction inspirée de LlamaIndex
const cvText = `JEAN DUPONT
Développeur Full Stack Senior
jean.dupont@email.com | +33 6 12 34 56 78
Paris, France

PROFESSIONAL SUMMARY
Développeur expérimenté avec 5 ans d'expérience dans le développement web full stack. Expertise en React, Node.js, et bases de données. Passionné par les technologies modernes et l'innovation.

EXPERIENCE PROFESSIONNELLE
Développeur Senior - TechCorp (2020-2024)
- Développement d'applications web avec React et Node.js
- Gestion d'équipe de 3 développeurs
- Mise en place de CI/CD avec Docker et Kubernetes
- Amélioration des performances de 40%

Développeur Full Stack - StartupXYZ (2018-2020)
- Création d'API REST avec Express.js
- Développement frontend avec React et TypeScript
- Intégration de bases de données MongoDB et PostgreSQL
- Collaboration avec l'équipe design et produit

FORMATION
Master en Informatique - Université Paris-Saclay (2016-2018)
Licence en Informatique - Université Paris-Diderot (2014-2016)

COMPETENCES TECHNIQUES
- Langages: JavaScript, TypeScript, Python, Java
- Frontend: React, Vue.js, HTML5, CSS3, Tailwind CSS
- Backend: Node.js, Express.js, Django, Spring Boot
- Bases de données: PostgreSQL, MongoDB, Redis
- DevOps: Docker, Kubernetes, AWS, Git, CI/CD
- Outils: VS Code, Git, Jira, Figma

LANGUES
- Français: Natif
- Anglais: Courant (TOEIC 950)
- Espagnol: Intermédiaire

CERTIFICATIONS
- AWS Certified Developer (2023)
- Google Cloud Professional Developer (2022)
- Scrum Master Certified (2021)`;

// Simulation de l'extraction inspirée de LlamaIndex
function llamaindexInspiredExtraction(cvText) {
  console.log('=== EXTRACTION INSPIRÉE DU CODE PYTHON ===');
  console.log('Texte CV à analyser:', cvText.substring(0, 500) + '...');
  
  const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
  
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
    rawText: cvText
  };

  let currentSection = '';
  let isHeader = true;
  let summaryLines = [];
  let experienceLines = [];
  let educationLines = [];
  let skillsLines = [];
  let languagesLines = [];

  // Phase 1: Extraction du header (nom, titre, contact)
  for (let i = 0; i < Math.min(10, lines.length); i++) {
    const line = lines[i];
    
    // Nom (généralement en majuscules en début de CV)
    if (!data.name && line.length > 3 && line.length < 50 && 
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
    
    // Email
    if (line.includes('@') && !data.email) {
      data.email = line;
      console.log('Email trouvé:', line);
      continue;
    }
    
    // Téléphone
    if (line.match(/[\+]?[0-9\s\-\(\)]{10,}/) && !data.phone) {
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
               line.toLowerCase().includes('technical skills')) {
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

// Test de l'extraction
const extractedData = llamaindexInspiredExtraction(cvText);

console.log('\n=== RÉSULTATS DE L\'EXTRACTION ===');
console.log('Nom:', extractedData.name);
console.log('Titre:', extractedData.title);
console.log('Email:', extractedData.email);
console.log('Téléphone:', extractedData.phone);
console.log('Localisation:', extractedData.location);
console.log('Résumé:', extractedData.summary);
console.log('Expériences:', extractedData.experience.length, 'éléments');
console.log('Formations:', extractedData.education.length, 'éléments');
console.log('Compétences:', extractedData.skills.length, 'éléments');
console.log('Langues:', extractedData.languages.length, 'éléments');

