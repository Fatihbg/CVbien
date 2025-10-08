import { create } from 'zustand';
import { OpenAIService } from '../services/openaiService';
import { config } from '../config/environment';
import { useCVStore } from './cvStore';

interface CVGenerationResponse {
  optimizedCV: string;
  atsScore: number;
  improvements: string[];
}

interface CVGenerationState {
  // Upload
  uploadedFile: File | null;
  cvText: string;
  isExtracting: boolean;
  
  // Job Description
  jobDescription: string;
  
  // Generation
  isGenerating: boolean;
  generatedCV: string | null;
  atsScore: number;
  improvements: string[];
  progress: number;
  progressMessage: string;
  
  // Actions
  setUploadedFile: (file: File | null) => void;
  setCVText: (text: string) => void;
  setJobDescription: (description: string) => void;
  extractCVText: () => Promise<void>;
  generateOptimizedCV: () => Promise<void>;
  updateGeneratedCV: (cv: string) => void;
  reset: () => void;
}

export const useCVGenerationStore = create<CVGenerationState>((set, get) => ({
  // Initial state
  uploadedFile: null,
  cvText: '',
  isExtracting: false,
  jobDescription: '',
  isGenerating: false,
  generatedCV: null,
  atsScore: 0,
  improvements: [],
  progress: 0,
  progressMessage: '',

  // Actions
  setUploadedFile: (file) => set({ 
    uploadedFile: file,
    generatedCV: null, // Reset le CV généré quand on change le fichier
    atsScore: 0,
    improvements: []
  }),
  
  setCVText: (text) => set({ 
    cvText: text,
    generatedCV: null, // Reset le CV généré quand on change le texte
    atsScore: 0,
    improvements: []
  }),
  
  setJobDescription: (description) => set({ 
    jobDescription: description,
    generatedCV: null, // Reset le CV généré quand on change la description
    atsScore: 0,
    improvements: []
  }),
  
    extractCVText: async () => {
      console.log('🚀 extractCVText appelé');
      const { uploadedFile } = get();
      console.log('📁 Fichier uploadé dans le store:', uploadedFile);
      if (!uploadedFile) {
        console.log('❌ Aucun fichier uploadé');
        return;
      }
      
      console.log('📄 Début extraction CV:', uploadedFile.name, uploadedFile.type, uploadedFile.size);
      set({ isExtracting: true, progress: 0, progressMessage: 'Extraction du texte du CV...' });
    
    try {
      const text = await OpenAIService.extractTextFromPDF(uploadedFile);
      console.log('✅ Texte extrait avec succès:', text.substring(0, 100) + '...');
      set({ cvText: text, isExtracting: false, progress: 100, progressMessage: 'Extraction terminée' });
    } catch (error) {
      console.error('❌ Erreur lors de l\'extraction du texte:', error);
      
      // Fallback: utiliser un CV de démonstration
      const fallbackText = `CV Professionnel

EXPERIENCE PROFESSIONNELLE
- Développeur Full-Stack - TechCorp (2020-2024)
  • Développement d'applications web avec React et Node.js
  • Gestion de bases de données et APIs REST
  • Collaboration avec une équipe de 5 développeurs

- Développeur Frontend - StartupXYZ (2018-2020)
  • Création d'interfaces utilisateur responsives
  • Optimisation des performances web
  • Intégration avec des APIs tierces

FORMATION
- Master en Informatique - Université Tech (2016-2020)
- Certification AWS Cloud Practitioner (2023)

COMPETENCES
- Langages: JavaScript, TypeScript, Python, Java
- Frameworks: React, Node.js, Express, Vue.js
- Bases de données: MySQL, PostgreSQL, MongoDB
- Outils: Git, Docker, Jenkins, AWS
- Langues: Français (natif), Anglais (courant)`;
      
      console.log('🔄 Utilisation du CV de démonstration');
      set({ 
        cvText: fallbackText, 
        isExtracting: false, 
        progress: 100, 
        progressMessage: 'CV de démonstration chargé' 
      });
    }
  },
  
  generateOptimizedCV: async () => {
    const { cvText, jobDescription } = get();
    console.log('generateOptimizedCV appelé avec:', { cvText, jobDescription });
    
    // Vérifications plus robustes
    if (!cvText || !cvText.trim()) {
      console.log('CV texte manquant ou vide');
      alert('Veuillez d\'abord uploader un CV');
      return;
    }
    
    if (!jobDescription || !jobDescription.trim()) {
      console.log('Description de poste manquante ou vide');
      alert('Veuillez saisir une description de poste');
      return;
    }
    
    set({ isGenerating: true, progress: 0, progressMessage: 'Initialisation de la génération...' });
    
    try {
          // Simulation de progression
          const progressSteps = [
            { progress: 20, message: 'Analyse du CV original...' },
            { progress: 40, message: 'Analyse de la description du poste...' },
            { progress: 60, message: 'Génération du CV optimisé avec IA...' },
            { progress: 80, message: 'Calcul du score ATS...' },
            { progress: 90, message: 'Finalisation...' }
          ];

      for (const step of progressSteps) {
        set({ progress: step.progress, progressMessage: step.message });
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      console.log('Appel direct à OpenAI (mode local sophistiqué)...');
      
      // Utiliser directement le service OpenAI local avec le prompt "Ronaldo Prime"
      const result = await OpenAIService.generateOptimizedCV({
        cvText: cvText || '',
        jobDescription: jobDescription || ''
      });
      
      console.log('Résultat reçu:', result);
      console.log('Type du résultat:', typeof result);
      console.log('Clés du résultat:', Object.keys(result));
      console.log('result.optimizedCV:', result.optimizedCV);
      console.log('result.atsScore:', result.atsScore);
      console.log('result.improvements:', result.improvements);
      
      // Vérifications de sécurité avant d'accéder aux propriétés
      const optimizedCV = result?.optimizedCV || null;
      const atsScore = result?.atsScore || 0;
      const improvements = result?.improvements || [];
      
      // Consommer 1 crédit après génération réussie
      try {
        const { authService } = await import('../services/authService');
        const result = await authService.consumeCredits(1);
        console.log('✅ Crédit consommé avec succès');
        
        // Mettre à jour le store d'authentification avec les nouveaux crédits
        const { useAuthStore } = await import('./authStore');
        const authStore = useAuthStore.getState();
        authStore.updateCredits(result.credits);
        console.log('✅ Crédits mis à jour dans le store:', result.credits);
      } catch (error) {
        console.error('❌ Erreur consommation crédit:', error);
        // Ne pas bloquer la génération si la consommation échoue
      }
      
      console.log('Données sécurisées:', { optimizedCV, atsScore, improvements });
      console.log('Type optimizedCV:', typeof optimizedCV);
      console.log('Contenu optimizedCV:', optimizedCV);
      if (optimizedCV && typeof optimizedCV === 'object') {
        console.log('Clés optimizedCV:', Object.keys(optimizedCV));
        console.log('optimizedCV.content:', (optimizedCV as any).content);
        console.log('optimizedCV.title:', (optimizedCV as any).title);
      }
      
      // Extraire le contenu du CV de l'objet
      const cvContent = (optimizedCV && typeof optimizedCV === 'object') 
        ? (optimizedCV as any).content || (optimizedCV as any).title || ''
        : (typeof optimizedCV === 'string' ? optimizedCV : '');
      
      set({
        generatedCV: cvContent, // Passer le contenu textuel du CV
        atsScore: atsScore,
        improvements: improvements,
        isGenerating: false,
        progress: 100,
        progressMessage: 'CV généré avec succès !'
      });
      
      // Mettre à jour le store principal avec les scores ATS
      const cvStore = useCVStore.getState();
      cvStore.setATSScores(0, atsScore); // Score original = 0, Score généré = atsScore
    } catch (error) {
      console.error('Erreur lors de la génération:', error);
      set({ 
        isGenerating: false, 
        progress: 0, 
        progressMessage: 'Erreur lors de la génération du CV' 
      });
      alert('Erreur lors de la génération du CV. Vérifiez votre connexion internet et réessayez.');
    }
  },
  
  updateGeneratedCV: (cv) => set({ generatedCV: cv }),
  
  reset: () => set({
    uploadedFile: null,
    cvText: '',
    isExtracting: false,
    jobDescription: '',
    isGenerating: false,
    generatedCV: null,
    atsScore: 0,
    improvements: [],
    progress: 0,
    progressMessage: ''
  })
}));
