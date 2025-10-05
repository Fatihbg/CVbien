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

      // Configuration optimisée pour le design Mimi Prime (version finale)
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

      for (let index = 0; index < lines.length; index++) {
        const line = lines[index];
        if (currentY > pageHeight - 20) break;

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
            currentY += 4; // Plus d'espace pour équilibrer avec le résumé
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
        
        // Traiter le résumé professionnel (sans afficher le titre)
        if (line.includes('PROFESSIONAL SUMMARY') || line.includes('RÉSUMÉ PROFESSIONNEL')) {
          console.log('✅ Résumé professionnel détecté (titre ignoré)');
          // Lire le contenu du résumé sans afficher le titre
          let summaryContent = '';
          let j = index + 1;
          while (j < lines.length && lines[j].trim() && 
                 !lines[j].includes('PROFESSIONAL EXPERIENCE') && !lines[j].includes('EXPÉRIENCE PROFESSIONNELLE') &&
                 !lines[j].includes('EDUCATION') && !lines[j].includes('FORMATION') &&
                 !lines[j].includes('TECHNICAL SKILLS') && !lines[j].includes('COMPÉTENCES') &&
                 !lines[j].includes('COMPETENCES')) {
            summaryContent += lines[j].trim() + ' ';
            j++;
          }
          if (summaryContent.trim()) {
            const cleanSummary = summaryContent.replace(/<[^>]*>/g, '').trim();
            addText(cleanSummary, 10, false, false, '#000000'); // Résumé sans titre (+1pt)
            currentY += 4;
            console.log('✅ Résumé ajouté:', cleanSummary.substring(0, 100) + '...');
          }
          // Ignorer les lignes du résumé dans la boucle principale
          index = j - 1; // Ajuster l'index pour sauter les lignes du résumé
          continue;
        }
        
        // Sections principales - avec lignes horizontales BLEUES - Plus flexible
        const sectionKeywords = ['EXPERIENCE', 'EDUCATION', 'SKILLS', 'CERTIFICATIONS', 'ACHIEVEMENTS', 
                                'FORMATION', 'COMPETENCES', 'PROJECTS', 'OTHER', 'SUMMARY', 'RÉSUMÉ'];
        
        const isSection = sectionKeywords.some(keyword => 
          line.toUpperCase().includes(keyword) && line.length < 50
        );
        
        if (isSection && !isHeader) {
          currentY += 6; // Plus d'espace avant les sections
          
          // Nettoyer les balises HTML
          const cleanLine = line.replace(/<[^>]*>/g, '');
          
          // Calculer la position exacte du texte
          const textY = currentY;
          addText(cleanLine, 12, true, false, '#000000'); // Sections en noir
          
          // Ligne horizontale NOIRE DIRECTEMENT SOUS le titre (plus fine et plus proche)
          doc.setDrawColor(0, 0, 0); // Noir
          doc.setLineWidth(0.5); // Plus fine
          const lineY = textY + 3; // Plus proche du texte
          doc.line(margin, lineY, pageWidth - margin, lineY);
          
          currentY = lineY + 4; // Espace après la ligne
          currentSection = cleanLine;
          console.log('✅ Section détectée:', cleanLine);
        }
        // Formatage hiérarchique pour les sections principales
        else if (currentSection && (currentSection.includes('EXPERIENCE') || currentSection.includes('PROJECTS') || currentSection.includes('EDUCATION') || currentSection.includes('FORMATION')) &&
                 line.length > 5 && line.length < 100) {
          
          const cleanLine = line.replace(/<[^>]*>/g, '');
          
          // Garder les tirets, supprimer seulement les ronds et étoiles
          let processedLine = cleanLine;
          if (cleanLine.startsWith('•') || cleanLine.startsWith('*')) {
            processedLine = cleanLine.substring(1).trim();
          }
          
          // Détecter si c'est le début d'une nouvelle expérience/éducation
          const experienceKeywords = ['analyst', 'consultant', 'developer', 'manager', 'engineer', 'specialist', 'coordinator', 
                                     'director', 'lead', 'senior', 'junior', 'intern', 'assistant', 'ceo', 'founder', 'owner',
                                     'master', 'bachelor', 'degree', 'diploma', 'certificate', 'phd', 'doctorate',
                                     'licence', 'maîtrise', 'bachelier', 'diplôme', 'certification'];
          
          const hasDate = /\d{4}/.test(processedLine) || processedLine.includes(' - ') || processedLine.includes(' | ') || processedLine.includes(' • ');
          const isNewEntry = experienceKeywords.some(keyword => processedLine.toLowerCase().includes(keyword)) || hasDate;
          
          if (isNewEntry) {
            currentY += 3; // Espace avant chaque nouvelle expérience/éducation
            
            // Séparer le début (en gras) du reste (normal)
            let boldPart = '';
            let normalPart = '';
            
            if (processedLine.includes(' - ')) {
              const parts = processedLine.split(' - ');
              boldPart = parts[0].trim();
              normalPart = ' - ' + parts.slice(1).join(' - ');
            } else if (processedLine.includes(' | ')) {
              const parts = processedLine.split(' | ');
              boldPart = parts[0].trim();
              normalPart = ' | ' + parts.slice(1).join(' | ');
            } else {
              // Si pas de séparateur, prendre les premiers mots comme gras
              const words = processedLine.split(' ');
              if (words.length >= 3) {
                boldPart = words.slice(0, 3).join(' ');
                normalPart = ' ' + words.slice(3).join(' ');
              } else {
                boldPart = processedLine;
              }
            }
            
            // Afficher le début en gras
            doc.setFontSize(11);
            doc.setFont('helvetica', 'bold');
            doc.setTextColor(0, 0, 0);
            doc.text(boldPart, margin, currentY);
            
            // Afficher le reste en normal
            if (normalPart) {
              const boldWidth = doc.getTextWidth(boldPart);
              doc.setFont('helvetica', 'normal');
              doc.text(normalPart, margin + boldWidth, currentY);
            }
            
            currentY += 2; // Espace après le titre
            console.log('✅ Nouvelle expérience/éducation:', boldPart + normalPart);
          } else {
            // Description avec tiret si nécessaire
            if (processedLine.length > 0) {
              let displayLine = processedLine;
              // Ajouter un tiret si ce n'est pas déjà un tiret
              if (!processedLine.startsWith('-')) {
                displayLine = '- ' + processedLine;
              }
              addText('    ' + displayLine, 10, false, false, '#000000'); // +1pt et tiret
              currentY += 1.5; // Espace entre les descriptions
              console.log('✅ Description avec tiret:', displayLine);
            }
          }
        }
        // TOUT LE RESTE - capturer avec suppression des ronds/étoiles seulement
        else if (!isHeader && line.length > 0) {
          // Nettoyer les balises HTML et supprimer seulement les ronds/étoiles
          let cleanLine = line.replace(/<[^>]*>/g, '');
          
          // Supprimer seulement les ronds et étoiles, garder les tirets
          if (cleanLine.startsWith('•') || cleanLine.startsWith('*')) {
            cleanLine = cleanLine.substring(1).trim();
          }
          
          if (cleanLine.length > 0) {
            // Traduire "intérêt pour..." selon la langue du CV
            let translatedLine = cleanLine;
            if (cleanLine.toLowerCase().includes('intérêt pour') || cleanLine.toLowerCase().includes('intérêt')) {
              // Détecter si le CV est en anglais
              const isEnglish = cvText.toLowerCase().includes('professional experience') || 
                               cvText.toLowerCase().includes('education') || 
                               cvText.toLowerCase().includes('technical skills');
              
              if (isEnglish) {
                translatedLine = cleanLine.replace(/intérêt pour/gi, 'interest in');
                translatedLine = translatedLine.replace(/intérêt/gi, 'interest');
              }
            }
            
            // Si c'est dans une section, indenter, sinon texte normal
            if (currentSection) {
              addText('    ' + translatedLine, 10, false, false, '#000000'); // +1pt et indenté dans les sections
              currentY += 1.5;
            } else {
              addText(translatedLine, 10, false, false, '#000000'); // +1pt et texte normal
              currentY += 0.5;
            }
            console.log('✅ Texte nettoyé et traduit:', translatedLine);
          }
        }
      }

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