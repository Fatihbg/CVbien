import type { CVData, JobDescription } from '../store/cvStore';

const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || '';

export class CVGenerationService {
  async generateOptimizedCV(originalCV: CVData, jobDescription: JobDescription): Promise<CVData> {
    const prompt = this.createPrompt(originalCV, jobDescription);
    
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Tu es un expert en recrutement et en optimisation de CV pour les systèmes ATS. Tu dois générer un CV optimisé qui correspond parfaitement à la description du poste tout en conservant les informations authentiques du candidat.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 3000,
        }),
      });

      if (!response.ok) {
        throw new Error('Erreur lors de la génération du CV');
      }

      const data = await response.json();
      const generatedContent = data.choices[0].message.content;
      
      return this.parseGeneratedCV(generatedContent, originalCV);
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      throw error;
    }
  }

  private createPrompt(originalCV: CVData, jobDescription: JobDescription): string {
    return `
CV ORIGINAL:
Nom: ${originalCV.personalInfo.name}
Email: ${originalCV.personalInfo.email}
Téléphone: ${originalCV.personalInfo.phone}
Localisation: ${originalCV.personalInfo.location}

Résumé: ${originalCV.summary}

Expérience:
${originalCV.experience.map(exp => 
  `- ${exp.title} chez ${exp.company} (${exp.startDate} - ${exp.endDate})
    ${exp.description}`
).join('\n')}

Formation:
${originalCV.education.map(edu => 
  `- ${edu.degree} - ${edu.school} (${edu.graduationDate})`
).join('\n')}

Compétences: ${originalCV.skills.join(', ')}

DESCRIPTION DU POSTE:
Titre: ${jobDescription.title}
Entreprise: ${jobDescription.company}
Localisation: ${jobDescription.location}

Description: ${jobDescription.description}

Exigences: ${jobDescription.requirements.join(', ')}

INSTRUCTIONS:
Génère un CV optimisé pour ce poste en:
1. Adaptant le résumé pour correspondre au poste
2. Réorganisant et reformulant l'expérience pour mettre en avant les compétences pertinentes
3. Ajoutant des mots-clés de l'offre d'emploi
4. Optimisant pour les systèmes ATS
5. Conservant toutes les informations authentiques du candidat

Réponds UNIQUEMENT avec un objet JSON valide contenant:
{
  "personalInfo": {
    "name": "string",
    "email": "string", 
    "phone": "string",
    "location": "string",
    "linkedin": "string (optionnel)",
    "website": "string (optionnel)"
  },
  "summary": "string",
  "experience": [
    {
      "title": "string",
      "company": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "current": boolean,
      "description": "string"
    }
  ],
  "education": [
    {
      "degree": "string",
      "school": "string", 
      "location": "string",
      "graduationDate": "string",
      "gpa": "string (optionnel)"
    }
  ],
  "skills": ["string"],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string"
    }
  ]
}
    `;
  }

  private parseGeneratedCV(content: string, originalCV: CVData): CVData {
    try {
      // Nettoyer le contenu pour extraire le JSON
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Impossible de parser le CV généré');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      
      // S'assurer que toutes les propriétés requises existent
      return {
        personalInfo: {
          name: parsed.personalInfo?.name || originalCV.personalInfo.name,
          email: parsed.personalInfo?.email || originalCV.personalInfo.email,
          phone: parsed.personalInfo?.phone || originalCV.personalInfo.phone,
          location: parsed.personalInfo?.location || originalCV.personalInfo.location,
          linkedin: parsed.personalInfo?.linkedin,
          website: parsed.personalInfo?.website,
        },
        summary: parsed.summary || originalCV.summary,
        experience: parsed.experience || originalCV.experience,
        education: parsed.education || originalCV.education,
        skills: parsed.skills || originalCV.skills,
        certifications: parsed.certifications || [],
      };
    } catch (error) {
      console.error('Erreur lors du parsing du CV généré:', error);
      // Retourner le CV original en cas d'erreur
      return originalCV;
    }
  }

  async calculateATSScore(cv: CVData, jobDescription: JobDescription): Promise<number> {
    // Calcul simplifié du score ATS
    let score = 0;
    const maxScore = 100;

    // Vérifier la présence des mots-clés du poste
    const jobKeywords = [
      ...(jobDescription.requirements || []),
      ...(jobDescription.description || '').toLowerCase().split(' ').filter(word => word.length > 3)
    ];

    const cvText = [
      cv.summary,
      ...cv.experience.map(exp => `${exp.title} ${exp.description}`),
      ...cv.skills,
    ].join(' ').toLowerCase();

    // Compter les mots-clés correspondants
    const matchingKeywords = jobKeywords.filter(keyword => 
      cvText.includes(keyword.toLowerCase())
    );

    score += ((matchingKeywords?.length || 0) / (jobKeywords?.length || 1)) * 40;

    // Vérifier la structure du CV
    if (cv.personalInfo.name) score += 10;
    if (cv.personalInfo.email) score += 10;
    if (cv.personalInfo.phone) score += 10;
    if (cv.summary && cv.summary.length > 50) score += 10;
    if (cv.experience && cv.experience.length > 0) score += 10;
    if (cv.education && cv.education.length > 0) score += 5;
    if (cv.skills && cv.skills.length > 0) score += 5;

    return Math.min(Math.round(score), maxScore);
  }
}

export const cvGenerationService = new CVGenerationService();
