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

      // Fonction pour ajouter du texte avec formatage professionnel
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, isCenter: boolean = false, isRight: boolean = false, color: string = '#000000') => {
        if (currentY > pageHeight - 20) return;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) return;
          let xPos = margin;
          let align: any = 'left';
          
          if (isCenter) {
            xPos = pageWidth / 2;
            align = 'center';
          } else if (isRight) {
            xPos = pageWidth - margin;
            align = 'right';
          }
          
          doc.text(line, xPos, currentY, { align });
          currentY += fontSize * 0.4; // Espacement standard
        });
      };

      // Parser pour design classique professionnel
      const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
      
      let isHeader = true;
      let currentSection = '';
      let name = '';
      let contact = '';
      let jobTitle = '';
      let summary = '';

      // Phase 1: Extraire les éléments du header
      for (let i = 0; i < Math.min(lines.length, 10); i++) {
        const line = lines[i];
        
        // Nom en majuscules
        if (!name && line.length > 3 && line.length < 50 && line === line.toUpperCase() && 
            !line.includes('@') && !line.includes('PROFESSIONAL') && !line.includes('EXPERIENCE')) {
          name = line;
        } 
        // Contact
        else if (!contact && (line.includes('@') || line.includes('|') || line.includes('+'))) {
          contact = line;
        } 
        // Titre de poste
        else if (!jobTitle && line.length > 5 && !line.includes('PROFESSIONAL') && !line.includes('EXPERIENCE') && 
                 !line.includes('FORMATION') && !line.includes('SKILLS') && !line.includes('SUMMARY')) {
          jobTitle = line;
        }
        // Détecter le début du résumé
        else if (line.includes('PROFESSIONAL SUMMARY') || line.includes('RÉSUMÉ PROFESSIONNEL')) {
          // Prendre les lignes suivantes comme résumé
          for (let j = i + 1; j < Math.min(lines.length, i + 5); j++) {
            if (lines[j] && !lines[j].includes('EXPERIENCE') && !lines[j].includes('FORMATION')) {
              summary += lines[j] + ' ';
            } else {
              break;
            }
          }
          break;
        }
      }

      // Phase 2: Afficher le header formaté
      if (name) {
        addText(name, 16, true, true, '#000000'); // Nom centré
        currentY += 3;
      }
      
      if (contact) {
        addText(contact, 10, false, true, '#000000'); // Contact centré
        currentY += 2;
      }
      
      if (jobTitle) {
        addText(jobTitle, 12, false, true, '#000000'); // Titre centré
        currentY += 3;
      }
      
      if (summary) {
        addText(summary.trim(), 10, false, false, '#000000'); // Résumé justifié
        currentY += 3;
      }

      // Phase 3: Traiter les sections
      let skipToExperience = false;
      lines.forEach((line, index) => {
        if (currentY > pageHeight - 30) return;
        
        // Ignorer les lignes déjà traitées dans le header
        if (line === name || line === contact || line === jobTitle || 
            line.includes('PROFESSIONAL SUMMARY') || line.includes('RÉSUMÉ PROFESSIONNEL')) {
          return;
        }
        
        // Ignorer les lignes du résumé
        if (summary && summary.includes(line)) {
          return;
        }
        
        // Sections principales
        if (line === 'PROFESSIONAL EXPERIENCE' || line === 'EDUCATION' || 
            line === 'TECHNICAL SKILLS' || line === 'CERTIFICATIONS & ACHIEVEMENTS' ||
            line === 'EXPÉRIENCE PROFESSIONNELLE' || line === 'FORMATION' ||
            line === 'COMPETENCES' || line === 'COMPÉTENCES' || line === 'PROJECTS' ||
            line === 'OTHER' || line === 'SKILLS') {
          
          currentY += 3;
          addText(line, 12, true, false, '#000000'); // Sections en gras
          currentY += 1;
          currentSection = line;
        }
        // Entreprises (en gras) avec dates/lieux alignés à droite
        else if (currentSection && (currentSection.includes('EXPERIENCE') || currentSection.includes('PROJECTS')) &&
                 line.length > 3 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-') &&
                 !line.includes('@') && !line.includes('|') && !line.includes('+')) {
          
          // Vérifier si c'est une entreprise (pas un poste)
          const jobKeywords = ['analyst', 'consultant', 'developer', 'manager', 'engineer', 'specialist', 'coordinator', 
                              'director', 'lead', 'senior', 'junior', 'intern', 'assistant', 'ceo', 'founder', 'owner'];
          if (!jobKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
            // Vérifier s'il y a une date/lieu sur la même ligne
            const parts = line.split(' • ');
            if (parts.length === 2) {
              addText(parts[0], 10, true, false, false, '#000000'); // Entreprise en gras à gauche
              addText(parts[1], 9, false, false, true, '#000000'); // Lieu à droite
            } else {
              addText(line, 10, true, false, false, '#000000'); // Entreprise en gras
            }
            currentY += 0.5;
          }
        }
        // Postes (en italique) avec dates alignées à droite
        else if (currentSection && (currentSection.includes('EXPERIENCE') || currentSection.includes('PROJECTS')) &&
                 line.length > 5 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-')) {
          
          const jobKeywords = ['analyst', 'consultant', 'developer', 'manager', 'engineer', 'specialist', 'coordinator', 
                              'director', 'lead', 'senior', 'junior', 'intern', 'assistant', 'ceo', 'founder', 'owner'];
          if (jobKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
            // Vérifier s'il y a une date sur la même ligne
            const parts = line.split(' • ');
            if (parts.length === 2) {
              addText(parts[0], 10, false, false, false, '#000000'); // Poste en normal à gauche
              addText(parts[1], 9, false, false, true, '#000000'); // Date à droite
            } else {
              addText(line, 10, false, false, false, '#000000'); // Poste en normal
            }
            currentY += 0.5;
          }
        }
        // Puces et contenu
        else if (line.startsWith('•') || line.startsWith('-')) {
          addText(line, 9, false, false, '#000000'); // Puces
        }
        // Texte normal
        else if (line.length > 0) {
          addText(line, 9, false, false, '#000000');
        }
      });

      doc.save(filename);
    } catch (error) {
      console.error('Erreur fallback PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}