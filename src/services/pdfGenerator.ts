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
        addText(name, 16, true, true, false, '#000000'); // Nom centré
        currentY += 3;
      }
      
      if (contact) {
        addText(contact, 10, false, true, false, '#000000'); // Contact centré
        currentY += 2;
      }
      
      if (jobTitle) {
        addText(jobTitle, 12, false, true, false, '#000000'); // Titre centré
        currentY += 3;
      }
      
      if (summary) {
        addText(summary.trim(), 10, false, false, false, '#000000'); // Résumé justifié
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
          
          currentY += 4; // Plus d'espace avant
          addText(line, 12, true, false, false, '#000000'); // Sections EN GRAS
          
          // Ajouter une ligne en dessous du titre
          doc.setDrawColor(0, 0, 0); // Couleur noire
          doc.setLineWidth(0.5);
          doc.line(margin, currentY + 2, pageWidth - margin, currentY + 2);
          
          currentY += 5; // Espace d'une ligne après le titre
          currentSection = line;
        }
        // Entreprises (en gras) avec dates/lieux alignés à droite
        else if (currentSection && (currentSection.includes('EXPERIENCE') || currentSection.includes('PROJECTS')) &&
                 line.length > 3 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-') &&
                 !line.includes('@') && !line.includes('|') && !line.includes('+')) {
          
          // Nettoyer les balises HTML
          const cleanLine = line.replace(/<[^>]*>/g, '');
          
          // Vérifier si c'est une entreprise (pas un poste)
          const jobKeywords = ['analyst', 'consultant', 'developer', 'manager', 'engineer', 'specialist', 'coordinator', 
                              'director', 'lead', 'senior', 'junior', 'intern', 'assistant', 'ceo', 'founder', 'owner'];
          if (!jobKeywords.some(keyword => cleanLine.toLowerCase().includes(keyword))) {
            // Vérifier s'il y a une date/lieu sur la même ligne
            const parts = cleanLine.split(' • ');
            if (parts.length === 2) {
              addText(parts[0], 10, true, false, false, '#000000'); // Entreprise EN GRAS à gauche
              addText(parts[1], 9, false, false, true, '#000000'); // Lieu à droite
            } else {
              addText(cleanLine, 10, true, false, false, '#000000'); // Entreprise EN GRAS
            }
            currentY += 1; // Plus d'espace
          }
        }
        // Postes (en gras) avec dates alignées à droite
        else if (currentSection && (currentSection.includes('EXPERIENCE') || currentSection.includes('PROJECTS')) &&
                 line.length > 5 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-')) {
          
          // Nettoyer les balises HTML
          const cleanLine = line.replace(/<[^>]*>/g, '');
          
          const jobKeywords = ['analyst', 'consultant', 'developer', 'manager', 'engineer', 'specialist', 'coordinator', 
                              'director', 'lead', 'senior', 'junior', 'intern', 'assistant', 'ceo', 'founder', 'owner'];
          if (jobKeywords.some(keyword => cleanLine.toLowerCase().includes(keyword))) {
            // Vérifier s'il y a une date sur la même ligne
            const parts = cleanLine.split(' • ');
            if (parts.length === 2) {
              addText(parts[0], 10, true, false, false, '#000000'); // Poste en gras à gauche
              addText(parts[1], 9, false, false, true, '#000000'); // Date à droite
            } else {
              addText(cleanLine, 10, true, false, false, '#000000'); // Poste en gras
            }
            currentY += 0.8; // Plus d'espace
          }
        }
        // Éducation et autres sections - formatage spécial
        else if (currentSection && (currentSection.includes('EDUCATION') || currentSection.includes('FORMATION')) &&
                 line.length > 3 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-')) {
          
          // Nettoyer les balises HTML
          const cleanLine = line.replace(/<[^>]*>/g, '');
          
          // Détecter les diplômes et formations à mettre en gras
          const educationKeywords = ['master', 'bachelor', 'degree', 'diploma', 'certificate', 'phd', 'doctorate', 
                                   'licence', 'maîtrise', 'bachelier', 'master', 'diplôme', 'certification'];
          
          const isEducation = educationKeywords.some(keyword => cleanLine.toLowerCase().includes(keyword));
          
          if (isEducation) {
            // Vérifier s'il y a une date sur la même ligne
            const parts = cleanLine.split(' • ');
            if (parts.length === 2) {
              addText(parts[0], 10, true, false, false, '#000000'); // Diplôme EN GRAS à gauche
              addText(parts[1], 9, false, false, true, '#000000'); // Date à droite
            } else {
              addText(cleanLine, 10, true, false, false, '#000000'); // Diplôme EN GRAS
            }
          } else {
            // Institution normale
            const parts = cleanLine.split(' • ');
            if (parts.length === 2) {
              addText(parts[0], 10, true, false, false, '#000000'); // Institution EN GRAS à gauche
              addText(parts[1], 9, false, false, true, '#000000'); // Date à droite
            } else {
              addText(cleanLine, 10, true, false, false, '#000000'); // Institution EN GRAS
            }
          }
          currentY += 1; // Plus d'espace
        }
        // Compétences et certifications - formatage simple
        else if (currentSection && (currentSection.includes('SKILLS') || currentSection.includes('COMPETENCES') || 
                 currentSection.includes('CERTIFICATIONS') || currentSection.includes('ACHIEVEMENTS')) &&
                 line.length > 0) {
          
          // Nettoyer les balises HTML
          const cleanLine = line.replace(/<[^>]*>/g, '');
          
          // Formatage spécial pour les sous-catégories
          if (cleanLine.includes(':') && !cleanLine.startsWith('•')) {
            addText(cleanLine, 10, true, false, false, '#000000'); // Sous-catégorie EN GRAS
          } else {
            addText(cleanLine, 9, false, false, false, '#000000'); // Contenu normal
          }
          currentY += 0.5; // Plus d'espace
        }
        // Puces et contenu - formatage indenté
        else if (line.startsWith('•') || line.startsWith('-')) {
          // Nettoyer les balises HTML et indenter les puces
          const cleanLine = line.replace(/<[^>]*>/g, '');
          const indentedLine = '    ' + cleanLine;
          addText(indentedLine, 9, false, false, false, '#000000'); // Puces indentées
          currentY += 2.5; // Demi-ligne d'espace entre les bullet points
        }
        // Texte normal
        else if (line.length > 0) {
          // Nettoyer les balises HTML
          const cleanLine = line.replace(/<[^>]*>/g, '');
          addText(cleanLine, 9, false, false, false, '#000000');
          currentY += 0.3; // Plus d'espace
        }
      });

      doc.save(filename);
    } catch (error) {
      console.error('Erreur fallback PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}