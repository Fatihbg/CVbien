import { config } from '../config/environment';

export class PDFGenerator {
  static async generateCVPDF(cvText: string, filename: string = 'optimized-cv.pdf'): Promise<void> {
    try {
      console.log('=== GÉNÉRATION PDF RONALDO PRIME ===');
      console.log('Utilisation du design Ronaldo Prime qui fonctionne...');
      
      // Utiliser directement le design Ronaldo Prime
      await this.generateRonaldoPrimePDF(cvText, filename);
      
    } catch (error) {
      console.error('Erreur génération Ronaldo Prime:', error);
      throw error;
    }
  }

  private static async generateRonaldoPrimePDF(cvText: string, filename: string): Promise<void> {
    try {
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configuration optimisée pour le design Ronaldo Prime
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 15;
      const maxWidth = pageWidth - (2 * margin);
      let currentY = margin;

      // Fonction pour ajouter du texte avec le style Ronaldo Prime
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

      // Parser amélioré pour capturer TOUT le contenu
      const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
      
      console.log('📄 Lignes du CV à traiter:', lines.length);
      console.log('📄 Premières lignes:', lines.slice(0, 10));
      
      let isHeader = true;
      let currentSection = '';
      let headerProcessed = 0;

      lines.forEach((line, index) => {
        if (currentY > pageHeight - 20) return;

        // Header (nom, contact, titre) - CENTRÉ - Limiter à 5 lignes max
        if (isHeader && headerProcessed < 5) {
          // Nom en majuscules - CENTRÉ et NOIR
          if (line.length > 3 && line.length < 50 && line === line.toUpperCase() && 
              !line.includes('@') && !line.includes('PROFESSIONAL') && !line.includes('EXPERIENCE') &&
              !line.includes('SUMMARY') && !line.includes('RÉSUMÉ')) {
            const cleanLine = line.replace(/<[^>]*>/g, '');
            addText(cleanLine, 18, true, true, '#000000'); // Nom centré en noir
            currentY += 3;
            headerProcessed++;
            console.log('✅ Nom détecté:', cleanLine);
          } 
          // Contact - CENTRÉ
          else if (line.includes('@') || line.includes('|') || line.includes('+') || line.includes('phone') || line.includes('tel')) {
            const cleanLine = line.replace(/<[^>]*>/g, '');
            addText(cleanLine, 10, false, true, '#000000'); // Contact centré
            currentY += 1;
            headerProcessed++;
            console.log('✅ Contact détecté:', cleanLine);
          } 
          // Titre de poste - CENTRÉ et GRAS
          else if (line.length > 5 && line.length < 80 && 
                   !line.includes('PROFESSIONAL') && !line.includes('EXPERIENCE') && 
                   !line.includes('FORMATION') && !line.includes('SKILLS') &&
                   !line.includes('SUMMARY') && !line.includes('RÉSUMÉ') &&
                   !line.includes('EDUCATION') && !line.includes('CERTIFICATIONS')) {
            const cleanLine = line.replace(/<[^>]*>/g, '');
            addText(cleanLine, 14, true, true, '#000000'); // Titre centré en gras
            currentY += 3;
            headerProcessed++;
            console.log('✅ Titre détecté:', cleanLine);
          }
        }
        
        // Détecter la fin du header - plus flexible
        if (isHeader && (line.includes('PROFESSIONAL SUMMARY') || line.includes('RÉSUMÉ PROFESSIONNEL') ||
                         line.includes('PROFESSIONAL EXPERIENCE') || line.includes('EXPÉRIENCE PROFESSIONNELLE') ||
                         line.includes('EDUCATION') || line.includes('FORMATION') ||
                         line.includes('SKILLS') || line.includes('COMPETENCES'))) {
          isHeader = false;
          currentY += 4;
          console.log('✅ Fin du header détectée avec:', line);
        }
        
        // Traiter le résumé professionnel (après le header, avant les sections)
        if (!isHeader && !currentSection && line.length > 20 && line.length < 300 && 
            !line.includes('PROFESSIONAL EXPERIENCE') && !line.includes('EXPÉRIENCE PROFESSIONNELLE') &&
            !line.includes('EDUCATION') && !line.includes('FORMATION') &&
            !line.includes('SKILLS') && !line.includes('COMPETENCES') &&
            !line.includes('CERTIFICATIONS') && !line.includes('ACHIEVEMENTS') &&
            !line.startsWith('•') && !line.startsWith('-') && !line.includes('---')) {
          
          // Nettoyer les balises HTML et les **
          const cleanLine = line.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
          
          // Vérifier si c'est une phrase de conclusion à ignorer
          if (!cleanLine.includes('enthousiaste') && !cleanLine.includes('contribuer au succès') && 
              !cleanLine.includes('solutions innovantes') && !cleanLine.includes('transformation digitale')) {
            addText(cleanLine, 10, false, false, '#000000'); // Résumé professionnel
            currentY += 2;
            console.log('✅ Résumé professionnel détecté:', cleanLine);
          }
        }
        
        // Sections principales - avec lignes horizontales NOIRES - Plus flexible
        const sectionKeywords = ['EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS', 'ACHIEVEMENTS', 
                                'FORMATION', 'COMPETENCES', 'PROJECTS', 'OTHER', 'SUMMARY', 'RÉSUMÉ'];
        
        const isSection = sectionKeywords.some(keyword => 
          line.toUpperCase().includes(keyword) && line.length < 50
        );
        
        // Éviter la duplication des titres de sections
        if (isSection && !isHeader && line !== currentSection) {
          currentY += 4;
          
          // Nettoyer les balises HTML et les **
          const cleanLine = line.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
          
          // Ignorer les lignes avec "---"
          if (!cleanLine.includes('---')) {
            addText(cleanLine, 12, true, false, '#000000'); // Sections en noir
            currentY += 3;
            
            // Ligne horizontale NOIRE SOUS le titre
            doc.setDrawColor(0, 0, 0); // Noir
            doc.setLineWidth(1.0);
            doc.line(margin, currentY - 1, pageWidth - margin, currentY - 1);
            
            currentSection = cleanLine;
            console.log('✅ Section détectée:', cleanLine);
          }
        }
        // Postes/titres dans les sections - EN GRAS - Plus flexible
        else if (currentSection && (currentSection.includes('EXPERIENCE') || currentSection.includes('PROJECTS')) &&
                 line.length > 5 && line.length < 100 && !line.startsWith('•') && !line.startsWith('-')) {
          // Vérifier si c'est un poste ou entreprise
          const jobKeywords = ['analyst', 'consultant', 'developer', 'manager', 'engineer', 'specialist', 'coordinator', 
                              'director', 'lead', 'senior', 'junior', 'intern', 'assistant', 'ceo', 'founder', 'owner',
                              'company', 'corporation', 'ltd', 'inc', 'srl', 'gmbh', 'sa'];
          const isJobOrCompany = jobKeywords.some(keyword => line.toLowerCase().includes(keyword));
          
          if (isJobOrCompany || line.includes(' - ') || line.includes(' | ') || line.includes(' • ')) {
            const cleanLine = line.replace(/<[^>]*>/g, '');
            addText(cleanLine, 11, true, false, '#000000'); // Postes/entreprises en gras
            currentY += 1;
            console.log('✅ Poste/Entreprise détecté:', cleanLine);
          } else {
            // Texte normal dans les sections
            const cleanLine = line.replace(/<[^>]*>/g, '');
            addText(cleanLine, 9, false, false, '#000000');
            console.log('✅ Contenu section:', cleanLine);
          }
        }
        // TOUT LE RESTE - capturer absolument tout
        else if (!isHeader && line.length > 0) {
          // Nettoyer les balises HTML et les **
          const cleanLine = line.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
          
          // Formatage spécial pour les puces
          if (cleanLine.startsWith('•') || cleanLine.startsWith('-') || cleanLine.startsWith('*')) {
            addText('    ' + cleanLine, 9, false, false, '#000000'); // Puces indentées
            console.log('✅ Puce détectée:', cleanLine);
          } else {
            addText(cleanLine, 9, false, false, '#000000'); // Texte normal
            console.log('✅ Texte normal:', cleanLine);
          }
        }
      });

      doc.save(filename);
      console.log('✅ PDF Ronaldo Prime généré avec succès');
    } catch (error) {
      console.error('Erreur génération Ronaldo Prime:', error);
      throw error;
    }
  }

