export class PDFGenerator {
  static async generateCVPDF(cvText: string, filename: string = 'optimized-cv.pdf'): Promise<void> {
    try {
      console.log('=== GÉNÉRATION PDF PROFESSIONNEL ===');
      console.log('Utilisation du backend Python pour un PDF de qualité...');
      
      // Utiliser le nouvel endpoint PDF du backend
      const formData = new FormData();
      formData.append('cv_text', cvText);

      console.log('🔍 CV envoyé au backend (premiers 200 caractères):', cvText.substring(0, 200));
      console.log('Envoi vers le backend Python pour génération PDF...');
      
      const response = await fetch('https://cvbien-backend-api-production.up.railway.app/generate-pdf', {
        method: 'POST',
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Erreur backend: ${response.status} ${response.statusText}`);
      }

      console.log('PDF reçu du backend Python');
      
      // Le backend retourne un PDF, on le télécharge directement
      const pdfBlob = await response.blob();
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      console.log('PDF téléchargé avec succès !');
      
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      
      // Fallback: utiliser jsPDF en cas d'erreur
      console.log('Fallback vers jsPDF...');
      await this.generateFallbackPDF(cvText, filename);
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

      // Fonction pour ajouter du texte avec formatage
      const addText = (text: string, fontSize: number = 10, isBold: boolean = false, isCenter: boolean = false, color: string = '#374151') => {
        if (currentY > pageHeight - 20) return;
        
        doc.setFontSize(fontSize);
        doc.setFont('helvetica', isBold ? 'bold' : 'normal');
        doc.setTextColor(color);
        
        const lines = doc.splitTextToSize(text, maxWidth);
        
        lines.forEach((line: string) => {
          if (currentY > pageHeight - 20) return;
          doc.text(line, isCenter ? pageWidth / 2 : margin, currentY, { align: isCenter ? 'center' : 'left' });
          currentY += fontSize * 0.4;
        });
      };

      // Parser et formater le CV
      const lines = cvText.split('\n').map(line => line.trim()).filter(line => line);
      
      let isHeader = true;
      let currentSection = '';

      lines.forEach((line, index) => {
        if (currentY > pageHeight - 30) return;

        // Header (nom, contact)
        if (isHeader && index < 5) {
          if (line.length > 3 && line.length < 50 && line === line.toUpperCase() && !line.includes('@')) {
            addText(line, 16, true, true, '#2563eb'); // Bleu pour le nom
            currentY += 3;
          } else if (line.includes('@') || line.includes('|')) {
            addText(line, 10, false, true, '#4b5563'); // Gris pour les contacts
            currentY += 2;
          } else if (line.length > 5 && !line.includes('PROFESSIONAL') && !line.includes('EXPERIENCE')) {
            addText(line, 12, true, true, '#1e40af'); // Bleu foncé pour le titre
            currentY += 2;
          }
        }
        
        // Détecter la fin du header
        if (isHeader && (line.includes('PROFESSIONAL SUMMARY') || line.includes('EXPERIENCE') || line.includes('FORMATION'))) {
          isHeader = false;
          currentY += 2;
        }
        
        // Sections principales
        if (line === 'PROFESSIONAL SUMMARY' || 
            line === 'EDUCATION' || 
            line === 'PROFESSIONAL EXPERIENCE' || 
            line === 'TECHNICAL SKILLS' || 
            line === 'CERTIFICATIONS & ACHIEVEMENTS' ||
            line === 'EXPERIENCE PROFESSIONNELLE' ||
            line === 'FORMATION' ||
            line === 'COMPETENCES' ||
            line === 'COMPÉTENCES') {
          
          currentY += 2;
          addText(line, 12, true, false, '#1e40af'); // Bleu foncé pour les titres de section
          currentY += 1;
          currentSection = line;
        }
        // Contenu des sections
        else if (currentSection && line.length > 0) {
          // Formatage spécial pour les puces
          if (line.startsWith('•') || line.startsWith('-')) {
            addText(line, 9, false, false, '#374151'); // Gris foncé pour les puces
          } else {
            addText(line, 9, false, false, '#374151'); // Gris foncé pour le texte normal
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