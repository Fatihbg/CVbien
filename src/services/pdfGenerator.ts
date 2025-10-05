export class PDFGenerator {
  static async generateCVPDF(cvText: string, filename: string = 'optimized-cv.pdf'): Promise<void> {
    try {
      console.log('=== GÉNÉRATION PDF RONALDO PRIME ===');
      console.log('Utilisation du design Ronaldo Prime avec jsPDF...');
      
      // Utiliser directement le design Ronaldo Prime (jsPDF)
      await this.generateFallbackPDF(cvText, filename);
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }

  private static async generateFallbackPDF(cvText: string, filename: string): Promise<void> {
    try {
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configuration améliorée
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const maxWidth = pageWidth - (2 * margin);
      let currentY = margin;

      // Fonction pour ajouter du texte avec formatage Ronaldo Prime
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, isCenter: boolean = false, color: string = '#374151') => {
        if (currentY > pageHeight - 20) return;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) return;
          doc.text(line, isCenter ? pageWidth / 2 : margin, currentY, { align: isCenter ? 'center' : 'left' });
          currentY += fontSize * 0.35; // Espacement plus compact
        });
      };

      // Parser intelligent pour formatage Ronaldo Prime
      const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
      
      let isHeader = true;
      let currentSection = '';

      lines.forEach((line, index) => {
        if (currentY > pageHeight - 30) return;

        // Header (nom, contact, titre)
        if (isHeader && index < 8) {
          // Nom en majuscules
          if (line.length > 3 && line.length < 50 && line === line.toUpperCase() && 
              !line.includes('@') && !line.includes('PROFESSIONAL') && !line.includes('EXPERIENCE')) {
            addText(line, 18, true, false, '#1e3a8a'); // Bleu sérieux pour le nom
            currentY += 2;
          } 
          // Contact
          else if (line.includes('@') || line.includes('|') || line.includes('+')) {
            addText(line, 9, false, false, '#000000'); // Contact en noir
            currentY += 1;
          } 
          // Titre de poste
          else if (line.length > 5 && !line.includes('PROFESSIONAL') && !line.includes('EXPERIENCE') && 
                   !line.includes('FORMATION') && !line.includes('SKILLS')) {
            addText(line, 12, true, false, '#1e3a8a'); // Titre en bleu sérieux
            currentY += 2;
          }
        }
        
        // Détecter la fin du header
        if (isHeader && (line.includes('PROFESSIONAL SUMMARY') || line.includes('EXPERIENCE') || line.includes('FORMATION'))) {
          isHeader = false;
          currentY += 3;
        }
        
        // Sections principales
        if (line === 'PROFESSIONAL SUMMARY' || 
            line === 'EDUCATION' || 
            line === 'PROFESSIONAL EXPERIENCE' || 
            line === 'TECHNICAL SKILLS' || 
            line === 'CERTIFICATIONS & ACHIEVEMENTS' ||
            line === 'EXPÉRIENCE PROFESSIONNELLE' ||
            line === 'FORMATION' ||
            line === 'COMPETENCES' ||
            line === 'COMPÉTENCES' ||
            line === 'PROJECTS' ||
            line === 'OTHER') {
          
          currentY += 2;
          addText(line, 11, true, false, '#1e3a8a'); // Sections en bleu sérieux
          currentY += 1;
          currentSection = line;
        }
        // Postes/titres dans les sections
        else if (currentSection && (currentSection.includes('EXPERIENCE') || currentSection.includes('PROJECTS')) &&
                 line.length > 5 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-')) {
          // Vérifier si c'est un poste
          const jobKeywords = ['analyst', 'consultant', 'developer', 'manager', 'engineer', 'specialist', 'coordinator', 
                              'director', 'lead', 'senior', 'junior', 'intern', 'assistant', 'ceo', 'founder', 'owner'];
          if (jobKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
            addText(line, 10, true, false, '#000000'); // Postes en gras
            currentY += 0.5;
          }
        }
        // Contenu des sections
        else if (currentSection && line.length > 0) {
          // Formatage spécial pour les puces
          if (line.startsWith('•') || line.startsWith('-')) {
            addText(line, 9, false, false, '#000000'); // Puces en noir
          } else {
            addText(line, 9, false, false, '#000000'); // Texte normal
          }
        }
      });

      doc.save(filename);
    } catch (error) {
      console.error('Erreur fallback PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}