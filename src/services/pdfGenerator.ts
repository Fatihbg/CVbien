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
  technicalSkills: string;
  softSkills: string;
  certifications: string[];
  additionalInfo: string;
}

export class PDFGenerator {
  // Fonction pour détecter la langue de l'offre d'emploi
  private static detectJobDescriptionLanguage(jobDescription: string): string {
    // Détection simple basée sur des mots-clés
    const frenchKeywords = ['recherche', 'poste', 'entreprise', 'expérience', 'compétences', 'mission', 'profil', 'candidat', 'équipe', 'développement'];
    const englishKeywords = ['looking for', 'position', 'company', 'experience', 'skills', 'mission', 'profile', 'candidate', 'team', 'development'];
    const dutchKeywords = ['zoeken', 'functie', 'bedrijf', 'ervaring', 'vaardigheden', 'missie', 'profiel', 'kandidaat', 'team', 'ontwikkeling'];
    
    const lowerJobDesc = jobDescription.toLowerCase();
    
    const frenchCount = frenchKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
    const englishCount = englishKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
    const dutchCount = dutchKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
    
    if (dutchCount > frenchCount && dutchCount > englishCount) {
      return 'dutch';
    } else if (englishCount > frenchCount && englishCount > dutchCount) {
      return 'english';
    } else {
      return 'french'; // Par défaut français
    }
  }

