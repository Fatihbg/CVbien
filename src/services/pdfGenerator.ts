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
  skills: string;
  certifications: string[];
  additionalInfo: string;
}

export class PDFGenerator {
  // Utiliser l'IA pour parser le CV
  private static async parseCVWithAI(cvText: string, jobDescription: string = ''): Promise<CVParsedData> {
    try {
      console.log('🤖 Utilisation de l\'IA pour parser le CV...');
      
      const response = await fetch(`${config.API_BASE_URL}/parse-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv_text: cvText,
          job_description: jobDescription
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur backend: ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ CV parsé par l\'IA:', result);
      return result;
      
    } catch (error) {
      console.error('❌ Erreur parsing IA, fallback manuel:', error);
      return this.parseCVManually(cvText);
    }
  }

  // Fallback: parsing manuel simple
  private static parseCVManually(cvText: string): CVParsedData {
    const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Trouver le nom (première ligne en majuscules)
    const name = lines.find(line => line.length > 3 && line.length < 50 && line === line.toUpperCase()) || 'Nom Prénom';
    
    // Trouver le contact (ligne avec @)
    const contact = lines.find(line => line.includes('@')) || 'Contact';
    
    // Trouver le titre (ligne après le contact)
    const contactIndex = lines.findIndex(line => line.includes('@'));
    const title = contactIndex >= 0 && contactIndex + 1 < lines.length ? lines[contactIndex + 1] : 'Titre Professionnel';
    
    // Trouver le résumé (paragraphe long avant les sections)
    const summary = lines.find(line => line.length > 50 && line.length < 300 && 
      !line.includes('EXPERIENCE') && !line.includes('FORMATION') && 
      !line.includes('SKILLS') && !line.includes('CERTIFICATIONS')) || 'Résumé professionnel';
    
    return {
      name,
      contact,
      title,
      summary,
      experience: [],
      education: [],
      skills: '',
      certifications: [],
      additionalInfo: ''
    };
  }

  static async generateCVPDF(cvText: string, jobDescription: string = '', filename: string = 'optimized-cv.pdf'): Promise<void> {
    try {
      console.log('=== GÉNÉRATION PDF AVEC IA ===');
      console.log('CV Text length:', cvText.length);
      console.log('Job Description length:', jobDescription.length);
      
      // Parser le CV avec l'IA en incluant la description du job
      const parsedCV = await this.parseCVWithAI(cvText, jobDescription);
      
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

      // Fonction pour ajouter une ligne horizontale DIRECTEMENT SOUS LE TITRE
      const addHorizontalLine = (titleY: number) => {
        if (currentY > pageHeight - 20) return;
        doc.setDrawColor(0, 0, 0); // Noir
        doc.setLineWidth(0.5);
        // Placer la ligne DIRECTEMENT sous le titre (utiliser la position du titre)
        doc.line(margin, titleY + 0.5, pageWidth - margin, titleY + 0.5);
        currentY = titleY + 5; // Plus d'espace après la ligne pour séparer du contenu
      };

      // === GÉNÉRATION PDF AVEC DONNÉES STRUCTURÉES ===
      
      // 1. HEADER - Nom, Contact, Titre
      addText(parsedCV.name, 18, true, true, '#000000');
      currentY += 3;
      
      addText(parsedCV.contact, 10, false, true, '#000000');
      currentY += 1;
      
      addText(parsedCV.title, 14, true, true, '#000000');
      currentY += 4;
      
      // 2. RÉSUMÉ PROFESSIONNEL
      if (parsedCV.summary && parsedCV.summary.trim()) {
        addText(parsedCV.summary, 11, false, false, '#000000'); // Augmenté de 10 à 11
        currentY += 3;
      }
      
      // 3. EXPÉRIENCE PROFESSIONNELLE
      if (parsedCV.experience && parsedCV.experience.length > 0) {
        currentY += 4;
        const titleY = currentY;
        addText('EXPÉRIENCE PROFESSIONNELLE', 12, true, false, '#000000');
        addHorizontalLine(titleY);
        
        parsedCV.experience.forEach(exp => {
          // Entreprise et poste sur une ligne
          const companyPosition = `${exp.company} - ${exp.position} (${exp.period})`;
          addText(companyPosition, 10, true, false, '#000000');
          currentY += 1;
          
          // Descriptions avec bullet points
          exp.description.forEach(desc => {
            addText(`• ${desc}`, 10, false, false, '#000000'); // Augmenté de 9 à 10
            currentY += 2.5;
          });
          currentY += 1;
        });
      }
      
      // 4. FORMATION
      if (parsedCV.education && parsedCV.education.length > 0) {
        currentY += 4;
        const titleY = currentY;
        addText('FORMATION', 12, true, false, '#000000');
        addHorizontalLine(titleY);
        
        parsedCV.education.forEach(edu => {
          // Institution et diplôme sur une ligne
          const institutionDegree = `${edu.institution} - ${edu.degree} (${edu.period})`;
          addText(institutionDegree, 10, true, false, '#000000');
          currentY += 1;
          
          // Description
          if (edu.description) {
            addText(`• ${edu.description}`, 10, false, false, '#000000'); // Augmenté de 9 à 10
            currentY += 2.5;
          }
          currentY += 1;
        });
      }
      
      // 5. CERTIFICATIONS
      if (parsedCV.certifications && parsedCV.certifications.length > 0) {
        currentY += 4;
        const titleY = currentY;
        addText('CERTIFICATIONS & RÉALISATIONS', 12, true, false, '#000000');
        addHorizontalLine(titleY);
        
        parsedCV.certifications.forEach(cert => {
          addText(`• ${cert}`, 10, false, false, '#000000'); // Augmenté de 9 à 10
          currentY += 2.5;
        });
      }
      
      // 6. INFORMATIONS ADDITIONNELLES
      if (parsedCV.skills || parsedCV.additionalInfo) {
        currentY += 4;
        const titleY = currentY;
        addText('INFORMATIONS ADDITIONNELLES', 12, true, false, '#000000');
        addHorizontalLine(titleY);
        
        if (parsedCV.skills) {
          addText(`• Compétences : ${parsedCV.skills}`, 10, false, false, '#000000'); // Augmenté de 9 à 10
          currentY += 2.5;
        }
        
        if (parsedCV.additionalInfo) {
          addText(`• ${parsedCV.additionalInfo}`, 10, false, false, '#000000'); // Augmenté de 9 à 10
          currentY += 2.5;
        }
      }

      doc.save(filename);
      console.log('✅ PDF généré avec succès');
      
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}