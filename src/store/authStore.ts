import { create } from 'zustand';
import type { User, LoginCredentials, RegisterCredentials, UserProfile, GeneratedCV } from '../types/user';
import { authService } from '../services/authService';

interface AuthState {
  // État d'authentification
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Profil utilisateur
  profile: UserProfile | null;
  generatedCVs: GeneratedCV[];
  
  // Actions d'authentification
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => Promise<void>;
  validateToken: () => Promise<void>;
  
  // Actions de profil
  loadProfile: () => Promise<void>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  
  // Actions de crédits
  buyCredits: (amount: number, paymentMethod: string) => Promise<void>;
  consumeCredits: (amount: number) => Promise<void>;
  updateCredits: (newCredits: number) => void;
  
  // Actions de CV
  loadGeneratedCVs: () => Promise<void>;
  saveGeneratedCV: (cvData: Omit<GeneratedCV, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  
  // Actions utilitaires
  clearError: () => void;
  setError: (error: string) => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  // État initial
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
  profile: null,
  generatedCVs: [],

  // Actions d'authentification
  login: async (credentials: LoginCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.login(credentials);
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      
      // Charger le profil après connexion
      await get().loadProfile();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur de connexion',
        isLoading: false 
      });
      throw error;
    }
  },

  register: async (credentials: RegisterCredentials) => {
    set({ isLoading: true, error: null });
    try {
      const user = await authService.register(credentials);
      set({ 
        user, 
        isAuthenticated: true, 
        isLoading: false,
        error: null 
      });
      
      // Charger le profil après inscription
      await get().loadProfile();
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur d\'inscription',
        isLoading: false 
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      await authService.logout();
      set({ 
        user: null, 
        isAuthenticated: false, 
        profile: null,
        generatedCVs: [],
        isLoading: false,
        error: null 
      });
    } catch (error) {
      console.error('Erreur de déconnexion:', error);
      // Forcer la déconnexion même en cas d'erreur
      set({ 
        user: null, 
        isAuthenticated: false, 
        profile: null,
        generatedCVs: [],
        isLoading: false,
        error: null 
      });
    }
  },

  validateToken: async () => {
    set({ isLoading: true });
    try {
      const isValid = await authService.validateToken();
      if (isValid) {
        const user = authService.getCurrentUser();
        set({ 
          user, 
          isAuthenticated: true, 
          isLoading: false 
        });
        // Charger le profil après validation
        await get().loadProfile();
      } else {
        set({ 
          user: null, 
          isAuthenticated: false, 
          isLoading: false 
        });
      }
    } catch (error) {
      console.error('Erreur validation token:', error);
      set({ 
        user: null, 
        isAuthenticated: false, 
        isLoading: false 
      });
    }
  },

  // Actions de profil
  loadProfile: async () => {
    try {
      const profile = await authService.getUserProfile();
      set({ profile });
    } catch (error) {
      console.error('Erreur chargement profil:', error);
    }
  },

  updateProfile: async (updates: Partial<UserProfile>) => {
    set({ isLoading: true, error: null });
    try {
      const updatedProfile = await authService.updateProfile(updates);
      set({ 
        profile: updatedProfile,
        user: get().user ? { ...get().user!, ...updatedProfile } : null,
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur mise à jour profil',
        isLoading: false 
      });
      throw error;
    }
  },

  // Actions de crédits
  buyCredits: async (amount: number, paymentMethod: string) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.buyCredits(amount, paymentMethod);
      set({ 
        user: { ...get().user, credits: result.credits },
        profile: { ...get().profile, credits: result.credits },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur achat crédits',
        isLoading: false 
      });
      throw error;
    }
  },

  consumeCredits: async (amount: number) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.consumeCredits(amount);
      set({ 
        user: { ...get().user, credits: result.credits },
        profile: { ...get().profile, credits: result.credits },
        isLoading: false 
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Erreur consommation crédits',
        isLoading: false 
      });
      throw error;
    }
  },

  updateCredits: (newCredits: number) => {
    set({ 
      user: { ...get().user, credits: newCredits },
      profile: { ...get().profile, credits: newCredits }
    });
  },

  // Actions de CV
  loadGeneratedCVs: async () => {
    try {
      const cvs = await authService.getGeneratedCVs();
      set({ generatedCVs: cvs });
    } catch (error) {
      console.error('Erreur chargement CVs:', error);
    }
  },

  saveGeneratedCV: async (cvData: Omit<GeneratedCV, 'id' | 'userId' | 'createdAt'>) => {
    try {
      const savedCV = await authService.saveGeneratedCV(cvData);
      set({ 
        generatedCVs: [savedCV, ...get().generatedCVs] 
      });
    } catch (error) {
      console.error('Erreur sauvegarde CV:', error);
      throw error;
    }
  },

  // Actions utilitaires
  clearError: () => set({ error: null }),
  setError: (error: string) => set({ error }),
  setLoading: (loading: boolean) => set({ isLoading: loading }),
}));