  // Utiliser l'IA pour parser le CV
  private static async parseCVWithAI(cvText: string, jobDescription: string = ''): Promise<CVParsedData> {
    try {
      console.log('🤖 Utilisation de l\'IA pour parser le CV...');
      
      // Détecter la langue de l'offre d'emploi
      const jobLanguage = this.detectJobDescriptionLanguage(jobDescription);
      console.log('🌍 Langue détectée pour le PDF:', jobLanguage);
      
      const response = await fetch(`${config.API_BASE_URL}/parse-cv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cv_text: cvText,
          job_description: jobDescription,
          target_language: jobLanguage // Langue de l'offre d'emploi
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

  // Fallback: parsing manuel amélioré
  private static parseCVManually(cvText: string): CVParsedData {
    console.log('🔍 Parsing manuel du CV...');
    const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
    
    // Trouver le nom (première ligne en majuscules)
    const name = lines.find(line => line.length > 3 && line.length < 50 && line === line.toUpperCase()) || 'Nom Prénom';
    
    // Trouver le contact (ligne avec @ ou téléphone)
    const contact = lines.find(line => line.includes('@') || line.match(/[\+]?[0-9\s\-\(\)]{10,}/)) || 'Contact';
    
    // Trouver le titre (ligne après le contact)
    const contactIndex = lines.findIndex(line => line.includes('@') || line.match(/[\+]?[0-9\s\-\(\)]{10,}/));
    const title = contactIndex >= 0 && contactIndex + 1 < lines.length ? lines[contactIndex + 1] : 'Titre Professionnel';
    
    // Trouver le résumé (paragraphe long avant les sections)
    const summary = lines.find(line => line.length > 50 && line.length < 300 && 
      !line.includes('EXPERIENCE') && !line.includes('FORMATION') && 
      !line.includes('SKILLS') && !line.includes('CERTIFICATIONS')) || 'Résumé professionnel';
    
    // Parser les expériences
    const experience: Array<{company: string; position: string; period: string; description: string[]}> = [];
    const education: Array<{institution: string; degree: string; period: string; description: string}> = [];
    
    let currentSection = '';
    let currentExperience: any = null;
    let currentEducation: any = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      
      if (line.includes('EXPERIENCE') || line.includes('EXPÉRIENCE')) {
        currentSection = 'experience';
        continue;
      }
      if (line.includes('EDUCATION') || line.includes('FORMATION')) {
        currentSection = 'education';
        continue;
      }
      
      // Parser les expériences (format: Company - Position (Period))
      if (currentSection === 'experience' && line.includes('-') && line.includes('(') && line.includes(')')) {
        if (currentExperience) {
          experience.push(currentExperience);
        }
        const parts = line.split(' - ');
        if (parts.length >= 2) {
          const company = parts[0];
          const positionPeriod = parts[1];
          const periodMatch = positionPeriod.match(/\(([^)]+)\)/);
          const period = periodMatch ? periodMatch[1] : '';
          const position = positionPeriod.replace(/\([^)]+\)/, '').trim();
          
          currentExperience = {
            company,
            position,
            period,
            description: []
          };
        }
      } else if (currentSection === 'experience' && currentExperience && line.startsWith('•')) {
        currentExperience.description.push(line.replace('•', '').trim());
      }
      
      // Parser les formations (format: Institution - Degree (Period))
      if (currentSection === 'education' && line.includes('-') && line.includes('(') && line.includes(')')) {
        if (currentEducation) {
          education.push(currentEducation);
        }
        const parts = line.split(' - ');
        if (parts.length >= 2) {
          const institution = parts[0];
          const degreePeriod = parts[1];
          const periodMatch = degreePeriod.match(/\(([^)]+)\)/);
          const period = periodMatch ? periodMatch[1] : '';
          const degree = degreePeriod.replace(/\([^)]+\)/, '').trim();
          
          currentEducation = {
            institution,
            degree,
            period,
            description: ''
          };
        }
      } else if (currentSection === 'education' && currentEducation && line.startsWith('•')) {
        currentEducation.description = line.replace('•', '').trim();
      }
    }
    
    if (currentExperience) experience.push(currentExperience);
    if (currentEducation) education.push(currentEducation);
    
    // Parser les compétences techniques
    let technicalSkills = '';
    const skillsMatch = cvText.match(/Compétences techniques\s*:?\s*([^•\n]+)/i);
    if (skillsMatch) {
      technicalSkills = skillsMatch[1].trim();
    }
    
    // Parser les soft skills
    let softSkills = '';
    const softMatch = cvText.match(/Soft skills\s*:?\s*([^•\n]+)/i);
    if (softMatch) {
      softSkills = softMatch[1].trim();
    }
    
    // Parser les certifications - amélioré pour détecter différentes variantes
    let certifications: string[] = [];
    
    // Chercher différentes variantes de section certifications
    const certPatterns = [
      /Certifications?\s*:?\s*([^•\n]+)/i,
      /Certificats?\s*:?\s*([^•\n]+)/i,
      /Certificat\s*:?\s*([^•\n]+)/i,
      /Qualifications?\s*:?\s*([^•\n]+)/i,
      /Formations?\s*certifiantes?\s*:?\s*([^•\n]+)/i
    ];
    
    for (const pattern of certPatterns) {
      const certMatch = cvText.match(pattern);
      if (certMatch && certMatch[1].trim()) {
        const certText = certMatch[1].trim();
        // Diviser par virgules, points-virgules, ou retours à la ligne
        certifications = certText.split(/[,;]/).map(c => c.trim()).filter(c => c && c.length > 2);
        break;
      }
    }
    
    console.log('📊 Données parsées:', {
      experiences: experience.length,
      educations: education.length,
      technicalSkills: technicalSkills.length,
      softSkills: softSkills.length,
      certifications: certifications.length,
      certText: certifications.join(', ')
    });
    
    return {
      name,
      contact,
      title,
      summary,
      experience,
      education,
      technicalSkills,
      softSkills,
      certifications,
      additionalInfo: ''
    };
  }

  static async generateCVPDF(cvText: string, jobDescription: string = '', filename?: string): Promise<void> {
    try {
      console.log('=== GÉNÉRATION PDF AVEC IA ===');
      console.log('CV Text length:', cvText.length);
      console.log('Job Description length:', jobDescription.length);
      
      // Parser le CV avec l'IA en incluant la description du job
      const parsedCV = await this.parseCVWithAI(cvText, jobDescription);
      
      // Générer un nom de fichier dynamique si non fourni
      let finalFilename = filename;
      if (!finalFilename) {
        const name = parsedCV.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        
        // Utiliser localStorage pour compter les téléchargements
        const storageKey = `cv-download-count-${name}`;
        const currentCount = parseInt(localStorage.getItem(storageKey) || '0') + 1;
        localStorage.setItem(storageKey, currentCount.toString());
        
        finalFilename = `${name}-cv-${currentCount}.pdf`;
      }
      
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
          doc.setFont('calibri', 'bold');
        } else {
          doc.setFont('calibri', 'normal');
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
        currentY = titleY + 7; // Encore plus d'espace après la ligne pour séparer du contenu
      };

      // Fonction pour détecter la langue de l'offre d'emploi (copiée localement)
      const detectJobDescriptionLanguage = (jobDesc: string): string => {
        const frenchKeywords = ['recherche', 'poste', 'entreprise', 'expérience', 'compétences', 'mission', 'profil', 'candidat', 'équipe', 'développement'];
        const englishKeywords = ['looking for', 'position', 'company', 'experience', 'skills', 'mission', 'profile', 'candidate', 'team', 'development'];
        const dutchKeywords = ['zoeken', 'functie', 'bedrijf', 'ervaring', 'vaardigheden', 'missie', 'profiel', 'kandidaat', 'team', 'ontwikkeling'];
        
        const lowerJobDesc = jobDesc.toLowerCase();
        
        const frenchCount = frenchKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
        const englishCount = englishKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
        const dutchCount = dutchKeywords.filter(keyword => lowerJobDesc.includes(keyword)).length;
        
        if (dutchCount > frenchCount && dutchCount > englishCount) {
          return 'dutch';
        } else if (englishCount > frenchCount && englishCount > dutchCount) {
          return 'english';
        } else {
          return 'french'; // Par défaut français
        }
      };

      // Fonction pour traduire les titres selon la langue
      const translateSectionTitle = (title: string): string => {
        const translations = {
          'EXPÉRIENCE PROFESSIONNELLE': {
            'french': 'EXPÉRIENCE PROFESSIONNELLE',
            'english': 'PROFESSIONAL EXPERIENCE',
            'dutch': 'WERKERVARING'
          },
          'FORMATION': {
            'french': 'FORMATION',
            'english': 'EDUCATION',
            'dutch': 'OPLEIDING'
          },
          'COMPÉTENCES TECHNIQUES': {
            'french': 'COMPÉTENCES TECHNIQUES',
            'english': 'TECHNICAL SKILLS',
            'dutch': 'TECHNISCHE VAARDIGHEDEN'
          },
          'CERTIFICATIONS': {
            'french': 'CERTIFICATIONS',
            'english': 'CERTIFICATIONS',
            'dutch': 'CERTIFICERINGEN'
          }
        };
        
        // Extraire la vraie description textuelle du jobDescription
        const jobDescText = typeof jobDescription === 'string' 
          ? jobDescription 
          : ((jobDescription as any)?.description || (jobDescription as any)?.title || '');
        
        console.log('🔍 PDF Language Debug - Raw jobDescription:', jobDescription);
        console.log('🔍 PDF Language Debug - Extracted text:', jobDescText);
        
        const detectedLanguage = detectJobDescriptionLanguage(jobDescText);
        console.log('🔍 PDF Language Detection:', {
          jobDescText: jobDescText.substring(0, 100) + '...',
          detectedLanguage,
          title,
          translatedTitle: translations[title]?.[detectedLanguage]
        });
        
        return translations[title]?.[detectedLanguage] || title;
      };

      // === GÉNÉRATION PDF AVEC DONNÉES STRUCTURÉES ===
      
      // 1. HEADER - Nom, Contact, Titre
      addText(parsedCV.name, 17.5, true, true, '#000000'); // 17 -> 17.5 (+0.5pt)
      currentY += 3;
      
      addText(parsedCV.contact, 9.5, false, true, '#000000'); // 9 -> 9.5 (+0.5pt)
      currentY += 2; // Augmenté de 1 à 2 pour plus d'espace
      
      addText(parsedCV.title, 13.5, true, true, '#000000'); // 13 -> 13.5 (+0.5pt)
      currentY += 4;
      
      // 2. RÉSUMÉ PROFESSIONNEL
      if (parsedCV.summary && parsedCV.summary.trim()) {
        addText(parsedCV.summary, 9.5, false, false, '#000000'); // 9 -> 9.5 (+0.5pt)
        currentY += 3;
      }
      
      // 3. EXPÉRIENCE PROFESSIONNELLE
      if (parsedCV.experience && parsedCV.experience.length > 0) {
        currentY += 4;
        const titleY = currentY;
        addText(translateSectionTitle('EXPÉRIENCE PROFESSIONNELLE'), 11.5, true, false, '#000000'); // 11 -> 11.5 (+0.5pt)
        addHorizontalLine(titleY);
        
        parsedCV.experience.forEach(exp => {
          // Entreprise et poste sur une ligne
          const companyPosition = `${exp.company} - ${exp.position} (${exp.period})`;
          addText(companyPosition, 10.5, true, false, '#000000'); // 10 -> 10.5 (+0.5pt)
          currentY += 1;
          
          // Descriptions avec bullet points
          exp.description.forEach(desc => {
            addText(`• ${desc}`, 9.5, false, false, '#000000'); // 9 -> 9.5 (+0.5pt)
            currentY += 2.5;
          });
          currentY += 1;
        });
      }
      
      // 4. FORMATION
      if (parsedCV.education && parsedCV.education.length > 0) {
        currentY += 4;
        const titleY = currentY;
        addText(translateSectionTitle('FORMATION'), 11.5, true, false, '#000000'); // 11 -> 11.5 (+0.5pt)
        addHorizontalLine(titleY);
        
        parsedCV.education.forEach(edu => {
          // Institution et diplôme sur une ligne
          const institutionDegree = `${edu.institution} - ${edu.degree} (${edu.period})`;
          addText(institutionDegree, 10.5, true, false, '#000000'); // 10 -> 10.5 (+0.5pt)
          currentY += 1;
          
          // Description
          if (edu.description) {
            addText(`• ${edu.description}`, 9.5, false, false, '#000000'); // 9 -> 9.5 (+0.5pt)
            currentY += 2.5;
          }
          currentY += 1;
        });
      }
      
      // 5. CERTIFICATIONS (déplacées vers informations additionnelles)
      
      // 6. INFORMATIONS ADDITIONNELLES
      if (parsedCV.technicalSkills || parsedCV.softSkills || parsedCV.additionalInfo || parsedCV.certifications.length > 0) {
        currentY += 4;
        const titleY = currentY;
        addText('INFORMATIONS ADDITIONNELLES', 11.5, true, false, '#000000'); // 11 -> 11.5 (+0.5pt)
        addHorizontalLine(titleY);
        
        if (parsedCV.technicalSkills) {
          addText(`• Compétences techniques : ${parsedCV.technicalSkills}`, 9.5, false, false, '#000000'); // 9 -> 9.5 (+0.5pt)
          currentY += 2.5;
        }
        
        if (parsedCV.softSkills) {
          addText(`• Soft skills : ${parsedCV.softSkills}`, 9.5, false, false, '#000000'); // 9 -> 9.5 (+0.5pt)
          currentY += 2.5;
        }
        
        if (parsedCV.certifications && parsedCV.certifications.length > 0) {
          addText(`• Certifications : ${parsedCV.certifications.join(', ')}`, 9.5, false, false, '#000000'); // 9 -> 9.5 (+0.5pt)
          currentY += 2.5;
        }
        
        if (parsedCV.additionalInfo) {
          // Séparer les langues du reste des informations additionnelles
          const infoParts = parsedCV.additionalInfo.split(',');
          const languages = infoParts.filter(part => 
            part.toLowerCase().includes('français') || 
            part.toLowerCase().includes('anglais') || 
            part.toLowerCase().includes('espagnol') || 
            part.toLowerCase().includes('allemand') || 
            part.toLowerCase().includes('italien') || 
            part.toLowerCase().includes('néerlandais') || 
            part.toLowerCase().includes('turc') ||
            part.toLowerCase().includes('bilingue') ||
            part.toLowerCase().includes('c1') ||
            part.toLowerCase().includes('c2') ||
            part.toLowerCase().includes('b1') ||
            part.toLowerCase().includes('b2')
          );
          const otherInfo = infoParts.filter(part => !languages.includes(part));
          
          // Afficher les autres informations d'abord
          if (otherInfo.length > 0) {
            addText(`• ${otherInfo.join(', ')}`, 9.5, false, false, '#000000'); // 9 -> 9.5 (+0.5pt)
            currentY += 2.5;
          }
          
          // Afficher les langues en gras en dernier (sans ** et sans duplication "langues")
          if (languages.length > 0) {
            const cleanLanguages = languages.map(lang => 
              lang.replace(/\*\*/g, '').replace(/langues?\s*:?\s*/gi, '').trim()
            ).join(', ');
            addText(`• Langues : ${cleanLanguages}`, 9.5, true, false, '#000000'); // 9 -> 9.5 (+0.5pt)
            currentY += 2.5;
          }
        }
      }

      doc.save(finalFilename);
      console.log('✅ PDF généré avec succès:', finalFilename);
      
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}