  private static async generateHybridPDF(cvText: string, filename: string): Promise<void> {
    try {
      const { default: jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configuration optimisée pour remplir la page
      const pageWidth = 210;
      const pageHeight = 297;
      const margin = 10; // Marges très réduites
      const maxWidth = pageWidth - (2 * margin);
      let currentY = margin;

      // Fonction pour ajouter du texte avec le style de l'aperçu
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, isCenter: boolean = false, isRight: boolean = false, color: string = '#000000') => {
        if (currentY > pageHeight - 15) return;
        
        doc.setFontSize(fontSize);
        if (isBold) {
          doc.setFont('helvetica', 'bold');
        } else {
          doc.setFont('helvetica', 'normal');
        }
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 15) return;
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
          currentY += fontSize * 0.35; // Espacement très compact
        });
      };

      // Parser identique à l'aperçu pour le même rendu
      const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
      
      let isHeader = true;
      let currentSection = '';

      lines.forEach((line, index) => {
        if (currentY > pageHeight - 15) return;

        // Header (nom, contact, titre) - CENTRÉ comme l'aperçu
        if (isHeader && index < 8) {
          // Nom en majuscules - CENTRÉ
          if (line.length > 3 && line.length < 50 && line === line.toUpperCase() && 
              !line.includes('@') && !line.includes('PROFESSIONAL') && !line.includes('EXPERIENCE')) {
            addText(line, 16, true, true, false, '#1e3a8a'); // Nom centré en bleu
            currentY += 2;
          } 
          // Contact - CENTRÉ
          else if (line.includes('@') || line.includes('|') || line.includes('+')) {
            addText(line, 9, false, true, false, '#000000'); // Contact centré
            currentY += 1;
          } 
          // Titre de poste - CENTRÉ et plus grand
          else if (line.length > 5 && !line.includes('PROFESSIONAL') && !line.includes('EXPERIENCE') && 
                   !line.includes('FORMATION') && !line.includes('SKILLS')) {
            addText(line, 12, true, true, false, '#000000'); // Titre centré en gras
            currentY += 2;
          }
        }
        
        // Détecter la fin du header
        if (isHeader && (line.includes('PROFESSIONAL SUMMARY') || line.includes('EXPERIENCE') || line.includes('FORMATION'))) {
          isHeader = false;
          currentY += 3;
        }
        
        // Sections principales - avec lignes horizontales
        if (line === 'PROFESSIONAL EXPERIENCE' || 
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
          
          currentY += 3;
          // Ligne horizontale
          doc.setDrawColor(30, 58, 138); // Bleu sérieux
          doc.setLineWidth(0.5);
          doc.line(margin, currentY - 1, pageWidth - margin, currentY - 1);
          
          addText(line, 10, true, false, false, '#1e3a8a'); // Sections en bleu sérieux
          currentY += 2;
          currentSection = line;
        }
        // Postes/titres dans les sections - EN GRAS
        else if (currentSection && (currentSection.includes('EXPERIENCE') || currentSection.includes('PROJECTS')) &&
                 line.length > 5 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-')) {
          // Vérifier si c'est un poste
          const jobKeywords = ['analyst', 'consultant', 'developer', 'manager', 'engineer', 'specialist', 'coordinator', 
                              'director', 'lead', 'senior', 'junior', 'intern', 'assistant', 'ceo', 'founder', 'owner'];
          if (jobKeywords.some(keyword => line.toLowerCase().includes(keyword))) {
            addText(line, 10, true, false, false, '#000000'); // Postes en gras
            currentY += 0.5;
          }
        }
        // Contenu des sections
        else if (currentSection && line.length > 0) {
          // Formatage spécial pour les puces
          if (line.startsWith('•') || line.startsWith('-')) {
            addText('    ' + line, 8, false, false, false, '#000000'); // Puces indentées
          } else {
            addText(line, 8, false, false, false, '#000000'); // Texte normal
          }
        }
      });

      doc.save(filename);
      console.log('✅ PDF hybride généré avec succès');
    } catch (error) {
      console.error('Erreur génération hybride:', error);
      throw error;
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
        // FORCER LE GRAS avec setTextColor et setFont correctement
        if (isBold) {
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(0, 0, 0); // Noir pur pour le gras
        } else {
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(0, 0, 0); // Noir normal
        }
        
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
          
          // Ajouter une ligne en dessous du titre - FORCER LA VISIBILITÉ
          doc.setDrawColor(0, 0, 0); // Couleur noire
          doc.setLineWidth(1.0); // Ligne plus épaisse
          doc.line(margin, currentY + 3, pageWidth - margin, currentY + 3); // Position ajustée
          
          currentY += 5; // Espace d'une ligne après le titre
          currentSection = line;
        }
        // Entreprises (en gras) avec dates/lieux alignés à droite
        else if (currentSection && (currentSection.includes('EXPERIENCE') || currentSection.includes('PROJECTS')) &&
                 line.length > 3 && line.length < 80 && !line.startsWith('•') && !line.startsWith('-') &&
                 !line.includes('@') && !line.includes('|') && !line.includes('+')) {
          
          // Nettoyer les balises HTML et les **
          const cleanLine = line.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
          
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
          
          // Nettoyer les balises HTML et les **
          const cleanLine = line.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
          
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
          
          // Nettoyer les balises HTML et les **
          const cleanLine = line.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
          
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
          
          // Nettoyer les balises HTML et les **
          const cleanLine = line.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
          
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
          // Nettoyer les balises HTML et les **
          const cleanLine = line.replace(/<[^>]*>/g, '').replace(/\*\*/g, '');
          
          // Ignorer les phrases de conclusion à la fin du CV
          if (!cleanLine.includes('enthousiaste') && !cleanLine.includes('contribuer au succès') && 
              !cleanLine.includes('solutions innovantes') && !cleanLine.includes('transformation digitale') &&
              !cleanLine.includes('---')) {
            addText(cleanLine, 9, false, false, false, '#000000');
            currentY += 0.3; // Plus d'espace
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