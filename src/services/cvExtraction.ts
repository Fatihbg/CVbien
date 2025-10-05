import mammoth from 'mammoth';
import type { CVData } from '../store/cvStore';

export class CVExtractionService {
  async extractFromFile(file: File): Promise<CVData | null> {
    try {
      const fileType = file.type;
      const fileName = file.name.toLowerCase();

      if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
        return this.extractFromText(await file.text());
      } else if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
        return this.extractFromPDF(file);
      } else if (
        fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        fileName.endsWith('.docx')
      ) {
        return this.extractFromDocx(file);
      } else {
        throw new Error('Format de fichier non supporté');
      }
    } catch (error) {
      console.error('Erreur lors de l\'extraction:', error);
      return null;
    }
  }

  private async extractFromText(text: string): Promise<CVData> {
    // Utilisation d'expressions régulières pour extraire les informations
    const lines = (text || '').split('\n').map(line => line.trim()).filter(line => line && line.length > 0);
    
    const personalInfo = this.extractPersonalInfo(lines);
    const summary = this.extractSummary(lines);
    const experience = this.extractExperience(lines);
    const education = this.extractEducation(lines);
    const skills = this.extractSkills(lines);

    return {
      personalInfo,
      summary,
      experience,
      education,
      skills,
    };
  }

  private async extractFromPDF(file: File): Promise<CVData> {
    // Pour l'instant, on utilise une approche simple
    // Dans un vrai projet, on utiliserait pdf-parse ou pdf2pic
    const text = await this.pdfToText(file);
    return this.extractFromText(text);
  }

  private async extractFromDocx(file: File): Promise<CVData> {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return this.extractFromText(result.value);
  }

  private extractPersonalInfo(lines: string[]): CVData['personalInfo'] {
    const name = lines[0] || '';
    let email = '';
    let phone = '';
    let location = '';

    for (const line of lines) {
      if (line.includes('@') && !email) {
        email = line;
      } else if (line.match(/\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}[\s.-]?\d{2}/) && !phone) {
        phone = line;
      } else if (line.includes('France') || line.includes('Paris') || line.includes('Lyon') || line.includes('Marseille')) {
        location = line;
      }
    }

    return {
      name,
      email,
      phone,
      location,
    };
  }

  private extractSummary(lines: string[]): string {
    const summaryKeywords = ['résumé', 'profil', 'summary', 'about', 'à propos'];
    let summaryStart = -1;

    for (let i = 0; i < (lines?.length || 0); i++) {
      if (summaryKeywords.some(keyword => lines[i]?.toLowerCase()?.includes(keyword))) {
        summaryStart = i + 1;
        break;
      }
    }

    if (summaryStart === -1) return '';

    let summary = '';
    for (let i = summaryStart; i < Math.min(summaryStart + 3, lines?.length || 0); i++) {
      if (lines[i] && lines[i].length > 20) {
        summary += lines[i] + ' ';
      }
    }

    return summary.trim();
  }

  private extractExperience(lines: string[]): CVData['experience'] {
    const experience: CVData['experience'] = [];
    const expKeywords = ['expérience', 'experience', 'emploi', 'travail', 'work'];
    let expStart = -1;

    for (let i = 0; i < (lines?.length || 0); i++) {
      if (expKeywords.some(keyword => lines[i].toLowerCase().includes(keyword))) {
        expStart = i + 1;
        break;
      }
    }

    if (expStart === -1) return experience;

    // Logique simplifiée pour extraire l'expérience
    for (let i = expStart; i < (lines?.length || 0); i++) {
      const line = lines[i];
      if (line && line.length > 10 && !line.includes('Formation') && !line.includes('Compétences')) {
        // Détection basique d'un poste
        if (line.includes('Chef') || line.includes('Développeur') || line.includes('Manager') || line.includes('Ingénieur')) {
          experience.push({
            title: line,
            company: lines[i + 1] || '',
            location: '',
            startDate: '2020',
            endDate: '2023',
            current: false,
            description: lines[i + 2] || '',
          });
        }
      }
    }

    return experience;
  }

  private extractEducation(lines: string[]): CVData['education'] {
    const education: CVData['education'] = [];
    const eduKeywords = ['formation', 'éducation', 'education', 'diplôme', 'diploma'];
    let eduStart = -1;

    for (let i = 0; i < (lines?.length || 0); i++) {
      if (eduKeywords.some(keyword => lines[i].toLowerCase().includes(keyword))) {
        eduStart = i + 1;
        break;
      }
    }

    if (eduStart === -1) return education;

    for (let i = eduStart; i < (lines?.length || 0); i++) {
      const line = lines[i];
      if (line.includes('Master') || line.includes('Licence') || line.includes('Bac') || line.includes('École')) {
        education.push({
          degree: line,
          school: lines[i + 1] || '',
          location: '',
          graduationDate: '2020',
        });
      }
    }

    return education;
  }

  private extractSkills(lines: string[]): string[] {
    const skills: string[] = [];
    const skillKeywords = ['compétences', 'skills', 'technologies', 'outils'];
    let skillStart = -1;

    for (let i = 0; i < (lines?.length || 0); i++) {
      if (skillKeywords.some(keyword => lines[i].toLowerCase().includes(keyword))) {
        skillStart = i + 1;
        break;
      }
    }

    if (skillStart === -1) return skills;

    for (let i = skillStart; i < Math.min(skillStart + 5, lines?.length || 0); i++) {
      const line = lines[i];
      if (line.includes(',') || line.includes('•') || line.includes('-')) {
        const lineSkills = line.split(/[,•-]/).map(s => s.trim()).filter(s => s && s.length > 0);
        skills.push(...lineSkills);
      } else if (line && line.length > 2 && line.length < 30) {
        skills.push(line);
      }
    }

    return skills.slice(0, 10); // Limiter à 10 compétences
  }

  private async pdfToText(file: File): Promise<string> {
    // Implémentation simplifiée - dans un vrai projet, utiliser pdf-parse
    return 'Extraction PDF non implémentée dans cette version de démonstration';
  }
}

export const cvExtractionService = new CVExtractionService();
