import { create } from 'zustand';

export interface CVData {
  personalInfo: {
    name: string;
    email: string;
    phone: string;
    location: string;
    linkedin?: string;
    website?: string;
  };
  summary: string;
  experience: Array<{
    title: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
  }>;
  education: Array<{
    degree: string;
    school: string;
    location: string;
    graduationDate: string;
    gpa?: string;
  }>;
  skills: string[];
  certifications?: Array<{
    name: string;
    issuer: string;
    date: string;
  }>;
}

export interface JobDescription {
  title: string;
  company: string;
  description: string;
  requirements: string[];
  location: string;
}

interface CVState {
  originalCV: CVData | null;
  jobDescription: JobDescription | null;
  generatedCV: CVData | null;
  originalATSScore: number | null;
  generatedATSScore: number | null;
  isGenerating: boolean;
  setOriginalCV: (cv: CVData) => void;
  setJobDescription: (job: JobDescription) => void;
  setGeneratedCV: (cv: CVData) => void;
  setATSScores: (original: number, generated: number) => void;
  setGenerating: (generating: boolean) => void;
  reset: () => void;
}

export const useCVStore = create<CVState>((set) => ({
  originalCV: null,
  jobDescription: null,
  generatedCV: null,
  originalATSScore: null,
  generatedATSScore: null,
  isGenerating: false,
  setOriginalCV: (cv: CVData) => set({ originalCV: cv }),
  setJobDescription: (job: JobDescription) => set({ jobDescription: job }),
  setGeneratedCV: (cv: CVData) => set({ generatedCV: cv }),
  setATSScores: (original: number, generated: number) => 
    set({ originalATSScore: original, generatedATSScore: generated }),
  setGenerating: (generating: boolean) => set({ isGenerating: generating }),
  reset: () => set({
    originalCV: null,
    jobDescription: null,
    generatedCV: null,
    originalATSScore: null,
    generatedATSScore: null,
    isGenerating: false,
  }),
}));
