import { create } from 'zustand';
import { OpenAIService } from '../services/openaiService';
import { config } from '../config/environment';

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
    const { uploadedFile } = get();
    if (!uploadedFile) return;
    
    set({ isExtracting: true, progress: 0, progressMessage: 'Extraction du texte du CV...' });
    try {
      const text = await OpenAIService.extractTextFromPDF(uploadedFile);
      set({ cvText: text, isExtracting: false, progress: 100, progressMessage: 'Extraction terminée' });
      console.log('Texte extrait:', text);
    } catch (error) {
      console.error('Erreur lors de l\'extraction du texte:', error);
      set({ isExtracting: false, progress: 0, progressMessage: 'Erreur lors de l\'extraction' });
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

      console.log('Appel au backend pour génération CV...');
      
      // Appel au backend avec FormData (comme attendu par le backend)
      const formData = new FormData();
      
      // Créer un fichier blob avec le texte du CV
      const cvTextSafe = cvText || '';
      const jobDescriptionSafe = jobDescription || '';
      const cvBlob = new Blob([cvTextSafe], { type: 'text/plain' });
      formData.append('cv_file', cvBlob, 'cv.txt');
      formData.append('job_offer', jobDescriptionSafe);

      const response = await fetch(`${config.API_BASE_URL}/optimize-cv`, {
        method: 'POST',
        body: formData // Pas de Content-Type header avec FormData
      });

      if (!response.ok) {
        throw new Error(`Erreur backend: ${response.status}`);
      }

      const result = await response.json();
      
      console.log('Résultat reçu:', result);
      
      set({
        generatedCV: result.optimized_cv,
        atsScore: result.ats_score,
        improvements: result.improvements,
        isGenerating: false,
        progress: 100,
        progressMessage: 'CV généré avec succès !'
      });
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
